import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Plus, Calendar, User, Flag, Folder, Link, 
  ChevronDown, Check, AlertCircle, Clock
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
type Visibility = 'private' | 'department' | 'public';

export function CreateTaskModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  currentUser, 
  processItems,
  users,
  departments
}: CreateTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
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
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        type,
        status: 'todo',
        priority,
        visibility,
        assigned_to: assignedTo || null,
        department_id: departmentId || null,
        process_item_id: processItemId || null,
        due_date: dueDate || null,
        estimated_hours: estimatedHours ? parseInt(estimatedHours) : null,
        created_by: currentUser?.id
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
              <label className="text-sm font-medium text-slate-300">
                Prioridade
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500/50"
                >
                  {Object.entries(priorityConfig).map(([key, config]) => (
                    <option key={key} value={key} className="bg-slate-800">
                      {config.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Visibilidade
              </label>
              <div className="relative">
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as Visibility)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500/50"
                >
                  <option value="public" className="bg-slate-800">Pública (todos)</option>
                  <option value="department" className="bg-slate-800">Departamento</option>
                  <option value="private" className="bg-slate-800">Privada (só eu)</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Department & Assignment Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Department */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Folder size={14} />
                Departamento
              </label>
              <div className="relative">
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500/50"
                >
                  <option value="" className="bg-slate-800">Selecione...</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id} className="bg-slate-800">
                      {dept.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <User size={14} />
                Atribuir para
              </label>
              <div className="relative">
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500/50"
                >
                  <option value="" className="bg-slate-800">Não atribuído</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id} className="bg-slate-800">
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Link to Process */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Link size={14} />
                Vincular a processo
              </label>
              <div className="relative">
                <select
                  value={processItemId}
                  onChange={(e) => setProcessItemId(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-blue-500/50"
                >
                  <option value="" className="bg-slate-800">Nenhum processo</option>
                  {processItems.map((item) => (
                    <option key={item.id} value={item.id} className="bg-slate-800">
                      {item.title}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
