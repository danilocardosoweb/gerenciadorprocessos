import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  BadgeCheck,
  Edit2,
  Eye,
  FileBadge2,
  Image as ImageIcon,
  Medal,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trophy,
  X,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import type { BadgeTemplate, CertificateTemplate } from '../types/assessments';

type Tab = 'badges' | 'certificates';

type BadgeForm = {
  template_key: string;
  name: string;
  description: string;
  icon_mode: 'emoji' | 'image';
  icon: string;
  icon_image_url: string;
  color: string;
  badge_shape: 'medal' | 'shield' | 'ribbon' | 'star' | 'circle';
  category: string;
  trigger_type: BadgeTemplate['trigger_type'];
  trigger_value: string;
  scope_key: string;
  is_active: boolean;
  is_default: boolean;
};

type CertificateForm = {
  template_key: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  accent_color: string;
  background_color: string;
  border_color: string;
  paper_type: 'premium' | 'minimal' | 'corporate' | 'parchment' | 'linen' | 'executive';
  paper_orientation: 'landscape' | 'portrait';
  logo_image_url: string;
  watermark_image_url: string;
  issuer_name: string;
  footer_text: string;
  certificate_style: NonNullable<CertificateTemplate['certificate_style']>;
  is_active: boolean;
  is_default: boolean;
};

type BadgePreset = Omit<BadgeForm, 'icon_mode' | 'icon_image_url' | 'is_active' | 'is_default'> & {
  icon_mode?: 'emoji' | 'image';
  icon_image_url?: string;
};

type CertificatePreset = Omit<CertificateForm, 'logo_image_url' | 'watermark_image_url' | 'is_active' | 'is_default'> & {
  logo_image_url?: string;
  watermark_image_url?: string;
};

type LibraryPack = {
  key: string;
  name: string;
  description: string;
  accent: string;
  badge: BadgePreset;
  certificate: CertificatePreset;
};

interface GamificationSettingsPanelProps {
  currentUserName: string;
}

const icon = {
  medal: String.fromCodePoint(0x1f3c5),
  trophy: String.fromCodePoint(0x1f3c6),
  target: String.fromCodePoint(0x1f3af),
  shield: String.fromCodePoint(0x1f6e1),
  star: String.fromCodePoint(0x2b50),
  fire: String.fromCodePoint(0x1f525),
  chart: String.fromCodePoint(0x1f4c8),
  crown: String.fromCodePoint(0x1f451),
  check: String.fromCodePoint(0x2705),
  gear: String.fromCodePoint(0x2699),
  bolt: String.fromCodePoint(0x26a1),
  gem: String.fromCodePoint(0x1f48e),
  ruler: String.fromCodePoint(0x1f4cf),
  puzzle: String.fromCodePoint(0x1f9e9),
};

const defaultBadgeForm = (): BadgeForm => ({
  template_key: '',
  name: '',
  description: '',
  icon_mode: 'emoji',
  icon: icon.medal,
  icon_image_url: '',
  color: '#60a5fa',
  badge_shape: 'medal',
  category: 'performance',
  trigger_type: 'manual',
  trigger_value: '',
  scope_key: 'all',
  is_active: true,
  is_default: false,
});

const defaultCertificateForm = (): CertificateForm => ({
  template_key: '',
  name: '',
  title: 'CERTIFICADO DE CONCLUSO',
  subtitle: 'Reconhecimento oficial da trilha aprovada',
  description: '',
  accent_color: '#f59e0b',
  background_color: '#0f172a',
  border_color: '#f59e0b',
  paper_type: 'premium',
  paper_orientation: 'landscape',
  logo_image_url: '',
  watermark_image_url: '',
  issuer_name: 'Tecno Mapper',
  footer_text: 'Documento emitido automaticamente após aprovação da avaliação.',
  certificate_style: 'premium',
  is_active: true,
  is_default: false,
});

const badgeIconOptions = [
  icon.medal,
  icon.trophy,
  icon.target,
  icon.shield,
  icon.star,
  icon.fire,
  icon.chart,
  icon.crown,
  icon.check,
  icon.gear,
  icon.bolt,
  icon.gem,
];

const badgeThemeOptions = [
  { label: 'Azul', color: '#60a5fa' },
  { label: 'Dourado', color: '#f59e0b' },
  { label: 'Verde', color: '#10b981' },
  { label: 'Violeta', color: '#8b5cf6' },
  { label: 'Vermelho', color: '#ef4444' },
  { label: 'Ciano', color: '#06b6d4' },
];

const paperOptions = [
  { value: 'premium', label: 'Premium', description: 'Dourado, corporativo e elegante' },
  { value: 'corporate', label: 'Corporativo', description: 'Visual limpo e institucional' },
  { value: 'minimal', label: 'Minimalista', description: 'Poucos elementos, foco no nome' },
  { value: 'parchment', label: 'Pergaminho', description: 'Tom clássico e tradicional' },
  { value: 'linen', label: 'Linho', description: 'Textura suave, mais humana' },
  { value: 'executive', label: 'Executivo', description: 'Sofisticao com contraste alto' },
] as const;

