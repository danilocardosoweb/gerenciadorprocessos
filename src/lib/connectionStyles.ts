import type { CSSProperties } from 'react';
import type { Edge, Node } from '@xyflow/react';

export type ConnectionTheme =
  | 'classic'
  | 'engineering'
  | 'futuristic'
  | 'minimalist'
  | 'industrialIATF';

export type ConnectionVariant =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'curved'
  | 'orthogonal'
  | 'glow'
  | 'gradient'
  | 'pulsing'
  | 'smart'
  | 'double'
  | 'highlight';

export type ConnectionCategoryKey =
  | 'process'
  | 'inputs'
  | 'outputs'
  | 'resources'
  | 'people'
  | 'methods'
  | 'kpis'
  | 'quality'
  | 'safety'
  | 'alerts'
  | 'default';

export interface ConnectionEdgeData {
  [key: string]: unknown;
  variant: ConnectionVariant;
  categoryKey: ConnectionCategoryKey;
  sourceCategory: string;
  targetCategory: string;
  sourceLabel: string;
  targetLabel: string;
  isActive: boolean;
  isHovered: boolean;
}

export type SmartConnectionEdgeModel = Edge<ConnectionEdgeData, 'smart-connection'>;

type ThemeVars = CSSProperties & Record<`--${string}`, string>;

export const CONNECTION_THEME_LABELS: Record<ConnectionTheme, string> = {
  classic: 'Clássico',
  engineering: 'Engenharia',
  futuristic: 'Futurista',
  minimalist: 'Minimalista',
  industrialIATF: 'Industrial IATF',
};

export const CONNECTION_THEME_OPTIONS = Object.entries(CONNECTION_THEME_LABELS).map(([value, label]) => ({
  value: value as ConnectionTheme,
  label,
}));

const BASE_THEME_VARS: Record<string, string> = {
  '--connection-primary': '#60a5fa',
  '--connection-secondary': '#38bdf8',
  '--connection-accent': '#a78bfa',
  '--connection-warning': '#fbbf24',
  '--connection-danger': '#fb7185',
  '--connection-muted': 'rgba(148, 163, 184, 0.55)',
  '--connection-glow': 'rgba(96, 165, 250, 0.62)',
  '--connection-surface': 'rgba(15, 23, 42, 0.96)',
  '--connection-gradient-from': '#60a5fa',
  '--connection-gradient-to': '#a78bfa',
  '--connection-background': 'rgba(15, 23, 42, 0.9)',
};

