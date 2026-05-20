import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Filter, Search, Calendar, Clock, User, Tag, 
  CheckCircle2, Circle, AlertCircle, ArrowRight, ArrowLeft,
  MoreVertical, ChevronDown, ChevronRight, Paperclip,
  MessageSquare, LayoutGrid, List, Kanban, X, Trash2,
  Edit2, Save, CheckSquare, GripVertical, Flag, Building2,
  Link2, Bell, BellRing, Send, AtSign, Check, Pencil, FileText,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { ProcessItem } from './Dashboard';
import { CreateTaskModal } from './CreateTaskModal';
import { ConfirmModal } from './ConfirmModal';
import { MeetingMinutesModal } from './MeetingMinutesModal';
import { usePermissions } from '../lib/permissions';
import { useQuickPeek } from './TaskQuickPeek';

// Types
interface Department {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'epic' | 'task' | 'subtask';
  parent_id?: string | null;
  epic_id?: string | null;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string | null;
  department_id?: string | null;
  department?: string;
  process_item_id?: string | null;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  visibility: 'private' | 'department' | 'public';
  estimated_hours?: number;
  actual_hours?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Join data
  assigned_user?: { name: string; email: string };
  process_item?: ProcessItem;
  department_data?: Department;
  subtasks_count?: number;
  comments_count?: number;
}

interface TaskManagerProps {
  currentUser: { id: string; name: string; email: string; role: string } | null;
  processItems?: ProcessItem[];
  department?: string;
}

type ViewMode = 'kanban' | 'list' | 'calendar';
type FilterStatus = 'all' | Task['status'];

