import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud, FileText, Calendar, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { DocumentItem } from './DocumentManager';

interface DocumentUploadModalProps {
  onClose: () => void;
  onSave: (doc: DocumentItem) => void;
  initialData?: DocumentItem;
}

export function DocumentUploadModal({ onClose, onSave, initialData }: DocumentUploadModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'pdf');
  const [expirationDate, setExpirationDate] = useState(initialData?.expirationDate || '');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    let finalName = name;
    if (file) {
      finalName = file.name;
    }

    const now = new Date();
    let status: 'valid' | 'expiring' | 'expired' = 'valid';
    
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        status = 'expired';
      } else if (diffDays <= 30) {
        status = 'expiring';
      }
    }

    const doc: DocumentItem = {
      id: initialData?.id || `doc-${Date.now()}`,
      name: finalName,
      type: file ? file.name.split('.').pop()?.toLowerCase() || 'file' : type,
      size: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : initialData?.size || '1.0 MB',
      uploadDate: initialData?.uploadDate || now.toISOString().split('T')[0],
      expirationDate: expirationDate || null,
      status
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
