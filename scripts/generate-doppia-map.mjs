import fs from 'node:fs';
import path from 'node:path';

const outputPath = path.resolve('imports/mapa-serra-doppia-2-cabecas-plp.json');

const colors = {
  root: '#3b82f6',
  inputs: '#f59e0b',
  resources: '#f59e0b',
  methods: '#ef4444',
  outputs: '#10b981',
  people: '#8b5cf6',
  kpis: '#6366f1',
  quality: '#06b6d4',
  safety: '#facc15',
};

const itemMatrix = [
  ['530TUB04', 558, 10, 1, 1458],
  ['530TUB05', 1098, 10, 1, 924],
  ['530TUB06', 729, 5, 2, 1244],
  ['530TUB07', 797, 10, 1, 1197],
  ['530TUB08', 1076, 10, 1, 924],
  ['530TUB09', 162, 10, 1, 2052],
  ['530TUB10', 537, 10, 1, 1458],
  ['530TUB11', 446, 10, 1, 1512],
  ['530TUB20', 407, 10, 1, 1535],
  ['530TUB21', 193, 10, 1, 2012],
  ['530TUB22', 629, 10, 1, 1386],
  ['530TUB24', 615, 10, 1, 1425],
  ['530TUB25', 566, 10, 1, 1458],
  ['530TUB26', 765, 10, 1, 1244],
  ['530TUB27', 510, 10, 1, 1487],
  ['530TUB47', 425, 10, 1, 1535],
  ['530TUB50', 555, 10, 1, 1458],
];

const matrixText = itemMatrix
  .map(([code, length, perPackage, ties, target]) =>
    `${code}: ${length} mm | ${perPackage} peças por amarrado | ${ties} amarrado(s) | meta ${target} peças/h`)
  .join('\n');

