-- RPC helpers for the custom login flow used by the app.
-- They bypass RLS safely for admin-controlled assessment creation.

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
BEGIN
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
    p_title,
    p_description,
    p_process_item_id,
    p_question_count,
    p_difficulty,
    p_time_limit_seconds,
    p_passing_score,
    p_is_mandatory,
    COALESCE(p_tags, '{}'),
    p_xp_reward,
    p_created_by
  )
  RETURNING * INTO v_assessment;

  RETURN v_assessment;
END;
$$;

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
BEGIN
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
    p_question_text,
    p_option_a,
    p_option_b,
    p_option_c,
    p_option_d,
    p_correct_answer,
    p_correct_answer,
    COALESCE(p_weight, 1),
    p_explanation,
    p_image_url,
    p_time_limit_seconds,
    p_related_node_id,
    p_order_index
  )
  RETURNING * INTO v_question;

  RETURN v_question;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_assessment_admin(
  TEXT, TEXT, UUID, INTEGER, TEXT, INTEGER, INTEGER, BOOLEAN, TEXT[], INTEGER, UUID
) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_assessment_question_admin(
  UUID, TEXT, TEXT, TEXT, TEXT, TEXT, VARCHAR, INTEGER, TEXT, TEXT, INTEGER, TEXT, INTEGER
) TO anon, authenticated;