const statusConfig = {
  backlog: { label: 'Backlog', color: 'bg-slate-500', icon: Circle },
  todo: { label: 'A Fazer', color: 'bg-blue-500', icon: Circle },
  in_progress: { label: 'Em Progresso', color: 'bg-amber-500', icon: Clock },
  review: { label: 'Em Revisão', color: 'bg-purple-500', icon: AlertCircle },
  done: { label: 'Concluído', color: 'bg-emerald-500', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-500', icon: X },
};

const priorityConfig = {
  low:    { label: 'Baixa',   color: 'text-slate-400', bg: 'bg-slate-500/10', bar: 'bg-slate-500',  chip: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  medium: { label: 'Média',   color: 'text-blue-400',  bg: 'bg-blue-500/10',  bar: 'bg-blue-500',   chip: 'bg-blue-500/10  text-blue-400  border-blue-500/20'  },
  high:   { label: 'Alta',    color: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500',  chip: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  urgent: { label: 'Urgente', color: 'text-red-400',   bg: 'bg-red-500/10',   bar: 'bg-red-500',    chip: 'bg-red-500/10   text-red-400   border-red-500/20'   },
};

export function TaskManager({ currentUser, processItems, department }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string }[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ taskId: string; title: string } | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailTab, setDetailTab] = useState<'details' | 'comments' | 'alerts'>('details');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Task>>({});
  const [comments, setComments] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newAlert, setNewAlert] = useState({ message: '', to_user_id: '', type: 'info' as 'info' | 'warning' | 'urgent' });
  const [alertUserDropOpen, setAlertUserDropOpen] = useState(false);
  const [minutesOpen, setMinutesOpen] = useState(false);

  // Permissions — centralized via RBAC
  const perms = usePermissions(currentUser as any);
  const canCreate   = perms.can.createTask;
  const canDelete   = perms.can.deleteAnyTask;
  const canApprove  = perms.can.approveTask;
  const canAssign   = perms.can.assignTask;
  const canMinutes  = perms.can.generateMinutes;

  // Quick Peek
  const { hoverProps, previewButton, portal: quickPeekPortal } = useQuickPeek();

  // Fetch tasks, users and departments
  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:users!tasks_assigned_to_fkey(name, email),
          process_item:process_items(id, title, type),
          department_data:departments(id, name, color, icon)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Get subtasks count for each task
      const tasksWithCounts = await Promise.all(
        (data || []).map(async (task: Task) => {
          const { count } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', task.id);
          
          const { count: commentsCount } = await supabase
            .from('task_comments')
            .select('*', { count: 'exact', head: true })
            .eq('task_id', task.id);
          
          return { ...task, subtasks_count: count || 0, comments_count: commentsCount || 0 };
        })
      );
      
      setTasks(tasksWithCounts);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    }
  };

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (filterDepartment !== 'all' && task.department_id !== filterDepartment) return false;
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Visibility filter
      if (task.visibility === 'private' && task.created_by !== currentUser?.id) return false;
      
      return true;
    });
  }, [tasks, filterStatus, filterPriority, filterDepartment, searchQuery, currentUser]);

  // Group by status for kanban
  const kanbanColumns = useMemo(() => {
    const columns: Record<string, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      done: [],
      cancelled: [],
    };
    
    filteredTasks.forEach(task => {
      if (columns[task.status]) {
        columns[task.status].push(task);
      }
    });
    
    return columns;
  }, [filteredTasks]);

  // Group by epic for list view
  const epics = useMemo(() => {
    return filteredTasks.filter(t => t.type === 'epic');
  }, [filteredTasks]);

  const getTasksByEpic = (epicId: string) => {
    return filteredTasks.filter(t => t.epic_id === epicId && t.type === 'task');
  };

  const toggleEpic = (epicId: string) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(epicId)) {
      newExpanded.delete(epicId);
    } else {
      newExpanded.add(epicId);
    }
    setExpandedEpics(newExpanded);
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          created_by: currentUser?.id,
          department: department,
        })
        .select()
        .single();

      if (error) throw error;
      
      setTasks(prev => [data, ...prev]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating task:', err);
      alert('Erro ao criar tarefa');
    }
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    if (!canDelete) return;
    setConfirmDelete({ taskId, title: taskTitle });
  };

  const doDeleteTask = async () => {
    if (!confirmDelete) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', confirmDelete.taskId);
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== confirmDelete.taskId && t.parent_id !== confirmDelete.taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'done') updates.completed_at = new Date().toISOString();
    else updates.completed_at = null;

    // Optimistic update — instant UI
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

    // Sync to Supabase in background
    supabase.from('tasks').update(updates).eq('id', taskId)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating task:', error);
          // Revert on failure
          setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status } : t));
        }
      });
  };

  const statusOrder = ['backlog', 'todo', 'in_progress', 'review', 'done', 'cancelled'] as Task['status'][];

  const getPrevNextStatus = (current: Task['status']) => {
    const idx = statusOrder.indexOf(current);
    return {
      prev: idx > 0 ? statusOrder[idx - 1] : null,
      next: idx < statusOrder.length - 1 ? statusOrder[idx + 1] : null,
    };
  };

  const fetchComments = useCallback(async (taskId: string) => {
    const { data } = await supabase
      .from('task_comments')
      .select('*, user:users!task_comments_user_id_fkey(name, email)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    setComments(data || []);
  }, []);

  const fetchAlerts = useCallback(async (taskId: string) => {
    const { data } = await supabase
      .from('task_alerts')
      .select('*, from_user:users!task_alerts_from_user_id_fkey(name), to_user:users!task_alerts_to_user_id_fkey(name)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    setAlerts(data || []);
  }, []);

  const openDetail = (task: Task) => {
    setDetailTask(task);
    setDetailTab('details');
    setEditValues({});
    setEditingField(null);
    fetchComments(task.id);
    fetchAlerts(task.id);
  };

  const saveField = async (field: string, value: any) => {
    if (!detailTask) return;
    const update = { [field]: value };
    setDetailTask(prev => prev ? { ...prev, ...update } : null);
    setTasks(prev => prev.map(t => t.id === detailTask.id ? { ...t, ...update } : t));
    setEditingField(null);
    await supabase.from('tasks').update(update).eq('id', detailTask.id);
  };

  const sendComment = async () => {
    if (!newComment.trim() || !detailTask || !currentUser) return;
    const payload = { task_id: detailTask.id, user_id: currentUser.id, content: newComment.trim() };
    const { data } = await supabase.from('task_comments').insert(payload).select('*, user:users!task_comments_user_id_fkey(name, email)').single();
    if (data) setComments(prev => [...prev, data]);
    setNewComment('');
  };

  const sendAlert = async () => {
    if (!newAlert.message.trim() || !detailTask || !currentUser) return;
    const payload = {
      task_id: detailTask.id,
      from_user_id: currentUser.id,
      to_user_id: newAlert.to_user_id || null,
      message: newAlert.message.trim(),
      type: newAlert.type,
    };
    const { data } = await supabase.from('task_alerts').insert(payload)
      .select('*, from_user:users!task_alerts_from_user_id_fkey(name), to_user:users!task_alerts_to_user_id_fkey(name)').single();
    if (data) setAlerts(prev => [data, ...prev]);
    setNewAlert({ message: '', to_user_id: '', type: 'info' });
  };

  const alertTypeConfig = {
    info:    { label: 'Info',    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   icon: Bell },
    warning: { label: 'Aviso',  color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  icon: AlertCircle },
    urgent:  { label: 'Urgente',color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    icon: BellRing },
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDrop = (e: React.DragEvent, newStatus: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) handleStatusChange(taskId, newStatus);
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  // Task Card Component
  const TaskCard = ({ task, isSubtask = false }: { task: Task; isSubtask?: boolean }) => {
    const StatusIcon = statusConfig[task.status].icon;
    const priority = priorityConfig[task.priority];
    const { prev, next } = getPrevNextStatus(task.status);
    const isDragging = draggedTaskId === task.id;
    const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
        clickTimer.current = null;
        openDetail(task);
      } else {
        clickTimer.current = setTimeout(() => { clickTimer.current = null; }, 280);
      }
    };

    return (
      <div
        className={cn(
          'group relative bg-[#141e33] hover:bg-[#182040] border border-white/[0.07] hover:border-white/15 rounded-2xl p-4 cursor-grab active:cursor-grabbing transition-all duration-200 select-none shadow-sm hover:shadow-md hover:shadow-black/30',
          isSubtask && 'ml-5 border-l-2 border-l-blue-500/50',
          isDragging && 'opacity-30 scale-95 shadow-none'
        )}
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        {...hoverProps(task)}
      >
        {/* Priority accent bar */}
        <div className={cn('absolute top-0 left-0 w-full h-0.5 rounded-t-2xl opacity-60 transition-opacity group-hover:opacity-100', priority.bar)} />

        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              'font-semibold text-sm leading-snug',
              task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'
            )}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                {task.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {previewButton(task)}
            {canDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id, task.title); }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <Trash2 size={12} />
              </button>
            )}
            <GripVertical size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold border', priority.chip)}>
            {priority.label}
          </span>
          {task.department_data && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
              style={{ backgroundColor: task.department_data.color + '18', color: task.department_data.color, borderColor: task.department_data.color + '40' }}
            >
              {task.department_data.name}
            </span>
          )}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {task.due_date && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Calendar size={10} />
                {new Date(task.due_date).toLocaleDateString('pt-BR')}
              </span>
            )}
            {(task.comments_count ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <MessageSquare size={10} />
                {task.comments_count}
              </span>
            )}
            {(task.subtasks_count ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <CheckSquare size={10} />
                {task.subtasks_count}
              </span>
            )}
          </div>

          {task.assigned_user ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-[#141e33]">
                {task.assigned_user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] text-slate-500 truncate max-w-[70px]">{task.assigned_user.name.split(' ')[0]}</span>
            </div>
          ) : null}
        </div>

        {/* Quick move — hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-all mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); prev && handleStatusChange(task.id, prev); }}
            disabled={!prev}
            className={cn('flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all', prev ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'invisible')}
          >
            <ArrowLeft size={10} />{prev ? statusConfig[prev].label : ''}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next && handleStatusChange(task.id, next); }}
            disabled={!next}
            className={cn('flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all', next ? 'bg-blue-500/20 hover:bg-blue-500/40 text-blue-300' : 'invisible')}
          >
            {next ? statusConfig[next].label : ''}<ArrowRight size={10} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#080f1f]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.06] bg-[#0b1326]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Kanban size={14} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">Tarefas</h2>
          </div>
          <div className="w-px h-5 bg-white/10" />
          {/* View Toggle */}
          <div className="flex items-center bg-white/5 border border-white/[0.06] rounded-lg p-0.5">
            <button onClick={() => setViewMode('kanban')} className={cn('p-1.5 rounded-md transition-all', viewMode === 'kanban' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300')} title="Kanban"><Kanban size={14} /></button>
            <button onClick={() => setViewMode('list')}   className={cn('p-1.5 rounded-md transition-all', viewMode === 'list'   ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300')} title="Lista"><List size={14} /></button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Buscar tarefas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.06] hover:border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 w-44 transition-colors" />
          </div>

          {/* Department Filter */}
          <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] hover:border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500/40 transition-colors cursor-pointer">
            <option value="all" className="bg-[#0b1326]">Todos Departamentos</option>
            {departments.map((dept) => (<option key={dept.id} value={dept.id} className="bg-[#0b1326]">{dept.name}</option>))}
          </select>

          {/* Priority Filter */}
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] hover:border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-blue-500/40 transition-colors cursor-pointer">
            <option value="all" className="bg-[#0b1326]">Todas Prioridades</option>
            <option value="urgent" className="bg-[#0b1326]">Urgente</option>
            <option value="high" className="bg-[#0b1326]">Alta</option>
            <option value="medium" className="bg-[#0b1326]">Média</option>
            <option value="low" className="bg-[#0b1326]">Baixa</option>
          </select>

          <div className="w-px h-5 bg-white/10" />

          {/* Minutes Button */}
          {canMinutes && (
            <button onClick={() => setMinutesOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 rounded-xl text-xs font-semibold transition-all"
              title="Gerar Ata de Reunião">
              <FileText size={13} />Ata
            </button>
          )}

          {/* Create Button */}
          {canCreate && (
            <button onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20">
              <Plus size={14} />Nova Tarefa
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : viewMode === 'kanban' ? (
          // Kanban View
          <div className="h-full overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <div className="flex gap-3 p-5 h-full">
              {Object.entries(kanbanColumns).map(([status, columnTasks]) => {
                const config = statusConfig[status as Task['status']];
                const isDragTarget = dragOverColumn === status && draggedTaskId;
                return (
                  <div
                    key={status}
                    className={cn(
                      'w-72 flex-shrink-0 flex flex-col rounded-2xl transition-all duration-200 border',
                      isDragTarget
                        ? 'bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20'
                        : 'bg-[#0d1628] border-white/[0.05]'
                    )}
                    onDragOver={(e) => handleDragOver(e, status)}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={(e) => handleDrop(e, status as Task['status'])}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                      <div className="flex items-center gap-2.5">
                        <div className={cn('w-2 h-2 rounded-full', config.color)} />
                        <h3 className="font-semibold text-white text-xs tracking-wide">{config.label}</h3>
                      </div>
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        columnTasks.length > 0 ? 'bg-white/10 text-white' : 'bg-white/[0.04] text-slate-600'
                      )}>
                        {columnTasks.length}
                      </span>
                    </div>

                    {/* Column body */}
                    <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                      {columnTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                      {columnTasks.length === 0 && (
                        <div className={cn(
                          'flex flex-col items-center justify-center py-10 rounded-xl border border-dashed transition-all mx-1',
                          isDragTarget ? 'border-blue-500/50 text-blue-400/70' : 'border-white/[0.06] text-slate-700'
                        )}>
                          <Plus size={16} className="mb-1.5" />
                          <span className="text-xs font-medium">Solte aqui</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // List View (Epic-based)
          <div className="h-full overflow-y-auto p-6">
            <div className="space-y-4">
              {epics.map(epic => (
                <div key={epic.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  {/* Epic Header */}
                  <button
                    onClick={() => toggleEpic(epic.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    {expandedEpics.has(epic.id) ? (
                      <ChevronDown size={18} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={18} className="text-slate-400" />
                    )}
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">EPIC</span>
                    <h3 className="font-semibold text-white">{epic.title}</h3>
                    <span className="text-xs text-slate-400">
                      {getTasksByEpic(epic.id).length} tarefas
                    </span>
                  </button>
                  
                  {/* Epic Tasks */}
                  <AnimatePresence>
                    {expandedEpics.has(epic.id) && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 space-y-2">
                          {getTasksByEpic(epic.id).map(task => (
                            <TaskCard key={task.id} task={task} />
                          ))}
                          {getTasksByEpic(epic.id).length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">
                              Nenhuma tarefa neste epic
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Tasks without Epic */}
              {filteredTasks.filter(t => t.type === 'task' && !t.epic_id).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-400 px-2">Tarefas sem Epic</h3>
                  {filteredTasks
                    .filter(t => t.type === 'task' && !t.epic_id)
                    .map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                </div>
              )}

              {epics.length === 0 && filteredTasks.filter(t => t.type === 'task').length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckSquare size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-400">Nenhuma tarefa encontrada</p>
                  {canCreate && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Criar primeira tarefa
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="shrink-0 px-5 py-2.5 border-t border-white/[0.05] bg-[#0b1326] flex items-center gap-5">
        {[
          { label: 'Total', value: tasks.length, color: 'text-slate-300' },
          { label: 'Concluídas', value: tasks.filter(t => t.status === 'done').length, color: 'text-emerald-400' },
          { label: 'Em progresso', value: tasks.filter(t => t.status === 'in_progress').length, color: 'text-amber-400' },
          { label: 'Urgentes', value: tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn('text-sm font-bold', color)}>{value}</span>
            <span className="text-xs text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Portaled overlays */}
      {createPortal(
        <>
      {/* Meeting Minutes Modal */}
      <MeetingMinutesModal
        isOpen={minutesOpen}
        onClose={() => setMinutesOpen(false)}
        tasks={tasks}
        currentUser={currentUser}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTasks}
        currentUser={currentUser}
        processItems={processItems || []}
        users={users}
        departments={departments}
      />

      {/* Task Detail Panel */}
      <AnimatePresence>
        {detailTask && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm"
              onClick={() => setDetailTask(null)}
            />

            {/* Side Panel */}
            <motion.div
              key="panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed right-0 top-0 bottom-0 z-[160] w-full max-w-lg bg-[#0d1525] border-l border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Panel Header */}
              <div className="shrink-0 px-5 pt-4 pb-0 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-start gap-3 mb-3">
                  <button onClick={() => setDetailTask(null)} className="p-1.5 mt-0.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0">
                    <ChevronRightIcon size={18} />
                  </button>
                  <div className="flex-1 min-w-0">
                    {editingField === 'title' ? (
                      <input
                        autoFocus
                        className="w-full bg-white/10 border border-blue-500/50 rounded-lg px-2 py-1 text-sm font-bold text-white focus:outline-none"
                        defaultValue={detailTask.title}
                        onBlur={e => saveField('title', e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveField('title', (e.target as HTMLInputElement).value)}
                      />
                    ) : (
                      <h2
                        className="text-sm font-bold text-white truncate cursor-pointer hover:text-blue-300 transition-colors group flex items-center gap-1"
                        onClick={() => setEditingField('title')}
                        title="Clique para editar"
                      >
                        {detailTask.title}
                        <Pencil size={11} className="opacity-0 group-hover:opacity-50 shrink-0" />
                      </h2>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className={cn('w-2 h-2 rounded-full', statusConfig[detailTask.status].color)} />
                      <span className="text-[11px] text-slate-400">{statusConfig[detailTask.status].label}</span>
                      <span className="text-slate-600">·</span>
                      <span className={cn('text-[11px] font-semibold', priorityConfig[detailTask.priority].color)}>{priorityConfig[detailTask.priority].label}</span>
                    </div>
                  </div>
                  {canDelete && (
                    <button onClick={() => { handleDeleteTask(detailTask.id, detailTask.title); setDetailTask(null); }} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1">
                  {([['details','Detalhes', Edit2], ['comments','Comentários', MessageSquare], ['alerts','Alertas', BellRing]] as const).map(([tab, label, Icon]) => (
                    <button
                      key={tab}
                      onClick={() => setDetailTab(tab)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all',
                        detailTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                      )}
                    >
                      <Icon size={12} />{label}
                      {tab === 'comments' && comments.length > 0 && <span className="bg-blue-500/20 text-blue-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">{comments.length}</span>}
                      {tab === 'alerts' && alerts.length > 0 && <span className="bg-red-500/20 text-red-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold">{alerts.length}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">

                  {/* ── DETAILS TAB ── */}
                  {detailTab === 'details' && (
                    <motion.div key="details" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5 space-y-4">

                      {/* Move status */}
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Status</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(Object.keys(statusConfig) as Task['status'][]).map(s => (
                            <button key={s} onClick={() => { handleStatusChange(detailTask.id, s); setDetailTask(prev => prev ? { ...prev, status: s } : null); }}
                              className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold border transition-all',
                                detailTask.status === s ? cn('border-transparent text-white', statusConfig[s].color) : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white')}
                            >
                              <div className={cn('w-1.5 h-1.5 rounded-full', statusConfig[s].color)} />{statusConfig[s].label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Priority edit */}
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Prioridade</p>
                        <div className="flex gap-1.5">
                          {(Object.keys(priorityConfig) as Task['priority'][]).map(p => (
                            <button key={p} onClick={() => { saveField('priority', p); }}
                              className={cn('text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all',
                                detailTask.priority === p ? cn('border-transparent bg-white/10', priorityConfig[p].color) : 'border-white/10 bg-white/5 text-slate-500 hover:text-white')}
                            >{priorityConfig[p].label}</button>
                          ))}
                        </div>
                      </div>

                      {/* Description edit */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Descrição</p>
                          {editingField !== 'description' && <button onClick={() => setEditingField('description')} className="text-[10px] text-slate-500 hover:text-blue-400 flex items-center gap-1"><Pencil size={10} />Editar</button>}
                        </div>
                        {editingField === 'description' ? (
                          <div className="space-y-2">
                            <textarea autoFocus rows={4}
                              className="w-full bg-white/10 border border-blue-500/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
                              defaultValue={detailTask.description || ''}
                              id="desc-edit"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => { const el = document.getElementById('desc-edit') as HTMLTextAreaElement; saveField('description', el.value); }} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"><Check size={12}/>Salvar</button>
                              <button onClick={() => setEditingField(null)} className="text-xs px-3 py-1.5 text-slate-400 hover:text-white rounded-lg">Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-300 leading-relaxed bg-white/5 rounded-xl p-3 min-h-[44px] cursor-pointer hover:bg-white/8" onClick={() => setEditingField('description')}>
                            {detailTask.description || <span className="text-slate-600 italic">Sem descrição. Clique para adicionar…</span>}
                          </p>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="space-y-2">
                        {detailTask.assigned_user && (
                          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{detailTask.assigned_user.name.charAt(0)}</div>
                            <div><p className="text-[10px] text-slate-500">Atribuído a</p><p className="text-sm text-white font-medium">{detailTask.assigned_user.name}</p></div>
                          </div>
                        )}
                        {detailTask.department_data && (
                          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                            <Building2 size={14} className="text-slate-400 shrink-0" />
                            <div><p className="text-[10px] text-slate-500">Departamento</p><p className="text-sm font-medium" style={{ color: detailTask.department_data.color }}>{detailTask.department_data.name}</p></div>
                          </div>
                        )}
                        {detailTask.due_date && (
                          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                            <Calendar size={14} className="text-slate-400 shrink-0" />
                            <div><p className="text-[10px] text-slate-500">Data de entrega</p><p className="text-sm text-white font-medium">{new Date(detailTask.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p></div>
                          </div>
                        )}
                        {detailTask.process_item && (
                          <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                            <Link2 size={14} className="text-slate-400 shrink-0" />
                            <div><p className="text-[10px] text-slate-500">Vinculado a</p><p className="text-sm text-white font-medium">{detailTask.process_item.title}</p></div>
                          </div>
                        )}
                        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          <div><p className="text-[10px] text-slate-500">Criado em</p><p className="text-sm text-white font-medium">{new Date(detailTask.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── COMMENTS TAB ── */}
                  {detailTab === 'comments' && (
                    <motion.div key="comments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                      <div className="flex-1 overflow-y-auto p-5 space-y-3">
                        {comments.length === 0 && (
                          <div className="text-center py-12">
                            <MessageSquare size={32} className="mx-auto text-slate-600 mb-3" />
                            <p className="text-slate-500 text-sm">Nenhum comentário ainda</p>
                            <p className="text-slate-600 text-xs mt-1">Seja o primeiro a comentar</p>
                          </div>
                        )}
                        {comments.map((c: any) => (
                          <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                              {(c.user?.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-xs font-semibold text-white">{c.user?.name || 'Usuário'}</span>
                                <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className="bg-white/5 rounded-xl rounded-tl-none px-3 py-2">
                                <p className="text-sm text-slate-200 leading-relaxed">{c.content}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      {/* Comment input */}
                      <div className="shrink-0 p-4 border-t border-white/10 bg-white/[0.02]">
                        <div className="flex gap-2 items-end">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 relative">
                            <textarea
                              rows={2}
                              value={newComment}
                              onChange={e => setNewComment(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); } }}
                              placeholder="Escreva um comentário... (Enter para enviar)"
                              className="w-full bg-white/10 border border-white/10 focus:border-blue-500/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
                            />
                          </div>
                          <button onClick={sendComment} disabled={!newComment.trim()} className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0">
                            <Send size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── ALERTS TAB ── */}
                  {detailTab === 'alerts' && (
                    <motion.div key="alerts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                      <div className="flex-1 overflow-y-auto p-5 space-y-3">
                        {/* New alert form */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                          <p className="text-xs font-bold text-slate-300 flex items-center gap-2"><BellRing size={13} className="text-amber-400" />Criar Alerta / Recado</p>
                          <div className="flex gap-2">
                            {(['info','warning','urgent'] as const).map(t => {
                              const tc = alertTypeConfig[t];
                              return (
                                <button key={t} onClick={() => setNewAlert(a => ({ ...a, type: t }))}
                                  className={cn('flex-1 text-xs py-1.5 rounded-lg font-semibold border transition-all', newAlert.type === t ? cn(tc.bg, tc.color, tc.border) : 'border-white/10 text-slate-500 hover:text-white')}>
                                  {tc.label}
                                </button>
                              );
                            })}
                          </div>
                          {/* Custom user picker */}
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setAlertUserDropOpen(o => !o)}
                              className="w-full flex items-center gap-2.5 bg-white/8 hover:bg-white/12 border border-white/10 hover:border-white/20 rounded-xl px-3 py-2.5 text-sm text-white transition-all"
                            >
                              {newAlert.to_user_id ? (
                                <>
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                    {(users.find(u => u.id === newAlert.to_user_id)?.name || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <span className="flex-1 text-left font-medium">{users.find(u => u.id === newAlert.to_user_id)?.name}</span>
                                </>
                              ) : (
                                <>
                                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <MessageSquare size={12} className="text-slate-400" />
                                  </div>
                                  <span className="flex-1 text-left text-slate-400">Para todos</span>
                                </>
                              )}
                              <ChevronDown size={14} className={cn('text-slate-500 transition-transform shrink-0', alertUserDropOpen && 'rotate-180')} />
                            </button>

                            <AnimatePresence>
                              {alertUserDropOpen && (
                                <motion.div
                                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                  transition={{ duration: 0.12 }}
                                  className="absolute top-full mt-1 left-0 right-0 z-20 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden"
                                >
                                  {/* Para todos */}
                                  <button
                                    onClick={() => { setNewAlert(a => ({ ...a, to_user_id: '' })); setAlertUserDropOpen(false); }}
                                    className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/8 transition-colors',
                                      !newAlert.to_user_id ? 'bg-blue-500/10 text-blue-300' : 'text-slate-300')}
                                  >
                                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                      <MessageSquare size={13} className="text-slate-400" />
                                    </div>
                                    <div className="text-left">
                                      <p className="text-sm font-medium">Para todos</p>
                                      <p className="text-[10px] text-slate-500">Notifica toda a equipe</p>
                                    </div>
                                    {!newAlert.to_user_id && <Check size={13} className="ml-auto text-blue-400" />}
                                  </button>

                                  <div className="border-t border-white/5" />

                                  {/* Users */}
                                  {users.map(u => (
                                    <button
                                      key={u.id}
                                      onClick={() => { setNewAlert(a => ({ ...a, to_user_id: u.id })); setAlertUserDropOpen(false); }}
                                      className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/8 transition-colors',
                                        newAlert.to_user_id === u.id ? 'bg-blue-500/10 text-blue-300' : 'text-slate-300')}
                                    >
                                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {u.name.charAt(0).toUpperCase()}
                                      </div>
                                      <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{u.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{u.role}</p>
                                      </div>
                                      {newAlert.to_user_id === u.id && <Check size={13} className="ml-auto text-blue-400 shrink-0" />}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <textarea rows={2} value={newAlert.message} onChange={e => setNewAlert(a => ({ ...a, message: e.target.value }))}
                            placeholder="Mensagem do alerta..."
                            className="w-full bg-white/10 border border-white/10 focus:border-blue-500/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
                          />
                          <button onClick={() => { sendAlert(); setAlertUserDropOpen(false); }} disabled={!newAlert.message.trim()}
                            className={cn(
                              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30',
                              newAlert.type === 'urgent'
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30'
                                : newAlert.type === 'warning'
                                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30'
                            )}>
                            {newAlert.type === 'urgent' ? <BellRing size={14} /> : <Bell size={14} />}
                            Enviar {alertTypeConfig[newAlert.type].label}
                          </button>
                        </div>

                        {/* Alerts list */}
                        {alerts.length === 0 && (
                          <div className="text-center py-8">
                            <Bell size={28} className="mx-auto text-slate-600 mb-2" />
                            <p className="text-slate-500 text-sm">Nenhum alerta enviado</p>
                          </div>
                        )}
                        {alerts.map((a: any) => {
                          const tc = alertTypeConfig[a.type as 'info'|'warning'|'urgent'] || alertTypeConfig.info;
                          const AlertIcon = tc.icon;
                          return (
                            <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                              className={cn('rounded-xl border p-3', tc.bg, tc.border)}>
                              <div className="flex items-start gap-2">
                                <AlertIcon size={14} className={cn(tc.color, 'mt-0.5 shrink-0')} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className={cn('text-[10px] font-bold uppercase tracking-wider', tc.color)}>{tc.label}</span>
                                    <span className="text-[10px] text-slate-500">{new Date(a.created_at).toLocaleString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                                  </div>
                                  <p className="text-sm text-slate-200 leading-relaxed">{a.message}</p>
                                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                                    {a.from_user && <span className="flex items-center gap-1"><User size={9} />De: {a.from_user.name}</span>}
                                    {a.to_user ? <span className="flex items-center gap-1 text-blue-400"><AtSign size={9} />Para: {a.to_user.name}</span> : <span className="text-slate-600">📢 Para todos</span>}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={doDeleteTask}
        title="Excluir Tarefa"
        message={`Tem certeza que deseja excluir "${confirmDelete?.title}"?\n\nEsta ação irá remover a tarefa e todas as subtarefas. Não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
        </>,
        document.body
      )}

      {/* Quick Peek portal (tooltip + modal) */}
      {quickPeekPortal}
    </div>
  );
}
