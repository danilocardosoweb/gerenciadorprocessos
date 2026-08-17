import type { Node } from '@xyflow/react';

import type { NodeDetails } from '../components/NodeModal';
import { normalizeOperationalMetadata } from './operationalModel';

export type PresentationReadingMode = 'traditional' | 'essential' | 'complete';
export type PresentationFrameTone = 'neutral' | 'instruction' | 'visual' | 'approval' | 'ok' | 'nok' | 'record';

export interface PresentationReadingFrame {
  id: string;
  nodeId: string;
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  media: string[];
  tone: PresentationFrameTone;
  requiresConfirmation: boolean;
}

const cleanText = (value: unknown) => typeof value === 'string' ? value.trim() : '';

const normalizeMediaSource = (value: unknown): string => {
  if (typeof value === 'string') return value.trim();
  if (!value || typeof value !== 'object') return '';
  const source = value as Record<string, unknown>;
  return [source.url, source.src, source.imageUrl, source.image_url, source.publicUrl, source.public_url]
    .map(cleanText)
    .find(Boolean) || '';
};

const normalizeMediaSources = (value: unknown): string[] => {
  const sources = Array.isArray(value) ? value : value == null ? [] : [value];
  return Array.from(new Set(sources.map(normalizeMediaSource).filter(Boolean)));
};

const uniqueText = (values: unknown[], limit = 12) => {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values.flat(Infinity)) {
    const text = cleanText(value);
    if (!text) continue;
    const key = text.toLocaleLowerCase('pt-BR');
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(text);
    if (output.length >= limit) break;
  }

  return output;
};

const outcomeText = (outcome: any) => uniqueText([
  outcome?.result,
  outcome?.action,
  outcome?.nextStep,
]);

const buildFrame = (
  nodeId: string,
  suffix: string,
  frame: Omit<PresentationReadingFrame, 'id' | 'nodeId'>,
): PresentationReadingFrame => ({
  id: `${nodeId}:${suffix}`,
  nodeId,
  ...frame,
});

