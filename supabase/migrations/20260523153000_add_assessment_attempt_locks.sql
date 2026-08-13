-- Assessment attempt locks
-- Stores temporary blocks when a user exhausts attempts on a given assessment.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

ALTER TABLE assessment_attempt_locks DISABLE ROW LEVEL SECURITY;
