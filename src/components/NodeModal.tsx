import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, ImagePlus, Plus, CheckCircle2, Circle, UploadCloud, Trash2, MessageSquare, Link, Video, Pencil, Workflow } from 'lucide-react';
import { cn } from '../lib/utils';
import { useComments } from '../hooks/useComments';
import { CommentsPanel } from './CommentsPanel';
import { ActionFlow } from './ActionFlow';

interface AttachedFile {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'xls' | 'image' | 'other';
}

interface NodeTask {
  id: string;
  text: string;
  completed: boolean;
  howTo?: HowToStep[];
  ifOK?: FlowOutcome;
  ifNOK?: FlowOutcome;
  tips?: QuickTip[];
  files?: AttachedFile[];
  images?: string[];
}

interface HowToStep {
  order: number;
  instruction: string;
  visualHint?: string;
}

interface FlowOutcome {
  result: string;
  action: string;
  nextStep?: string;
  alertLevel?: 'success' | 'warning' | 'critical';
}

interface QuickTip {
  icon: string;
  message: string;
}

export interface NodeDetails {
  description: string;
  images: string[];
  tasks: NodeTask[];
  howTo?: HowToStep[];
  ifOK?: FlowOutcome;
  ifNOK?: FlowOutcome;
  tips?: QuickTip[];
}

interface NodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: any;
  nodeId: string;
  details: NodeDetails;
  onUpdateDetails: (id: string, newDetails: NodeDetails | ((prev: NodeDetails) => NodeDetails)) => void;
  onUpdateNodeLabel?: (id: string, newLabel: string) => void;
  currentUser?: { name: string; email: string; role: string } | null;
}

// Task Editor Component for managing guide, files and images per task
interface TaskEditorProps {
  task: NodeTask;
  onToggle: () => void;
  onEditText: () => void;
  onDelete: () => void;
  onUpdateTask: (task: NodeTask) => void;
}

