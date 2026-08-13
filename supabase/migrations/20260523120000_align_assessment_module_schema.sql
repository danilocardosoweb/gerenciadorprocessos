-- Align assessment tables with the React assessment/gamification module.
-- Safe to run after the original assessment migration.

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

ALTER TABLE assessment_questions
  ADD COLUMN IF NOT EXISTS correct_option VARCHAR(1) CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS time_limit_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS related_node_id TEXT;

UPDATE assessment_questions
SET correct_option = COALESCE(correct_option, correct_answer, 'A')
WHERE correct_option IS NULL;

ALTER TABLE assessment_questions
  ALTER COLUMN correct_option SET DEFAULT 'A',
  ALTER COLUMN correct_option SET NOT NULL;

ALTER TABLE assessment_answers
  ADD COLUMN IF NOT EXISTS time_taken_seconds INTEGER;

ALTER TABLE assessment_attempts
  ADD COLUMN IF NOT EXISTS level_before INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS level_after INTEGER DEFAULT 1;

CREATE OR REPLACE FUNCTION sync_assessment_question_answer()
RETURNS TRIGGER AS $$
BEGIN
  NEW.correct_option := COALESCE(NEW.correct_option, NEW.correct_answer, 'A');
  NEW.correct_answer := COALESCE(NEW.correct_answer, NEW.correct_option, 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_assessment_question_answer ON assessment_questions;
CREATE TRIGGER trg_sync_assessment_question_answer
  BEFORE INSERT OR UPDATE ON assessment_questions
  FOR EACH ROW
  EXECUTE FUNCTION sync_assessment_question_answer();
