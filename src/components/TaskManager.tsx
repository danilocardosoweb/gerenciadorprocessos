import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Filter, Search, Calendar, Clock, User, Tag, 
  CheckCircle2, Circle, AlertCircle, ArrowRight, 
  MoreVertical, ChevronDown, ChevronRight, Paperclip,
  MessageSquare, LayoutGrid, List, Kanban, X, Trash2,
  Edit2, Save, CheckSquare
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { ProcessItem } from './Dashboard';
import { CreateTaskModal } from './CreateTaskModal';

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
  low: { label: 'Baixa', color: 'text-slate-400', bg: 'bg-slate-500/10' },
  medium: { label: 'Média', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  high: { label: 'Alta', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  urgent: { label: 'Urgente', color: 'text-red-400', bg: 'bg-red-500/10' },
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

  // Check permissions
  const isAdmin = currentUser?.role === 'Administrador';
  const canCreate = isAdmin || currentUser?.role === 'Editor';
  const canDelete = isAdmin;

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
          assigned_user:users(name, email),
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

  const handleDeleteTask = async (taskId: string) => {
    if (!canDelete) {
      alert('❌ Apenas administradores podem excluir tarefas.');
      return;
    }
    
    if (!confirm('⚠️ TEM CERTEZA?\n\nEsta ação irá EXCLUIR esta tarefa e todas as subtarefas.\nEsta ação NÃO pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      
      setTasks(prev => prev.filter(t => t.id !== taskId && t.parent_id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Erro ao excluir tarefa');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'done') {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, ...updates } : t
      ));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  // Task Card Component
  const TaskCard = ({ task, isSubtask = false }: { task: Task; isSubtask?: boolean }) => {
    const StatusIcon = statusConfig[task.status].icon;
    const priority = priorityConfig[task.priority];

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-3 cursor-pointer transition-all',
          isSubtask && 'ml-6 border-l-2 border-l-blue-500/50'
        )}
        onClick={() => setSelectedTask(task)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              'font-medium text-sm leading-tight mb-1',
              task.status === 'done' ? 'text-slate-400 line-through' : 'text-white'
            )}>
              {task.title}
            </h4>
            
            {task.description && (
              <p className="text-xs text-slate-400 line-clamp-2 mb-2">
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', priority.bg, priority.color)}>
                {priority.label}
              </span>

              {task.department_data && (
                <span 
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium text-white"
                  style={{ backgroundColor: task.department_data.color + '40' }}
                >
                  {task.department_data.name}
                </span>
              )}
              
              {task.due_date && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar size={10} />
                  {new Date(task.due_date).toLocaleDateString('pt-BR')}
                </span>
              )}

              {task.subtasks_count > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <CheckSquare size={10} />
                  {task.subtasks_count}
                </span>
              )}

              {task.comments_count > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <MessageSquare size={10} />
                  {task.comments_count}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <StatusIcon size={16} className={cn('shrink-0', statusConfig[task.status].color.replace('bg-', 'text-'))} />
            
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {task.assigned_user && (
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-bold">
              {task.assigned_user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] text-slate-400 truncate">
              {task.assigned_user.name}
            </span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">Tarefas</h2>
          
          {/* View Toggle */}
          <div className="flex items-center bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'kanban' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              )}
              title="Kanban"
            >
              <Kanban size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              )}
              title="Lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 w-48"
            />
          </div>

          {/* Department Filter */}
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">Todos Departamentos</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="all">Todas Prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>

          {/* Create Button */}
          {canCreate && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Nova Tarefa
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
          <div className="h-full overflow-x-auto">
            <div className="flex gap-4 p-6 min-w-max">
              {Object.entries(kanbanColumns).map(([status, columnTasks]) => {
                const config = statusConfig[status as Task['status']];
                return (
                  <div key={status} className="w-72 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-3 h-3 rounded-full', config.color)} />
                        <h3 className="font-medium text-white text-sm">{config.label}</h3>
                        <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {columnTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                      {columnTasks.length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-sm">
                          Nenhuma tarefa
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
      <div className="px-6 py-3 border-t border-white/10 bg-white/5 flex items-center gap-6 text-sm">
        <span className="text-slate-400">
          Total: <strong className="text-white">{tasks.length}</strong>
        </span>
        <span className="text-slate-400">
          Concluídas: <strong className="text-emerald-400">{tasks.filter(t => t.status === 'done').length}</strong>
        </span>
        <span className="text-slate-400">
          Em progresso: <strong className="text-amber-400">{tasks.filter(t => t.status === 'in_progress').length}</strong>
        </span>
        <span className="text-slate-400">
          Urgentes: <strong className="text-red-400">{tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length}</strong>
        </span>
      </div>

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
    </div>
  );
}
