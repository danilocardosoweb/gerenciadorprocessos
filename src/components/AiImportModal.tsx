import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud, FileText, File as FileArchive, Sparkles, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateMindMapFromText, extractTextFromFile, GeneratedMap } from '../services/geminiService';

interface AiImportModalProps {
  onClose: () => void;
  onImport: (data: { title: string; description: string; type: 'map', nodes: any[], edges: any[], nodeDetails: Record<string, any> }) => void;
}

export function AiImportModal({ onClose, onImport }: AiImportModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [inputMethod, setInputMethod] = useState<'file' | 'paste'>('file');
  const [analyzingState, setAnalyzingState] = useState<'idle' | 'uploading' | 'analyzing' | 'generating' | 'done' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [generatedMap, setGeneratedMap] = useState<GeneratedMap | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (f?: File, text?: string) => {
    if (text) {
      setFile(null);
      setAnalyzingState('uploading');
      setErrorMessage('');
      setGeneratedMap(null);

      try {
        setAnalyzingState('analyzing');
        const map = await generateMindMapFromText(text, 'Texto colado');
        setGeneratedMap(map);
        setAnalyzingState('done');
      } catch (error) {
        console.error('Error processing text:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Erro ao processar texto');
        setAnalyzingState('error');
      }
      return;
    }

    if (f) {
      setFile(f);
      setAnalyzingState('uploading');
      setErrorMessage('');
      setGeneratedMap(null);

      try {
        const extractedText = await extractTextFromFile(f);
        setAnalyzingState('analyzing');
        const map = await generateMindMapFromText(extractedText, f.name);
        setGeneratedMap(map);
        setAnalyzingState('done');
      } catch (error) {
        console.error('Error processing file:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Erro ao processar arquivo');
        setAnalyzingState('error');
      }
    }
  };

  const handleFinish = () => {
    if (!generatedMap) return;

    onImport({
      title: generatedMap.title || (file ? `Mapa Gerado: ${file.name.split('.')[0]}` : pastedText ? 'Mapa Gerado: Texto Colado' : 'Mapa Gerado por IA'),
      description: 'Mapa de processos extraído automaticamente do documento através da nossa inteligência artificial.',
      type: 'map',
      nodes: generatedMap.nodes,
      edges: generatedMap.edges,
      nodeDetails: {}
    });
    onClose();
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) return;
    processFile(undefined, pastedText);
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
        className="relative w-full max-w-2xl bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl p-8 overflow-hidden"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">IA Process Import</h2>
          </div>
          <p className="text-slate-400 text-sm mb-4">Faça upload de um manual em PDF ou Word ou cole o texto diretamente. Nossa IA vai analisar e estruturar um mapa de processo automaticamente.</p>

          <div className="h-px bg-white/10 mb-6" />

          {/* Input method toggle */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl w-fit">
            <button
              onClick={() => setInputMethod('file')}
              className={cn('px-4 py-2 rounded-lg text-sm font-semibold transition-all', inputMethod === 'file' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}
            >
              Upload de Arquivo
            </button>
            <button
              onClick={() => setInputMethod('paste')}
              className={cn('px-4 py-2 rounded-lg text-sm font-semibold transition-all', inputMethod === 'paste' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white')}
            >
              Colar Texto
            </button>
          </div>

          <AnimatePresence mode="wait">
            {analyzingState === 'idle' && inputMethod === 'file' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all bg-white/[0.02]",
                  isDragging ? "border-purple-500 bg-purple-500/10 scale-[1.02]" : "border-white/20 hover:border-white/40 hover:bg-white/5"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.txt" 
                />
                
                <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl relative group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <UploadCloud size={32} className="text-purple-400" />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">Arraste seu arquivo aqui</h3>
                <p className="text-sm text-slate-400 text-center max-w-sm mb-6">
                  Suportamos arquivos .PDF, .DOCX e .TXT contendo instruções de trabalho ou POPs.
                </p>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs font-semibold text-slate-300">
                    <FileArchive size={14} className="text-blue-400" /> PDF
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-xs font-semibold text-slate-300">
                    <FileText size={14} className="text-blue-600" /> Word
                  </div>
                </div>
              </motion.div>
            )}

            {analyzingState === 'idle' && inputMethod === 'paste' && (
              <motion.div
                key="paste"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/[0.02] border border-white/10 rounded-3xl p-6"
              >
                <label className="text-sm font-medium text-slate-300 mb-3 block">
                  Cole o texto do documento aqui
                </label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Cole o conteúdo do seu documento (PDF, Word, etc.) aqui..."
                  rows={12}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none text-sm leading-relaxed"
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handlePasteSubmit}
                    disabled={!pastedText.trim()}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={14} />
                    Gerar Mapa com IA
                  </button>
                </div>
              </motion.div>
            )}

            {analyzingState === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                    <AlertCircle size={20} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Erro ao processar arquivo</h3>
                    <p className="text-sm text-slate-300">{errorMessage}</p>
                  </div>
                </div>

                {/* Fallback: manual text input */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                  <p className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2">
                    <FileText size={14} />
                    Cole o texto do documento manualmente:
                  </p>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Abra o PDF/Word, selecione todo o texto (Ctrl+A), copie (Ctrl+C) e cole aqui (Ctrl+V)..."
                    rows={8}
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none text-sm leading-relaxed mb-3"
                  />
                  <div className="flex gap-3 justify-between items-center">
                    <button
                      onClick={() => { setAnalyzingState('idle'); setPastedText(''); }}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      ← Tentar com arquivo
                    </button>
                    <button
                      onClick={handlePasteSubmit}
                      disabled={!pastedText.trim()}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    >
                      <Sparkles size={14} />
                      Gerar Mapa com IA
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {analyzingState !== 'idle' && analyzingState !== 'error' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-black/20 border border-white/5 rounded-3xl p-8"
              >
                <div className="flex flex-col items-center justify-center mb-10">
                  <div className="relative w-24 h-32 bg-white/10 rounded-lg border border-white/20 flex flex-col items-center justify-center mb-6 overflow-hidden">
                    <FileText size={40} className="text-slate-300" />
                    
                    {/* Laser scanning effect */}
                    {analyzingState !== 'done' && (
                      <motion.div 
                        initial={{ top: 0 }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                      />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    {analyzingState === 'uploading' && 'Fazendo upload do arquivo...'}
                    {analyzingState === 'analyzing' && 'Lendo e extraindo processos do texto...'}
                    {analyzingState === 'generating' && 'A IA está estruturando seu mapa mental...'}
                    {analyzingState === 'done' && 'Mapa gerado com sucesso!'}
                  </h3>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", analyzingState !== 'uploading' ? "bg-emerald-500/20 text-emerald-400" : "bg-purple-500/20 text-purple-400 animate-pulse")}>
                      {analyzingState !== 'uploading' ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 bg-purple-400 rounded-full" />}
                    </div>
                    <span className={cn("text-sm font-medium transition-colors", analyzingState !== 'uploading' ? "text-emerald-400" : "text-white")}>Processamento do arquivo</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", 
                      ['generating', 'done'].includes(analyzingState) ? "bg-emerald-500/20 text-emerald-400" : 
                      analyzingState === 'analyzing' ? "bg-purple-500/20 text-purple-400 animate-pulse" : 
                      "bg-white/5 text-slate-500"
                    )}>
                      {['generating', 'done'].includes(analyzingState) ? <CheckCircle2 size={16} /> : 
                       analyzingState === 'analyzing' ? <div className="w-2 h-2 bg-purple-400 rounded-full" /> : 
                       <span className="text-xs">2</span>}
                    </div>
                    <span className={cn("text-sm font-medium transition-colors", 
                      ['generating', 'done'].includes(analyzingState) ? "text-emerald-400" : 
                      analyzingState === 'analyzing' ? "text-white" : 
                      "text-slate-500"
                    )}>Compreenso semntica (NLP)</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", 
                      analyzingState === 'done' ? "bg-emerald-500/20 text-emerald-400" : 
                      analyzingState === 'generating' ? "bg-purple-500/20 text-purple-400 animate-pulse" : 
                      "bg-white/5 text-slate-500"
                    )}>
                      {analyzingState === 'done' ? <CheckCircle2 size={16} /> : 
                       analyzingState === 'generating' ? <div className="w-2 h-2 bg-purple-400 rounded-full" /> : 
                       <span className="text-xs">3</span>}
                    </div>
                    <span className={cn("text-sm font-medium transition-colors", 
                      analyzingState === 'done' ? "text-emerald-400" : 
                      analyzingState === 'generating' ? "text-white" : 
                      "text-slate-500"
                    )}>Gerao do fluxograma (Ns e Arestas)</span>
                  </div>
                </div>

                <AnimatePresence>
                  {analyzingState === 'done' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-10 flex justify-center"
                    >
                      <button 
                        onClick={handleFinish}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                      >
                        Abrir Mapa Gerado <ArrowRight size={18} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
