/**
 * useAssessments Hook
 * Manages all assessment-related data operations with Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  EDUCATIONAL_THEMES,
  buildEducationalAssessmentBundles,
  findEducationalThemeByTitle,
} from '../data/assessmentCatalog';
import type {
  Assessment,
  AssessmentQuestion,
  AssessmentAttempt,
  AssessmentAnswer,
  UserAchievements,
  UserBadge,
  AssessmentCertificate,
  AssessmentAnalytics,
  QuestionFormData,
  AssessmentFormData,
  QuizResult,
  RankingEntry,
  RankingPeriod,
  RankingCategory,
  BadgeTemplate,
  CertificateTemplate
} from '../types/assessments';
import { calculateXP, getPerformanceLevel, getMedalTier } from '../types/assessments';

const normalizeQuestion = (question: any): AssessmentQuestion => ({
  ...question,
  correct_option: normalizeOption(question.correct_option || question.correct_answer || 'A'),
  weight: question.weight || 1
});

const normalizeOption = (value: string | null) =>
  (value || 'A').trim().toUpperCase();

const serializeQuestion = (questionData: Partial<QuestionFormData>) => ({
  ...questionData,
  correct_answer: questionData.correct_option
});

const formatSupabaseError = (err: any) => {
  const code = err.code ? `[${err.code}] ` : '';
  const message = err.message || 'Erro desconhecido';
  const details = err.details ? ` (${err.details})` : '';
  return `${code}${message}${details}`;
};

const isMissingRpcFunctionError = (err: any) =>
  err.code === '42883' || `${err.message || ''}`.toLowerCase().includes('function');

const isMissingColumnError = (err: any) =>
  err.code === '42703' || `${err.message || ''}`.toLowerCase().includes('column');

const normalizeForMatch = (value: string | null) =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const MAX_ATTEMPTS_PER_WINDOW = 3;
const RETRY_WINDOW_DAYS = 7;

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isWithinPeriod = (dateValue: string | null, period: RankingPeriod = 'all_time') => {
  if (!dateValue || period === 'all_time') return true;

  const completed = new Date(dateValue);
  const now = new Date();
  if (period === 'weekly') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return completed >= start;
  }

  if (period === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return completed >= start;
  }

  return true;
};

async function persistAssessmentRecord(formData: AssessmentFormData, userId: string, isPublished = false) {
  const title = formData.title.trim();
  if (!title) {
    throw new Error('Ttulo da avaliação  obrigatório.');
  }
  if (formData.passing_score < 0 || formData.passing_score > 100) {
    throw new Error('Nota mínima deve estar entre 0 e 100.');
  }

  let { data, error } = await supabase.rpc('create_assessment_bundle_admin', {
    p_assessment: {
      title,
      description: formData.description.trim() || null,
      process_item_id: formData.process_item_id || null,
      question_count: formData.question_count,
      difficulty: formData.difficulty,
      time_limit_seconds: formData.time_limit_seconds ?? null,
      passing_score: formData.passing_score,
      is_mandatory: formData.is_mandatory,
      tags: formData.tags || [],
      xp_reward: formData.xp_reward || 100,
      created_by: userId,
      is_published: isPublished,
    },
    p_questions: [],
  });

  if (error && isMissingRpcFunctionError(error)) {
    throw new Error('Função create_assessment_bundle_admin indisponível. Aplique a migração 20260523134500_create_assessment_bundle_admin.sql.');
  }

  if (error) throw error;
  return data;
}

async function persistQuestionRecord(assessmentId: string, questionData: QuestionFormData, orderIndex: number) {
  const rpcPayload = {
    p_assessment_id: assessmentId,
    p_question_text: questionData.question_text,
    p_option_a: questionData.option_a,
    p_option_b: questionData.option_b,
    p_option_c: questionData.option_c,
    p_option_d: questionData.option_d,
    p_correct_answer: questionData.correct_option,
    p_weight: questionData.weight || 1,
    p_explanation: questionData.explanation || null,
    p_image_url: questionData.image_url || null,
    p_time_limit_seconds: questionData.time_limit_seconds ?? null,
    p_related_node_id: questionData.related_node_id || null,
    p_order_index: orderIndex,
  };

  let { data, error } = await supabase.rpc('create_assessment_question_admin', rpcPayload);

  if (error && isMissingRpcFunctionError(error)) {
    throw new Error('Função create_assessment_question_admin indisponível. Aplique a migração do módulo de avaliações.');
  }

  if (error) throw error;
  return normalizeQuestion(data);
}

async function getRecentFailedAttemptsCount(assessmentId: string, userId: string, passingScore: number) {
  const since = addDays(new Date(), -RETRY_WINDOW_DAYS).toISOString();
  const { count, error } = await supabase
    .from('assessment_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('assessment_id', assessmentId)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .lt('score', passingScore)
    .gte('completed_at', since);

  if (error) throw error;
  return count || 0;
}

async function getAssessmentBlockedUntil(assessmentId: string, userId: string) {
  const { data, error } = await supabase
    .from('assessment_attempt_locks')
    .select('blocked_until')
    .eq('assessment_id', assessmentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
    throw error;
  }

  return data.blocked_until || null;
}

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all published assessments
  const fetchAssessments = useCallback(async (processItemId: string, includeDrafts: boolean = false, includeGlobal: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!includeDrafts) {
        query = query.eq('is_published', true);
      }
      
      if (processItemId && includeGlobal) {
        query = query.or(`process_item_id.is.null,process_item_id.eq.${processItemId}`);
      } else if (processItemId) {
        query = query.eq('process_item_id', processItemId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setAssessments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch assessment by ID
  const fetchAssessmentById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (!data) return null;
      return {
        ...data,
        streak_days: data.streak_days ?? data.current_streak ?? 0,
        xp_to_next_level: data.xp_to_next_level ?? 0
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch questions for an assessment
  const fetchQuestions = useCallback(async (assessmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return (data || []).map(normalizeQuestion);
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new assessment
  const createAssessment = useCallback(async (formData: AssessmentFormData, userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      return await persistAssessmentRecord(formData, userId);
    } catch (err: any) {
      const message = formatSupabaseError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update assessment
  const updateAssessment = useCallback(async (id: string, formData: Partial<AssessmentFormData>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('assessments')
        .update(formData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete assessment
  const deleteAssessment = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add question to assessment
  const addQuestion = useCallback(async (assessmentId: string, questionData: QuestionFormData, orderIndex: number) => {
    setLoading(true);
    setError(null);
    
    try {
      return await persistQuestionRecord(assessmentId, questionData, orderIndex);
    } catch (err: any) {
      const message = formatSupabaseError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAssessmentAccess = useCallback(async (assessmentId: string, userId: string, passingScore: number = 70) => {
    setLoading(true);
    setError(null);

    try {
      const blockedUntil = await getAssessmentBlockedUntil(assessmentId, userId);
      const now = new Date();

      if (blockedUntil && new Date(blockedUntil) > now) {
        const failedAttempts = await getRecentFailedAttemptsCount(assessmentId, userId, passingScore);
        return {
          canStart: false,
          blockedUntil,
          failedAttempts,
          remainingAttempts: 0,
        };
      }

      if (blockedUntil && new Date(blockedUntil) <= now) {
        await supabase
          .from('assessment_attempt_locks')
          .delete()
          .eq('assessment_id', assessmentId)
          .eq('user_id', userId);
      }

      const failedAttempts = await getRecentFailedAttemptsCount(assessmentId, userId, passingScore);
      return {
        canStart: true,
        failedAttempts,
        remainingAttempts: Math.max(0, MAX_ATTEMPTS_PER_WINDOW - failedAttempts),
      };
    } catch (err: any) {
      setError(err.message);
      return {
        canStart: true,
        failedAttempts: 0,
        remainingAttempts: MAX_ATTEMPTS_PER_WINDOW,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update question
  const updateQuestion = useCallback(async (questionId: string, questionData: Partial<QuestionFormData>) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .update(serializeQuestion(questionData))
        .eq('id', questionId)
        .select()
        .single();
      
      if (error) throw error;
      return normalizeQuestion(data);
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete question
  const deleteQuestion = useCallback(async (questionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('assessment_questions')
        .delete()
        .eq('id', questionId);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start assessment attempt
  const startAttempt = useCallback(async (assessmentId: string, userId: string, passingScore: number = 70) => {
    setLoading(true);
    setError(null);
    
    try {
      const access = await checkAssessmentAccess(assessmentId, userId, passingScore);
      if (!access.canStart) {
        throw new Error(access.blockedUntil ?
           `Avaliação bloqueada at ${new Date(access.blockedUntil).toLocaleDateString('pt-BR')}.`
          : 'Você não pode iniciar esta avaliação no momento.');
      }

      const { data, error } = await supabase
        .from('assessment_attempts')
        .insert({
          assessment_id: assessmentId,
          user_id: userId,
          status: 'in_progress'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [checkAssessmentAccess]);

  // Submit answer
  const submitAnswer = useCallback(async (
    attemptId: string,
    questionId: string,
    selectedOption: string,
    timeTaken: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get correct answer
      const { data: question } = await supabase
        .from('assessment_questions')
        .select('correct_option, correct_answer')
        .eq('id', questionId)
        .single();
      
      const selected = normalizeOption(selectedOption);
      const correctOption = normalizeOption(question.correct_option || question.correct_answer || 'A');
      const isCorrect = correctOption === selected;
      
      const { data, error } = await supabase
        .from('assessment_answers')
        .insert({
          attempt_id: attemptId,
          question_id: questionId,
          selected_option: selected,
          is_correct: isCorrect,
          time_taken_seconds: timeTaken
        })
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, isCorrect };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete attempt
  const completeAttempt = useCallback(async (
    attemptId: string,
    score: number,
    correctAnswers: number,
    totalQuestions: number,
    totalTime: number,
    userId: string
  ): Promise<QuizResult | null> => {
    setLoading(true);
    setError(null);
    
    try {
      let resolvedCorrectAnswers = correctAnswers;
      let resolvedTotalQuestions = totalQuestions;
      let resolvedScore = score;

      try {
        const { data: savedAnswers } = await supabase
          .from('assessment_answers')
          .select('is_correct')
          .eq('attempt_id', attemptId);

        if (savedAnswers && savedAnswers.length > 0) {
          const savedCorrect = savedAnswers.filter((answer: any) => answer.is_correct).length;
          if (savedCorrect > resolvedCorrectAnswers || resolvedScore === 0) {
            resolvedCorrectAnswers = savedCorrect;
            resolvedTotalQuestions = Math.max(totalQuestions, savedAnswers.length);
            resolvedScore = Math.round((resolvedCorrectAnswers / resolvedTotalQuestions) * 100);
          }
        }
      } catch (answerError) {
        console.error('Error recalculating attempt answers:', answerError);
      }

      const xpEarned = calculateXP(resolvedCorrectAnswers, resolvedTotalQuestions, totalTime, 0);

      const { data: currentAchievements } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .single();

      const previousXp = currentAchievements?.total_xp || 0;
      const nextXp = previousXp + xpEarned;
      const levelBefore = currentAchievements?.current_level || 1;
      const levelAfter = Math.max(1, Math.floor(Math.sqrt(nextXp / 100)));
      
      const attemptUpdatePayload = {
        score: resolvedScore,
        correct_answers: resolvedCorrectAnswers,
        total_questions: resolvedTotalQuestions,
        time_taken_seconds: totalTime,
        status: 'completed',
        completed_at: new Date().toISOString(),
        xp_earned: xpEarned,
        level_before: levelBefore,
        level_after: levelAfter
      };

      let { data: attempt, error } = await supabase
        .from('assessment_attempts')
        .update(attemptUpdatePayload)
        .eq('id', attemptId)
        .select()
        .single();

      if (error && isMissingColumnError(error)) {
        const { data: fallbackAttempt, error: fallbackError } = await supabase
          .from('assessment_attempts')
          .update({
            score: resolvedScore,
            correct_answers: resolvedCorrectAnswers,
            total_questions: resolvedTotalQuestions,
            time_taken_seconds: totalTime,
            status: 'completed',
            completed_at: new Date().toISOString(),
            xp_earned: xpEarned
          })
          .eq('id', attemptId)
          .select()
          .single();

        attempt = fallbackAttempt;
        error = fallbackError;
      }

      if (error) throw error;

      if (currentAchievements) {
        const { error: achievementError } = await supabase
          .from('user_achievements')
          .update({
            total_xp: nextXp,
            current_level: levelAfter,
            total_assessments_completed: (currentAchievements.total_assessments_completed || 0) + 1,
            total_correct_answers: (currentAchievements.total_correct_answers || 0) + resolvedCorrectAnswers,
            total_questions_answered: (currentAchievements.total_questions_answered || 0) + resolvedTotalQuestions,
            highest_score: Math.max(currentAchievements.highest_score || 0, resolvedScore),
            last_activity_date: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', userId);

        if (achievementError) {
          console.error('Error updating user achievements:', achievementError);
        }
      } else {
        const { error: achievementError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            total_xp: nextXp,
            current_level: levelAfter,
            total_assessments_completed: 1,
            total_correct_answers: resolvedCorrectAnswers,
            total_questions_answered: resolvedTotalQuestions,
            highest_score: resolvedScore,
            last_activity_date: new Date().toISOString().split('T')[0]
          });

        if (achievementError) {
          console.error('Error creating user achievements:', achievementError);
        }
      }

      const { data: assessmentInfo, error: assessmentError } = await supabase
        .from('assessments')
        .select('id, title, difficulty, tags, process_item_id, passing_score')
        .eq('id', attempt.assessment_id)
        .single();

      if (assessmentError) throw assessmentError;

      const passingScore = assessmentInfo.passing_score ?? 70;
      const passed = resolvedScore >= passingScore;
      let attemptsUsed: number | undefined;
      let attemptsRemaining = MAX_ATTEMPTS_PER_WINDOW;
      let blockedUntil: string | undefined;

      let badgesBefore: any[] = [];
      try {
        const { data } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId);
        badgesBefore = data || [];
      } catch (badgeError) {
        console.error('Error reading badges before completion:', badgeError);
      }

      if (passed) {
        // Check for badges only on successful attempts
        try {
          await checkAndAwardBadges(userId, attempt.assessment_id, resolvedScore, resolvedCorrectAnswers, resolvedTotalQuestions, assessmentInfo);
        } catch (badgeFlowError) {
          console.error('Error checking assessment badges:', badgeFlowError);
        }

        try {
          const educationalTheme = findEducationalThemeByTitle(assessmentInfo.title || '');
          if (educationalTheme && (assessmentInfo.difficulty || '') === 'expert' && resolvedScore >= 80) {
            await awardBadge(userId, educationalTheme.badgeType);
          }
        } catch (themeBadgeError) {
          console.error('Error awarding theme badge:', themeBadgeError);
        }

        try {
          const monthlyRanking = await fetchRanking('monthly', 'overall', 3);
          if (monthlyRanking.some((entry) => entry.user_id === userId && entry.rank <= 3)) {
            await awardBadge(userId, 'monthly_trophy');
          }
        } catch (rankingError) {
          console.error('Error checking monthly ranking for trophy:', rankingError);
        }

        try {
          await supabase
            .from('assessment_attempt_locks')
            .delete()
            .eq('assessment_id', attempt.assessment_id)
            .eq('user_id', userId);
        } catch (lockError) {
          console.error('Error clearing attempt lock:', lockError);
        }
      } else {
        try {
          const failedAttempts = await getRecentFailedAttemptsCount(attempt.assessment_id, userId, passingScore);
          attemptsUsed = failedAttempts;
          attemptsRemaining = Math.max(0, MAX_ATTEMPTS_PER_WINDOW - failedAttempts);
          if (failedAttempts >= MAX_ATTEMPTS_PER_WINDOW) {
            blockedUntil = addDays(new Date(), RETRY_WINDOW_DAYS).toISOString();
            await supabase
              .from('assessment_attempt_locks')
              .upsert({
                assessment_id: attempt.assessment_id,
                user_id: userId,
                blocked_until: blockedUntil,
                last_failed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, { onConflict: 'assessment_id,user_id' });
          } else {
            await supabase
              .from('assessment_attempt_locks')
              .delete()
              .eq('assessment_id', attempt.assessment_id)
              .eq('user_id', userId);
          }

          const lockedUntilFromDb = await getAssessmentBlockedUntil(attempt.assessment_id, userId);
          if (lockedUntilFromDb) {
            blockedUntil = lockedUntilFromDb;
          }
        } catch (lockError) {
          console.error('Error updating attempt lock:', lockError);
        }
      }

      let badgesAfter: any[] = [];
      try {
        const { data } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', userId);
        badgesAfter = data || [];
      } catch (badgeError) {
        console.error('Error reading badges after completion:', badgeError);
      }

      const beforeTypes = new Set((badgesBefore || []).map((b: any) => b.badge_type));
      const newBadges = (badgesAfter || []).filter((b: any) => !beforeTypes.has(b.badge_type));

      if (passed) {
        try {
          await generateCertificate(attemptId, userId);
        } catch (certificateError) {
          console.error('Error generating certificate after completion:', certificateError);
        }
      }

      const { data: answers } = await supabase
        .from('assessment_answers')
        .select('*')
        .eq('attempt_id', attemptId);

      return {
        attemptId,
        passed,
        score: resolvedScore,
        correctAnswers: resolvedCorrectAnswers,
        totalQuestions: resolvedTotalQuestions,
        timeTaken: totalTime,
        xpEarned,
        levelBefore,
        levelAfter,
        performanceLevel: getPerformanceLevel(resolvedScore),
        answers: answers || [],
        newBadges,
        medalTier: getMedalTier(resolvedScore),
        nextLevelLabel: passed && assessmentInfo.difficulty
          ? assessmentInfo.difficulty === 'beginner'
            ? 'Intermediário'
            : assessmentInfo.difficulty === 'intermediate'
              ? 'Especialista'
              : undefined
          : undefined,
        attemptsUsed: passed ? undefined : attemptsUsed,
        attemptsRemaining: passed ? MAX_ATTEMPTS_PER_WINDOW : attemptsRemaining,
        blockedUntil: passed ? undefined : blockedUntil
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  // Check and award badges
  const checkAndAwardBadges = useCallback(async (
    userId: string,
    assessmentId: string,
    score: number,
    correctAnswers: number,
    totalQuestions: number,
    assessmentInfo: { title: string; difficulty: string | null; tags: string[] | null; process_item_id: string | null }
  ) => {
    try {
      const { data: completedAttempts } = await supabase
        .from('assessment_attempts')
        .select('id, score, time_taken_seconds, completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (score === 100) {
        await awardBadge(userId, 'perfect_score');
      }

      const { data: attempts } = await supabase
        .from('assessment_attempts')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (attempts && attempts.length === 1) {
        await awardBadge(userId, 'first_assessment');
      }

      const { data: achievements } = await supabase
        .from('user_achievements')
        .select('current_level')
        .eq('user_id', userId)
        .single();

      if (achievements) {
        if (achievements.current_level >= 5) await awardBadge(userId, 'level_5');
        if (achievements.current_level >= 10) await awardBadge(userId, 'level_10');
        if (achievements.current_level >= 25) await awardBadge(userId, 'level_25');
      }

      const { data: latestAttempts } = await supabase
        .from('assessment_attempts')
        .select('score, time_taken_seconds')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      if (latestAttempts && latestAttempts.length >= 5) {
        const avgScore = latestAttempts.reduce((sum: number, row: any) => sum + (row.score || 0), 0) / latestAttempts.length;
        if (avgScore >= 75) await awardBadge(userId, 'consistent_learner');
      }

      const lastAttemptTime = latestAttempts?.[0]?.time_taken_seconds || 999999;
      const fastThresholdSeconds = totalQuestions * 20;
      if (lastAttemptTime <= fastThresholdSeconds) {
        await awardBadge(userId, 'speed_demon');
      }

      const { data: activeTemplates } = await supabase
        .from('badge_templates')
        .select('*')
        .eq('is_active', true);

      const completedCount = completedAttempts.length || 0;
      const { data: currentAchievement } = await supabase
        .from('user_achievements')
        .select('current_level')
        .eq('user_id', userId)
        .single();

      const currentLevel = currentAchievement.current_level || 1;
      const monthlyRanking = await fetchRanking('monthly', 'overall', 3);
      const monthlyRank = monthlyRanking.find((entry) => entry.user_id === userId).rank;

      for (const template of activeTemplates || []) {
        if (!template.template_key) continue;

        const scopeKey = normalizeForMatch(template.scope_key || 'all');
        if (scopeKey && scopeKey !== 'all') {
          const titleMatch = normalizeForMatch(assessmentInfo.title || '').includes(scopeKey);
          const tagsMatch = (assessmentInfo.tags || []).some((tag) => normalizeForMatch(tag).includes(scopeKey));
          if (!titleMatch && !tagsMatch) continue;
        }

        const threshold = Number(template.trigger_value || 0);
        let shouldAward = false;

        switch (template.trigger_type) {
          case 'manual':
            shouldAward = false;
            break;
          case 'first_pass':
            shouldAward = completedCount === 1;
            break;
          case 'perfect_score':
            shouldAward = score === 100;
            break;
          case 'minimum_score':
            shouldAward = score >= (threshold || 70);
            break;
          case 'minimum_attempts':
            shouldAward = completedCount >= Math.max(1, threshold || 1);
            break;
          case 'level_threshold':
            shouldAward = currentLevel >= Math.max(1, threshold || 1);
            break;
          case 'ranking_top':
            shouldAward = typeof monthlyRank === 'number' && monthlyRank > 0 && monthlyRank <= Math.max(1, threshold || 3);
            break;
          default:
            shouldAward = false;
        }

        if (shouldAward) {
          await awardBadge(userId, template.template_key);
        }
      }
    } catch (err) {
      console.error('Error checking badges:', err);
    }
  }, []);

  // Award badge
  const awardBadge = useCallback(async (userId: string, badgeType: string) => {
    try {
      const { BADGE_DEFINITIONS } = await import('../types/assessments');
      const { data: template } = await supabase
        .from('badge_templates')
        .select('*')
        .eq('template_key', badgeType)
        .maybeSingle();

      const badgeDef = BADGE_DEFINITIONS[badgeType as keyof typeof BADGE_DEFINITIONS];
      const badgeName = template.name || badgeDef.name || badgeType;
      const badgeDescription = template.description || badgeDef.description || 'Conquista desbloqueada';
      const badgeIcon = template.icon || badgeDef.icon || '🏅';
      const badgeImageUrl = template.icon_mode === 'image' ? template.icon_image_url || null : null;
      const badgeColor = template.color || badgeDef.color || '#6366f1';

      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_type', badgeType)
        .single();

      if (existing) return;

      await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_type: badgeType,
          badge_name: badgeName,
          badge_description: badgeDescription,
          badge_icon: badgeIcon,
          badge_image_url: badgeImageUrl,
          badge_color: badgeColor
        });
    } catch (err) {
      console.error('Error awarding badge:', err);
    }
  }, []);  // Fetch user achievements
  const fetchUserAchievements = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user badges
  const fetchUserBadges = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user attempts
  const fetchUserAttempts = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('assessment_attempts')
        .select('*, assessments(title, difficulty, passing_score, tags)')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate certificate
  const generateCertificate = useCallback(async (attemptId: string, userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get the attempt details
      const { data: attempt, error: attemptError } = await supabase
        .from('assessment_attempts')
        .select('*, assessments(title)')
        .eq('id', attemptId)
        .single();
      
      if (attemptError) throw attemptError;
      
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('tecno_users')
        .select('name')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;

      const { data: certificateTemplate } = await supabase
        .from('certificate_templates')
        .select('*')
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: existingCertificate, error: existingCertError } = await supabase
        .from('assessment_certificates')
        .select('*')
        .eq('attempt_id', attemptId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingCertError) throw existingCertError;
      if (existingCertificate) return existingCertificate;
      
      // Generate certificate number
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Create certificate record
      const { data: certificate, error: certError } = await supabase
        .from('assessment_certificates')
        .insert({
          attempt_id: attemptId,
          user_id: userId,
          user_name: user.name,
          assessment_id: attempt.assessment_id,
          assessment_title: attempt.assessments.title,
          certificate_number: certificateNumber,
          issued_at: new Date().toISOString(),
          score: attempt.score || 0,
          certificate_template_key: certificateTemplate.template_key || null,
          certificate_title: certificateTemplate.title || 'CERTIFICADO DE CONCLUSO',
          certificate_subtitle: certificateTemplate.subtitle || 'Reconhecimento oficial da trilha aprovada',
          certificate_accent_color: certificateTemplate.accent_color || '#f59e0b',
          certificate_background_color: certificateTemplate.background_color || '#0f172a',
          certificate_border_color: certificateTemplate.border_color || '#f59e0b',
          certificate_style: certificateTemplate.certificate_style || 'premium',
          certificate_paper_type: certificateTemplate.paper_type || certificateTemplate.certificate_style || 'premium',
          certificate_paper_orientation: certificateTemplate.paper_orientation || 'landscape',
          certificate_logo_url: certificateTemplate.logo_image_url || null,
          certificate_watermark_url: certificateTemplate.watermark_image_url || null,
          issuer_name: certificateTemplate.issuer_name || 'Tecno Mapper',
          certificate_footer_text: certificateTemplate.footer_text || 'Documento emitido automaticamente após aprovação da avaliação.'
        })
        .select()
        .single();
      
      if (certError) throw certError;
      
      return certificate;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user certificates
  const fetchUserCertificates = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('assessment_certificates')
        .select('*')
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch ranking
  const fetchRanking = useCallback(async (
    period: RankingPeriod = 'all_time',
    category: RankingCategory = 'overall',
    limit: number = 10
  ): Promise<RankingEntry[]> => {
    setLoading(true);
    setError(null);
    
    try {
      void category;
      const { data: attempts, error } = await supabase
        .from('assessment_attempts')
        .select('user_id, score, xp_earned, time_taken_seconds, completed_at')
        .not('score', 'is', null);

      if (error) throw error;

      const userIds = Array.from(new Set((attempts || []).map((attempt: any) => attempt.user_id).filter(Boolean)));
      const usersById = new Map<string, { name: string; department: string }>();
      if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
          .from('tecno_users')
          .select('id, name, department')
          .in('id', userIds);

        if (!usersError) {
          (users || []).forEach((user: any) => {
            usersById.set(user.id, { name: user.name, department: user.department });
          });
        }
      }

      const grouped = new Map<string, {
        user_id: string;
        user_name: string;
        user_department: string;
        total_xp: number;
        current_level: number;
        total_assessments_completed: number;
        score_sum: number;
      }>();

      (attempts || [])
        .filter((attempt: any) => attempt.user_id && isWithinPeriod(attempt.completed_at, period))
        .forEach((attempt: any) => {
          const xp = attempt.xp_earned || Math.round((attempt.score || 0) * 10);
          const user = usersById.get(attempt.user_id);
          const current = grouped.get(attempt.user_id) || {
            user_id: attempt.user_id,
            user_name: user?.name || 'Operador',
            user_department: user?.department || '',
            total_xp: 0,
            current_level: 1,
            total_assessments_completed: 0,
            score_sum: 0,
          };

          current.total_xp += xp;
          current.total_assessments_completed += 1;
          current.score_sum += attempt.score || 0;
          current.current_level = Math.max(1, Math.floor(Math.sqrt(current.total_xp / 100)));
          grouped.set(attempt.user_id, current);
        });

      return Array.from(grouped.values())
        .map((entry) => ({
          user_id: entry.user_id,
          user_name: entry.user_name,
          user_department: entry.user_department,
          total_xp: entry.total_xp,
          current_level: entry.current_level,
          total_assessments_completed: entry.total_assessments_completed,
          average_score: entry.total_assessments_completed > 0 ? Math.round(entry.score_sum / entry.total_assessments_completed) : 0,
          rank: 0,
        }))
        .sort((a, b) => b.total_xp - a.total_xp || b.average_score - a.average_score)
        .slice(0, limit)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch assessment analytics
  const fetchAssessmentAnalytics = useCallback(async (assessmentId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('assessment_analytics')
        .select('*')
        .eq('assessment_id', assessmentId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const importEducationalAssessments = useCallback(async (
    userId: string,
    options: { processItemId: string; processTitle: string; publish: boolean }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data: existingAssessments, error: existingError } = await supabase
        .from('assessments')
        .select('title, process_item_id');

      if (existingError) throw existingError;

      const existingLookup = new Set(
        (existingAssessments || []).map((item: any) => `${normalizeForMatch(item.title)}::${item.process_item_id || 'global'}`)
      );

      const { data: processItems, error: processError } = await supabase
        .from('process_items')
        .select('id, title');

      if (processError) throw processError;

      const bundles = buildEducationalAssessmentBundles(options.processTitle);
      const created: Array<{ title: string; process_item_id: string | null }> = [];
      const skipped: string[] = [];

      for (const bundle of bundles) {
        const theme = EDUCATIONAL_THEMES.find((item) => item.key === bundle.themeKey);
        if (!theme) continue;

        let processItemId = options.processItemId || null;
        if (!processItemId) {
          const matchedProcess = (processItems || []).find((item: any) =>
            theme.processTitleMatchers.some((matcher) => normalizeForMatch(item.title).includes(normalizeForMatch(matcher)))
          );
          processItemId = matchedProcess.id || null;
        }

        if (options.processItemId && processItemId !== options.processItemId) {
          continue;
        }

        const assessmentForm: AssessmentFormData = {
          ...bundle.form,
          process_item_id: processItemId || undefined,
          tags: bundle.form.tags,
        };

        const lookupKey = `${normalizeForMatch(assessmentForm.title)}::${processItemId || 'global'}`;
        if (existingLookup.has(lookupKey)) {
          skipped.push(assessmentForm.title);
          continue;
        }

        const { data: assessmentData, error: bundleError } = await supabase.rpc('create_assessment_bundle_admin', {
          p_assessment: {
            title: assessmentForm.title,
            description: assessmentForm.description || null,
            process_item_id: assessmentForm.process_item_id || null,
            question_count: assessmentForm.question_count,
            difficulty: assessmentForm.difficulty,
            time_limit_seconds: assessmentForm.time_limit_seconds ?? null,
            passing_score: assessmentForm.passing_score,
            is_mandatory: assessmentForm.is_mandatory,
            tags: assessmentForm.tags || [],
            xp_reward: assessmentForm.xp_reward || 100,
            created_by: userId,
            is_published: options.publish ?? true,
          },
          p_questions: bundle.questions.map((question) => ({
            question_text: question.question_text,
            option_a: question.option_a,
            option_b: question.option_b,
            option_c: question.option_c,
            option_d: question.option_d,
            correct_option: question.correct_option,
            weight: question.weight || 1,
            explanation: question.explanation || null,
            image_url: question.image_url || null,
            time_limit_seconds: question.time_limit_seconds ?? null,
            related_node_id: question.related_node_id || null,
          })),
        });

        if (bundleError) {
          if (isMissingRpcFunctionError(bundleError)) {
            throw new Error('Função create_assessment_bundle_admin indisponível. Aplique a migração 20260523134500_create_assessment_bundle_admin.sql.');
          }
          throw bundleError;
        }

        const assessment = assessmentData as Assessment;

        created.push({ title: assessment.title, process_item_id: assessment.process_item_id });
        existingLookup.add(lookupKey);
      }

      return { created, skipped };
    } catch (err: any) {
      const message = formatSupabaseError(err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);
  // Publish assessment
  const publishAssessment = useCallback(async (id: string, isPublished: boolean = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('assessments')
        .update({ is_published: isPublished })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Data
    assessments,
    loading,
    error,
    
    // Assessment operations
    fetchAssessments,
    fetchAssessmentById,
    createAssessment,
    updateAssessment,
    deleteAssessment,
    publishAssessment,
    importEducationalAssessments,
    
    // Question operations
    fetchQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    
    // Attempt operations
    checkAssessmentAccess,
    startAttempt,
    submitAnswer,
    completeAttempt,
    fetchUserAttempts,
    
    // Gamification operations
    fetchUserAchievements,
    fetchUserBadges,
    fetchRanking,
    generateCertificate,
    fetchUserCertificates,
    
    // Analytics
    fetchAssessmentAnalytics
  };
}




