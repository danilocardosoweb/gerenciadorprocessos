import { Handle, Position } from '@xyflow/react';
import type { ReactNode } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Bug,
  ClipboardCheck,
  ClipboardList,
  Crosshair,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  FileSearch,
  Factory,
  GitBranch,
  Lock,
  SearchCheck,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Target,
  Trash2,
  TriangleAlert,
  UnlockKeyhole,
  Users,
  Workflow,
  Wrench,
  XCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  buildOperationalBadges,
  getAdvancedNodeMeta,
  getRiskWeight,
  getSeverityWeight,
  normalizeOperationalMetadata,
} from '../lib/operationalModel';

const baseIconMap: Record<string, ReactNode> = {
  root: <Factory size={20} />,
  inputs: <ArrowRight size={18} />,
  outputs: <Target size={18} />,
  resources: <Settings size={18} />,
  people: <Users size={18} />,
  methods: <Workflow size={18} />,
  kpis: <Activity size={18} />,
  quality: <FileCheck2 size={18} />,
  safety: <ShieldCheck size={18} />,
  alerts: <TriangleAlert size={18} />,
  compliance: <ClipboardCheck size={18} />,
};

const advancedIconMap: Record<string, ReactNode> = {
  process: <Factory size={18} />,
  operation: <Workflow size={18} />,
  inspection: <SearchCheck size={18} />,
  decision: <GitBranch size={18} />,
  alert: <Siren size={18} />,
  risk: <ShieldAlert size={18} />,
  safety: <ShieldCheck size={18} />,
  ctq: <Crosshair size={18} />,
  error: <AlertCircle size={18} />,
  deviation: <TriangleAlert size={18} />,
  corrective_action: <Wrench size={18} />,
  root_cause: <Bug size={18} />,
  troubleshooting: <Bug size={18} />,
  record: <ClipboardList size={18} />,
  evidence: <FileSearch size={18} />,
  client: <Users size={18} />,
  audit: <ClipboardCheck size={18} />,
  critical_point: <Target size={18} />,
  nok: <XCircle size={18} />,
  ok: <BadgeCheck size={18} />,
  block: <Lock size={18} />,
  release: <UnlockKeyhole size={18} />,
};

const categoryColorMap: Record<string, string> = {
  root: 'bg-white/10 backdrop-blur-2xl border border-white/20 hover:border-white/40 shadow-2xl text-white',
  inputs: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-orange-400 text-slate-200',
  outputs: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-emerald-400 text-slate-200',
  resources: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-amber-400 text-slate-200',
  people: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-indigo-400 text-slate-200',
  methods: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-rose-400 text-slate-200',
  kpis: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-violet-400 text-slate-200',
  quality: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-emerald-400 text-slate-200',
  safety: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-yellow-400 text-slate-200',
  alerts: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-rose-500 text-slate-200',
  compliance: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-cyan-400 text-slate-200',
  default: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 text-slate-200',
};

const iconBgMap: Record<string, string> = {
  root: 'bg-blue-500/20 text-white',
  inputs: 'bg-orange-500/20 text-orange-400',
  outputs: 'bg-emerald-500/20 text-emerald-400',
  resources: 'bg-amber-500/20 text-amber-400',
  people: 'bg-indigo-500/20 text-indigo-400',
  methods: 'bg-rose-500/20 text-rose-400',
  kpis: 'bg-violet-500/20 text-violet-400',
  quality: 'bg-emerald-500/20 text-emerald-400',
  safety: 'bg-yellow-500/20 text-yellow-300',
  alerts: 'bg-rose-500/20 text-rose-400',
  compliance: 'bg-cyan-500/20 text-cyan-300',
  default: 'bg-white/10 text-slate-400',
};

const toneMap: Record<string, string> = {
  violet: 'bg-violet-500/15 text-violet-300 border border-violet-500/25',
  cyan: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25',
  blue: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  emerald: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
};

