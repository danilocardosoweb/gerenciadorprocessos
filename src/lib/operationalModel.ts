import { repairMojibake } from './textEncoding';

export type AdvancedNodeType =
  | 'process'
  | 'operation'
  | 'inspection'
  | 'decision'
  | 'alert'
  | 'risk'
  | 'safety'
  | 'ctq'
  | 'error'
  | 'deviation'
  | 'corrective_action'
  | 'root_cause'
  | 'troubleshooting'
  | 'record'
  | 'evidence'
  | 'client'
  | 'audit'
  | 'critical_point'
  | 'nok'
  | 'ok'
  | 'block'
  | 'release';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type VisualPriority = 'normal' | 'important' | 'critical';
export type OperationalModeName = 'operator' | 'quality' | 'audit' | 'troubleshooting' | 'training';
export type OperationalViewMode = 'technical' | OperationalModeName;

export interface ReactionPlan {
  trigger: string;
  actions: string[];
  containmentActions: string[];
  escalationActions: string[];
  stopProductionCriteria: string[];
  owner: string;
}

export interface TroubleshootingGuide {
  commonFailures: string[];
  symptoms: string[];
  probableCauses: string[];
  immediateActions: string[];
  stopCriteria: string[];
  whoToCall: string[];
  requiredEvidence: string[];
  customerImpact: string;
}

export interface OperationalNodeMetadata {
  nodeTypeAdvanced: AdvancedNodeType;
  severity: SeverityLevel;
  riskLevel: RiskLevel;
  auditRequired: boolean;
  ctq: boolean;
  inspectionFrequency: string;
  reactionPlan: ReactionPlan;
  troubleshooting: TroubleshootingGuide;
  visualPriority: VisualPriority;
  operationalMode: OperationalModeName[];
  requiresEvidence: boolean;
  requiresApproval: boolean;
  requiredIATF: string;
  specialCharacteristic: string;
  customer: string;
  traceability: string;
  requiredRecords: string[];
  evidenceExamples: string[];
  lessonsLearned: string[];
  approvalCriteria: string[];
  okFlow: string[];
  nokFlow: string[];
}

export interface AdvancedNodeTypeMeta {
  value: AdvancedNodeType;
  label: string;
  description: string;
  category: string;
  iconKey: string;
  badgeClass: string;
  accentClass: string;
  glowClass: string;
  priority: number;
}

const BASE_OPERATIONAL_MODE: OperationalModeName[] = ['operator', 'quality', 'audit', 'troubleshooting', 'training'];