const libraryPacks: LibraryPack[] = [
  {
    key: 'serra',
    name: 'Serra',
    description: 'Pack voltado para leitura, operação e segurança em serra.',
    accent: '#60a5fa',
    badge: {
      template_key: 'serra_mestre',
      name: 'Serra Mestre',
      description: 'Reconhece domínio de operação, ajuste e segurança em serra.',
      icon: icon.gear,
      color: '#60a5fa',
      badge_shape: 'shield',
      category: 'serra',
      trigger_type: 'minimum_score',
      trigger_value: '85',
      scope_key: 'serra',
    },
    certificate: {
      template_key: 'certificado_serra',
      name: 'Certificado Serra',
      title: 'CERTIFICADO DE DOMÍNIO EM SERRA',
      subtitle: 'Validao técnica para operação segura e eficiente',
      description: 'Modelo corporativo para trilhas de serra.',
      accent_color: '#60a5fa',
      background_color: '#0b1220',
      border_color: '#60a5fa',
      paper_type: 'corporate',
      paper_orientation: 'landscape',
      certificate_style: 'corporate',
      issuer_name: 'Tecno Mapper',
      footer_text: 'Reconhecimento emitido após aprovação na trilha de serra.',
    },
  },
  {
    key: 'paquimetro',
    name: 'Paquímetro',
    description: 'Pack de precisão dimensional e medição confivel.',
    accent: '#10b981',
    badge: {
      template_key: 'paquimetro_precisao',
      name: 'Preciso Dimensional',
      description: 'Premia leitura correta e domínio metrológico com paquímetro.',
      icon: icon.ruler,
      color: '#10b981',
      badge_shape: 'circle',
      category: 'metrologia',
      trigger_type: 'minimum_score',
      trigger_value: '90',
      scope_key: 'paquimetro',
    },
    certificate: {
      template_key: 'certificado_paquimetro',
      name: 'Certificado de Preciso',
      title: 'CERTIFICADO DE PRECISO DIMENSIONAL',
      subtitle: 'Validao prtica em uso de paquímetro e inspeção',
      description: 'Modelo executivo para medições e inspeção dimensional.',
      accent_color: '#10b981',
      background_color: '#071a16',
      border_color: '#10b981',
      paper_type: 'executive',
      paper_orientation: 'landscape',
      certificate_style: 'minimal',
      issuer_name: 'Tecno Mapper',
      footer_text: 'Emitido após aprovação em medições e inspees dimensionais.',
    },
  },
  {
    key: 'montagem',
    name: 'Montagem',
    description: 'Pack para instruções de montagem, sequência e padronizao.',
    accent: '#f59e0b',
    badge: {
      template_key: 'montagem_sem_retrabalho',
      name: 'Montagem Sem Retrabalho',
      description: 'Destaca execução correta e montagem sem erros.',
      icon: icon.puzzle,
      color: '#f59e0b',
      badge_shape: 'ribbon',
      category: 'montagem',
      trigger_type: 'minimum_score',
      trigger_value: '80',
      scope_key: 'montagem',
    },
    certificate: {
      template_key: 'certificado_montagem',
      name: 'Certificado de Montagem',
      title: 'CERTIFICADO DE MONTAGEM PROFISSIONAL',
      subtitle: 'Reconhecimento de sequência, controle e acabamento',
      description: 'Modelo clssico para montagem e padronizao.',
      accent_color: '#f59e0b',
      background_color: '#1f1305',
      border_color: '#f59e0b',
      paper_type: 'parchment',
      paper_orientation: 'landscape',
      certificate_style: 'premium',
      issuer_name: 'Tecno Mapper',
      footer_text: 'Reconhecimento emitido após validação da montagem.',
    },
  },
  {
    key: 'seguranca',
    name: 'Segurança',
    description: 'Pack para prticas seguras, bloqueios e proteção.',
    accent: '#ef4444',
    badge: {
      template_key: 'seguranca_primeiro_lugar',
      name: 'Segurança em Primeiro Lugar',
      description: 'Selo para quem demonstra atenção contínua aos riscos.',
      icon: icon.shield,
      color: '#ef4444',
      badge_shape: 'shield',
      category: 'seguranca',
      trigger_type: 'minimum_score',
      trigger_value: '70',
      scope_key: 'seguranca',
    },
    certificate: {
      template_key: 'certificado_seguranca',
      name: 'Certificado de Segurança',
      title: 'CERTIFICADO DE SEGURANÇA OPERACIONAL',
      subtitle: 'Compromisso com práticas seguras e disciplina operacional',
      description: 'Modelo para reconhecer comportamento seguro.',
      accent_color: '#ef4444',
      background_color: '#1e0b0b',
      border_color: '#ef4444',
      paper_type: 'corporate',
      paper_orientation: 'landscape',
      certificate_style: 'corporate',
      issuer_name: 'Tecno Mapper',
      footer_text: 'Emitido após validação de comportamento seguro.',
    },
  },
  {
    key: 'qualidade',
    name: 'Qualidade',
    description: 'Pack para inspeção, conformidade e redução de retrabalho.',
    accent: '#8b5cf6',
    badge: {
      template_key: 'qualidade_sem_retrabalho',
      name: 'Qualidade sem Retrabalho',
      description: 'Reconhece inspeção atenta e conformidade estável.',
      icon: icon.check,
      color: '#8b5cf6',
      badge_shape: 'star',
      category: 'qualidade',
      trigger_type: 'minimum_score',
      trigger_value: '85',
      scope_key: 'qualidade',
    },
    certificate: {
      template_key: 'certificado_qualidade',
      name: 'Certificado de Qualidade',
      title: 'CERTIFICADO DE QUALIDADE',
      subtitle: 'Reconhecimento por conformidade, inspeção e estabilidade',
      description: 'Modelo para qualidade, inspeção e baixo retrabalho.',
      accent_color: '#8b5cf6',
      background_color: '#120f1f',
      border_color: '#8b5cf6',
      paper_type: 'linen',
      paper_orientation: 'landscape',
      certificate_style: 'minimal',
      issuer_name: 'Tecno Mapper',
      footer_text: 'Emitido para resultados consistentes e com baixo retrabalho.',
    },
  },
  {
    key: 'lideranca',
    name: 'Liderança',
    description: 'Pack para multiplicadores internos e referência técnica.',
    accent: '#06b6d4',
    badge: {
      template_key: 'lider_processo',
      name: 'Líder de Processo',
      description: 'Selo para quem se destaca e apoia outros operadores.',
      icon: icon.crown,
      color: '#06b6d4',
      badge_shape: 'medal',
      category: 'lideranca',
      trigger_type: 'level_threshold',
      trigger_value: '10',
      scope_key: 'lideranca',
    },
    certificate: {
      template_key: 'certificado_lideranca',
      name: 'Certificado de Liderança',
      title: 'CERTIFICADO DE LIDERANÇA OPERACIONAL',
      subtitle: 'Validao para operador referência e multiplicador interno',
      description: 'Modelo para liderança, apoio técnico e maturidade operacional.',
      accent_color: '#06b6d4',
      background_color: '#07161c',
      border_color: '#06b6d4',
      paper_type: 'executive',
      paper_orientation: 'landscape',
      certificate_style: 'premium',
      issuer_name: 'Tecno Mapper',
      footer_text: 'Emitido para profissionais com domínio e maturidade operacional.',
    },
  },
];

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message || fallback);
  return fallback;
};

const windows1252Bytes: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

const mojibakePattern = /|[\u0080-\u00bf]|[\u0080-\u00bf]|[\u0080-\u00bf]|[\u0080-\u00bf]|[\u0080-\u00bf]/;

