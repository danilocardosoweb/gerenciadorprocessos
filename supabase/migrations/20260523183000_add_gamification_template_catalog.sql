-- Gamification template catalog
-- Adds admin-managed templates for badges and certificates with a professional default set.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS badge_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100) DEFAULT '🏅',
  color VARCHAR(50) DEFAULT '#6366f1',
  category VARCHAR(100) DEFAULT 'performance',
  trigger_type VARCHAR(50) NOT NULL DEFAULT 'manual',
  trigger_value NUMERIC(10,2),
  scope_key VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES tecno_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT badge_templates_trigger_type_check CHECK (
    trigger_type IN (
      'manual',
      'first_pass',
      'perfect_score',
      'minimum_score',
      'minimum_attempts',
      'level_threshold',
      'ranking_top'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_badge_templates_active ON badge_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_badge_templates_default ON badge_templates(is_default);

CREATE TABLE IF NOT EXISTS certificate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  accent_color VARCHAR(50) DEFAULT '#f59e0b',
  background_color VARCHAR(50) DEFAULT '#0f172a',
  border_color VARCHAR(50) DEFAULT '#f59e0b',
  issuer_name VARCHAR(255) DEFAULT 'Tecno Mapper',
  footer_text TEXT,
  certificate_style VARCHAR(50) DEFAULT 'premium',
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES tecno_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT certificate_templates_style_check CHECK (certificate_style IN ('premium', 'minimal', 'corporate'))
);

CREATE INDEX IF NOT EXISTS idx_certificate_templates_active ON certificate_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_certificate_templates_default ON certificate_templates(is_default);

ALTER TABLE assessment_certificates
  ADD COLUMN IF NOT EXISTS certificate_template_key VARCHAR(100),
  ADD COLUMN IF NOT EXISTS certificate_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS certificate_subtitle TEXT,
  ADD COLUMN IF NOT EXISTS certificate_accent_color VARCHAR(50),
  ADD COLUMN IF NOT EXISTS certificate_background_color VARCHAR(50),
  ADD COLUMN IF NOT EXISTS certificate_border_color VARCHAR(50),
  ADD COLUMN IF NOT EXISTS certificate_style VARCHAR(50),
  ADD COLUMN IF NOT EXISTS issuer_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS certificate_footer_text TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM badge_templates WHERE template_key = 'primeira_aprovacao') THEN
    INSERT INTO badge_templates (template_key, name, description, icon, color, category, trigger_type, trigger_value, scope_key, is_default)
    VALUES
      ('primeira_aprovacao', 'Primeira Aprovação', 'Marca a primeira vitória do operador na trilha de conhecimento.', '🏁', '#60a5fa', 'onboarding', 'first_pass', 1, 'all', true),
      ('excelencia_operacional', 'Excelência Operacional', 'Reconhece desempenho acima da média com consistência e disciplina.', '🏆', '#f59e0b', 'performance', 'minimum_score', 90, 'all', true),
      ('dominio_tecnico', 'Domínio Técnico', 'Selo de alto desempenho em avaliações críticas e especializadas.', '🎯', '#10b981', 'performance', 'minimum_score', 85, 'all', true),
      ('aprendiz_consistente', 'Aprendiz Consistente', 'Reconhece quem mantém evolução e regularidade ao longo do tempo.', '📈', '#8b5cf6', 'evolution', 'minimum_attempts', 5, 'all', true),
      ('nivel_lideranca', 'Nível Liderança', 'Indica maturidade suficiente para apoiar outros operadores.', '👑', '#f97316', 'leadership', 'level_threshold', 10, 'all', true),
      ('tela_de_segurança', 'Segurança em Primeiro Lugar', 'Premia foco constante em práticas seguras e leitura cuidadosa.', '🛡️', '#ef4444', 'safety', 'minimum_score', 70, 'all', true),
      ('top_3_mensal', 'Top 3 Mensal', 'Destaque reservado aos três melhores do mês no ranking.', '🥇', '#fbbf24', 'ranking', 'ranking_top', 3, 'all', true)
    ON CONFLICT (template_key) DO NOTHING;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'conclusao_premium') THEN
    INSERT INTO certificate_templates (
      template_key, name, title, subtitle, description, accent_color, background_color, border_color,
      issuer_name, footer_text, certificate_style, is_default
    )
    VALUES
      (
        'conclusao_premium',
        'Conclusão Premium',
        'CERTIFICADO DE CONCLUSÃO',
        'Reconhecimento oficial da trilha aprovada',
        'Modelo premium com presença corporativa e validação interna.',
        '#f59e0b',
        '#0f172a',
        '#f59e0b',
        'Tecno Mapper',
        'Documento emitido automaticamente após aprovação da avaliação.',
        'premium',
        true
      ),
      (
        'excelencia_operacional',
        'Excelência Operacional',
        'CERTIFICADO DE EXCELÊNCIA',
        'Para desempenhos de destaque e alta confiabilidade',
        'Modelo com visual de destaque para operadores acima da média.',
        '#10b981',
        '#04131b',
        '#10b981',
        'Tecno Mapper',
        'Reconhecimento emitido para resultados de excelência.',
        'corporate',
        false
      ),
      (
        'trilha_avancada',
        'Trilha Avançada',
        'CERTIFICADO AVANÇADO',
        'Validação de domínio técnico e autonomia operacional',
        'Certificado elegante para trilhas intermediárias e especialistas.',
        '#60a5fa',
        '#0f172a',
        '#60a5fa',
        'Tecno Mapper',
        'Este documento comprova domínio técnico da trilha concluída.',
        'minimal',
        false
      )
    ON CONFLICT (template_key) DO NOTHING;
  END IF;
END $$;

ALTER TABLE badge_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE certificate_templates DISABLE ROW LEVEL SECURITY;

