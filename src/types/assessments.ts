/**
 * Assessment Module Types
 * Complete type definitions for the assessment and gamification system
 */

//  Assessment Types 

export type AssessmentDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type AssessmentStatus = 'in_progress' | 'completed' | 'abandoned';
export type QuestionOption = 'A' | 'B' | 'C' | 'D';
export type PerformanceLevel = 'excellent' | 'good' | 'attention' | 'needs_training';

export interface Assessment {
  id: string;
  title: string;
  description: string;
  process_item_id: string;
  question_count: 10 | 20;
  is_mandatory: boolean;
  passing_score: number; // 0-100
  time_limit_seconds: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  version: number;
  tags: string[];
  difficulty: AssessmentDifficulty;
  xp_reward: number;
}

export interface AssessmentQuestion {
  id: string;
  assessment_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: QuestionOption;
  weight: number; // 1-5
  explanation: string;
  image_url: string;
  time_limit_seconds: number;
  order_index: number;
  related_node_id: string;
  created_at: string;
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  user_id: string;
  started_at: string;
  completed_at: string;
  total_time_seconds: number;
  score: number; // 0-100
  correct_answers: number;
  total_questions: number;
  status: AssessmentStatus;
  xp_earned: number;
  level_before: number;
  level_after: number;
}

export interface AssessmentAttemptLock {
  id: string;
  assessment_id: string;
  user_id: string;
  blocked_until: string;
  last_failed_at: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option: QuestionOption;
  is_correct: boolean;
  time_taken_seconds: number;
  answered_at: string;
}

//  Gamification Types 

export interface UserAchievements {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  streak_days: number;
  last_activity_date: string;
  total_assessments_completed: number;
  total_correct_answers: number;
  total_questions_answered: number;
  fastest_correct_time_seconds: number;
  created_at: string;
  updated_at: string;
}

export type BadgeType = 
  | 'first_assessment'
  | 'perfect_score'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'level_5'
  | 'level_10'
  | 'level_25'
  | 'expert'
  | 'master'
  | 'speed_demon'
  | 'consistent_learner'
  | 'top_performer'
  | 'all_rounder'
  | 'monthly_trophy'
  | 'serra_doppia_master'
  | 'serra_emmegi_master'
  | 'serra_emmegi_criticos_master'
  | 'paletes_exportacao_master'
  | 'tramontina_master'
  | 'corte_serras_master'
  | 'usinagem_exp_fom_master'
  | 'paquimetro_150_300_master';

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  badge_image_url: string;
  badge_color: string;
  earned_at: string;
}

export type BadgeTemplateTrigger =
  | 'manual'
  | 'first_pass'
  | 'perfect_score'
  | 'minimum_score'
  | 'minimum_attempts'
  | 'level_threshold'
  | 'ranking_top';

