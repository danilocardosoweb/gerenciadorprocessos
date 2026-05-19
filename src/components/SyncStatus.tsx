import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface SyncStatusProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSync: Date | null;
  error: string | null;
  onSync: () => void;
}

export function SyncStatus({
  isOnline,
  isSyncing,
  pendingCount,
  lastSync,
  error,
  onSync,
}: SyncStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff size={18} className="text-red-400" />;
    if (isSyncing) return <RefreshCw size={18} className="text-blue-400 animate-spin" />;
    if (pendingCount > 0) return <AlertCircle size={18} className="text-amber-400" />;
    return <CheckCircle size={18} className="text-emerald-400" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Sincronizando...';
    if (pendingCount > 0) return `${pendingCount} pendentes`;
    return 'Sincronizado';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          !isOnline
            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
            : pendingCount > 0
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        }`}
      >
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-72 bg-[#1e293b] border border-white/20 rounded-xl shadow-2xl overflow-hidden z-[100]"
          >
            <div className="p-4 border-b border-white/10 bg-[#0f172a]">
              <h4 className="font-bold text-white mb-1">Status de Sincronização</h4>
              <p className="text-xs text-slate-300">
                {isOnline ? 'Conectado ao servidor' : 'Sem conexão com o servidor'}
              </p>
            </div>

            <div className="p-4 space-y-3 bg-[#1e293b]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Conexão:</span>
                <span className={`text-sm font-medium ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Pendentes:</span>
                <span className={`text-sm font-medium ${pendingCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {pendingCount}
                </span>
              </div>

              {lastSync && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Última sinc:</span>
                  <span className="text-sm text-slate-300">
                    {lastSync.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {error && (
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={() => {
                  onSync();
                  setIsExpanded(false);
                }}
                disabled={!isOnline || isSyncing || pendingCount === 0}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Sincronizar Agora
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
