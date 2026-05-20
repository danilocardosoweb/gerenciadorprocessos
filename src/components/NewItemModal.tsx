import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Network, FolderOpen, FileText, Box, Lightbulb, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface NewItemModalProps {
  onClose: () => void;
  onCreate: (data: { title: string; description: string; type: 'map' | 'folder' | 'markdown' | 'sector3d' }) => void;
  initialType?: 'map' | 'folder' | 'markdown' | 'sector3d';
}

export function NewItemModal({ onClose, onCreate, initialType = 'map' }: NewItemModalProps) {
  const [type, setType] = useState<'map' | 'folder' | 'markdown' | 'sector3d'>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showKaizenInfo, setShowKaizenInfo] = useState(initialType === 'markdown');

  const handleCreate = () => {
    if (title.trim()) {
      onCreate({ title, description, type });
      onClose();
    }
  };

  const types = [
    { id: 'map' as const, label: 'Mapa de Processo', icon: Network, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { id: 'folder' as const, label: 'Pasta', icon: FolderOpen, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { id: 'markdown' as const, label: 'Ideia (Kaizen)', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { id: 'sector3d' as const, label: 'Setor 3D', icon: Box, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  ];

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
        className="relative w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl p-8"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">Criar Novo Item</h2>
        <p className="text-slate-400 text-sm mb-8">Adicione um novo processo, pasta ou documento ao workspace.</p>

        <div className="flex gap-4 mb-8">
          {types.map(t => {
            const Icon = t.icon;
            const isSelected = type === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setType(t.id);
                  setShowKaizenInfo(t.id === 'markdown');
                }}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all",
                  isSelected ? "bg-white/10 border-white/20 shadow-inner" : "bg-white/5 border-transparent hover:bg-white/10 opacity-60 hover:opacity-100"
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", t.bg, t.color)}>
                  <Icon size={20} />
                </div>
                <span className="text-xs font-semibold text-white">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Kaizen Info Box */}
        {showKaizenInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-purple-500/15 border border-purple-500/30 rounded-2xl p-4"
          >
            <div className="flex gap-3">
              <Lightbulb className="text-purple-400 shrink-0 mt-0.5" size={18} />
              <div className="text-sm text-slate-300">
                <p className="font-semibold text-purple-300 mb-2">💡 O que é Kaizen?</p>
                <p className="text-xs leading-relaxed mb-2">
                  <strong>Kaizen</strong> significa "melhoria contínua" em japonês. Use este espaço para:
                </p>
                <ul className="text-xs space-y-1 text-slate-400 ml-4">
                  <li>✓ Sugerir melhorias nos processos</li>
                  <li>✓ Documentar problemas encontrados</li>
                  <li>✓ Propor soluções inovadoras</li>
                  <li>✓ Compartilhar ideias com a equipe</li>
                </ul>
                <p className="text-xs text-slate-500 mt-2 italic">
                  Escreva em Markdown (títulos, listas, links, etc) e clique em "Editar" depois para modificar.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Título do Item</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Célula de Usinagem CNC"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Descrição (Opcional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva brevemente o propósito deste item..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500 resize-none h-24"
            />
          </div>

          <button 
            onClick={handleCreate}
            disabled={!title.trim()}
            className="w-full h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
          >
            Criar {types.find(t => t.id === type)?.label}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
