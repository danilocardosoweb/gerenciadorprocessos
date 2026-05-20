import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, Clock, User, MessageSquare, CheckSquare,
  Flag, Building2, Tag, Link2, ChevronRight, Circle,
  CheckCircle2, AlertCircle, X, Zap, Eye,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
interface Department { id: string; name: string; color: string; icon: string }
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  start_date?: string;
  estimated_hours?: number;
  assigned_user?: { name: string; email: string };
  department_data?: Department;
  process_item?: { id: string; title: string; type: string };
  subtasks_count?: number;
  comments_count?: number;
  created_at: string;
  visibility: 'private' | 'department' | 'public';
}

// ── Configs ────────────────────────────────────────────────────────────────
const statusConfig = {
  backlog:     { label: 'Backlog',      color: 'text-slate-400',  bg: 'bg-slate-500/15',  dot: 'bg-slate-400',   icon: Circle },
  todo:        { label: 'A Fazer',      color: 'text-blue-400',   bg: 'bg-blue-500/15',   dot: 'bg-blue-400',    icon: Circle },
  in_progress: { label: 'Em Progresso', color: 'text-amber-400',  bg: 'bg-amber-500/15',  dot: 'bg-amber-400',   icon: Clock },
  review:      { label: 'Em Revisão',   color: 'text-purple-400', bg: 'bg-purple-500/15', dot: 'bg-purple-400',  icon: AlertCircle },
  done:        { label: 'Concluído',    color: 'text-emerald-400',bg: 'bg-emerald-500/15',dot: 'bg-emerald-400', icon: CheckCircle2 },
  cancelled:   { label: 'Cancelado',    color: 'text-red-400',    bg: 'bg-red-500/15',    dot: 'bg-red-400',     icon: X },
};

const priorityConfig = {
  low:    { label: 'Baixa',   chip: 'bg-slate-500/15 text-slate-400 border-slate-500/25', bar: 'from-slate-500 to-slate-400' },
  medium: { label: 'Média',   chip: 'bg-blue-500/15  text-blue-400  border-blue-500/25',  bar: 'from-blue-500  to-cyan-400'  },
  high:   { label: 'Alta',    chip: 'bg-amber-500/15 text-amber-400 border-amber-500/25', bar: 'from-amber-500 to-orange-400' },
  urgent: { label: 'Urgente', chip: 'bg-red-500/15   text-red-400   border-red-500/25',   bar: 'from-red-500   to-pink-400'  },
};

// ── Tooltip peek (hover) ───────────────────────────────────────────────────
interface TooltipPeekProps {
  task: Task;
  anchorEl: HTMLElement;
  onClose: () => void;
}

