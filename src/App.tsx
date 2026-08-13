import { Component, Suspense, lazy, useCallback, useMemo, useState, useEffect, useRef, type ErrorInfo, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { emptyMapTemplate } from './data';
import { getLayoutedElements } from './lib/layout';
import { MindMapNode } from './components/MindMapNode';
import { Settings2, Download, Plus, Play, Pause, ChevronRight, ChevronLeft, ChevronDown, Square, Target, ArrowLeft, Search, X, Image as ImageIcon, FileCode, Camera, Save, History, RotateCcw, Trash2, FileText, LogOut, Clock, LayoutGrid, Move, BarChart3, Sparkles, Lock, Unlock, Gauge } from 'lucide-react';
import type { NodeDetails } from './components/NodeModal';
import { Node } from '@xyflow/react';
import confetti from 'canvas-confetti';
import { nodeDetailsSeed } from './data/nodeDetails';
import { tramontinaNodeDetails } from './data/nodeDetailsTramontina';
import { corteSerrasNodeDetails } from './data/nodeDetailsCorteSerras';
import { paletesExportacaoNodeDetails } from './data/nodeDetailsPaletesExportacao';
import { serraEmmegiCriticosNodeDetails } from './data/nodeDetailsSerraEmmegiCriticos';
import { usinagemExpFomNodeDetails } from './data/nodeDetailsUsinagemExpFom';
import { paquimetro150300NodeDetails } from './data/nodeDetailsPaquimetro150300';
import { Login } from './components/Login';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { Preferences, usePreferences } from './hooks/usePreferences';
import { useAuditLog } from './hooks/useAuditLog';
import { useVersionHistory } from './hooks/useVersionHistory';
import { useToast, ToastContainer } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { useConfirm } from './hooks/useConfirm';
import { useKeyboardShortcuts, useAppShortcuts } from './hooks/useKeyboardShortcuts';
import { usePermissions } from './lib/permissions';
import { useAssessments } from './hooks/useAssessments';
import type { Assessment, AssessmentQuestion } from './types/assessments';
import { cn } from './lib/utils';
import { buildMapJsonExport, sanitizeMapGraphData, sanitizeNodeDetailsMap } from './lib/mapJson';
import { SmartConnectionEdge } from './components/SmartConnectionEdge';
import { compareHierarchyCodes, getNextHierarchyCode, getParentHierarchyCandidates, type HierarchyNumberingMode } from './lib/hierarchy';
import {
  createConnectionEdge,
  getConnectionThemeVariables,
  normalizeConnectionTheme,
  prepareConnectionEdges,
} from './lib/connectionStyles';
import {
  OPERATIONAL_VIEW_OPTIONS,
  buildOperationalBadges,
  createDefaultOperationalMetadata,
  getAdvancedNodeMeta,
  getSuggestedCategoryForAdvancedType,
  isOperationallyRelevantToView,
  normalizeOperationalMetadata,
  type OperationalModeName,
  type OperationalViewMode,
} from './lib/operationalModel';

const Dashboard = lazy(() => import('./components/Dashboard').then((module) => ({ default: module.Dashboard })));
const MarkdownView = lazy(() => import('./components/MarkdownView').then((module) => ({ default: module.MarkdownView })));
const Sector3DView = lazy(() => import('./components/Sector3DView').then((module) => ({ default: module.Sector3DView })));
const NodeModal = lazy(() => import('./components/NodeModal').then((module) => ({ default: module.NodeModal })));
const AddNodeModal = lazy(() => import('./components/AddNodeModal').then((module) => ({ default: module.AddNodeModal })));
const WorkInstructionExport = lazy(() => import('./components/WorkInstructionExport').then((module) => ({ default: module.WorkInstructionExport })));
const OperatorMode = lazy(() => import('./components/OperatorMode').then((module) => ({ default: module.OperatorMode })));
const AssessmentQuiz = lazy(() => import('./components/AssessmentQuiz').then((module) => ({ default: module.AssessmentQuiz })));
const AssessmentAdmin = lazy(() => import('./components/AssessmentAdmin').then((module) => ({ default: module.AssessmentAdmin })));
const AssessmentDashboard = lazy(() => import('./components/AssessmentDashboard').then((module) => ({ default: module.AssessmentDashboard })));
const RankingLeaderboard = lazy(() => import('./components/RankingLeaderboard').then((module) => ({ default: module.RankingLeaderboard })));
const CertificateGenerator = lazy(() => import('./components/CertificateGenerator').then((module) => ({ default: module.CertificateGenerator })));

const AppLoadingScreen = () => (
  <div className="min-h-screen bg-[#0b1220] flex items-center justify-center text-slate-200">
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-xl">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      <span className="text-sm font-semibold">Carregando módulo...</span>
    </div>
  </div>
);

type MapPanelDisplay = 'full' | 'compact' | 'hidden';

const readMapPanelDisplay = (key: string, fallback: MapPanelDisplay): MapPanelDisplay => {
  const value = window.localStorage.getItem(key);
  return value === 'full' || value === 'compact' || value === 'hidden' ? value : fallback;
};

const MAP_PANEL_DISPLAY_OPTIONS: Array<{ value: MapPanelDisplay; label: string }> = [
  { value: 'full', label: 'Completo' },
  { value: 'compact', label: 'Minimalista' },
  { value: 'hidden', label: 'Oculto' },
];

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  emptyMapTemplate.nodes,
  emptyMapTemplate.edges,
  'hierarchical'
);

class MapErrorBoundary extends Component<
  { children: ReactNode; onBack: () => void; resetKey: string },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error?.message || 'O mapa encontrou um problema inesperado.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Map rendering error:', error, info);
  }

  componentDidUpdate(previousProps: { resetKey: string }) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: '' });
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-xl rounded-2xl border border-red-500/20 bg-[#172033] p-7 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-300">Mapa interrompido</p>
          <h1 className="mt-2 text-2xl font-bold">Não foi possível exibir este mapa.</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            O restante do aplicativo continua disponível. Volte aos processos e abra o mapa novamente.
          </p>
          {this.state.message && (
            <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-slate-400">
              {this.state.message}
            </p>
          )}
          <button
            type="button"
            onClick={this.props.onBack}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Voltar aos processos
          </button>
        </div>
      </div>
    );
  }
}

const toRecoveredLabel = (nodeId: string, details: NodeDetails) => {
  const tasks = Array.isArray(details?.tasks) ? details.tasks.filter(Boolean) : [];
  const firstTask = tasks.find((task) => typeof task?.text === 'string' && task.text.trim())?.text.trim();
  const description = typeof details?.description === 'string' ? details.description : '';
  const firstSentence = description
    .split(/\.|\n|;/)
    .map((part) => part.trim())
    .find((part) => part.length > 0);
  const fallback = nodeId
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const rawLabel = firstTask || firstSentence || fallback || 'Etapa recuperada';
  return rawLabel.length > 64 ? `${rawLabel.slice(0, 61)}...` : rawLabel;
};

const normalizeRecoveredGroupKey = (nodeId: string) => {
  const firstSegment = nodeId.split('_')[0].trim().toLowerCase() || nodeId.trim().toLowerCase();

  if (firstSegment === 'root') return 'root';
  if (firstSegment === 'inputs' || firstSegment === 'in') return 'inputs';
  if (firstSegment === 'resources' || firstSegment === 'res') return 'resources';
  if (firstSegment === 'people' || firstSegment === 'pe') return 'people';
  if (firstSegment === 'methods' || firstSegment === 'met') return 'methods';
  if (firstSegment === 'outputs' || firstSegment === 'out') return 'outputs';
  if (firstSegment === 'kpis' || firstSegment === 'kpi') return 'kpis';
  if (firstSegment === 'seg' || firstSegment === 'seguranca') return 'seg';
  if (firstSegment === 'iatf') return 'iatf';

  return firstSegment;
};

