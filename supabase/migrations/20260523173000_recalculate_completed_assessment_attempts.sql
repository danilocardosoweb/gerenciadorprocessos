-- Recalculate completed assessment attempts from saved answers.
-- Use this once after fixing the quiz scoring flow to repair attempts saved as 0%.

WITH answer_totals AS (
  SELECT
    attempt_id,
    COUNT(*)::INTEGER AS total_questions,
    COUNT(*) FILTER (WHERE is_correct = true)::INTEGER AS correct_answers
  FROM assessment_answers
  GROUP BY attempt_id
),
calculated AS (
  SELECT
    aa.attempt_id,
    aa.total_questions,
    aa.correct_answers,
    CASE
      WHEN aa.total_questions > 0 THEN ROUND((aa.correct_answers::NUMERIC / aa.total_questions::NUMERIC) * 100)::INTEGER
      ELSE 0
    END AS score,
    ROUND((aa.correct_answers * 10) + CASE
      WHEN aa.total_questions > 0 THEN (aa.correct_answers::NUMERIC / aa.total_questions::NUMERIC) * 20
      ELSE 0
    END)::INTEGER AS xp_earned
  FROM answer_totals aa
)
UPDATE assessment_attempts attempt
SET
  correct_answers = calculated.correct_answers,
  total_questions = calculated.total_questions,
  score = calculated.score,
  xp_earned = calculated.xp_earned,
  status = 'completed',
  completed_at = COALESCE(attempt.completed_at, NOW())
FROM calculated
WHERE attempt.id = calculated.attempt_id
  AND calculated.total_questions > 0
  AND (
    COALESCE(attempt.score, 0) = 0
    OR COALESCE(attempt.correct_answers, 0) <> calculated.correct_answers
    OR COALESCE(attempt.total_questions, 0) <> calculated.total_questions
  );
