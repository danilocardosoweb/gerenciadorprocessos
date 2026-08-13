/**
 * AssessmentQuiz Component
 * User-facing quiz interface with gamification elements
 * Modern, intuitive design inspired by Duolingo/Kahoot with industrial aesthetic
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Star, 
  Award,
  Flame,
  Target,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Home,
  Download,
  X,
  Lock,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useAssessments } from '../hooks/useAssessments';
import { BadgeGrid } from './GamificationBadge';
import type { 
  Assessment, 
  AssessmentQuestion, 
  QuizState, 
  QuizResult
} from '../types/assessments';
import { 
  getPerformanceLevel, 
  getPerformanceLevelColor, 
  getPerformanceLevelLabel,
  getLevelProgress
} from '../types/assessments';
import confetti from 'canvas-confetti';

interface AssessmentQuizProps {
  assessment: Assessment;
  questions: AssessmentQuestion[];
  userId: string;
  onComplete: (result: QuizResult) => void;
  onCancel: () => void;
  onOpenCertificate: (attemptId: string, userId: string) => void;
  onOpenRanking: () => void;
}

export function AssessmentQuiz({ 
  assessment, 
  questions, 
  userId, 
  onComplete, 
  onCancel,
  onOpenCertificate,
  onOpenRanking 
}: AssessmentQuizProps) {
  const {
    startAttempt,
    submitAnswer,
    completeAttempt,
    fetchUserAchievements,
    checkAssessmentAccess
  } = useAssessments();

  const createInitialQuizState = () => ({
    currentQuestionIndex: 0,
    answers: new Map(),
    timeRemaining: assessment.time_limit_seconds || 0,
    isCompleted: false,
    startTime: Date.now()
  });

  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: new Map(),
    timeRemaining: assessment.time_limit_seconds || 0,
    isCompleted: false,
    startTime: Date.now()
  });

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [userAchievements, setUserAchievements] = useState<any>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [accessState, setAccessState] = useState<{
    canStart: boolean;
    failedAttempts: number;
    remainingAttempts: number;
    blockedUntil: string | null;
  } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const latestAnswersRef = useRef<Map<number, 'A' | 'B' | 'C' | 'D'>>(new Map());

  const normalizeOption = (value: string | null) =>
    (value || '').trim().toUpperCase() as 'A' | 'B' | 'C' | 'D';

  const getQuestionCorrectOption = (question: AssessmentQuestion) =>
    normalizeOption((question as any).correct_option || (question as any).correct_answer || 'A');

  const initializeQuiz = useCallback(async () => {
    setIsInitializing(true);
    setAccessState(null);
    setCompletionError(null);
    setResult(null);
    setSelectedOption(null);
    setShowFeedback(false);
    setIsCorrect(false);
    setIsCompleting(false);
    setAttemptId(null);
    latestAnswersRef.current = new Map();
    setQuizState(createInitialQuizState());

    const access = await checkAssessmentAccess(assessment.id, userId, assessment.passing_score);
    setAccessState({ ...access, blockedUntil: access.blockedUntil ?? null });

    if (!access.canStart) {
      setIsInitializing(false);
      return;
    }

    const attempt = await startAttempt(assessment.id, userId, assessment.passing_score);
    if (attempt) {
      setAttemptId(attempt.id);
    }
    
    const achievements = await fetchUserAchievements(userId);
    setUserAchievements(achievements);
    setIsInitializing(false);
  }, [assessment.id, assessment.passing_score, checkAssessmentAccess, fetchUserAchievements, startAttempt, userId]);

  // Initialize attempt and fetch achievements
  useEffect(() => {
    initializeQuiz();
  }, [initializeQuiz]);

  // Timer
  useEffect(() => {
    if (quizState.isCompleted || !assessment.time_limit_seconds) return;

    const timer = setInterval(() => {
      setQuizState(prev => {
        if (prev.timeRemaining <= 0) {
          handleTimeUp();
          return prev;
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState.isCompleted, assessment.time_limit_seconds, attemptId, quizState.answers, isCompleting]);

  const getCorrectCount = (answers: Map<number, 'A' | 'B' | 'C' | 'D'>) => (
    Array.from(answers.entries()).filter(
      ([questionIndex, answer]) => {
        const question = questions[questionIndex];
        return question && getQuestionCorrectOption(question) === normalizeOption(answer);
      }
    ).length
  );

  const handleTimeUp = async () => {
    if (!attemptId || quizState.isCompleted || isCompleting) return;
    
    const correctCount = getCorrectCount(quizState.answers);
    const score = Math.round((correctCount / questions.length) * 100);
    const totalTime = assessment.time_limit_seconds || 0;
    
    await handleComplete(quizState.answers, totalTime, score, correctCount);
  };

  const handleComplete = async (
    answersOverride: Map<number, 'A' | 'B' | 'C' | 'D'> = quizState.answers,
    totalTimeOverride?: number,
    scoreOverride?: number,
    correctCountOverride?: number
  ) => {
    if (!attemptId || isCompleting) return;
    setIsCompleting(true);
    setCompletionError(null);

    const answersForCompletion = answersOverride.size > 0 ? answersOverride : latestAnswersRef.current;
    const correctCount = correctCountOverride ?? getCorrectCount(answersForCompletion);
    const score = scoreOverride ?? Math.round((correctCount / questions.length) * 100);
    const totalTime = totalTimeOverride ?? Math.round((Date.now() - quizState.startTime) / 1000);
    
    const quizResult = await completeAttempt(
      attemptId,
      score,
      correctCount,
      questions.length,
      totalTime,
      userId
    );
    
    if (quizResult) {
      setResult(quizResult);
      setQuizState(prev => ({ ...prev, isCompleted: true, answers: answersForCompletion }));
      onComplete(quizResult);
      
      if (score >= assessment.passing_score) {
        triggerConfetti();
      }
    } else {
      setCompletionError('Não foi possível fechar a avaliação agora. Você pode sair e tentar novamente em seguida.');
    }
    setIsCompleting(false);
    return quizResult;
  };

  const handleAnswer = async (option: string) => {
    if (showFeedback || !attemptId || isCompleting) return;

    const currentQuestion = questions[quizState.currentQuestionIndex];
    const normalizedOption = normalizeOption(option);
    const correct = getQuestionCorrectOption(currentQuestion) === normalizedOption;
    const nextAnswers = new Map(latestAnswersRef.current).set(
      quizState.currentQuestionIndex,
      normalizedOption
    );
    latestAnswersRef.current = nextAnswers;
    
    setSelectedOption(option);
    setIsCorrect(correct);
    setShowFeedback(true);
    setQuizState(prev => ({
      ...prev,
      answers: nextAnswers
    }));

    const timeTaken = Math.round((Date.now() - quizState.startTime) / 1000);
    await submitAnswer(attemptId, currentQuestion.id, normalizedOption, timeTaken);

    setTimeout(() => {
      if (quizState.currentQuestionIndex < questions.length - 1) {
        handleNext();
      } else {
        handleComplete(nextAnswers);
      }
    }, 900);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowFeedback(false);
    setQuizState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1
    }));
  };

  const handlePrevious = () => {
    if (quizState.currentQuestionIndex > 0) {
      setSelectedOption(null);
      setShowFeedback(false);
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };


  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const progress = ((quizState.currentQuestionIndex + 1) / questions.length) * 100;
  const isFinalQuestion = quizState.currentQuestionIndex === questions.length - 1;

  if (isInitializing && !result) {
    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-800 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
            <RefreshCw className="h-7 w-7 animate-spin" />
          </div>
          <h3 className="text-2xl font-bold text-white">Preparando sua avaliação</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Estamos verificando acesso, tentativas e carregando sua trilha com segurança.
          </p>
        </div>
      </div>
    );
  }

  if (!result && accessState && !accessState.canStart) {
    const blockedDate = accessState.blockedUntil ? new Date(accessState.blockedUntil).toLocaleDateString('pt-BR') : '';

    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl overflow-hidden rounded-3xl border border-amber-400/20 bg-slate-800 shadow-2xl"
        >
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">Acesso temporariamente bloqueado</p>
                <h2 className="text-2xl font-bold text-white">Aguarde para tentar novamente</h2>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <p className="text-sm leading-6 text-slate-300">
              Você atingiu o limite de tentativas desta avaliação e precisa aguardar um período de revisão antes de tentar novamente.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Tentativas usadas</p>
                <p className="mt-2 text-2xl font-bold text-white">{accessState.failedAttempts}/3</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Liberação</p>
                <p className="mt-2 text-2xl font-bold text-amber-300">{blockedDate || 'Em breve'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
              <div className="flex items-center gap-2 text-amber-200 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                O que fazer agora
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Revise o mapa, releia os detalhes analticos e volte quando a avaliação for liberada.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={onCancel}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-600"
              >
                <Home className="h-4 w-4" />
                Voltar ao mapa
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!attemptId && !result) {
    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-3xl border border-rose-400/20 bg-slate-800 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-bold text-white">Não foi possível iniciar</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Tente fechar e abrir a avaliação novamente. Se o problema persistir, avise a administração.
          </p>
          <button
            onClick={onCancel}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-3 font-semibold text-white transition-colors hover:bg-slate-600"
          >
            <Home className="h-4 w-4" />
            Voltar ao mapa
          </button>
        </div>
      </div>
    );
  }

  if (quizState.isCompleted && result) {
    return (
      <QuizResultView
        result={result}
        assessment={assessment}
        userId={userId}
        onCancel={onCancel}
        onRetry={result.passed ? undefined : initializeQuiz}
        onOpenCertificate={onOpenCertificate}
        onOpenRanking={onOpenRanking}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-slate-700 flex flex-col"
      >
        {isCompleting && !result && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/95 p-6 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
                <RefreshCw className="h-7 w-7 animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-white">Concluindo sua avaliação</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Estamos registrando sua tentativa, calculando seu desempenho e preparando sua recompensa.
              </p>
            </motion.div>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">{assessment.title}</h2>
            {assessment.time_limit_seconds && (
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-white font-mono font-semibold">
                  {formatTime(quizState.timeRemaining)}
                </span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="bg-white h-2 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-white/80">
            <span>Questo {quizState.currentQuestionIndex + 1} de {questions.length}</span>
            <span>{Math.round(progress)}% completo</span>
          </div>
        </div>

        {/* User Stats */}
        {userAchievements && (
          <div className="px-6 py-3 bg-slate-700/50 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold">Nível {userAchievements.current_level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-semibold">{userAchievements.streak_days} dias</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">XP Total</div>
                <div className="text-white font-bold">{userAchievements.total_xp}</div>
              </div>
            </div>
          </div>
        )}

        {showFeedback && currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-6 mt-4 rounded-2xl border px-4 py-3 ${
              isCorrect ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-400" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 text-red-400" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-white">
                  {isCorrect ? 'Resposta correta' : 'Resposta incorreta'}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  {currentQuestion.explanation || 'Revise o conteúdo e tente novamente.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {completionError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mt-4 rounded-2xl border border-rose-500/35 bg-rose-500/10 px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-300" />
              <div>
                <p className="font-semibold text-white">Não foi possível concluir agora</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{completionError}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Question */}
        <div className="flex-1 min-h-0 p-6 overflow-y-auto">
          <motion.div
            key={quizState.currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentQuestion.image_url && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={currentQuestion.image_url} 
                  alt="Question image"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            <h3 className="text-xl font-semibold text-white mb-6">
              {currentQuestion.question_text}
            </h3>

            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((option) => {
                const optionText = currentQuestion[`option_${option.toLowerCase()}` as keyof AssessmentQuestion] as string;
                const isSelected = selectedOption === option;
                const isCorrectOption = getQuestionCorrectOption(currentQuestion) === normalizeOption(option);
                
                let bgColor = 'bg-slate-700 hover:bg-slate-600';
                let borderColor = 'border-slate-600';
                
                if (showFeedback) {
                  if (isCorrectOption) {
                    bgColor = 'bg-green-500/20 border-green-500';
                    borderColor = 'border-green-500';
                  } else if (isSelected && !isCorrectOption) {
                    bgColor = 'bg-red-500/20 border-red-500';
                    borderColor = 'border-red-500';
                  }
                } else if (isSelected) {
                  bgColor = 'bg-blue-500/20 border-blue-500';
                  borderColor = 'border-blue-500';
                }

                return (
                  <motion.button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={showFeedback}
                    whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                    whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                    className={`w-full p-4 rounded-xl border-2 ${bgColor} ${borderColor} text-left transition-all ${
                      showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        showFeedback && isCorrectOption ? 'bg-green-500 text-white' :
                        showFeedback && isSelected && !isCorrectOption ? 'bg-red-500 text-white' :
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-300'
                      }`}>
                        {option}
                      </div>
                      <span className="text-white flex-1">{optionText}</span>
                      {showFeedback && isCorrectOption && (
                        <CheckCircle2 className="w-6 h-6 text-green-400" />
                      )}
                      {showFeedback && isSelected && !isCorrectOption && (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

          </motion.div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 bg-slate-700/50 border-t border-slate-700 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={quizState.currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Cancelar
          </button>
          
          {quizState.currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!selectedOption || showFeedback}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleComplete(latestAnswersRef.current)}
              disabled={!selectedOption || isCompleting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCompleting ? 'Finalizando...' : 'Concluir avaliação'}
              <Target className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function QuizResultView({ 
  result, 
  assessment, 
  userId,
  onCancel,
  onRetry,
  onOpenCertificate,
  onOpenRanking
}: { 
  result: QuizResult; 
  assessment: Assessment;
  userId: string;
  onCancel: () => void;
  onRetry: () => void;
  onOpenCertificate: (attemptId: string, userId: string) => void;
  onOpenRanking: () => void;
}) {
  const performanceLevel = getPerformanceLevel(result.score);
  const levelColor = getPerformanceLevelColor(performanceLevel);
  const levelLabel = getPerformanceLevelLabel(performanceLevel);
  const levelProgress = getLevelProgress(result.xpEarned + (result.levelBefore * result.levelBefore * 100), result.levelAfter);
  const medalLabel = result.medalTier === 'gold' ?
     'Medalha de Ouro'
    : result.medalTier === 'silver' ?
       'Medalha de Prata'
    : result.medalTier === 'bronze' ?
       'Medalha de Bronze'
      : 'Participao';
  const nextLevelLabel = result.nextLevelLabel;
  const passed = result.passed;
  const retryCount = result.attemptsUsed || 0;
  const remainingAttempts = result.attemptsRemaining ?? 0;
  const blockedUntil = result.blockedUntil ? new Date(result.blockedUntil).toLocaleDateString('pt-BR') : null;
  const hasRetryOption = !passed && !blockedUntil && remainingAttempts > 0 && !!onRetry;
  const heroGradient = passed ?
     'from-emerald-600 to-blue-600'
    : blockedUntil ?
       'from-amber-600 to-orange-600'
      : 'from-rose-600 to-orange-600';
  const heroIcon = passed ? Trophy : blockedUntil ? Lock : RotateCcw;
  const HeroIcon = heroIcon;
  const title = passed ?
     'Parabns, voc concluiu a avaliação!'
    : blockedUntil ?
       'Avaliação bloqueada temporariamente'
      : 'Ainda no foi dessa vez';
  const subtitle = passed ?
     'Seu resultado está pronto, com prêmio, certificado e próximo nível liberado.'
    : blockedUntil ?
       `Você esgotou as tentativas disponíveis. Nova liberação em ${blockedUntil}.`
      : `Você ainda pode tentar novamente. Restam ${remainingAttempts} tentativa(s).`;

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] border border-slate-700 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`relative bg-gradient-to-r ${heroGradient} px-6 py-8 text-center`}>
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-2 text-white/90 transition-colors hover:bg-white/20"
            aria-label="Fechar resultado"
          >
            <X className="h-4 w-4" />
          </button>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
          >
            <HeroIcon className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-white/80">{assessment.title}</p>
          <p className="mt-3 text-sm text-white/90">{subtitle}</p>
        </div>

        {/* Results */}
        <div className="flex-1 min-h-0 p-6 space-y-6 overflow-y-auto">
          {/* Score */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${levelColor} mb-2`}>
              {result.score}%
            </div>
            <div className={`text-xl font-semibold ${levelColor}`}>
              {passed ? levelLabel : 'Continue estudando'}
            </div>
            <div className="text-sm text-amber-300 font-semibold mt-2">
              {passed ? medalLabel : `Tentativa ${retryCount}/3`}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <div className="text-sm text-slate-400">Acertos</div>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-slate-400">Tempo</div>
            </div>
          </div>

          {passed && result.newBadges && result.newBadges.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl p-4 border border-emerald-500/30"
            >
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-emerald-300" />
                <span className="text-white font-semibold">Conquista desbloqueada</span>
              </div>
              <BadgeGrid badges={result.newBadges} maxDisplay={6} />
            </motion.div>
          )}

          {/* XP & Level */}
          <div className={`rounded-xl p-4 border ${passed ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30' : blockedUntil ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/30' : 'bg-gradient-to-r from-rose-500/15 to-orange-500/15 border-rose-500/30'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">{passed ? 'XP Ganho' : 'XP da tentativa'}</span>
              </div>
              <span className="text-2xl font-bold text-yellow-400">+{result.xpEarned}</span>
            </div>
            
            {passed && result.levelAfter > result.levelBefore && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-green-400 mb-3"
              >
                <Award className="w-5 h-5" />
                <span className="font-semibold">Subiu para o Nível {result.levelAfter}!</span>
              </motion.div>
            )}

            {passed && nextLevelLabel && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3"
              >
                <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Próximo nível liberado
                </div>
                <p className="text-sm text-slate-200 mt-1">
                  Você concluiu esta etapa e pode seguir para <span className="font-bold">{nextLevelLabel}</span>.
                </p>
              </motion.div>
            )}

            {!passed && !blockedUntil && (
              <div className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                <div className="flex items-center gap-2 text-rose-200 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Restam {remainingAttempts} tentativa(s)</span>
                </div>
                <p className="text-sm text-slate-200 mt-1">
                  Revise o conteúdo e tente novamente para liberar o próximo nível.
                </p>
              </div>
            )}

            {blockedUntil && (
              <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                <div className="flex items-center gap-2 text-amber-200 font-semibold">
                  <Lock className="w-4 h-4" />
                  <span>Bloqueada até {blockedUntil}</span>
                </div>
                <p className="text-sm text-slate-200 mt-1">
                  Você atingiu 3 tentativas. A avaliação será liberada novamente na data acima.
                </p>
              </div>
            )}
            
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-400">
              <span>Nível {result.levelAfter}</span>
              <span>{Math.round(levelProgress)}%</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              {passed ? 'Ir para o próximo nível' : 'Voltar ao mapa'}
            </button>
            {passed && (
              <button
                onClick={() => result.attemptId && onOpenCertificate(result.attemptId, userId)}
                disabled={!result.attemptId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Certificado
              </button>
            )}
            {hasRetryOption && (
              <button
                onClick={onRetry}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>
            )}
            {passed && onOpenRanking && (
              <button
                onClick={onOpenRanking}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                <Trophy className="w-4 h-4" />
                Ranking
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