const THEME_VARS: Record<ConnectionTheme, ThemeVars> = {
  classic: {
    ...BASE_THEME_VARS,
    '--connection-primary': '#60a5fa',
    '--connection-secondary': '#818cf8',
    '--connection-accent': '#a78bfa',
    '--connection-warning': '#f59e0b',
    '--connection-danger': '#fb7185',
    '--connection-muted': 'rgba(148, 163, 184, 0.45)',
    '--connection-glow': 'rgba(96, 165, 250, 0.55)',
    '--connection-gradient-from': '#60a5fa',
    '--connection-gradient-to': '#8b5cf6',
  },
  engineering: {
    ...BASE_THEME_VARS,
    '--connection-primary': '#38bdf8',
    '--connection-secondary': '#0ea5e9',
    '--connection-accent': '#f59e0b',
    '--connection-warning': '#fbbf24',
    '--connection-danger': '#ef4444',
    '--connection-muted': 'rgba(125, 211, 252, 0.35)',
    '--connection-glow': 'rgba(14, 165, 233, 0.62)',
    '--connection-gradient-from': '#38bdf8',
    '--connection-gradient-to': '#f59e0b',
  },
  futuristic: {
    ...BASE_THEME_VARS,
    '--connection-primary': '#22d3ee',
    '--connection-secondary': '#818cf8',
    '--connection-accent': '#f472b6',
    '--connection-warning': '#f59e0b',
    '--connection-danger': '#fb7185',
    '--connection-muted': 'rgba(148, 163, 184, 0.32)',
    '--connection-glow': 'rgba(34, 211, 238, 0.75)',
    '--connection-gradient-from': '#22d3ee',
    '--connection-gradient-to': '#f472b6',
  },
  minimalist: {
    ...BASE_THEME_VARS,
    '--connection-primary': '#94a3b8',
    '--connection-secondary': '#cbd5e1',
    '--connection-accent': '#60a5fa',
    '--connection-warning': '#facc15',
    '--connection-danger': '#f87171',
    '--connection-muted': 'rgba(148, 163, 184, 0.22)',
    '--connection-glow': 'rgba(96, 165, 250, 0.3)',
    '--connection-gradient-from': '#94a3b8',
    '--connection-gradient-to': '#cbd5e1',
  },
  industrialIATF: {
    ...BASE_THEME_VARS,
    '--connection-primary': '#60a5fa',
    '--connection-secondary': '#14b8a6',
    '--connection-accent': '#a855f7',
    '--connection-warning': '#fbbf24',
    '--connection-danger': '#f87171',
    '--connection-muted': 'rgba(100, 116, 139, 0.48)',
    '--connection-glow': 'rgba(96, 165, 250, 0.68)',
    '--connection-gradient-from': '#60a5fa',
    '--connection-gradient-to': '#14b8a6',
  },
};

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function normalizeConnectionTheme(value: string | null): ConnectionTheme {
  const normalized = normalizeText(value);
  if (normalized === 'classic') return 'classic';
  if (normalized === 'engineering') return 'engineering';
  if (normalized === 'futuristic') return 'futuristic';
  if (normalized === 'minimalist') return 'minimalist';
  return 'industrialIATF';
}

export function getConnectionThemeVariables(theme: ConnectionTheme): ThemeVars {
  return THEME_VARS[theme] || THEME_VARS.industrialIATF;
}

export function resolveNodeCategory(node: Node | null): string {
  const data = (node?.data as any) || {};
  const category = typeof data.category === 'function' ? data.category() : data.category;
  const raw = normalizeText(category ?? data.nodeType ?? '');
  if (!raw) return 'default';

  if (['root', 'process', 'principal', 'main', 'tema', 'tema principal'].includes(raw)) return 'process';
  if (['inputs', 'entrada', 'entradas', 'input'].includes(raw)) return 'inputs';
  if (['outputs', 'saida', 'saidas', 'saída', 'saídas', 'output'].includes(raw)) return 'outputs';
  if (['resources', 'recurso', 'recursos', 'material', 'ferramenta', 'tools'].includes(raw)) return 'resources';
  if (['people', 'pessoa', 'pessoas', 'operador', 'operadores', 'team', 'equipe', 'user', 'usuarios', 'usuarios'].includes(raw)) return 'people';
  if (['methods', 'method', 'metodos', 'metodos operacionais', 'métodos', 'operacao', 'operacaoes'].includes(raw)) return 'methods';
  if (['kpis', 'kpi', 'indicadores', 'indicador', 'metricas', 'métricas'].includes(raw)) return 'kpis';
  if (['quality', 'qualidade', 'conformidade', 'compliance', 'qualidade operacional'].includes(raw)) return 'quality';
  if (['safety', 'seguranca', 'seguranca operacional', 'seguranca do trabalho', 'seg', 'seguridade'].includes(raw)) return 'safety';
  if (['alerts', 'alerta', 'alertas', 'warning', 'risco', 'ocorrencia', 'ocorrencias'].includes(raw)) return 'alerts';

  return raw;
}

