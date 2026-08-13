import type { AssessmentDifficulty, AssessmentFormData, BadgeType, QuestionFormData } from '../types/assessments';

export type EducationalLevel = 'beginner' | 'intermediate' | 'expert';

export interface EducationalThemeProfile {
  key: string;
  trackLabel: string;
  badgeType: BadgeType;
  processTitleMatchers: string[];
  shortLabel: string;
  inputDoc: string;
  primaryResource: string;
  responsibleRole: string;
  output: string;
  safetyAction: string;
  qualityCheck: string;
  mainRisk: string;
  evidence: string;
  nonConformityAction: string;
  kpi: string;
  standardReference: string;
}

export interface GeneratedAssessmentBundle {
  themeKey: string;
  level: EducationalLevel;
  processItemTitle?: string;
  form: AssessmentFormData;
  questions: QuestionFormData[];
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const hash = (value: string) => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const rotate = <T,>(values: T[], seed: number): T[] => {
  if (!values.length) return values;
  const offset = seed % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
};

const buildOptions = (correct: string, category: string, wrongs: string[], seedText: string) => {
  const ordered = rotate([correct, ...unique(wrongs).filter((value) => value !== correct)].slice(0, 4), hash(seedText));
  const options = ['A', 'B', 'C', 'D'] as const;
  while (ordered.length < 4) {
    ordered.push(`Opcao extra ${ordered.length + 1}`);
  }
  const correctIndex = ordered.indexOf(correct);
  return {
    option_a: ordered[0],
    option_b: ordered[1],
    option_c: ordered[2],
    option_d: ordered[3],
    correct_option: options[Math.max(0, correctIndex)] || 'A',
    explanation: `Resposta esperada para ${category}: ${correct}.`,
  };
};

const buildQuestion = (
  prompt: string,
  correct: string,
  category: string,
  wrongs: string[],
  seedText: string,
  explanation = ''
): QuestionFormData => {
  const options = buildOptions(correct, category, wrongs, seedText);
  return {
    question_text: prompt,
    option_a: options.option_a,
    option_b: options.option_b,
    option_c: options.option_c,
    option_d: options.option_d,
    correct_option: options.correct_option,
    weight: 1,
    explanation: explanation || options.explanation,
    image_url: '',
    time_limit_seconds: undefined,
    related_node_id: '',
  };
};

const genericWrongPools = {
  document: ['Plano antigo sem revisão', 'Material sem identificação', 'Registro verbal'],
  resource: ['Bloco padrão', 'Gabarito universal', 'Mesa de apoio'],
  role: ['Visitante', 'Auxiliar de limpeza', 'Conferente de estoque'],
  output: ['Material bloqueado', 'Ferramenta solta', 'Registro pendente'],
  safety: ['Trabalhar sem EPI', 'Retirar proteções', 'Ignorar alarme'],
  quality: ['Não medir a peça', 'Liberar sem registro', 'Conferir apenas visualmente'],
  risk: ['Aumentar a rastreabilidade', 'Reduzir o refugo', 'Melhorar a embalagem'],
  evidence: ['Memria do operador', 'Anotao informal', 'Foto no registrada'],
  nonConformity: ['Seguir adiante sem registrar', 'Misturar lote e liberar', 'Ignorar o desvio'],
  kpi: ['Tempo de pausa', 'Quantidade de limpeza', 'Velocidade do scanner'],
  standard: ['Desenho desatualizado', 'Etiqueta do estoque', 'Folha em branco'],
};

export const EDUCATIONAL_THEMES: EducationalThemeProfile[] = [
  {
    key: 'serra-doppia',
    trackLabel: 'Serra Doppia 2 Cabeças',
    badgeType: 'serra_doppia_master',
    processTitleMatchers: ['serra doppia 2 cabeças'],
    shortLabel: 'Serra Doppia',
    inputDoc: 'Ordem de Produo, desenho técnico e programa de corte',
    primaryResource: 'Serra Doppia 2 Cabeças',
    responsibleRole: 'Operador de Serra',
    output: 'Perfis cortados conforme a OP',
    safetyAction: 'Conferir EPIs, proteções e bloqueios antes de iniciar',
    qualityCheck: 'Validar medidas, ?ângulos e primeiro corte',
    mainRisk: 'Desvio dimensional, retrabalho e mistura de lotes',
    evidence: 'Checklist preenchido, primeiro corte aprovado e registro de produção',
    nonConformityAction: 'Segregar material, parar a operação e acionar a liderana',
    kpi: 'Eficiência de corte, refugo e tempo de setup',
    standardReference: 'Instruo de trabalho vigente e OP',
  },
  {
    key: 'serra-emmegi',
    trackLabel: 'Serra Emmegi Automática 1 Cabeça',
    badgeType: 'serra_emmegi_master',
    processTitleMatchers: ['serra emmegi automática 1 cabeça', 'serra emmegi automatica 1 cabeca'],
    shortLabel: 'Serra Emmegi',
    inputDoc: 'Ordem de Produo, desenho técnico e programa CNC',
    primaryResource: 'Serra Emmegi Automática 1 Cabeça',
    responsibleRole: 'Operador CNC / Operador de Serra',
    output: 'Perfis cortados e liberados para a próxima etapa',
    safetyAction: 'Conferir proteções, botões de emergência e bloqueios',
    qualityCheck: 'Validar o primeiro corte e conferir o batente',
    mainRisk: 'Corte incorreto, parada da máquina e retrabalho',
    evidence: 'Registro de setup, inspeção do primeiro corte e rastreabilidade do lote',
    nonConformityAction: 'Interromper, corrigir o setup e comunicar a liderança',
    kpi: 'Produtividade, refugo e tempo de setup',
    standardReference: 'Procedimento operacional e desenho vigente',
  },
  {
    key: 'serra-emmegi-criticos',
    trackLabel: 'Serra Emmegi - Itens Críticos',
    badgeType: 'serra_emmegi_criticos_master',
    processTitleMatchers: ['itens críticos', 'serra emmegi automática 1 cabeça - itens críticos'],
    shortLabel: 'Emmegi Críticos',
    inputDoc: 'Ordem de Produo, lista de itens críticos e desenho técnico',
    primaryResource: 'Serra Emmegi Automática 1 Cabeça',
    responsibleRole: 'Operador de Serra / Qualidade',
    output: 'Itens críticos cortados e rastreados sem desvio',
    safetyAction: 'Manter bloqueio, ateno redobrada e dupla conferência',
    qualityCheck: 'Checar calibração, medida crítica e identificação do item',
    mainRisk: 'Falha em item crítico, parada de linha e não conformidade cliente',
    evidence: 'Checklist de itens críticos, medição validada e rastreabilidade completa',
    nonConformityAction: 'Bloquear o lote, avisar a qualidade e revalidar o setup',
    kpi: 'Conformidade de itens críticos e taxa de reinspeo',
    standardReference: 'Controle de itens críticos e rastreabilidade interna',
  },
  {
    key: 'paletes-exportacao',
    trackLabel: 'Montagem de Paletes para Exportao',
    badgeType: 'paletes_exportacao_master',
    processTitleMatchers: ['montagem de paletes para exportação'],
    shortLabel: 'Paletes Exportao',
    inputDoc: 'Ordem de produção, especificação do cliente e lista de embalagem',
    primaryResource: 'Mesa de montagem, filme stretch, cantoneiras e etiquetas',
    responsibleRole: 'Montador de Paletes / Expedio',
    output: 'Palete pronto para expedição e protegido',
    safetyAction: 'Usar luvas, manter postura e evitar queda de carga',
    qualityCheck: 'Conferir integridade, estabilidade, proteção e identificação',
    mainRisk: 'Avaria no transporte, queda de carga e rejeição do cliente',
    evidence: 'Checklist de expedição, etiqueta e foto do pallet',
    nonConformityAction: 'Separar o pallet e corrigir a embalagem antes de seguir',
    kpi: 'Avarias, retrabalho e devoluo',
    standardReference: 'Especificao do cliente e padrão interno de embalagem',
  },
  {
    key: 'tramontina',
    trackLabel: 'Montagem de Paletes - Tramontina',
    badgeType: 'tramontina_master',
    processTitleMatchers: ['montagem de paletes - tramontina'],
    shortLabel: 'Tramontina',
    inputDoc: 'OP, padrão Tramontina e etiqueta de rastreabilidade',
    primaryResource: 'Pallet certificado, filme stretch, etiqueta QR e paleteira',
    responsibleRole: 'Montador de Paletes / Qualidade',
    output: 'Produto palletizado conforme a especificação do cliente',
    safetyAction: 'Evitar esforço excessivo, quedas de carga e áreas de risco',
    qualityCheck: 'Validar integridade, posição da etiqueta, QR legível e proteção do pallet',
    mainRisk: 'Falha de rastreabilidade, avaria e reprovao do cliente',
    evidence: 'Registro de inspeção, foto do pallet e etiqueta de rastreio',
    nonConformityAction: 'Segregar o lote e corrigir antes da expedição',
    kpi: 'Conformidade de embalagem, avarias e retrabalho',
    standardReference: 'IATF 16949 e requisito específico Tramontina',
  },
  {
    key: 'corte-serras',
    trackLabel: 'Operao de Corte em Serras',
    badgeType: 'corte_serras_master',
    processTitleMatchers: ['operacao de corte em serras', 'operação de corte em serras', 'corte em serras'],
    shortLabel: 'Corte em Serras',
    inputDoc: 'Material correto, OP e desenho técnico',
    primaryResource: 'Serra de corte, leitor de código, trena e paquímetro',
    responsibleRole: 'Operador de Corte',
    output: 'Perfis cortados, rastreáveis e liberados',
    safetyAction: 'Usar EPI, manter proteções da máquina e manusear perfis longos com cuidado',
    qualityCheck: 'Validar primeiro corte, medidas e rebarbas',
    mainRisk: 'Corte incorreto, mistura de material e acidente',
    evidence: 'Rastreabilidade registrada e inspeção preenchida',
    nonConformityAction: 'Segregar lote e comunicar liderança/qualidade',
    kpi: 'Eficiência de corte, refugo e incidentes',
    standardReference: 'Procedimento de corte e controle de qualidade',
  },
  {
    key: 'usinagem-exp-fom',
    trackLabel: 'Usinagem EXP - FOM Industrie CNC',
    badgeType: 'usinagem_exp_fom_master',
    processTitleMatchers: ['usinagem exp - fom industrie cnc'],
    shortLabel: 'Usinagem FOM',
    inputDoc: 'OP, desenho técnico, programa CNC e plano de controle',
    primaryResource: 'Centro CNC FOM Industrie, fixação pneumtica e ferramentas calibradas',
    responsibleRole: 'Operador CNC / Usinagem',
    output: 'Perfis EXP usinados com furos e drenos conforme',
    safetyAction: 'Bloquear no setup e permanecer fora da área de movimento',
    qualityCheck: 'Validar offsets, ferramenta, primeiro artigo e repetibilidade',
    mainRisk: 'Infiltrao, falha de montagem e retrabalho',
    evidence: 'Registro de setup, medição e rastreabilidade do lote',
    nonConformityAction: 'Parar a máquina e revalidar o setup',
    kpi: 'Conformidade dimensional, refugo e produtividade',
    standardReference: 'Plano de controle e instruo CNC',
  },
  {
    key: 'paquimetro-150-300',
    trackLabel: 'Uso de Paquímetros 150 mm e 300 mm',
    badgeType: 'paquimetro_150_300_master',
    processTitleMatchers: ['uso de paquimetros 150 mm e 300 mm', 'paquimetros 150 mm e 300 mm', 'paquímetros 150 mm e 300 mm'],
    shortLabel: 'Paquímetros 150/300',
    inputDoc: 'Desenho técnico, tolerncias e lote da peça',
    primaryResource: 'Paquímetro de 150 mm ou 300 mm calibrado',
    responsibleRole: 'Inspetor de Qualidade / Operador de Medio',
    output: 'Medies confiveis e decisão de conformidade',
    safetyAction: 'Limpar peça e instrumento antes da leitura',
    qualityCheck: 'Zerar o paquímetro, conferir perpendicularidade e escolher a faixa correta',
    mainRisk: 'Leitura incorreta e aprovação de peça fora de tolerância',
    evidence: 'Ficha de medição e registro da amostragem',
    nonConformityAction: 'Repetir a leitura, bloquear a peça e informar a qualidade',
    kpi: 'Conformidade dimensional, reinspeo e retrabalho',
    standardReference: 'ABNT NBR 5426 S3',
  },
];

const getWrongOptions = (category: keyof typeof genericWrongPools, theme: EducationalThemeProfile) => {
  const themeHints = [
    theme.inputDoc,
    theme.primaryResource,
    theme.output,
    theme.safetyAction,
    theme.qualityCheck,
    theme.mainRisk,
    theme.evidence,
    theme.nonConformityAction,
    theme.kpi,
    theme.standardReference || '',
  ];

  return unique([
    ...genericWrongPools[category],
    ...themeHints.filter((value) => value !== theme.inputDoc),
  ]);
};

const beginnerQuestions = (theme: EducationalThemeProfile): QuestionFormData[] => [
  buildQuestion(
    `Antes de iniciar ${theme.shortLabel}, qual documento precisa estar coerente com a operação`,
    theme.inputDoc,
    'documento',
    getWrongOptions('document', theme),
    `${theme.key}-beginner-1`
  ),
  buildQuestion(
    `Qual recurso é o principal para executar ${theme.shortLabel}`,
    theme.primaryResource,
    'recurso',
    getWrongOptions('resource', theme),
    `${theme.key}-beginner-2`
  ),
  buildQuestion(
    `Quem normalmente executa ${theme.shortLabel}`,
    theme.responsibleRole,
    'responsável',
    getWrongOptions('role', theme),
    `${theme.key}-beginner-3`
  ),
  buildQuestion(
    `Qual é a saída esperada ao final de ${theme.shortLabel}`,
    theme.output,
    'saída',
    getWrongOptions('output', theme),
    `${theme.key}-beginner-4`
  ),
  buildQuestion(
    `Qual ao refora a segurança antes de comear ${theme.shortLabel}`,
    theme.safetyAction,
    'segurança',
    getWrongOptions('safety', theme),
    `${theme.key}-beginner-5`
  ),
  buildQuestion(
    `Qual conferência evita erros de qualidade em ${theme.shortLabel}`,
    theme.qualityCheck,
    'qualidade',
    getWrongOptions('quality', theme),
    `${theme.key}-beginner-6`
  ),
  buildQuestion(
    `Qual risco é evitado ao seguir a trilha de ${theme.shortLabel}`,
    theme.mainRisk,
    'risco',
    getWrongOptions('risk', theme),
    `${theme.key}-beginner-7`
  ),
  buildQuestion(
    `Que evidência deve ser registrada em ${theme.shortLabel}`,
    theme.evidence,
    'evidência',
    getWrongOptions('evidence', theme),
    `${theme.key}-beginner-8`
  ),
  buildQuestion(
    `Como agir diante de uma não conformidade em ${theme.shortLabel}`,
    theme.nonConformityAction,
    'não conformidade',
    getWrongOptions('nonConformity', theme),
    `${theme.key}-beginner-9`
  ),
  buildQuestion(
    `Qual indicador ajuda a acompanhar o desempenho de ${theme.shortLabel}`,
    theme.kpi,
    'kpi',
    getWrongOptions('kpi', theme),
    `${theme.key}-beginner-10`
  ),
];

const intermediateQuestions = (theme: EducationalThemeProfile): QuestionFormData[] => [
  buildQuestion(
    `Na trilha intermediria de ${theme.shortLabel}, o que deve ser validado antes da liberação`,
    theme.qualityCheck,
    'validação',
    getWrongOptions('quality', theme),
    `${theme.key}-intermediate-1`
  ),
  buildQuestion(
    `Qual ao preserva a rastreabilidade em ${theme.shortLabel}`,
    theme.evidence,
    'rastreabilidade',
    getWrongOptions('evidence', theme),
    `${theme.key}-intermediate-2`
  ),
  buildQuestion(
    `Quando houver desvio em ${theme.shortLabel}, qual é a atitude correta`,
    theme.nonConformityAction,
    'desvio',
    getWrongOptions('nonConformity', theme),
    `${theme.key}-intermediate-3`
  ),
  buildQuestion(
    `Qual referência técnica deve ser respeitada em ${theme.shortLabel}`,
    theme.standardReference || theme.qualityCheck,
    'referência',
    getWrongOptions('standard', theme),
    `${theme.key}-intermediate-4`
  ),
  buildQuestion(
    `Qual recurso reduz o risco de erro durante ${theme.shortLabel}`,
    theme.primaryResource,
    'ferramenta',
    getWrongOptions('resource', theme),
    `${theme.key}-intermediate-5`
  ),
  buildQuestion(
    `Qual indicador deve ser acompanhado para perceber instabilidade em ${theme.shortLabel}`,
    theme.kpi,
    'indicador',
    getWrongOptions('kpi', theme),
    `${theme.key}-intermediate-6`
  ),
  buildQuestion(
    `Qual resultado final confirma que a saída pode seguir adiante em ${theme.shortLabel}`,
    theme.output,
    'resultado',
    getWrongOptions('output', theme),
    `${theme.key}-intermediate-7`
  ),
  buildQuestion(
    `Qual aspecto técnico exige ateno especial em ${theme.shortLabel}`,
    theme.mainRisk,
    'ateno técnica',
    getWrongOptions('risk', theme),
    `${theme.key}-intermediate-8`
  ),
  buildQuestion(
    `Qual confirmao precisa existir antes de prosseguir com o lote em ${theme.shortLabel}`,
    theme.evidence,
    'confirmao',
    getWrongOptions('evidence', theme),
    `${theme.key}-intermediate-9`
  ),
  buildQuestion(
    `Quem deve ser acionado quando o padrão no for atendido em ${theme.shortLabel}`,
    theme.responsibleRole,
    'acionamento',
    getWrongOptions('role', theme),
    `${theme.key}-intermediate-10`
  ),
];

const expertQuestions = (theme: EducationalThemeProfile): QuestionFormData[] => [
  buildQuestion(
    `Qual é o ponto de controle mais crítico da trilha ${theme.shortLabel}`,
    theme.qualityCheck,
    'controle crítico',
    getWrongOptions('quality', theme),
    `${theme.key}-expert-1`
  ),
  buildQuestion(
    `Qual referência normativa ou padrão orienta a decisão técnica em ${theme.shortLabel}`,
    theme.standardReference || theme.qualityCheck,
    'norma',
    getWrongOptions('standard', theme),
    `${theme.key}-expert-2`
  ),
  buildQuestion(
    `Em que situao a operação de ${theme.shortLabel} deve ser interrompida`,
    theme.nonConformityAction,
    'interrupo',
    getWrongOptions('nonConformity', theme),
    `${theme.key}-expert-3`
  ),
  buildQuestion(
    `Qual evidncia sustenta a liberação do lote em ${theme.shortLabel}`,
    theme.evidence,
    'evidência',
    getWrongOptions('evidence', theme),
    `${theme.key}-expert-4`
  ),
  buildQuestion(
    `Qual fator mais compromete a repetibilidade de ${theme.shortLabel}`,
    theme.primaryResource,
    'repetibilidade',
    getWrongOptions('resource', theme),
    `${theme.key}-expert-5`
  ),
  buildQuestion(
    `Qual impacto um desvio pode gerar no cliente ou no processo em ${theme.shortLabel}`,
    theme.mainRisk,
    'impacto',
    getWrongOptions('risk', theme),
    `${theme.key}-expert-6`
  ),
  buildQuestion(
    `O que precisa ser conferido para garantir execução confivel em ${theme.shortLabel}`,
    theme.qualityCheck,
    'confiabilidade',
    getWrongOptions('quality', theme),
    `${theme.key}-expert-7`
  ),
  buildQuestion(
    `Qual indicador revela a necessidade de reforço da trilha ${theme.shortLabel}`,
    theme.kpi,
    'reforço',
    getWrongOptions('kpi', theme),
    `${theme.key}-expert-8`
  ),
  buildQuestion(
    `Qual ao protege o operador e o processo ao mesmo tempo em ${theme.shortLabel}`,
    theme.safetyAction,
    'proteção',
    getWrongOptions('safety', theme),
    `${theme.key}-expert-9`
  ),
  buildQuestion(
    `O que confirma domínio total da trilha especialista em ${theme.shortLabel}`,
    theme.output,
    'domínio',
    getWrongOptions('output', theme),
    `${theme.key}-expert-10`
  ),
];

const levelMeta: Record<EducationalLevel, { difficulty: AssessmentDifficulty; passingScore: number; xpReward: number }> = {
  beginner: { difficulty: 'beginner', passingScore: 60, xpReward: 100 },
  intermediate: { difficulty: 'intermediate', passingScore: 70, xpReward: 150 },
  expert: { difficulty: 'expert', passingScore: 80, xpReward: 200 },
};

export const EDUCATIONAL_TRACKS = EDUCATIONAL_THEMES.map((theme) => ({
  ...theme,
  levels: ['beginner', 'intermediate', 'expert'] as const,
}));

export const findEducationalThemeByTitle = (title: string | null) => {
  if (!title) return undefined;
  const normalizedTitle = normalize(title);
  return EDUCATIONAL_THEMES.find((theme) =>
    theme.processTitleMatchers.some((matcher) => normalizedTitle.includes(normalize(matcher)))
  );
};

export const buildEducationalAssessmentBundles = (processTitle: string | null): GeneratedAssessmentBundle[] => {
  const theme = findEducationalThemeByTitle(processTitle);
  const themes = theme ? [theme] : EDUCATIONAL_THEMES;

  return themes.flatMap((currentTheme) => {
    const themeBundles: GeneratedAssessmentBundle[] = [];

    (['beginner', 'intermediate', 'expert'] as const).forEach((level) => {
      const meta = levelMeta[level];
      const questions = level === 'beginner' ?
         beginnerQuestions(currentTheme)
        : level === 'intermediate' ?
           intermediateQuestions(currentTheme)
          : expertQuestions(currentTheme);

      themeBundles.push({
        themeKey: currentTheme.key,
        level,
        form: {
          title: `Trilha ${currentTheme.trackLabel} - ${level === 'beginner' ? 'Iniciante' : level === 'intermediate' ? 'Intermediário' : 'Especialista'}`,
          description: `Avaliao ${level === 'beginner' ? 'inicial' : level === 'intermediate' ? 'intermediria' : 'especialista'} da trilha ${currentTheme.trackLabel}. Use esta etapa para validar domnio do processo com foco em ${currentTheme.mainRisk.toLowerCase()}.`,
          question_count: 10,
          is_mandatory: true,
          passing_score: meta.passingScore,
          time_limit_seconds: undefined,
          tags: [
            `track:${currentTheme.key}`,
            `level:${level}`,
            `theme:${currentTheme.key.split('-')[0]}`,
            'educational',
            'gamification',
          ],
          difficulty: meta.difficulty,
          xp_reward: meta.xpReward,
          process_item_id: undefined,
        },
        questions,
      });
    });

    return themeBundles;
  });
};

export const getThemeBadgeType = (themeKey: string): BadgeType | undefined => {
  const theme = EDUCATIONAL_THEMES.find((item) => item.key === themeKey);
  return theme.badgeType;
};
