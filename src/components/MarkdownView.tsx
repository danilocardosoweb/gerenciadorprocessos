import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Save, Edit3, X, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface MarkdownViewProps {
  title: string;
  initialContent: string;
  onBack: () => void;
  onSave?: (newContent: string) => void;
}

export function MarkdownView({ title, initialContent, onBack, onSave }: MarkdownViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    if (onSave) onSave(content);
    setIsEditing(false);
  };

  return (
    <div className="w-full h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Header */}
      <div className="h-16 flex items-center px-6 bg-white/[0.02] backdrop-blur-xl border-b border-white/5 shrink-0 justify-between z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            title="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="h-6 w-px bg-white/10"></div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white m-0 leading-tight flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" />
              {title}
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold m-0">
              Documentação do Processo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => {
                  setContent(initialContent);
                  setIsEditing(false);
                }}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 font-bold text-sm transition-all flex items-center gap-2"
              >
                <X size={16} /> Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Save size={16} /> Salvar Documento
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-sm rounded-xl flex items-center gap-2 transition-all"
            >
              <Edit3 size={16} /> Editar
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-10 z-10 custom-scrollbar relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl min-h-full"
        >
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[60vh] bg-transparent text-slate-200 outline-none resize-none font-mono text-sm leading-relaxed"
              placeholder="Digite seu markdown aqui..."
              autoFocus
            />
          ) : (
            <div className="prose prose-invert prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-code:text-emerald-300 prose-code:bg-emerald-900/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#0f172a] prose-pre:border prose-pre:border-white/10">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*Documento vazio. Clique em Editar para adicionar conteúdo.*'}
              </ReactMarkdown>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
