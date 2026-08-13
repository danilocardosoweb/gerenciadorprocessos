/**
 * RankingLeaderboard Component
 * Displays user rankings with gamification elements
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal, TrendingUp, Users, Award, Filter, ChevronDown } from 'lucide-react';
import { useAssessments } from '../hooks/useAssessments';
import type { RankingEntry, RankingPeriod, RankingCategory } from '../types/assessments';

interface RankingLeaderboardProps {
  onClose: () => void;
}

export function RankingLeaderboard({ onClose }: RankingLeaderboardProps) {
  const { fetchRanking } = useAssessments();
  const [selectedPeriod, setSelectedPeriod] = useState<RankingPeriod>('all_time');
  const [selectedCategory, setSelectedCategory] = useState<RankingCategory>('overall');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [monthlyRanking, setMonthlyRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRanking = async () => {
      setLoading(true);
      try {
        const [data, monthlyData] = await Promise.all([
          fetchRanking(selectedPeriod, selectedCategory, 20),
          fetchRanking('monthly', 'overall', 3)
        ]);
        setRanking(data);
        setMonthlyRanking(monthlyData);
      } catch (error) {
        console.error('Error loading ranking:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, [selectedPeriod, selectedCategory, fetchRanking]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (index === 1) return <Medal className="w-6 h-6 text-slate-300" />;
    if (index === 2) return <Medal className="w-6 h-6 text-orange-400" />;
    return null;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return 'bg-yellow-500/20 border-yellow-500/30';
    if (index === 1) return 'bg-slate-400/20 border-slate-400/30';
    if (index === 2) return 'bg-orange-400/20 border-orange-400/30';
    return 'bg-slate-700/30 border-slate-600/30';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Ranking</h2>
                <p className="text-white/80 text-sm">Classificao dos operadores</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-slate-700/50 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as RankingPeriod)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="all_time">Todo o tempo</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as RankingCategory)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="overall">Geral</option>
                <option value="department">Por departamento</option>
                <option value="shift">Por turno</option>
                <option value="machine">Por máquina</option>
              </select>
            </div>
          </div>
        </div>

        {monthlyRanking.length > 0 && (
          <div className="px-6 pt-4">
            <div className="rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white font-bold">Troféu do mês</h3>
                <span className="text-xs text-slate-300">Top 3 do período mensal</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {monthlyRanking.slice(0, 3).map((entry, index) => (
                  <div
                    key={entry.user_id}
                    className={`rounded-xl p-3 border ${
                      index === 0 ? 'bg-yellow-500/15 border-yellow-500/30' :
                      index === 1 ? 'bg-slate-400/15 border-slate-400/30' :
                      'bg-orange-400/15 border-orange-400/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white">{index + 1}º lugar</div>
                      <Medal className={`w-5 h-5 ${index === 0 ? 'text-yellow-300' : index === 1 ? 'text-slate-300' : 'text-orange-300'}`} />
                    </div>
                    <div className="mt-2 text-white font-bold truncate">{entry.user_name}</div>
                    <div className="text-xs text-slate-300 mt-1">{entry.total_xp} XP " Nível {entry.current_level}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="text-center text-slate-400 py-8">Carregando ranking...</div>
          ) : ranking.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Nenhum dado de ranking disponível</p>
              <p className="text-sm mt-2">Complete avaliações para aparecer no ranking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Top 3 - Highlighted */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {ranking.slice(0, 3).map((entry, index) => (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-4 rounded-xl border-2 ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500' :
                      index === 1 ? 'bg-gradient-to-br from-slate-400/20 to-slate-500/20 border-slate-400' :
                      'bg-gradient-to-br from-orange-400/20 to-red-400/20 border-orange-400'
                    }`}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-slate-400' :
                        'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="text-center mt-2">
                      <div className="w-16 h-16 rounded-full bg-slate-700 mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white">
                        {entry.user_name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-semibold text-white text-sm truncate">{entry.user_name}</h3>
                      {entry.user_department && (
                        <p className="text-xs text-slate-400 mt-1">{entry.user_department}</p>
                      )}
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-white">{entry.total_xp}</p>
                        <p className="text-xs text-slate-400">XP</p>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-purple-400">Nível {entry.current_level}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Rest of ranking */}
              <div className="space-y-2">
                {ranking.slice(3).map((entry, index) => (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 3) * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${getRankBadge(index + 3)}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      (index + 3) <= 3 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {index + 4}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                      {entry.user_name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{entry.user_name}</div>
                      {entry.user_department && (
                        <div className="text-xs text-slate-400">{entry.user_department}</div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-white font-bold">{entry.total_xp} XP</div>
                      <div className="text-xs text-slate-400">Nível {entry.current_level}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-white font-medium">{entry.total_assessments_completed}</div>
                      <div className="text-xs text-slate-400">Avaliações</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-700/50 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>{ranking.length} operadores classificados</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Atualizado em tempo real</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