export function inferConnectionCategoryKey(sourceCategory: string, targetCategory: string): ConnectionCategoryKey {
  const source = normalizeText(sourceCategory);
  const target = normalizeText(targetCategory);

  if (['quality', 'qualidade', 'conformidade', 'compliance'].includes(target)) return 'quality';
  if (['safety', 'seguranca', 'seguridade', 'seg'].includes(target)) return 'safety';
  if (['alerts', 'alerta', 'alertas', 'warning', 'risco'].includes(target)) return 'alerts';
  if (['kpis', 'kpi', 'indicador', 'indicadores', 'metricas', 'métricas'].includes(target)) return 'kpis';
  if (['resources', 'recurso', 'recursos'].includes(target)) return 'resources';
  if (['people', 'pessoa', 'pessoas', 'operador', 'operadores', 'equipe', 'team'].includes(target)) return 'people';
  if (['methods', 'method', 'metodo', 'metodos', 'metodos operacionais'].includes(target)) return 'methods';
  if (['inputs', 'input', 'entrada', 'entradas'].includes(target)) return 'inputs';
  if (['outputs', 'output', 'saida', 'saidas'].includes(target)) return 'outputs';
  if (source === 'root' || target === 'root' || target === 'process' || source === 'process') return 'process';

  return 'default';
}

export function inferConnectionVariant(
  categoryKey: ConnectionCategoryKey,
  sourceCategory: string,
  targetCategory: string,
  sourceNode: Node | null,
  targetNode: Node | null
): ConnectionVariant {
  if (categoryKey === 'resources') return 'dashed';
  if (categoryKey === 'people') return 'dotted';
  if (categoryKey === 'kpis') return 'glow';
  if (categoryKey === 'quality') return 'double';
  if (categoryKey === 'safety') return 'highlight';
  if (categoryKey === 'alerts') return 'pulsing';
  if (categoryKey === 'outputs' || categoryKey === 'methods') return 'gradient';
  if (categoryKey === 'process') return 'curved';

  const sourceCode = normalizeText((sourceNode?.data as any)?.numberCode || '');
  const targetCode = normalizeText((targetNode?.data as any)?.numberCode || '');
  if (sourceCode && targetCode && sourceCode.split('.').length !== targetCode.split('.').length) return 'smart';

  const normalizedTarget = normalizeText(targetCategory);
  if (normalizedTarget.includes('alarm') || normalizedTarget.includes('alert')) return 'pulsing';

  return 'smart';
}

export function resolveConnectionStrokeColor(categoryKey: ConnectionCategoryKey | string): string {
  const normalized = normalizeText(categoryKey);
  if (normalized === 'resources') return 'var(--connection-secondary)';
  if (normalized === 'people') return 'var(--connection-muted)';
  if (normalized === 'kpis') return 'var(--connection-primary)';
  if (normalized === 'quality') return 'var(--connection-accent)';
  if (normalized === 'safety') return 'var(--connection-warning)';
  if (normalized === 'alerts') return 'var(--connection-danger)';
  if (normalized === 'outputs') return 'var(--connection-gradient-to)';
  if (normalized === 'methods') return 'var(--connection-accent)';
  return 'var(--connection-primary)';
}

export function resolveConnectionStrokeWidth(variant: ConnectionVariant, isActive = false, isHovered = false): number {
  const base = variant === 'curved' || variant === 'gradient' || variant === 'glow' ? 2.4 : 2;
  if (variant === 'double') return isActive ? 3.2 : 2.8;
  if (variant === 'solid') return isActive ? 2.8 : 2.2;
  if (variant === 'dashed' || variant === 'dotted') return isActive ? 2.4 : 1.9;
  if (variant === 'pulsing') return isActive ? 3.2 : 2.4;
  if (variant === 'highlight') return isActive ? 2.8 : 2.2;
  return isHovered || isActive ? base + 0.4 : base;
}

export function resolveConnectionDashArray(variant: ConnectionVariant): string | undefined {
  if (variant === 'dashed') return '10 8';
  if (variant === 'dotted') return '2 8';
  if (variant === 'pulsing') return '7 7';
  if (variant === 'highlight') return '12 6';
  return undefined;
}

export function resolveConnectionOpacity(variant: ConnectionVariant, isActive = false, isHovered = false): number {
  if (variant === 'pulsing') return isActive || isHovered ? 1 : 0.8;
  if (variant === 'glow') return isActive || isHovered ? 1 : 0.92;
  if (isActive) return 1;
  if (isHovered) return 0.96;
  return variant === 'dotted' ? 0.82 : 0.9;
}

