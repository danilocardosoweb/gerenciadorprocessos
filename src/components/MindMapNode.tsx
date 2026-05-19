import { Handle, Position } from '@xyflow/react';
import { cn } from '../lib/utils';
import { Target, ArrowRight, Settings, Users, FileText, Activity, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

const iconMap: Record<string, ReactNode> = {
  root: <Settings size={20} />,
  inputs: <ArrowRight size={18} />,
  outputs: <Target size={18} />,
  resources: <Settings size={18} />,
  people: <Users size={18} />,
  methods: <FileText size={18} />,
  kpis: <Activity size={18} />,
};

const categoryColorMap: Record<string, string> = {
  root: 'bg-white/10 backdrop-blur-2xl border border-white/20 hover:border-white/40 shadow-2xl text-white',
  inputs: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-orange-400 text-slate-200',
  outputs: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-emerald-400 text-slate-200',
  resources: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-amber-400 text-slate-200',
  people: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-indigo-400 text-slate-200',
  methods: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-rose-400 text-slate-200',
  kpis: 'bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/30 border-l-4 border-l-violet-400 text-slate-200',
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
  default: 'bg-white/10 text-slate-400',
};

export function MindMapNode({ data, selected, id }: { data: any; selected: boolean; id: string }) {
  const { label, nodeType, numberCode, isFocus, isMuted, onDelete, onDeleteConfirm, isAdmin, isPresenting } = data;
  
  const isRoot = nodeType === 'root';
  const colorClass = categoryColorMap[nodeType] || categoryColorMap.default;
  const iconBgClass = iconBgMap[nodeType] || iconBgMap.default;
  const icon = iconMap[nodeType];

  return (
    <div
      className={cn(
        'relative group min-w-[180px] rounded-xl border px-4 py-3 transition-all duration-500 shadow-lg',
        colorClass,
        selected && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0f172a]',
        isRoot && 'px-6 py-4',
        isFocus && 'scale-110 shadow-blue-500/20 shadow-2xl z-50 ring-2 ring-blue-400',
        isMuted && 'opacity-20 grayscale blur-[1px] scale-95'
      )}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-blue-400 !border-0" />
      
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn('p-2 rounded-lg flex items-center justify-center shrink-0', iconBgClass)}>
            {icon}
          </div>
        )}
        <div className="flex flex-col flex-1">
          <span className={cn('font-semibold leading-tight', isRoot ? 'text-white text-lg' : 'text-slate-100 text-sm')}>
            {numberCode && (
              <span className="text-blue-400 font-mono mr-1.5">{numberCode}</span>
            )}
            {label}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-blue-400 !border-0" />
      
      {/* Delete button - only for admins and non-root nodes, hidden during presentation */}
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
          title="Excluir nó (Admin)"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}
