-- The application authenticates users through tecno_users (custom login),
-- not through Supabase Auth sessions. Because of that, auth.uid() policies
-- block create/update operations from the browser.
-- This migration aligns assessment tables with the current app auth model.

ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_attempts DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_analytics DISABLE ROW LEVEL SECURITY;