function TaskEditor({ task, onToggle, onEditText, onDelete, onUpdateTask }: TaskEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'files' | 'images'>('guide');

  // Add howTo step
  const addHowToStep = () => {
    const newStep: HowToStep = {
      order: (task.howTo?.length || 0) + 1,
      instruction: "Nova instrução...",
      visualHint: "Dica visual..."
    };
    onUpdateTask({
      ...task,
      howTo: [...(task.howTo || []), newStep]
    });
  };

  // Update howTo step
  const updateHowToStep = (index: number, field: keyof HowToStep, value: string | number) => {
    const newHowTo = [...(task.howTo || [])];
    newHowTo[index] = { ...newHowTo[index], [field]: value };
    onUpdateTask({ ...task, howTo: newHowTo });
  };

  // Remove howTo step
  const removeHowToStep = (index: number) => {
    const newHowTo = (task.howTo || []).filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, order: i + 1 }));
    onUpdateTask({ ...task, howTo: newHowTo });
  };

  // Update flow outcome (ifOK/ifNOK)
  const updateFlowOutcome = (type: 'ifOK' | 'ifNOK', field: keyof FlowOutcome, value: string) => {
    onUpdateTask({
      ...task,
      [type]: { ...(task[type] || {}), [field]: value }
    });
  };

  // Add file
  const addFile = () => {
    const name = prompt("Nome do arquivo:");
    const url = prompt("URL do arquivo:");
    if (name && url) {
      const type = name.endsWith('.pdf') ? 'pdf' : 
                   name.endsWith('.doc') || name.endsWith('.docx') ? 'doc' :
                   name.endsWith('.xls') || name.endsWith('.xlsx') ? 'xls' : 'other';
      const newFile: AttachedFile = {
        id: Date.now().toString(),
        name,
        url,
        type
      };
      onUpdateTask({ ...task, files: [...(task.files || []), newFile] });
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    onUpdateTask({
      ...task,
      files: (task.files || []).filter(f => f.id !== fileId)
    });
  };

  // Add image URL
  const addImage = () => {
    const url = prompt("URL da imagem:");
    if (url) {
      onUpdateTask({ ...task, images: [...(task.images || []), url] });
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    onUpdateTask({
      ...task,
      images: (task.images || []).filter((_, i) => i !== index)
    });
  };

  const hasGuide = task.howTo || task.ifOK || task.ifNOK;
  const hasFiles = task.files && task.files.length > 0;
  const hasImages = task.images && task.images.length > 0;

  return (
    <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
      {/* Task Header */}
      <div className="flex items-start gap-3 p-3 group">
        <button 
          className="mt-0.5 text-blue-400 focus:outline-none"
          onClick={onToggle}
        >
          {task.completed ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Circle size={18} />}
        </button>
        <span 
          className={cn("text-sm transition-colors flex-1", task.completed ? "text-slate-500 line-through" : "text-slate-200")}
          onClick={onToggle}
          style={{ cursor: 'pointer' }}
        >
          {task.text}
        </span>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              isExpanded ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
            )}
            title={isExpanded ? "Recolher" : "Expandir para adicionar guia, arquivos e imagens"}
          >
            <Workflow size={14} />
          </button>
          <button
            onClick={onEditText}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            title="Editar texto"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10 p-3 space-y-3">
          {/* Tab Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('guide')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === 'guide' ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:text-slate-300"
              )}
            >
              📖 Guia ({task.howTo?.length || 0} passos)
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === 'files' ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:text-slate-300"
              )}
            >
              📎 Arquivos ({task.files?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === 'images' ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:text-slate-300"
              )}
            >
              🖼️ Imagens ({task.images?.length || 0})
            </button>
          </div>

          {/* Guide Tab */}
          {activeTab === 'guide' && (
            <div className="space-y-3">
              {/* How To Steps */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-medium text-slate-300">Como Executar (Passo a Passo)</h4>
                  <button
                    onClick={addHowToStep}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus size={12} /> Adicionar Passo
                  </button>
                </div>
                {task.howTo?.map((step, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-2 bg-white/5 rounded-lg">
                    <span className="text-xs font-bold text-blue-400 w-5">{step.order}</span>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={step.instruction}
                        onChange={(e) => updateHowToStep(idx, 'instruction', e.target.value)}
                        className="w-full text-xs bg-transparent border-b border-white/10 focus:border-blue-500 outline-none text-slate-200"
                        placeholder="Instrução..."
                      />
                      <input
                        type="text"
                        value={step.visualHint || ''}
                        onChange={(e) => updateHowToStep(idx, 'visualHint', e.target.value)}
                        className="w-full text-xs bg-transparent border-b border-white/10 focus:border-blue-500 outline-none text-slate-400"
                        placeholder="Dica visual..."
                      />
                    </div>
                    <button
                      onClick={() => removeHowToStep(idx)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* If OK */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-2">
                <h4 className="text-xs font-medium text-emerald-300">✅ Se OK (Quando der certo)</h4>
                <input
                  type="text"
                  value={task.ifOK?.result || ''}
                  onChange={(e) => updateFlowOutcome('ifOK', 'result', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-emerald-500/30 focus:border-emerald-400 outline-none text-slate-200"
                  placeholder="Resultado esperado..."
                />
                <input
                  type="text"
                  value={task.ifOK?.action || ''}
                  onChange={(e) => updateFlowOutcome('ifOK', 'action', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-emerald-500/30 focus:border-emerald-400 outline-none text-slate-200"
                  placeholder="Ação a tomar..."
                />
                <input
                  type="text"
                  value={task.ifOK?.nextStep || ''}
                  onChange={(e) => updateFlowOutcome('ifOK', 'nextStep', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-emerald-500/30 focus:border-emerald-400 outline-none text-slate-300"
                  placeholder="Próximo passo..."
                />
              </div>

              {/* If NOK */}
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2">
                <h4 className="text-xs font-medium text-red-300">❌ Se NOK (Quando der errado)</h4>
                <input
                  type="text"
                  value={task.ifNOK?.result || ''}
                  onChange={(e) => updateFlowOutcome('ifNOK', 'result', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-red-500/30 focus:border-red-400 outline-none text-slate-200"
                  placeholder="Resultado quando der errado..."
                />
                <input
                  type="text"
                  value={task.ifNOK?.action || ''}
                  onChange={(e) => updateFlowOutcome('ifNOK', 'action', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-red-500/30 focus:border-red-400 outline-none text-slate-200"
                  placeholder="Ação corretiva..."
                />
                <input
                  type="text"
                  value={task.ifNOK?.nextStep || ''}
                  onChange={(e) => updateFlowOutcome('ifNOK', 'nextStep', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-red-500/30 focus:border-red-400 outline-none text-slate-300"
                  placeholder="O que fazer agora..."
                />
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-medium text-slate-300">Arquivos Anexados</h4>
                <button
                  onClick={addFile}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus size={12} /> Adicionar Arquivo
                </button>
              </div>
              {task.files?.map((file) => (
                <div key={file.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <span className="text-lg">
                    {file.type === 'pdf' ? '📄' : file.type === 'doc' ? '📝' : file.type === 'xls' ? '📊' : '📎'}
                  </span>
                  <span className="flex-1 text-xs text-slate-300 truncate">{file.name}</span>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Link size={14} />
                  </a>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-medium text-slate-300">Imagens desta Ação</h4>
                  <p className="text-[10px] text-slate-500">Específicas para: {task.text.substring(0, 30)}{task.text.length > 30 ? '...' : ''}</p>
                </div>
                <button
                  onClick={addImage}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus size={12} /> Adicionar Imagem
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {task.images?.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Imagem ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function NodeModal({ isOpen, onClose, nodeData, nodeId, details, onUpdateDetails, onUpdateNodeLabel, currentUser }: NodeModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(nodeData?.label || '');

  // Update label value when nodeData changes
  useEffect(() => {
    setLabelValue(nodeData?.label || '');
  }, [nodeData?.label]);

  const handleLabelSave = () => {
    if (labelValue.trim() && labelValue !== nodeData?.label && onUpdateNodeLabel) {
      onUpdateNodeLabel(nodeId, labelValue.trim());
    }
    setIsEditingLabel(false);
  };

  const handleLabelCancel = () => {
    setLabelValue(nodeData?.label || '');
    setIsEditingLabel(false);
  };

  // Comments functionality
  const {
    comments,
    unresolvedCount,
    addComment,
    resolveComment,
    deleteComment,
  } = useComments(nodeId);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
    const currentImages = details.images || [];
    onUpdateDetails(nodeId, {
      ...details,
      images: [...currentImages, ...newImages],
    });
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    try {
      new URL(url);
      setUrlError('');
      const currentImages = details.images || [];
      onUpdateDetails(nodeId, { ...details, images: [...currentImages, url] });
      setUrlInput('');
    } catch {
      setUrlError('URL inválida. Use http:// ou https://');
    }
  };

  const isVideo = (src: string) => /\.(mp4|webm|ogg)$/i.test(src);
  const isGif   = (src: string) => /\.gif$/i.test(src);

  const removeImage = (index: number) => {
    const currentImages = details.images || [];
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    onUpdateDetails(nodeId, { ...details, images: newImages });
  };

  const toggleTask = (taskId: string) => {
    const currentTasks = details.tasks || [];
    const newTasks = currentTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    onUpdateDetails(nodeId, { ...details, tasks: newTasks });
  };

  const addTask = () => {
    const text = prompt("Digite a nova ação:");
    if (text) {
      const newTask = { id: Date.now().toString(), text, completed: false };
      const currentTasks = details.tasks || [];
      onUpdateDetails(nodeId, { ...details, tasks: [...currentTasks, newTask] });
    }
  };

  const deleteTask = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta ação?')) {
      const currentTasks = details.tasks || [];
      const newTasks = currentTasks.filter(t => t.id !== taskId);
      onUpdateDetails(nodeId, { ...details, tasks: newTasks });
    }
  };

  const editTask = (taskId: string, currentText: string) => {
    const newText = prompt("Editar ação:", currentText);
    if (newText && newText !== currentText) {
      const currentTasks = details.tasks || [];
      const newTasks = currentTasks.map(t => t.id === taskId ? { ...t, text: newText } : t);
      onUpdateDetails(nodeId, { ...details, tasks: newTasks });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && nodeData && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#0f172a]/60 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                    <Info size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditingLabel ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={labelValue}
                          onChange={(e) => setLabelValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleLabelSave();
                            if (e.key === 'Escape') handleLabelCancel();
                          }}
                          autoFocus
                          className="flex-1 px-3 py-1.5 bg-black/30 border border-blue-500/50 rounded-lg text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <button
                          onClick={handleLabelSave}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Salvar"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          onClick={handleLabelCancel}
                          className="p-1.5 text-slate-400 hover:bg-white/10 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <h2 
                          className="text-2xl font-bold text-white tracking-tight cursor-pointer hover:text-blue-300 transition-colors"
                          onClick={() => setIsEditingLabel(true)}
                          title="Clique para editar"
                        >
                          {nodeData.label}
                        </h2>
                        <button
                          onClick={() => setIsEditingLabel(true)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="Editar título"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                        {nodeData.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCommentsOpen(true)}
                    className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
                    title="Comentários"
                  >
                    <MessageSquare size={24} />
                    {unresolvedCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unresolvedCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content Grid */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
                {/* Left Column: Info & Tasks */}
                <div className="flex-1 flex flex-col gap-8">
                  <section>
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                      Detalhes Analíticos
                    </h3>
                    <textarea
                      value={details.description}
                      onChange={(e) => onUpdateDetails(nodeId, { ...details, description: e.target.value })}
                      className="w-full h-40 p-4 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none shadow-inner"
                      placeholder="Descreva o contexto, especificações ou impactos deste nó no processo..."
                    />
                  </section>

                  {/* Action Flow Guide - Didactic visualization */}
                  {(details.howTo || details.ifOK || details.ifNOK) && (
                    <section>
                      <div className="flex items-center gap-2 mb-3">
                        <Workflow className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-bold text-purple-300 uppercase tracking-widest">
                          Guia de Execução
                        </h3>
                      </div>
                      <ActionFlow 
                        howTo={details.howTo}
                        ifOK={details.ifOK}
                        ifNOK={details.ifNOK}
                        tips={details.tips}
                      />
                    </section>
                  )}

                  <section>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                        Ações & Evidências
                      </h3>
                      <button onClick={addTask} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-colors">
                        <Plus size={14} /> Adicionar
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {(!details.tasks || details.tasks.length === 0) ? (
                        <div className="text-sm text-slate-500 italic p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                          Nenhuma ação registrada.
                        </div>
                      ) : (
                        details.tasks.map(task => (
                          <TaskEditor
                            key={task.id}
                            task={task}
                            onToggle={() => toggleTask(task.id)}
                            onEditText={() => editTask(task.id, task.text)}
                            onDelete={() => deleteTask(task.id)}
                            onUpdateTask={(updatedTask) => {
                              // Use functional update to ensure we have latest details
                              onUpdateDetails(nodeId, (prevDetails: NodeDetails) => {
                                const currentDetails = prevDetails || details;
                                const newTasks = currentDetails.tasks.map(t => t.id === task.id ? updatedTask : t);
                                return { ...currentDetails, tasks: newTasks };
                              });
                            }}
                          />
                        ))
                      )}
                    </div>
                  </section>

                  {/* Task Images Gallery - Separate section for all task images */}
                  {details.tasks && details.tasks.some(t => t.images && t.images.length > 0) && (
                    <section className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <ImagePlus size={16} className="text-amber-400" />
                          <h3 className="text-sm font-bold text-amber-300 uppercase tracking-widest">
                            Imagens das Ações
                          </h3>
                          <span className="text-xs text-slate-500">
                            ({details.tasks.reduce((acc, t) => acc + (t.images?.length || 0), 0)} imagens)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 italic">
                          Imagens específicas de cada ação/evidência
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {details.tasks.map(task => 
                          task.images?.map((img, idx) => (
                            <div key={`${task.id}-${idx}`} className="relative group">
                              <img 
                                src={img} 
                                alt={`${task.text} - Imagem ${idx + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border border-white/10" 
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-2">
                                <p className="text-[10px] text-white truncate">{task.text}</p>
                                <button
                                  onClick={() => {
                                    const newImages = task.images?.filter((_, i) => i !== idx) || [];
                                    onUpdateDetails(nodeId, (prevDetails: NodeDetails) => {
                                      const currentDetails = prevDetails || details;
                                      const newTasks = currentDetails.tasks.map(t => 
                                        t.id === task.id ? { ...t, images: newImages } : t
                                      );
                                      return { ...currentDetails, tasks: newTasks };
                                    });
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-red-500/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column: Media Gallery - Node Level Images */}
                <div className="w-full lg:w-[400px] flex flex-col gap-4 border-l border-white/10 pl-6">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <ImagePlus size={16} /> Imagens do Processo (Geral)
                  </h3>
                  <p className="text-xs text-slate-500">Imagens de referência geral deste nó/processo</p>
                  
                  {/* Dropzone */}
                  <div
                    className={cn(
                      "w-full p-5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                      dragActive ? "border-blue-400 bg-blue-500/10" : "border-white/20 bg-white/5 hover:bg-white/10"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud size={28} className={dragActive ? "text-blue-400 mb-2" : "text-slate-400 mb-2"} />
                    <p className="text-sm text-slate-300 font-medium mb-0.5">Arraste ou clique para enviar</p>
                    <p className="text-xs text-slate-500">PNG · JPG · GIF · MP4 · WebM</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/mp4,video/webm,video/ogg"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </div>

                  {/* URL input */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1"><Link size={10} /> Ou cole uma URL (imagem · GIF · vídeo)</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoComplete="off"
                        value={urlInput}
                        onChange={e => { setUrlInput(e.target.value); setUrlError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
                        placeholder="https://example.com/referencia.jpg"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors"
                      />
                      <button
                        onClick={handleAddUrl}
                        className="px-3 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-500/30 transition-colors"
                      >Adicionar</button>
                    </div>
                    {urlError && <p className="text-[10px] text-red-400">{urlError}</p>}
                  </div>

                  {/* Media Grid */}
                  {details.images && details.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[380px] pr-1 custom-scrollbar">
                      {details.images.map((src, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video bg-black/50 border border-white/10">
                          {/* type badge */}
                          <div className="absolute top-1.5 left-1.5 z-10">
                            {isVideo(src) && (
                              <span className="flex items-center gap-1 text-[9px] font-bold bg-purple-500/70 text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                <Video size={9} /> Vídeo
                              </span>
                            )}
                            {isGif(src) && (
                              <span className="text-[9px] font-bold bg-pink-500/70 text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm">GIF</span>
                            )}
                          </div>
                          {/* media */}
                          {isVideo(src) ? (
                            <video src={src} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <img src={src} alt="Evidence" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                          )}
                          {/* order badge */}
                          <div className="absolute top-1.5 right-1.5 z-10">
                            <span className="text-[9px] font-black text-white bg-black/50 px-1.5 py-0.5 rounded-md backdrop-blur-sm">#{idx + 1}</span>
                          </div>
                          {/* delete overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                              className="p-2 bg-rose-500/90 text-white rounded-full hover:bg-rose-500 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!details.images || details.images.length === 0) && (
                    <p className="text-[11px] text-slate-600 text-center py-2">Nenhuma mídia adicionada ainda.</p>
                  )}
                </div>
              </div>

            </motion.div>
          </div>

          {/* Comments Panel */}
          <CommentsPanel
            isOpen={isCommentsOpen}
            onClose={() => setIsCommentsOpen(false)}
            comments={comments}
            currentUser={currentUser || null}
            onAddComment={addComment}
            onResolveComment={resolveComment}
            onDeleteComment={deleteComment}
            nodeName={nodeData?.label || 'Nó'}
          />
        </>
      )}
    </AnimatePresence>
  );
}
