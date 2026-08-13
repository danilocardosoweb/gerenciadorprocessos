import type { Edge, Node } from '@xyflow/react';
import { getLayoutedElements } from './layout';
import type { NodeDetails } from '../components/NodeModal';
import { normalizeOperationalMetadata } from './operationalModel';
import { repairMojibake } from './textEncoding';

export type MapVisibility = 'public' | 'departments' | 'private';
export type MapLayoutDirection = 'LR' | 'RL' | 'TB' | 'BT' | 'hierarchical';

export interface MapJsonExport {
  schema: 'tecnomapper.map.json';
  version: number;
  exportedAt: string;
  title: string;
  description: string;
  visibility: MapVisibility;
  tags: string[];
  layout: MapLayoutDirection;
  nodes: Node[];
  edges: Edge[];
  node_details: Record<string, NodeDetails>;
}

export interface MapJsonImportResult {
  title: string;
  description: string;
  visibility: MapVisibility;
  tags: string[];
  layout: MapLayoutDirection;
  nodes: Node[];
  edges: Edge[];
  nodeDetails: Record<string, NodeDetails>;
  warnings: string[];
}

interface RawMapJson {
  schema: string;
  version: number;
  title: string;
  description: string;
  visibility: MapVisibility;
  tags: string[] | string;
  layout: MapLayoutDirection;
  nodes: any[];
  edges: any[];
  node_details: Record<string, any>;
  nodeDetails: Record<string, any>;
  graph: {
    title: string;
    description: string;
    visibility: MapVisibility;
    tags: string[] | string;
    layout: MapLayoutDirection;
    nodes: any[];
    edges: any[];
    node_details: Record<string, any>;
    nodeDetails: Record<string, any>;
  };
}

const DEFAULT_LAYOUT: MapLayoutDirection = 'hierarchical';

const isPlainObject = (value: unknown): value is Record<string, any> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toText = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return repairMojibake(value).trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  }
  return '';
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => toText(entry))
    .filter(Boolean);
};

