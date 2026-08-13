-- Assessment integration repair script.
-- Safe to run after the original assessment tables migration.
-- It completes the pieces used by the React assessment/gamification flow.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Columns expected by the app.
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 100;

ALTER TABLE assessment_questions
  ADD COLUMN IF NOT EXISTS correct_answer VARCHAR(1),
  ADD COLUMN IF NOT EXISTS correct_option VARCHAR(1),
  ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS related_node_id TEXT;

UPDATE assessment_questions
SET correct_answer = COALESCE(correct_answer, correct_option, 'A')
WHERE correct_answer IS NULL;

UPDATE assessment_questions
SET correct_option = COALESCE(correct_option, correct_answer, 'A')
WHERE correct_option IS NULL;

ALTER TABLE assessment_questions
  ALTER COLUMN correct_answer SET DEFAULT 'A',
  ALTER COLUMN correct_answer SET NOT NULL,
  ALTER COLUMN correct_option SET DEFAULT 'A',
  ALTER COLUMN correct_option SET NOT NULL;

ALTER TABLE assessment_answers
  ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;

ALTER TABLE assessment_attempts
  ADD COLUMN IF NOT EXISTS level_before INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS level_after INTEGER DEFAULT 1;

-- Difficulty constraints compatible with the generated educational catalog.
ALTER TABLE assessments
  DROP CONSTRAINT IF EXISTS assessments_difficulty_check;

ALTER TABLE assessments
  ADD CONSTRAINT assessments_difficulty_check
  CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert'));

ALTER TABLE assessment_questions
  DROP CONSTRAINT IF EXISTS assessment_questions_correct_answer_check,
  DROP CONSTRAINT IF EXISTS assessment_questions_correct_option_check;

ALTER TABLE assessment_questions
  ADD CONSTRAINT assessment_questions_correct_answer_check
  CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  ADD CONSTRAINT assessment_questions_correct_option_check
  CHECK (correct_option IN ('A', 'B', 'C', 'D'));

