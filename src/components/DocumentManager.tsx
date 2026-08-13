import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image as ImageIcon, AlertTriangle, CheckCircle2, CloudUpload, Search, File, Trash2, Download, FileBadge, Edit3, Globe, Building2, User, Lock, Eye, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePermissions } from '../lib/permissions';
import { DocumentUploadModal } from './DocumentUploadModal';
import { ConfirmModal } from './ConfirmModal';

import { supabase } from '../lib/supabase';

export type DocVisibility = 'public' | 'department' | 'specific' | 'private';

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  file_size_bytes: number | null;
  file_path: string | null;
  mime_type: string | null;
  localFile?: File | null;
  uploadDate: string;
  expirationDate: string | null;
  status: 'valid' | 'expiring' | 'expired';
  visibility: DocVisibility;
  department?: string;
  specific_user_id?: string | null;
  specific_user_name?: string;
  created_by?: string | null;
}

export interface DocumentManagerProps {
  documents: DocumentItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  refreshData?: () => void;
  currentUser?: { id: string; name: string; email: string; role: string; department?: string } | null;
  users?: { id: string; name: string; email: string; role: string }[];
  departments?: { id: string; name: string; color: string }[];
}

const visibilityConfig: Record<DocVisibility, { icon: React.FC<{ size?: number; className?: string }>; label: string; color: string }> = {
  public:     { icon: Globe,     label: 'Público',      color: 'text-emerald-400' },
  department: { icon: Building2, label: 'Departamento', color: 'text-blue-400'    },
  specific:   { icon: User,      label: 'Específico',   color: 'text-violet-400'  },
  private:    { icon: Lock,      label: 'Privado',      color: 'text-slate-400'   },
};