export const ADVANCED_NODE_TYPE_META: Record<AdvancedNodeType, AdvancedNodeTypeMeta> = {
  process: {
    value: 'process',
    label: 'Processo',
    description: 'Fluxo principal ou macroetapa do processo.',
    category: 'methods',
    iconKey: 'process',
    badgeClass: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    accentClass: 'border-l-blue-400',
    glowClass: 'shadow-blue-500/20',
    priority: 95,
  },
  operation: {
    value: 'operation',
    label: 'Operação',
    description: 'Atividade operacional executada no posto.',
    category: 'methods',
    iconKey: 'operation',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    accentClass: 'border-l-cyan-400',
    glowClass: 'shadow-cyan-500/20',
    priority: 88,
  },
  inspection: {
    value: 'inspection',
    label: 'Inspeção',
    description: 'Ponto de medição, validação ou conferência.',
    category: 'quality',
    iconKey: 'inspection',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    accentClass: 'border-l-emerald-400',
    glowClass: 'shadow-emerald-500/20',
    priority: 90,
  },
  decision: {
    value: 'decision',
    label: 'Deciso',
    description: 'Ponto de bifurcação operacional.',
    category: 'methods',
    iconKey: 'decision',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    accentClass: 'border-l-indigo-400',
    glowClass: 'shadow-indigo-500/20',
    priority: 87,
  },
  alert: {
    value: 'alert',
    label: 'Alerta',
    description: 'Condição que exige atenção imediata.',
    category: 'alerts',
    iconKey: 'alert',
    badgeClass: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    accentClass: 'border-l-rose-400',
    glowClass: 'shadow-rose-500/20',
    priority: 98,
  },
  risk: {
    value: 'risk',
    label: 'Risco',
    description: 'Risco operacional, de qualidade ou de cliente.',
    category: 'safety',
    iconKey: 'risk',
    badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    accentClass: 'border-l-amber-400',
    glowClass: 'shadow-amber-500/20',
    priority: 96,
  },
  safety: {
    value: 'safety',
    label: 'Segurança',
    description: 'Controle de segurança ou proteção operacional.',
    category: 'safety',
    iconKey: 'safety',
    badgeClass: 'bg-yellow-500/15 text-yellow-200 border border-yellow-500/30',
    accentClass: 'border-l-yellow-400',
    glowClass: 'shadow-yellow-500/20',
    priority: 97,
  },
  ctq: {
    value: 'ctq',
    label: 'CTQ',
    description: 'Característica crítica para a qualidade.',
    category: 'quality',
    iconKey: 'ctq',
    badgeClass: 'bg-violet-500/15 text-violet-300 border border-violet-500/30',
    accentClass: 'border-l-violet-400',
    glowClass: 'shadow-violet-500/20',
    priority: 99,
  },
  error: {
    value: 'error',
    label: 'Erro',
    description: 'Falha operacional identificada.',
    category: 'alerts',
    iconKey: 'error',
    badgeClass: 'bg-red-500/15 text-red-300 border border-red-500/30',
    accentClass: 'border-l-red-400',
    glowClass: 'shadow-red-500/20',
    priority: 100,
  },
  deviation: {
    value: 'deviation',
    label: 'Desvio',
    description: 'Condição fora do padrão estabelecido.',
    category: 'alerts',
    iconKey: 'deviation',
    badgeClass: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
    accentClass: 'border-l-orange-400',
    glowClass: 'shadow-orange-500/20',
    priority: 94,
  },
  corrective_action: {
    value: 'corrective_action',
    label: 'Ação corretiva',
    description: 'Ação de contenção ou correção do desvio.',
    category: 'quality',
    iconKey: 'corrective_action',
    badgeClass: 'bg-teal-500/15 text-teal-300 border border-teal-500/30',
    accentClass: 'border-l-teal-400',
    glowClass: 'shadow-teal-500/20',
    priority: 93,
  },
  root_cause: {
    value: 'root_cause',
    label: 'Causa raiz',
    description: 'Origem provável da falha.',
    category: 'quality',
    iconKey: 'root_cause',
    badgeClass: 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30',
    accentClass: 'border-l-fuchsia-400',
    glowClass: 'shadow-fuchsia-500/20',
    priority: 92,
  },
  troubleshooting: {
    value: 'troubleshooting',
    label: 'Troubleshooting',
    description: 'Passos de resposta rápida ao problema.',
    category: 'alerts',
    iconKey: 'troubleshooting',
    badgeClass: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
    accentClass: 'border-l-sky-400',
    glowClass: 'shadow-sky-500/20',
    priority: 91,
  },
  record: {
    value: 'record',
    label: 'Registro',
    description: 'Documento, formulário ou registro obrigatório.',
    category: 'compliance',
    iconKey: 'record',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    accentClass: 'border-l-cyan-400',
    glowClass: 'shadow-cyan-500/20',
    priority: 83,
  },
  evidence: {
    value: 'evidence',
    label: 'Evidência',
    description: 'Comprovação obrigatória da execução.',
    category: 'compliance',
    iconKey: 'evidence',
    badgeClass: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    accentClass: 'border-l-blue-400',
    glowClass: 'shadow-blue-500/20',
    priority: 84,
  },
  client: {
    value: 'client',
    label: 'Cliente',
    description: 'Requisito ou impacto direto no cliente.',
    category: 'people',
    iconKey: 'client',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    accentClass: 'border-l-indigo-400',
    glowClass: 'shadow-indigo-500/20',
    priority: 82,
  },
  audit: {
    value: 'audit',
    label: 'Auditoria',
    description: 'Ponto de auditoria ou verificação IATF.',
    category: 'compliance',
    iconKey: 'audit',
    badgeClass: 'bg-cyan-500/15 text-cyan-200 border border-cyan-500/30',
    accentClass: 'border-l-cyan-300',
    glowClass: 'shadow-cyan-500/20',
    priority: 89,
  },
  critical_point: {
    value: 'critical_point',
    label: 'Ponto crítico',
    description: 'Ponto que exige controle elevado.',
    category: 'quality',
    iconKey: 'critical_point',
    badgeClass: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    accentClass: 'border-l-purple-400',
    glowClass: 'shadow-purple-500/20',
    priority: 97,
  },
  nok: {
    value: 'nok',
    label: 'NOK',
    description: 'Fluxo de não conformidade.',
    category: 'alerts',
    iconKey: 'nok',
    badgeClass: 'bg-red-500/15 text-red-300 border border-red-500/30',
    accentClass: 'border-l-red-400',
    glowClass: 'shadow-red-500/20',
    priority: 99,
  },
  ok: {
    value: 'ok',
    label: 'OK',
    description: 'Fluxo aprovado ou conforme.',
    category: 'quality',
    iconKey: 'ok',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    accentClass: 'border-l-emerald-400',
    glowClass: 'shadow-emerald-500/20',
    priority: 80,
  },
  block: {
    value: 'block',
    label: 'Bloqueio',
    description: 'Interrupção obrigatória do fluxo.',
    category: 'alerts',
    iconKey: 'block',
    badgeClass: 'bg-red-600/15 text-red-200 border border-red-500/30',
    accentClass: 'border-l-red-500',
    glowClass: 'shadow-red-500/30',
    priority: 100,
  },
  release: {
    value: 'release',
    label: 'Liberação',
    description: 'Liberação formal do processo ou lote.',
    category: 'quality',
    iconKey: 'release',
    badgeClass: 'bg-green-500/15 text-green-300 border border-green-500/30',
    accentClass: 'border-l-green-400',
    glowClass: 'shadow-green-500/20',
    priority: 86,
  },
};

