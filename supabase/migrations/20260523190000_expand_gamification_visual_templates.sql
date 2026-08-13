-- Expand gamification templates with visual assets and paper options
-- Safe to run after the initial gamification catalog migration.

ALTER TABLE badge_templates
  ADD COLUMN IF NOT EXISTS icon_mode VARCHAR(20) DEFAULT 'emoji',
  ADD COLUMN IF NOT EXISTS icon_image_url TEXT,
  ADD COLUMN IF NOT EXISTS badge_shape VARCHAR(20) DEFAULT 'medal';

ALTER TABLE user_badges
  ADD COLUMN IF NOT EXISTS badge_image_url TEXT;

ALTER TABLE certificate_templates
  ADD COLUMN IF NOT EXISTS paper_type VARCHAR(50) DEFAULT 'premium',
  ADD COLUMN IF NOT EXISTS paper_orientation VARCHAR(20) DEFAULT 'landscape',
  ADD COLUMN IF NOT EXISTS logo_image_url TEXT,
  ADD COLUMN IF NOT EXISTS watermark_image_url TEXT;

ALTER TABLE assessment_certificates
  ADD COLUMN IF NOT EXISTS certificate_paper_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS certificate_paper_orientation VARCHAR(20),
  ADD COLUMN IF NOT EXISTS certificate_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS certificate_watermark_url TEXT;

UPDATE badge_templates
SET icon_mode = COALESCE(icon_mode, 'emoji'),
    badge_shape = COALESCE(badge_shape, 'medal');

UPDATE certificate_templates
SET paper_type = COALESCE(paper_type, certificate_style, 'premium'),
    paper_orientation = COALESCE(paper_orientation, 'landscape');

-- Keep row level security relaxed for the local admin-managed catalog.
ALTER TABLE badge_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_templates DISABLE ROW LEVEL SECURITY;
