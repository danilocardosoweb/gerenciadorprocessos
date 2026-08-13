-- Migration: Add Assessment Module Tables
-- Description: Creates tables for assessments, questions, attempts, answers, achievements, badges, certificates, and analytics

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Assessments Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  process_item_id UUID REFERENCES process_items(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(50) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  question_count INTEGER DEFAULT 10 CHECK (question_count IN (10, 20)),
  time_limit_seconds INTEGER,
  passing_score INTEGER DEFAULT 70,
  xp_reward INTEGER DEFAULT 100,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES tecno_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_assessments_process_item ON assessments(process_item_id);
CREATE INDEX idx_assessments_created_by ON assessments(created_by);
CREATE INDEX idx_assessments_is_published ON assessments(is_published);

-- ─── Assessment Questions Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a VARCHAR(500) NOT NULL,
  option_b VARCHAR(500) NOT NULL,
  option_c VARCHAR(500) NOT NULL,
  option_d VARCHAR(500) NOT NULL,
  correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  difficulty VARCHAR(50) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  category VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);
CREATE INDEX idx_assessment_questions_order ON assessment_questions(assessment_id, order_index);

-- ─── Assessment Attempts Table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES tecno_users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  correct_answers INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  time_taken_seconds INTEGER,
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_assessment_attempts_assessment_id ON assessment_attempts(assessment_id);
CREATE INDEX idx_assessment_attempts_user_id ON assessment_attempts(user_id);
CREATE INDEX idx_assessment_attempts_status ON assessment_attempts(status);
CREATE INDEX idx_assessment_attempts_completed_at ON assessment_attempts(completed_at);

-- ─── Assessment Answers Table ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES assessment_questions(id) ON DELETE CASCADE,
  selected_option VARCHAR(1) CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN DEFAULT false,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_assessment_answers_attempt_id ON assessment_answers(attempt_id);
CREATE INDEX idx_assessment_answers_question_id ON assessment_answers(question_id);

-- ─── User Achievements Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES tecno_users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  total_assessments_completed INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_total_xp ON user_achievements(total_xp DESC);

-- ─── User Badges Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES tecno_users(id) ON DELETE CASCADE,
  badge_type VARCHAR(100) NOT NULL,
  badge_name VARCHAR(255) NOT NULL,
  badge_description TEXT,
  badge_icon VARCHAR(100),
  badge_color VARCHAR(50) DEFAULT '#6366f1',
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- Create index for faster queries
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- ─── Assessment Certificates Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES tecno_users(id) ON DELETE CASCADE,
  user_name VARCHAR(255),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  assessment_title VARCHAR(255),
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  score INTEGER NOT NULL,
  pdf_url TEXT
);

-- Create index for faster queries
CREATE INDEX idx_assessment_certificates_user_id ON assessment_certificates(user_id);
CREATE INDEX idx_assessment_certificates_certificate_number ON assessment_certificates(certificate_number);

-- ─── Assessment Analytics Table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE UNIQUE,
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  pass_rate DECIMAL(5,2) DEFAULT 0,
  average_time_seconds INTEGER DEFAULT 0,
  most_failed_question_id UUID,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_assessment_analytics_assessment_id ON assessment_analytics(assessment_id);

-- ─── Row Level Security (RLS) Policies ─────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_analytics ENABLE ROW LEVEL SECURITY;

-- Assessments RLS Policies
CREATE POLICY "Anyone can view published assessments"
  ON assessments FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can view assessments they created"
  ON assessments FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Gerente+ can create assessments"
  ON assessments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tecno_users 
      WHERE id = auth.uid() AND role IN ('Gerente', 'Administrador')
    )
  );

CREATE POLICY "Gerente+ can update assessments"
  ON assessments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tecno_users 
      WHERE id = auth.uid() AND role IN ('Gerente', 'Administrador')
    )
  );

CREATE POLICY "Administrador can delete assessments"
  ON assessments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tecno_users 
      WHERE id = auth.uid() AND role = 'Administrador'
    )
  );

-- Assessment Questions RLS Policies
CREATE POLICY "Anyone can view questions for published assessments"
  ON assessment_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE id = assessment_id AND is_published = true
    )
  );

CREATE POLICY "Gerente+ can manage questions"
  ON assessment_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM tecno_users 
      WHERE id = auth.uid() AND role IN ('Gerente', 'Administrador')
    )
  );

-- Assessment Attempts RLS Policies
CREATE POLICY "Users can view their own attempts"
  ON assessment_attempts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Gerente+ can view all attempts"
  ON assessment_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tecno_users 
      WHERE id = auth.uid() AND role IN ('Gerente', 'Administrador')
    )
  );

CREATE POLICY "Users can create their own attempts"
  ON assessment_attempts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own attempts"
  ON assessment_attempts FOR UPDATE
  USING (user_id = auth.uid());

