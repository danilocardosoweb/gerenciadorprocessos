import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { FileCode, FileUp, Upload, X, AlertTriangle, CheckCircle2, Sparkles, Network } from 'lucide-react';
import { cn } from '../lib/utils';
import { parseMapJsonText, type MapJsonImportResult } from '../lib/mapJson';
import type { NewItemData } from './NewItemModal';

interface MapJsonImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: NewItemData) => void;
}

export function MapJsonImportModal({ isOpen, onClose, onImport }: MapJsonImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedMap, setParsedMap] = useState<MapJsonImportResult | null>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setIsDragging(false);
    setIsReading(false);
    setFileName('');
    setErrorMessage('');
    setParsedMap(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const close = () => {
    resetState();
    onClose();
  };

  const readFile = async (file: File | null) => {
    if (!file) return;

    setIsReading(true);
    setErrorMessage('');
    setParsedMap(null);
    setFileName(file.name);

    try {
      const text = await file.text();
      const parsed = parseMapJsonText(text);
      setParsedMap(parsed);
    } catch (error) {
      console.error('Erro ao ler JSON de mapa:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível ler o arquivo JSON.');
    } finally {
      setIsReading(false);
    }
  };

  const handleImport = () => {
    if (!parsedMap) return;

    onImport({
      title: parsedMap.title,
      description: parsedMap.description || 'Mapa importado a partir de JSON.',
      type: 'map',
      visibility: parsedMap.visibility,
      allowed_departments: [],
      allowed_user_ids: [],
      tags: parsedMap.tags,
      nodes: parsedMap.nodes,
      edges: parsedMap.edges,
      nodeDetails: parsedMap.nodeDetails,
    });

    close();
  };

  const summaryCards = parsedMap
    ? [
        { label: 'Nós', value: parsedMap.nodes.length.toString(), icon: Network, tone: 'text-blue-400' },
        { label: 'Conexões', value: parsedMap.edges.length.toString(), icon: FileCode, tone: 'text-emerald-400' },
        { label: 'Detalhes', value: Object.keys(parsedMap.nodeDetails).length.toString(), icon: Sparkles, tone: 'text-violet-400' },
      ]
    : [];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        className="absolute inset-0 bg-[#0a1120]/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        className="relative w-full max-w-4xl bg-[#111827] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-7 pb-5 border-b border-white/[0.06] flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold uppercase tracking-[0.25em] mb-3">
              <FileUp size={12} />
              Importao estruturada
            </div>
            <h2 className="text-2xl font-bold text-white">Importar mapa a partir de JSON</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl">
              Carregue um arquivo JSON para criar um novo mapa com nós, conexões e detalhes analíticos já organizados no banco.
            </p>
          </div>

          <button
            onClick={close}
            className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {!parsedMap && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void readFile(file);
              }}
              onClick={() => fileInputRef.current.click()}
              className={cn(
                'relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white/[0.02]',
                isDragging ? 'border-blue-500 bg-blue-500/10 scale-[1.01]' : 'border-white/15 hover:border-white/30 hover:bg-white/5'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => void readFile(e.target.files?.[0] || null)}
              />

              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-white/10 flex items-center justify-center mb-5">
                <Upload size={30} className="text-blue-300" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Arraste seu JSON ou clique para escolher</h3>
              <p className="text-sm text-slate-400 max-w-xl">
                O arquivo deve ter os campos do mapa como <span className="text-slate-200 font-medium">title</span>, <span className="text-slate-200 font-medium">nodes</span>, <span className="text-slate-200 font-medium">edges</span> e, se existir, <span className="text-slate-200 font-medium">node_details</span>.
              </p>

              <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Layout automático quando necessário</span>
                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10">Detalhes preservados no banco</span>
              </div>
            </div>
          )}

          {isReading && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-blue-500/15 flex items-center justify-center">
                <Upload size={18} className="text-blue-300 animate-pulse" />
              </div>
              <div>
                <p className="text-white font-semibold">Lendo arquivo</p>
                <p className="text-sm text-slate-400">{fileName || 'Processando JSON...'}</p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3"
              >
                <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Não foi possível importar o JSON</p>
                  <p className="text-sm text-slate-300 mt-1">{errorMessage}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {parsedMap && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="grid gap-3 md:grid-cols-3">
                {summaryCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                          <Icon size={18} className={card.tone} />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
                          <p className="text-2xl font-bold text-white leading-tight">{card.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-300 font-semibold mb-2">Pr-visualização</p>
                  <h3 className="text-xl font-bold text-white">{parsedMap.title}</h3>
                  <p className="text-sm text-slate-400 mt-2">{parsedMap.description || 'Sem descrição informada no arquivo.'}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium">
                    Visibilidade: {parsedMap.visibility === 'public' ? 'Público' : parsedMap.visibility === 'departments' ? 'Departamentos' : 'Privado'}
                  </span>
                  {parsedMap.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>

                {parsedMap.warnings.length > 0 && (
                  <div className="space-y-2">
                    {parsedMap.warnings.map((warning) => (
                      <div key={warning} className="flex items-start gap-2 text-sm text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                  <CheckCircle2 size={14} />
                  Mapa pronto para ser criado e salvo no banco com a hierarquia importada.
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.06]">
            <button
              onClick={close}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={!parsedMap}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors inline-flex items-center gap-2"
            >
              <Sparkles size={16} />
              Criar mapa
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