export const buildPresentationFrames = (
  node: Node | undefined,
  details: NodeDetails | undefined,
  mode: PresentationReadingMode,
): PresentationReadingFrame[] => {
  if (!node || mode === 'traditional') return [];

  const data = (node.data || {}) as Record<string, unknown>;
  const label = cleanText(data.label) || 'Etapa do processo';
  const description = cleanText(details?.description)
    || cleanText(data.description)
    || 'Observe esta etapa e siga as orientações apresentadas no processo.';
  const tasks = Array.isArray(details?.tasks) ? details.tasks.filter(Boolean) : [];
  const operational = normalizeOperationalMetadata(details?.operational, data);
  const nodeMedia = normalizeMediaSources(details?.images);
  const taskMedia = tasks.flatMap((task) => normalizeMediaSources(task?.images));
  const allMedia = normalizeMediaSources([...nodeMedia, ...taskMedia]);
  const taskTexts = uniqueText(tasks.map((task) => task?.text), 6);

  if (mode === 'essential') {
    return [buildFrame(node.id, 'summary', {
      eyebrow: 'Leitura essencial',
      title: label,
      description,
      items: taskTexts.slice(0, 4),
      media: allMedia.slice(0, 1),
      tone: 'neutral',
      requiresConfirmation: false,
    })];
  }

  const frames: PresentationReadingFrame[] = [buildFrame(node.id, 'summary', {
    eyebrow: 'Visão da etapa',
    title: label,
    description,
    items: [],
    media: [],
    tone: 'neutral',
    requiresConfirmation: false,
  })];

  const nodeHowTo = Array.isArray(details?.howTo) ? details.howTo : [];
  const taskHowTo = tasks.flatMap((task) => Array.isArray(task?.howTo) ? task.howTo : []);
  const instructionItems = uniqueText([
    ...nodeHowTo.map((step) => step?.instruction),
    ...taskTexts,
    ...taskHowTo.map((step) => step?.instruction),
  ], 10);
  if (instructionItems.length > 0) {
    frames.push(buildFrame(node.id, 'instruction', {
      eyebrow: 'Como executar',
      title: `Execução de ${label}`,
      description: 'Siga a sequência apresentada e não avance quando houver requisito não atendido.',
      items: instructionItems,
      media: [],
      tone: 'instruction',
      requiresConfirmation: false,
    }));
  }

  allMedia.forEach((source, index) => {
    frames.push(buildFrame(node.id, `visual-${index + 1}`, {
      eyebrow: 'Referência visual',
      title: label,
      description: 'Observe a referência visual desta etapa antes de continuar.',
      items: [],
      media: [source],
      tone: 'visual',
      requiresConfirmation: false,
    }));
  });

  const approvalItems = uniqueText([
    ...operational.approvalCriteria,
    ...operational.okCriteria,
    operational.inspectionFrequency ? `Frequência de inspeção: ${operational.inspectionFrequency}` : '',
    operational.approvalAuthority.length > 0
      ? `Autoridade de aprovação: ${operational.approvalAuthority.join(', ')}`
      : '',
  ], 10);
  if (approvalItems.length > 0 || operational.requiresApproval) {
    frames.push(buildFrame(node.id, 'approval', {
      eyebrow: 'Critério de aprovação',
      title: 'Antes de liberar ou avançar',
      description: operational.requiresApproval
        ? 'Esta etapa exige aprovação. Confirme os critérios e a autoridade responsável antes de prosseguir.'
        : 'Confirme os critérios definidos para considerar esta etapa conforme.',
      items: approvalItems,
      media: [],
      tone: 'approval',
      requiresConfirmation: operational.requiresApproval,
    }));
  }

  const okItems = uniqueText([
    ...outcomeText(details?.ifOK),
    ...tasks.flatMap((task) => outcomeText(task?.ifOK)),
    ...operational.okFlow,
  ], 10);
  if (okItems.length > 0) {
    frames.push(buildFrame(node.id, 'ok', {
      eyebrow: 'Se estiver OK',
      title: 'Condição conforme',
      description: 'Com o requisito atendido, execute as ações de liberação indicadas.',
      items: okItems,
      media: [],
      tone: 'ok',
      requiresConfirmation: false,
    }));
  }

  const nokItems = uniqueText([
    ...outcomeText(details?.ifNOK),
    ...tasks.flatMap((task) => outcomeText(task?.ifNOK)),
    ...operational.nokCriteria,
    ...operational.nokFlow,
    ...operational.reactionPlan.actions,
    ...operational.reactionPlan.containmentActions,
    ...operational.reactionPlan.escalationActions,
    ...operational.reactionPlan.stopProductionCriteria.map((item) => `Parar quando: ${item}`),
    operational.reactionPlan.owner ? `Responsável: ${operational.reactionPlan.owner}` : '',
  ], 12);
  const isCritical = operational.severity === 'critical'
    || operational.riskLevel === 'critical'
    || operational.riskLevel === 'high'
    || operational.nodeTypeAdvanced === 'decision'
    || operational.nodeTypeAdvanced === 'block'
    || operational.nodeTypeAdvanced === 'nok';
  if (nokItems.length > 0) {
    frames.push(buildFrame(node.id, 'nok', {
      eyebrow: 'Se estiver NOK',
      title: 'Desvio, bloqueio e reação',
      description: 'Não avance automaticamente. Aplique a reação definida e confirme a condição de retomada.',
      items: nokItems,
      media: [],
      tone: 'nok',
      requiresConfirmation: isCritical,
    }));
  }

  const recordItems = uniqueText([
    ...operational.requiredRecords,
    ...operational.evidenceExamples.map((item) => `Evidência: ${item}`),
    operational.traceability ? `Rastreabilidade: ${operational.traceability}` : '',
    ...operational.restartCriteria.map((item) => `Retomar somente após: ${item}`),
    ...operational.reactionPlan.restartCriteria.map((item) => `Retomar somente após: ${item}`),
  ], 12);
  if (recordItems.length > 0 || operational.requiresEvidence) {
    frames.push(buildFrame(node.id, 'record', {
      eyebrow: 'Registros e evidências',
      title: 'Comprovação da execução',
      description: operational.requiresEvidence
        ? 'A etapa exige evidência. Registre a execução antes de avançar.'
        : 'Mantenha os registros e a rastreabilidade indicados para esta etapa.',
      items: recordItems,
      media: [],
      tone: 'record',
      requiresConfirmation: operational.requiresEvidence,
    }));
  }

  return frames;
};

export const buildFrameSpeechText = (frame: PresentationReadingFrame | undefined) => {
  if (!frame) return '';
  return [frame.eyebrow, frame.title, frame.description, ...frame.items]
    .map(cleanText)
    .filter(Boolean)
    .join('. ');
};