export const ADVANCED_NODE_TYPE_OPTIONS = Object.values(ADVANCED_NODE_TYPE_META);

export const SEVERITY_OPTIONS: Array<{ value: SeverityLevel; label: string }> = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
];

export const RISK_OPTIONS: Array<{ value: RiskLevel; label: string }> = [
  { value: 'none', label: 'Sem risco' },
  { value: 'low', label: 'Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'high', label: 'Alto' },
  { value: 'critical', label: 'Crítico' },
];

export const VISUAL_PRIORITY_OPTIONS: Array<{ value: VisualPriority; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'important', label: 'Importante' },
  { value: 'critical', label: 'Crítica' },
];

export const OPERATIONAL_VIEW_OPTIONS: Array<{ value: OperationalViewMode; label: string; description: string }> = [
  { value: 'operator', label: 'Operador', description: 'Execução simples, direta e guiada.' },
  { value: 'technical', label: 'Técnico', description: 'Mapa completo com engenharia operacional.' },
  { value: 'quality', label: 'Qualidade', description: 'Inspeções, CTQ, evidências e critérios.' },
  { value: 'audit', label: 'Auditoria', description: 'Rastreabilidade, registros e aderência IATF.' },
  { value: 'troubleshooting', label: 'Troubleshooting', description: 'Falhas, sintomas, causas e reação.' },
  { value: 'training', label: 'Treinamento', description: 'Leitura didática e reforço de aprendizado.' },
];

