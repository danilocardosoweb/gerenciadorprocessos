import { motion } from 'motion/react';
import { Target, BarChart3, Clock, AlertTriangle, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

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
  const [showKaizenHelp, setShowKaizenHelp] = useState(false);

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
        className="relative bg-purple-500/10 border border-purple-500/20 p-5 rounded-2xl flex flex-col justify-between hover:bg-purple-500/[0.15] transition-colors group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 text-purple-400">
            <Zap size={20} />
            <span className="text-sm font-semibold">Ideias (Kaizen)</span>
          </div>
          <button
            onClick={() => setShowKaizenHelp(!showKaizenHelp)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-purple-400 hover:text-purple-300"
            title="O que é Kaizen?"
          >
            <HelpCircle size={16} />
          </button>
        </div>

        {/* Help tooltip */}
        {showKaizenHelp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1e293b] border border-purple-500/30 rounded-xl p-4 text-xs text-slate-300 z-20 shadow-xl"
          >
            <p className="font-semibold text-purple-300 mb-2">💡 Como usar Ideias (Kaizen):</p>
            <ul className="space-y-1.5 text-slate-400">
              <li>✓ Clique em <strong>"Nova Ideia"</strong> para criar uma sugestão de melhoria</li>
              <li>✓ Escreva em <strong>Markdown</strong> (títulos, listas, links, etc)</li>
              <li>✓ Descreva o problema e sua solução proposta</li>
              <li>✓ Clique em <strong>"Editar"</strong> para modificar depois</li>
              <li>✓ Compartilhe com a equipe para análise e implementação</li>
            </ul>
          </motion.div>
        )}

        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold text-purple-400">{ideasCount}</span>
            <span className="text-xs text-slate-400 ml-2">em análise</span>
          </div>
          <button 
            onClick={onAddIdea} 
            className="text-[10px] uppercase font-bold px-3 py-2 bg-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/50 transition-colors"
          >
            + Nova Ideia
          </button>
        </div>
      </motion.div>
    </div>
  );
}