const specs = [
  ['root', null, '1.0', 'Serra Doppia 2 Cabeças - Corte do Perfil TR-0073', 'root', 'process'],

  ['inputs', 'root', '2.0', 'Entradas e Parâmetros', 'inputs', 'process'],
  ['op', 'inputs', '2.1', 'Ordem de Produção e Identificação', 'inputs', 'record'],
  ['op-check', 'op', '2.1.1', 'Conferir OP, cliente, perfil e código', 'inputs', 'inspection'],
  ['matrix', 'op', '2.1.2', 'Matriz dos 17 Itens PLP', 'inputs', 'record'],
  ['material', 'inputs', '2.2', 'Material e Embalagem', 'inputs', 'process'],
  ['profile', 'material', '2.2.1', 'Perfil TR-0073 identificado', 'inputs', 'inspection'],
  ['package', 'material', '2.2.2', 'Etiqueta e padrão de embalagem PLP', 'inputs', 'record'],

  ['preparation', 'root', '3.0', 'Preparação e Regulagem', 'safety', 'process'],
  ['ppe', 'preparation', '3.1', 'Segurança antes de operar', 'safety', 'safety'],
  ['ppe-check', 'ppe', '3.1.1', 'Usar EPIs obrigatórios', 'safety', 'safety'],
  ['machine-safety', 'ppe', '3.1.2', 'Testar proteções e emergência', 'safety', 'inspection'],
  ['machine-condition', 'preparation', '3.2', 'Condição da Máquina', 'resources', 'inspection'],
  ['discs', 'machine-condition', '3.2.1', 'Conferir discos e limpeza', 'resources', 'inspection'],
  ['support', 'machine-condition', '3.2.2', 'Conferir apoio, fixação e área livre', 'resources', 'inspection'],
  ['setup', 'preparation', '3.3', 'Regulagem da Serra', 'methods', 'operation'],
  ['select-item', 'setup', '3.3.1', 'Selecionar item e comprimento', 'methods', 'operation'],
  ['adjust-heads', 'setup', '3.3.2', 'Ajustar cabeças e medida de corte', 'methods', 'critical_point'],
  ['fix-profile', 'setup', '3.3.3', 'Apoiar e fixar o perfil', 'methods', 'operation'],

  ['sequence', 'root', '4.0', 'Sequência Correta da Operação', 'methods', 'process'],
  ['pilot', 'sequence', '4.1', 'Peça Piloto', 'methods', 'process'],
  ['pilot-cut', 'pilot', '4.1.1', 'Executar o primeiro corte', 'methods', 'operation'],
  ['pilot-inspection', 'pilot', '4.1.2', 'Medir e inspecionar a peça piloto', 'quality', 'ctq'],
  ['pilot-decision', 'pilot', '4.1.3', 'Decidir: OK ou NOK', 'quality', 'decision'],
  ['serial', 'sequence', '4.2', 'Produção Seriada', 'methods', 'process'],
  ['feed', 'serial', '4.2.1', 'Alimentar e apoiar o perfil', 'methods', 'operation'],
  ['cut', 'serial', '4.2.2', 'Executar o corte com duas cabeças', 'methods', 'operation'],
  ['monitor', 'serial', '4.2.3', 'Monitorar esquadro, rebarba e discos', 'quality', 'inspection'],
  ['periodic', 'serial', '4.2.4', 'Inspecionar e registrar periodicamente', 'quality', 'audit'],

  ['quality', 'root', '5.0', 'Inspeção e Controle da Qualidade', 'quality', 'process'],
  ['ok-criteria', 'quality', '5.1', 'Critérios de Aprovação', 'outputs', 'ok'],
  ['nok-criteria', 'quality', '5.2', 'Critérios de Reprovação', 'methods', 'nok'],
  ['nok-reaction', 'quality', '5.3', 'Plano de Reação NOK', 'methods', 'corrective_action'],
  ['stop-segregate', 'nok-reaction', '5.3.1', 'Parar e segregar o material', 'methods', 'block'],
  ['last-pieces', 'nok-reaction', '5.3.2', 'Verificar as últimas peças cortadas', 'quality', 'inspection'],
  ['correct-setup', 'nok-reaction', '5.3.3', 'Corrigir regulagem e refazer piloto', 'methods', 'corrective_action'],
  ['record-escalate', 'nok-reaction', '5.3.4', 'Registrar e acionar a Qualidade', 'quality', 'evidence'],

  ['failures', 'root', '6.0', 'Falhas Comuns e Como Agir', 'methods', 'troubleshooting'],
  ['wrong-length', 'failures', '6.1', 'Comprimento fora do especificado', 'methods', 'error'],
  ['bad-cut', 'failures', '6.2', 'Rebarba ou corte irregular', 'methods', 'error'],
  ['surface-damage', 'failures', '6.3', 'Risco, amassado ou deformação', 'methods', 'deviation'],
  ['mix-up', 'failures', '6.4', 'Mistura, quantidade ou etiqueta incorreta', 'methods', 'deviation'],

  ['finish', 'root', '7.0', 'Finalização e Limpeza', 'outputs', 'process'],
  ['count-pack', 'finish', '7.1', 'Contar e embalar conforme o item', 'outputs', 'operation'],
  ['identify-move', 'finish', '7.2', 'Identificar e movimentar sem danos', 'outputs', 'record'],
  ['production-record', 'finish', '7.3', 'Registrar produção e desvios', 'outputs', 'evidence'],
  ['clean-shutdown', 'finish', '7.4', 'Limpar, desligar e organizar', 'safety', 'operation'],

  ['people', 'root', '8.0', 'Responsabilidades', 'people', 'process'],
  ['operator', 'people', '8.1', 'Operador da Serra', 'people', 'operation'],
  ['helper', 'people', '8.2', 'Auxiliar de Produção', 'people', 'operation'],
  ['quality-role', 'people', '8.3', 'Qualidade e Liderança', 'people', 'audit'],

  ['kpis', 'root', '9.0', 'Indicadores do Processo', 'kpis', 'process'],
  ['kpi-conformity', 'kpis', '9.1', 'Conformidade Dimensional', 'kpis', 'ctq'],
  ['kpi-productivity', 'kpis', '9.2', 'Produtividade por Item', 'kpis', 'record'],
  ['kpi-scrap', 'kpis', '9.3', 'Refugo e Retrabalho', 'kpis', 'record'],
  ['kpi-traceability', 'kpis', '9.4', 'Rastreabilidade dos Lotes', 'kpis', 'audit'],
];

const childrenByParent = new Map();
for (const [id, parent] of specs) {
  if (!parent) continue;
  if (!childrenByParent.has(parent)) childrenByParent.set(parent, []);
  childrenByParent.get(parent).push(id);
}

const specById = new Map(specs.map((spec) => [spec[0], spec]));
const leafOrder = [];
const collectLeaves = (id) => {
  const children = childrenByParent.get(id) || [];
  if (!children.length) {
    leafOrder.push(id);
    return;
  }
  children.forEach(collectLeaves);
};
collectLeaves('root');

