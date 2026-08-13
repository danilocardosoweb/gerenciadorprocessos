import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, CheckCircle, AlertCircle, ArrowLeft, X } from 'lucide-react';
import { usePasswordReset } from '../hooks/usePasswordReset';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ isOpen, onClose }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword, loading, error } = usePasswordReset();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    const result = await resetPassword(password);
    if (result) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.href = '/';
      }, 2000);
    }
  };

  const isPasswordValid = password.length >= 6;
  const isPasswordMatch = password === confirmPassword && password.length > 0;

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
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-white">Redefinir Senha</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Senha Redefinida!</h3>
              <p className="text-slate-400 text-sm">
                Sua senha foi alterada com sucesso.<br />
                Você será redirecionado para o login.
              </p>
            </motion.div>
          ) : (
            <>
              <p className="text-slate-400 text-sm mb-6">
                Digite sua nova senha. Mínimo de 6 caracteres.
              </p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nova senha"
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <AlertCircle size={16} /> : <Lock size={16} />}
                    </button>
                  </div>
                  {password.length > 0 && !isPasswordValid && (
                    <p className="text-xs text-red-400 mt-1">Mínimo de 6 caracteres</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a senha"
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <AlertCircle size={16} /> : <Lock size={16} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && !isPasswordMatch && (
                    <p className="text-xs text-red-400 mt-1">As senhas no coincidem</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !isPasswordValid || !isPasswordMatch}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Redefinir Senha'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