export function MindMapNode({ data, selected, id }: { data: any; selected: boolean; id: string }) {
  const safeData = data || {};
  const {
    label,
    nodeType,
    numberCode,
    isFocus,
    isMuted,
    onDelete,
    onDeleteConfirm,
    isAdmin,
    isPresenting,
    operational,
    childCount,
    isCollapsed,
    onToggleCollapse,
  } = safeData;

  const normalizedOperational = normalizeOperationalMetadata(operational ?? safeData, safeData);
  const advancedMeta = getAdvancedNodeMeta(normalizedOperational.nodeTypeAdvanced, safeData);
  const badges = buildOperationalBadges(normalizedOperational);
  const isRoot = nodeType === 'root';
  const normalizedNumberCode = String(numberCode || '');
  const codeDepth = normalizedNumberCode ? normalizedNumberCode.split('.').filter(Boolean).length : 0;
  const isMajorLevel = isRoot || normalizedNumberCode.endsWith('.0');
  const sizeClass = isRoot ?
     'min-w-[300px] max-w-[380px]'
    : codeDepth <= 2 ?
       'min-w-[250px] max-w-[300px]'
      : 'min-w-[210px] max-w-[260px]';
  const colorClass = categoryColorMap[nodeType] || categoryColorMap.default;
  const iconBgClass = iconBgMap[nodeType] || iconBgMap.default;
  const icon = advancedIconMap[normalizedOperational.nodeTypeAdvanced] || baseIconMap[nodeType];
  const severityWeight = getSeverityWeight(normalizedOperational.severity);
  const riskWeight = getRiskWeight(normalizedOperational.riskLevel);

  return (
    <div
      className={cn(
        'relative group rounded-2xl border px-4 py-3 transition-all duration-500 shadow-lg',
        sizeClass,
        colorClass,
        advancedMeta.accentClass,
        advancedMeta.glowClass,
        selected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0f172a]',
        isRoot && 'px-6 py-4',
        isMajorLevel && !isRoot && 'shadow-blue-500/10',
        isFocus && 'scale-[1.03] shadow-blue-500/25 shadow-2xl z-50 ring-2 ring-blue-400',
        isMuted && 'opacity-25 grayscale blur-[0.4px] scale-95',
        normalizedOperational.visualPriority === 'critical' && 'shadow-[0_0_30px_rgba(59,130,246,0.12)]',
        severityWeight >= 3 && 'border-white/20',
        riskWeight >= 3 && 'shadow-[0_0_22px_rgba(245,158,11,0.12)]',
      )}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-blue-400 !border-0" />

      <div className="flex items-start gap-3">
        {icon && (
          <div className={cn('p-2 rounded-lg flex items-center justify-center shrink-0', iconBgClass)}>
            {icon}
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0 gap-2">
          <div className="flex items-start justify-between gap-2">
            <span
              className={cn(
                'font-semibold leading-tight break-words whitespace-normal',
                isRoot ? 'text-white text-lg' : codeDepth <= 2 ? 'text-slate-100 text-sm' : 'text-slate-100 text-[13px]',
              )}
            >
              {normalizedNumberCode && (
                <span className="text-blue-400 font-mono mr-1.5">{normalizedNumberCode}</span>
              )}
              {label || 'Nó sem título'}
            </span>
            {!isRoot && (
              <span className={cn('shrink-0 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap', advancedMeta.badgeClass)}>
                {advancedMeta.label}
              </span>
            )}
          </div>

          {!isRoot && (
            <div className="flex flex-wrap gap-1.5">
              {badges.slice(0, 4).map((badge) => (
                <span
                  key={`${id}-${badge.label}`}
                  className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', toneMap[badge.tone] || toneMap.blue)}
                >
                  {badge.label}
                </span>
              ))}
              {normalizedOperational.requiredIATF && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300">
                  IATF {normalizedOperational.requiredIATF}
                </span>
              )}
              {normalizedOperational.inspectionFrequency && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300">
                  {normalizedOperational.inspectionFrequency}
                </span>
              )}
            </div>
          )}

          {!isRoot && (
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>Sev. {normalizedOperational.severity}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>Risco {normalizedOperational.riskLevel}</span>
              {normalizedOperational.troubleshooting.commonFailures.length > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>Troubleshooting</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-blue-400 !border-0" />

      {!isPresenting && Number(childCount) > 0 && typeof onToggleCollapse === 'function' && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleCollapse(id);
          }}
          className="absolute right-2 bottom-2 min-w-8 h-7 px-2 rounded-lg border border-blue-400/40 bg-[#0b1220] text-blue-300 shadow-lg flex items-center justify-center gap-1 hover:bg-blue-500 hover:text-white transition-colors z-20"
          title={isCollapsed ? `Expandir ${childCount} subitem(ns)` : `Recolher ${childCount} subitem(ns)`}
          aria-label={isCollapsed ? `Expandir ${childCount} subitem(ns)` : `Recolher ${childCount} subitem(ns)`}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          <span className="text-[9px] font-bold">{childCount}</span>
        </button>
      )}

      {isAdmin && !isPresenting && nodeType !== 'root' && (onDelete || onDeleteConfirm) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onDeleteConfirm) {
              onDeleteConfirm(id);
            } else if (onDelete) {
              onDelete(id);
            }
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
          title="Excluir no"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
