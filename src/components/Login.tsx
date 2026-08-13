import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Network, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import backgroundImage from '../assets/login-background.png';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean | Promise<boolean>;
  onClose?: () => void;
}

export function Login({ onLogin, onClose }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Preencha email e senha');
      return;
    }

    setIsLoading(true);

    // Simula delay de autenticao
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = await onLogin(email, password);

    if (!success) {
      setError('Email ou senha incorretos');
      setIsLoading(false);
    } else {
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    }
  };

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    if (!checked) {
      localStorage.removeItem('rememberedEmail');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0f172a] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-slate-950/55 pointer-events-none" />
      <div className="absolute top-[-12%] left-[-10%] w-[420px] h-[420px] bg-blue-600/12 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[-10%] w-[480px] h-[480px] bg-indigo-600/12 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[19.5rem] sm:max-w-[22.5rem] md:max-w-[24.5rem]"
      >
        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-4.5 sm:p-6.5 shadow-2xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer hover:text-slate-300">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => handleRememberMeChange(e.target.checked)}
                className="rounded border-white/20 bg-white/5" 
              />
              Lembrar-me
            </label>
            <button
              type="button"
              onClick={() => setIsForgotPasswordOpen(true)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Esqueceu a senha?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 h-12 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