const toText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return repairMojibake(value).trim();
  }
  return '';
};

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'sim', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'nao', 'no', 'no'].includes(normalized)) return false;
  }
  return fallback;
};

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => toText(entry))
      .filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\r\n|;/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const toModeArray = (value: unknown): OperationalModeName[] => {
  const validModes: OperationalModeName[] = ['operator', 'quality', 'audit', 'troubleshooting', 'training'];
  const source = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  const normalized = source
    .map((entry) => toText(entry).toLowerCase())
    .filter((entry): entry is OperationalModeName => validModes.includes(entry as OperationalModeName));
  return normalized.length ? Array.from(new Set(normalized)) : [...BASE_OPERATIONAL_MODE];
};

export function getSuggestedCategoryForAdvancedType(type: AdvancedNodeType): string {
  return ADVANCED_NODE_TYPE_META[type]?.category || 'methods';
}

export function inferAdvancedNodeType(
  rawValue: unknown,
  nodeData: Record<string, unknown> = {},
  label: string,
): AdvancedNodeType {
  const data = nodeData || {};
  const candidate = toText(rawValue, data.nodeTypeAdvanced, data.nodeType, data.category).toLowerCase();
  if (candidate && candidate in ADVANCED_NODE_TYPE_META) return candidate as AdvancedNodeType;

  const fallbackText = `${toText(label, data.label)} ${candidate}`.toLowerCase();
  if (fallbackText.includes('ctq')) return 'ctq';
  if (fallbackText.includes('inspec')) return 'inspection';
  if (fallbackText.includes('audit')) return 'audit';
  if (fallbackText.includes('seguran')) return 'safety';
  if (fallbackText.includes('risco')) return 'risk';
  if (fallbackText.includes('alerta')) return 'alert';
  if (fallbackText.includes('erro')) return 'error';
  if (fallbackText.includes('desvio')) return 'deviation';
  if (fallbackText.includes('bloqueio')) return 'block';
  if (fallbackText.includes('libera')) return 'release';
  if (fallbackText.includes('evid')) return 'evidence';
  if (fallbackText.includes('registro')) return 'record';
  if (fallbackText.includes('cliente')) return 'client';
  if (fallbackText.includes('ok')) return 'ok';
  if (fallbackText.includes('nok')) return 'nok';
  if (fallbackText.includes('decis')) return 'decision';
  if (fallbackText.includes('trouble')) return 'troubleshooting';
  if (fallbackText.includes('causa')) return 'root_cause';
  if (fallbackText.includes('acao corret')) return 'corrective_action';
  if (fallbackText.includes('process')) return 'process';
  return 'operation';
}

export function createDefaultOperationalMetadata(
  overrides: Partial<OperationalNodeMetadata> = {},
): OperationalNodeMetadata {
  const inferredType = overrides.nodeTypeAdvanced || 'operation';
  const reactionPlan = overrides.reactionPlan || ({} as OperationalNodeMetadata['reactionPlan']);
  const troubleshooting = overrides.troubleshooting || ({} as OperationalNodeMetadata['troubleshooting']);
  return {
    nodeTypeAdvanced: inferredType,
    severity: overrides.severity || 'medium',
    riskLevel: overrides.riskLevel || (inferredType === 'risk' || inferredType === 'alert' || inferredType === 'error' ? 'high' : 'none'),
    auditRequired: overrides.auditRequired ?? false,
    ctq: overrides.ctq ?? inferredType === 'ctq',
    inspectionFrequency: overrides.inspectionFrequency || '',
    reactionPlan: {
      trigger: reactionPlan.trigger || '',
      actions: reactionPlan.actions || [],
      containmentActions: reactionPlan.containmentActions || [],
      escalationActions: reactionPlan.escalationActions || [],
      stopProductionCriteria: reactionPlan.stopProductionCriteria || [],
      owner: reactionPlan.owner || '',
    },
    troubleshooting: {
      commonFailures: troubleshooting.commonFailures || [],
      symptoms: troubleshooting.symptoms || [],
      probableCauses: troubleshooting.probableCauses || [],
      immediateActions: troubleshooting.immediateActions || [],
      stopCriteria: troubleshooting.stopCriteria || [],
      whoToCall: troubleshooting.whoToCall || [],
      requiredEvidence: troubleshooting.requiredEvidence || [],
      customerImpact: troubleshooting.customerImpact || '',
    },
    visualPriority: overrides.visualPriority || (inferredType === 'ctq' || inferredType === 'error' || inferredType === 'block' ? 'critical' : 'normal'),
    operationalMode: overrides.operationalMode?.length ? overrides.operationalMode : [...BASE_OPERATIONAL_MODE],
    requiresEvidence: overrides.requiresEvidence ?? ['inspection', 'ctq', 'record', 'evidence', 'audit', 'nok', 'release'].includes(inferredType),
    requiresApproval: overrides.requiresApproval ?? ['release', 'block', 'nok', 'decision', 'audit'].includes(inferredType),
    requiredIATF: overrides.requiredIATF || '',
    specialCharacteristic: overrides.specialCharacteristic || '',
    customer: overrides.customer || '',
    traceability: overrides.traceability || '',
    requiredRecords: overrides.requiredRecords || [],
    evidenceExamples: overrides.evidenceExamples || [],
    lessonsLearned: overrides.lessonsLearned || [],
    approvalCriteria: overrides.approvalCriteria || [],
    okFlow: overrides.okFlow || [],
    nokFlow: overrides.nokFlow || [],
  };
}

