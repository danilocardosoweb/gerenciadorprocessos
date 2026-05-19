import { motion } from 'motion/react';
import { Target, BarChart3, Clock, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export interface GlobalMetricsProps {
  mappedProcessesCount: number;
  expiringDocsCount: number;
  ideasCount: number;
  complianceScore: number;
  onAddProcess: () => void;
  onViewDocs: () => void;
  onAddIdea: () => void;
}

export function GlobalMetrics({ mappedProcessesCount, expiringDocsCount, ideasCount, complianceScore, onAddProcess, onViewDocs, onAddIdea }: GlobalMetricsProps) {
  // Sparkline generator mock data depending on score
  const sparklineData = Array.from({ length: 7 }, (_, i) => {
    return Math.max(30, Math.min(100, complianceScore - 15 + (Math.random() * 30)));
  });
  sparklineData[6] = complianceScore; // ensure the last one matches the actual score

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
        className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col justify-between hover:bg-white/[0.07] transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-blue-400">
            <Target size={20} />
            <span className="text-sm font-semibold">Processos Mapeados</span>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold text-white">{mappedProcessesCount}</span>
            <span className="text-xs text-slate-400 ml-2">/ 30 esperados</span>
          </div>
          <button onClick={onAddProcess} className="text-[10px] uppercase font-bold px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30">
            Adicionar
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
        className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex flex-col justify-between hover:bg-emerald-500/[0.15] transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-emerald-400">
            <ShieldCheck size={20} />
            <span className="text-sm font-semibold">Conformidade IATF</span>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold text-emerald-400">{complianceScore}%</span>
          </div>
          <div className="h-10 w-24">
             {/* Mini Sparkline placeholder - in a real app, use recharts */}
             <div className="flex items-end h-full gap-1">
                {sparklineData.map((val, i) => (
                  <div key={i} className="bg-emerald-400 rounded-t-sm w-full transition-all" style={{ height: `${val}%`, opacity: 0.5 + (i * 0.08) }} />
                ))}
             </div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} 
        className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl flex flex-col justify-between hover:bg-amber-500/[0.15] transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-amber-400">
            <AlertTriangle size={20} />
            <span className="text-sm font-semibold">Documentos a Vencer</span>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold text-amber-400">{expiringDocsCount}</span>
            <span className="text-xs text-slate-400 ml-2">nos próximos 30 dias</span>
          </div>
          <button onClick={onViewDocs} className="text-[10px] uppercase font-bold px-2 py-1 bg-amber-500/20 text-amber-400 rounded-md hover:bg-amber-500/30">
            Revisar
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} 
        className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-2xl flex flex-col justify-between hover:bg-purple-500/[0.15] transition-colors"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-purple-400">
            <Zap size={20} />
            <span className="text-sm font-semibold">Ideias (Kaizen)</span>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold text-purple-400">{ideasCount}</span>
            <span className="text-xs text-slate-400 ml-2">em análise</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 mr-2">
              {Array.from({length: Math.min(ideasCount, 3)}).map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full border-2 border-[#0f172a] bg-slate-700 flex items-center justify-center text-[8px] font-bold text-white z-${10-i}`}>
                  U{i + 1}
                </div>
              ))}
            </div>
            <button onClick={onAddIdea} className="text-[10px] uppercase font-bold px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md hover:bg-purple-500/30">
              Nova Ideia
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