-- Assessment Answers RLS Policies
CREATE POLICY "Users can view their own answers"
  ON assessment_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessment_attempts 
      WHERE id = attempt_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Gerente+ can view all answers"
  ON assessment_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tecno_users 
      WHERE id = auth.uid() AND role IN ('Gerente', 'Administrador')
    )
  );

CREATE POLICY "Users can create their own answers"
  ON assessment_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessment_attempts 
      WHERE id = attempt_id AND user_id = auth.uid()
    )
  );

-- User Achievements RLS Policies
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Gerente+ can view all achievements"
  ON user_achievements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tecno_users 
      WHERE id = auth.uid() AND role IN ('Gerente', 'Administrador')
    )
  );

CREATE POLICY "System can update achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update achievements"
  ON user_achievements FOR UPDATE
  USING (true);

-- User Badges RLS Policies
CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Gerente+ can view all badges"
  ON user_badges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tecno_users 
      WHERE id = auth.uid() AND role IN ('Gerente', 'Administrador')
    )
  );

CREATE POLICY "System can award badges"
  ON user_badges FOR INSERT
  WITH CHECK (true);

-- Assessment Certificates RLS Policies
CREATE POLICY "Users can view their own certificates"
  ON assessment_certificates FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Gerente+ can view all certificates"
  ON assessment_certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tecno_users 
      WHERE id = auth.uid() AND role IN ('Gerente', 'Administrador')
    )
  );

CREATE POLICY "System can generate certificates"
  ON assessment_certificates FOR INSERT
  WITH CHECK (true);

-- Assessment Analytics RLS Policies
CREATE POLICY "Gerente+ can view analytics"
  ON assessment_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tecno_users 
      WHERE id = auth.uid() AND role IN ('Gerente', 'Administrador')
    )
  );

CREATE POLICY "System can update analytics"
  ON assessment_analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update analytics"
  ON assessment_analytics FOR UPDATE
  USING (true);

-- ─── Helper Functions ────────────────────────────────────────────────────────

-- Function to calculate XP needed for a level
CREATE OR REPLACE FUNCTION calculate_xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN level * level * 100;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  level INTEGER := 1;
BEGIN
  WHILE xp >= calculate_xp_for_level(level + 1) LOOP
    level := level + 1;
  END LOOP;
  RETURN level;
END;
$$ LANGUAGE plpgsql;

-- Function to update user achievements
CREATE OR REPLACE FUNCTION update_user_achievements(user_uuid UUID, xp_add INTEGER, completed BOOLEAN, correct BOOLEAN)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_achievements (user_id, total_xp, current_level, total_assessments_completed, total_questions_answered, total_correct_answers, last_activity_date)
  VALUES (user_uuid, xp_add, calculate_level_from_xp(xp_add), 
          CASE WHEN completed THEN 1 ELSE 0 END,
          1,
          CASE WHEN correct THEN 1 ELSE 0 END,
          CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = user_achievements.total_xp + xp_add,
    current_level = calculate_level_from_xp(user_achievements.total_xp + xp_add),
    total_assessments_completed = user_achievements.total_assessments_completed + CASE WHEN completed THEN 1 ELSE 0 END,
    total_questions_answered = user_achievements.total_questions_answered + 1,
    total_correct_answers = user_achievements.total_correct_answers + CASE WHEN correct THEN 1 ELSE 0 END,
    last_activity_date = CURRENT_DATE,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update assessment analytics
CREATE OR REPLACE FUNCTION update_assessment_analytics(assessment_uuid UUID)
RETURNS VOID AS $$
DECLARE
  avg_score DECIMAL(5,2);
  pass_rate DECIMAL(5,2);
  avg_time INTEGER;
  total_attempts INTEGER;
BEGIN
  SELECT 
    AVG(score)::DECIMAL(5,2),
    AVG(CASE WHEN score >= 70 THEN 100 ELSE 0 END)::DECIMAL(5,2),
    AVG(time_taken_seconds),
    COUNT(*)
  INTO avg_score, pass_rate, avg_time, total_attempts
  FROM assessment_attempts
  WHERE assessment_id = assessment_uuid AND status = 'completed';
  
  INSERT INTO assessment_analytics (assessment_id, total_attempts, average_score, pass_rate, average_time_seconds, last_updated)
  VALUES (assessment_uuid, total_attempts, COALESCE(avg_score, 0), COALESCE(pass_rate, 0), COALESCE(avg_time, 0), NOW())
  ON CONFLICT (assessment_id) DO UPDATE SET
    total_attempts = total_attempts,
    average_score = COALESCE(avg_score, 0),
    pass_rate = COALESCE(pass_rate, 0),
    average_time_seconds = COALESCE(avg_time, 0),
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics when attempt is completed
CREATE OR REPLACE FUNCTION trigger_update_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    PERFORM update_assessment_analytics(NEW.assessment_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_attempt_completed
  AFTER UPDATE ON assessment_attempts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_analytics();
