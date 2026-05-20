import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Plus, Calendar, User, Flag, Folder, Link, 
  ChevronDown, Check, AlertCircle, Clock, Building2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { ProcessItem } from './Dashboard';

interface Department {
  id: string;
  name: string;
  color: string;
}

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: { id: string; name: string; email: string; role: string } | null;
  processItems: ProcessItem[];
  users: { id: string; name: string; email: string; role: string }[];
  departments: Department[];
}

type TaskType = 'epic' | 'task' | 'subtask';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Visibility = 'private' | 'department' | 'public' | 'specific';

export function CreateTaskModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  currentUser, 
  processItems,
  users: usersProp,
  departments: departmentsProp
}: CreateTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>(departmentsProp || []);
  const [users, setUsers] = useState(usersProp || []);

  // Fetch fresh data directly when modal opens
  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      supabase.from('departments').select('id, name, color').order('name', { nullsFirst: false }),
      supabase.from('users').select('id, name, email, role').order('name', { nullsFirst: false }),
    ]).then(([{ data: depts, error: deptsErr }, { data: usrs, error: usrsErr }]) => {
      if (deptsErr) console.error('❌ Error fetching departments:', deptsErr);
      if (usrsErr) console.error('❌ Error fetching users:', usrsErr);
      if (depts && depts.length > 0) setDepartments(depts);
      if (usrs && usrs.length > 0) setUsers(usrs);
    });
  }, [isOpen]);

  // Dropdown open states
  const [deptOpen, setDeptOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [processOpen, setProcessOpen] = useState(false);
  const [specificUserOpen, setSpecificUserOpen] = useState(false);
  const [specificUserId, setSpecificUserId] = useState<string>('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('task');
  const [priority, setPriority] = useState<Priority>('medium');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [processItemId, setProcessItemId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [estimatedHours, setEstimatedHours] = useState<string>('');
  
  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('task');
    setPriority('medium');
    setVisibility('public');
    setAssignedTo('');
    setDepartmentId('');
    setProcessItemId('');
    setDueDate('');
    setEstimatedHours('');
    setErrors({});
    setDeptOpen(false);
    setUserOpen(false);
    setPriorityOpen(false);
    setVisibilityOpen(false);
    setProcessOpen(false);
    setSpecificUserOpen(false);
    setSpecificUserId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    
    if (title.length < 3) {
      newErrors.title = 'Título deve ter pelo menos 3 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      // For 'specific' visibility, the specific user becomes the assigned_to
      const effectiveAssignedTo = visibility === 'specific'
        ? (specificUserId || assignedTo || null)
        : (assignedTo || null);

      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        type,
        status: 'todo',
        priority,
        visibility,
        assigned_to: effectiveAssignedTo,
        department_id: departmentId || null,
        process_item_id: processItemId || null,
        due_date: dueDate || null,
        estimated_hours: estimatedHours ? parseInt(estimatedHours) : null,
        created_by: currentUser?.id || null
      };

      const { error } = await supabase
        .from('tasks')
        .insert(taskData);

      if (error) throw error;
      
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error creating task:', err);
      setErrors({ submit: 'Erro ao criar tarefa. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const typeConfig = {
    epic: { label: 'Epic', color: 'bg-purple-500', desc: 'Grande iniciativa' },
    task: { label: 'Tarefa', color: 'bg-blue-500', desc: 'Tarefa individual' },
    subtask: { label: 'Subtarefa', color: 'bg-slate-500', desc: 'Item de checklist' }
  };

  const priorityConfig = {
    low: { label: 'Baixa', color: 'bg-slate-500', icon: Flag },
    medium: { label: 'Média', color: 'bg-blue-500', icon: Flag },
    high: { label: 'Alta', color: 'bg-amber-500', icon: AlertCircle },
    urgent: { label: 'Urgente', color: 'bg-red-500', icon: AlertCircle }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nova Tarefa</h2>
              <p className="text-sm text-slate-400">Crie uma nova tarefa ou epic</p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error message */}
          {errors.submit && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} />
              {errors.submit}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa..."
              className={cn(
                "w-full px-4 py-3 bg-black/20 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors",
                errors.title ? "border-red-500/50" : "border-white/10"
              )}
            />
            {errors.title && (
              <p className="text-xs text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a tarefa (opcional)..."
              rows={3}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Tipo
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(typeConfig) as TaskType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "p-3 rounded-xl border transition-all text-left",
                    type === t 
                      ? "bg-white/10 border-blue-500/50" 
                      : "bg-black/20 border-white/10 hover:border-white/30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-2 h-2 rounded-full", typeConfig[t].color)} />
                    <span className={cn(
                      "text-sm font-medium",
                      type === t ? "text-white" : "text-slate-300"
                    )}>
                      {typeConfig[t].label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{typeConfig[t].desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Priority & Visibility Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Prioridade</label>
              <div className="relative">
                <button type="button" onClick={() => { setPriorityOpen(o => !o); setVisibilityOpen(false); setDeptOpen(false); setUserOpen(false); setProcessOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-black/20 border border-white/10 hover:border-white/20 rounded-xl text-white transition-colors">
                  <div className={cn('w-2 h-2 rounded-full shrink-0', priorityConfig[priority].color)} />
                  <span className="flex-1 text-left text-sm">{priorityConfig[priority].label}</span>
                  <ChevronDown size={14} className={cn('text-slate-400 transition-transform', priorityOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {priorityOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
                      className="absolute top-full mt-1 left-0 right-0 z-30 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden">
                      {Object.entries(priorityConfig).map(([key, cfg]) => (
                        <button key={key} type="button" onClick={() => { setPriority(key as Priority); setPriorityOpen(false); }}
                          className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/8 transition-colors', priority === key ? 'bg-white/10 text-white' : 'text-slate-300')}>
                          <div className={cn('w-2 h-2 rounded-full', cfg.color)} />
                          {cfg.label}
                          {priority === key && <Check size={13} className="ml-auto text-blue-400" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Visibilidade</label>
              <div className="relative">
                <button type="button" onClick={() => { setVisibilityOpen(o => !o); setPriorityOpen(false); setDeptOpen(false); setUserOpen(false); setProcessOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-black/20 border border-white/10 hover:border-white/20 rounded-xl text-white transition-colors">
                  <span className="flex-1 text-left text-sm">
                    {visibility === 'public' ? '🌐 Pública (todos)' :
                     visibility === 'department' ? '🏢 Departamento' :
                     visibility === 'specific' ? '👤 Específica (1 pessoa)' :
                     '🔒 Privada (só eu)'}
                  </span>
                  <ChevronDown size={14} className={cn('text-slate-400 transition-transform', visibilityOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {visibilityOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
                      className="absolute top-full mt-1 left-0 right-0 z-30 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden">
                      {([
                        ['public',     '🌐  Pública (todos)',       'Todos os usuários podem ver'],
                        ['department', '🏢  Departamento',          'Apenas o departamento da tarefa'],
                        ['specific',   '👤  Específica (1 pessoa)', 'Somente um usuário + você'],
                        ['private',    '🔒  Privada (só eu)',        'Apenas você pode ver'],
                      ] as const).map(([val, label, desc]) => (
                        <button key={val} type="button" onClick={() => { setVisibility(val as Visibility); setVisibilityOpen(false); }}
                          className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/8 transition-colors text-left', visibility === val ? 'bg-white/10 text-white' : 'text-slate-300')}>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-[10px] text-slate-500">{desc}</p>
                          </div>
                          {visibility === val && <Check size={13} className="text-blue-400 shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Specific user picker — shown only when visibility = specific */}
          {visibility === 'specific' && (
            <div className="space-y-2 -mt-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <User size={14} className="text-violet-400" />
                Para qual pessoa? <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setSpecificUserOpen(o => !o); setDeptOpen(false); setUserOpen(false); setPriorityOpen(false); setVisibilityOpen(false); setProcessOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-2 px-4 py-3 bg-black/20 border rounded-xl text-white transition-colors',
                    specificUserId ? 'border-violet-500/40 bg-violet-500/5' : 'border-white/10 hover:border-white/20'
                  )}>
                  {specificUserId ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {(users.find(u => u.id === specificUserId)?.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 text-left text-sm truncate">{users.find(u => u.id === specificUserId)?.name}</span>
                      <span className="text-[10px] text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full">só ela + você</span>
                    </>
                  ) : (
                    <span className="flex-1 text-left text-sm text-slate-500">Selecione o usuário...</span>
                  )}
                  <ChevronDown size={14} className={cn('text-slate-400 transition-transform shrink-0', specificUserOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {specificUserOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
                      className="absolute top-full mt-1 left-0 right-0 z-30 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                      {users.filter(u => u.id !== currentUser?.id).map(u => (
                        <button key={u.id} type="button" onClick={() => { setSpecificUserId(u.id); setSpecificUserOpen(false); }}
                          className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/8 transition-colors', specificUserId === u.id ? 'bg-white/10 text-white' : 'text-slate-300')}>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-500">{u.role}</p>
                          </div>
                          {specificUserId === u.id && <Check size={13} className="ml-auto text-violet-400 shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                Apenas <strong className="text-slate-400">{users.find(u => u.id === specificUserId)?.name || 'essa pessoa'}</strong> e você ({currentUser?.name}) poderão ver esta tarefa.
              </p>
            </div>
          )}

          {/* Department & Assignment Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Department */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Building2 size={14} />Departamento</label>
              <div className="relative">
                <button type="button" onClick={() => { setDeptOpen(o => !o); setUserOpen(false); setPriorityOpen(false); setVisibilityOpen(false); setProcessOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-black/20 border border-white/10 hover:border-white/20 rounded-xl text-white transition-colors">
                  {departmentId ? (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: departments.find(d => d.id === departmentId)?.color || '#64748b' }} />
                      <span className="flex-1 text-left text-sm">{departments.find(d => d.id === departmentId)?.name}</span>
                    </>
                  ) : (
                    <span className="flex-1 text-left text-sm text-slate-500">Selecione...</span>
                  )}
                  <ChevronDown size={14} className={cn('text-slate-400 transition-transform shrink-0', deptOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {deptOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
                      className="absolute top-full mt-1 left-0 right-0 z-30 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                      <button type="button" onClick={() => { setDepartmentId(''); setDeptOpen(false); }}
                        className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/8 transition-colors', !departmentId ? 'bg-white/10 text-white' : 'text-slate-400')}>
                        Nenhum
                        {!departmentId && <Check size={13} className="ml-auto text-blue-400" />}
                      </button>
                      <div className="border-t border-white/5" />
                      {departments.map(dept => (
                        <button key={dept.id} type="button" onClick={() => { setDepartmentId(dept.id); setDeptOpen(false); }}
                          className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/8 transition-colors', departmentId === dept.id ? 'bg-white/10 text-white' : 'text-slate-300')}>
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dept.color }} />
                          {dept.name}
                          {departmentId === dept.id && <Check size={13} className="ml-auto text-blue-400" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><User size={14} />Atribuir para</label>
              <div className="relative">
                <button type="button" onClick={() => { setUserOpen(o => !o); setDeptOpen(false); setPriorityOpen(false); setVisibilityOpen(false); setProcessOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-black/20 border border-white/10 hover:border-white/20 rounded-xl text-white transition-colors">
                  {assignedTo ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {(users.find(u => u.id === assignedTo)?.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="flex-1 text-left text-sm truncate">{users.find(u => u.id === assignedTo)?.name}</span>
                    </>
                  ) : (
                    <span className="flex-1 text-left text-sm text-slate-500">Não atribuído</span>
                  )}
                  <ChevronDown size={14} className={cn('text-slate-400 transition-transform shrink-0', userOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
                      className="absolute top-full mt-1 left-0 right-0 z-30 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                      <button type="button" onClick={() => { setAssignedTo(''); setUserOpen(false); }}
                        className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/8 transition-colors', !assignedTo ? 'bg-white/10 text-white' : 'text-slate-400')}>
                        Não atribuído
                        {!assignedTo && <Check size={13} className="ml-auto text-blue-400" />}
                      </button>
                      <div className="border-t border-white/5" />
                      {users.map(u => (
                        <button key={u.id} type="button" onClick={() => { setAssignedTo(u.id); setUserOpen(false); }}
                          className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/8 transition-colors', assignedTo === u.id ? 'bg-white/10 text-white' : 'text-slate-300')}>
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-500">{u.role}</p>
                          </div>
                          {assignedTo === u.id && <Check size={13} className="ml-auto text-blue-400 shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Link to Process */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2"><Link size={14} />Vincular a processo</label>
              <div className="relative">
                <button type="button" onClick={() => { setProcessOpen(o => !o); setDeptOpen(false); setUserOpen(false); setPriorityOpen(false); setVisibilityOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-black/20 border border-white/10 hover:border-white/20 rounded-xl text-white transition-colors">
                  <span className="flex-1 text-left text-sm truncate">{processItemId ? processItems.find(p => p.id === processItemId)?.title : <span className="text-slate-500">Nenhum processo</span>}</span>
                  <ChevronDown size={14} className={cn('text-slate-400 transition-transform shrink-0', processOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {processOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
                      className="absolute top-full mt-1 left-0 right-0 z-30 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                      <button type="button" onClick={() => { setProcessItemId(''); setProcessOpen(false); }}
                        className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/8 transition-colors', !processItemId ? 'bg-white/10 text-white' : 'text-slate-400')}>
                        Nenhum processo
                        {!processItemId && <Check size={13} className="ml-auto text-blue-400" />}
                      </button>
                      <div className="border-t border-white/5" />
                      {processItems.map(item => (
                        <button key={item.id} type="button" onClick={() => { setProcessItemId(item.id); setProcessOpen(false); }}
                          className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/8 transition-colors', processItemId === item.id ? 'bg-white/10 text-white' : 'text-slate-300')}>
                          {item.title}
                          {processItemId === item.id && <Check size={13} className="ml-auto text-blue-400" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Due Date & Estimated Hours Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Calendar size={14} />
                Data de entrega
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Clock size={14} />
                Horas estimadas
              </label>
              <input
                type="number"
                min="0"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="Ex: 8"
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all flex items-center gap-2",
                isLoading && "opacity-70 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Criar Tarefa
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
