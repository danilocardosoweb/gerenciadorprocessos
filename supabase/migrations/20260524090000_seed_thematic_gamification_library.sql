-- Seed a thematic gamification library for common industrial and educational topics.
-- Safe to run multiple times.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM badge_templates WHERE template_key = 'serra_mestre') THEN
    INSERT INTO badge_templates (
      template_key, name, description, icon_mode, icon, icon_image_url, color, badge_shape,
      category, trigger_type, trigger_value, scope_key, is_default, is_active
    ) VALUES (
      'serra_mestre',
      'Serra Mestre',
      'Reconhece domínio de operação, ajuste e segurança em serra.',
      'emoji',
      '⚙️',
      NULL,
      '#60a5fa',
      'shield',
      'serra',
      'minimum_score',
      85,
      'serra',
      true,
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM badge_templates WHERE template_key = 'paquimetro_precisao') THEN
    INSERT INTO badge_templates (
      template_key, name, description, icon_mode, icon, icon_image_url, color, badge_shape,
      category, trigger_type, trigger_value, scope_key, is_default, is_active
    ) VALUES (
      'paquimetro_precisao',
      'Precisão Dimensional',
      'Premia leitura correta e domínio metrológico com paquímetro.',
      'emoji',
      '📏',
      NULL,
      '#10b981',
      'circle',
      'metrology',
      'minimum_score',
      90,
      'paquimetro',
      true,
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM badge_templates WHERE template_key = 'montagem_sem_retrabalho') THEN
    INSERT INTO badge_templates (
      template_key, name, description, icon_mode, icon, icon_image_url, color, badge_shape,
      category, trigger_type, trigger_value, scope_key, is_default, is_active
    ) VALUES (
      'montagem_sem_retrabalho',
      'Montagem Sem Retrabalho',
      'Destaca execução correta e montagem sem erros.',
      'emoji',
      '🧩',
      NULL,
      '#f59e0b',
      'ribbon',
      'assembly',
      'minimum_score',
      80,
      'montagem',
      true,
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM badge_templates WHERE template_key = 'seguranca_primeiro_lugar') THEN
    INSERT INTO badge_templates (
      template_key, name, description, icon_mode, icon, icon_image_url, color, badge_shape,
      category, trigger_type, trigger_value, scope_key, is_default, is_active
    ) VALUES (
      'seguranca_primeiro_lugar',
      'Segurança em Primeiro Lugar',
      'Selo para quem demonstra atenção contínua aos riscos.',
      'emoji',
      '🛡️',
      NULL,
      '#ef4444',
      'shield',
      'safety',
      'minimum_score',
      70,
      'seguranca',
      true,
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM badge_templates WHERE template_key = 'qualidade_sem_retrabalho') THEN
    INSERT INTO badge_templates (
      template_key, name, description, icon_mode, icon, icon_image_url, color, badge_shape,
      category, trigger_type, trigger_value, scope_key, is_default, is_active
    ) VALUES (
      'qualidade_sem_retrabalho',
      'Qualidade sem Retrabalho',
      'Reconhece inspeção atenta e conformidade estável.',
      'emoji',
      '✅',
      NULL,
      '#8b5cf6',
      'star',
      'quality',
      'minimum_score',
      85,
      'qualidade',
      true,
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM badge_templates WHERE template_key = 'lider_processo') THEN
    INSERT INTO badge_templates (
      template_key, name, description, icon_mode, icon, icon_image_url, color, badge_shape,
      category, trigger_type, trigger_value, scope_key, is_default, is_active
    ) VALUES (
      'lider_processo',
      'Líder de Processo',
      'Selo para quem se destaca e apoia outros operadores.',
      'emoji',
      '👑',
      NULL,
      '#06b6d4',
      'medal',
      'leadership',
      'level_threshold',
      10,
      'lideranca',
      true,
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'certificado_serra') THEN
    INSERT INTO certificate_templates (
      template_key, name, title, subtitle, description, accent_color, background_color, border_color,
      paper_type, paper_orientation, logo_image_url, watermark_image_url, issuer_name, footer_text,
      certificate_style, is_default, is_active
    ) VALUES (
      'certificado_serra',
      'Certificado Serra',
      'CERTIFICADO DE DOMÍNIO EM SERRA',
      'Validação técnica para operação segura e eficiente',
      'Modelo corporativo para trilhas de serra.',
      '#60a5fa',
      '#0b1220',
      '#60a5fa',
      'corporate',
      'landscape',
      NULL,
      NULL,
      'Tecno Mapper',
      'Reconhecimento emitido após aprovação na trilha de serra.',
      'corporate',
      true,
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'certificado_paquimetro') THEN
    INSERT INTO certificate_templates (
      template_key, name, title, subtitle, description, accent_color, background_color, border_color,
      paper_type, paper_orientation, logo_image_url, watermark_image_url, issuer_name, footer_text,
      certificate_style, is_default, is_active
    ) VALUES (
      'certificado_paquimetro',
      'Certificado de Precisão',
      'CERTIFICADO DE PRECISÃO DIMENSIONAL',
      'Validação prática em uso de paquímetro e inspeção',
      'Modelo executivo para medições e inspeção dimensional.',
      '#10b981',
      '#071a16',
      '#10b981',
      'executive',
      'landscape',
      NULL,
      NULL,
      'Tecno Mapper',
      'Emitido após aprovação em medições e inspeções dimensionais.',
      'minimal',
      true,
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'certificado_montagem') THEN
    INSERT INTO certificate_templates (
      template_key, name, title, subtitle, description, accent_color, background_color, border_color,
      paper_type, paper_orientation, logo_image_url, watermark_image_url, issuer_name, footer_text,
      certificate_style, is_default, is_active
    ) VALUES (
      'certificado_montagem',
      'Certificado de Montagem',
      'CERTIFICADO DE MONTAGEM PROFISSIONAL',
      'Reconhecimento de sequência, controle e acabamento',
      'Modelo clássico para montagem e padronização.',
      '#f59e0b',
      '#1f1305',
      '#f59e0b',
      'parchment',
      'landscape',
      NULL,
      NULL,
      'Tecno Mapper',
      'Reconhecimento emitido após validação da montagem.',
      'premium',
      true,
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'certificado_seguranca') THEN
    INSERT INTO certificate_templates (
      template_key, name, title, subtitle, description, accent_color, background_color, border_color,
      paper_type, paper_orientation, logo_image_url, watermark_image_url, issuer_name, footer_text,
      certificate_style, is_default, is_active
    ) VALUES (
      'certificado_seguranca',
      'Certificado de Segurança',
      'CERTIFICADO DE SEGURANÇA OPERACIONAL',
      'Compromisso com práticas seguras e disciplina operacional',
      'Modelo institucional com foco em segurança.',
      '#ef4444',
      '#1e0b0b',
      '#ef4444',
      'corporate',
      'landscape',
      NULL,
      NULL,
      'Tecno Mapper',
      'Emitido após validação de comportamento seguro.',
      'corporate',
      true,
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'certificado_qualidade') THEN
    INSERT INTO certificate_templates (
      template_key, name, title, subtitle, description, accent_color, background_color, border_color,
      paper_type, paper_orientation, logo_image_url, watermark_image_url, issuer_name, footer_text,
      certificate_style, is_default, is_active
    ) VALUES (
      'certificado_qualidade',
      'Certificado de Qualidade',
      'CERTIFICADO DE QUALIDADE',
      'Reconhecimento por conformidade, inspeção e estabilidade',
      'Modelo elegante para qualidade e baixo retrabalho.',
      '#8b5cf6',
      '#120f1f',
      '#8b5cf6',
      'linen',
      'landscape',
      NULL,
      NULL,
      'Tecno Mapper',
      'Emitido para resultados consistentes e com baixo retrabalho.',
      'minimal',
      true,
      true
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM certificate_templates WHERE template_key = 'certificado_lideranca') THEN
    INSERT INTO certificate_templates (
      template_key, name, title, subtitle, description, accent_color, background_color, border_color,
      paper_type, paper_orientation, logo_image_url, watermark_image_url, issuer_name, footer_text,
      certificate_style, is_default, is_active
    ) VALUES (
      'certificado_lideranca',
      'Certificado de Liderança',
      'CERTIFICADO DE LIDERANÇA OPERACIONAL',
      'Validação para operador referência e multiplicador interno',
      'Modelo executivo para liderança operacional.',
      '#06b6d4',
      '#07161c',
      '#06b6d4',
      'executive',
      'landscape',
      NULL,
      NULL,
      'Tecno Mapper',
      'Emitido para profissionais com domínio e maturidade operacional.',
      'premium',
      true,
      true
    );
  END IF;
END $$;