export function DocumentManager({ documents, setDocuments, refreshData, currentUser, users: usersProp = [], departments: deptsProp = [] }: DocumentManagerProps) {
  const safeCurrentUser = currentUser || { id: '', name: '', email: '', role: 'Visualizador', department: '' };
  const perms = usePermissions(safeCurrentUser as any);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string>('');
  const [documentPendingDeletion, setDocumentPendingDeletion] = useState<DocumentItem | null>(null);
  const [users, setUsers] = useState(usersProp);
  const [departments, setDepartments] = useState(deptsProp);

  const resolveCreatedBy = () => {
    const uid = safeCurrentUser.id || null;
    if (!uid) return null;
    const userExistsInTecnoUsers = users.some(u => u.id === uid);
    return userExistsInTecnoUsers ? uid : null;
  };

  useEffect(() => {
    if (usersProp.length === 0 || deptsProp.length === 0) {
      Promise.all([
        supabase.from('tecno_users').select('*').order('created_at', { ascending: true }),
        supabase.from('departments').select('*').order('created_at', { ascending: true }),
      ]).then(([{ data: u, error: uErr }, { data: d, error: dErr }]) => {
        if (uErr) console.error('L Error fetching users:', uErr);
        if (dErr) console.error('L Error fetching departments:', dErr);
        if (u) setUsers(u);
        if (d) setDepartments(d);
      });
    }
  }, []);

  const isPrivilegedViewer = perms.isGerente || perms.isAdmin || perms.can.deleteDocument;
  const normalizedUserDept = (safeCurrentUser.department || '').trim().toLowerCase();
  const normalizedUserDeptName =
    (departments.find(d => d.id === safeCurrentUser.department)?.name || '').trim().toLowerCase();

  const canUserViewDoc = (doc: DocumentItem) => {
    // Perfis gerenciais/administrativos podem visualizar todos os documentos.
    if (isPrivilegedViewer) return true;

    if (doc.visibility === 'private') {
      return doc.created_by === safeCurrentUser.id;
    }

    if (doc.visibility === 'specific') {
      return doc.created_by === safeCurrentUser.id || doc.specific_user_id === safeCurrentUser.id;
    }

    if (doc.visibility === 'department') {
      // Compatibiliza quando currentUser.department vem como nome ou id.
      const docDept = (doc.department || '').trim().toLowerCase();
      const sameDepartment =
        !!docDept &&
        (docDept === normalizedUserDept || docDept === normalizedUserDeptName);
      return doc.created_by === safeCurrentUser.id || sameDepartment;
    }

    return true; // public
  };

  const visibleDocs = documents.filter(canUserViewDoc);
  const filteredDocs = visibleDocs.filter(doc =>
    (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validCount = visibleDocs.filter(d => d.status === 'valid').length;
  const expiringCount = visibleDocs.filter(d => d.status === 'expiring').length;
  const expiredCount = visibleDocs.filter(d => d.status === 'expired').length;

  const formatFileSize = (bytes: number | null, fallback: string) => {
    if (typeof bytes === 'number' && Number.isFinite(bytes)) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return fallback || '-';
  };

  const normalizeFileName = (value: string) =>
    (value || 'arquivo')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_');

  const buildStoragePath = (docId: string, fileName: string) =>
    `${docId}/${Date.now()}-${normalizeFileName(fileName)}`;

  const handleSaveDoc = async (doc: DocumentItem) => {
    // optimistic update
    if (editingDoc) {
      setDocuments(documents.map(d => d.id === doc.id ? doc : d));
      await supabase.from('documents').update({
        name: doc.name,
        type: doc.type,
        size: doc.size,
        expiration_date: doc.expirationDate,
        status: doc.status,
        visibility: doc.visibility,
        department: doc.department || null,
        specific_user_id: doc.specific_user_id || null,
        file_size_bytes: doc.file_size_bytes ?? null,
        file_path: doc.file_path ?? null,
        mime_type: doc.mime_type ?? null,
      }).eq('id', doc.id);
    } else {
      const hasFile = !!doc.localFile;
      const newId = crypto.randomUUID();
      let filePath: string | null = null;
      let fileSizeBytes: number | null = doc.file_size_bytes ?? null;
      let mimeType: string | null = doc.mime_type ?? null;

      if (hasFile && doc.localFile) {
        filePath = buildStoragePath(newId, doc.localFile.name);
        fileSizeBytes = doc.localFile.size;
        mimeType = doc.localFile.type || null;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, doc.localFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: doc.localFile.type || undefined,
          });

        if (uploadError) {
          alert(`Erro ao enviar arquivo para armazenamento: ${uploadError.message}`);
          return;
        }
      }

      const localDoc: DocumentItem = {
        ...doc,
        id: newId,
        file_path: filePath,
        file_size_bytes: fileSizeBytes,
        mime_type: mimeType,
        size: formatFileSize(fileSizeBytes, doc.size),
        localFile: null,
      };
      setDocuments([localDoc, ...documents]);

      const insertPayload: any = {
        id: newId,
        name: doc.name,
        type: doc.type,
        size: formatFileSize(fileSizeBytes, doc.size),
        upload_date: doc.uploadDate,
        expiration_date: doc.expirationDate,
        status: doc.status,
        visibility: doc.visibility,
        department: doc.department || null,
        specific_user_id: doc.specific_user_id || null,
        created_by: resolveCreatedBy(),
        file_size_bytes: fileSizeBytes,
        file_path: filePath,
        mime_type: mimeType,
      };

      let { data, error } = await supabase
        .from('documents')
        .insert(insertPayload)
        .select()
        .single();

      // Backward compatibility: schema sem colunas novas.
      if (error && (error as any).code === '42703') {
        const legacyPayload = {
          id: newId,
          name: doc.name,
          type: doc.type,
          size: formatFileSize(fileSizeBytes, doc.size),
          upload_date: doc.uploadDate,
          expiration_date: doc.expirationDate,
          status: doc.status,
          visibility: doc.visibility,
          department: doc.department || null,
          specific_user_id: doc.specific_user_id || null,
          created_by: resolveCreatedBy(),
        };

        const legacyInsert = await supabase
          .from('documents')
          .insert(legacyPayload)
          .select()
          .single();
        data = legacyInsert.data;
        error = legacyInsert.error;
      }

      // Backward compatibility: FK antiga ou inconsistência entre users/tecno_users
      if (error && (error as any).code === '23503' && /documents_created_by_fkey/i.test(error.message || '')) {
        const fallbackPayload: any = {
          ...insertPayload,
          created_by: null,
        };
        if ((error as any).code === '42703') {
          delete fallbackPayload.file_size_bytes;
          delete fallbackPayload.file_path;
          delete fallbackPayload.mime_type;
        }

        const fallbackInsert = await supabase
          .from('documents')
          .insert(fallbackPayload)
          .select()
          .single();

        data = fallbackInsert.data;
        error = fallbackInsert.error;
      }

      if (error) {
        alert(`Erro ao salvar documento: ${error.message}`);
      } else if (data && refreshData) {
        refreshData();
      }
    }
    setIsModalOpen(false);
    setEditingDoc(null);
  };

  const handleDownloadDoc = async (doc: DocumentItem) => {
    if (!doc.file_path) {
      alert('Este documento não possui arquivo anexado para download.');
      return;
    }

    const { data, error } = await supabase.storage
      .from('documents')
      .download(doc.file_path);

    if (error || !data) {
      alert(`Não foi possível baixar o arquivo: ${error.message || 'arquivo indisponível'}`);
      return;
    }

    const blobUrl = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = doc.name || 'documento';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const handlePreviewDoc = async (doc: DocumentItem) => {
    if (!doc.file_path) {
      alert('Este documento não possui arquivo anexado para visualização.');
      return;
    }

    setPreviewDoc(doc);
    setPreviewLoading(true);
    setPreviewError('');
    setPreviewUrl('');

    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 60 * 30);

    if (error || !data.signedUrl) {
      setPreviewError(`Não foi possível abrir a visualização: ${error.message || 'URL indisponível'}`);
      setPreviewLoading(false);
      return;
    }

    setPreviewUrl(data.signedUrl);
    setPreviewLoading(false);
  };

  const closePreview = () => {
    setPreviewDoc(null);
    setPreviewUrl('');
    setPreviewError('');
    setPreviewLoading(false);
  };

  const getPreviewKind = (doc: DocumentItem | null) => {
    if (!doc) return 'unknown';
    const ext = ((doc.type || doc.name.split('.').pop() || '').toLowerCase()).trim();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['txt', 'md', 'csv'].includes(ext)) return 'text';
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'office';
    return 'unknown';
  };

  const handleDeleteDoc = (documentItem: DocumentItem) => {
    if (!perms.can.deleteDocument) {
      alert('Você não tem permissão para excluir documentos.');
      return;
    }
    setDocumentPendingDeletion(documentItem);
  };

  const confirmDeleteDoc = async () => {
    if (!documentPendingDeletion) return;

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentPendingDeletion.id);

    if (error) {
      console.error('Erro ao excluir documento:', error);
      alert(`Não foi possível excluir o documento: ${error.message}`);
      throw error;
    }

    setDocuments(current => current.filter(document => document.id !== documentPendingDeletion.id));
    setDocumentPendingDeletion(null);
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
          <span className="text-3xl font-bold text-white">{visibleDocs.length}</span>
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
          disabled={!perms.can.uploadDocument}
          title={!perms.can.uploadDocument ? 'Sem permissão para cadastrar documentos' : ''}
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
                <th className="px-6 py-4 font-medium">Visibilidade</th>
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
                    <td className="px-6 py-4 text-sm text-slate-400">{formatFileSize(doc.file_size_bytes, doc.size)}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{doc.uploadDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{doc.expirationDate || '-'}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const vcfg = visibilityConfig[doc.visibility || 'public'];
                        const VIcon = vcfg.icon;
                        return (
                          <span className={cn('flex items-center gap-1.5 text-xs font-semibold', vcfg.color)}>
                            <VIcon size={13} />
                            {vcfg.label}
                            {doc.visibility === 'department' && doc.department && ` · ${doc.department}`}
                            {doc.visibility === 'specific' && doc.specific_user_name && ` · ${doc.specific_user_name}`}
                          </span>
                        );
                      })()}
                    </td>
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
                        <button
                          onClick={() => handlePreviewDoc(doc)}
                          className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadDoc(doc)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        {perms.can.deleteDocument && (
                        <button 
                          onClick={() => handleDeleteDoc(doc)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      {documents.length > 0 && visibleDocs.length === 0 ?
                         'Existem documentos cadastrados, mas voc não tem acesso a eles pela visibilidade definida.'
                        : 'Nenhum documento encontrado.'}
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
            currentUser={currentUser}
            users={users}
            departments={departments}
            isOpen={isModalOpen}
          />
        )}
      </AnimatePresence>
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {previewDoc && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-8"
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closePreview} />
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                className="relative w-full max-w-6xl h-[86vh] rounded-2xl border border-white/15 bg-[#111c33] overflow-hidden shadow-2xl"
              >
                <div className="h-14 px-4 md:px-5 border-b border-white/10 bg-black/20 flex items-center justify-between">
                  <p className="text-sm md:text-base text-white font-semibold truncate pr-4">{previewDoc.name}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadDoc(previewDoc)}
                      className="px-3 py-1.5 text-xs md:text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                    >
                      Baixar
                    </button>
                    <button
                      onClick={closePreview}
                      className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
                      title="Fechar"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="h-[calc(86vh-56px)] bg-slate-950/40">
                  {previewLoading && (
                    <div className="h-full flex items-center justify-center text-slate-300">
                      Carregando visualização...
                    </div>
                  )}

                  {!previewLoading && previewError && (
                    <div className="h-full flex items-center justify-center p-6">
                      <div className="max-w-xl w-full rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">
                        {previewError}
                      </div>
                    </div>
                  )}

                  {!previewLoading && !previewError && previewUrl && (() => {
                    const kind = getPreviewKind(previewDoc);
                    if (kind === 'image') {
                      return (
                        <div className="h-full flex items-center justify-center bg-black/30 p-4">
                          <img src={previewUrl} alt={previewDoc.name} className="max-h-full max-w-full object-contain rounded-lg" />
                        </div>
                      );
                    }

                    if (kind === 'office') {
                      const officeUrl = `https://view.officeapps.live.com/op/embed.aspxsrc=${encodeURIComponent(previewUrl)}`;
                      return <iframe title="Pr-visualização Office" src={officeUrl} className="w-full h-full border-0" />;
                    }

                    if (kind === 'pdf' || kind === 'text') {
                      return <iframe title="Pr-visualização" src={previewUrl} className="w-full h-full border-0" />;
                    }

                    return (
                      <div className="h-full flex items-center justify-center p-6">
                        <div className="max-w-xl w-full rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100 text-sm">
                          Este formato ainda não tem visualização embutida. Use o botão "Baixar".
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      {typeof document !== 'undefined' && createPortal(
        <ConfirmModal
          isOpen={Boolean(documentPendingDeletion)}
          onClose={() => setDocumentPendingDeletion(null)}
          onConfirm={confirmDeleteDoc}
          title="Excluir documento?"
          message={`O arquivo "${documentPendingDeletion?.name || ''}" será excluído permanentemente.\n\nEsta ação não pode ser desfeita.`}
          confirmText="Excluir documento"
          cancelText="Manter documento"
          type="danger"
        />,
        document.body
      )}
    </div>
  );
}