export function normalizeOperationalMetadata(
  rawValue: unknown,
  nodeData: Record<string, unknown> = {},
): OperationalNodeMetadata {
  const data = nodeData || {};
  const source = (rawValue && typeof rawValue === 'object' ? rawValue : {}) as Record<string, unknown>;
  const reactionPlan = (source.reactionPlan && typeof source.reactionPlan === 'object')
    ? source.reactionPlan as Record<string, unknown>
    : {};
  const troubleshooting = (source.troubleshooting && typeof source.troubleshooting === 'object')
    ? source.troubleshooting as Record<string, unknown>
    : {};
  const nodeTypeAdvanced = inferAdvancedNodeType(
    source.nodeTypeAdvanced,
    data,
    toText(source.label, data.label),
  );

  const severity = toText(source.severity, data.severity).toLowerCase() as SeverityLevel;
  const riskLevel = toText(source.riskLevel, data.riskLevel).toLowerCase() as RiskLevel;
  const visualPriority = toText(source.visualPriority, data.visualPriority).toLowerCase() as VisualPriority;

  return createDefaultOperationalMetadata({
    nodeTypeAdvanced,
    severity: ['low', 'medium', 'high', 'critical'].includes(severity) ? severity : undefined,
    riskLevel: ['none', 'low', 'medium', 'high', 'critical'].includes(riskLevel) ? riskLevel : undefined,
    auditRequired: toBoolean(source.auditRequired ?? data.auditRequired, false),
    ctq: toBoolean(source.ctq ?? data.ctq, nodeTypeAdvanced === 'ctq'),
    inspectionFrequency: toText(source.inspectionFrequency, data.inspectionFrequency),
    visualPriority: ['normal', 'important', 'critical'].includes(visualPriority) ? visualPriority : undefined,
    operationalMode: toModeArray(source.operationalMode ?? data.operationalMode),
    requiresEvidence: toBoolean(source.requiresEvidence ?? data.requiresEvidence, undefined as never),
    requiresApproval: toBoolean(source.requiresApproval ?? data.requiresApproval, undefined as never),
    requiredIATF: toText(source.requiredIATF, data.requiredIATF),
    specialCharacteristic: toText(source.specialCharacteristic, source.specialCharacteristicCode),
    customer: toText(source.customer, source.client, data.customer),
    traceability: toText(source.traceability, source.traceabilityRecord, data.traceability),
    requiredRecords: toArray(source.requiredRecords),
    evidenceExamples: toArray(source.evidenceExamples ?? source.evidenceList),
    lessonsLearned: toArray(source.lessonsLearned),
    approvalCriteria: toArray(source.approvalCriteria),
    okFlow: toArray(source.okFlow),
    nokFlow: toArray(source.nokFlow),
    reactionPlan: {
      trigger: toText(reactionPlan.trigger, source.reactionPlanTrigger),
      actions: toArray(reactionPlan.actions),
      containmentActions: toArray(reactionPlan.containmentActions),
      escalationActions: toArray(reactionPlan.escalationActions),
      stopProductionCriteria: toArray(reactionPlan.stopProductionCriteria),
      owner: toText(reactionPlan.owner, source.escalationOwner),
    },
    troubleshooting: {
      commonFailures: toArray(troubleshooting.commonFailures ?? source.failureExamples),
      symptoms: toArray(troubleshooting.symptoms),
      probableCauses: toArray(troubleshooting.probableCauses),
      immediateActions: toArray(troubleshooting.immediateActions),
      stopCriteria: toArray(troubleshooting.stopCriteria),
      whoToCall: toArray(troubleshooting.whoToCall),
      requiredEvidence: toArray(troubleshooting.requiredEvidence),
      customerImpact: toText(troubleshooting.customerImpact, source.customerImpact),
    },
  });
}

