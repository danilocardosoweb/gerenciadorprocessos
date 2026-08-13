import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Check, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'TEM CERTEZA?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger'
}: ConfirmModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      confirmBg: 'bg-red-500 hover:bg-red-400',
      confirmShadow: 'shadow-red-500/25'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      confirmBg: 'bg-amber-500 hover:bg-amber-400',
      confirmShadow: 'shadow-amber-500/25'
    },
    info: {
      icon: AlertTriangle,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      confirmBg: 'bg-blue-500 hover:bg-blue-400',
      confirmShadow: 'shadow-blue-500/25'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;
  const ConfirmIcon = type === 'danger' ? Trash2 : Check;

  const handleConfirm = async () => {
    if (isConfirming) return;

    try {
      setIsConfirming(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Não foi possível concluir a confirmação:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              if (!isConfirming) onClose();
            }}
          />
          
          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              'relative w-full max-w-md bg-[#1e293b] border rounded-2xl shadow-2xl overflow-hidden',
              config.borderColor
            )}
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-6 pb-4">
              <div className={cn('p-3 rounded-xl shrink-0', config.iconBg)}>
                <Icon size={28} className={config.iconColor} />
              </div>
              
              <div className="flex-1">
                <h3 id="confirm-modal-title" className="text-lg font-bold text-white mb-1">
                  {title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {message}
                </p>
              </div>

              <button
                onClick={onClose}
                disabled={isConfirming}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
                aria-label="Fechar confirmação"
              >
                <X size={20} />
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-black/20 border-t border-white/5">
              <button
                onClick={onClose}
                disabled={isConfirming}
                className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                className={cn(
                  'px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait',
                  config.confirmBg,
                  config.confirmShadow,
                  'hover:shadow-xl active:scale-95'
                )}
              >
                {isConfirming ? <Loader2 size={16} className="animate-spin" /> : <ConfirmIcon size={16} />}
                {isConfirming ? 'Processando...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
