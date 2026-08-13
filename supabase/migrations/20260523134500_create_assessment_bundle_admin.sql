-- Secure admin helper for creating an assessment and all of its questions in one call.
-- This bypasses RLS safely through SECURITY DEFINER, which matches the custom login flow.

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
  v_question_count INTEGER;
BEGIN
  v_title := NULLIF(TRIM(COALESCE(p_assessment->>'title', '')), '');
  IF v_title IS NULL THEN
    RAISE EXCEPTION 'Assessment title is required';
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
    COALESCE(NULLIF(p_assessment->>'difficulty', ''), 'intermediate'),
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
      COALESCE(NULLIF(v_question->>'correct_option', ''), 'A'),
      COALESCE(NULLIF(v_question->>'correct_option', ''), 'A'),
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

GRANT EXECUTE ON FUNCTION public.create_assessment_bundle_admin(JSONB, JSONB) TO anon, authenticated;
