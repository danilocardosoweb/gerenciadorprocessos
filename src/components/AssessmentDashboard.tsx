/**
 * AssessmentDashboard Component
 * Analytics and metrics dashboard for managers and administrators
 * Shows assessment performance, user progress, and insights
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Clock,
  Target,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BadgeCheck,
  FileCheck2,
  Trophy
} from 'lucide-react';
import { useAssessments } from '../hooks/useAssessments';
import type { RankingEntry, RankingPeriod, RankingCategory } from '../types/assessments';
import { BadgeGrid } from './GamificationBadge';
import { supabase } from '../lib/supabase';

interface AssessmentDashboardProps {
  currentUserId: string;
  onClose: () => void;
}

export function AssessmentDashboard({ currentUserId, onClose }: AssessmentDashboardProps) {
  const {
    fetchUserAttempts,
    fetchRanking,
    fetchUserAchievements,
    fetchUserBadges,
    fetchUserCertificates
  } = useAssessments();

  const [selectedPeriod, setSelectedPeriod] = useState<RankingPeriod>('all_time');
  const [selectedCategory, setSelectedCategory] = useState<RankingCategory>('overall');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<{ name: string; role: string; department: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [rankingData, attemptsData] = await Promise.all([
          fetchRanking(selectedPeriod, selectedCategory, 10),
          fetchUserAttempts(currentUserId)
        ]);
        const [achievementsData, badgesData, certificatesData] = await Promise.all([
          fetchUserAchievements(currentUserId),
          fetchUserBadges(currentUserId),
          fetchUserCertificates(currentUserId)
        ]);
        const { data: profileData } = await supabase
          .from('tecno_users')
          .select('name, role, department')
          .eq('id', currentUserId)
          .maybeSingle();
        setRanking(rankingData);
        setAttempts(attemptsData);
        setAchievements(achievementsData);
        setBadges(badgesData);
        setCertificates(certificatesData);
        setUserProfile(profileData || null);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    selectedPeriod,
    selectedCategory,
    fetchRanking,
    fetchUserAttempts,
    fetchUserAchievements,
    fetchUserBadges,
    fetchUserCertificates,
    currentUserId
  ]);

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log('Exporting data...');
  };

  const calculateStats = () => {
    if (attempts.length === 0) return null;

    const completedAttempts = attempts.filter(a => a.status === 'completed');
    if (completedAttempts.length === 0) return null;
    const averageScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length;
    const passRate = (completedAttempts.filter(a => (a.score || 0) >= getAttemptPassingScore(a)).length / completedAttempts.length) * 100;
    const averageTime = completedAttempts.reduce((sum, a) => sum + getAttemptTime(a), 0) / completedAttempts.length;

    return {
      totalAttempts: attempts.length,
      completedAttempts: completedAttempts.length,
      averageScore: Math.round(averageScore),
      passRate: Math.round(passRate),
      averageTime: Math.round(averageTime)
    };
  };

  const getAttemptPassingScore = (attempt: any) => attempt.assessments?.passing_score ?? 70;
  const getAttemptTime = (attempt: any) => attempt.time_taken_seconds || attempt.total_time_seconds || 0;
  const isAttemptPassed = (attempt: any) => (attempt.score || 0) >= getAttemptPassingScore(attempt);

  const stats = calculateStats();
  const latestCertificate = certificates[0];
  const totalXp = achievements?.total_xp || attempts.reduce((sum, attempt) => sum + (attempt.xp_earned || 0), 0);
  const currentLevel = achievements?.current_level || Math.max(1, Math.floor(Math.sqrt(totalXp / 100)));

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden border border-slate-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Minha evoluo</h2>
              <p className="text-white/80 text-sm mt-1">Seu desempenho, conquistas, certificados e histórico de avaliações</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-slate-700/50 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as RankingPeriod)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all_time">Todo o tempo</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as RankingCategory)}
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="overall">Geral</option>
                <option value="department">Por departamento</option>
                <option value="shift">Por turno</option>
                <option value="machine">Por máquina</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="text-center text-slate-400 py-8">Carregando dados...</div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <span className="text-xs text-blue-300">Total</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.totalAttempts}</div>
                    <div className="text-sm text-slate-400">Tentativas</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-5 h-5 text-green-400" />
                      <span className="text-xs text-green-300">Média</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.averageScore}%</div>
                    <div className="text-sm text-slate-400">Pontuação média</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle2 className="w-5 h-5 text-purple-400" />
                      <span className="text-xs text-purple-300">Aprovação</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.passRate}%</div>
                    <div className="text-sm text-slate-400">Taxa de aprovação</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-5 h-5 text-orange-400" />
                      <span className="text-xs text-orange-300">Tempo</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {Math.floor(stats.averageTime / 60)}:{(stats.averageTime % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-slate-400">Tempo médio</div>
                  </motion.div>
                </div>
              )}

              <div className="bg-gradient-to-br from-blue-500/15 via-slate-700/40 to-emerald-500/10 rounded-xl p-5 border border-blue-500/25">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-300 font-black">Painel pessoal</p>
                    <h3 className="text-xl font-bold text-white mt-2">Meu progresso e conquistas</h3>
                    <p className="text-sm text-slate-300 mt-1">Aqui o usuário acompanha XP, nível, selos, certificados e o histórico mais recente.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold">
                      {stats ? stats.completedAttempts + ' avaliações concluídas' : 'Sem avaliações ainda'}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-200 text-xs font-semibold">
                      {badges.length} selos
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-200 text-xs font-semibold">
                      {certificates.length} certificados
                    </span>
                  </div>
                </div>
              </div>
              {/* Rewards Summary */}
              <div className="bg-gradient-to-br from-slate-700/70 via-slate-700/50 to-indigo-900/30 rounded-xl p-6 border border-slate-600">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      Recompensas do Usuário
                    </h3>
                    <p className="text-sm text-slate-300 mt-1">
                      As recompensas aparecem quando a avaliação  concluda e ficam registradas aqui.
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-200 text-sm font-semibold">
                    Nível {currentLevel}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl p-4 bg-blue-500/10 border border-blue-400/25">
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-5 h-5 text-blue-300" />
                      <span className="text-xs uppercase tracking-[0.18em] text-blue-200">XP</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{totalXp}</div>
                    <div className="text-sm text-slate-300">Pontos acumulados</div>
                  </div>

                  <div className="rounded-xl p-4 bg-emerald-500/10 border border-emerald-400/25">
                    <div className="flex items-center justify-between mb-2">
                      <BadgeCheck className="w-5 h-5 text-emerald-300" />
                      <span className="text-xs uppercase tracking-[0.18em] text-emerald-200">Selos</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{badges.length}</div>
                    <div className="text-sm text-slate-300">
                      {badges[0]?.badge_name ? `Último: ${badges[0].badge_name}` : 'Nenhum selo ainda'}
                    </div>
                  </div>

                  <div className="rounded-xl p-4 bg-purple-500/10 border border-purple-400/25">
                    <div className="flex items-center justify-between mb-2">
                      <FileCheck2 className="w-5 h-5 text-purple-300" />
                      <span className="text-xs uppercase tracking-[0.18em] text-purple-200">Certificados</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{certificates.length}</div>
                    <div className="text-sm text-slate-300 truncate">
                      {latestCertificate?.assessment_title || 'Emitidos quando o usuário é aprovado'}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-emerald-300" />
                      Selos desbloqueados
                    </h4>
                    <span className="text-xs text-slate-400">{badges.length} conquista(s)</span>
                  </div>
                  {badges.length > 0 ? (
                    <BadgeGrid badges={badges} maxDisplay={8} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                      Nenhum selo ainda. Complete uma avaliação aprovada para começar sua coleção.
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-blue-300" />
                      Certificados emitidos
                    </h4>
                    <span className="text-xs text-slate-400">{certificates.length} documento(s)</span>
                  </div>
                  {certificates.length > 0 ? (
                    <div className="space-y-2">
                      {certificates.slice(0, 3).map((certificate) => (
                        <div key={certificate.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                          <div>
                            <div className="font-semibold text-white">{certificate.assessment_title || 'Certificado de avaliação'}</div>
                            <div className="text-xs text-slate-400">
                              Emitido em {new Date(certificate.issued_at).toLocaleDateString('pt-BR')} - Nota {certificate.score}%
                            </div>
                          </div>
                          <button
                            onClick={() => console.log('Abrir certificado', certificate.id)}
                            className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-500/20"
                          >
                            Ver
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                      Nenhum certificado ainda. Ele aparece quando você é aprovado em uma avaliação.
                    </div>
                  )}
                </div>
              </div>
              {/* Ranking */}
              <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    Ranking
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Users className="w-4 h-4" />
                    {ranking.length} operadores
                  </div>
                </div>

                {ranking.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum dado de ranking disponível</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ranking.map((entry, index) => (
                      <motion.div
                        key={entry.user_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-3 rounded-lg ${
                          index === 0 ? 'bg-yellow-500/10 border border-yellow-500/30' :
                          index === 1 ? 'bg-slate-400/10 border border-slate-400/30' :
                          index === 2 ? 'bg-orange-400/10 border border-orange-400/30' :
                          'bg-slate-600/30'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-slate-400 text-white' :
                          index === 2 ? 'bg-orange-400 text-white' :
                          'bg-slate-600 text-slate-300'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <div className="text-white font-medium">{entry.user_name}</div>
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
                )}
              </div>

              {/* Recent Attempts */}
              {attempts.length > 0 && (
                <div className="bg-slate-700/50 rounded-xl p-6 border border-slate-600">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      Tentativas Recentes
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {attempts.slice(0, 5).map((attempt) => (
                      <motion.div
                        key={attempt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-3 bg-slate-600/30 rounded-lg"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isAttemptPassed(attempt) ? 'bg-green-500/20' :
                          (attempt.score || 0) >= 50 ? 'bg-yellow-500/20' :
                          'bg-red-500/20'
                        }`}>
                          {isAttemptPassed(attempt) ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="text-white font-medium">{attempt.assessments?.title || 'Avaliação'}</div>
                          <div className="text-xs text-slate-400">
                            {new Date(attempt.started_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            isAttemptPassed(attempt) ? 'text-green-400' :
                            (attempt.score || 0) >= 50 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {attempt.score || 0}%
                          </div>
                          <div className="text-xs text-slate-400">
                            {getAttemptTime(attempt) ?
                              `${Math.floor(getAttemptTime(attempt) / 60)}:${(getAttemptTime(attempt) % 60).toString().padStart(2, '0')}` :
                              '--:--'
                            }
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Insights */}
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-6 border border-indigo-500/30">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-indigo-400" />
                  Insights e Recomendações
                </h3>
                
                <div className="space-y-3">
                  {stats && stats.passRate < 70 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <div className="text-white font-medium">Taxa de aprovação baixa</div>
                        <div className="text-sm text-slate-300">
                          A taxa de aprovação atual ({stats.passRate}%) est abaixo da meta. Considere revisar o contedo das avaliações ou oferecer treinamento adicional.
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {stats && stats.averageTime > 600 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                      <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <div className="text-white font-medium">Tempo de resposta elevado</div>
                        <div className="text-sm text-slate-300">
                          O tempo médio de resposta está acima de 10 minutos. Considere ajustar o tempo limite ou simplificar as questáes.
                        </div>
                      </div>
                    </div>
                  )}

                  {stats && stats.averageScore >= 85 && (
                    <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <div className="text-white font-medium">Desempenho excelente</div>
                        <div className="text-sm text-slate-300">
                          A pontuação média est muito alta. Considere aumentar a dificuldade das avaliações para melhorar a reteno de conhecimento.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
