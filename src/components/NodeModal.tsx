import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, ImagePlus, Plus, CheckCircle2, Circle, UploadCloud, Trash2, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { useComments } from '../hooks/useComments';
import { CommentsPanel } from './CommentsPanel';

interface NodeTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface NodeDetails {
  description: string;
  images: string[];
  tasks: NodeTask[];
}

interface NodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: any;
  nodeId: string;
  details: NodeDetails;
  onUpdateDetails: (id: string, newDetails: NodeDetails) => void;
  currentUser?: { name: string; email: string; role: string } | null;
}

export function NodeModal({ isOpen, onClose, nodeData, nodeId, details, onUpdateDetails, currentUser }: NodeModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

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
    // Convert files to object URLs for preview
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
    onUpdateDetails(nodeId, {
      ...details,
      images: [...details.images, ...newImages],
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...details.images];
    newImages.splice(index, 1);
    onUpdateDetails(nodeId, { ...details, images: newImages });
  };

  const toggleTask = (taskId: string) => {
    const newTasks = details.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    onUpdateDetails(nodeId, { ...details, tasks: newTasks });
  };

  const addTask = () => {
    const text = prompt("Digite a nova ação:");
    if (text) {
      const newTask = { id: Date.now().toString(), text, completed: false };
      onUpdateDetails(nodeId, { ...details, tasks: [...details.tasks, newTask] });
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
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {nodeData.label}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                        {nodeData.category}
                      </span>
                      {nodeData.requiredIATF && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-medium border border-blue-500/30">
                          IATF {nodeData.requiredIATF}
                        </span>
                      )}
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
                      {details.tasks.length === 0 ? (
                        <div className="text-sm text-slate-500 italic p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                          Nenhuma ação registrada.
                        </div>
                      ) : (
                        details.tasks.map(task => (
                          <div 
                            key={task.id} 
                            className="flex items-start gap-3 p-3 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            onClick={() => toggleTask(task.id)}
                          >
                            <button className="mt-0.5 text-blue-400 focus:outline-none">
                              {task.completed ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Circle size={18} />}
                            </button>
                            <span className={cn("text-sm transition-colors", task.completed ? "text-slate-500 line-through" : "text-slate-200")}>
                              {task.text}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                {/* Right Column: Media Gallery */}
                <div className="w-full lg:w-[400px] flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <ImagePlus size={16} /> Hub Visual
                  </h3>
                  
                  {/* Dropzone */}
                  <div
                    className={cn(
                      "w-full p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                      dragActive ? "border-blue-400 bg-blue-500/10" : "border-white/20 bg-white/5 hover:bg-white/10"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud size={32} className={dragActive ? "text-blue-400 mb-3" : "text-slate-400 mb-3"} />
                    <p className="text-sm text-slate-300 font-medium mb-1">
                      Arraste imagens ou clique
                    </p>
                    <p className="text-xs text-slate-500">
                      Suporta PNG, JPG, GIF
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </div>

                  {/* Image Grid */}
                  <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {details.images.map((src, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video bg-black/50 border border-white/10">
                        <img src={src} alt="Evidence" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                            className="p-2 bg-rose-500/80 text-white rounded-full hover:bg-rose-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
