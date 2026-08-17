import 'dotenv/config';

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

import { enrichSerraDoppiaMap } from './lib/serra-doppia-audit.mjs';

const PROCESS_ITEM_ID = '08591b8f-391f-4b7b-bb19-7d918eee43ec';
const EXPECTED_NODE_COUNT = 48;
const EXPECTED_EDGE_COUNT = 47;

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(scriptDir, '..');
const canonicalPath = resolve(projectDir, 'imports', 'mapa-operacao-corte-acabados-serra-doppia.json');
const backupDir = resolve(projectDir, 'backups', 'serra-doppia');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: current, error: loadError } = await supabase
  .from('process_items')
  .select('id,title,description,type,tags,visibility,allowed_departments,allowed_user_ids,created_by,created_at,workflow_status,nodes,edges,node_details')
  .eq('id', PROCESS_ITEM_ID)
  .single();

if (loadError) throw loadError;
if (!current) throw new Error('Mapa Serra Doppia não encontrado no banco.');

const nodes = Array.isArray(current.nodes) ? current.nodes : [];
const edges = Array.isArray(current.edges) ? current.edges : [];
if (nodes.length !== EXPECTED_NODE_COUNT || edges.length !== EXPECTED_EDGE_COUNT) {
  throw new Error(`Estrutura inesperada: ${nodes.length} nós e ${edges.length} conexões. Nenhuma alteração foi feita.`);
}

const currentMap = {
  ...current,
  nodes,
  edges,
  node_details: current.node_details && typeof current.node_details === 'object' ? current.node_details : {},
};
const enrichedMap = enrichSerraDoppiaMap(currentMap);

if (enrichedMap.nodes !== currentMap.nodes || enrichedMap.edges !== currentMap.edges) {
  throw new Error('A auditoria tentou substituir a estrutura visual. Nenhuma alteração foi feita.');
}
if (Object.keys(enrichedMap.node_details).length !== EXPECTED_NODE_COUNT) {
  throw new Error('A auditoria não produziu detalhes para todos os nós. Nenhuma alteração foi feita.');
}

await mkdir(backupDir, { recursive: true });
const timestamp = new Date().toISOString().replaceAll(':', '-');
await writeFile(resolve(backupDir, `${timestamp}.json`), `${JSON.stringify(currentMap, null, 2)}\n`, 'utf8');
await writeFile(canonicalPath, `${JSON.stringify(enrichedMap, null, 2)}\n`, 'utf8');

const { data: updated, error: updateError } = await supabase
  .from('process_items')
  .update({ node_details: enrichedMap.node_details })
  .eq('id', PROCESS_ITEM_ID)
  .select('id,nodes,edges,node_details')
  .single();

if (updateError) throw updateError;

const updatedNodes = Array.isArray(updated?.nodes) ? updated.nodes : [];
const updatedEdges = Array.isArray(updated?.edges) ? updated.edges : [];
const updatedDetails = updated?.node_details && typeof updated.node_details === 'object' ? updated.node_details : {};

if (
  updatedNodes.length !== EXPECTED_NODE_COUNT
  || updatedEdges.length !== EXPECTED_EDGE_COUNT
  || Object.keys(updatedDetails).length !== EXPECTED_NODE_COUNT
) {
  throw new Error('A verificação após a gravação encontrou contagens inesperadas.');
}

const completedBranches = Object.values(updatedDetails).filter((details) => (
  details?.ifOK?.result
  && details?.ifOK?.action
  && details?.ifOK?.nextStep
  && details?.ifNOK?.result
  && details?.ifNOK?.action
  && details?.ifNOK?.nextStep
)).length;

console.log(JSON.stringify({
  processItemId: updated.id,
  nodes: updatedNodes.length,
  edges: updatedEdges.length,
  details: Object.keys(updatedDetails).length,
  completedBranches,
  canonicalPath,
}, null, 2));
