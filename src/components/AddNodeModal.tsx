import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Network, Save } from 'lucide-react';
import { Node } from '@xyflow/react';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { label: string; category: string; requiredIATF: string; parentId: string }) => void;
  nodes: Node[];
  selectedNodeId: string | null;
}

const categories = [
  { id: 'inputs', label: 'Entradas' },
  { id: 'outputs', label: 'Saídas' },
  { id: 'resources', label: 'Recursos' },
  { id: 'people', label: 'Pessoas' },
  { id: 'methods', label: 'Métodos' },
  { id: 'kpis', label: 'Indicadores' },
];

export function AddNodeModal({ isOpen, onClose, onAdd, nodes, selectedNodeId }: AddNodeModalProps) {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState('inputs');
  const [requiredIATF, setRequiredIATF] = useState('');
  const [parentId, setParentId] = useState(selectedNodeId || 'root');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd({ label, category, requiredIATF, parentId });
    setLabel('');
    setRequiredIATF('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
              className="pointer-events-auto w-full max-w-md bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                    <Network size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Novo Elemento</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome do Elemento</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Ex: Novo Fornecedor"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors appearance-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Requisito IATF (Opcional)</label>
                  <input
                    type="text"
                    value={requiredIATF}
                    onChange={(e) => setRequiredIATF(e.target.value)}
                    placeholder="Ex: 8.5.1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Conectar a (Pai)</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors appearance-none"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>{n.data.label as string}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <Save size={18} /> SALVAR ELEMENTO
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