export function buildConnectionDirectionLabel(sourceLabel: string, targetLabel: string): string {
  const source = String(sourceLabel ?? '').trim();
  const target = String(targetLabel ?? '').trim();

  if (source && target) return `${source} → ${target}`;
  if (source) return `${source} → fluxo`;
  if (target) return `fluxo → ${target}`;
  return 'Fluxo inteligente';
}

export interface ConnectionRenderContext {
  activeNodeId?: string | null;
  hoveredNodeId?: string | null;
}

function getNodeCodeDepth(node: Node | null): number {
  const code = String((node?.data as any)?.numberCode || '').trim();
  if (!code) return 0;
  return code.split('.').filter(Boolean).length;
}

function createConnectionEdgeId(source: string, target: string): string {
  return `e-${source}-${target}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createConnectionEdge(
  params: {
    source: string | null;
    target: string | null;
    sourceHandle: string | null;
    targetHandle: string | null;
  },
  nodes: Node[],
): SmartConnectionEdgeModel {
  const source = String(params.source ?? '');
  const target = String(params.target ?? '');
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const sourceNode = nodeMap.get(source) || null;
  const targetNode = nodeMap.get(target) || null;
  const sourceCategory = resolveNodeCategory(sourceNode);
  const targetCategory = resolveNodeCategory(targetNode);
  const categoryKey = inferConnectionCategoryKey(sourceCategory, targetCategory);
  const variant = inferConnectionVariant(categoryKey, sourceCategory, targetCategory, sourceNode, targetNode);

  const sourceDepth = getNodeCodeDepth(sourceNode);
  const targetDepth = getNodeCodeDepth(targetNode);
  const edgeId = createConnectionEdgeId(source, target);

  return {
    id: edgeId,
    source,
    target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    type: 'smart-connection',
    data: {
      variant,
      categoryKey,
      sourceCategory,
      targetCategory,
      sourceLabel: String((sourceNode?.data as any)?.label || source || 'Origem'),
      targetLabel: String((targetNode?.data as any)?.label || target || 'Destino'),
      isActive: false,
      isHovered: false,
      // Small hint for the renderer when the hierarchy is deep.
      ...(targetDepth > sourceDepth + 1 ? { hierarchyHint: 'deep' } : {}),
    } as ConnectionEdgeData & Record<string, unknown>,
  } as SmartConnectionEdgeModel;
}

export function prepareConnectionEdges(
  edges: Edge[],
  nodes: Node[],
  context: ConnectionRenderContext = {},
): SmartConnectionEdgeModel[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return edges.map((edge) => {
    const sourceNode = nodeMap.get(String(edge.source)) || null;
    const targetNode = nodeMap.get(String(edge.target)) || null;
    const sourceCategory = resolveNodeCategory(sourceNode);
    const targetCategory = resolveNodeCategory(targetNode);
    const categoryKey = inferConnectionCategoryKey(sourceCategory, targetCategory);
    const variant = (edge.data as ConnectionEdgeData | undefined)?.variant
      || inferConnectionVariant(categoryKey, sourceCategory, targetCategory, sourceNode, targetNode);

    const sourceLabel = String((edge.data as ConnectionEdgeData | undefined)?.sourceLabel || (sourceNode?.data as any)?.label || edge.source);
    const targetLabel = String((edge.data as ConnectionEdgeData | undefined)?.targetLabel || (targetNode?.data as any)?.label || edge.target);
    const isActive = Boolean(context.activeNodeId && (edge.source === context.activeNodeId || edge.target === context.activeNodeId));
    const isHovered = Boolean(context.hoveredNodeId && (edge.source === context.hoveredNodeId || edge.target === context.hoveredNodeId));

    return {
      ...edge,
      type: 'smart-connection',
      data: {
        ...(edge.data as Record<string, unknown> || {}),
        variant,
        categoryKey,
        sourceCategory,
        targetCategory,
        sourceLabel,
        targetLabel,
        isActive,
        isHovered,
      } as ConnectionEdgeData & Record<string, unknown>,
    } as SmartConnectionEdgeModel;
  });
}
