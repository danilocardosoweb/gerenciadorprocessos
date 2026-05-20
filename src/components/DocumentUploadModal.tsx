import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud, FileText, Calendar, ChevronDown, Check, Globe, Building2, User, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { DocumentItem, DocVisibility } from './DocumentManager';

interface DocumentUploadModalProps {
  onClose: () => void;
  onSave: (doc: DocumentItem) => void;
  initialData?: DocumentItem;
  currentUser?: { id: string; name: string; email: string; role: string; department?: string } | null;
  users?: { id: string; name: string; email: string; role: string }[];
  departments?: { id: string; name: string; color: string }[];
}

const visibilityOptions: { value: DocVisibility; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { value: 'public',     label: '🌐 Público (todos)',      desc: 'Todos os usuários podem ver',           icon: Globe,     color: 'text-emerald-400' },
  { value: 'department', label: '🏢 Departamento',          desc: 'Apenas o departamento selecionado',     icon: Building2, color: 'text-blue-400'    },
  { value: 'specific',   label: '👤 Específico (1 pessoa)', desc: 'Somente uma pessoa + você',             icon: User,      color: 'text-violet-400'  },
  { value: 'private',    label: '🔒 Privado (só eu)',        desc: 'Apenas você pode ver',                  icon: Lock,      color: 'text-slate-400'   },
];

export function DocumentUploadModal({ onClose, onSave, initialData, currentUser, users = [], departments = [] }: DocumentUploadModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'pdf');
  const [expirationDate, setExpirationDate] = useState(initialData?.expirationDate || '');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<DocVisibility>(initialData?.visibility || 'public');
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(initialData?.department || '');
  const [deptOpen, setDeptOpen] = useState(false);
  const [specificUserId, setSpecificUserId] = useState(initialData?.specific_user_id || '');
  const [specificUserOpen, setSpecificUserOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (visibility === 'specific' && !specificUserId) return;

    let finalName = name;
    if (file) finalName = file.name;

    const now = new Date();
    let status: 'valid' | 'expiring' | 'expired' = 'valid';
    if (expirationDate) {
      const diffDays = Math.ceil((new Date(expirationDate).getTime() - now.getTime()) / 86400000);
      if (diffDays < 0) status = 'expired';
      else if (diffDays <= 30) status = 'expiring';
    }

    const specificUser = users.find(u => u.id === specificUserId);

    const doc: DocumentItem = {
      id: initialData?.id || `doc-${Date.now()}`,
      name: finalName,
      type: file ? file.name.split('.').pop()?.toLowerCase() || 'file' : type,
      size: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : initialData?.size || '1.0 MB',
      uploadDate: initialData?.uploadDate || now.toISOString().split('T')[0],
      expirationDate: expirationDate || null,
      status,
      visibility,
      department: visibility === 'department' ? selectedDept : undefined,
      specific_user_id: visibility === 'specific' ? specificUserId : null,
      specific_user_name: visibility === 'specific' ? specificUser?.name : undefined,
      created_by: initialData?.created_by || currentUser?.id || null,
    };

    onSave(doc);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setName(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-6"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">
          {initialData ? 'Editar Documento' : 'Cadastrar Documento'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!initialData && (
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer text-center",
                isDragging ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20 hover:bg-white/5",
                file ? "border-emerald-500/50 bg-emerald-500/5" : ""
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input 
                id="file-upload"
                type="file" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              
              {file ? (
                <>
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-3">
                    <FileText size={24} />
                  </div>
                  <p className="text-sm font-medium text-emerald-400">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mb-3">
                    <UploadCloud size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-200">Arraste um arquivo ou clique para selecionar</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOC, JPG até 10MB</p>
                </>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Nome do Documento
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
              placeholder="Ex: Procedimento Operacional Padrão"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Data de Vencimento (Opcional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Visibilidade</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setVisibilityOpen(o => !o); setDeptOpen(false); setSpecificUserOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-black/20 border border-white/10 hover:border-white/20 rounded-lg text-white text-sm transition-colors"
              >
                <span className="flex-1 text-left">
                  {visibilityOptions.find(o => o.value === visibility)?.label}
                </span>
                <ChevronDown size={14} className={cn('text-slate-400 transition-transform', visibilityOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {visibilityOpen && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
                    className="absolute top-full mt-1 left-0 right-0 z-30 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden">
                    {visibilityOptions.map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => { setVisibility(opt.value); setVisibilityOpen(false); }}
                        className={cn('w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/8 transition-colors text-left', visibility === opt.value ? 'bg-white/10 text-white' : 'text-slate-300')}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-[10px] text-slate-500">{opt.desc}</p>
                        </div>
                        {visibility === opt.value && <Check size={13} className="text-blue-400 shrink-0" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Department picker */}
          {visibility === 'department' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                <Building2 size={13} className="text-blue-400" /> Qual departamento?
              </label>
              <div className="relative">
                <button type="button"
                  onClick={() => { setDeptOpen(o => !o); setVisibilityOpen(false); }}
                  className={cn('w-full flex items-center gap-2 px-4 py-2.5 bg-black/20 border rounded-lg text-white text-sm transition-colors',
                    selectedDept ? 'border-blue-500/40' : 'border-white/10 hover:border-white/20')}>
                  <span className="flex-1 text-left text-sm">{selectedDept || <span className="text-slate-500">Selecione...</span>}</span>
                  <ChevronDown size={14} className={cn('text-slate-400 transition-transform shrink-0', deptOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {deptOpen && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.1 }}
                      className="absolute top-full mt-1 left-0 right-0 z-30 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                      {departments.map(d => (
                        <button key={d.id} type="button" onClick={() => { setSelectedDept(d.name); setDeptOpen(false); }}
                          className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/8 transition-colors', selectedDept === d.name ? 'bg-white/10 text-white' : 'text-slate-300')}>
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                          {d.name}
                          {selectedDept === d.name && <Check size={13} className="ml-auto text-blue-400" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Specific user picker */}
          {visibility === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
                <User size={13} className="text-violet-400" /> Para qual pessoa? <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <button type="button"
                  onClick={() => { setSpecificUserOpen(o => !o); setVisibilityOpen(false); }}
                  className={cn('w-full flex items-center gap-2 px-4 py-2.5 bg-black/20 border rounded-lg text-white text-sm transition-colors',
                    specificUserId ? 'border-violet-500/40 bg-violet-500/5' : 'border-white/10 hover:border-white/20')}>
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
                      className="absolute top-full mt-1 left-0 right-0 z-30 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
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
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                Apenas <strong className="text-slate-400">{users.find(u => u.id === specificUserId)?.name || 'essa pessoa'}</strong> e você poderão ver este documento.
              </p>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
            >
              {initialData ? 'Salvar Alterações' : 'Cadastrar Documento'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