const positions = new Map();
const setPosition = (id, depth) => {
  const children = childrenByParent.get(id) || [];
  if (!children.length) {
    const y = leafOrder.indexOf(id) * 138;
    positions.set(id, { x: depth * 360, y });
    return y;
  }
  const childYs = children.map((child) => setPosition(child, depth + 1));
  const y = childYs.reduce((sum, value) => sum + value, 0) / childYs.length;
  positions.set(id, { x: depth * 360, y });
  return y;
};
setPosition('root', 0);

const nodes = specs.map(([id, , numberCode, label, category, advancedType]) => ({
  id,
  type: 'mindmap',
  position: positions.get(id),
  data: {
    label,
    nodeType: category,
    category,
    numberCode,
    nodeTypeAdvanced: advancedType,
  },
}));

const edges = specs
  .filter(([, parent]) => parent)
  .map(([id, parent, , , category]) => ({
    id: `e-${parent}-${id}`,
    source: parent,
    target: id,
    type: 'smoothstep',
    animated: false,
    style: {
      stroke: colors[category] || '#64748b',
      strokeWidth: category === 'safety' || category === 'quality' ? 2.2 : 1.8,
      ...(category === 'resources' ? { strokeDasharray: '7 5' } : {}),
    },
  }));

const defaultOperational = (advancedType, category) => ({
  nodeTypeAdvanced: advancedType,
  severity: ['error', 'nok', 'block'].includes(advancedType) ? 'high' : 'medium',
  riskLevel: category === 'safety' ? 'high' : ['error', 'nok', 'deviation', 'block'].includes(advancedType) ? 'high' : 'none',
  auditRequired: ['audit', 'record', 'evidence', 'ctq'].includes(advancedType),
  ctq: advancedType === 'ctq',
  inspectionFrequency: '',
  reactionPlan: {
    trigger: '',
    actions: [],
    containmentActions: [],
    escalationActions: [],
    stopProductionCriteria: [],
    owner: '',
  },
  troubleshooting: {
    commonFailures: [],
    symptoms: [],
    probableCauses: [],
    immediateActions: [],
    stopCriteria: [],
    whoToCall: [],
    requiredEvidence: [],
    customerImpact: '',
  },
  visualPriority: ['ctq', 'error', 'nok', 'block', 'safety', 'critical_point'].includes(advancedType) ? 'important' : 'normal',
  operationalMode: ['operator', 'quality', 'audit', 'troubleshooting', 'training'],
  requiresEvidence: ['inspection', 'ctq', 'record', 'evidence', 'audit', 'nok', 'release'].includes(advancedType),
  requiresApproval: ['decision', 'release', 'block', 'nok', 'audit'].includes(advancedType),
  requiredIATF: '',
  specialCharacteristic: '',
  customer: 'PLP',
  traceability: 'OP, lote do perfil, item produzido, quantidade e identificação do amarrado',
  requiredRecords: [],
  evidenceExamples: [],
  lessonsLearned: [],
  approvalCriteria: [],
  okFlow: [],
  nokFlow: [],
});

const defaultDetail = ([id, , , label, category, advancedType]) => ({
  description: `${label}. Execute esta etapa conforme a Ordem de Produção e o padrão PLP, sem avançar quando houver dúvida ou desvio.`,
  images: [],
  tasks: [
    { id: `${id}-1`, text: `Conferir: ${label}`, completed: false },
    { id: `${id}-2`, text: 'Registrar ou comunicar qualquer desvio encontrado', completed: false },
  ],
  howTo: [
    { order: 1, instruction: `Confirme os requisitos de ${label.toLowerCase()}.` },
    { order: 2, instruction: 'Execute a atividade sem improvisar regulagens ou critérios.' },
    { order: 3, instruction: 'Valide o resultado antes de seguir para a próxima etapa.' },
  ],
  ifOK: {
    result: 'Requisito atendido',
    action: 'Registrar quando aplicável e seguir o fluxo',
    nextStep: 'Avançar para a próxima etapa',
    alertLevel: 'success',
  },
  ifNOK: {
    result: 'Requisito não atendido',
    action: 'Interromper a etapa, conter o material e comunicar a liderança',
    nextStep: 'Aplicar o plano de reação do processo',
    alertLevel: 'danger',
  },
  tips: [{ icon: 'info', message: 'Na dúvida, não produza. Confirme a OP ou acione a liderança.' }],
  operational: defaultOperational(advancedType, category),
});

