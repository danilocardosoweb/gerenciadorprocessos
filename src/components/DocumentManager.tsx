import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Image as ImageIcon, AlertTriangle, CheckCircle2, CloudUpload, Search, File, Trash2, Download, MoreVertical, FileBadge, Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';
import { DocumentUploadModal } from './DocumentUploadModal';

import { supabase } from '../lib/supabase';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  expirationDate: string | null;
  status: 'valid' | 'expiring' | 'expired';
}

export interface DocumentManagerProps {
  documents: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  refreshData?: () => void;
}

export function DocumentManager({ documents, setDocuments, refreshData }: DocumentManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validCount = documents.filter(d => d.status === 'valid').length;
  const expiringCount = documents.filter(d => d.status === 'expiring').length;
  const expiredCount = documents.filter(d => d.status === 'expired').length;

  const handleSaveDoc = async (doc: DocumentItem) => {
    // optimistic update
    if (editingDoc) {
      setDocuments(documents.map(d => d.id === doc.id ? doc : d));
      // Supabase update
      await supabase.from('documents').update({
        name: doc.name,
        type: doc.type,
        size: doc.size,
        expiration_date: doc.expirationDate,
        status: doc.status
      }).eq('id', doc.id);
    } else {
      const tempId = doc.id;
      setDocuments([doc, ...documents]);
      
      const { data, error } = await supabase.from('documents').insert({
        name: doc.name,
        type: doc.type,
        size: doc.size,
        upload_date: doc.uploadDate,
        expiration_date: doc.expirationDate,
        status: doc.status
      }).select().single();
      
      if (data && refreshData) refreshData();
    }
    setIsModalOpen(false);
    setEditingDoc(null);
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Você tem certeza que deseja excluir este documento?')) return;
    setDocuments(documents.filter(d => d.id !== id));
    await supabase.from('documents').delete().eq('id', id);
    if (refreshData) refreshData();
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="text-red-400" size={24} />;
      case 'doc': case 'docx': return <FileText className="text-blue-400" size={24} />;
      case 'jpg': case 'jpeg': case 'png': case 'img': return <ImageIcon className="text-purple-400" size={24} />;
      default: return <File className="text-slate-400" size={24} />;
    }
  };

  return (
    <div className="w-full space-y-6 pb-20">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
            <FileBadge size={18} />
            <span className="text-sm font-medium">Total de Documentos</span>
          </div>
          <span className="text-3xl font-bold text-white">{documents.length}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-3 text-emerald-400/80 mb-2">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">Válidos</span>
          </div>
          <span className="text-3xl font-bold text-emerald-400">{validCount}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-3 text-amber-400/80 mb-2">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">Vencem em Breve</span>
          </div>
          <span className="text-3xl font-bold text-amber-400">{expiringCount}</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-3 text-red-400/80 mb-2">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">Vencidos</span>
          </div>
          <span className="text-3xl font-bold text-red-400">{expiredCount}</span>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        
        <button 
          onClick={() => {
            setEditingDoc(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
        >
          <CloudUpload size={18} /> Cadastrar Documento
        </button>
      </div>

      {/* Document List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider bg-black/20">
                <th className="px-6 py-4 font-medium">Nome do Arquivo</th>
                <th className="px-6 py-4 font-medium">Tamanho</th>
                <th className="px-6 py-4 font-medium">Upload</th>
                <th className="px-6 py-4 font-medium">Vencimento</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredDocs.map((doc, idx) => (
                  <motion.tr 
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center">
                          {getFileIcon(doc.type)}
                        </div>
                        <span className="font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs" title={doc.name}>
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{doc.size}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{doc.uploadDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{doc.expirationDate || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold flex items-center justify-center w-max gap-1.5",
                        doc.status === 'valid' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        doc.status === 'expiring' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}>
                        {doc.status === 'valid' && <CheckCircle2 size={12} />}
                        {doc.status === 'expiring' && <AlertTriangle size={12} />}
                        {doc.status === 'expired' && <AlertTriangle size={12} />}
                        {doc.status === 'valid' ? 'Válido' : doc.status === 'expiring' ? 'Vence em Breve' : 'Vencido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingDoc(doc);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Download">
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      Nenhum documento encontrado.
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <DocumentUploadModal
            onClose={() => {
              setIsModalOpen(false);
              setEditingDoc(null);
            }}
            onSave={handleSaveDoc}
            initialData={editingDoc || undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

