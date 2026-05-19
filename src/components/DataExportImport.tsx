import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Upload, FileJson, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProcessItem } from './Dashboard';
import { DocumentItem } from './DocumentManager';
import { supabase } from '../lib/supabase';

interface DataExportImportProps {
  isOpen: boolean;
  onClose: () => void;
  items: ProcessItem[];
  documents: DocumentItem[];
  onImportSuccess?: () => void;
}

type ExportFormat = 'json' | 'csv';

export function DataExportImport({ isOpen, onClose, items, documents, onImportSuccess }: DataExportImportProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [importData, setImportData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Coletar todos os dados do localStorage
  const collectAllLocalStorageData = () => {
    const data: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tecno_mapper')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || 'null');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return data;
  };

  // Exportar dados
  const handleExport = () => {
    const localStorageData = collectAllLocalStorageData();
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      processItems: items,
      documents: documents,
      localStorage: localStorageData
    };

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tecno_mapper_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Dados exportados com sucesso!' });
    } else {
      // CSV format - apenas process items
      const csvRows = [
        ['ID', 'Título', 'Descrição', 'Tipo', 'Parent ID', 'Conteúdo', 'Data Atualização'].join(','),
        ...items.map(item => [
          item.id,
          `"${item.title.replace(/"/g, '""')}"`,
          `"${item.description?.replace(/"/g, '""') || ''}"`,
          item.type,
          item.parent_id || '',
          `"${(item.content || '').replace(/"/g, '""')}"`,
          item.updatedAt
        ].join(','))
      ];
      
      const csv = csvRows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tecno_mapper_processos_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Processos exportados para CSV!' });
    }
  };

  // Importar dados
  const handleImport = async () => {
    if (!importData.trim()) {
      setMessage({ type: 'error', text: 'Cole os dados para importar.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      let data: any;
      
      // Tentar parse como JSON
      try {
        data = JSON.parse(importData);
      } catch {
        // Se falhar, tentar como CSV simples
        setMessage({ type: 'error', text: 'Formato inválido. Use JSON exportado pelo app.' });
        setIsLoading(false);
        return;
      }

      // Validar estrutura
      if (!data.processItems || !Array.isArray(data.processItems)) {
        setMessage({ type: 'error', text: 'Dados inválidos. ProcessItems não encontrado.' });
        setIsLoading(false);
        return;
      }

      // Importar localStorage data se existir
      if (data.localStorage && typeof data.localStorage === 'object') {
        Object.entries(data.localStorage).forEach(([key, value]) => {
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch {
            localStorage.setItem(key, String(value));
          }
        });
      }

      // Importar para Supabase
      const itemsToInsert = data.processItems.map((item: any) => ({
        title: item.title,
        description: item.description,
        type: item.type,
        parent_id: item.parent_id || null,
        content: item.content || null,
        tags: item.tags || []
      }));

      const { error } = await supabase.from('process_items').insert(itemsToInsert);

      if (error) {
        setMessage({ type: 'error', text: `Erro ao importar: ${error.message}` });
      } else {
        setMessage({ type: 'success', text: `${itemsToInsert.length} itens importados! Dados locais restaurados! Recarregue a página.` });
        setImportData('');
        onImportSuccess?.();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao processar dados. Verifique o formato.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Upload de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportData(event.target?.result as string);
      setMessage({ type: 'success', text: 'Arquivo carregado! Clique em Importar.' });
    };
    reader.readAsText(file);
  };

  // Extrair dados atuais para cópia
  const handleCopyCurrentData = () => {
    const localStorageData = collectAllLocalStorageData();
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      processItems: items,
      documents: documents,
      localStorage: localStorageData
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setMessage({ type: 'success', text: 'Dados copiados! Cole no campo de importação.' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              {activeTab === 'export' ? <Download size={20} className="text-white" /> : <Upload size={20} className="text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Exportar / Importar</h2>
              <p className="text-sm text-slate-400">Backup e migração de dados</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => { setActiveTab('export'); setMessage(null); }}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              activeTab === 'export' ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-400 hover:text-white"
            )}
          >
            <Download size={16} /> Exportar
          </button>
          <button
            onClick={() => { setActiveTab('import'); setMessage(null); }}
            className={cn(
              "flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
              activeTab === 'import' ? "text-emerald-400 border-b-2 border-emerald-400" : "text-slate-400 hover:text-white"
            )}
          >
            <Upload size={16} /> Importar
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Mensagem */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "p-3 rounded-xl flex items-center gap-2 text-sm",
                  message.type === 'success' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"
                )}
              >
                {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'export' ? (
            <>
              {/* Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-sm text-blue-300">
                  <strong>Dados atuais:</strong> {items.length} processos, {documents.length} documentos
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  Inclui: mapas mentais, versões, preferências e todo histórico
                </p>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Formato de exportação</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat('json')}
                    className={cn(
                      "p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                      exportFormat === 'json' 
                        ? "bg-blue-500/20 border-blue-500/50 text-blue-400" 
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    <FileJson size={24} />
                    <span className="text-sm font-medium">JSON</span>
                    <span className="text-xs opacity-70">Completo (recomendado)</span>
                  </button>
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={cn(
                      "p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                      exportFormat === 'csv' 
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" 
                        : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    <FileSpreadsheet size={24} />
                    <span className="text-sm font-medium">CSV</span>
                    <span className="text-xs opacity-70">Apenas processos</span>
                  </button>
                </div>
              </div>

              {/* Copy Button */}
              <button
                onClick={handleCopyCurrentData}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Copiar dados para clipboard
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Baixar arquivo
              </button>
            </>
          ) : (
            <>
              {/* Import Instructions */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-sm text-emerald-300">
                  Cole os dados JSON exportados ou carregue um arquivo. Os dados serão importados para o Supabase.
                </p>
              </div>

              {/* File Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-xl text-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                Carregar arquivo
              </button>

              {/* Text Area */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Ou cole os dados aqui:</label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='{"processItems": [...], "documents": [...]}'
                  className="w-full h-40 bg-black/20 border border-white/10 rounded-xl p-3 text-sm font-mono text-slate-300 placeholder-slate-500 resize-none focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={isLoading || !importData.trim()}
                className={cn(
                  "w-full py-3 font-medium rounded-xl transition-all flex items-center justify-center gap-2",
                  isLoading || !importData.trim()
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Importar para Supabase
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