const details = Object.fromEntries(specs.map((spec) => [spec[0], defaultDetail(spec)]));

const update = (id, patch) => {
  const current = details[id];
  details[id] = {
    ...current,
    ...patch,
    operational: {
      ...current.operational,
      ...(patch.operational || {}),
      reactionPlan: {
        ...current.operational.reactionPlan,
        ...(patch.operational?.reactionPlan || {}),
      },
      troubleshooting: {
        ...current.operational.troubleshooting,
        ...(patch.operational?.troubleshooting || {}),
      },
    },
  };
};

update('root', {
  description: 'Instrução visual para preparar, regular, operar e finalizar cortes do perfil de alumínio TR-0073 na Serra Doppia de 2 cabeças. Consolida 17 instruções de trabalho PLP em um único fluxo seguro, rastreável e fácil de consultar.',
  tasks: [
    { id: 'root-1', text: 'Ler a OP e selecionar o item correto na matriz', completed: false },
    { id: 'root-2', text: 'Cumprir a inspeção de segurança e executar peça piloto', completed: false },
    { id: 'root-3', text: 'Liberar produção somente após conformidade dimensional e visual', completed: false },
    { id: 'root-4', text: 'Embalar, identificar, registrar e finalizar a área', completed: false },
  ],
});

update('op-check', {
  description: 'Antes de regular a máquina, compare fisicamente a OP com o material disponível. Confirme cliente PLP, perfil TR-0073, código 530TUB, comprimento final, quantidade, lote e padrão de embalagem.',
  howTo: [
    { order: 1, instruction: 'Leia o código do item e o comprimento final na OP.' },
    { order: 2, instruction: 'Confirme que o perfil recebido é TR-0073 e está identificado.' },
    { order: 3, instruction: 'Compare quantidade, cliente, lote e embalagem com a matriz PLP.' },
    { order: 4, instruction: 'Não ajuste a serra se qualquer informação estiver divergente.' },
  ],
  operational: {
    requiredRecords: ['Ordem de Produção', 'Identificação do lote de matéria-prima'],
    approvalCriteria: ['Código, perfil, comprimento, quantidade e cliente coincidem com a OP'],
  },
});

update('matrix', {
  description: `Matriz consolidada dos itens analisados. A OP sempre prevalece em caso de revisão:\n\n${matrixText}\n\nTodos os itens totalizam 10 peças por conjunto de embalagem; o 530TUB06 é dividido em 2 amarrados de 5 peças.`,
  tasks: itemMatrix.map(([code, length], index) => ({
    id: `matrix-${index + 1}`,
    text: `${code} - confirmar comprimento de ${length} mm antes do setup`,
    completed: false,
  })),
  operational: {
    auditRequired: true,
    requiresEvidence: true,
    requiredRecords: ['OP vigente', 'Matriz do item e produtividade'],
    evidenceExamples: ['Foto ou leitura do código do item', 'Registro do comprimento configurado'],
  },
});

update('ppe-check', {
  description: 'Use óculos de segurança, protetor auricular, calçado de segurança, uniforme e luvas adequadas somente para manuseio do perfil. Nunca aproxime luvas ou mãos de partes em movimento.',
  howTo: [
    { order: 1, instruction: 'Coloque óculos, protetor auricular e calçado de segurança.' },
    { order: 2, instruction: 'Verifique se uniforme, cabelos e acessórios estão presos.' },
    { order: 3, instruction: 'Use luvas para manusear o alumínio, respeitando o risco de aprisionamento.' },
  ],
  operational: {
    severity: 'critical',
    riskLevel: 'critical',
    visualPriority: 'critical',
    reactionPlan: {
      trigger: 'EPI ausente, danificado ou inadequado',
      actions: ['Não iniciar a máquina', 'Providenciar o EPI correto'],
      stopProductionCriteria: ['Operador sem proteção ocular ou auditiva', 'Risco de aprisionamento por roupa ou acessório'],
      owner: 'Operador e liderança da área',
    },
  },
});