export function getAdvancedNodeMeta(rawValue: unknown, nodeData: Record<string, unknown>) {
  const safeNodeData = nodeData || {};
  const type = inferAdvancedNodeType(rawValue, safeNodeData, toText(safeNodeData.label));
  return ADVANCED_NODE_TYPE_META[type];
}

export function getSeverityWeight(value: SeverityLevel) {
  return { low: 1, medium: 2, high: 3, critical: 4 }[value] || 2;
}

export function getRiskWeight(value: RiskLevel) {
  return { none: 0, low: 1, medium: 2, high: 3, critical: 4 }[value] || 0;
}

export function isOperationallyRelevantToView(metadata: OperationalNodeMetadata, viewMode: OperationalViewMode) {
  if (viewMode === 'technical') return true;
  if (viewMode === 'operator') {
    return metadata.operationalMode.includes('operator') || metadata.nodeTypeAdvanced === 'operation' || metadata.nodeTypeAdvanced === 'process';
  }
  if (viewMode === 'training') {
    return metadata.operationalMode.includes('training') || ['process', 'operation', 'inspection', 'decision', 'safety', 'ctq'].includes(metadata.nodeTypeAdvanced);
  }
  if (viewMode === 'quality') {
    return metadata.ctq
      || metadata.auditRequired
      || metadata.requiresEvidence
      || ['inspection', 'ctq', 'record', 'evidence', 'nok', 'ok', 'release', 'critical_point'].includes(metadata.nodeTypeAdvanced);
  }
  if (viewMode === 'audit') {
    return metadata.auditRequired
      || metadata.requiresApproval
      || metadata.requiresEvidence
      || metadata.requiredRecords.length > 0
      || ['audit', 'record', 'evidence', 'release', 'block', 'client'].includes(metadata.nodeTypeAdvanced);
  }
  if (viewMode === 'troubleshooting') {
    return getRiskWeight(metadata.riskLevel) >= 2
      || metadata.troubleshooting.commonFailures.length > 0
      || ['alert', 'risk', 'error', 'deviation', 'corrective_action', 'root_cause', 'troubleshooting', 'nok', 'block'].includes(metadata.nodeTypeAdvanced);
  }
  return true;
}

export function buildOperationalBadges(metadata: OperationalNodeMetadata) {
  const badges: Array<{ label: string; tone: string }> = [];
  if (metadata.ctq) badges.push({ label: 'CTQ', tone: 'violet' });
  if (metadata.auditRequired) badges.push({ label: 'Auditoria', tone: 'cyan' });
  if (metadata.requiresEvidence) badges.push({ label: 'Evidáncia', tone: 'blue' });
  if (metadata.requiresApproval) badges.push({ label: 'Aprovação', tone: 'emerald' });
  if (getRiskWeight(metadata.riskLevel) >= 2) badges.push({ label: `Risco ${metadata.riskLevel}`, tone: 'amber' });
  return badges;
}