const cleanText = (value: string | null) => {
  if (!value || !mojibakePattern.test(value)) return value || '';
  let current = value;

  for (let index = 0; index < 3 && mojibakePattern.test(current); index += 1) {
    const bytes: number[] = [];
    let canDecode = true;

    for (const character of current) {
      const code = character.codePointAt(0) || 0;
      if (code <= 0xff) bytes.push(code);
      else if (windows1252Bytes[code]) bytes.push(windows1252Bytes[code]);
      else {
        canDecode = false;
        break;
      }
    }

    if (!canDecode) break;
    current = new TextDecoder('utf-8').decode(Uint8Array.from(bytes));
  }

  return current;
};

const getBadgePayload = (form: BadgeForm) => ({
  template_key: form.template_key.trim(),
  name: cleanText(form.name).trim(),
  description: cleanText(form.description).trim() || null,
  icon_mode: form.icon_mode,
  icon: form.icon_mode === 'image' ? icon.medal : form.icon.trim() || icon.medal,
  icon_image_url: form.icon_mode === 'image' ? form.icon_image_url.trim() || null : null,
  color: form.color,
  badge_shape: form.badge_shape,
  category: form.category.trim() || 'performance',
  trigger_type: form.trigger_type,
  trigger_value: form.trigger_value ? Number(form.trigger_value) : null,
  scope_key: form.scope_key.trim() || 'all',
  is_active: form.is_active,
  is_default: form.is_default,
  updated_at: new Date().toISOString(),
});

const getCertificatePayload = (form: CertificateForm) => ({
  template_key: form.template_key.trim(),
  name: cleanText(form.name).trim(),
  title: cleanText(form.title).trim(),
  subtitle: cleanText(form.subtitle).trim() || null,
  description: cleanText(form.description).trim() || null,
  accent_color: form.accent_color,
  background_color: form.background_color,
  border_color: form.border_color,
  paper_type: form.paper_type,
  paper_orientation: form.paper_orientation,
  logo_image_url: form.logo_image_url.trim() || null,
  watermark_image_url: form.watermark_image_url.trim() || null,
  issuer_name: cleanText(form.issuer_name).trim() || 'Tecno Mapper',
  footer_text: cleanText(form.footer_text).trim() || null,
  certificate_style: form.certificate_style,
  is_active: form.is_active,
  is_default: form.is_default,
  updated_at: new Date().toISOString(),
});