update('machine-safety', {
  description: 'Antes do primeiro ciclo, confira proteções fixas e móveis, intertravamentos, comandos bimanuais quando aplicáveis e botão de emergência. A máquina não pode operar com proteção removida ou segurança anulada.',
  operational: {
    severity: 'critical',
    riskLevel: 'critical',
    visualPriority: 'critical',
    requiresApproval: true,
    approvalCriteria: ['Proteções íntegras', 'Emergência funcional', 'Nenhum dispositivo de segurança burlado'],
    reactionPlan: {
      trigger: 'Proteção, emergência ou intertravamento com falha',
      actions: ['Bloquear o uso da máquina', 'Sinalizar equipamento indisponível'],
      escalationActions: ['Acionar liderança e manutenção'],
      stopProductionCriteria: ['Qualquer falha de segurança'],
      owner: 'Operador, liderança e manutenção',
    },
  },
});

update('discs', {
  description: 'Inspecione visualmente os dois discos: fixação, desgaste, dentes quebrados, acúmulo de cavaco e ruído anormal. Limpe somente com a máquina parada, isolada e conforme procedimento de segurança.',
  operational: {
    riskLevel: 'high',
    approvalCriteria: ['Discos fixos, íntegros e adequados ao alumínio', 'Área de corte limpa'],
    troubleshooting: {
      commonFailures: ['Dente quebrado', 'Disco desgastado', 'Acúmulo de cavaco'],
      symptoms: ['Rebarba excessiva', 'Ruído ou vibração', 'Corte irregular'],
      probableCauses: ['Disco danificado', 'Fixação incorreta', 'Limpeza insuficiente'],
      immediateActions: ['Parar a máquina', 'Bloquear o equipamento', 'Acionar manutenção'],
      stopCriteria: ['Ruído anormal', 'Vibração', 'Dano visível no disco'],
      whoToCall: ['Liderança', 'Manutenção'],
      requiredEvidence: ['Foto do disco ou condição encontrada', 'Registro da intervenção'],
      customerImpact: 'Corte irregular, rebarba, dimensão instável ou dano à peça.',
    },
  },
});

update('adjust-heads', {
  description: 'Ajuste a posição das cabeças e o comprimento final exatamente conforme a OP. Faça a regulagem com a máquina em condição segura, sem colocar mãos na zona de corte.',
  howTo: [
    { order: 1, instruction: 'Selecione o código do item e leia o comprimento final na OP.' },
    { order: 2, instruction: 'Ajuste a distância entre as cabeças para o comprimento especificado.' },
    { order: 3, instruction: 'Confirme batentes, referências e ângulos antes de fixar a regulagem.' },
    { order: 4, instruction: 'Registre ou sinalize o valor configurado e prepare a peça piloto.' },
  ],
  operational: {
    severity: 'high',
    riskLevel: 'high',
    ctq: true,
    specialCharacteristic: 'Comprimento final e esquadro do corte',
    approvalCriteria: ['Medida configurada igual à OP', 'Cabeças e batentes firmemente travados'],
    requiredRecords: ['Comprimento configurado', 'Código do item'],
  },
});

update('pilot-inspection', {
  description: 'A primeira peça define a liberação do lote. Meça o comprimento e verifique esquadro, rebarba, amassados, riscos e deformação. Use trena ou paquímetro calibrado conforme tolerância e criticidade.',
  howTo: [
    { order: 1, instruction: 'Retire a peça com segurança e elimine cavacos soltos da região medida.' },
    { order: 2, instruction: 'Meça o comprimento nos pontos definidos pela OP ou desenho.' },
    { order: 3, instruction: 'Verifique esquadro, acabamento das duas faces e ausência de danos.' },
    { order: 4, instruction: 'Registre o resultado e só libere se todos os critérios estiverem conformes.' },
  ],
  operational: {
    severity: 'high',
    riskLevel: 'high',
    visualPriority: 'critical',
    auditRequired: true,
    ctq: true,
    inspectionFrequency: 'Primeira peça após cada setup, troca de item ou correção de regulagem',
    specialCharacteristic: 'Comprimento final, esquadro e acabamento do corte',
    requiredRecords: ['Registro de liberação da primeira peça'],
    evidenceExamples: ['Valor medido', 'Identificação do instrumento', 'Assinatura ou identificação do responsável'],
    approvalCriteria: ['Comprimento dentro da especificação', 'Corte esquadrejado', 'Sem rebarba excessiva', 'Sem dano superficial ou deformação'],
    okFlow: ['Registrar aprovação', 'Liberar produção seriada'],
    nokFlow: ['Parar', 'Segregar peça', 'Corrigir regulagem', 'Produzir nova peça piloto'],
  },
});