-- Temporary attempt locks after 3 failed tries.
CREATE TABLE IF NOT EXISTS assessment_attempt_locks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES tecno_users(id) ON DELETE CASCADE,
  blocked_until TIMESTAMP WITH TIME ZONE,
  last_failed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (assessment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_attempt_locks_user_id ON assessment_attempt_locks(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempt_locks_assessment_id ON assessment_attempt_locks(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempt_locks_blocked_until ON assessment_attempt_locks(blocked_until);

-- The app uses a custom tecno_users login, so auth.uid() based RLS blocks inserts/updates.
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempt_locks DISABLE ROW LEVEL SECURITY;

-- Keep both column names synchronized for old and new code paths.
CREATE OR REPLACE FUNCTION public.sync_assessment_question_answer()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.correct_option := COALESCE(NEW.correct_option, NEW.correct_answer, 'A');
  NEW.correct_answer := COALESCE(NEW.correct_answer, NEW.correct_option, 'A');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_assessment_question_answer ON assessment_questions;
CREATE TRIGGER trg_sync_assessment_question_answer
  BEFORE INSERT OR UPDATE ON assessment_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_assessment_question_answer();

-- Admin helper for creating an assessment.
CREATE OR REPLACE FUNCTION public.create_assessment_admin(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_process_item_id UUID DEFAULT NULL,
  p_question_count INTEGER DEFAULT 10,
  p_difficulty TEXT DEFAULT 'intermediate',
  p_time_limit_seconds INTEGER DEFAULT NULL,
  p_passing_score INTEGER DEFAULT 70,
  p_is_mandatory BOOLEAN DEFAULT false,
  p_tags TEXT[] DEFAULT '{}',
  p_xp_reward INTEGER DEFAULT 100,
  p_created_by UUID DEFAULT NULL
)
RETURNS assessments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assessment assessments;
  v_difficulty TEXT;
BEGIN
  v_difficulty := LOWER(COALESCE(NULLIF(TRIM(p_difficulty), ''), 'intermediate'));
  IF v_difficulty NOT IN ('beginner', 'intermediate', 'advanced', 'expert') THEN
    v_difficulty := 'intermediate';
  END IF;

  INSERT INTO assessments (
    title,
    description,
    process_item_id,
    question_count,
    difficulty,
    time_limit_seconds,
    passing_score,
    is_mandatory,
    tags,
    xp_reward,
    created_by
  )
  VALUES (
    NULLIF(TRIM(p_title), ''),
    NULLIF(TRIM(COALESCE(p_description, '')), ''),
    p_process_item_id,
    COALESCE(p_question_count, 10),
    v_difficulty,
    p_time_limit_seconds,
    COALESCE(p_passing_score, 70),
    COALESCE(p_is_mandatory, false),
    COALESCE(p_tags, '{}'),
    COALESCE(p_xp_reward, 100),
    p_created_by
  )
  RETURNING * INTO v_assessment;

  RETURN v_assessment;
END;
$$;

-- Admin helper for creating a question.
CREATE OR REPLACE FUNCTION public.create_assessment_question_admin(
  p_assessment_id UUID,
  p_question_text TEXT,
  p_option_a TEXT,
  p_option_b TEXT,
  p_option_c TEXT,
  p_option_d TEXT,
  p_correct_answer VARCHAR,
  p_weight INTEGER DEFAULT 1,
  p_explanation TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_time_limit_seconds INTEGER DEFAULT NULL,
  p_related_node_id TEXT DEFAULT NULL,
  p_order_index INTEGER DEFAULT 0
)
RETURNS assessment_questions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_question assessment_questions;
  v_correct VARCHAR(1);
BEGIN
  v_correct := UPPER(COALESCE(NULLIF(TRIM(p_correct_answer), ''), 'A'));
  IF v_correct NOT IN ('A', 'B', 'C', 'D') THEN
    v_correct := 'A';
  END IF;

  INSERT INTO assessment_questions (
    assessment_id,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    correct_option,
    weight,
    explanation,
    image_url,
    time_limit_seconds,
    related_node_id,
    order_index
  )
  VALUES (
    p_assessment_id,
    COALESCE(NULLIF(TRIM(p_question_text), ''), 'Pergunta sem texto'),
    COALESCE(p_option_a, ''),
    COALESCE(p_option_b, ''),
    COALESCE(p_option_c, ''),
    COALESCE(p_option_d, ''),
    v_correct,
    v_correct,
    COALESCE(p_weight, 1),
    NULLIF(TRIM(COALESCE(p_explanation, '')), ''),
    NULLIF(TRIM(COALESCE(p_image_url, '')), ''),
    p_time_limit_seconds,
    NULLIF(TRIM(COALESCE(p_related_node_id, '')), ''),
    COALESCE(p_order_index, 0)
  )
  RETURNING * INTO v_question;

  RETURN v_question;
END;
$$;

-- Admin helper for creating an assessment and all questions in one call.
CREATE OR REPLACE FUNCTION public.create_assessment_bundle_admin(
  p_assessment JSONB,
  p_questions JSONB DEFAULT '[]'::jsonb
)
RETURNS assessments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assessment assessments;
  v_question JSONB;
  v_tags TEXT[];
  v_title TEXT;
  v_difficulty TEXT;
  v_question_count INTEGER;
  v_correct VARCHAR(1);
BEGIN
  v_title := NULLIF(TRIM(COALESCE(p_assessment->>'title', '')), '');
  IF v_title IS NULL THEN
    RAISE EXCEPTION 'Assessment title is required';
  END IF;

  v_difficulty := LOWER(COALESCE(NULLIF(TRIM(COALESCE(p_assessment->>'difficulty', '')), ''), 'intermediate'));
  IF v_difficulty NOT IN ('beginner', 'intermediate', 'advanced', 'expert') THEN
    v_difficulty := 'intermediate';
  END IF;

  v_tags := COALESCE(
    ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(p_assessment->'tags', '[]'::jsonb))
    ),
    '{}'
  );

  v_question_count := COALESCE(NULLIF(p_assessment->>'question_count', '')::INTEGER, 10);

  INSERT INTO assessments (
    title,
    description,
    process_item_id,
    question_count,
    difficulty,
    time_limit_seconds,
    passing_score,
    is_mandatory,
    tags,
    xp_reward,
    created_by,
    is_published
  )
  VALUES (
    v_title,
    NULLIF(TRIM(COALESCE(p_assessment->>'description', '')), ''),
    NULLIF(TRIM(COALESCE(p_assessment->>'process_item_id', '')), '')::UUID,
    v_question_count,
    v_difficulty,
    NULLIF(p_assessment->>'time_limit_seconds', '')::INTEGER,
    COALESCE(NULLIF(p_assessment->>'passing_score', '')::INTEGER, 70),
    COALESCE(NULLIF(p_assessment->>'is_mandatory', '')::BOOLEAN, false),
    v_tags,
    COALESCE(NULLIF(p_assessment->>'xp_reward', '')::INTEGER, 100),
    NULLIF(TRIM(COALESCE(p_assessment->>'created_by', '')), '')::UUID,
    COALESCE(NULLIF(p_assessment->>'is_published', '')::BOOLEAN, false)
  )
  RETURNING * INTO v_assessment;

  FOR v_question IN SELECT * FROM jsonb_array_elements(COALESCE(p_questions, '[]'::jsonb))
  LOOP
    v_correct := UPPER(COALESCE(NULLIF(v_question->>'correct_option', ''), NULLIF(v_question->>'correct_answer', ''), 'A'));
    IF v_correct NOT IN ('A', 'B', 'C', 'D') THEN
      v_correct := 'A';
    END IF;

    INSERT INTO assessment_questions (
      assessment_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      correct_option,
      weight,
      explanation,
      image_url,
      time_limit_seconds,
      related_node_id,
      order_index
    )
    VALUES (
      v_assessment.id,
      COALESCE(NULLIF(TRIM(COALESCE(v_question->>'question_text', '')), ''), 'Pergunta sem texto'),
      COALESCE(v_question->>'option_a', ''),
      COALESCE(v_question->>'option_b', ''),
      COALESCE(v_question->>'option_c', ''),
      COALESCE(v_question->>'option_d', ''),
      v_correct,
      v_correct,
      COALESCE(NULLIF(v_question->>'weight', '')::INTEGER, 1),
      NULLIF(TRIM(COALESCE(v_question->>'explanation', '')), ''),
      NULLIF(TRIM(COALESCE(v_question->>'image_url', '')), ''),
      NULLIF(v_question->>'time_limit_seconds', '')::INTEGER,
      NULLIF(TRIM(COALESCE(v_question->>'related_node_id', '')), ''),
      COALESCE(NULLIF(v_question->>'order_index', '')::INTEGER, 0)
    );
  END LOOP;

  RETURN v_assessment;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_assessment_admin(
  TEXT, TEXT, UUID, INTEGER, TEXT, INTEGER, INTEGER, BOOLEAN, TEXT[], INTEGER, UUID
) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_assessment_question_admin(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, VARCHAR, INTEGER, TEXT, TEXT, INTEGER, TEXT, INTEGER
) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_assessment_bundle_admin(JSONB, JSONB) TO anon, authenticated;
