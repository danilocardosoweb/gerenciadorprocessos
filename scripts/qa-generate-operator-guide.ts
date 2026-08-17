import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { generateOperatorGuideDocument } from '../src/lib/wordOperatorGuide';

const input = resolve('imports/mapa-serra-doppia-2-cabecas-revisado-importar.json');
const output = resolve('artifacts/qa/guia-visual-serra-doppia.docx');
const map = JSON.parse(await readFile(input, 'utf8'));

const blob = await generateOperatorGuideDocument({
  mapTitle: map.title,
  documentCode: 'POP-PRO-OPE-COR-E-001',
  revision: 'Rev. 00',
  sector: 'Corte e Acabados',
  equipment: 'Serra Doppia 2 Cabeças',
  preparedBy: 'Danilo',
  approvedBy: 'Pendente de validação',
  effectiveDate: '16/08/2026',
  includeTechnical: true,
  includeTasks: true,
  includeRecords: true,
  includeTroubleshooting: true,
  nodes: map.nodes,
  edges: map.edges,
  nodeDetails: map.node_details,
});

await mkdir(resolve('artifacts/qa'), { recursive: true });
await writeFile(output, Buffer.from(await blob.arrayBuffer()));
process.stdout.write(output);