update('pilot-decision', {
  description: 'Decisão obrigatória antes da produção seriada. OK: registrar e liberar. NOK: não produzir; segregar a peça, corrigir o setup e repetir toda a inspeção da peça piloto.',
  ifOK: {
    result: 'Peça piloto conforme',
    action: 'Registrar a aprovação e liberar a produção seriada',
    nextStep: '4.2 Produção Seriada',
    alertLevel: 'success',
  },
  ifNOK: {
    result: 'Peça piloto fora da especificação',
    action: 'Segregar, corrigir a regulagem e produzir nova peça piloto',
    nextStep: '5.3 Plano de Reação NOK',
    alertLevel: 'danger',
  },
});

update('cut', {
  description: 'Com o perfil corretamente apoiado e fixado, mantenha mãos fora da zona de corte, acione o ciclo conforme o comando da máquina e aguarde a parada completa antes de retirar a peça.',
  howTo: [
    { order: 1, instruction: 'Encoste o perfil na referência sem forçar ou inclinar.' },
    { order: 2, instruction: 'Confirme que o perfil está apoiado e preso pelos dispositivos.' },
    { order: 3, instruction: 'Retire as mãos da zona de risco e acione o ciclo.' },
    { order: 4, instruction: 'Aguarde a parada completa dos discos antes de retirar a peça.' },
    { order: 5, instruction: 'Posicione a peça cortada de modo a evitar riscos e mistura.' },
  ],
  operational: {
    severity: 'critical',
    riskLevel: 'critical',
    reactionPlan: {
      trigger: 'Movimento inesperado, ruído, vibração, fixação insuficiente ou presença na zona de risco',
      actions: ['Interromper o ciclo com segurança', 'Não tocar em partes móveis'],
      escalationActions: ['Acionar liderança ou manutenção'],
      stopProductionCriteria: ['Perfil solto', 'Disco em condição anormal', 'Proteção aberta ou falha'],
      owner: 'Operador',
    },
  },
});

update('periodic', {
  description: 'Durante o lote, repita a medição conforme o plano de controle, após parada, ajuste, troca de material ou qualquer sinal de desvio. Registre os resultados para garantir rastreabilidade.',
  operational: {
    inspectionFrequency: 'Conforme plano de controle e sempre após parada, ajuste ou suspeita de desvio',
    auditRequired: true,
    requiresEvidence: true,
    requiredRecords: ['Ficha de inspeção', 'Apontamento do lote'],
    evidenceExamples: ['Medidas registradas', 'Horário', 'Item e lote', 'Responsável'],
  },
});

update('ok-criteria', {
  description: 'Aprovar somente quando: comprimento conforme OP/desenho; corte limpo e esquadrejado; sem rebarba excessiva; sem risco, amassado ou deformação crítica; quantidade e identificação corretas.',
  operational: {
    approvalCriteria: [
      'Comprimento conforme OP ou desenho',
      'Corte limpo, uniforme e esquadrejado',
      'Sem rebarba excessiva',
      'Sem amassado, risco crítico ou deformação',
      'Quantidade, embalagem e identificação corretas',
    ],
    okFlow: ['Liberar para embalagem', 'Registrar conformidade'],
  },
});

update('nok-criteria', {
  description: 'Reprovar quando houver dimensão fora da especificação, rebarba ou corte irregular, dano que comprometa o uso, item misturado, quantidade incorreta ou ausência de identificação.',
  operational: {
    severity: 'high',
    riskLevel: 'high',
    nokFlow: ['Parar produção', 'Identificar e segregar', 'Verificar extensão do desvio', 'Acionar Qualidade'],
    reactionPlan: {
      trigger: 'Qualquer critério de aprovação não atendido',
      actions: ['Parar produção', 'Segregar o material suspeito'],
      containmentActions: ['Inspecionar peças desde a última verificação aprovada'],
      escalationActions: ['Acionar Qualidade e liderança'],
      stopProductionCriteria: ['Dimensão fora', 'Mistura de item', 'Dano recorrente'],
      owner: 'Operador e Qualidade',
    },
  },
});