export interface BadgeTemplate {
  id: string;
  template_key: string;
  name: string;
  description: string;
  icon: string;
  icon_mode: 'emoji' | 'image';
  icon_image_url: string;
  color: string;
  badge_shape: 'medal' | 'shield' | 'ribbon' | 'star' | 'circle';
  category: string;
  trigger_type: BadgeTemplateTrigger;
  trigger_value: number;
  scope_key: string;
  is_active: boolean;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentCertificate {
  id: string;
  attempt_id: string;
  user_id: string;
  user_name: string;
  assessment_id: string;
  assessment_title: string;
  certificate_number: string;
  issued_at: string;
  valid_until: string;
  score: number;
  pdf_url: string;
  certificate_template_key: string;
  certificate_title: string;
  certificate_subtitle: string;
  certificate_accent_color: string;
  certificate_background_color: string;
  certificate_border_color: string;
  certificate_style: string;
  certificate_paper_type: string;
  certificate_paper_orientation: 'landscape' | 'portrait';
  certificate_logo_url: string;
  certificate_watermark_url: string;
  issuer_name: string;
  certificate_footer_text: string;
}

export interface CertificateTemplate {
  id: string;
  template_key: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  accent_color: string;
  background_color: string;
  border_color: string;
  issuer_name: string;
  footer_text: string;
  certificate_style: 'premium' | 'minimal' | 'corporate';
  paper_type: 'premium' | 'minimal' | 'corporate' | 'parchment' | 'linen' | 'executive';
  paper_orientation: 'landscape' | 'portrait';
  logo_image_url: string;
  watermark_image_url: string;
  is_active: boolean;
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AssessmentAnalytics {
  id: string;
  assessment_id: string;
  total_attempts: number;
  average_score: number;
  pass_rate: number;
  average_time_seconds: number;
  most_failed_question_id: string;
  last_updated: string;
}

//  UI State Types 

export interface QuizState {
  currentQuestionIndex: number;
  answers: Map<number, QuestionOption>;
  timeRemaining: number;
  isCompleted: boolean;
  startTime: number;
}

export interface QuizResult {
  attemptId: string;
  passed: boolean;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
  xpEarned: number;
  levelBefore: number;
  levelAfter: number;
  performanceLevel: PerformanceLevel;
  answers: AssessmentAnswer[];
  newBadges: UserBadge[];
  medalTier: 'gold' | 'silver' | 'bronze' | 'participant';
  nextLevelLabel?: string;
  unlockedTrackLevel?: 'beginner' | 'intermediate' | 'expert';
  attemptsUsed?: number;
  attemptsRemaining?: number;
  blockedUntil?: string;
}

export function getMedalTier(score: number): 'gold' | 'silver' | 'bronze' | 'participant' {
  if (score >= 90) return 'gold';
  if (score >= 75) return 'silver';
  if (score >= 60) return 'bronze';
  return 'participant';
}

export interface RankingEntry {
  user_id: string;
  user_name: string;
  user_department: string;
  total_xp: number;
  current_level: number;
  total_assessments_completed: number;
  average_score: number;
  rank: number;
}

export type RankingPeriod = 'weekly' | 'monthly' | 'all_time';
export type RankingCategory = 'overall' | 'department' | 'shift' | 'machine';

//  Admin Types 

export interface QuestionFormData {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: QuestionOption;
  weight: number;
  explanation: string;
  image_url: string;
  time_limit_seconds: number;
  related_node_id: string;
}

export interface AssessmentFormData {
  title: string;
  description: string;
  process_item_id: string;
  question_count: 10 | 20;
  is_mandatory: boolean;
  passing_score: number;
  time_limit_seconds: number;
  tags: string[];
  difficulty: AssessmentDifficulty;
  xp_reward: number;
}

//  Helper Functions 

export function getPerformanceLevel(score: number): PerformanceLevel {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'attention';
  return 'needs_training';
}

export function getPerformanceLevelColor(level: PerformanceLevel): string {
  switch (level) {
    case 'excellent': return 'text-green-400';
    case 'good': return 'text-blue-400';
    case 'attention': return 'text-yellow-400';
    case 'needs_training': return 'text-red-400';
  }
}

export function getPerformanceLevelLabel(level: PerformanceLevel): string {
  switch (level) {
    case 'excellent': return 'Excelente';
    case 'good': return 'Bom';
    case 'attention': return 'Ateno';
    case 'needs_training': return 'Necessita Treinamento';
  }
}

export function calculateXP(
  correctAnswers: number,
  totalQuestions: number,
  timeTaken: number,
  timeLimit: number
): number {
  const baseXP = correctAnswers * 10;
  const accuracyBonus = (correctAnswers / totalQuestions) * 20;
  
  let timeBonus = 0;
  if (timeLimit) {
    const timeRatio = timeTaken / timeLimit;
    if (timeRatio < 0.5) timeBonus = 30;
    else if (timeRatio < 0.75) timeBonus = 20;
    else if (timeRatio < 1) timeBonus = 10;
  }
  
  return Math.round(baseXP + accuracyBonus + timeBonus);
}

export function getLevelProgress(currentXP: number, currentLevel: number): number {
  const xpForCurrentLevel = Math.pow(currentLevel, 2) * 100;
  const xpForNextLevel = Math.pow(currentLevel + 1, 2) * 100;
  const xpInRange = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = currentXP - xpForCurrentLevel;
  return Math.min(100, Math.max(0, (xpProgress / xpInRange) * 100));
}

export const BADGE_DEFINITIONS: Record<BadgeType, { name: string; description: string; icon: string; color: string }> = {
  first_assessment: {
    name: 'Primeira Avaliação',
    description: 'Completou sua primeira avaliação',
    icon: '🏅',
    color: '#3b82f6'
  },
  perfect_score: {
    name: 'Perfeição',
    description: 'Conseguiu 100% em uma avaliação',
    icon: '💯',
    color: '#10b981'
  },
  streak_3: {
    name: 'Sequência de 3 dias',
    description: 'Atividade por 3 dias consecutivos',
    icon: '🔥',
    color: '#f59e0b'
  },
  streak_7: {
    name: 'Semana Dedicada',
    description: 'Atividade por 7 dias consecutivos',
    icon: '📅',
    color: '#ef4444'
  },
  streak_30: {
    name: 'Mês de Dedicação',
    description: 'Atividade por 30 dias consecutivos',
    icon: '🗓️',
    color: '#8b5cf6'
  },
  level_5: {
    name: 'Nível 5',
    description: 'Alcançou o nível 5',
    icon: '⭐',
    color: '#fbbf24'
  },
  level_10: {
    name: 'Nível 10',
    description: 'Alcançou o nível 10',
    icon: '🌟',
    color: '#f59e0b'
  },
  level_25: {
    name: 'Nível 25',
    description: 'Alcançou o nível 25',
    icon: '✨',
    color: '#ec4899'
  },
  expert: {
    name: 'Especialista',
    description: 'Completou 50 avaliações com média acima de 80%',
    icon: '🎓',
    color: '#6366f1'
  },
  master: {
    name: 'Mestre',
    description: 'Completou 100 avaliações com média acima de 90%',
    icon: '👑',
    color: '#fbbf24'
  },
  speed_demon: {
    name: 'Velocista',
    description: 'Completou uma avaliação em menos de 50% do tempo',
    icon: '⚡',
    color: '#06b6d4'
  },
  consistent_learner: {
    name: 'Aprendiz Consistente',
    description: 'Média de acertos acima de 75% nas últimas 10 avaliações',
    icon: '📈',
    color: '#10b981'
  },
  top_performer: {
    name: 'Top Performer',
    description: 'Top 3 no ranking mensal',
    icon: '🏆',
    color: '#fbbf24'
  },
  all_rounder: {
    name: 'Completo',
    description: 'Completou avaliações de pelo menos 5 processos diferentes',
    icon: '🧭',
    color: '#8b5cf6'
  },
  monthly_trophy: {
    name: 'Troféu do Mês',
    description: 'Ficou entre os 3 primeiros do ranking mensal',
    icon: '🏆',
    color: '#f59e0b'
  },
  serra_doppia_master: {
    name: 'Mestre da Serra Doppia',
    description: 'Concluiu a trilha especialista da Serra Doppia 2 Cabeças',
    icon: '⚙️',
    color: '#38bdf8'
  },
  serra_emmegi_master: {
    name: 'Mestre da Serra Emmegi',
    description: 'Concluiu a trilha especialista da Serra Emmegi Automática 1 Cabeça',
    icon: '🛠️',
    color: '#60a5fa'
  },
  serra_emmegi_criticos_master: {
    name: 'Mestre dos Itens Críticos',
    description: 'Concluiu a trilha especialista dos itens críticos da Serra Emmegi',
    icon: '🎯',
    color: '#ef4444'
  },
  paletes_exportacao_master: {
    name: 'Mestre da Expedição',
    description: 'Concluiu a trilha especialista de Montagem de Paletes para Exportação',
    icon: '📦',
    color: '#22c55e'
  },
  tramontina_master: {
    name: 'Mestre Tramontina',
    description: 'Concluiu a trilha especialista de Montagem de Paletes - Tramontina',
    icon: '🔧',
    color: '#14b8a6'
  },
  corte_serras_master: {
    name: 'Mestre do Corte em Serras',
    description: 'Concluiu a trilha especialista de Corte em Serras',
    icon: '🪚',
    color: '#a855f7'
  },
  usinagem_exp_fom_master: {
    name: 'Mestre FOM',
    description: 'Concluiu a trilha especialista de Usinagem EXP - FOM Industrie CNC',
    icon: '🏭',
    color: '#f97316'
  },
  paquimetro_150_300_master: {
    name: 'Mestre do Paquímetro',
    description: 'Concluiu a trilha especialista de Paquímetros 150 mm e 300 mm',
    icon: '📏',
    color: '#06b6d4'
  }
};