export function GamificationSettingsPanel({ currentUserName }: GamificationSettingsPanelProps) {
  const [tab, setTab] = useState<Tab>('badges');
  const [badgeTemplates, setBadgeTemplates] = useState<BadgeTemplate[]>([]);
  const [certificateTemplates, setCertificateTemplates] = useState<CertificateTemplate[]>([]);
  const [badgeForm, setBadgeForm] = useState<BadgeForm>(defaultBadgeForm());
  const [certificateForm, setCertificateForm] = useState<CertificateForm>(defaultCertificateForm());
  const [badgeEditingId, setBadgeEditingId] = useState<string | null>(null);
  const [certificateEditingId, setCertificateEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [badgeRes, certificateRes] = await Promise.all([
        supabase.from('badge_templates').select('*').order('is_default', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('certificate_templates').select('*').order('is_default', { ascending: false }).order('created_at', { ascending: false }),
      ]);

      if (badgeRes.error) throw badgeRes.error;
      if (certificateRes.error) throw certificateRes.error;

      setBadgeTemplates((badgeRes.data || []) as BadgeTemplate[]);
      setCertificateTemplates((certificateRes.data || []) as CertificateTemplate[]);
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível carregar os modelos.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const badgeStats = useMemo(
    () => ({
      total: badgeTemplates.length,
      active: badgeTemplates.filter((item) => item.is_active).length,
      defaults: badgeTemplates.filter((item) => item.is_default).length,
    }),
    [badgeTemplates],
  );

  const certificateStats = useMemo(
    () => ({
      total: certificateTemplates.length,
      active: certificateTemplates.filter((item) => item.is_active).length,
      defaults: certificateTemplates.filter((item) => item.is_default).length,
    }),
    [certificateTemplates],
  );

  const resetBadgeForm = () => {
    setBadgeEditingId(null);
    setBadgeForm(defaultBadgeForm());
  };

  const resetCertificateForm = () => {
    setCertificateEditingId(null);
    setCertificateForm(defaultCertificateForm());
  };

  const applyBadgePreset = (preset: BadgePreset) => {
    setBadgeEditingId(null);
    setTab('badges');
    setBadgeForm({
      ...defaultBadgeForm(),
      ...preset,
      icon_mode: preset.icon_mode || 'emoji',
      icon_image_url: preset.icon_image_url || '',
      is_active: true,
      is_default: true,
    });
    setNotice(`Selo "${preset.name}" carregado no formulário. Revise e clique em Criar selo.`);
  };

  const applyCertificatePreset = (preset: CertificatePreset) => {
    setCertificateEditingId(null);
    setTab('certificates');
    setCertificateForm({
      ...defaultCertificateForm(),
      ...preset,
      logo_image_url: preset.logo_image_url || '',
      watermark_image_url: preset.watermark_image_url || '',
      is_active: true,
      is_default: true,
    });
    setNotice(`Certificado "${preset.name}" carregado no formulário. Revise e clique em Criar certificado.`);
  };

  const applyPack = (pack: LibraryPack) => {
    setBadgeEditingId(null);
    setCertificateEditingId(null);
    setBadgeForm({
      ...defaultBadgeForm(),
      ...pack.badge,
      icon_mode: pack.badge.icon_mode || 'emoji',
      icon_image_url: pack.badge.icon_image_url || '',
      is_active: true,
      is_default: true,
    });
    setCertificateForm({
      ...defaultCertificateForm(),
      ...pack.certificate,
      logo_image_url: pack.certificate.logo_image_url || '',
      watermark_image_url: pack.certificate.watermark_image_url || '',
      is_active: true,
      is_default: true,
    });
    setTab('badges');
    setNotice(`Pack ${pack.name} carregado. O selo e o certificado j? esto preenchidos para revisão.`);
  };

  const saveBadgeTemplate = async () => {
    if (!badgeForm.template_key.trim() || !badgeForm.name.trim()) {
      setError('Preencha a chave e o nome do selo antes de salvar.');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const payload = getBadgePayload(badgeForm);
      const { error: saveError } = badgeEditingId ?
         await supabase.from('badge_templates').update(payload).eq('id', badgeEditingId)
        : await supabase.from('badge_templates').upsert(payload, { onConflict: 'template_key' });

      if (saveError) throw saveError;

      setNotice(`Selo ${badgeEditingId ? 'atualizado' : 'criado'} com sucesso.`);
      resetBadgeForm();
      await loadTemplates();
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível salvar o selo.'));
    } finally {
      setSaving(false);
    }
  };

  const saveCertificateTemplate = async () => {
    if (!certificateForm.template_key.trim() || !certificateForm.name.trim() || !certificateForm.title.trim()) {
      setError('Preencha a chave, o nome e o título do certificado antes de salvar.');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const payload = getCertificatePayload(certificateForm);
      const { error: saveError } = certificateEditingId ?
         await supabase.from('certificate_templates').update(payload).eq('id', certificateEditingId)
        : await supabase.from('certificate_templates').upsert(payload, { onConflict: 'template_key' });

      if (saveError) throw saveError;

      setNotice(`Certificado ${certificateEditingId ? 'atualizado' : 'criado'} com sucesso.`);
      resetCertificateForm();
      await loadTemplates();
    } catch (err) {
      setError(getErrorMessage(err, 'Não foi possível salvar o certificado.'));
    } finally {
      setSaving(false);
    }
  };

  const createPackNow = async (pack: LibraryPack) => {
    setSaving(true);
    setError(null);
    try {
      const badgePayload = getBadgePayload({
        ...defaultBadgeForm(),
        ...pack.badge,
        icon_mode: pack.badge.icon_mode || 'emoji',
        icon_image_url: pack.badge.icon_image_url || '',
        is_active: true,
        is_default: true,
      });
      const certificatePayload = getCertificatePayload({
        ...defaultCertificateForm(),
        ...pack.certificate,
        logo_image_url: pack.certificate.logo_image_url || '',
        watermark_image_url: pack.certificate.watermark_image_url || '',
        is_active: true,
        is_default: true,
      });

      const [badgeRes, certificateRes] = await Promise.all([
        supabase.from('badge_templates').upsert(badgePayload, { onConflict: 'template_key' }),
        supabase.from('certificate_templates').upsert(certificatePayload, { onConflict: 'template_key' }),
      ]);

      if (badgeRes.error) throw badgeRes.error;
      if (certificateRes.error) throw certificateRes.error;

      setNotice(`Pack ${pack.name} criado ou atualizado com selo e certificado.`);
      await loadTemplates();
    } catch (err) {
      setError(getErrorMessage(err, `Não foi possível criar o pacote ${pack.name}.`));
    } finally {
      setSaving(false);
    }
  };

  const toggleBadgeActive = async (badge: BadgeTemplate) => {
    setError(null);
    const { error: updateError } = await supabase
      .from('badge_templates')
      .update({ is_active: !badge.is_active, updated_at: new Date().toISOString() })
      .eq('id', badge.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setNotice(`Selo ${badge.is_active ? 'desativado' : 'ativado'} com sucesso.`);
    await loadTemplates();
  };

  const toggleCertificateActive = async (template: CertificateTemplate) => {
    setError(null);
    const { error: updateError } = await supabase
      .from('certificate_templates')
      .update({ is_active: !template.is_active, updated_at: new Date().toISOString() })
      .eq('id', template.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setNotice(`Certificado ${template.is_active ? 'desativado' : 'ativado'} com sucesso.`);
    await loadTemplates();
  };

  const markBadgeDefault = async (badge: BadgeTemplate) => {
    setError(null);
    const [clearRes, markRes] = await Promise.all([
      supabase.from('badge_templates').update({ is_default: false }).neq('id', badge.id),
      supabase.from('badge_templates').update({ is_default: true, updated_at: new Date().toISOString() }).eq('id', badge.id),
    ]);
    if (clearRes.error || markRes.error) {
      setError(clearRes.error.message || markRes.error.message || 'Não foi possível definir o selo padrão.');
      return;
    }
      setNotice(`"${cleanText(badge.name)}" agora ? o selo padrão.`);
    await loadTemplates();
  };

  const markCertificateDefault = async (template: CertificateTemplate) => {
    setError(null);
    const [clearRes, markRes] = await Promise.all([
      supabase.from('certificate_templates').update({ is_default: false }).neq('id', template.id),
      supabase.from('certificate_templates').update({ is_default: true, updated_at: new Date().toISOString() }).eq('id', template.id),
    ]);
    if (clearRes.error || markRes.error) {
      setError(clearRes.error.message || markRes.error.message || 'Não foi possível definir o certificado padrão.');
      return;
    }
    setNotice(`"${cleanText(template.name)}" agora ? o certificado padrão.`);
    await loadTemplates();
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleBadgeImageUpload = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setBadgeForm((prev) => ({ ...prev, icon_mode: 'image', icon_image_url: dataUrl }));
  };

  const handleCertificateImageUpload = async (target: 'logo_image_url' | 'watermark_image_url', file: File | null) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setCertificateForm((prev) => ({ ...prev, [target]: dataUrl }));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h3 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-amber-400" size={26} />
            Gamificação e Reconhecimentos
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Crie selos e certificados personalizados para o usuário perceber evoluo real.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Palette size={14} />
          {currentUserName ? `Editado por ${currentUserName}` : 'Catélogo profissional ativo'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard icon={<BadgeCheck size={16} className="text-emerald-300" />} label="Selos" value={badgeStats.total} detail={`${badgeStats.active} ativos - ${badgeStats.defaults} padrão`} />
        <MetricCard icon={<Award size={16} className="text-blue-300" />} label="Certificados" value={certificateStats.total} detail={`${certificateStats.active} ativos - ${certificateStats.defaults} padrão`} />
        <MetricCard icon={<Medal size={16} className="text-amber-300" />} label="Status" value={loading ? 'Carregando...' : 'Catlogo pronto'} detail="Criao sem mexer no código" compact />
      </div>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/80 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300 font-semibold">Biblioteca temática</p>
            <h4 className="text-xl font-bold text-white">Pacotes prontos por processo</h4>
            <p className="text-sm text-slate-400 mt-1">Use um pack para preencher, revisar ou criar selo e certificado automaticamente.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            {libraryPacks.length} pacotes prontos
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {libraryPacks.map((pack) => (
            <div key={pack.key} className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">Pack {pack.name}</div>
                  <h5 className="mt-1 text-lg font-bold text-white">{pack.name}</h5>
                  <p className="mt-1 text-sm text-slate-400">{pack.description}</p>
                </div>
                <span className="h-3 w-3 rounded-full mt-2" style={{ backgroundColor: pack.accent }} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => applyPack(pack)}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Usar modelo
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => createPackNow(pack)}
                  className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/25 disabled:opacity-50 transition-colors"
                >
                  Criar pack
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === 'badges'} onClick={() => setTab('badges')}>Selos</TabButton>
        <TabButton active={tab === 'certificates'} onClick={() => setTab('certificates')}>Certificados</TabButton>
        <button
          onClick={loadTemplates}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold hover:bg-white/10 transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Atualizar
        </button>
      </div>

      {notice && <StatusMessage tone="success" message={notice} onClose={() => setNotice(null)} />}
      {error && <StatusMessage tone="danger" message={error} onClose={() => setError(null)} />}

      {tab === 'badges' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
          <BadgeFormPanel
            badgeForm={badgeForm}
            badgeEditingId={badgeEditingId}
            saving={saving}
            onChange={setBadgeForm}
            onApplyPreset={applyBadgePreset}
            onUpload={handleBadgeImageUpload}
            onSave={saveBadgeTemplate}
            onReset={resetBadgeForm}
          />
          <BadgeCatalogPanel
            badges={badgeTemplates}
            onEdit={(badge) => {
              setBadgeEditingId(badge.id);
              setBadgeForm({
                template_key: badge.template_key,
                name: cleanText(badge.name),
                description: cleanText(badge.description),
                icon_mode: badge.icon_mode || (badge.icon_image_url ? 'image' : 'emoji'),
                icon: cleanText(badge.icon) || icon.medal,
                icon_image_url: badge.icon_image_url || '',
                color: badge.color || '#60a5fa',
                badge_shape: badge.badge_shape || 'medal',
                category: badge.category || 'performance',
                trigger_type: badge.trigger_type,
                trigger_value: badge.trigger_value ? String(badge.trigger_value) : '',
                scope_key: badge.scope_key || 'all',
                is_active: badge.is_active,
                is_default: badge.is_default,
              });
            }}
            onToggle={toggleBadgeActive}
            onDefault={markBadgeDefault}
          />
        </div>
      )}

      {tab === 'certificates' && (
        <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
          <CertificateFormPanel
            certificateForm={certificateForm}
            certificateEditingId={certificateEditingId}
            saving={saving}
            onChange={setCertificateForm}
            onApplyPreset={applyCertificatePreset}
            onUpload={handleCertificateImageUpload}
            onSave={saveCertificateTemplate}
            onReset={resetCertificateForm}
          />
          <CertificateCatalogPanel
            certificates={certificateTemplates}
            onEdit={(template) => {
              setCertificateEditingId(template.id);
              setCertificateForm({
                template_key: template.template_key,
                name: cleanText(template.name),
                title: cleanText(template.title),
                subtitle: cleanText(template.subtitle),
                description: cleanText(template.description),
                accent_color: template.accent_color || '#f59e0b',
                background_color: template.background_color || '#0f172a',
                border_color: template.border_color || '#f59e0b',
                paper_type: template.paper_type || 'premium',
                paper_orientation: template.paper_orientation || 'landscape',
                logo_image_url: template.logo_image_url || '',
                watermark_image_url: template.watermark_image_url || '',
                issuer_name: cleanText(template.issuer_name) || 'Tecno Mapper',
                footer_text: cleanText(template.footer_text),
                certificate_style: template.certificate_style || 'premium',
                is_active: template.is_active,
                is_default: template.is_default,
              });
            }}
            onToggle={toggleCertificateActive}
            onDefault={markCertificateDefault}
          />
        </div>
      )}
    </div>
  );
}

function BadgeFormPanel({
  badgeForm,
  badgeEditingId,
  saving,
  onChange,
  onApplyPreset,
  onUpload,
  onSave,
  onReset,
}: {
  badgeForm: BadgeForm;
  badgeEditingId: string | null;
  saving: boolean;
  onChange: React.Dispatch<React.SetStateAction<BadgeForm>>;
  onApplyPreset: (preset: BadgePreset) => void;
  onUpload: (file: File | null) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Plus size={18} className="text-emerald-300" />
        <h4 className="text-lg font-bold text-white">{badgeEditingId ? 'Editar selo' : 'Novo selo'}</h4>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300 font-semibold">Escolha rápida</p>
          <h5 className="text-white font-bold mb-3">Carregar um modelo pronto</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {quickBadgePresets.map((preset) => (
              <button
                key={preset.template_key}
                type="button"
                onClick={() => onApplyPreset(preset)}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10 transition-colors"
              >
                <div className="font-semibold text-white text-sm">{preset.name}</div>
                <div className="text-xs text-slate-400">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Chave do selo" value={badgeForm.template_key} onChange={(value) => onChange((prev) => ({ ...prev, template_key: value }))} placeholder="ex: excelencia_operacional" />
          <Field label="Nome" value={badgeForm.name} onChange={(value) => onChange((prev) => ({ ...prev, name: value }))} placeholder="Ex: Excelência Operacional" />
          <Field label="Categoria" value={badgeForm.category} onChange={(value) => onChange((prev) => ({ ...prev, category: value }))} placeholder="performance" />
          <Field label="Escopo" value={badgeForm.scope_key} onChange={(value) => onChange((prev) => ({ ...prev, scope_key: value }))} placeholder="all" />
          <ColorField label="Cor principal" value={badgeForm.color} onChange={(value) => onChange((prev) => ({ ...prev, color: value }))} />
          <SelectField
            label="Formato"
            value={badgeForm.badge_shape}
            onChange={(value) => onChange((prev) => ({ ...prev, badge_shape: value as BadgeForm['badge_shape'] }))}
            options={[
              ['medal', 'Medalha'],
              ['shield', 'Escudo'],
              ['ribbon', 'Fita'],
              ['star', 'Estrela'],
              ['circle', 'Círculo'],
            ]}
          />
          <TextAreaField label="Descrio" value={badgeForm.description} onChange={(value) => onChange((prev) => ({ ...prev, description: value }))} placeholder="Descreva a conquista de forma inspiradora" />

          <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">Ícone do selo</p>
                <h5 className="font-bold text-white">Escolha por emoji ou imagem</h5>
              </div>
              <div className="flex gap-2">
                <TabButton active={badgeForm.icon_mode === 'emoji'} onClick={() => onChange((prev) => ({ ...prev, icon_mode: 'emoji' }))}>Emoji</TabButton>
                <TabButton active={badgeForm.icon_mode === 'image'} onClick={() => onChange((prev) => ({ ...prev, icon_mode: 'image' }))}>Imagem</TabButton>
              </div>
            </div>

            {badgeForm.icon_mode === 'emoji' ? (
              <div className="space-y-3">
                <Field label="Emoji atual" value={badgeForm.icon} onChange={(value) => onChange((prev) => ({ ...prev, icon: value }))} placeholder={icon.trophy} />
                <div className="grid grid-cols-6 gap-2">
                  {badgeIconOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onChange((prev) => ({ ...prev, icon: emoji, icon_mode: 'emoji', icon_image_url: '' }))}
                      className={cn('rounded-xl border px-2 py-2 text-lg transition-colors', badgeForm.icon === emoji ? 'bg-amber-400/15 border-amber-300 text-amber-200' : 'bg-white/5 border-white/10 hover:bg-white/10')}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => onUpload(event.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-500"
                />
                <Field label="Ou cole uma URL de imagem" value={badgeForm.icon_image_url} onChange={(value) => onChange((prev) => ({ ...prev, icon_image_url: value }))} placeholder="https://..." />
                {badgeForm.icon_image_url && (
                  <PreviewImage src={badgeForm.icon_image_url} title="Imagem carregada" description="Ser usada no selo e na visualização do usuário." />
                )}
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-300">Cores rápidas</label>
            <div className="flex flex-wrap gap-2">
              {badgeThemeOptions.map((theme) => (
                <button key={theme.color} type="button" onClick={() => onChange((prev) => ({ ...prev, color: theme.color }))} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 hover:bg-white/10">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.color }} />
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          <SelectField
            label="Gatilho"
            value={badgeForm.trigger_type}
            onChange={(value) => onChange((prev) => ({ ...prev, trigger_type: value as BadgeTemplate['trigger_type'] }))}
            options={[
              ['manual', 'Manual'],
              ['first_pass', 'Primeira aprovação'],
              ['perfect_score', 'Nota perfeita'],
              ['minimum_score', 'Nota mínima'],
              ['minimum_attempts', 'Quantidade de tentativas'],
              ['level_threshold', 'Nível mínimo'],
              ['ranking_top', 'Top do ranking'],
            ]}
          />
          <Field label="Valor do gatilho" value={badgeForm.trigger_value} onChange={(value) => onChange((prev) => ({ ...prev, trigger_value: value }))} placeholder="Ex: 90 ou 3" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <ToggleButton checked={badgeForm.is_active} label="Ativo" onClick={() => onChange((prev) => ({ ...prev, is_active: !prev.is_active }))} />
        <ToggleButton checked={badgeForm.is_default} label="Padro" onClick={() => onChange((prev) => ({ ...prev, is_default: !prev.is_default }))} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button disabled={saving} onClick={onSave} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors">
          <Save size={16} />
          {badgeEditingId ? 'Salvar alterações' : 'Criar selo'}
        </button>
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors">
          Limpar
        </button>
      </div>
    </div>
  );
}

const quickBadgePresets: BadgePreset[] = [
  {
    template_key: 'seguranca_primeiro_lugar',
    name: 'Segurança',
    description: 'Padro de proteção e cuidado',
    icon: icon.shield,
    color: '#ef4444',
    badge_shape: 'shield',
    category: 'seguranca',
    trigger_type: 'minimum_score',
    trigger_value: '70',
    scope_key: 'all',
  },
  {
    template_key: 'excelencia_operacional',
    name: 'Excelência',
    description: 'Reconhecimento premium',
    icon: icon.trophy,
    color: '#f59e0b',
    badge_shape: 'medal',
    category: 'performance',
    trigger_type: 'minimum_score',
    trigger_value: '90',
    scope_key: 'all',
  },
  {
    template_key: 'dominio_tecnico',
    name: 'Técnico',
    description: 'Foco em conhecimento',
    icon: icon.target,
    color: '#10b981',
    badge_shape: 'star',
    category: 'technical',
    trigger_type: 'minimum_score',
    trigger_value: '85',
    scope_key: 'all',
  },
];

function BadgeCatalogPanel({
  badges,
  onEdit,
  onToggle,
  onDefault,
}: {
  badges: BadgeTemplate[];
  onEdit: (badge: BadgeTemplate) => void;
  onToggle: (badge: BadgeTemplate) => void;
  onDefault: (badge: BadgeTemplate) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4">
        <h4 className="text-lg font-bold text-white">Catélogo de selos</h4>
        <p className="text-sm text-slate-400">Modelos profissionais já prontos para uso.</p>
      </div>

      <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
        {badges.length === 0 && <EmptyState text="Nenhum selo cadastrado ainda." />}
        {badges.map((badge) => (
          <div key={badge.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border overflow-hidden" style={{ backgroundColor: `${badge.color || '#60a5fa'}20`, borderColor: `${badge.color || '#60a5fa'}55`, color: badge.color || '#60a5fa' }}>
                  {badge.icon_mode === 'image' && badge.icon_image_url ? <img src={badge.icon_image_url} alt="" className="h-full w-full object-cover" /> : <span className="text-xl">{cleanText(badge.icon) || icon.medal}</span>}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="font-bold text-white">{cleanText(badge.name)}</h5>
                    <StatusPill active={badge.is_default} label="Padro" />
                    <StatusPill active={badge.is_active} label={badge.is_active ? 'Ativo' : 'Inativo'} neutral={!badge.is_active} />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{cleanText(badge.description)}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Chave: <span className="font-mono text-slate-300">{badge.template_key}</span> - Gatilho: {badge.trigger_type}{badge.trigger_value ? ` (${badge.trigger_value})` : ''}
                  </p>
                </div>
              </div>
              <CatalogActions
                isActive={badge.is_active}
                onEdit={() => onEdit(badge)}
                onToggle={() => onToggle(badge)}
                onDefault={() => onDefault(badge)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificateFormPanel({
  certificateForm,
  certificateEditingId,
  saving,
  onChange,
  onApplyPreset,
  onUpload,
  onSave,
  onReset,
}: {
  certificateForm: CertificateForm;
  certificateEditingId: string | null;
  saving: boolean;
  onChange: React.Dispatch<React.SetStateAction<CertificateForm>>;
  onApplyPreset: (preset: CertificatePreset) => void;
  onUpload: (target: 'logo_image_url' | 'watermark_image_url', file: File | null) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Plus size={18} className="text-blue-300" />
        <h4 className="text-lg font-bold text-white">{certificateEditingId ? 'Editar certificado' : 'Novo certificado'}</h4>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300 font-semibold">Escolha rápida</p>
          <h5 className="text-white font-bold mb-3">Selecione o perfil visual do certificado</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {quickCertificatePresets.map((preset) => (
              <button key={preset.template_key} type="button" onClick={() => onApplyPreset(preset)} className="rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10 transition-colors">
                <div className="font-semibold text-white text-sm">{preset.name}</div>
                <div className="text-xs text-slate-400">{preset.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Chave" value={certificateForm.template_key} onChange={(value) => onChange((prev) => ({ ...prev, template_key: value }))} placeholder="ex: conclusao_premium" />
          <Field label="Nome interno" value={certificateForm.name} onChange={(value) => onChange((prev) => ({ ...prev, name: value }))} placeholder="Ex: Concluso Premium" />
          <Field label="Ttulo" value={certificateForm.title} onChange={(value) => onChange((prev) => ({ ...prev, title: value }))} placeholder="CERTIFICADO DE CONCLUSO" />
          <Field label="Subtítulo" value={certificateForm.subtitle} onChange={(value) => onChange((prev) => ({ ...prev, subtitle: value }))} placeholder="Reconhecimento oficial..." />
          <Field label="Emissor" value={certificateForm.issuer_name} onChange={(value) => onChange((prev) => ({ ...prev, issuer_name: value }))} placeholder="Tecno Mapper" />
          <SelectField
            label="Papel"
            value={certificateForm.paper_type}
            onChange={(value) => onChange((prev) => ({ ...prev, paper_type: value as CertificateForm['paper_type'] }))}
            options={paperOptions.map((option) => [option.value, `${option.label} - ${option.description}`])}
          />
          <SelectField
            label="Estilo base"
            value={certificateForm.certificate_style}
            onChange={(value) => onChange((prev) => ({ ...prev, certificate_style: value as CertificateForm['certificate_style'] }))}
            options={[
              ['premium', 'Premium'],
              ['minimal', 'Minimalista'],
              ['corporate', 'Corporativo'],
            ]}
          />
          <SelectField
            label="Orientao"
            value={certificateForm.paper_orientation}
            onChange={(value) => onChange((prev) => ({ ...prev, paper_orientation: value as CertificateForm['paper_orientation'] }))}
            options={[
              ['landscape', 'Horizontal'],
              ['portrait', 'Vertical'],
            ]}
          />
          <ColorField label="Cor de destaque" value={certificateForm.accent_color} onChange={(value) => onChange((prev) => ({ ...prev, accent_color: value }))} />
          <ColorField label="Fundo" value={certificateForm.background_color} onChange={(value) => onChange((prev) => ({ ...prev, background_color: value }))} />
          <ColorField label="Borda" value={certificateForm.border_color} onChange={(value) => onChange((prev) => ({ ...prev, border_color: value }))} />

          <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-slate-950/40 p-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400 font-semibold">Logotipo e marca d'água</p>
              <h5 className="font-bold text-white">Carregue arquivos ou cole uma URL</h5>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ImageUploadField
                label="Logo"
                value={certificateForm.logo_image_url}
                onUpload={(file) => onUpload('logo_image_url', file)}
                onChange={(value) => onChange((prev) => ({ ...prev, logo_image_url: value }))}
              />
              <ImageUploadField
                label="Marca d'água"
                value={certificateForm.watermark_image_url}
                onUpload={(file) => onUpload('watermark_image_url', file)}
                onChange={(value) => onChange((prev) => ({ ...prev, watermark_image_url: value }))}
              />
            </div>
          </div>

          <TextAreaField label="Descrio" value={certificateForm.description} onChange={(value) => onChange((prev) => ({ ...prev, description: value }))} placeholder="Descreva quando este modelo ser usado" />
          <TextAreaField label="Rodapé" value={certificateForm.footer_text} onChange={(value) => onChange((prev) => ({ ...prev, footer_text: value }))} placeholder="Texto de rodapé do certificado" />
        </div>

        <CertificatePreview form={certificateForm} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <ToggleButton checked={certificateForm.is_active} label="Ativo" onClick={() => onChange((prev) => ({ ...prev, is_active: !prev.is_active }))} />
        <ToggleButton checked={certificateForm.is_default} label="Padro" onClick={() => onChange((prev) => ({ ...prev, is_default: !prev.is_default }))} />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button disabled={saving} onClick={onSave} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">
          <Save size={16} />
          {certificateEditingId ? 'Salvar alterações' : 'Criar certificado'}
        </button>
        <button onClick={onReset} className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors">
          Limpar
        </button>
      </div>
    </div>
  );
}

const quickCertificatePresets: CertificatePreset[] = [
  {
    template_key: 'conclusao_premium',
    name: 'Concluso Premium',
    title: 'CERTIFICADO DE CONCLUSO',
    subtitle: 'Reconhecimento oficial da trilha aprovada',
    description: 'Gold, alta presença visual e assinatura institucional.',
    accent_color: '#f59e0b',
    background_color: '#0f172a',
    border_color: '#f59e0b',
    paper_type: 'premium',
    paper_orientation: 'landscape',
    certificate_style: 'premium',
    issuer_name: 'Tecno Mapper',
    footer_text: 'Documento emitido automaticamente após aprovação da avaliação.',
  },
  {
    template_key: 'executivo_corporativo',
    name: 'Executivo Corporativo',
    title: 'CERTIFICADO EXECUTIVO',
    subtitle: 'Reconhecimento formal e institucional',
    description: 'Limpo, corporativo e direto para uso interno.',
    accent_color: '#60a5fa',
    background_color: '#0b1220',
    border_color: '#60a5fa',
    paper_type: 'corporate',
    paper_orientation: 'landscape',
    certificate_style: 'corporate',
    issuer_name: 'Tecno Mapper',
    footer_text: 'Documento emitido para fins internos e corporativos.',
  },
  {
    template_key: 'pergaminho_classico',
    name: 'Pergaminho Clássico',
    title: 'CERTIFICADO ACADÊMICO',
    subtitle: 'Conquista formal da trilha concluída',
    description: 'Mais clássico e elegante para conquistas especiais.',
    accent_color: '#d6a76d',
    background_color: '#231f1a',
    border_color: '#d6a76d',
    paper_type: 'parchment',
    paper_orientation: 'landscape',
    certificate_style: 'minimal',
    issuer_name: 'Tecno Mapper',
    footer_text: 'Reconhecimento emitido após validação do conhecimento.',
  },
];

function CertificateCatalogPanel({
  certificates,
  onEdit,
  onToggle,
  onDefault,
}: {
  certificates: CertificateTemplate[];
  onEdit: (template: CertificateTemplate) => void;
  onToggle: (template: CertificateTemplate) => void;
  onDefault: (template: CertificateTemplate) => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4">
        <h4 className="text-lg font-bold text-white">Catélogo de certificados</h4>
        <p className="text-sm text-slate-400">Cada modelo dá identidade visual ao reconhecimento.</p>
      </div>

      <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
        {certificates.length === 0 && <EmptyState text="Nenhum certificado cadastrado ainda." />}
        {certificates.map((template) => (
          <div key={template.id} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border" style={{ backgroundColor: `${template.accent_color || '#f59e0b'}20`, borderColor: `${template.border_color || '#f59e0b'}55`, color: template.accent_color || '#f59e0b' }}>
                  <FileBadge2 size={22} />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="font-bold text-white">{cleanText(template.name)}</h5>
                    <StatusPill active={template.is_default} label="Padro" />
                    <StatusPill active={template.is_active} label={template.is_active ? 'Ativo' : 'Inativo'} neutral={!template.is_active} />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{cleanText(template.description)}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Chave: <span className="font-mono text-slate-300">{template.template_key}</span> - Estilo: {template.certificate_style}
                  </p>
                </div>
              </div>
              <CatalogActions
                isActive={template.is_active}
                onEdit={() => onEdit(template)}
                onToggle={() => onToggle(template)}
                onDefault={() => onDefault(template)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificatePreview({ form }: { form: CertificateForm }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
        <Eye size={15} />
        Prévia do certificado
      </div>
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border p-5 text-center shadow-inner',
          form.paper_orientation === 'portrait' ? 'min-h-[360px]' : 'min-h-[240px]',
        )}
        style={{
          background: `linear-gradient(135deg, ${form.background_color}, #020617)`,
          borderColor: form.border_color,
        }}
      >
        {form.watermark_image_url && <img src={form.watermark_image_url} alt="" className="absolute inset-0 m-auto h-32 w-32 object-contain opacity-10" />}
        {form.logo_image_url && <img src={form.logo_image_url} alt="" className="mx-auto mb-3 h-12 max-w-32 object-contain" />}
        <div className="relative z-10">
          <div className="mx-auto mb-4 h-1 w-24 rounded-full" style={{ backgroundColor: form.accent_color }} />
          <p className="text-xs uppercase tracking-[0.28em] text-slate-300">{form.issuer_name || 'Tecno Mapper'}</p>
          <h5 className="mt-3 text-xl font-black text-white">{form.title || 'CERTIFICADO'}</h5>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-300">{form.subtitle || 'Reconhecimento oficial'}</p>
          <div className="mx-auto mt-5 max-w-md rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs text-slate-400">Este certificado será emitido ao usuário aprovado conforme o modelo selecionado.</p>
          </div>
          <p className="mt-5 text-xs text-slate-500">{form.footer_text}</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: cardIcon, label, value, detail, compact = false }: { icon: React.ReactNode; label: string; value: React.ReactNode; detail: string; compact?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-slate-300">
        {cardIcon}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className={cn('mt-2 font-black text-white', compact ? 'text-lg' : 'text-3xl')}>{value}</div>
      <div className="text-xs text-slate-400">{detail}</div>
    </div>
  );
}

function CatalogActions({ isActive, onEdit, onToggle, onDefault }: { isActive: boolean; onEdit: () => void; onToggle: () => void; onDefault: () => void }) {
  return (
    <div className="flex shrink-0 flex-col gap-2">
      <button onClick={onEdit} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10">
        <Edit2 size={14} />
        Editar
      </button>
      <button onClick={onToggle} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10">
        {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        {isActive ? 'Desativar' : 'Ativar'}
      </button>
      <button onClick={onDefault} className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-400/20">
        <Medal size={14} />
        Padro
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label>
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none" />
      </div>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="sm:col-span-2">
      <label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" placeholder={placeholder} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none">
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue} className="bg-slate-900">
            {labelText}
          </option>
        ))}
      </select>
    </div>
  );
}

function ImageUploadField({ label, value, onUpload, onChange }: { label: string; value: string; onUpload: (file: File | null) => void; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-300">{label}</label>
      <input type="file" accept="image/*" onChange={(event) => onUpload(event.target.files?.[0] ?? null)} className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:text-white hover:file:bg-blue-500 file:rounded-xl file:border-0 file:bg-blue-600" />
      <Field label={`URL do campo ${label}`} value={value} onChange={onChange} placeholder="https://..." />
      {value && <PreviewImage src={value} title={`${label} carregado`} description="A imagem será salva no modelo visual." />}
    </div>
  );
}

function PreviewImage({ src, title, description }: { src: string; title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <img src={src} alt="" className="h-14 w-14 rounded-2xl object-cover" />
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function ToggleButton({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors', checked ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-400')}>
      {checked ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
      {label}
    </button>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-colors border', active ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10')}>
      {children}
    </button>
  );
}

function StatusPill({ active, label, neutral = false }: { active: boolean; label: string; neutral?: boolean }) {
  if (!active && !neutral) return null;
  return (
    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-bold', neutral ? 'border-slate-500/30 bg-slate-500/10 text-slate-400' : 'border-amber-400/30 bg-amber-400/10 text-amber-300')}>
      {label}
    </span>
  );
}

function StatusMessage({ tone, message, onClose }: { tone: 'success' | 'danger'; message: string; onClose: () => void }) {
  return (
    <div className={cn('rounded-2xl border px-4 py-3 text-sm flex items-center justify-between gap-3', tone === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200' : 'border-red-500/20 bg-red-500/10 text-red-200')}>
      <span>{message}</span>
      <button onClick={onClose} className="opacity-80 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
      <ImageIcon className="mx-auto mb-2 text-slate-500" size={28} />
      {text}
    </div>
  );
}