update('wrong-length', {
  description: 'Sintoma: medida acima, abaixo ou variando. Causas prováveis: regulagem incorreta, batente solto, cavaco na referência, perfil mal apoiado ou instrumento inadequado.',
  operational: {
    severity: 'high',
    riskLevel: 'high',
    troubleshooting: {
      commonFailures: ['Comprimento acima da especificação', 'Comprimento abaixo da especificação', 'Medida instável'],
      symptoms: ['Resultados diferentes entre peças', 'Peça piloto NOK'],
      probableCauses: ['Cabeças ou batente desajustados', 'Cavaco na referência', 'Perfil mal apoiado', 'Instrumento inadequado'],
      immediateActions: ['Parar', 'Segregar desde a última medição OK', 'Limpar referências', 'Reajustar e refazer peça piloto'],
      stopCriteria: ['Uma peça fora da especificação', 'Repetição ou variação crescente'],
      whoToCall: ['Liderança', 'Qualidade', 'Manutenção se houver folga'],
      requiredEvidence: ['Medidas encontradas', 'Quantidade segregada', 'Causa e correção'],
      customerImpact: 'Peça não monta, gera folga, desalinhamento ou rejeição no cliente.',
    },
  },
});

update('bad-cut', {
  description: 'Sintoma: rebarba excessiva, face irregular, perda de esquadro, ruído ou vibração. Pare e verifique disco, fixação, apoio e limpeza; não continue compensando manualmente.',
  operational: {
    severity: 'high',
    riskLevel: 'high',
    troubleshooting: {
      commonFailures: ['Rebarba excessiva', 'Corte inclinado', 'Face irregular'],
      symptoms: ['Ruído', 'Vibração', 'Marcas anormais na face'],
      probableCauses: ['Disco desgastado ou danificado', 'Perfil mal fixado', 'Apoio desalinhado', 'Acúmulo de cavaco'],
      immediateActions: ['Parar', 'Segregar peças afetadas', 'Inspecionar discos e fixação', 'Acionar manutenção quando necessário'],
      stopCriteria: ['Ruído ou vibração anormal', 'Dano no disco', 'Perda de esquadro'],
      whoToCall: ['Liderança', 'Manutenção', 'Qualidade'],
      requiredEvidence: ['Foto do corte', 'Registro das peças segregadas'],
      customerImpact: 'Dificuldade de montagem, risco de corte, aparência ruim e rejeição.',
    },
  },
});

update('surface-damage', {
  description: 'Riscos, amassados e deformações normalmente são causados por apoio sujo, queda, atrito, empilhamento inadequado ou manuseio brusco. Segregue e elimine a causa antes de continuar.',
  operational: {
    troubleshooting: {
      commonFailures: ['Risco superficial', 'Amassado', 'Perfil deformado'],
      symptoms: ['Marca visual', 'Dificuldade de encaixe', 'Geometria alterada'],
      probableCauses: ['Apoio com cavaco', 'Queda ou impacto', 'Arraste de peças', 'Empilhamento incorreto'],
      immediateActions: ['Segregar', 'Limpar apoios', 'Corrigir forma de manuseio'],
      stopCriteria: ['Dano recorrente', 'Deformação funcional'],
      whoToCall: ['Liderança', 'Qualidade'],
      requiredEvidence: ['Foto do dano', 'Quantidade afetada'],
      customerImpact: 'Defeito visual, falha de montagem ou rejeição do produto.',
    },
  },
});

update('mix-up', {
  description: 'Mistura de códigos, falta de etiqueta ou quantidade errada elimina a rastreabilidade. Pare a expedição do material, reconte, identifique e separe cada item antes da liberação.',
  operational: {
    severity: 'high',
    riskLevel: 'high',
    troubleshooting: {
      commonFailures: ['Código misturado', 'Etiqueta ausente', 'Quantidade incorreta'],
      symptoms: ['Peças diferentes no mesmo amarrado', 'Pacote sem identificação', 'Contagem divergente'],
      probableCauses: ['Área sem segregação', 'Troca de item sem limpeza', 'Falha de contagem'],
      immediateActions: ['Bloquear movimentação', 'Segregar por código', 'Recontar e reetiquetar'],
      stopCriteria: ['Impossibilidade de confirmar a rastreabilidade'],
      whoToCall: ['Liderança', 'Qualidade', 'PCP'],
      requiredEvidence: ['Registro da reconciliação', 'Nova identificação'],
      customerImpact: 'Envio de item incorreto, parada no cliente e perda de rastreabilidade.',
    },
  },
});