const formatRecoveredGroupLabel = (groupKey: string) => {
  const eMatch = groupKey.match(/^e(\d+)$/);
  if (eMatch) return `Etapa ${eMatch[1]}`;

  const labels: Record<string, string> = {
    root: 'Processo',
    inputs: 'Entradas',
    resources: 'Recursos',
    people: 'Pessoas',
    methods: 'Métodos Operacionais',
    outputs: 'Saídas',
    kpis: 'KPIs',
    seg: 'Segurança',
    iatf: 'IATF',
  };

  if (labels[groupKey]) return labels[groupKey];

  return groupKey
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

const buildRecoveredMap = (mapTitle: string, detailsMap: Record<string, NodeDetails> | null) => {
  const detailEntries = Object.entries(detailsMap || {});
  const rootId = detailEntries.some(([id]) => id === 'root') ? 'root' : 'recovered-root';

  const rootNode: Node = {
    id: rootId,
    type: 'mindmap',
    position: { x: 0, y: 0 },
    data: {
      label: mapTitle || 'Processo Recuperado',
      nodeType: 'root',
      category: 'root',
      numberCode: '1.0',
    },
  };

  if (!detailEntries.length) {
    return {
      nodes: [rootNode],
      edges: [] as Edge[],
    };
  }

  const groupedEntries = new Map<string, Array<[string, NodeDetails]>>();
  const groupOrder: string[] = [];

  detailEntries.forEach(([id, details]) => {
    if (id === rootId) return;
    const groupKey = normalizeRecoveredGroupKey(id);
    if (!groupedEntries.has(groupKey)) {
      groupedEntries.set(groupKey, []);
      groupOrder.push(groupKey);
    }
    groupedEntries.get(groupKey)!.push([id, details]);
  });

  const orderedGroupNodes: Node[] = [];
  const recoveredEdges: Edge[] = [];
  const recoveredChildNodes: Node[] = [];
  const groupBaseX = 320;
  const childBaseX = 760;
  const groupGapY = 220;
  const childGapY = 92;

  groupOrder.forEach((groupKey, groupIndex) => {
    const entries = groupedEntries.get(groupKey) || [];
    const groupNodeId = groupKey;
    const groupNodeLabel = groupKey === 'root' ?
       mapTitle
      : formatRecoveredGroupLabel(groupKey);

    orderedGroupNodes.push({
      id: groupNodeId,
      type: 'mindmap',
      position: { x: groupBaseX, y: groupIndex * groupGapY - 420 },
      data: {
        label: groupNodeLabel,
        nodeType: groupKey === 'root' ? 'root' : 'phase',
        category: groupKey === 'root' ? 'root' : 'recovered-phase',
        numberCode: `${groupIndex + 2}.0`,
      },
    });

    recoveredEdges.push({
      id: `edge-${rootId}-${groupNodeId}`,
      source: rootId,
      target: groupNodeId,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    });

    entries.forEach(([id, details], childIndex) => {
      if (id === groupNodeId) return;

      recoveredChildNodes.push({
        id,
        type: 'mindmap',
        position: { x: childBaseX, y: groupIndex * groupGapY - 420 + childIndex * childGapY },
        data: {
          label: toRecoveredLabel(id, details),
          nodeType: 'methods',
          category: 'recovered',
          numberCode: `${groupIndex + 2}.${childIndex + 1}`,
        },
      });

      recoveredEdges.push({
        id: `edge-${groupNodeId}-${id}`,
        source: groupNodeId,
        target: id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#64748b', strokeWidth: 1.5 },
      });
    });
  });

  return {
    nodes: [
      rootNode,
      ...orderedGroupNodes,
      ...recoveredChildNodes,
    ],
    edges: recoveredEdges,
  };
};

const hasValidNodePosition = (node: any) => {
  const x = node.position.x;
  const y = node.position.y;
  return Number.isFinite(x) && Number.isFinite(y);
};

const buildEmptyNodeDetails = (nodeData: Record<string, any> = {}): NodeDetails => ({
  description: '',
  images: [],
  tasks: [],
  operational: normalizeOperationalMetadata(undefined, nodeData),
});

const getDetailNodeIds = (detailsMap: Record<string, NodeDetails> | null) =>
  Object.keys(detailsMap || {}).filter((id) => id !== 'root');

const looksLikeFlattenedHierarchy = (nodes: any[], edges: any[]) => {
  if (!nodes.length || !edges.length) return false;

  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  nodes.forEach((node) => {
    incoming.set(node.id, 0);
    outgoing.set(node.id, 0);
  });

  edges.forEach((edge) => {
    incoming.set(edge.target, (incoming.get(edge.target) || 0) + 1);
    outgoing.set(edge.source, (outgoing.get(edge.source) || 0) + 1);
  });

  const rootCandidates = nodes.filter((node) => (incoming.get(node.id) || 0) === 0);
  if (rootCandidates.length !== 1) return false;

  const rootId = rootCandidates[0].id;
  const rootChildren = edges.filter((edge) => edge.source === rootId).length;
  const internalParentCount = Array.from(outgoing.entries()).filter(([id, count]) => id !== rootId && count > 0).length;
  const totalNodesWithoutRoot = Math.max(1, nodes.length - 1);

  return rootChildren >= Math.max(10, Math.floor(totalNodesWithoutRoot * 0.6))
    && internalParentCount <= Math.max(2, Math.floor(totalNodesWithoutRoot * 0.1));
};

const RECOVERY_V2_MAJOR_ORDER = [
  'inputs',
  'resources',
  'people',
  'methods',
  'outputs',
  'kpis',
  'safety',
  'quality',
  'compliance',
  'others',
] as const;

const RECOVERY_V2_MAJOR_LABELS: Record<string, string> = {
  inputs: 'Entradas',
  resources: 'Recursos',
  people: 'Pessoas',
  methods: 'Metodos Operacionais',
  outputs: 'Saidas',
  kpis: 'KPIs',
  safety: 'Seguranca',
  quality: 'Qualidade',
  compliance: 'Conformidade',
  others: 'Detalhes Complementares',
};

type RecoveredLeafV2 = {
  id: string;
  details: NodeDetails;
  majorKey: string;
  subgroupKey: string | null;
  subgroupLabel: string | null;
  explicitSubgroup: boolean;
  sourceIndex: number;
};

const normalizeRecoveryKeyV2 = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toTitleCaseV2 = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const getRecoveryMajorKeyV2 = (parseKey: string) => {
  const first = parseKey.split('_')[0] || parseKey;
  if (first === 'inputs' || first === 'in') return 'inputs';
  if (first === 'resources' || first === 'res') return 'resources';
  if (first === 'people' || first === 'pe' || first === 'peo') return 'people';
  if (first === 'methods' || first === 'met') return 'methods';
  if (first === 'outputs' || first === 'out') return 'outputs';
  if (first === 'kpis' || first === 'kpi') return 'kpis';
  if (first === 'safety' || first === 'saf' || first === 'seg') return 'safety';
  if (first === 'quality' || first === 'qua') return 'quality';
  if (first === 'iatf') return 'compliance';
  if (/^e\d+$/.test(first)) return 'methods';
  return 'others';
};

const getRecoverySubgroupV2 = (parseKey: string, majorKey: string) => {
  const tokens = parseKey.split('_').filter(Boolean);
  const first = tokens[0] || parseKey;

  const eMatch = first.match(/^e(\d+)$/);
  if (eMatch) {
    return {
      subgroupKey: `stage_${eMatch[1]}`,
      subgroupLabel: `Etapa ${eMatch[1]}`,
      explicitSubgroup: true,
    };
  }

  if (majorKey === 'methods' && tokens.length > 1 && first === 'met') {
    return {
      subgroupKey: `met_${tokens[1] || 'detalhe'}`,
      subgroupLabel: toTitleCaseV2(tokens[1] || 'Detalhes'),
      explicitSubgroup: false,
    };
  }

  if (majorKey === 'inputs' && tokens.length > 1 && first === 'in') {
    return {
      subgroupKey: `in_${tokens[1] || 'detalhe'}`,
      subgroupLabel: toTitleCaseV2(tokens[1] || 'Detalhes'),
      explicitSubgroup: false,
    };
  }

  if (majorKey === 'resources' && tokens.length > 1 && first === 'res') {
    return {
      subgroupKey: `res_${tokens[1] || 'detalhe'}`,
      subgroupLabel: toTitleCaseV2(tokens[1] || 'Detalhes'),
      explicitSubgroup: false,
    };
  }

  if (majorKey === 'outputs' && tokens.length > 1 && first === 'out') {
    return {
      subgroupKey: `out_${tokens[1] || 'detalhe'}`,
      subgroupLabel: toTitleCaseV2(tokens[1] || 'Detalhes'),
      explicitSubgroup: false,
    };
  }

  if (majorKey === 'kpis' && tokens.length > 1 && first === 'kpi') {
    return {
      subgroupKey: `kpi_${tokens[1] || 'detalhe'}`,
      subgroupLabel: toTitleCaseV2(tokens[1] || 'Detalhes'),
      explicitSubgroup: false,
    };
  }

  return {
    subgroupKey: null,
    subgroupLabel: null,
    explicitSubgroup: false,
  };
};

const getMajorSortWeightV2 = (majorKey: string) => {
  const idx = RECOVERY_V2_MAJOR_ORDER.indexOf(majorKey as any);
  return idx >= 0 ? idx : RECOVERY_V2_MAJOR_ORDER.length + 1;
};

const buildRecoveredMapV2 = (mapTitle: string, detailsMap: Record<string, NodeDetails> | null) => {
  const detailEntries = Object.entries(detailsMap || {});
  const rootId = detailEntries.some(([id]) => id === 'root') ? 'root' : 'recovered-root';

  const rootNode: Node = {
    id: rootId,
    type: 'mindmap',
    position: { x: 0, y: 0 },
    data: {
      label: mapTitle || 'Processo Recuperado',
      nodeType: 'root',
      category: 'root',
      numberCode: '1.0',
    },
  };

  if (!detailEntries.length) {
    return { nodes: [rootNode], edges: [] as Edge[] };
  }

  const majorDetails = new Map<string, NodeDetails>();
  const leaves: RecoveredLeafV2[] = [];

  detailEntries.forEach(([id, details], sourceIndex) => {
    if (id === rootId) return;

    const parseKey = normalizeRecoveryKeyV2(id);
    const majorKey = getRecoveryMajorKeyV2(parseKey);
    const subgroup = getRecoverySubgroupV2(parseKey, majorKey);

    if (parseKey === majorKey || id === majorKey) {
      majorDetails.set(majorKey, details);
      return;
    }

    leaves.push({
      id,
      details,
      majorKey,
      subgroupKey: subgroup.subgroupKey,
      subgroupLabel: subgroup.subgroupLabel,
      explicitSubgroup: subgroup.explicitSubgroup,
      sourceIndex,
    });
  });

  const majorKeys = Array.from(new Set([...Array.from(majorDetails.keys()), ...leaves.map((leaf) => leaf.majorKey)])).sort((a, b) => {
    const weightA = getMajorSortWeightV2(a);
    const weightB = getMajorSortWeightV2(b);
    if (weightA !== weightB) return weightA - weightB;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  const usedIds = new Set<string>([rootId, ...leaves.map((leaf) => leaf.id)]);
  const nodes: Node[] = [rootNode];
  const edges: Edge[] = [];

  const uniqueId = (baseId: string) => {
    let candidate = baseId;
    let index = 1;
    while (usedIds.has(candidate)) {
      candidate = `${baseId}_${index}`;
      index += 1;
    }
    usedIds.add(candidate);
    return candidate;
  };

  const groupBaseX = 320;
  const subgroupBaseX = 640;
  const leafBaseX = 960;
  const majorGapY = 260;
  const subgroupGapY = 120;
  const leafGapY = 90;

  majorKeys.forEach((majorKey, majorIndex) => {
    const majorNumber = majorIndex + 2;
    const majorNodeId = usedIds.has(majorKey) ? uniqueId(`group_${majorKey}`) : majorKey;
    const majorLabel = majorDetails.has(majorKey) ?
       toRecoveredLabel(majorKey, majorDetails.get(majorKey))
      : (RECOVERY_V2_MAJOR_LABELS[majorKey] || toTitleCaseV2(majorKey));

    nodes.push({
      id: majorNodeId,
      type: 'mindmap',
      position: { x: groupBaseX, y: majorIndex * majorGapY - 420 },
      data: {
        label: majorLabel,
        nodeType: 'phase',
        category: 'recovered-phase',
        numberCode: `${majorNumber}.0`,
      },
    });

    edges.push({
      id: `edge-${rootId}-${majorNodeId}`,
      source: rootId,
      target: majorNodeId,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    });

    const majorLeaves = leaves
      .filter((leaf) => leaf.majorKey === majorKey)
      .sort((a, b) => a.sourceIndex - b.sourceIndex);

    const subgroupCounts = new Map<string, number>();
    majorLeaves.forEach((leaf) => {
      if (!leaf.subgroupKey) return;
      subgroupCounts.set(leaf.subgroupKey, (subgroupCounts.get(leaf.subgroupKey) || 0) + 1);
    });

    const forceSubgroups = majorLeaves.length > 6;
    const subgroupMap = new Map<string, RecoveredLeafV2[]>();
    const directLeaves: RecoveredLeafV2[] = [];

    majorLeaves.forEach((leaf) => {
      const subgroupKey = leaf.subgroupKey;
      const subgroupCount = subgroupKey ? (subgroupCounts.get(subgroupKey) || 0) : 0;
      const useSubgroup = Boolean(subgroupKey && (leaf.explicitSubgroup || forceSubgroups || subgroupCount > 1));
      if (!useSubgroup || !subgroupKey) {
        directLeaves.push(leaf);
        return;
      }
      if (!subgroupMap.has(subgroupKey)) subgroupMap.set(subgroupKey, []);
      subgroupMap.get(subgroupKey)!.push(leaf);
    });

    const orderedSubgroups = Array.from(subgroupMap.entries()).sort(([a], [b]) => {
      const aStage = a.match(/^stage_(\d+)$/);
      const bStage = b.match(/^stage_(\d+)$/);
      if (aStage && bStage) return Number(aStage[1]) - Number(bStage[1]);
      if (aStage) return -1;
      if (bStage) return 1;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    let subIndex = 1;
    let subY = majorIndex * majorGapY - 420;

    orderedSubgroups.forEach(([subgroupKey, subgroupLeaves]) => {
      const subgroupId = uniqueId(`sub_${majorKey}_${subgroupKey}`);
      const subgroupLabel = subgroupLeaves[0].subgroupLabel || toTitleCaseV2(subgroupKey);
      nodes.push({
        id: subgroupId,
        type: 'mindmap',
        position: { x: subgroupBaseX, y: subY },
        data: {
          label: subgroupLabel,
          nodeType: 'methods',
          category: 'recovered-subgroup',
          numberCode: `${majorNumber}.${subIndex}`,
        },
      });

      edges.push({
        id: `edge-${majorNodeId}-${subgroupId}`,
        source: majorNodeId,
        target: subgroupId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#3b82f6', strokeWidth: 1.7 },
      });

      subgroupLeaves.forEach((leaf, leafIndex) => {
        nodes.push({
          id: leaf.id,
          type: 'mindmap',
          position: { x: leafBaseX, y: subY + leafIndex * leafGapY },
          data: {
            label: toRecoveredLabel(leaf.id, leaf.details),
            nodeType: 'methods',
            category: 'recovered',
            numberCode: `${majorNumber}.${subIndex}.${leafIndex + 1}`,
          },
        });

        edges.push({
          id: `edge-${subgroupId}-${leaf.id}`,
          source: subgroupId,
          target: leaf.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#64748b', strokeWidth: 1.4 },
        });
      });

      subY += Math.max(subgroupGapY, subgroupLeaves.length * leafGapY);
      subIndex += 1;
    });

    directLeaves.forEach((leaf, leafIndex) => {
      nodes.push({
        id: leaf.id,
        type: 'mindmap',
        position: { x: subgroupBaseX, y: majorIndex * majorGapY - 420 + leafIndex * leafGapY },
        data: {
          label: toRecoveredLabel(leaf.id, leaf.details),
          nodeType: 'methods',
          category: 'recovered',
          numberCode: `${majorNumber}.${subIndex + leafIndex}`,
        },
      });

      edges.push({
        id: `edge-${majorNodeId}-${leaf.id}`,
        source: majorNodeId,
        target: leaf.id,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#64748b', strokeWidth: 1.5 },
      });
    });
  });

  return { nodes, edges };
};

function Flow({ mapId, mapTitle, onBack, currentUser, assessmentRefreshToken, preferences }: { mapId: string, mapTitle: string, onBack: () => void, currentUser: { id: string; name: string; email: string; role: string } | null, assessmentRefreshToken: number, preferences: Preferences }) {
  const { setCenter, fitView, getNodes, getEdges } = useReactFlow();
  
  const [layoutMode, setLayoutMode] = useState<'manual' | 'auto'>('auto');
  const [positionsLocked, setPositionsLocked] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [isMapDirty, setIsMapDirty] = useState(false);
  const [isSavingMap, setIsSavingMap] = useState(false);
  const [mapDescription, setMapDescription] = useState('');
  const [mapTags, setMapTags] = useState<string[]>([]);
  const [mapVisibility, setMapVisibility] = useState<'public' | 'departments' | 'private'>('public');
  const [mapWorkflowStatus, setMapWorkflowStatus] = useState<string | null>(null);
  const [mapCreatedBy, setMapCreatedBy] = useState<string | null>(null);
  
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [creationCoachDismissed, setCreationCoachDismissed] = useState(false);
  
  // Presentation State
  const [hoveredNodePosition, setHoveredNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [presentationPath, setPresentationPath] = useState<string[]>([]);
  const [presentationIndex, setPresentationIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [presentationGuidedMode, setPresentationGuidedMode] = useState(() => (
    window.localStorage.getItem('tecno-presentation-mode') !== 'traditional'
  ));
  const [presentationAutoPlay, setPresentationAutoPlay] = useState(true);
  const [presentationSpeed, setPresentationSpeed] = useState(() => {
    const savedSpeed = Number(window.localStorage.getItem('tecno-presentation-speed'));
    return Number.isFinite(savedSpeed) && savedSpeed > 0 ? savedSpeed : 0.85;
  });
  const [presentationVisibleCharacters, setPresentationVisibleCharacters] = useState(0);
  const [presentationProgress, setPresentationProgress] = useState(0);
  const presentationCollapsedStateRef = useRef<string[]>([]);
  const presentationAdvanceTimerRef = useRef<number | null>(null);
  const presentationVisibleCharactersRef = useRef(0);
  const presentationNarrativeNodeRef = useRef<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<OperationalViewMode>('technical');
  const [focusViewOnly, setFocusViewOnly] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number, y: number } | null>(null);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<string[]>([]);
  const [operationalMetricFilter, setOperationalMetricFilter] = useState<'ctq' | 'audit' | 'risk' | 'evidence' | 'troubleshooting' | null>(null);
  const [mobileInsightsOpen, setMobileInsightsOpen] = useState(false);
  const [technicalPanelDisplay, setTechnicalPanelDisplay] = useState<MapPanelDisplay>(() => readMapPanelDisplay('tecno-map-technical-panel', 'full'));
  const [minimapDisplay, setMinimapDisplay] = useState<MapPanelDisplay>(() => readMapPanelDisplay('tecno-map-minimap', 'full'));
  const [toolsPanelDisplay, setToolsPanelDisplay] = useState<MapPanelDisplay>(() => readMapPanelDisplay('tecno-map-tools-panel', 'full'));
  const [isVisualOptionsOpen, setIsVisualOptionsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Assessment State
  const [showAssessmentQuiz, setShowAssessmentQuiz] = useState(false);
  const [showAssessmentAdmin, setShowAssessmentAdmin] = useState(false);
  const [showAssessmentDashboard, setShowAssessmentDashboard] = useState(false);
  const [showRankingLeaderboard, setShowRankingLeaderboard] = useState(false);
  const [certificateTarget, setCertificateTarget] = useState<{ attemptId: string; userId: string } | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>([]);
  const [localAssessmentRefreshToken, setLocalAssessmentRefreshToken] = useState(0);
  const {
    fetchAssessments,
    fetchQuestions,
    assessments,
    loading: assessmentsLoading
  } = useAssessments();

  useEffect(() => {
    if (mapId) {
      fetchAssessments(mapId, false, true);
    }
  }, [mapId, fetchAssessments, assessmentRefreshToken]);

  const handleStartAssessment = useCallback(async (assessment: Assessment) => {
    if (!currentUser?.id) {
      alert('Faça login para realizar uma avaliação.');
      return;
    }

    const questions = await fetchQuestions(assessment.id);
    if (!questions.length) {
      alert('Esta avaliação ainda não possui questões publicadas. Avise a administração.');
      return;
    }

    setSelectedAssessment(assessment);
    setAssessmentQuestions(questions);
    setShowAssessmentQuiz(true);
  }, [currentUser?.id, fetchQuestions]);

  // Toast notifications
  const { toasts, removeToast, success, warning } = useToast();
  
  // Confirm modal state
  const { confirm, confirmState, closeConfirm, handleConfirm } = useConfirm();
  
  // Centralized permissions
  const perms = usePermissions(currentUser as any);
  const [nodeDetailsMap, setNodeDetailsMap] = useState<Record<string, NodeDetails>>(nodeDetailsSeed);
  const [writingSuggestionsEnabled, setWritingSuggestionsEnabled] = useState(() => localStorage.getItem('tecno-writing-suggestions') !== 'off');
  const suggestionCorpus = useMemo(() => {
    const texts: string[] = [];
    nodes.forEach((node) => {
      const label = typeof node?.data?.label === 'string' ? node.data.label.trim() : '';
      if (label) texts.push(label);
    });
    Object.values(nodeDetailsMap).forEach((details) => {
      if (typeof details?.description === 'string' && details.description.trim()) texts.push(details.description);
      (Array.isArray(details?.tasks) ? details.tasks : []).forEach((task) => {
        if (typeof task?.text === 'string' && task.text.trim()) texts.push(task.text);
        (Array.isArray(task?.howTo) ? task.howTo : []).forEach((step) => {
          if (typeof step?.instruction === 'string' && step.instruction.trim()) texts.push(step.instruction);
        });
      });
    });
    return texts;
  }, [nodes, nodeDetailsMap]);

  const handleWritingSuggestionsEnabledChange = useCallback((enabled: boolean) => {
    setWritingSuggestionsEnabled(enabled);
    localStorage.setItem('tecno-writing-suggestions', enabled ? 'on' : 'off');
  }, []);

  // Restrict node position changes for users without edit permission
  const handleNodesChange = useCallback((changes: any) => {
    if (!perms.can.editNode) {
      // Only allow selection changes, not position changes
      const selectionOnlyChanges = changes.filter((change: any) => 
        change.type === 'select' || change.type === 'unselect'
      );
      onNodesChange(selectionOnlyChanges);
    } else {
      const changedPosition = changes.some((change: any) => change.type === 'position' || change.type === 'dimensions');
      if (changedPosition) {
        setLayoutMode('manual');
        setIsMapDirty(true);
      }
      onNodesChange(changes);
    }
  }, [perms.can.editNode, onNodesChange]);

  const handleEdgesChange = useCallback((changes: any) => {
    if (changes.some((change: any) => change.type !== 'select')) {
      setIsMapDirty(true);
    }
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // Auto-arrange function
  const handleAutoLayout = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = getLayoutedElements(nodes, edges, preferences.defaultMapLayout || 'LR');
    setNodes(newNodes);
    setEdges(newEdges);
    setLayoutMode('auto');
    setPositionsLocked(true);
    setIsMapDirty(true);
    window.setTimeout(() => fitView({ duration: 800, padding: 0.25 }), 60);
  }, [nodes, edges, preferences.defaultMapLayout, setNodes, setEdges, fitView]);

  const togglePositionLock = useCallback(() => {
    setPositionsLocked((locked) => {
      const nextLocked = !locked;
      if (!nextLocked) setLayoutMode('manual');
      return nextLocked;
    });
  }, []);
  
  // Delete node function - admins always can, creators can when in review/needs_revision
  const handleDeleteNode = useCallback((nodeId: string) => {
    const isAdmin = perms.can.deleteNode;
    const isCreator = currentUser?.id === mapCreatedBy;
    const isEditableStatus = mapWorkflowStatus === 'review' || mapWorkflowStatus === 'needs_revision' || mapWorkflowStatus === 'draft';
    
    if (!isAdmin && !(isCreator && isEditableStatus)) {
      alert('Você não tem permissão para excluir nós. Apenas administradores ou o criador, durante a revisão, podem realizar esta ação.');
      return;
    }
    
    // Remove node
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    
    // Remove connected edges
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setIsMapDirty(true);
    
    success('Nó excluído', 'O nó foi removido com sucesso');
  }, [perms.can.deleteNode, currentUser?.id, mapCreatedBy, mapWorkflowStatus, setNodes, setEdges, success]);
  
  // Delete node with confirmation
  const handleDeleteNodeWithConfirm = useCallback(async (nodeId: string) => {
    const confirmed = await confirm({
      title: 'EXCLUIR NÓ',
      message: 'Esta ação ir EXCLUIR este n permanentemente.\n\nEsta ação NO pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    
    if (confirmed) {
      handleDeleteNode(nodeId);
    }
  }, [confirm, handleDeleteNode]);

  const isGuidedMode = viewMode === 'operator' || viewMode === 'training';
  const currentViewMeta = useMemo(
    () => OPERATIONAL_VIEW_OPTIONS.find((item) => item.value === viewMode) || OPERATIONAL_VIEW_OPTIONS[0],
    [viewMode],
  );

  useEffect(() => {
    if (viewMode === 'technical' || isGuidedMode) {
      setFocusViewOnly(false);
      return;
    }
    setFocusViewOnly(true);
  }, [viewMode, isGuidedMode]);

  const hierarchyMaps = useMemo(() => {
    const children = new Map<string, string[]>();
    const parents = new Map<string, string>();
    const nodeIds = new Set(nodes.map((node) => node.id));
    const incoming = new Map<string, string[]>();
    const codeIndex = new Map<string, string>();

    nodes.forEach((node) => {
      const code = String((node.data as any)?.numberCode || '').trim();
      if (code && !codeIndex.has(code)) codeIndex.set(code, node.id);
    });
    edges.forEach((edge) => {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) return;
      const sources = incoming.get(edge.target) || [];
      sources.push(edge.source);
      incoming.set(edge.target, sources);
    });

    const rootNode = nodes.find((node) => {
      const code = String((node.data as any)?.numberCode || '').trim();
      return node.id === 'root' || String((node.data as any)?.nodeType || '').toLowerCase() === 'root' || code === '1.0';
    });

    nodes.forEach((node) => {
      if (node.id === rootNode?.id) return;
      const code = String((node.data as any)?.numberCode || '').trim();
      const codeParts = code.split('.').filter(Boolean);
      let parentId: string | undefined;

      if (codeParts.length === 2 && codeParts[1] === '0') {
        parentId = rootNode?.id;
      } else {
        parentId = getParentHierarchyCandidates(code)
          .map((candidate) => codeIndex.get(candidate))
          .find(Boolean);
      }

      if (!parentId) parentId = (incoming.get(node.id) || [])[0];
      if (!parentId && rootNode) parentId = rootNode.id;
      if (!parentId || parentId === node.id) return;

      parents.set(node.id, parentId);
      const current = children.get(parentId) || [];
      if (!current.includes(node.id)) current.push(node.id);
      children.set(parentId, current);
    });

    return { children, parents };
  }, [nodes, edges]);

  const childMap = hierarchyMaps.children;
  const parentMap = hierarchyMaps.parents;

  const presentationActiveNodeId = isPresenting ? presentationPath[presentationIndex] : undefined;
  const presentationContextNodeIds = useMemo(() => {
    const context = new Set<string>();
    if (!presentationActiveNodeId) return context;

    context.add(presentationActiveNodeId);
    (childMap.get(presentationActiveNodeId) || []).forEach((childId) => context.add(childId));

    let cursor = parentMap.get(presentationActiveNodeId);
    const guard = new Set<string>();
    while (cursor && !guard.has(cursor)) {
      guard.add(cursor);
      context.add(cursor);
      cursor = parentMap.get(cursor);
    }

    return context;
  }, [presentationActiveNodeId, childMap, parentMap]);

  const hiddenNodeIds = useMemo(() => {
    const hidden = new Set<string>();
    const visit = (nodeId: string) => {
      const children = childMap.get(nodeId) || [];
      children.forEach((childId) => {
        if (hidden.has(childId)) return;
        hidden.add(childId);
        visit(childId);
      });
    };
    collapsedNodeIds.forEach(visit);
    return hidden;
  }, [childMap, collapsedNodeIds]);

  const metricRelevantNodeIds = useMemo(() => {
    if (!operationalMetricFilter) return null;

    const relevant = new Set<string>();
    nodes.forEach((node) => {
      const details = nodeDetailsMap[node.id] || buildEmptyNodeDetails((node.data as any) || undefined);
      const operational = normalizeOperationalMetadata(details.operational, (node.data as any) || undefined);
      const matches =
        (operationalMetricFilter === 'ctq' && (operational.ctq || operational.nodeTypeAdvanced === 'ctq'))
        || (operationalMetricFilter === 'audit' && (operational.auditRequired || operational.nodeTypeAdvanced === 'audit'))
        || (operationalMetricFilter === 'risk' && ['high', 'critical'].includes(operational.riskLevel))
        || (operationalMetricFilter === 'evidence' && operational.requiresEvidence)
        || (operationalMetricFilter === 'troubleshooting' && (
          operational.nodeTypeAdvanced === 'troubleshooting'
          || operational.troubleshooting.commonFailures.length > 0
        ));

      if (!matches) return;
      relevant.add(node.id);

      let cursor = parentMap.get(node.id);
      const guard = new Set<string>();
      while (cursor && !guard.has(cursor)) {
        guard.add(cursor);
        relevant.add(cursor);
        cursor = parentMap.get(cursor);
      }
    });

    return relevant;
  }, [operationalMetricFilter, nodes, nodeDetailsMap, parentMap]);

  const toggleCollapseForNode = useCallback((nodeId: string) => {
    setCollapsedNodeIds((prev) => (
      prev.includes(nodeId) ?
         prev.filter((entry) => entry !== nodeId)
        : [...prev, nodeId]
    ));
    window.setTimeout(() => fitView({ duration: 500, padding: 0.22 }), 40);
  }, [fitView]);

  const nodesWithAdminProps = useMemo(() => {
    return nodes.map((node) => {
      const nodeDetails = nodeDetailsMap[node.id] || buildEmptyNodeDetails((node.data as any) || undefined);
      const operational = normalizeOperationalMetadata(nodeDetails.operational, (node.data as any) || undefined);
      const isRelevant = isOperationallyRelevantToView(operational, viewMode);
      const shouldLensHighlight = !isGuidedMode && viewMode !== 'technical';
      const shouldMetricHighlight = Boolean(operationalMetricFilter && metricRelevantNodeIds);
      const existingFocus = Boolean((node.data as any).isFocus);
      const existingMuted = Boolean((node.data as any).isMuted);

      return {
        ...node,
        data: {
          ...node.data,
          operational,
          nodeTypeAdvanced: operational.nodeTypeAdvanced,
          severity: operational.severity,
          riskLevel: operational.riskLevel,
          ctq: operational.ctq,
          auditRequired: operational.auditRequired,
          requiresEvidence: operational.requiresEvidence,
          requiresApproval: operational.requiresApproval,
          visualPriority: operational.visualPriority,
          inspectionFrequency: operational.inspectionFrequency,
          childCount: (childMap.get(node.id) || []).length,
          isCollapsed: collapsedNodeIds.includes(node.id),
          onToggleCollapse: toggleCollapseForNode,
          isAdmin: perms.isAdmin,
          isPresenting,
          isFocus: isPresenting
            ? node.id === presentationActiveNodeId
            : shouldMetricHighlight
              ? metricRelevantNodeIds!.has(node.id)
              : existingFocus || (shouldLensHighlight && isRelevant),
          isMuted: isPresenting
            ? !presentationContextNodeIds.has(node.id)
            : shouldMetricHighlight
              ? !metricRelevantNodeIds!.has(node.id)
              : existingMuted || (shouldLensHighlight && !isRelevant),
          onDeleteConfirm: handleDeleteNodeWithConfirm,
        },
      };
    });
  }, [nodes, nodeDetailsMap, viewMode, perms.isAdmin, isPresenting, isGuidedMode, handleDeleteNodeWithConfirm, childMap, collapsedNodeIds, toggleCollapseForNode, operationalMetricFilter, metricRelevantNodeIds, presentationActiveNodeId, presentationContextNodeIds]);

  const viewRelevantNodeIds = useMemo(() => {
    if (!focusViewOnly || viewMode === 'technical' || isGuidedMode) return null;

    const relevantIds = new Set<string>();
    const relevantNodes = nodesWithAdminProps.filter((node) => {
      const operational = normalizeOperationalMetadata((node.data as any).operational, (node.data as any) || undefined);
      return isOperationallyRelevantToView(operational, viewMode);
    });

    relevantNodes.forEach((node) => {
      relevantIds.add(node.id);
      let cursor = parentMap.get(node.id);
      const guard = new Set<string>();
      while (cursor && !guard.has(cursor)) {
        guard.add(cursor);
        relevantIds.add(cursor);
        cursor = parentMap.get(cursor);
      }
    });

    nodesWithAdminProps.forEach((node) => {
      const nodeType = String((node.data as any).nodeType || '').toLowerCase();
      const numberCode = String((node.data as any).numberCode || '');
      if (nodeType === 'root' || numberCode === '1.0') {
        relevantIds.add(node.id);
      }
    });

    return relevantIds;
  }, [focusViewOnly, viewMode, isGuidedMode, nodesWithAdminProps, parentMap]);

  const baseVisibleNodes = useMemo(() => {
    return nodesWithAdminProps.filter((node) => {
      // Presentation always owns visibility so every item in its complete
      // hierarchy path can be focused, regardless of collapsed/view filters.
      if (isPresenting) return true;
      if (hiddenNodeIds.has(node.id)) return false;
      if (!viewRelevantNodeIds) return true;
      return viewRelevantNodeIds.has(node.id);
    });
  }, [nodesWithAdminProps, hiddenNodeIds, viewRelevantNodeIds, isPresenting]);

  const visibleNodes = useMemo(() => {
    if (!positionsLocked || !collapsedNodeIds.length || baseVisibleNodes.length <= 1) return baseVisibleNodes;
    const visibleIds = new Set(baseVisibleNodes.map((node) => node.id));
    const layoutEdges = edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
    return getLayoutedElements(baseVisibleNodes, layoutEdges, 'hierarchical').nodes;
  }, [baseVisibleNodes, collapsedNodeIds.length, edges, positionsLocked]);

  // Calculate smart tooltip position to keep it on screen
  const getTooltipPosition = () => {
    if (!hoverPosition) return { left: 0, top: 0 };

    const tooltipWidth = 480;
    const tooltipHeight = 300; // estimated max height
    const padding = 20;

    let left = hoverPosition.x;
    let top = hoverPosition.y - tooltipHeight - padding;

    // Prevent going off left edge
    if (left - tooltipWidth / 2 < padding) {
      left = tooltipWidth / 2 + padding;
    }
    // Prevent going off right edge
    if (left + tooltipWidth / 2 > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth / 2 - padding;
    }
    // If too close to top, show below the cursor instead
    if (top < padding) {
      top = hoverPosition.y + padding;
    }

    return { left, top };
  };

  const tooltipPos = getTooltipPosition();

  const sanitizeNodesForSave = useCallback((items: Node[]) => {
    return items.map((node) => {
      const { selected, dragging, measured, ...cleanNode } = node as any;
      const {
        isAdmin,
        isPresenting,
        onDelete,
        onDeleteConfirm,
        isFocus,
        isMuted,
        childCount,
        isCollapsed,
        onToggleCollapse,
        ...cleanData
      } = (node.data || {}) as any;

      return {
        ...cleanNode,
        position: {
          x: Math.round(node.position.x || 0),
          y: Math.round(node.position.y || 0),
        },
        data: cleanData,
      };
    });
  }, []);

  const sanitizeEdgesForSave = useCallback((items: Edge[]) => {
    return items.map((edge) => {
      const { selected, animated, ...cleanEdge } = edge as any;
      if (cleanEdge.data && typeof cleanEdge.data === 'object') {
        const { isActive, isHovered, hierarchyHint, ...cleanData } = cleanEdge.data as Record<string, unknown>;
        cleanEdge.data = cleanData;
      }
      return cleanEdge;
    });
  }, []);

  const handleSaveMap = useCallback(async () => {
    if (!mapId) return;

    setIsSavingMap(true);
    try {
      const { supabase } = await import('./lib/supabase');
      // Persist the complete graph. React Flow's getNodes/getEdges only reflects
      // the currently rendered subset when branches are collapsed.
      const cleanNodes = sanitizeNodesForSave(nodes as Node[]);
      const cleanEdges = sanitizeEdgesForSave(edges as Edge[]);
      const cleanNodeDetails = sanitizeNodeDetailsMap(nodeDetailsMap, cleanNodes);

      const payload = {
        nodes: cleanNodes,
        edges: cleanEdges,
        node_details: cleanNodeDetails,
      };

      let saveError: any = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        let error: any = null;
        try {
          const result = await supabase
            .from('process_items')
            .update(payload)
            .eq('id', mapId);
          error = result.error;
        } catch (requestError) {
          error = requestError;
        }

        if (!error) {
          saveError = null;
          break;
        }

        saveError = error;
        const message = String(error?.message || '').toLowerCase();
        const isTemporaryNetworkError = (
          message.includes('networkerror')
          || message.includes('failed to fetch')
          || message.includes('fetch resource')
          || !navigator.onLine
        );
        if (!isTemporaryNetworkError || attempt === 2) break;
        await new Promise((resolve) => window.setTimeout(resolve, 700 * (attempt + 1)));
      }

      if (saveError) throw saveError;

      setNodes(cleanNodes as any);
      setEdges(cleanEdges as any);
      setIsMapDirty(false);
      setLayoutMode('manual');
      success('Mapa salvo', 'As posições, nós e conexões foram salvos no banco.');
    } catch (err: any) {
      console.error('Error saving map layout:', err);
      const message = String(err?.message || '');
      const isNetworkError = (
        message.toLowerCase().includes('networkerror')
        || message.toLowerCase().includes('failed to fetch')
        || message.toLowerCase().includes('fetch resource')
        || !navigator.onLine
      );
      warning(
        isNetworkError ? 'Conexão instável' : 'Erro ao salvar',
        isNetworkError
          ? 'O mapa continua aberto e suas alterações estão pendentes. Verifique a internet e toque em Salvar novamente.'
          : message || 'Não foi possível salvar o mapa no banco.',
        8000,
      );
    } finally {
      setIsSavingMap(false);
    }
  }, [mapId, nodes, edges, nodeDetailsMap, sanitizeNodesForSave, sanitizeEdgesForSave, setNodes, setEdges, success, warning]);

  useEffect(() => {
    if (!preferences.autoSave || !isMapDirty || isSavingMap) return;
    const timeout = window.setTimeout(() => {
      handleSaveMap();
    }, 30000);

    return () => window.clearTimeout(timeout);
  }, [preferences.autoSave, isMapDirty, isSavingMap, handleSaveMap]);
  
  // Load nodes and edges from Supabase when mapId changes
  useEffect(() => {
    if (!mapId) return;
    let cancelled = false;

    setCreationCoachDismissed(false);
    setSelectedNodeId(null);
    setSelectedNodeData(null);
    setHoveredNode(null);
    setHoverPosition(null);
    setOperationalMetricFilter(null);
    
    const loadMapData = async () => {
      try {
        const { supabase } = await import('./lib/supabase');
        const { data, error } = await supabase
          .from('process_items')
          .select('nodes, edges, title, description, tags, visibility, node_details, workflow_status, created_by')
          .eq('id', mapId)
          .single();

        if (cancelled) return;
        
        if (error) {
          console.error('Error loading map data:', error);
          return;
        }
        
        if (data) {
          const sanitizedGraph = sanitizeMapGraphData(data.nodes, data.edges, data.node_details);
          const loadedNodes = sanitizedGraph.nodes;
          const loadedEdges = sanitizedGraph.edges;
          const normalizedDataTitle = String(data.title || '').toLowerCase();
          const normalizedMapTitle = String(mapTitle || '').toLowerCase();
          const hasPersistedNodeDetails = Boolean(
            data.node_details
            && typeof data.node_details === 'object'
            && !Array.isArray(data.node_details)
            && Object.keys(data.node_details).length > 0
          );
          const savedNodeDetails = Object.keys(sanitizedGraph.nodeDetails).length
            ? sanitizedGraph.nodeDetails
            : null;
          setMapDescription(typeof data.description === 'string' ? data.description : '');
          setMapTags(Array.isArray(data.tags) ? data.tags.filter((tag: any) => typeof tag === 'string') : []);
          setMapVisibility(data.visibility === 'departments' || data.visibility === 'private' ? data.visibility : 'public');
          const hasGraph = loadedNodes.length > 0;
          const expectedDetailIds = getDetailNodeIds(savedNodeDetails);
          const loadedNodeIds = new Set(loadedNodes.map((node: any) => String(node.id || '')));
          const missingDetailIds = expectedDetailIds.filter((id) => !loadedNodeIds.has(id));
          const flattenedHierarchy = hasGraph && looksLikeFlattenedHierarchy(loadedNodes, loadedEdges);
          const shouldRestoreFromDocs = !hasGraph || missingDetailIds.length > 0 || (flattenedHierarchy && expectedDetailIds.length > 8);
          const baseGraph = shouldRestoreFromDocs ?
             buildRecoveredMapV2(data.title || mapTitle, savedNodeDetails)
            : { nodes: loadedNodes, edges: loadedEdges };
          const hasSavedLayout = hasGraph && !shouldRestoreFromDocs && baseGraph.nodes.length > 0 && baseGraph.nodes.every(hasValidNodePosition);
          const resolvedLayout = hasSavedLayout ?
             baseGraph
            : getLayoutedElements(baseGraph.nodes, baseGraph.edges, preferences.defaultMapLayout || 'LR');
          const activeGraphNodes = Array.isArray(resolvedLayout.nodes) ? resolvedLayout.nodes : [];

          setNodes(resolvedLayout.nodes);
          setEdges(resolvedLayout.edges);
          if (activeGraphNodes.length > 35) {
            const parentIds = new Set((resolvedLayout.edges || []).map((edge: any) => String(edge.source || '')));
            setCollapsedNodeIds(activeGraphNodes
              .filter((node: any) => {
                const code = String(node?.data?.numberCode || '');
                return code !== '1.0' && code.endsWith('.0') && parentIds.has(String(node.id));
              })
              .map((node: any) => String(node.id)));
          } else {
            setCollapsedNodeIds([]);
          }
          setLayoutMode(hasSavedLayout ? 'manual' : 'auto');
          setIsMapDirty(false);
          window.setTimeout(() => fitView({ duration: 800, padding: 0.25 }), 80);
          console.log('Map data loaded from database:', loadedNodes.length, 'nodes,', loadedEdges.length, 'edges');
          if (sanitizedGraph.warnings.length) {
            console.warn('Map data was repaired while loading:', sanitizedGraph.warnings);
          }
          if (!hasGraph) {
            console.warn('Map loaded without graph structure. Recovered a basic structure from saved details or title.');
          } else if (missingDetailIds.length > 0) {
            console.warn(`Map loaded with missing nodes from documentation. Restored ${missingDetailIds.length} child nodes from saved details.`);
          } else if (flattenedHierarchy) {
            console.warn('Map loaded with flattened hierarchy. Recovered a layered structure from saved details.');
          }
          
          // Load saved node_details from database if exists
          if (savedNodeDetails) {
            setNodeDetailsMap((prev) => ({
              ...prev,
              ...savedNodeDetails
            }));
            console.log('Node details loaded from database:', Object.keys(savedNodeDetails).length, 'nodes');
          }
          
          // Legacy enrichment is only a fallback for old maps without saved details.
          // Imported JSON details are authoritative and must never be overwritten.
          if (!hasPersistedNodeDetails) {
          // If this is the Tramontina map, integrate the detailed descriptions
          if (normalizedDataTitle.includes('tramontina') || normalizedMapTitle.includes('tramontina')) {
            console.log('Detected Tramontina map - integrating detailed node descriptions...');
            
            // Create a mapping of normalized labels to details for fuzzy matching
            const labelToDetailsMap: Record<string, NodeDetails> = {};
            tramontinaNodeDetails.forEach(detail => {
              // Normalize the label for matching (lowercase, remove special chars)
              const normalizedLabel = detail.id.toLowerCase().replace(/[^a-z0-9]/g, '');
              labelToDetailsMap[normalizedLabel] = {
                description: detail.description,
                images: [],
                tasks: detail.actions.map((action, index) => ({
                  id: `task-${detail.id}-${index}`,
                  text: action,
                  completed: false
                }))
              };
            });
            
            // Match nodes by their label/content
            const matchedDetails: Record<string, NodeDetails> = {};
            let matchCount = 0;
            
            activeGraphNodes.forEach((node: any) => {
              const nodeLabel = String(node?.data?.label || '').toLowerCase();
              const normalizedNodeLabel = nodeLabel.replace(/[^a-z0-9]/g, '');
              
              // Try exact match first
              let matchedDetail: NodeDetails | null = null;
              let matchedId: string | null = null;
              
              // Check if any tramontina detail ID matches part of the node label
              for (const [detailId, detail] of Object.entries(labelToDetailsMap)) {
                if (normalizedNodeLabel.includes(detailId) || detailId.includes(normalizedNodeLabel.substring(0, 10))) {
                  matchedDetail = detail;
                  matchedId = detailId;
                  break;
                }
              }
              
              // Also try matching by keywords in the label
              if (!matchedDetail) {
                // Keyword matching for specific sections
                if (nodeLabel.includes('pallet') && nodeLabel.includes('integridade')) {
                  matchedDetail = labelToDetailsMap['e1integridade'];
                } else if (nodeLabel.includes('pallet') && nodeLabel.includes('limpo')) {
                  matchedDetail = labelToDetailsMap['e1limpo'];
                } else if (nodeLabel.includes('código') || nodeLabel.includes('codigo')) {
                  matchedDetail = labelToDetailsMap['e2codigo'];
                } else if (nodeLabel.includes('lote')) {
                  matchedDetail = labelToDetailsMap['e2lote'];
                } else if (nodeLabel.includes('comprimento') || nodeLabel.includes('medida')) {
                  matchedDetail = labelToDetailsMap['e2comprimento'];
                } else if (nodeLabel.includes('pedido')) {
                  matchedDetail = labelToDetailsMap['e2pedido'];
                } else if (nodeLabel.includes('alinhar') || nodeLabel.includes('alinhamento')) {
                  matchedDetail = labelToDetailsMap['e3alinhar'];
                } else if (nodeLabel.includes('peso') && nodeLabel.includes('uniforme')) {
                  matchedDetail = labelToDetailsMap['e3peso'];
                } else if (nodeLabel.includes('laterais') || nodeLabel.includes('sarrafos')) {
                  matchedDetail = labelToDetailsMap['e4laterais'];
                } else if (nodeLabel.includes('travessas')) {
                  matchedDetail = labelToDetailsMap['e4travessas'];
                } else if (nodeLabel.includes('fita') || nodeLabel.includes('pet')) {
                  matchedDetail = labelToDetailsMap['e5verticais'];
                } else if (nodeLabel.includes('stretch')) {
                  matchedDetail = labelToDetailsMap['e6base'];
                } else if (nodeLabel.includes('tela') || nodeLabel.includes('frontal')) {
                  matchedDetail = labelToDetailsMap['e7tela'];
                } else if (nodeLabel.includes('etiqueta') && nodeLabel.includes('visvel')) {
                  matchedDetail = labelToDetailsMap['e8etiqueta'];
                } else if (nodeLabel.includes('inspeção') || nodeLabel.includes('final')) {
                  matchedDetail = labelToDetailsMap['e9alinhados'];
                } else if (nodeLabel.includes('iatf') || nodeLabel.includes('controle')) {
                  matchedDetail = labelToDetailsMap['iatfrastreabilidade'];
                } else if (nodeLabel.includes('segurança') || nodeLabel.includes('epi')) {
                  matchedDetail = labelToDetailsMap['segoculos'];
                }
              }
              
              if (matchedDetail && node.id) {
                matchedDetails[node.id] = matchedDetail;
                matchCount++;
              }
            });
            
            console.log(`Matched ${matchCount} nodes with detailed descriptions`);
            
            // Merge with existing nodeDetailsMap
            setNodeDetailsMap(prev => ({
              ...prev,
              ...matchedDetails
            }));
            
            if (matchCount > 0) {
              console.log(`Successfully integrated ${matchCount} detailed node descriptions`);
            } else {
              console.log('No matches found. Node labels:', activeGraphNodes.map((n: any) => n?.data?.label).slice(0, 10));
            }
          }
          
          // If this is the Corte em Serras map, integrate the detailed descriptions
          if (normalizedDataTitle.includes('corte') || normalizedDataTitle.includes('serra') ||
              normalizedMapTitle.includes('corte') || normalizedMapTitle.includes('serra')) {
            console.log('Detected Corte em Serras map - integrating detailed node descriptions...');
            
            // Create a mapping of normalized labels to details for fuzzy matching
            const corteLabelToDetailsMap: Record<string, NodeDetails> = {};
            corteSerrasNodeDetails.forEach(detail => {
              // Normalize the label for matching (lowercase, remove special chars)
              const normalizedLabel = detail.id.toLowerCase().replace(/[^a-z0-9]/g, '');
              corteLabelToDetailsMap[normalizedLabel] = {
                description: detail.description,
                images: [],
                tasks: detail.actions.map((action, index) => ({
                  id: `task-${detail.id}-${index}`,
                  text: action,
                  completed: false
                }))
              };
            });
            
            // Match nodes by their label/content
            const corteMatchedDetails: Record<string, NodeDetails> = {};
            let corteMatchCount = 0;
            
            activeGraphNodes.forEach((node: any) => {
              const nodeLabel = String(node?.data?.label || '').toLowerCase();
              const normalizedNodeLabel = nodeLabel.replace(/[^a-z0-9]/g, '');
              
              // Try exact match first
              let matchedDetail: NodeDetails | null = null;
              
              // Check if any corte detail ID matches part of the node label
              for (const [detailId, detail] of Object.entries(corteLabelToDetailsMap)) {
                if (normalizedNodeLabel.includes(detailId) || detailId.includes(normalizedNodeLabel.substring(0, 10))) {
                  matchedDetail = detail;
                  break;
                }
              }
              
              // Also try matching by keywords in the label
              if (!matchedDetail) {
                // Keyword matching for specific sections
                if (nodeLabel.includes('material') && (nodeLabel.includes('receb') || nodeLabel.includes('confer'))) {
                  matchedDetail = corteLabelToDetailsMap['inmaterial'];
                } else if (nodeLabel.includes('op') || nodeLabel.includes('ordem') || nodeLabel.includes('produção')) {
                  matchedDetail = corteLabelToDetailsMap['inop'];
                } else if (nodeLabel.includes('desenho') || nodeLabel.includes('técnico')) {
                  matchedDetail = corteLabelToDetailsMap['indesenho'];
                } else if (nodeLabel.includes('lâmina') || nodeLabel.includes('lamina')) {
                  matchedDetail = corteLabelToDetailsMap['e1lamina'];
                } else if (nodeLabel.includes('coolant') || nodeLabel.includes('lubrif') || nodeLabel.includes('refrigerao')) {
                  matchedDetail = corteLabelToDetailsMap['e1coolant'];
                } else if (nodeLabel.includes('calibra') || nodeLabel.includes('setup') || nodeLabel.includes('stop')) {
                  matchedDetail = corteLabelToDetailsMap['e1calibracao'];
                } else if (nodeLabel.includes('limpeza') && nodeLabel.includes('máquina')) {
                  matchedDetail = corteLabelToDetailsMap['e1limp'];
                } else if (nodeLabel.includes('peça piloto') || nodeLabel.includes('primeira peça')) {
                  matchedDetail = corteLabelToDetailsMap['e2primeirapeca'];
                } else if (nodeLabel.includes('peça piloto') || nodeLabel.includes('primeira peça')) {
                  matchedDetail = corteLabelToDetailsMap['e3medicaodimensional'];
                } else if (nodeLabel.includes('medir') || nodeLabel.includes('dimensional') || nodeLabel.includes('paquímetro')) {
                  matchedDetail = corteLabelToDetailsMap['e3inspevisual'];
                } else if (nodeLabel.includes('visual') || nodeLabel.includes('inspeção') && nodeLabel.includes('rebarba')) {
                  matchedDetail = corteLabelToDetailsMap['e3tolerancias'];
                } else if (nodeLabel.includes('tolerância') || nodeLabel.includes('tolerancia')) {
                  matchedDetail = corteLabelToDetailsMap['e3aprovacao'];
                } else if (nodeLabel.includes('aprovação') || nodeLabel.includes('liberação')) {
                  matchedDetail = corteLabelToDetailsMap['e6desbarbar'];
                } else if (nodeLabel.includes('epi') || nodeLabel.includes('segurança') || nodeLabel.includes('óculos')) {
                  matchedDetail = corteLabelToDetailsMap['segepi'];
                } else if (nodeLabel.includes('epi') || nodeLabel.includes('segurança') || nodeLabel.includes('culos')) {
                  matchedDetail = corteLabelToDetailsMap['iatfrastreabilidade'];
                } else if (nodeLabel.includes('cpk') || nodeLabel.includes('capacidade')) {
                  matchedDetail = corteLabelToDetailsMap['kpicpk'];
                } else if (nodeLabel.includes('scrap') || nodeLabel.includes('refugo')) {
                  matchedDetail = corteLabelToDetailsMap['kpiscrap'];
                }
              }
              
              if (matchedDetail && node.id) {
                corteMatchedDetails[node.id] = matchedDetail;
                corteMatchCount++;
              }
            });
            
            console.log(`Matched ${corteMatchCount} Corte em Serras nodes with detailed descriptions`);
            
            // Merge with existing nodeDetailsMap
            setNodeDetailsMap(prev => ({
              ...prev,
              ...corteMatchedDetails
            }));
            
            if (corteMatchCount > 0) {
              console.log(`Successfully integrated ${corteMatchCount} Corte em Serras detailed node descriptions`);
            } else {
              console.log('No Corte matches found. Node labels:', activeGraphNodes.map((n: any) => n?.data?.label).slice(0, 10));
            }
          }
          
          // If this is the Paletes Exportação map, integrate the detailed descriptions
          if (normalizedDataTitle.includes('paletes') || normalizedDataTitle.includes('exportação') ||
              normalizedMapTitle.includes('paletes') || normalizedMapTitle.includes('exportacao')) {
            console.log('Detected Paletes Exportação map - integrating detailed node descriptions...');
            
            // Direct merge since node IDs match
            setNodeDetailsMap(prev => ({
              ...prev,
              ...paletesExportacaoNodeDetails
            }));
            
            console.log(`Successfully integrated Paletes Exportação detailed node descriptions`);
          }
          
          // If this is the Serra Emmegi Críticos map, integrate the detailed descriptions
          if (normalizedDataTitle.includes('emmegi') && normalizedDataTitle.includes('críticos') ||
              normalizedMapTitle.includes('emmegi') && normalizedMapTitle.includes('criticos')) {
            console.log('Detected Serra Emmegi Críticos map - integrating detailed node descriptions...');
            
            // Direct merge since node IDs match
            setNodeDetailsMap(prev => ({
              ...prev,
              ...serraEmmegiCriticosNodeDetails
            }));
            
            console.log(`Successfully integrated Serra Emmegi Críticos detailed node descriptions`);
          }
          
          // If this is the Usinagem EXP FOM map, integrate the detailed descriptions
          if (normalizedDataTitle.includes('usinagem') && normalizedDataTitle.includes('exp') ||
              normalizedMapTitle.includes('usinagem') && normalizedMapTitle.includes('exp')) {
            console.log('Detected Usinagem EXP FOM map - integrating detailed node descriptions...');
            
            // Direct merge since node IDs match
            setNodeDetailsMap(prev => ({
              ...prev,
              ...usinagemExpFomNodeDetails
            }));
            
            console.log(`Successfully integrated Usinagem EXP FOM detailed node descriptions`);
          }

          if (normalizedDataTitle.includes('paquímetro') || normalizedDataTitle.includes('paquimetro') ||
              normalizedMapTitle.includes('paquímetro') || normalizedMapTitle.includes('paquimetro')) {
            console.log('Detected Paqumetros 150 mm e 300 mm map - integrating detailed node descriptions...');


            setNodeDetailsMap(prev => ({
              ...prev,
              ...paquimetro150300NodeDetails
            }));

            console.log(`Successfully integrated Paquímetros 150 mm e 300 mm detailed node descriptions`);
          }
          
          }

          // Set workflow status and creator
          setMapWorkflowStatus(data.workflow_status || 'draft');
          setMapCreatedBy(data.created_by || null);
        }
      } catch (err) {
        console.error('Error loading map:', err);
      }
    };
    
    loadMapData();
    return () => {
      cancelled = true;
    };
  }, [mapId, mapTitle, preferences.defaultMapLayout, setNodes, setEdges, setNodeDetailsMap, fitView]);

  // Version History
  const { versions, saveVersion, restoreVersion, deleteVersion, clearAllVersions, exportVersions, totalCount: versionCount } = useVersionHistory(mapId);
  const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false);
  const [versionDescription, setVersionDescription] = useState('');

  // Global Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; label: string; type: string }[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  // Export Menu State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const visualOptionsRef = useRef<HTMLDivElement>(null);
  
  // Work Instruction Export Modal
  const [isWorkInstructionOpen, setIsWorkInstructionOpen] = useState(false);

  // Export functions - REQUIRES: npm install html-to-image
  // Uncomment after installing dependency
  const handleExportPng = useCallback(async () => {
    alert('A exportação de imagem não está disponível. Verifique a instalação do módulo html-to-image.');
    setIsExportMenuOpen(false);
    // try {
    //   const { toPng } = await import('html-to-image');
    //   const flowElement = document.querySelector('.react-flow') as HTMLElement;
    //   if (!flowElement) return;
    //   const dataUrl = await toPng(flowElement, { backgroundColor: '#0f172a', pixelRatio: 2 });
    //   const link = document.createElement('a');
    //   link.download = `mapa-${mapTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
    //   link.href = dataUrl;
    //   link.click();
    //   setIsExportMenuOpen(false);
    // } catch (error) {
    //   alert('Erro ao exportar imagem');
    // }
  }, [mapTitle]);

  const handleExportSvg = useCallback(async () => {
    alert('A exportação de imagem não está disponível. Verifique a instalação do módulo html-to-image.');
    setIsExportMenuOpen(false);
    // try {
    //   const { toSvg } = await import('html-to-image');
    //   const flowElement = document.querySelector('.react-flow') as HTMLElement;
    //   if (!flowElement) return;
    //   const dataUrl = await toSvg(flowElement, { backgroundColor: '#0f172a' });
    //   const link = document.createElement('a');
    //   link.download = `mapa-${mapTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.svg`;
    //   link.href = dataUrl;
    //   link.click();
    //   setIsExportMenuOpen(false);
    // } catch (error) {
    //   alert('Erro ao exportar SVG');
    // }
  }, [mapTitle]);

  const handleExportJson = useCallback(() => {
    const exportData = buildMapJsonExport({
      title: mapTitle,
      description: mapDescription,
      visibility: mapVisibility,
      tags: mapTags,
      layout: layoutMode === 'manual' ? 'hierarchical' : (preferences.defaultMapLayout || 'hierarchical'),
      nodes: sanitizeNodesForSave(nodes as Node[]),
      edges: sanitizeEdgesForSave(edges as Edge[]),
      nodeDetails: nodeDetailsMap,
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mapa-${mapTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 0);
    setIsExportMenuOpen(false);
  }, [nodes, edges, layoutMode, mapDescription, mapTags, mapTitle, mapVisibility, nodeDetailsMap, preferences.defaultMapLayout, sanitizeNodesForSave, sanitizeEdgesForSave]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as HTMLElement)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('tecno-map-technical-panel', technicalPanelDisplay);
    window.localStorage.setItem('tecno-map-minimap', minimapDisplay);
    window.localStorage.setItem('tecno-map-tools-panel', toolsPanelDisplay);
    if (technicalPanelDisplay === 'hidden') setMobileInsightsOpen(false);
  }, [technicalPanelDisplay, minimapDisplay, toolsPanelDisplay]);

  useEffect(() => {
    const handleVisualOptionsOutside = (event: MouseEvent) => {
      if (visualOptionsRef.current && !visualOptionsRef.current.contains(event.target as HTMLElement)) {
        setIsVisualOptionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleVisualOptionsOutside);
    return () => document.removeEventListener('mousedown', handleVisualOptionsOutside);
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = nodes.filter(node => {
      const data = node.data as any;
      const label = (data?.label || '').toLowerCase();
      const nodeType = (data?.nodeType || '').toLowerCase();
      const details = nodeDetailsMap[node.id];
      const description = (details?.description || '').toLowerCase();
      const tasks = details?.tasks?.map(t => t.text.toLowerCase()).join(' ') || '';

      return label.includes(query) ||
             nodeType.includes(query) ||
             description.includes(query) ||
             tasks.includes(query);
    }).map(node => {
      const data = node.data as any;
      return {
        id: node.id,
        label: String(data?.label || node.id),
        type: String(data?.nodeType || 'node')
      };
    });

    setSearchResults(results);
    setCurrentResultIndex(0);
  }, [searchQuery, nodes, nodeDetailsMap]);

  const navigateToResult = useCallback((index: number) => {
    if (searchResults.length === 0) return;
    const result = searchResults[index];
    const node = nodes.find(n => n.id === result.id);
    if (node && node.position) {
      setCenter(node.position.x + 100, node.position.y + 50, { zoom: 1.2, duration: 800 });
    }
  }, [searchResults, nodes, setCenter]);

  const nextResult = () => {
    const newIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(newIndex);
    navigateToResult(newIndex);
  };

  const prevResult = () => {
    const newIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1;
    setCurrentResultIndex(newIndex);
    navigateToResult(newIndex);
  };

  // Keyboard shortcut for search (Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nodeTypes = useMemo(() => ({ mindmap: MindMapNode }), []);
  const edgeTypes = useMemo(() => ({ 'smart-connection': SmartConnectionEdge }), []);
  const connectionThemeStyles = useMemo(() => getConnectionThemeVariables(normalizeConnectionTheme(preferences.connectionTheme)), [preferences.connectionTheme]);
  const focusedNodeId = hoveredNode?.id ?? (isPresenting ? presentationPath[presentationIndex] : selectedNodeId);
  const decoratedEdges = useMemo(() => {
    const prepared = prepareConnectionEdges(edges as Edge[], nodes as Node[], {
      activeNodeId: focusedNodeId,
      hoveredNodeId: hoveredNode?.id ?? null,
    });
    const presentationPrepared = isPresenting
      ? prepared.map((edge) => ({
          ...edge,
          data: {
            ...(edge.data || {}),
            suppressLabel: true,
          },
        }))
      : prepared;
    if (!operationalMetricFilter || !metricRelevantNodeIds) return presentationPrepared;

    return presentationPrepared.map((edge) => ({
      ...edge,
      data: {
        ...(edge.data || {}),
        isMuted: !(metricRelevantNodeIds.has(edge.source) && metricRelevantNodeIds.has(edge.target)),
      },
    }));
  }, [edges, nodes, focusedNodeId, hoveredNode?.id, operationalMetricFilter, metricRelevantNodeIds, isPresenting]);
  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(visibleNodes.map((node) => node.id));
    return decoratedEdges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
  }, [decoratedEdges, visibleNodes]);

  const selectedOperationalDetails = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = nodes.find((entry) => entry.id === selectedNodeId);
    if (!node) return null;
    const details = nodeDetailsMap[selectedNodeId] || buildEmptyNodeDetails((node.data as any) || undefined);
    const operational = normalizeOperationalMetadata(details.operational, (node.data as any) || undefined);
    return {
      node,
      details,
      operational,
      meta: getAdvancedNodeMeta(operational.nodeTypeAdvanced, (node.data as any) || {}),
      badges: buildOperationalBadges(operational),
    };
  }, [selectedNodeId, nodes, nodeDetailsMap]);

  const operationalViewStats = useMemo(() => {
    const pool = (viewRelevantNodeIds ?
       nodesWithAdminProps.filter((node) => viewRelevantNodeIds.has(node.id))
      : nodesWithAdminProps
    ).map((node) => normalizeOperationalMetadata((node.data as any)?.operational, (node.data as any) || undefined));

    return {
      total: pool.length,
      ctq: pool.filter((item) => item.ctq || item.nodeTypeAdvanced === 'ctq').length,
      audit: pool.filter((item) => item.auditRequired || item.nodeTypeAdvanced === 'audit').length,
      risk: pool.filter((item) => item.riskLevel === 'high' || item.riskLevel === 'critical').length,
      troubleshooting: pool.filter((item) => item.troubleshooting.commonFailures.length > 0 || item.nodeTypeAdvanced === 'troubleshooting').length,
      evidence: pool.filter((item) => item.requiresEvidence).length,
    };
  }, [nodesWithAdminProps, viewRelevantNodeIds]);

  const operationalMetricCards = useMemo(() => ([
    { key: 'ctq' as const, label: 'CTQ', value: operationalViewStats.ctq, color: 'text-violet-300' },
    { key: 'audit' as const, label: 'Auditoria', value: operationalViewStats.audit, color: 'text-cyan-300' },
    { key: 'risk' as const, label: 'Risco alto', value: operationalViewStats.risk, color: 'text-amber-300' },
    { key: 'evidence' as const, label: 'Evidência', value: operationalViewStats.evidence, color: 'text-blue-300' },
    { key: 'troubleshooting' as const, label: 'Falhas', value: operationalViewStats.troubleshooting, color: 'text-rose-300' },
  ]), [operationalViewStats]);

  const selectedBreadcrumbs = useMemo(() => {
    if (!selectedNodeId) return [];
    const breadcrumbs: Array<{ id: string; label: string }> = [];
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    let cursor: string | undefined = selectedNodeId;
    const guard = new Set<string>();
    while (cursor && !guard.has(cursor)) {
      guard.add(cursor);
      const node = nodeMap.get(cursor);
      if (node) {
        breadcrumbs.unshift({
          id: node.id,
          label: String((node.data as any).label || node.id),
        });
      }
      cursor = parentMap.get(cursor);
    }
    return breadcrumbs;
  }, [selectedNodeId, nodes, parentMap]);

  const onConnect = useCallback((params: Edge | Connection) => {
    const newEdge = createConnectionEdge(
      {
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      },
      nodes,
    );

    setEdges((eds) => addEdge(newEdge as any, eds));
    setIsMapDirty(true);
  }, [nodes, setEdges]);

  const onNodeClick = useCallback((_: import('react').MouseEvent, node: any) => {
    if (isPresenting) return;
    setSelectedNodeId(node.id);
    setSelectedNodeData(node.data);
  }, [isPresenting]);

  const onNodeMouseEnter = useCallback((event: import('react').MouseEvent, node: any) => {
    if (isPresenting) {
      setHoveredNode(node);
      setHoverPosition({ x: event.clientX, y: event.clientY });
    }
  }, [isPresenting]);

  const onNodeMouseMove = useCallback((event: import('react').MouseEvent) => {
    if (hoveredNode && isPresenting) {
      setHoverPosition({ x: event.clientX, y: event.clientY });
    }
  }, [hoveredNode, isPresenting]);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setHoverPosition(null);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedNodeData(null);
  }, []);

  // Keyboard shortcuts
  useAppShortcuts({
    onSave: handleSaveMap,
    onSearch: () => setIsSearchOpen(true),
    onAdd: () => setIsAddModalOpen(true),
    onPresent: () => startPresentation(),
    onBack: () => { if (selectedNodeId) closeModal(); else onBack(); },
  });

  const handleUpdateDetails = useCallback(async (id: string, newDetails: NodeDetails | ((prev: NodeDetails) => NodeDetails)) => {
    // Get the actual new details (handle both direct values and functional updates)
    const resolvedDetails = typeof newDetails === 'function' 
      ? newDetails(nodeDetailsMap[id] || buildEmptyNodeDetails())
      : newDetails;
    
    // Update local state first
    setNodeDetailsMap((prev) => ({ ...prev, [id]: resolvedDetails }));
    
    // Save to database
    if (mapId) {
      try {
        const { supabase } = await import('./lib/supabase');
        
        // Get current node_details from database
        const { data: currentData, error: fetchError } = await supabase
          .from('process_items')
          .select('node_details')
          .eq('id', mapId)
          .single();
        
        if (fetchError) {
          console.error('Error fetching current node_details:', fetchError);
          return;
        }
        
        // Merge with existing node_details
        const existingDetails = currentData?.node_details || {};
        const updatedDetails = {
          ...existingDetails,
          [id]: resolvedDetails
        };
        
        // Save back to database
        const { error: updateError } = await supabase
          .from('process_items')
          .update({ node_details: updatedDetails })
          .eq('id', mapId);
        
        if (updateError) {
          console.error('Error saving node_details:', updateError);
        } else {
          console.log('Node details saved successfully for node:', id);
        }
      } catch (err) {
        console.error('Error in handleUpdateDetails:', err);
      }
    }
  }, [mapId, nodeDetailsMap]);

  const handleUpdateNodeLabel = useCallback((id: string, newLabel: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
    setIsMapDirty(true);
    // Also update selectedNodeData if it's the current node
    if (selectedNodeId === id && selectedNodeData) {
      setSelectedNodeData({ ...selectedNodeData, label: newLabel });
    }
  }, [selectedNodeId, selectedNodeData, setNodes]);

  const handleAddNodeSafe = useCallback((data: {
    label: string;
    category: string;
    requiredIATF: string;
    parentId: string;
    numberCodeMode: HierarchyNumberingMode;
    manualNumberCode: string;
    operational: ReturnType<typeof createDefaultOperationalMetadata>;
  }) => {
    const newNodeId = `node-${Date.now()}`;
    const parentNode = nodes.find((node) => node.id === data.parentId);
    const parentCode = String((parentNode?.data as any)?.numberCode || '1.0').trim() || '1.0';
    const siblingCodes = edges
      .filter((edge) => edge.source === data.parentId)
      .map((edge) => nodes.find((node) => node.id === edge.target))
      .filter(Boolean)
      .map((node) => String((node?.data as any)?.numberCode || '').trim())
      .filter(Boolean);
    const nextNumberCode =
      data.numberCodeMode === 'manual' ?
         data.manualNumberCode.trim()
        : getNextHierarchyCode(parentCode, siblingCodes, data.numberCodeMode === 'alpha' ? 'alpha' : 'numeric');
    const newNode: Node = {
      id: newNodeId,
      type: 'mindmap',
      position: { x: 0, y: 0 },
      data: {
        label: data.label,
        nodeType: data.category,
        category: data.category || getSuggestedCategoryForAdvancedType(data.operational.nodeTypeAdvanced),
        numberCode: nextNumberCode || `${Date.now()}`,
        requiredIATF: data.requiredIATF,
        nodeTypeAdvanced: data.operational.nodeTypeAdvanced,
        severity: data.operational.severity,
        riskLevel: data.operational.riskLevel,
        ctq: data.operational.ctq,
        auditRequired: data.operational.auditRequired,
        requiresEvidence: data.operational.requiresEvidence,
        requiresApproval: data.operational.requiresApproval,
      },
    };

    const newEdge = createConnectionEdge(
      {
        source: data.parentId,
        target: newNodeId,
        sourceHandle: null,
        targetHandle: null,
      },
      [...nodes, newNode],
    );

    const nextNodes = [...nodes, newNode];
    const nextEdges = [...edges, newEdge as Edge];
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nextNodes, nextEdges, preferences.defaultMapLayout || 'LR');

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setNodeDetailsMap((prev) => ({
      ...prev,
      [newNodeId]: {
        ...buildEmptyNodeDetails(newNode.data as any),
        operational: data.operational,
      },
    }));
    setIsMapDirty(true);
  }, [nodes, edges, preferences.defaultMapLayout, setNodes, setEdges]);

  const creationSuggestions = useMemo(() => {
    const rootChildren = new Set(
      edges
        .filter((edge) => edge.source === 'root')
        .map((edge) => nodes.find((node) => node.id === edge.target))
        .filter(Boolean)
        .map((node) => String((node?.data as any)?.category || '')),
    );

    return [
      { label: 'Entradas', category: 'inputs', type: 'process' as const, hint: 'OP, desenho e matéria-prima' },
      { label: 'Operação', category: 'methods', type: 'operation' as const, hint: 'Preparação e sequência de trabalho' },
      { label: 'Inspeção', category: 'quality', type: 'inspection' as const, hint: 'Medições e critérios OK/NOK' },
      { label: 'Segurança', category: 'safety', type: 'safety' as const, hint: 'EPIs, riscos e bloqueios' },
      { label: 'Recursos', category: 'resources', type: 'process' as const, hint: 'Máquinas, ferramentas e instrumentos' },
      { label: 'Saídas', category: 'outputs', type: 'release' as const, hint: 'Produto liberado, registro e destino' },
    ].filter((suggestion) => !rootChildren.has(suggestion.category));
  }, [nodes, edges]);

  const isGuidedCreationMap = useMemo(
    () => nodes.some((node) => node.id === 'root' && (node.data as any)?.creationState === 'guided'),
    [nodes],
  );

  const addCreationSuggestion = useCallback((suggestion: (typeof creationSuggestions)[number]) => {
    handleAddNodeSafe({
      label: suggestion.label,
      category: suggestion.category,
      requiredIATF: '',
      parentId: 'root',
      numberCodeMode: 'numeric',
      manualNumberCode: '',
      operational: createDefaultOperationalMetadata({
        nodeTypeAdvanced: suggestion.type,
        severity: 'medium',
        riskLevel: 'none',
      }),
    });
  }, [creationSuggestions, handleAddNodeSafe]);
  
  const getCurrentNodeDetails = (): NodeDetails => {
    if (!selectedNodeId) return buildEmptyNodeDetails();
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    if (!selectedNode) return buildEmptyNodeDetails();
    return nodeDetailsMap[selectedNodeId] || buildEmptyNodeDetails((selectedNode.data as any) || undefined);
  };

  // --- Presentation Logic ---
  
  const startPresentation = useCallback(() => {
    // Build the presentation from the complete saved hierarchy. React Flow's
    // rendered list omits descendants of collapsed nodes.
    const root = nodes.find((node) => {
      const data = (node.data || {}) as any;
      return node.id === 'root' || data.nodeType === 'root' || String(data.numberCode || '') === '1.0';
    });
    if (!root) return;

    const path: string[] = [];
    const visited = new Set<string>();
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const compareNodeIds = (leftId: string, rightId: string) => {
      const left = nodeMap.get(leftId);
      const right = nodeMap.get(rightId);
      const leftCode = String((left?.data as any)?.numberCode || '');
      const rightCode = String((right?.data as any)?.numberCode || '');
      const codeOrder = compareHierarchyCodes(leftCode, rightCode);
      if (codeOrder !== 0) return codeOrder;
      return String((left?.data as any)?.label || leftId).localeCompare(
        String((right?.data as any)?.label || rightId),
        'pt-BR',
        { numeric: true, sensitivity: 'base' },
      );
    };

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      path.push(nodeId);

      const children = [...(childMap.get(nodeId) || [])].sort(compareNodeIds);
      for (const child of children) {
        traverse(child);
      }
    };

    traverse(root.id);

    // Preserve valid disconnected notes without losing deterministic order.
    nodes
      .filter((node) => !visited.has(node.id))
      .sort((left, right) => compareNodeIds(left.id, right.id))
      .forEach((node) => path.push(node.id));

    presentationCollapsedStateRef.current = [...collapsedNodeIds];
    setCollapsedNodeIds([]);
    setPresentationPath(path);
    setPresentationIndex(0);
    setPresentationAutoPlay(presentationGuidedMode);
    setPresentationVisibleCharacters(0);
    setPresentationProgress(0);
    setIsPresenting(true);
    setHoveredNode(null);
    setHoverPosition(null);
    closeModal();
  }, [nodes, childMap, collapsedNodeIds, closeModal, presentationGuidedMode]);

  const stopPresentation = useCallback(() => {
    if (presentationAdvanceTimerRef.current) {
      window.clearTimeout(presentationAdvanceTimerRef.current);
      presentationAdvanceTimerRef.current = null;
    }
    setIsPresenting(false);
    setHoveredNode(null);
    setHoverPosition(null);
    setCollapsedNodeIds(presentationCollapsedStateRef.current);
    window.setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 40);
    
    // trigger confetti if they reached the end
    if (presentationIndex === presentationPath.length - 1 && presentationPath.length > 0) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        disableForReducedMotion: true
      });
    }
  }, [fitView, presentationIndex, presentationPath.length]);

  const nextSlide = useCallback(() => {
    if (presentationIndex < presentationPath.length - 1) {
      setPresentationIndex(prev => prev + 1);
    } else {
      stopPresentation();
    }
  }, [presentationIndex, presentationPath.length, stopPresentation]);

  const prevSlide = useCallback(() => {
    if (presentationIndex > 0) {
      setPresentationIndex(prev => prev - 1);
    }
  }, [presentationIndex]);

  const presentationNarrative = useMemo(() => {
    if (!presentationActiveNodeId) {
      return {
        node: undefined,
        details: undefined,
        description: '',
        tasks: [] as any[],
        segments: [] as Array<{ key: string; text: string }>,
        characters: [] as string[],
        text: '',
      };
    }

    const node = nodes.find((entry) => entry.id === presentationActiveNodeId);
    const details = nodeDetailsMap[presentationActiveNodeId];
    const description = String(details?.description || 'Observe esta etapa e siga as orientações apresentadas no processo.').trim();
    const tasks = Array.isArray(details?.tasks) ? details.tasks.filter((task) => task?.text) : [];
    const segments = [
      { key: 'description', text: description },
      ...tasks.slice(0, 4).map((task, index) => ({
        key: String(task.id || `task-${index}`),
        text: String(task.text),
      })),
    ];
    const narrativeText = segments.map((segment) => segment.text).join('\n');

    return {
      node,
      details,
      description,
      tasks,
      segments,
      characters: Array.from(narrativeText),
      text: narrativeText,
    };
  }, [presentationActiveNodeId, nodes, nodeDetailsMap]);

  const presentationVisibleDescription = useMemo(() => {
    const characters = Array.from(presentationNarrative.description);
    return characters.slice(0, presentationVisibleCharacters).join('');
  }, [presentationNarrative.description, presentationVisibleCharacters]);

  const presentationVisibleTasks = useMemo(() => {
    const descriptionLength = Array.from(presentationNarrative.description).length;
    let remainingCharacters = Math.max(0, presentationVisibleCharacters - descriptionLength - 1);

    return presentationNarrative.tasks.slice(0, 4).map((task) => {
      const taskCharacters = Array.from(String(task.text || ''));
      const visibleText = taskCharacters.slice(0, remainingCharacters).join('');
      remainingCharacters = Math.max(0, remainingCharacters - taskCharacters.length - 1);
      return { ...task, visibleText, isVisible: visibleText.length > 0 };
    });
  }, [presentationNarrative.description, presentationNarrative.tasks, presentationVisibleCharacters]);

  useEffect(() => {
    if (!isPresenting) return;

    presentationNarrativeNodeRef.current = presentationActiveNodeId;
    presentationVisibleCharactersRef.current = 0;
    setPresentationVisibleCharacters(0);
    setPresentationProgress(0);
    if (presentationAdvanceTimerRef.current) {
      window.clearTimeout(presentationAdvanceTimerRef.current);
      presentationAdvanceTimerRef.current = null;
    }
  }, [isPresenting, presentationActiveNodeId]);

  useEffect(() => {
    if (!isPresenting || !presentationGuidedMode || !presentationAutoPlay) return;

    const totalCharacters = Math.max(1, presentationNarrative.characters.length);
    const initialVisibleCharacters = presentationNarrativeNodeRef.current === presentationActiveNodeId
      ? Math.min(totalCharacters, presentationVisibleCharactersRef.current)
      : 0;
    const remainingCharacters = Math.max(0, totalCharacters - initialVisibleCharacters);
    const characterInterval = Math.max(14, 42 / presentationSpeed);
    const remainingText = presentationNarrative.characters.slice(initialVisibleCharacters).join('');
    const punctuationPause = (
      (remainingText.match(/[.!?]/g)?.length || 0) * 480
      + (remainingText.match(/[,;:]/g)?.length || 0) * 210
      + (remainingText.match(/\n/g)?.length || 0) * 420
    ) / presentationSpeed;
    const estimatedSpaces = remainingText.match(/\s/g)?.length || 0;
    const totalRevealDuration = Math.max(0, remainingCharacters - estimatedSpaces) * characterInterval
      + estimatedSpaces * characterInterval * 0.35
      + punctuationPause;
    const readingPause = Math.max(2200, 3600 / presentationSpeed);
    const totalDuration = totalRevealDuration + readingPause;

    let revealedCharacters = initialVisibleCharacters;
    let revealTimer: number | null = null;
    const revealNextCharacter = () => {
      if (revealedCharacters >= totalCharacters) return;

      const currentCharacter = presentationNarrative.characters[revealedCharacters] || '';
      revealedCharacters += 1;
      presentationVisibleCharactersRef.current = revealedCharacters;
      setPresentationVisibleCharacters(revealedCharacters);
      setPresentationProgress(Math.min(88, (revealedCharacters / totalCharacters) * 88));

      if (revealedCharacters < totalCharacters) {
        const sentencePause = /[.!?]/.test(currentCharacter) ? 480 / presentationSpeed : 0;
        const clausePause = /[,;:]/.test(currentCharacter) ? 210 / presentationSpeed : 0;
        const sectionPause = currentCharacter === '\n' ? 420 / presentationSpeed : 0;
        const spaceAcceleration = /\s/.test(currentCharacter) ? 0.35 : 1;
        const humanVariation = 0.82 + ((revealedCharacters * 17) % 7) * 0.055;
        revealTimer = window.setTimeout(
          revealNextCharacter,
          characterInterval * spaceAcceleration * humanVariation + sentencePause + clausePause + sectionPause,
        );
      }
    };

    revealTimer = window.setTimeout(revealNextCharacter, characterInterval);

    presentationAdvanceTimerRef.current = window.setTimeout(() => {
      setPresentationProgress(100);
      nextSlide();
    }, totalDuration);

    return () => {
      if (revealTimer) window.clearTimeout(revealTimer);
      if (presentationAdvanceTimerRef.current) {
        window.clearTimeout(presentationAdvanceTimerRef.current);
        presentationAdvanceTimerRef.current = null;
      }
    };
  }, [isPresenting, presentationGuidedMode, presentationAutoPlay, presentationActiveNodeId, presentationSpeed, presentationNarrative.characters, nextSlide]);

  useEffect(() => {
    window.localStorage.setItem('tecno-presentation-speed', String(presentationSpeed));
  }, [presentationSpeed]);

  useEffect(() => {
    window.localStorage.setItem(
      'tecno-presentation-mode',
      presentationGuidedMode ? 'guided' : 'traditional',
    );
  }, [presentationGuidedMode]);

  const togglePresentationGuidedMode = useCallback(() => {
    setPresentationGuidedMode((guidedMode) => {
      const nextGuidedMode = !guidedMode;
      setPresentationAutoPlay(nextGuidedMode);
      presentationVisibleCharactersRef.current = nextGuidedMode
        ? 0
        : presentationNarrative.characters.length;
      setPresentationVisibleCharacters(presentationVisibleCharactersRef.current);
      setPresentationProgress(nextGuidedMode ? 0 : 100);
      return nextGuidedMode;
    });
  }, [presentationNarrative.characters.length]);

  useEffect(() => {
    if (!isPresenting) return;
    const handlePresentationKeys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        stopPresentation();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevSlide();
        return;
      }
      if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        if (event.key === ' ' && presentationGuidedMode) {
          setPresentationAutoPlay((playing) => !playing);
        } else {
          nextSlide();
        }
      }
    };
    window.addEventListener('keydown', handlePresentationKeys);
    return () => window.removeEventListener('keydown', handlePresentationKeys);
  }, [isPresenting, presentationGuidedMode, nextSlide, prevSlide, stopPresentation]);

  // Presentation emphasis is derived in nodesWithAdminProps. Only the viewport
  // needs an effect; mutating nodes here would recreate the hierarchy forever.
  useEffect(() => {
    if (!presentationActiveNodeId) return;
    const activeNode = nodes.find((node) => node.id === presentationActiveNodeId);
    if (!activeNode) return;

    setCenter(activeNode.position.x + 100, activeNode.position.y + 40, {
      zoom: 1.4,
      duration: 800,
    });
  }, [presentationActiveNodeId, nodes, setCenter]);

  return (
    <div
      className="w-full h-screen bg-[#0f172a] text-slate-100 flex font-sans overflow-hidden relative"
      style={connectionThemeStyles}
      data-connection-theme={preferences.connectionTheme}
    >
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none z-0"></div>

      <div className="flex-1 h-full relative z-10 w-full flex flex-col">
        {/* Map Header when not presenting */}
        {!isPresenting && (
          <div className="bg-white/[0.02] backdrop-blur-xl border-b border-white/5 shrink-0 z-20 px-3 sm:px-6 py-2.5 sm:py-3 safe-top">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <button 
                    onClick={onBack}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors shrink-0"
                    title="Voltar ao Dashboard"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="hidden sm:block text-[9px] text-slate-400 uppercase tracking-[0.4em] font-semibold m-0">Procedimento</p>
                    <h1 className="truncate text-xs font-bold leading-tight tracking-tight text-white sm:text-base lg:text-xl">
                      {mapTitle}
                    </h1>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2 pointer-events-auto shrink-0 max-w-[58%] 2xl:max-w-[62%]">
                  {!isGuidedMode ? (
                    <>
                      <button
                        onClick={() => setIsSearchOpen(true)}
                        className="w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 flex items-center justify-center gap-2 bg-white/5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                        title="Buscar (Ctrl+F)"
                      >
                        <Search size={15} />
                        <span className="hidden 2xl:inline text-sm font-medium">Buscar</span>
                      </button>
                      {perms.can.saveVersion && (
                        <button
                          onClick={handleSaveMap}
                          disabled={isSavingMap}
                          className={cn(
                            'hidden sm:flex w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 items-center justify-center gap-2 rounded-xl border transition-colors disabled:opacity-50',
                            isMapDirty ?
                               'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          )}
                          title="Salvar mapa no banco"
                        >
                          <Save size={15} />
                          <span className="hidden 2xl:inline text-sm font-medium">{isSavingMap ? 'Salvando...' : isMapDirty ? 'Salvar mapa' : 'Salvo'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => setIsVersionPanelOpen(true)}
                        className="hidden md:flex relative w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 items-center justify-center gap-2 bg-white/5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                        title="Histórico de versões"
                      >
                        <History size={15} />
                        <span className="hidden 2xl:inline text-sm font-medium">Versões</span>
                        {versionCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center">
                            {versionCount}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={startPresentation}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                      >
                        <Play size={16} /> <span className="hidden xl:inline">Apresentar</span>
                      </button>
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 flex items-center justify-center gap-2 bg-white/5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                        title="Adicionar nó"
                      >
                        <Plus size={15} />
                        <span className="hidden 2xl:inline text-sm font-medium">Adicionar</span>
                      </button>
                      <div className="relative" ref={visualOptionsRef}>
                        <button
                          type="button"
                          onClick={() => setIsVisualOptionsOpen((open) => !open)}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-xl border transition-colors sm:w-auto sm:px-3 sm:py-2',
                            isVisualOptionsOpen
                              ? 'border-blue-400/30 bg-blue-500/15 text-blue-200'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
                          )}
                          title="Personalizar painéis do mapa"
                          aria-label="Personalizar visualização do mapa"
                        >
                          <Settings2 size={15} />
                          <span className="ml-2 hidden 2xl:inline text-sm font-medium">Visualização</span>
                        </button>
                        {isVisualOptionsOpen && (
                          <div className="absolute right-0 top-full z-50 mt-2 w-[min(320px,calc(100vw-24px))] rounded-2xl border border-white/10 bg-[#0b1629]/98 p-3 shadow-2xl backdrop-blur-2xl">
                            <div className="mb-3">
                              <p className="text-sm font-bold text-white">Organizar área de trabalho</p>
                              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">Escolha quanto espaço cada apoio deve ocupar. As preferências ficam salvas neste aparelho.</p>
                            </div>
                            {[
                              { label: 'Resumo técnico', value: technicalPanelDisplay, setter: setTechnicalPanelDisplay },
                              { label: 'Minimapa', value: minimapDisplay, setter: setMinimapDisplay },
                              { label: 'Ferramentas', value: toolsPanelDisplay, setter: setToolsPanelDisplay },
                            ].map((item) => (
                              <div key={item.label} className="border-t border-white/5 py-2.5 first:border-t-0">
                                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                                <div className="grid grid-cols-3 gap-1 rounded-xl bg-black/20 p-1">
                                  {MAP_PANEL_DISPLAY_OPTIONS.map((option) => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => item.setter(option.value)}
                                      className={cn(
                                        'rounded-lg px-2 py-2 text-[10px] font-semibold transition-colors',
                                        item.value === option.value
                                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                          : 'text-slate-400 hover:bg-white/5 hover:text-white',
                                      )}
                                    >
                                      {option.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative" ref={exportMenuRef}>
                        <button
                          onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                          className="w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 flex items-center justify-center gap-2 bg-blue-600 rounded-xl border border-blue-500 text-white hover:bg-blue-500 transition-colors"
                          title="Exportar"
                        >
                          <Download size={15} />
                          <span className="hidden 2xl:inline text-sm font-medium">Exportar</span>
                        </button>
                        {isExportMenuOpen && (
                          <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                            <button
                              onClick={handleExportPng}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-slate-300 hover:text-white"
                            >
                              <Camera size={18} className="text-emerald-400" />
                              <div>
                                <div className="font-medium text-sm">Exportar PNG</div>
                                <div className="text-xs text-slate-500">Imagem de alta qualidade</div>
                              </div>
                            </button>
                            <button
                              onClick={handleExportSvg}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-slate-300 hover:text-white border-t border-white/5"
                            >
                              <FileCode size={18} className="text-blue-400" />
                              <div>
                                <div className="font-medium text-sm">Exportar SVG</div>
                                <div className="text-xs text-slate-500">Vetor escalável</div>
                              </div>
                            </button>
                            <button
                              onClick={handleExportJson}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-slate-300 hover:text-white border-t border-white/5"
                            >
                              <FileCode size={18} className="text-violet-400" />
                              <div>
                                <div className="font-medium text-sm">Exportar JSON</div>
                                <div className="text-xs text-slate-500">Mapa completo para reimportar depois</div>
                              </div>
                            </button>
                            <button
                              onClick={() => {
                                setIsWorkInstructionOpen(true);
                                setIsExportMenuOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-slate-300 hover:text-white border-t border-white/5"
                            >
                              <FileText size={18} className="text-amber-400" />
                              <div>
                                <div className="font-medium text-sm">Documento Word</div>
                                <div className="text-xs text-slate-500">Procedimento profissional para impressão</div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2">
                      <span className="text-[10px] uppercase tracking-widest text-blue-300 font-bold whitespace-nowrap">{currentViewMeta.label}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mobile-tab-scroll relative -mx-3 flex w-[calc(100%+1.5rem)] snap-x snap-mandatory justify-start overflow-x-auto px-3 pb-1 sm:mx-0 sm:w-full sm:px-0 2xl:justify-center custom-scrollbar">
                <div className="flex min-w-max items-center gap-1 rounded-2xl border border-white/10 bg-[#0a1628] p-1 shadow-xl">
                  {OPERATIONAL_VIEW_OPTIONS.map((option) => {
                    const isActive = viewMode === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setViewMode(option.value)}
                        className={cn(
                          'snap-start px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap border',
                          isActive ?
                             'bg-gradient-to-r from-blue-600 to-blue-500 border-blue-400/40 text-white shadow-[0_0_16px_rgba(59,130,246,0.35)]'
                            : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5',
                        )}
                        title={option.description}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 relative overflow-hidden">
          {!isGuidedMode ? (
            <ReactFlow
              nodes={visibleNodes}
              edges={visibleEdges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodeClick={onNodeClick}
              onNodeMouseEnter={onNodeMouseEnter}
              onNodeMouseMove={onNodeMouseMove}
              onNodeMouseLeave={onNodeMouseLeave}
              fitView
              minZoom={0.1}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={!isPresenting && perms.can.editNode && !positionsLocked}
              nodesConnectable={!isPresenting}
              elementsSelectable={!isPresenting}
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnDoubleClick={true}
            >
              <Background color="#1e293b" gap={24} size={2} />
              
              {/* Hide controls during presentation */}
              {!isPresenting && (
                <>
                  <Controls className="!bg-white/5 !border-white/10 !backdrop-blur-xl !shadow-sm !rounded-xl overflow-hidden [&>button]:!border-b [&>button]:!border-white/5 [&>button]:!bg-transparent [&>button]:!text-slate-300 [&>button:hover]:!bg-white/10 [&>button:hover]:!text-white" />
                  {minimapDisplay !== 'hidden' && <MiniMap
                    className={cn(
                      'hidden sm:block !bg-[#0f172a]/90 !border-white/10 !backdrop-blur-xl !shadow-sm !rounded-xl transition-all',
                      minimapDisplay === 'compact' && '!h-[110px] !w-[150px]',
                    )}
                    maskColor="rgba(15, 23, 42, 0.7)"
                    nodeColor={(n: any) => {
                      if (n.data?.category === 'root') return '#4f46e5';
                      if (n.data?.category === 'inputs') return '#fb923c';
                      if (n.data?.category === 'outputs') return '#34d399';
                      if (n.data?.category === 'resources') return '#fbbf24';
                      if (n.data?.category === 'people') return '#818cf8';
                      if (n.data?.category === 'methods') return '#fb7185';
                      if (n.data?.category === 'kpis') return '#a78bfa';
                      if (n.data?.category === 'quality') return '#10b981';
                      if (n.data?.category === 'safety') return '#facc15';
                      if (n.data?.category === 'alerts') return '#fb7185';
                      if (n.data?.category === 'compliance') return '#22d3ee';
                      return '#475569';
                    }}
                  />}
                </>
              )}
              {isPresenting && presentationGuidedMode && (
                <Panel position="top-left" className="m-3 max-w-[calc(100vw-1.5rem)] sm:m-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={presentationActiveNodeId}
                      initial={{ opacity: 0, x: -24, scale: 0.97 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.98 }}
                      transition={{ duration: 0.38, ease: 'easeOut' }}
                      className="relative w-[min(430px,calc(100vw-1.5rem))] overflow-hidden rounded-3xl border border-blue-400/20 bg-[#090f1d]/90 shadow-[0_24px_80px_rgba(0,0,0,0.48)] backdrop-blur-2xl"
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                      <div className="p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl bg-blue-500/15 p-3 text-blue-300 ring-1 ring-blue-400/20">
                            <Target size={22} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-400">
                              Leitura guiada
                            </p>
                            <h2 className="mt-1 text-lg font-bold leading-tight text-white sm:text-xl">
                              {String((presentationNarrative.node?.data as any)?.label || 'Etapa do processo')}
                            </h2>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {String((presentationNarrative.node?.data as any)?.category || 'processo')}
                            </p>
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold text-slate-400">
                            {String((presentationNarrative.node?.data as any)?.numberCode || presentationIndex + 1)}
                          </span>
                        </div>

                        <div className="mt-5 min-h-[76px] text-[15px] leading-7 text-slate-200 sm:text-base">
                          {presentationVisibleDescription}
                          {presentationVisibleCharacters < presentationNarrative.characters.length && presentationAutoPlay && (
                            <motion.span
                              aria-hidden="true"
                              animate={{ opacity: [0.25, 1, 0.25], scaleY: [0.88, 1, 0.88] }}
                              transition={{ duration: 0.72, repeat: Infinity, ease: 'easeInOut' }}
                              className="ml-0.5 inline-block h-5 w-[2px] origin-center translate-y-1 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                            />
                          )}
                        </div>

                        {presentationVisibleTasks.some((task) => task.isVisible) && (
                          <div className="mt-5 border-t border-white/10 pt-4">
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Ações da etapa</p>
                            <div className="space-y-2.5">
                              {presentationVisibleTasks.filter((task) => task.isVisible).map((task) => (
                                <motion.div
                                  key={task.id || task.text}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-start gap-2.5 text-sm leading-5 text-slate-300"
                                >
                                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                                  <span>{task.visibleText}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="h-1 bg-white/5">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"
                          animate={{ width: `${presentationProgress}%` }}
                          transition={{ duration: 0.08, ease: 'linear' }}
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </Panel>
              )}
              {isPresenting && (
                <Panel position="bottom-center" className="mb-3 sm:mb-6 max-w-[calc(100vw-1rem)]">
                  <div className="flex max-w-[min(1080px,calc(100vw-1rem))] items-center gap-2 rounded-2xl border border-white/10 bg-[#0f172a]/94 px-3 py-2.5 shadow-2xl backdrop-blur-2xl sm:gap-4 sm:px-5 sm:py-3">
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300 sm:text-xs">
                        Etapa {presentationIndex + 1} de {presentationPath.length}
                      </span>
                      <span className="mt-0.5 hidden max-w-[420px] truncate text-sm font-semibold text-slate-100 sm:block">
                        {(() => {
                          const currentNode = nodes.find((node) => node.id === presentationPath[presentationIndex]);
                          const code = String((currentNode?.data as any)?.numberCode || '').trim();
                          const label = String((currentNode?.data as any)?.label || 'Etapa atual');
                          return `${code ? `${code} ` : ''}${label}`;
                        })()}
                      </span>
                    </div>
                    
                    <div className="flex shrink-0 items-center gap-1 border-l border-white/10 pl-2 sm:gap-2 sm:pl-4">
                      <button
                        type="button"
                        onClick={togglePresentationGuidedMode}
                        className={cn(
                          'flex items-center gap-2 rounded-xl border p-2 text-xs font-bold transition-all lg:px-3',
                          presentationGuidedMode
                            ? 'border-blue-400/30 bg-blue-500/15 text-blue-200'
                            : 'border-amber-400/25 bg-amber-500/10 text-amber-200',
                        )}
                        title={presentationGuidedMode
                          ? 'Desativar leitura guiada e navegar manualmente'
                          : 'Ativar leitura guiada com avanço automático'}
                      >
                        {presentationGuidedMode ? <Sparkles size={15} /> : <Move size={15} />}
                        <span className="hidden md:inline">
                          {presentationGuidedMode ? 'Leitura guiada' : 'Tradicional'}
                        </span>
                      </button>

                      {presentationGuidedMode && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPresentationAutoPlay((playing) => !playing)}
                            className={cn(
                              'flex items-center gap-2 rounded-xl border p-2 text-xs font-bold transition-all lg:px-3',
                              presentationAutoPlay
                                ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300'
                                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10',
                            )}
                            title={presentationAutoPlay ? 'Pausar leitura automática (espaço)' : 'Continuar leitura automática (espaço)'}
                          >
                            {presentationAutoPlay ? <Pause size={15} /> : <Play size={15} />}
                            <span className="hidden xl:inline">{presentationAutoPlay ? 'Pausar' : 'Continuar'}</span>
                          </button>
                          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-400">
                            <Gauge size={14} className="text-blue-300" />
                            <span className="sr-only">Velocidade da apresentação</span>
                            <select
                              value={presentationSpeed}
                              onChange={(event) => setPresentationSpeed(Number(event.target.value))}
                              className="max-w-[105px] cursor-pointer bg-transparent font-semibold text-slate-200 outline-none [&>option]:bg-slate-900"
                              title="Velocidade da leitura automática"
                            >
                              <option value={0.3}>Muito calma</option>
                              <option value={0.45}>Calma</option>
                              <option value={0.65}>Confortável</option>
                              <option value={0.85}>Normal</option>
                              <option value={1.1}>Ágil</option>
                              <option value={1.4}>Rápida</option>
                              <option value={1.75}>Dinâmica</option>
                            </select>
                          </label>
                        </>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1 border-l border-white/10 pl-2 sm:gap-2 sm:pl-4">
                      <button 
                        onClick={prevSlide}
                        disabled={presentationIndex === 0}
                        className="rounded-full p-2 text-slate-300 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Etapa anterior (seta para a esquerda)"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button 
                        onClick={nextSlide}
                        className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 sm:px-6"
                        title="Próxima etapa (seta para a direita ou Enter)"
                      >
                        {presentationIndex === presentationPath.length - 1 ? 'Concluir' : 'Próximo'}
                        {presentationIndex !== presentationPath.length - 1 && <ChevronRight size={18} />}
                      </button>
                    </div>
                    
                    <div className="shrink-0 border-l border-white/10 pl-3 sm:ml-1 sm:pl-5">
                      <button 
                        onClick={stopPresentation}
                        className="rounded-full p-2 text-rose-400 transition-all hover:bg-rose-500/10 hover:text-rose-300"
                        title="Encerrar apresentação (Esc)"
                      >
                        <Square size={20} className="fill-current" />
                      </button>
                    </div>
                  </div>
                </Panel>
              )}

              {/* Layout Controls Panel */}
              {!isPresenting && toolsPanelDisplay !== 'hidden' && (
                <Panel position="top-right" className="mt-4">
                  <div className={cn(
                    'flex flex-col gap-2 bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl',
                    toolsPanelDisplay === 'compact' && 'gap-1',
                  )}>
                    <button
                      onClick={handleAutoLayout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Auto-arrumar layout"
                    >
                      <LayoutGrid size={16} />
                      <span className={cn(toolsPanelDisplay === 'compact' && 'sr-only')}>Auto-arrumar</span>
                    </button>
                    <button
                      onClick={togglePositionLock}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all',
                        positionsLocked
                          ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20'
                          : 'text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20',
                      )}
                      title={positionsLocked ? 'Destravar para movimentar os nós livremente' : 'Travar as posições atuais'}
                    >
                      {positionsLocked ? <Lock size={16} /> : <Unlock size={16} />}
                      <span className={cn(toolsPanelDisplay === 'compact' && 'sr-only')}>{positionsLocked ? 'Posições travadas' : 'Edição livre'}</span>
                    </button>
                    {nodes.length > 20 && (
                      <button
                        onClick={() => {
                          if (collapsedNodeIds.length > 0) {
                            setCollapsedNodeIds([]);
                          } else {
                            setCollapsedNodeIds(nodes
                              .filter((node) => {
                                const code = String((node.data as any)?.numberCode || '');
                                return code !== '1.0' && code.endsWith('.0') && (childMap.get(node.id)?.length || 0) > 0;
                              })
                              .map((node) => node.id));
                          }
                          window.setTimeout(() => fitView({ duration: 500, padding: 0.22 }), 40);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 rounded-lg transition-all"
                        title={collapsedNodeIds.length > 0 ? 'Exibir todos os subníveis' : 'Mostrar somente as macrofases'}
                      >
                        {collapsedNodeIds.length > 0 ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        <span className={cn(toolsPanelDisplay === 'compact' && 'sr-only')}>{collapsedNodeIds.length > 0 ? 'Expandir tudo' : 'Recolher fases'}</span>
                      </button>
                    )}
                    {perms.can.viewAssessments && (
                      <button
                        onClick={() => setShowAssessmentAdmin(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 rounded-lg transition-all"
                        title="Avaliações"
                      >
                        <Target size={16} />
                        <span className={cn(toolsPanelDisplay === 'compact' && 'sr-only')}>Avaliações</span>
                      </button>
                    )}
                    {perms.can.createAssessment && (
                      <button
                        onClick={() => setShowAssessmentAdmin(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 rounded-lg transition-all"
                        title="Gerenciar avaliações"
                      >
                        <Settings2 size={16} />
                        <span className={cn(toolsPanelDisplay === 'compact' && 'sr-only')}>Gerenciar</span>
                      </button>
                    )}
                    {perms.can.viewAssessmentAnalytics && (
                      <button
                        onClick={() => setShowAssessmentDashboard(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-lg transition-all"
                        title="Dashboard de avaliações"
                      >
                        <BarChart3 size={16} />
                        <span className={cn(toolsPanelDisplay === 'compact' && 'sr-only')}>Analytics</span>
                      </button>
                    )}
                  </div>
                </Panel>
              )}

              {!isPresenting && technicalPanelDisplay !== 'hidden' && !mobileInsightsOpen && (
                <Panel position="top-left" className={cn('mt-2 ml-1', technicalPanelDisplay === 'full' && 'sm:hidden')}>
                  <button
                    type="button"
                    onClick={() => setMobileInsightsOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-blue-400/20 bg-[#0b1629]/95 px-3 py-2 text-xs font-bold text-blue-200 shadow-xl backdrop-blur-xl"
                  >
                    <Gauge size={15} /> {technicalPanelDisplay === 'compact' ? currentViewMeta.label : 'Resumo técnico'}
                  </button>
                </Panel>
              )}

              {!isPresenting && technicalPanelDisplay !== 'hidden' && (
                <Panel position="top-left" className={cn(
                  'mt-2 ml-1 w-[calc(100vw-0.75rem)] sm:mt-4 sm:ml-2 sm:w-auto sm:max-w-[360px]',
                  !mobileInsightsOpen && technicalPanelDisplay === 'full' && 'hidden sm:block',
                  !mobileInsightsOpen && technicalPanelDisplay === 'compact' && 'hidden',
                )}>
                  <div className="bg-[#0f172a]/92 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.35em] text-blue-300 font-bold">
                          {currentViewMeta.label}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentViewMeta.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMobileInsightsOpen(false)}
                        className="-mr-1 -mt-1 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white sm:hidden"
                        aria-label="Fechar resumo técnico"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {!isGuidedMode && (
                      <div className="px-4 py-3 border-b border-white/10 bg-black/10 space-y-3">
                        {viewMode !== 'technical' && (
                          <button
                            onClick={() => setFocusViewOnly((prev) => !prev)}
                            className={cn(
                              'w-full px-3 py-2 rounded-xl border text-xs font-semibold transition-colors',
                              focusViewOnly
                                ? 'bg-blue-500/15 border-blue-500/30 text-blue-200'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200',
                            )}
                          >
                            {focusViewOnly ? 'Visao filtrada por contexto' : 'Mostrar toda a arvore'}
                          </button>
                        )}

                        <div className="grid grid-cols-3 gap-2">
                          {operationalMetricCards.map((card) => {
                            const isActive = operationalMetricFilter === card.key;
                            return (
                              <button
                                key={card.key}
                                type="button"
                                disabled={card.value === 0}
                                onClick={() => setOperationalMetricFilter(isActive ? null : card.key)}
                                className={cn(
                                  'rounded-xl border p-2.5 text-left transition-all hover:-translate-y-0.5 hover:bg-white/10',
                                  card.value === 0 && 'cursor-not-allowed opacity-45 hover:translate-y-0 hover:bg-white/5',
                                  isActive
                                    ? 'border-blue-400/50 bg-blue-500/15 ring-1 ring-blue-400/30'
                                    : 'border-white/10 bg-white/5',
                                )}
                                title={card.value === 0
                                  ? `Nenhum nó relacionado a ${card.label}`
                                  : isActive
                                    ? `Remover destaque de ${card.label}`
                                    : `Destacar nós relacionados a ${card.label}`}
                              >
                                <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">{card.label}</p>
                                <p className={cn('text-sm font-bold mt-1', card.color)}>{card.value}</p>
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => setOperationalMetricFilter(null)}
                            className={cn(
                              'rounded-xl border p-2.5 text-left transition-all hover:-translate-y-0.5 hover:bg-white/10',
                              operationalMetricFilter === null
                                ? 'border-white/20 bg-white/10'
                                : 'border-white/10 bg-white/5',
                            )}
                            title="Mostrar todos os nós sem destaque especial"
                          >
                            <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Nós</p>
                            <p className="text-sm font-bold text-slate-200 mt-1">{operationalViewStats.total}</p>
                          </button>
                        </div>
                        {operationalMetricFilter && (
                          <p className="text-[10px] text-blue-300/80">
                            Filtro visual ativo. Os demais nós continuam no mapa com menor destaque.
                          </p>
                        )}
                      </div>
                    )}

                    {selectedOperationalDetails ? (
                      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {selectedBreadcrumbs.map((item, index) => (
                              <span key={item.id} className="text-[10px] text-slate-400">
                                {index > 0 && <span className="mr-1.5 text-slate-600">/</span>}
                                {item.label}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-bold text-white leading-tight">
                                {selectedOperationalDetails.node.data.label as string}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">
                                {selectedOperationalDetails.meta.label}
                              </p>
                            </div>
                            <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300 whitespace-nowrap">
                              {selectedOperationalDetails.operational.riskLevel}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedOperationalDetails.badges.map((badge) => (
                              <span
                                key={`${selectedOperationalDetails.node.id}-${badge.label}`}
                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300"
                              >
                                {badge.label}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Severidade</p>
                            <p className="text-white font-semibold mt-1 capitalize">{selectedOperationalDetails.operational.severity}</p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold">Inspecao</p>
                            <p className="text-white font-semibold mt-1">
                              {selectedOperationalDetails.operational.inspectionFrequency || 'Sob demanda'}
                            </p>
                          </div>
                        </div>

                        {selectedOperationalDetails.details.description && (
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-slate-500 uppercase tracking-widest text-[10px] font-bold mb-2">Contexto operacional</p>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {selectedOperationalDetails.details.description}
                            </p>
                          </div>
                        )}

                        {selectedOperationalDetails.operational.approvalCriteria.length > 0 && (
                          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                            <p className="text-emerald-300 uppercase tracking-widest text-[10px] font-bold mb-2">Criterios de aprovacao</p>
                            <ul className="space-y-1 text-sm text-slate-300">
                              {selectedOperationalDetails.operational.approvalCriteria.slice(0, 5).map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedOperationalDetails.operational.nokFlow.length > 0 && (
                          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                            <p className="text-rose-300 uppercase tracking-widest text-[10px] font-bold mb-2">Fluxo NOK / contencao</p>
                            <ul className="space-y-1 text-sm text-slate-300">
                              {selectedOperationalDetails.operational.nokFlow.slice(0, 5).map((item) => (
                                <li key={item} className="flex items-start gap-2">
                                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedOperationalDetails.operational.troubleshooting.commonFailures.length > 0 && (
                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                            <p className="text-amber-300 uppercase tracking-widest text-[10px] font-bold mb-2">Troubleshooting</p>
                            <div className="space-y-2 text-sm text-slate-300">
                              <div>
                                <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Falhas</span>
                                <p className="mt-1">{selectedOperationalDetails.operational.troubleshooting.commonFailures.slice(0, 3).join(' " ')}</p>
                              </div>
                              {selectedOperationalDetails.operational.troubleshooting.probableCauses.length > 0 && (
                                <div>
                                  <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Causas</span>
                                  <p className="mt-1">{selectedOperationalDetails.operational.troubleshooting.probableCauses.slice(0, 3).join(' " ')}</p>
                                </div>
                              )}
                              {selectedOperationalDetails.operational.troubleshooting.immediateActions.length > 0 && (
                                <div>
                                  <span className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Acao imediata</span>
                                  <p className="mt-1">{selectedOperationalDetails.operational.troubleshooting.immediateActions.slice(0, 3).join(' " ')}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {(childMap.get(selectedOperationalDetails.node.id)?.length || 0) > 0 ? (
                            <button
                              onClick={() => toggleCollapseForNode(selectedOperationalDetails.node.id)}
                              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                            >
                              {collapsedNodeIds.includes(selectedOperationalDetails.node.id) ? 'Expandir filhos' : 'Recolher filhos'}
                            </button>
                          ) : null}
                          <button
                            onClick={() => {
                              const targetNode = selectedOperationalDetails.node;
                              setCenter(targetNode.position.x + 140, targetNode.position.y + 50, { zoom: 1.15, duration: 500 });
                            }}
                            className="px-3 py-2 rounded-xl border border-blue-500/20 bg-blue-500/10 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-colors"
                          >
                            Focar no mapa
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-slate-500 leading-relaxed">
                        Selecione um no para visualizar CTQ, risco, rastreabilidade, plano de reacao e troubleshooting.
                      </div>
                    )}
                  </div>
                </Panel>
              )}

              {!isPresenting && isGuidedCreationMap && !creationCoachDismissed && nodes.length <= 8 && creationSuggestions.length > 0 && (
                <Panel position="bottom-center" className="mb-5 max-w-[min(760px,calc(100vw-32px))]">
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="rounded-2xl border border-blue-400/20 bg-[#0b1629]/95 p-4 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {nodes.length === 1 ? 'Seu mapa está pronto para começar' : 'Qual parte deseja adicionar agora?'}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-slate-400">
                            Estas são apenas sugestões. Clique para adicionar ou use <strong className="text-slate-300">Adicionar</strong> para criar livremente.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCreationCoachDismissed(true)}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                        title="Ocultar sugestões"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {creationSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={suggestion.category}
                          type="button"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => addCreationSuggestion(suggestion)}
                          className="group rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition-all hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-blue-500/10"
                        >
                          <span className="block text-xs font-bold text-slate-200 group-hover:text-blue-200">+ {suggestion.label}</span>
                          <span className="mt-0.5 block text-[10px] text-slate-500">{suggestion.hint}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </Panel>
              )}
            </ReactFlow>
          ) : (
            <div className="absolute inset-0 overflow-hidden">
              <OperatorMode
                mapTitle={mapTitle}
                nodes={nodes}
                edges={edges}
                nodeDetailsMap={nodeDetailsMap}
                mode={viewMode as OperationalModeName}
                currentUserId={currentUser?.id || ''}
                assessmentRefreshToken={assessmentRefreshToken + localAssessmentRefreshToken}
                assessments={assessments}
                assessmentLoading={assessmentsLoading}
                onStartAssessment={handleStartAssessment}
                onOpenAssessments={() => setShowAssessmentDashboard(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tooltip for Presentation Hover */}
      {isPresenting && (!presentationGuidedMode || !presentationAutoPlay) && hoveredNode && hoverPosition && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none w-[480px] max-w-[90vw] bg-black/60 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl p-6"
          style={{ left: tooltipPos.left, top: tooltipPos.top, transform: 'translate(-50%, 0)' }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl shrink-0">
              <Target size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-base leading-tight">{hoveredNode.data?.label || 'Nó sem título'}</h3>
              <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold mt-1">{hoveredNode.data?.category || 'processo'}</p>
            </div>
      </div>

      <div className="text-sm text-slate-300 leading-relaxed line-clamp-5">
            {nodeDetailsMap[hoveredNode.id]?.description || 'Nenhuma descrição detalhada disponível para este nó.'}
          </div>

          {(nodeDetailsMap[hoveredNode.id]?.tasks?.length || 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Ações Registradas</span>
              <div className="space-y-2">
                {nodeDetailsMap[hoveredNode.id]?.tasks.slice(0, 3).map((t: any) => (
                  <div key={t.id} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${t.completed ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                    <span className={t.completed ? 'line-through text-slate-500' : ''}>{t.text}</span>
                  </div>
                ))}
                {(nodeDetailsMap[hoveredNode.id]?.tasks?.length || 0) > 3 && (
                  <div className="text-xs text-blue-400 font-medium pl-4">+ {(nodeDetailsMap[hoveredNode.id]?.tasks?.length || 0) - 3} outras...</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Search Panel */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 pointer-events-none">
          <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 pointer-events-auto">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Search size={20} className="text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Buscar nós, descrições, tarefas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>Use ESC para fechar</span>
                <span>{searchResults.length} resultados</span>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      setCurrentResultIndex(index);
                      navigateToResult(index);
                      setIsSearchOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                      index === currentResultIndex ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{result.label}</div>
                      <div className="text-xs text-slate-500">{result.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Search size={32} className="mx-auto mb-3 opacity-20" />
                <p>Nenhum resultado encontrado</p>
                <p className="text-sm mt-1">Tente buscar por outro termo</p>
              </div>
            )}

            {searchResults.length > 1 && (
              <div className="p-3 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
                <button
                  onClick={prevResult}
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-slate-400">
                  {currentResultIndex + 1} de {searchResults.length}
                </span>
                <button
                  onClick={nextResult}
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Próximo →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Version History Panel */}
      {isVersionPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col pointer-events-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Histórico de Versões</h3>
                <p className="text-sm text-slate-400 mt-1">Restaure versões anteriores do mapa</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".json"
                  id="import-versions"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const text = await file.text();
                      const data = JSON.parse(text);
                      if (data.versions && Array.isArray(data.versions)) {
                        const confirmed = await confirm({
                          title: 'CONFIRMAR IMPORTAO',
                          message: `Você está prestes a importar ${data.versions.length} versões.\n\nElas serão adicionadas ao histórico existente.`,
                          confirmText: 'Importar',
                          cancelText: 'Cancelar',
                          type: 'warning'
                        });
                        if (confirmed) {
                          data.versions.forEach((v: any) => saveVersion(v.userName, v.userEmail, v.description, v.nodes, v.edges, v.nodeDetails));
                          success('Versões importadas', `${data.versions.length} versões foram adicionadas ao histórico.`);
                        }
                      } else {
                        alert('Arquivo inválido. Formato incorreto.');
                      }
                    } catch (err) {
                      alert('L Erro ao importar: ' + (err as Error).message);
                    }
                    e.target.value = '';
                  }}
                />
                <label
                  htmlFor="import-versions"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  Importar JSON
                </label>
                <button
                  onClick={exportVersions}
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Exportar JSON
                </button>
                <button
                  onClick={() => setIsVersionPanelOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {versions.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Nenhuma versão salva</p>
                  <p className="text-sm mt-1">Use "Salvar Verso" para criar snapshots</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.slice().reverse().map((version, index) => (
                    <div key={version.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                              v{versions.length - index}
                            </span>
                            <span className="text-sm text-slate-400">
                              {new Date(version.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{version.description}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Por: {version.userName}</span>
                            <span>"</span>
                            <span>{version.nodes.length} nós</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={async () => {
                              const restored = restoreVersion(version.id);
                              if (restored) {
                                const confirmed = await confirm({
                                  title: 'RESTAURAR VERSO',
                                  message: 'Esta ação ir RESTAURAR uma versão anterior.\n\nAs alterações ATUAIS serão SUBSTITUÍDAS.',
                                  confirmText: 'Restaurar',
                                  cancelText: 'Cancelar',
                                  type: 'warning'
                                });
                                if (confirmed) {
                                  setNodes(restored.nodes);
                                  setEdges(restored.edges);
                                  setNodeDetailsMap(restored.nodeDetails);
                                  setIsVersionPanelOpen(false);
                                  success('Verso restaurada', 'O mapa foi restaurado para a versão selecionada.');
                                }
                              }
                            }}
                            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Restaurar esta versão"
                          >
                            <RotateCcw size={18} />
                          </button>
                          <button
                            onClick={async () => {
                              const confirmed = await confirm({
                                title: 'EXCLUIR VERSO',
                                message: 'Esta ação ir EXCLUIR esta versão permanentemente.',
                                confirmText: 'Excluir',
                                cancelText: 'Cancelar',
                                type: 'danger'
                              });
                              if (confirmed) {
                                deleteVersion(version.id);
                                success('Verso excluda', 'A versão foi removida do histórico.');
                              }
                            }}
                            className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir versão"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {versions.length > 0 && (
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                <span className="text-sm text-slate-400">{versions.length} versões salvas</span>
                <button
                  onClick={clearAllVersions}
                  className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  Limpar tudo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assessment Modals */}
      {showAssessmentQuiz && selectedAssessment && assessmentQuestions.length > 0 && (
          <AssessmentQuiz
            assessment={selectedAssessment}
            questions={assessmentQuestions}
            userId={currentUser?.id || ''}
            onComplete={(result) => {
            if (result.passed) {
              success('Parabéns!', `${result.score}% de aproveitamento e +${result.xpEarned} XP.`);
            } else if (result.blockedUntil) {
              warning('Avaliação bloqueada', `Você atingiu 3 tentativas. Liberação em ${new Date(result.blockedUntil).toLocaleDateString('pt-BR')}.`);
            } else {
              warning('Tente novamente', `Você ainda pode tentar mais ${result.attemptsRemaining || 0} vez(es).`);
            }
            fetchAssessments(mapId, false, true);
            setLocalAssessmentRefreshToken((token) => token + 1);
          }}
          onOpenCertificate={(attemptId, userId) => setCertificateTarget({ attemptId, userId })}
          onOpenRanking={() => setShowRankingLeaderboard(true)}
          onCancel={() => {
            setShowAssessmentQuiz(false);
            setSelectedAssessment(null);
            setAssessmentQuestions([]);
          }}
        />
      )}

      {showAssessmentAdmin && (
        <AssessmentAdmin
          processItemId={mapId}
          processTitle={mapTitle}
          currentUser={currentUser}
          onClose={() => setShowAssessmentAdmin(false)}
        />
      )}

      {showAssessmentDashboard && (
        <AssessmentDashboard
          currentUserId={currentUser?.id || ''}
          onClose={() => setShowAssessmentDashboard(false)}
        />
      )}

      {showRankingLeaderboard && (
        <RankingLeaderboard onClose={() => setShowRankingLeaderboard(false)} />
      )}

      {certificateTarget && (
        <CertificateGenerator
          attemptId={certificateTarget.attemptId}
          userId={certificateTarget.userId}
          onClose={() => setCertificateTarget(null)}
        />
      )}

      <NodeModal
        isOpen={!!selectedNodeId && !!selectedNodeData && !isPresenting}
        onClose={closeModal}
        nodeData={selectedNodeData}
        nodeId={selectedNodeId || ''}
        details={getCurrentNodeDetails()}
        onUpdateDetails={handleUpdateDetails}
        onUpdateNodeLabel={handleUpdateNodeLabel}
        currentUser={currentUser}
        suggestionCorpus={suggestionCorpus}
        writingSuggestionsEnabled={writingSuggestionsEnabled}
        onWritingSuggestionsEnabledChange={handleWritingSuggestionsEnabledChange}
      />

      <AddNodeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNodeSafe}
        nodes={nodes}
        edges={edges}
        selectedNodeId={selectedNodeId}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Work Instruction Export Modal */}
      <WorkInstructionExport
        isOpen={isWorkInstructionOpen}
        onClose={() => setIsWorkInstructionOpen(false)}
        mapTitle={mapTitle}
        nodes={nodes}
        edges={edges}
        nodeDetails={nodeDetailsMap}
        currentUser={currentUser}
      />
    </div>
  );
}

export default function App() {
  // All state hooks must be at the top before any conditionals
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string; department?: string } | null>(null);
  const [currentMap, setCurrentMap] = useState<{ id: string; title: string } | null>(null);
  const [currentMarkdown, setCurrentMarkdown] = useState<{ id: string; title: string; content: string } | null>(null);
  const [currentSector3D, setCurrentSector3D] = useState<{ id: string; title: string } | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [assessmentRefreshToken, setAssessmentRefreshToken] = useState(0);

  // Preferences system
  const { preferences, setPreferences } = usePreferences();

  // Audit log system
  const { addLog, logs: auditLogs } = useAuditLog(preferences.enableAuditLog);

  // Session timeout tracking
  const lastActivityRef = useRef<number>(Date.now());

  // Check for password reset token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    if (accessToken) {
      setIsResetPasswordOpen(true);
    }
  }, []);


  // Session timeout check
  useEffect(() => {
    if (!isAuthenticated || showSessionExpired) return;

    const checkTimeout = () => {
      const inactive = Date.now() - lastActivityRef.current;
      const timeoutMs = preferences.sessionTimeout * 60 * 1000;

      if (inactive > timeoutMs) {
        addLog({
          userName: currentUser?.name || 'Sistema',
          userEmail: currentUser?.email || '-',
          userRole: currentUser?.role || '-',
          action: 'Sessão Expirada',
          details: `Sessão encerrada por inatividade de ${preferences.sessionTimeout} minutos`,
          category: 'security'
        });
        setShowSessionExpired(true);
      }
    };

    const interval = setInterval(checkTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated, showSessionExpired, preferences.sessionTimeout, addLog, currentUser]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [isAuthenticated]);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { supabase } = await import('./lib/supabase');
      // First try: exact case-insensitive email match
      let { data: user, error } = await supabase
        .from('tecno_users')
        .select('id, name, email, role, department, status, password')
        .ilike('email', email.trim())
        .neq('status', 'Inativo')
        .single();

      // Fallback: if not found, search all active users and match manually (handles typos in stored email)
      if (error || !user) {
        const { data: allUsers } = await supabase
          .from('tecno_users')
          .select('id, name, email, role, department, status, password')
          .neq('status', 'Inativo');
        user = (allUsers || []).find((u: any) =>
          u.email?.toLowerCase() === email.trim().toLowerCase() && u.password === password
        ) || null;
        error = null;
      }

      if (!error && user && user.password === password) {
        setIsAuthenticated(true);
        setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role, department: user.department ?? undefined });
        addLog({
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          action: 'Login',
          details: `Usuário autenticado com sucesso`,
          category: 'auth'
        });
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    addLog({
      userName: 'Desconhecido',
      userEmail: email,
      userRole: '-',
      action: 'Falha de Login',
      details: `Tentativa de login falhou`,
      category: 'security'
    });
    return false;
  };

  const handleLogout = () => {
    addLog({
      userName: currentUser?.name || 'Desconhecido',
      userEmail: currentUser?.email || '-',
      userRole: currentUser?.role || '-',
      action: 'Logout',
      details: 'Usuário encerrou a sessão',
      category: 'auth'
    });
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentMap(null);
    setCurrentMarkdown(null);
    setCurrentSector3D(null);
  };

  // Early return for login screen (allowed after all hooks)
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const handleUpdateMarkdown = (id: string, newContent: string) => {
    // In a real app, this would update the global state or dashboard items.
    // For now we just update it locally to test the component behavior.
    if (currentMarkdown && currentMarkdown.id === id) {
      setCurrentMarkdown({ ...currentMarkdown, content: newContent });
    }
  };

  if (currentSector3D) {
    return (
      <Suspense fallback={<AppLoadingScreen />}>
        <Sector3DView 
          id={currentSector3D.id}
          title={currentSector3D.title}
          onClose={() => setCurrentSector3D(null)}
        />
      </Suspense>
    );
  }

  if (currentMarkdown) {
    return (
      <Suspense fallback={<AppLoadingScreen />}>
        <MarkdownView
          title={currentMarkdown.title}
          initialContent={currentMarkdown.content}
          onBack={() => setCurrentMarkdown(null)}
          onSave={(newContent) => handleUpdateMarkdown(currentMarkdown.id, newContent)}
        />
      </Suspense>
    );
  }

  if (currentMap) {
    return (
      <Suspense fallback={<AppLoadingScreen />}>
        <MapErrorBoundary resetKey={currentMap.id} onBack={() => setCurrentMap(null)}>
          <ReactFlowProvider>
            <Flow 
              mapId={currentMap.id} 
              mapTitle={currentMap.title} 
              onBack={() => setCurrentMap(null)}
              currentUser={currentUser}
              assessmentRefreshToken={assessmentRefreshToken}
              preferences={preferences}
            />
          </ReactFlowProvider>
        </MapErrorBoundary>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<AppLoadingScreen />}>
      <Dashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        preferences={preferences}
        setPreferences={setPreferences}
        enableAuditLog={preferences.enableAuditLog}
        addLog={addLog}
        onOpenMap={(id, title) => {
          addLog({
            userName: currentUser.name || 'Desconhecido',
            userEmail: currentUser.email || '-',
            userRole: currentUser.role || '-',
            action: 'Abrir Mapa',
            details: `Mapa aberto: ${title}`,
            category: 'data'
          });
          setCurrentMap({ id, title });
        }}
        onOpenMarkdown={(id, title, content) => {
          addLog({
            userName: currentUser.name || 'Desconhecido',
            userEmail: currentUser.email || '-',
            userRole: currentUser.role || '-',
            action: 'Abrir Documento',
            details: `Documento markdown aberto: ${title}`,
            category: 'data'
          });
          setCurrentMarkdown({ id, title, content });
        }}
        onOpenSector3D={(id, title) => {
          addLog({
            userName: currentUser.name || 'Desconhecido',
            userEmail: currentUser.email || '-',
            userRole: currentUser.role || '-',
            action: 'Abrir Setor 3D',
            details: `Visualização 3D aberta: ${title}`,
            category: 'data'
          });
          setCurrentSector3D({ id, title });
        }}
      />

      {/* Session Expired Modal */}
      <AnimatePresence>
        {showSessionExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-sm mx-4 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock size={24} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Sessão Expirada</h2>
                  <p className="text-sm text-amber-400/80">Por inatividade</p>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Sua sessão foi encerrada automaticamente após{' '}
                  <span className="font-semibold text-white">{preferences.sessionTimeout} minutos</span>{' '}
                  de inatividade. Faça login novamente para continuar.
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                    setShowSessionExpired(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  <LogOut size={16} /> Fazer Login Novamente
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />
    </Suspense>
  );
}