function TooltipPeek({ task, anchorEl, onClose }: TooltipPeekProps) {
  const rect = anchorEl.getBoundingClientRect();
  const st = statusConfig[task.status];
  const pr = priorityConfig[task.priority];
  const StatusIcon = st.icon;

  // Position: prefer right side, fall back to left
  const spaceRight = window.innerWidth - rect.right;
  const peekWidth = 320;
  let left = rect.right + 12;
  if (spaceRight < peekWidth + 20) left = rect.left - peekWidth - 12;
  const top = Math.min(rect.top, window.innerHeight - 400);

  return createPortal(
    <motion.div
      initial={{ opacity: 0, x: spaceRight >= peekWidth + 20 ? -12 : 12, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: spaceRight >= peekWidth + 20 ? -8 : 8, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      style={{ position: 'fixed', top, left, width: peekWidth, zIndex: 9990 }}
      className="pointer-events-none"
    >
      <div className="bg-[#111c35]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Priority gradient bar */}
        <div className={cn('h-0.5 w-full bg-gradient-to-r', pr.bar)} />

        <div className="p-4 space-y-3">
          {/* Title + status */}
          <div className="flex items-start gap-2">
            <div className={cn('mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center', st.bg)}>
              <StatusIcon size={11} className={st.color} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-snug">{task.title}</h3>
              <span className={cn('text-[10px] font-semibold', st.color)}>{st.label}</span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-[11px] text-slate-400 leading-relaxed border-l-2 border-blue-500/30 pl-2.5">
              {task.description}
            </p>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {task.assigned_user && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold shrink-0">
                  {task.assigned_user.name.charAt(0)}
                </div>
                <span className="truncate">{task.assigned_user.name.split(' ')[0]}</span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar size={10} className="shrink-0" />
                <span>{new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {task.department_data && (
              <div className="flex items-center gap-1.5 text-slate-400 col-span-2">
                <Building2 size={10} className="shrink-0" style={{ color: task.department_data.color }} />
                <span style={{ color: task.department_data.color }}>{task.department_data.name}</span>
              </div>
            )}
            {task.estimated_hours && (
              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={10} className="shrink-0" />
                <span>{task.estimated_hours}h estimadas</span>
              </div>
            )}
          </div>

          {/* Chips row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-bold border', pr.chip)}>
              {pr.label}
            </span>
            {(task.comments_count ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-full">
                <MessageSquare size={8} />{task.comments_count}
              </span>
            )}
            {(task.subtasks_count ?? 0) > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded-full">
                <CheckSquare size={8} />{task.subtasks_count} subtarefas
              </span>
            )}
            {task.process_item && (
              <span className="flex items-center gap-0.5 text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full border border-indigo-500/20">
                <Link2 size={8} />{task.process_item.title}
              </span>
            )}
          </div>

          {/* Hint */}
          <p className="text-[9px] text-slate-600 flex items-center gap-1 pt-0.5 border-t border-white/[0.04]">
            <Eye size={9} />Clique para abrir detalhes completos
          </p>
        </div>
      </div>
    </motion.div>,
    document.body
  );
}

// ── Full Quick View Modal ──────────────────────────────────────────────────
interface QuickViewModalProps {
  task: Task;
  onClose: () => void;
}

function QuickViewModal({ task, onClose }: QuickViewModalProps) {
  const st = statusConfig[task.status];
  const pr = priorityConfig[task.priority];
  const StatusIcon = st.icon;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const daysLeft = task.due_date
    ? Math.ceil((new Date(task.due_date).getTime() - Date.now()) / 86400000)
    : null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="qv-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9980] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,10,25,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          key="qv-card"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-[#0e1a30] border border-white/10 rounded-3xl shadow-2xl shadow-black/70 overflow-hidden"
        >
          {/* Gradient header bar */}
          <div className={cn('h-1 w-full bg-gradient-to-r', pr.bar)} />

          {/* Header */}
          <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Status circle */}
              <div className={cn('mt-1 w-8 h-8 rounded-xl flex items-center justify-center shrink-0', st.bg)}>
                <StatusIcon size={16} className={st.color} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white leading-tight">{task.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('text-[11px] font-semibold', st.color)}>{st.label}</span>
                  <span className="text-slate-700">·</span>
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold border', pr.chip)}>{pr.label}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Description */}
          {task.description ? (
            <div className="mx-6 mb-4 p-3.5 bg-white/[0.03] border border-white/[0.05] rounded-xl">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          ) : (
            <div className="mx-6 mb-4 p-3 rounded-xl border border-dashed border-white/[0.07] text-center">
              <p className="text-xs text-slate-600 italic">Sem descrição</p>
            </div>
          )}

          {/* Info grid */}
          <div className="mx-6 mb-5 grid grid-cols-2 gap-2.5">
            {/* Assignee */}
            {task.assigned_user && (
              <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {task.assigned_user.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[9px] text-slate-600 uppercase tracking-wide font-semibold">Responsável</p>
                  <p className="text-xs text-white font-semibold">{task.assigned_user.name.split(' ')[0]}</p>
                </div>
              </div>
            )}

            {/* Due date */}
            {task.due_date && (
              <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5">
                <div className={cn(
                  'w-7 h-7 rounded-xl flex items-center justify-center shrink-0',
                  daysLeft !== null && daysLeft < 0 ? 'bg-red-500/20' :
                  daysLeft !== null && daysLeft <= 3 ? 'bg-amber-500/20' : 'bg-blue-500/20'
                )}>
                  <Calendar size={14} className={
                    daysLeft !== null && daysLeft < 0 ? 'text-red-400' :
                    daysLeft !== null && daysLeft <= 3 ? 'text-amber-400' : 'text-blue-400'
                  } />
                </div>
                <div>
                  <p className="text-[9px] text-slate-600 uppercase tracking-wide font-semibold">Prazo</p>
                  <p className="text-xs text-white font-semibold">
                    {new Date(task.due_date).toLocaleDateString('pt-BR')}
                  </p>
                  {daysLeft !== null && (
                    <p className={cn('text-[9px]',
                      daysLeft < 0 ? 'text-red-400' : daysLeft <= 3 ? 'text-amber-400' : 'text-slate-500'
                    )}>
                      {daysLeft < 0 ? `Atrasado ${Math.abs(daysLeft)}d` : daysLeft === 0 ? 'Hoje' : `${daysLeft}d restantes`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Department */}
            {task.department_data && (
              <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: task.department_data.color + '22' }}>
                  <Building2 size={14} style={{ color: task.department_data.color }} />
                </div>
                <div>
                  <p className="text-[9px] text-slate-600 uppercase tracking-wide font-semibold">Departamento</p>
                  <p className="text-xs font-semibold" style={{ color: task.department_data.color }}>
                    {task.department_data.name}
                  </p>
                </div>
              </div>
            )}

            {/* Hours */}
            {task.estimated_hours && (
              <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-600 uppercase tracking-wide font-semibold">Estimativa</p>
                  <p className="text-xs text-white font-semibold">{task.estimated_hours}h</p>
                </div>
              </div>
            )}

            {/* Process item */}
            {task.process_item && (
              <div className="col-span-2 flex items-center gap-2.5 bg-indigo-500/[0.06] border border-indigo-500/20 rounded-xl p-2.5">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Link2 size={14} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-600 uppercase tracking-wide font-semibold">Processo Vinculado</p>
                  <p className="text-xs text-indigo-300 font-semibold">{task.process_item.title}</p>
                </div>
              </div>
            )}
          </div>

          {/* Stats footer */}
          <div className="px-6 pb-5 flex items-center gap-4">
            {(task.comments_count ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <MessageSquare size={12} />
                <span>{task.comments_count} comentário{(task.comments_count ?? 0) !== 1 ? 's' : ''}</span>
              </div>
            )}
            {(task.subtasks_count ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <CheckSquare size={12} />
                <span>{task.subtasks_count} subtarefa{(task.subtasks_count ?? 0) !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="ml-auto text-[10px] text-slate-600">
              Criado {new Date(task.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Action hint */}
          <div className="px-6 pb-4">
            <p className="text-[10px] text-slate-600 flex items-center gap-1.5">
              <Zap size={9} className="text-blue-500/60" />
              Duplo clique no card para abrir os detalhes completos com comentários e alertas
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// ── Main exported hook + trigger ──────────────────────────────────────────
interface UseQuickPeekReturn {
  hoverProps: (task: Task) => {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
  };
  previewButton: (task: Task) => React.ReactNode;
  portal: React.ReactNode;
}

export function useQuickPeek(): UseQuickPeekReturn {
  const [tooltip, setTooltip] = useState<{ task: Task; anchor: HTMLElement } | null>(null);
  const [modal, setModal] = useState<Task | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hoverProps = (task: Task) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      hoverTimer.current = setTimeout(() => setTooltip({ task, anchor: el }), 500);
    },
    onMouseLeave: () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      setTooltip(null);
    },
  });

  const previewButton = (task: Task) => (
    <button
      onClick={(e) => { e.stopPropagation(); setModal(task); }}
      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
      title="Visualização rápida"
    >
      <Eye size={12} />
    </button>
  );

  const portal = (
    <>
      <AnimatePresence>
        {tooltip && (
          <TooltipPeek
            key={tooltip.task.id}
            task={tooltip.task}
            anchorEl={tooltip.anchor}
            onClose={() => setTooltip(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {modal && (
          <QuickViewModal
            key={modal.id + '-modal'}
            task={modal}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );

  return { hoverProps, previewButton, portal };
}