update('count-pack', {
  description: 'Conte e embale conforme a matriz do item. Regra geral: 10 peças por conjunto. Exceção: 530TUB06 em 2 amarrados de 5 peças. Proteja as superfícies e mantenha os códigos separados.',
  howTo: [
    { order: 1, instruction: 'Confirme o item na OP e consulte a matriz.' },
    { order: 2, instruction: 'Conte as peças conformes, sem incluir material segregado.' },
    { order: 3, instruction: 'Forme o amarrado conforme a quantidade prevista.' },
    { order: 4, instruction: 'Proteja e fixe o conjunto sem marcar ou deformar os perfis.' },
  ],
});

update('identify-move', {
  description: 'Aplique etiqueta legível com item, quantidade, lote e demais dados exigidos. Movimente o amarrado para a área definida sem arrastar, bater ou misturar com outro código.',
  operational: {
    requiredRecords: ['Etiqueta do amarrado', 'Identificação do lote'],
    evidenceExamples: ['Etiqueta legível', 'Local de destino correto'],
    approvalCriteria: ['Item, quantidade e lote corretos', 'Amarrado sem dano'],
  },
});

update('clean-shutdown', {
  description: 'Ao terminar o lote ou turno, pare e desligue a máquina conforme o procedimento, remova cavacos somente em condição segura, limpe apoios e referências, organize instrumentos e deixe a área pronta para o próximo uso.',
  howTo: [
    { order: 1, instruction: 'Conclua o último ciclo e confirme que os discos pararam.' },
    { order: 2, instruction: 'Desligue ou isole a energia conforme o procedimento aplicável.' },
    { order: 3, instruction: 'Remova cavacos com ferramenta adequada; nunca use as mãos.' },
    { order: 4, instruction: 'Limpe apoios, referências e área ao redor da máquina.' },
    { order: 5, instruction: 'Guarde instrumentos e informe qualquer anomalia pendente.' },
  ],
  operational: {
    riskLevel: 'high',
    approvalCriteria: ['Máquina em condição segura', 'Área limpa e organizada', 'Anomalias comunicadas'],
  },
});

update('operator', {
  description: 'Responsável por conferir a OP, realizar inspeção pré-operacional, regular a serra, executar e medir a peça piloto, produzir, monitorar o processo, registrar resultados e interromper diante de risco ou desvio.',
});
update('helper', {
  description: 'Apoia o abastecimento, retirada, contagem, embalagem, identificação e movimentação, sempre preservando segurança, segregação dos códigos e integridade superficial.',
});
update('quality-role', {
  description: 'A Qualidade avalia desvios, define disposição e confirma liberações quando necessário. A liderança garante recursos, treinamento, disciplina do processo e acionamento da manutenção.',
});

update('kpi-conformity', {
  description: 'Percentual de peças e lotes aprovados nas inspeções dimensionais e visuais. Meta: manter conformidade estável e agir imediatamente em qualquer tendência de desvio.',
  operational: { inspectionFrequency: 'Por lote e período definido no plano de controle', ctq: true },
});
update('kpi-productivity', {
  description: `Compare a produção real com a meta do item, sem sacrificar segurança ou qualidade.\n\n${matrixText}`,
});
update('kpi-scrap', {
  description: 'Monitore quantidade e causa de refugo e retrabalho. Toda recorrência deve gerar análise da regulagem, disco, apoio, método, material e treinamento.',
});
update('kpi-traceability', {
  description: 'Percentual de amarrados com vínculo completo entre OP, lote do perfil, código, quantidade, inspeção e responsável. A rastreabilidade deve permanecer íntegra até a entrega.',
  operational: {
    auditRequired: true,
    requiresEvidence: true,
    requiredRecords: ['OP', 'Lote de matéria-prima', 'Inspeções', 'Etiqueta do amarrado', 'Apontamento de produção'],
  },
});

const map = {
  schema: 'tecnomapper.map.json',
  version: 1,
  exportedAt: new Date().toISOString(),
  title: 'Instrução de Trabalho - Serra Doppia 2 Cabeças',
  description: 'Mapa operacional consolidado para corte do perfil TR-0073 na Serra Doppia de 2 cabeças, com 17 itens PLP, segurança, regulagem, peça piloto, inspeção, reação NOK, embalagem e finalização.',
  visibility: 'public',
  tags: ['serra-doppia', '2-cabecas', 'TR-0073', 'PLP', 'usinagem', 'corte', 'instrucao-de-trabalho'],
  layout: 'LR',
  nodes,
  edges,
  node_details: details,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(map, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  outputPath,
  nodes: nodes.length,
  edges: edges.length,
  details: Object.keys(details).length,
  items: itemMatrix.length,
}, null, 2));