const normalizeTags = (value: unknown): string[] => {
  if (Array.isArray(value)) return toStringArray(value);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const safePosition = (position: any, index: number) => {
  const safeValue = isPlainObject(position) ? position : {};
  const x = Number(safeValue.x);
  const y = Number(safeValue.y);

  if (Number.isFinite(x) && Number.isFinite(y)) {
    return { x, y };
  }

  return { x: 0, y: index * 120 };
};

const cleanNodeData = (data: Record<string, any>) => {
  const {
    isAdmin,
    isPresenting,
    onDelete,
    onDeleteConfirm,
    isFocus,
    isMuted,
    selected,
    dragging,
    measured,
    ...rest
  } = data;

  return rest;
};

const buildDefaultDescription = (label: string) => {
  const topic = label || 'este item';
  return `Conteúdo operacional de "${topic}". Revise objetivo, recursos, sequência e critérios antes de executar.`;
};

const buildDefaultTasks = (nodeId: string, label: string) => ([
  { id: `${nodeId}-task-1`, text: `Conferir o objetivo de "${label}".`, completed: false },
  { id: `${nodeId}-task-2`, text: 'Validar entradas, recursos e requisitos de segurança.', completed: false },
  { id: `${nodeId}-task-3`, text: 'Executar a etapa conforme o padrão definido.', completed: false },
  { id: `${nodeId}-task-4`, text: 'Registrar evidências e tratar desvios encontrados.', completed: false },
]);

const normalizeFlowOutcome = (value: any) => {
  if (!isPlainObject(value)) return undefined;
  const result = toText(value.result, value.text, value.label);
  const action = toText(value.action, value.nextAction, value.description);
  if (!result && !action) return undefined;

  const normalized: Record<string, any> = {};
  if (result) normalized.result = result;
  if (action) normalized.action = action;
  const nextStep = toText(value.nextStep);
  if (nextStep) normalized.nextStep = nextStep;
  const alertLevel = toText(value.alertLevel);
  if (alertLevel) normalized.alertLevel = alertLevel;
  return normalized;
};

const normalizeHowTo = (value: any) => {
  if (!Array.isArray(value)) return undefined;

  const normalized = value
    .map((step, index) => {
      if (!isPlainObject(step)) return null;
      const instruction = toText(step.instruction, step.text, step.label);
      if (!instruction) return null;
      const order = Number(step.order);
      const output: Record<string, any> = {
        order: Number.isFinite(order) && order > 0 ? order : index + 1,
        instruction,
      };
      const visualHint = toText(step.visualHint);
      if (visualHint) output.visualHint = visualHint;
      return output;
    })
    .filter(Boolean);

  return normalized.length ? normalized : undefined;
};

const normalizeTips = (value: any) => {
  if (!Array.isArray(value)) return undefined;

  const normalized = value
    .map((tip) => {
      if (!isPlainObject(tip)) return null;
      const icon = toText(tip.icon, tip.symbol);
      const message = toText(tip.message, tip.text, tip.label);
      if (!icon && !message) return null;
      return {
        ...(icon ? { icon } : {}),
        ...(message ? { message } : {}),
      };
    })
    .filter(Boolean);

  return normalized.length ? normalized : undefined;
};

const normalizeTasks = (value: any, nodeId: string, label: string) => {
  const source = Array.isArray(value) ? value : [];

  const normalized = source
    .map((task, index) => {
      if (typeof task === 'string') {
        return {
          id: `${nodeId}-task-${index + 1}`,
          text: task.trim(),
          completed: false,
        };
      }

      if (!isPlainObject(task)) return null;

      const text = toText(task.text, task.instruction, task.message, task.title) || `${label} - etapa ${index + 1}`;
      const taskHowTo = normalizeHowTo(task.howTo);
      return {
        ...task,
        id: toText(task.id, `${nodeId}-task-${index + 1}`),
        text,
        completed: Boolean(task.completed),
        ...(taskHowTo ? { howTo: taskHowTo } : {}),
        ...(Array.isArray(task.images) ? { images: toStringArray(task.images) } : {}),
        ...(Array.isArray(task.files) ? { files: task.files.filter(isPlainObject) } : {}),
      };
    })
    .filter(Boolean);

  return normalized.length ? normalized : buildDefaultTasks(nodeId, label);
};

const normalizeNodeDetails = (nodeId: string, rawDetails: any, nodeData: Record<string, any>): NodeDetails => {
  const source = isPlainObject(rawDetails) ? rawDetails : {};
  const data = isPlainObject(nodeData) ? nodeData : {};
  const label = toText(data.label, source.title, source.name, nodeId) || nodeId;

  const images = [
    ...toStringArray(source.images),
    ...toStringArray(source.imageUrls),
    ...toStringArray(source.evidenceImages),
  ];

  const description = toText(
    source.description,
    source.analyticalDetails,
    source.analysis,
    source.summary,
    source.text,
    data.description,
    data.analyticalDetails,
    data.analysis,
  ) || buildDefaultDescription(label);

  const tasks = normalizeTasks(
    source.tasks ?? source.actions ?? source.actionsEvidence ?? source.checklist ?? data.tasks ?? data.actions ?? data.actionsEvidence,
    nodeId,
    label
  );

  const normalized: NodeDetails = {
    description,
    images,
    tasks,
  };

  const howTo = normalizeHowTo(source.howTo ?? data.howTo);
  if (howTo) normalized.howTo = howTo as any;

  const ifOK = normalizeFlowOutcome(source.ifOK ?? data.ifOK);
  if (ifOK) normalized.ifOK = ifOK as any;

  const ifNOK = normalizeFlowOutcome(source.ifNOK ?? data.ifNOK);
  if (ifNOK) normalized.ifNOK = ifNOK as any;

  const tips = normalizeTips(source.tips ?? data.tips);
  if (tips) normalized.tips = tips as any;

  normalized.operational = normalizeOperationalMetadata(
    source.operational ?? source.operationalMetadata ?? data.operational,
    data,
  );

  return normalized;
};

const normalizeNode = (rawNode: any, index: number): Node => {
  const rawData = isPlainObject(rawNode.data) ? rawNode.data : {};
  const label = toText(rawData.label, rawNode.label, rawNode.title, rawNode.name, rawNode.id, `Nó ${index + 1}`);
  const numberCode = toText(rawData.numberCode, rawNode.numberCode, rawNode.code);
  const nodeType = toText(rawData.nodeType, rawNode.nodeType, rawData.category, rawNode.category) || 'methods';
  const category = toText(rawData.category, rawNode.category, nodeType) || nodeType;
  const id = toText(rawNode.id, rawData.id, rawNode.key, `node-${index + 1}`);

  const node: Node = {
    ...(isPlainObject(rawNode) ? rawNode : {}),
    id,
    type: toText(rawNode.type) || 'mindmap',
    position: safePosition(rawNode.position, index),
    data: {
      ...cleanNodeData(rawData),
      label,
      nodeType,
      category,
      numberCode: numberCode || `${index + 1}.0`,
    },
  } as Node;

  return node;
};

const normalizeEdge = (rawEdge: any, index: number): Edge | null => {
  if (!isPlainObject(rawEdge)) return null;

  const source = toText(rawEdge.source);
  const target = toText(rawEdge.target);
  if (!source || !target) return null;

  return {
    ...(rawEdge as Edge),
    id: toText(rawEdge.id, `e-${source}-${target}-${index + 1}`),
    source,
    target,
    type: toText(rawEdge.type) || 'smoothstep',
    animated: rawEdge.animated ?? true,
    style: isPlainObject(rawEdge.style)
      ? {
          stroke: toText(rawEdge.style.stroke) || '#64748b',
          strokeWidth: Number(rawEdge.style.strokeWidth) || 2,
          ...(rawEdge.style.strokeDasharray ? { strokeDasharray: rawEdge.style.strokeDasharray } : {}),
        }
      : { stroke: '#64748b', strokeWidth: 2 },
  } as Edge;
};

export function sanitizeNodeDetailsMap(
  input: Record<string, any> = {},
  nodes: Array<Pick<Node, 'id' | 'data'>> = []
): Record<string, NodeDetails> {
  const result: Record<string, NodeDetails> = {};
  const safeInput = isPlainObject(input) ? input : {};
  const safeNodes = Array.isArray(nodes)
    ? nodes.filter((node): node is Pick<Node, 'id' | 'data'> => Boolean(node?.id))
    : [];
  const nodesById = new Map(safeNodes.map((node) => [node.id, node]));

  Object.entries(safeInput).forEach(([nodeId, rawDetails]) => {
    if (nodesById.size > 0 && !nodesById.has(nodeId)) return;
    const node = nodesById.get(nodeId);
    result[nodeId] = normalizeNodeDetails(nodeId, rawDetails, (node?.data as any) || {});
  });

  safeNodes.forEach((node) => {
    if (!result[node.id]) {
      result[node.id] = normalizeNodeDetails(node.id, undefined, (node.data as any) || {});
    }
  });

  return result;
}

export function sanitizeMapGraphData(
  rawNodes: unknown,
  rawEdges: unknown,
  rawDetails: unknown = {},
) {
  const warnings: string[] = [];
  const seenNodeIds = new Set<string>();
  const nodes = (Array.isArray(rawNodes) ? rawNodes : [])
    .filter(isPlainObject)
    .map((node, index) => normalizeNode(node, index))
    .filter((node) => {
      if (seenNodeIds.has(node.id)) {
        warnings.push(`Nó duplicado ignorado: ${node.id}`);
        return false;
      }
      seenNodeIds.add(node.id);
      return true;
    });

  const seenEdgeIds = new Set<string>();
  const edges = (Array.isArray(rawEdges) ? rawEdges : [])
    .map((edge, index) => normalizeEdge(edge, index))
    .filter((edge): edge is Edge => Boolean(edge))
    .filter((edge) => {
      const isValid = edge.source !== edge.target
        && seenNodeIds.has(edge.source)
        && seenNodeIds.has(edge.target)
        && !seenEdgeIds.has(edge.id);
      if (!isValid) warnings.push(`Conexão inválida ignorada: ${edge.id}`);
      if (isValid) seenEdgeIds.add(edge.id);
      return isValid;
    });

  return {
    nodes,
    edges,
    nodeDetails: sanitizeNodeDetailsMap(isPlainObject(rawDetails) ? rawDetails : {}, nodes),
    warnings,
  };
}

export function buildMapJsonExport(options: {
  title: string;
  description: string;
  visibility: MapVisibility;
  tags: string[];
  layout: MapLayoutDirection;
  nodes: Node[];
  edges: Edge[];
  nodeDetails: Record<string, any>;
}): MapJsonExport {
  const layout = options.layout || DEFAULT_LAYOUT;
  const sanitizedGraph = sanitizeMapGraphData(options.nodes, options.edges, options.nodeDetails);
  const cleanNodes = sanitizedGraph.nodes;
  const cleanEdges = sanitizedGraph.edges;

  const positionedNodes = cleanNodes.every((node) => {
    const x = Number(node.position.x);
    const y = Number(node.position.y);
    return Number.isFinite(x) && Number.isFinite(y);
  });

  const resolved = positionedNodes ?
     { nodes: cleanNodes, edges: cleanEdges }
    : getLayoutedElements(cleanNodes, cleanEdges, layout);

  const nodeDetails = sanitizeNodeDetailsMap(sanitizedGraph.nodeDetails, resolved.nodes);

  return {
    schema: 'tecnomapper.map.json',
    version: 1,
    exportedAt: new Date().toISOString(),
    title: toText(options.title) || 'Mapa sem título',
    description: toText(options.description),
    visibility: options.visibility || 'public',
    tags: options.tags || [],
    layout,
    nodes: resolved.nodes,
    edges: resolved.edges,
    node_details: nodeDetails,
  };
}

export function parseMapJsonText(text: string): MapJsonImportResult {
  const parsed = JSON.parse(text);
  if (!isPlainObject(parsed)) throw new Error('O JSON precisa conter um objeto de mapa válido.');
  const raw = parsed as RawMapJson;
  const source = isPlainObject(raw.graph) ? raw.graph : raw;

  const warnings: string[] = [];
  const title = toText(raw.title, source.title) || 'Mapa importado';
  const description = toText(raw.description, source.description);
  const visibility = raw.visibility || 'public';
  const tags = normalizeTags(raw.tags);
  const layout = raw.layout || DEFAULT_LAYOUT;

  const rawNodes = Array.isArray(source.nodes) ? source.nodes : Array.isArray(raw.nodes) ? raw.nodes : [];
  const rawEdges = Array.isArray(source.edges) ? source.edges : Array.isArray(raw.edges) ? raw.edges : [];
  const rawDetails = source.node_details || source.nodeDetails || raw.node_details || raw.nodeDetails || {};

  const sanitizedGraph = sanitizeMapGraphData(rawNodes, rawEdges, rawDetails);
  let nodes = sanitizedGraph.nodes;
  let edges = sanitizedGraph.edges;
  const nodeDetails = sanitizedGraph.nodeDetails;
  warnings.push(...sanitizedGraph.warnings);

  if (!nodes.length && Object.keys(nodeDetails).length) {
    nodes = Object.entries(nodeDetails).map(([nodeId, details], index) => ({
      id: nodeId,
      type: 'mindmap',
      position: { x: 0, y: index * 120 },
      data: {
        label: toText(typeof details.description === 'string' ? details.description.split('.')[0] : '', nodeId, `Nó ${index + 1}`) || `Nó ${index + 1}`,
        nodeType: 'methods',
        category: 'methods',
        numberCode: `${index + 1}.0`,
      },
    }));
    warnings.push('O arquivo não trouxe nós. Eles foram reconstruídos a partir dos detalhes disponíveis.');
  }

  const hasValidPositions = nodes.length > 0 && nodes.every((node) => {
    const x = Number(node.position.x);
    const y = Number(node.position.y);
    return Number.isFinite(x) && Number.isFinite(y);
  });

  if (!hasValidPositions && nodes.length > 0) {
    const laidOut = getLayoutedElements(nodes, edges, layout);
    nodes = laidOut.nodes;
    edges = laidOut.edges;
    warnings.push('Posições ausentes ou incompletas. O mapa foi reorganizado automaticamente.');
  }

  return {
    title,
    description,
    visibility,
    tags,
    layout,
    nodes,
    edges,
    nodeDetails,
    warnings,
  };
}
