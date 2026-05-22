import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, X, AlertCircle, X as CloseIcon, Send } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
  loading?: boolean;
}

export function ApprovalModal({ isOpen, onClose, taskTitle, onApprove, onReject, loading }: ApprovalModalProps) {
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = () => {
    if (action === 'approve') {
      onApprove(comment);
    } else if (action === 'reject') {
      onReject(comment);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Aprovação de Tarefa</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-slate-400 mb-1">Tarefa:</p>
            <p className="text-white font-semibold">{taskTitle}</p>
          </div>

          {!action ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">Selecione uma ação:</p>
              <button
                onClick={() => setAction('approve')}
                className="w-full flex items-center justify-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-all"
              >
                <CheckCircle size={20} className="text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Aprovar</span>
              </button>
              <button
                onClick={() => setAction('reject')}
                className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-all"
              >
                <X size={20} className="text-red-400" />
                <span className="text-red-400 font-semibold">Rejeitar</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl">
                {action === 'approve' ? (
                  <CheckCircle size={20} className="text-emerald-400" />
                ) : (
                  <X size={20} className="text-red-400" />
                )}
                <span className={`font-semibold ${action === 'approve' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {action === 'approve' ? 'Aprovar tarefa' : 'Rejeitar tarefa'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Comentário (opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={action === 'approve' ? 'Adicione um comentário sobre a aprovação...' : 'Explique o motivo da rejeição...'}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500 resize-none h-24"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                >
                  Voltar
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      {action === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
