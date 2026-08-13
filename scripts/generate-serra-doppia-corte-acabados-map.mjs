import fs from 'node:fs';
import path from 'node:path';

const outputPath = path.resolve('imports/mapa-operacao-corte-acabados-serra-doppia.json');

const modes = ['operator', 'quality', 'audit', 'troubleshooting', 'training'];

const metadata = (type, options = {}) => ({
  nodeTypeAdvanced: type,
  severity: options.severity || 'medium',
  riskLevel: options.riskLevel || 'none',
  auditRequired: Boolean(options.auditRequired),
  ctq: Boolean(options.ctq),
  inspectionFrequency: options.inspectionFrequency || '',
  reactionPlan: {
    trigger: options.trigger || '',
    actions: options.reactionActions || [],
    containmentActions: options.containmentActions || [],
    escalationActions: options.escalationActions || [],
    stopProductionCriteria: options.stopCriteria || [],
    owner: options.owner || '',
  },
  troubleshooting: {
    commonFailures: options.commonFailures || [],
    symptoms: options.symptoms || [],
    probableCauses: options.probableCauses || [],
    immediateActions: options.immediateActions || [],
    stopCriteria: options.stopCriteria || [],
    whoToCall: options.whoToCall || [],
    requiredEvidence: options.evidenceExamples || [],
    customerImpact: options.customerImpact || '',
  },
  visualPriority: options.visualPriority || 'normal',
  operationalMode: options.operationalMode || modes,
  requiresEvidence: Boolean(options.requiresEvidence),
  requiresApproval: Boolean(options.requiresApproval),
  requiredIATF: options.requiredIATF || '',
  specialCharacteristic: options.specialCharacteristic || '',
  customer: options.customer || '',
  traceability: options.traceability || '',
  requiredRecords: options.requiredRecords || [],
  evidenceExamples: options.evidenceExamples || [],
  lessonsLearned: options.lessonsLearned || [],
  approvalCriteria: options.approvalCriteria || [],
  okFlow: options.okFlow || [],
  nokFlow: options.nokFlow || [],
});

const definitions = [
  {
    id: 'root', code: '1.0', label: 'Operação de Corte e Acabados - Serra Doppia 2 Cabeças',
    category: 'root', nodeType: 'root', advanced: 'process', layer: 'procedure',
    description: 'Procedimento operacional que orienta o corte na Serra Doppia de 2 cabeças, desde o recebimento da ordem até a liberação do palete para expedição. Integra preparação, segurança, inspeções, reação a desvios, rastreabilidade e registros.',
    steps: ['Confirmar a ordem e os documentos aplicáveis.', 'Preparar material, máquina e programa.', 'Validar a primeira peça antes de produzir.', 'Inspecionar durante a produção e reagir a qualquer desvio.', 'Paletizar, identificar, inspecionar e liberar o produto.'],
    tip: 'O mapa define o fluxo. Cada atividade contém a instrução de execução e os registros exigidos.',
    meta: { visualPriority: 'important', auditRequired: true, requiresApproval: true, owner: 'Liderança de Corte e Acabados' },
  },
  {
    id: 'doc-governance', code: '2.0', label: 'Estrutura Documental', category: 'compliance', nodeType: 'methods', advanced: 'audit', layer: 'procedure',
    description: 'Separa claramente o que orienta o fluxo, o que ensina a execução e o que comprova a realização do trabalho.',
    steps: ['Usar o procedimento para entender o fluxo e as responsabilidades.', 'Usar a instrução para executar cada atividade.', 'Gerar o registro para comprovar resultado, inspeção e rastreabilidade.'],
    meta: { auditRequired: true, visualPriority: 'important' },
  },
  {
    id: 'procedure-definition', code: '2.1', label: 'Procedimento: o que deve acontecer', category: 'compliance', nodeType: 'methods', advanced: 'process', layer: 'procedure',
    description: 'Define o fluxo completo, as responsabilidades, as decisões OK/NOK e a sequência obrigatória. Responde: o que fazer, quando fazer e quem participa.',
    steps: ['Seguir as macroetapas na sequência do mapa.', 'Não avançar quando houver bloqueio ou requisito não atendido.', 'Consultar a instrução vinculada para saber como executar.'],
    meta: { auditRequired: true, requiredRecords: ['Revisão vigente do procedimento'] },
  },
  {
    id: 'instruction-definition', code: '2.2', label: 'Instrução: como executar', category: 'methods', nodeType: 'methods', advanced: 'operation', layer: 'instruction',
    description: 'Detalha a execução no posto: comandos, verificações, sequência, cuidados, critérios de aceitação e reação. Responde: como fazer corretamente e com segurança.',
    steps: ['Abrir o item da atividade no modo Operador.', 'Executar o passo a passo apresentado.', 'Comparar o resultado com o critério definido.', 'Se houver dúvida ou divergência, interromper e acionar a liderança.'],
    meta: { visualPriority: 'important' },
  },
  {
    id: 'record-definition', code: '2.3', label: 'Registro: evidência da execução', category: 'compliance', nodeType: 'methods', advanced: 'record', layer: 'record',
    description: 'Comprova o que foi executado, medido, aprovado, bloqueado, retrabalhado ou refugado. Deve permitir rastrear ordem, lote, operador, equipamento, resultado e data/hora.',
    steps: ['Registrar no momento da execução.', 'Usar informação legível, completa e rastreável.', 'Não apagar nem alterar resultado sem seguir a regra de correção de registro.', 'Anexar evidência quando exigido.'],
    meta: { auditRequired: true, requiresEvidence: true, requiredRecords: ['Registro de produção', 'Registro de inspeção', 'Registro de desvio quando aplicável'] },
  },
  {
    id: 'inputs', code: '3.0', label: 'Receber e Validar Entradas', category: 'inputs', nodeType: 'inputs', advanced: 'process', layer: 'procedure',
    description: 'Primeira etapa do processo: garantir que pedido, ordem, desenho, programa, material e requisitos estão corretos e coerentes entre si.',
    steps: ['Localizar a ordem e o pedido.', 'Conferir os documentos vigentes.', 'Confirmar material, quantidade e requisitos do cliente.', 'Bloquear o início se houver divergência.'],
    meta: { visualPriority: 'important', requiresApproval: true, owner: 'Operador / PCP' },
  },
  {
    id: 'production-order', code: '3.1', label: 'Ordem de Produção e Pedido', category: 'inputs', nodeType: 'inputs', advanced: 'record', layer: 'record',
    description: 'Fonte autorizada para identificar produto, quantidade, comprimento, prioridade, cliente e demais requisitos aplicáveis ao corte.',
    steps: ['Confirmar número da OP e do pedido.', 'Conferir código do produto e quantidade.', 'Validar prioridade e prazo aplicável.', 'Manter a OP identificada durante todo o lote.'],
    tip: 'Se OP, pedido e desenho não concordarem, não iniciar o corte.',
    meta: { auditRequired: true, requiresEvidence: true, traceability: 'Número da OP, pedido e lote de matéria-prima', requiredRecords: ['Ordem de Produção'], stopCriteria: ['Divergência entre OP, pedido e desenho'] },
  },
  {
    id: 'technical-drawing', code: '3.2', label: 'Desenho Técnico Vigente', category: 'inputs', nodeType: 'inputs', advanced: 'ctq', layer: 'record',
    description: 'Documento que define dimensões, tolerâncias, ângulos, acabamento e características especiais. Somente a revisão vigente pode orientar setup e inspeção.',
    steps: ['Confirmar código e revisão do desenho.', 'Identificar dimensões e tolerâncias de corte.', 'Identificar ângulos e acabamento exigidos.', 'Destacar características especiais, quando existentes.'],
    meta: { ctq: true, auditRequired: true, requiresEvidence: true, visualPriority: 'critical', specialCharacteristic: 'Conforme desenho técnico vigente', traceability: 'Código e revisão do desenho', requiredRecords: ['Desenho técnico vigente'], stopCriteria: ['Desenho ausente, ilegível ou com revisão divergente'] },
  },
  {
    id: 'system-data', code: '3.3', label: 'Localizar Dados no Sistema Vigente', category: 'inputs', nodeType: 'inputs', advanced: 'record', layer: 'instruction',
    description: 'Localizar pedido, relatório, sequência, quantidade e demais dados de apoio no sistema oficial da empresa. O nome exato do sistema citado no rascunho deve ser confirmado antes da publicação final.',
    steps: ['Pesquisar pelo número da OP ou pedido.', 'Comparar dados do sistema com a documentação física ou digital.', 'Confirmar quantidade e sequência.', 'Registrar ou comunicar qualquer divergência.'],
    tip: 'Ponto pendente: confirmar o nome oficial do sistema e qual relatório deve ser consultado.',
    meta: { auditRequired: true, requiredRecords: ['Consulta ao sistema oficial'], stopCriteria: ['Pedido não localizado ou dados divergentes'] },
  },
  {
    id: 'raw-material', code: '3.4', label: 'Matéria-Prima Correta', category: 'inputs', nodeType: 'inputs', advanced: 'inspection', layer: 'instruction',
    description: 'Perfil de alumínio correto, identificado, sem danos impeditivos e rastreável ao lote recebido.',
    steps: ['Conferir código e geometria do perfil.', 'Conferir lote e identificação.', 'Verificar amassados, riscos, empenamento e contaminação.', 'Separar somente a quantidade necessária e preservar a identificação.'],
    meta: { requiresEvidence: true, inspectionFrequency: 'A cada troca de lote ou abastecimento', traceability: 'Lote da matéria-prima', requiredRecords: ['Identificação do lote'], nokFlow: ['Segregar material', 'Identificar desvio', 'Acionar responsável'] },
  },
  {
    id: 'setup', code: '4.0', label: 'Preparar Máquina e Programa', category: 'resources', nodeType: 'resources', advanced: 'process', layer: 'procedure',
    description: 'Preparar a Serra Doppia para produzir com segurança e conforme os parâmetros definidos na documentação vigente.',
    steps: ['Separar e posicionar a matéria-prima.', 'Realizar verificação de segurança.', 'Referenciar a máquina.', 'Carregar e conferir o programa antes do primeiro corte.'],
    meta: { riskLevel: 'high', severity: 'high', visualPriority: 'important', requiresApproval: true, owner: 'Operador habilitado' },
  },
  {
    id: 'separate-material', code: '4.1', label: 'Separar e Posicionar Material', category: 'resources', nodeType: 'resources', advanced: 'operation', layer: 'instruction',
    description: 'Organizar o perfil para abastecimento seguro, evitando mistura, danos e perda de rastreabilidade.',
    steps: ['Levar ao posto somente o perfil liberado.', 'Manter lote e identificação visíveis.', 'Apoiar o perfil sem risco de queda ou deformação.', 'Evitar contato que possa riscar a superfície.'],
    meta: { riskLevel: 'medium', requiredRecords: ['Lote de matéria-prima vinculado à OP'] },
  },
  {
    id: 'safety-check', code: '4.2', label: 'Liberar Segurança da Máquina', category: 'safety', nodeType: 'safety', advanced: 'safety', layer: 'instruction',
    description: 'Verificação obrigatória antes de operar: EPIs, proteções, dispositivos de fixação, área livre e parada de emergência.',
    steps: ['Utilizar os EPIs definidos para o posto.', 'Confirmar proteções instaladas e íntegras.', 'Verificar emergência e dispositivos de segurança conforme checklist.', 'Manter mãos e corpo fora da zona de corte.', 'Não operar com proteção anulada ou defeituosa.'],
    tip: 'Intervenção, limpeza interna ou desobstrução exige parada segura e bloqueio conforme procedimento da empresa.',
    meta: { severity: 'critical', riskLevel: 'critical', visualPriority: 'critical', auditRequired: true, requiresEvidence: true, requiredRecords: ['Checklist de segurança do equipamento'], stopCriteria: ['Proteção ausente ou danificada', 'Emergência inoperante', 'Fixação insegura', 'Pessoa na zona de risco'], whoToCall: ['Liderança', 'Manutenção', 'Segurança do Trabalho'] },
  },
  {
    id: 'machine-reference', code: '4.3', label: 'Referenciar a Máquina', category: 'resources', nodeType: 'resources', advanced: 'operation', layer: 'instruction',
    description: 'Executar a referência dos eixos e confirmar que a máquina está pronta para receber o programa, sem alarmes impeditivos.',
    steps: ['Ligar a máquina conforme sequência autorizada.', 'Verificar alarmes e condições iniciais.', 'Executar o referenciamento conforme painel da máquina.', 'Confirmar posição de referência concluída.'],
    meta: { riskLevel: 'medium', commonFailures: ['Falha de referência', 'Alarme ativo'], immediateActions: ['Não forçar movimento', 'Consultar mensagem do painel', 'Acionar manutenção se necessário'], stopCriteria: ['Referência não concluída', 'Alarme impeditivo'] },
  },
  {
    id: 'load-program', code: '4.4', label: 'Carregar e Conferir Programa', category: 'resources', nodeType: 'resources', advanced: 'critical_point', layer: 'instruction',
    description: 'Selecionar o programa correto e comparar seus parâmetros com OP e desenho antes do primeiro corte.',
    steps: ['Selecionar programa pelo código autorizado.', 'Conferir comprimento e ângulos.', 'Conferir quantidade e sequência quando aplicável.', 'Confirmar batentes, cabeçotes e fixação.', 'Registrar liberação do setup, quando exigido.'],
    tip: 'O rascunho cita fotos das telas. Elas devem ser anexadas à IT após validação na máquina.',
    meta: { severity: 'high', riskLevel: 'high', visualPriority: 'critical', requiresApproval: true, requiresEvidence: true, specialCharacteristic: 'Parâmetros conforme desenho e OP', requiredRecords: ['Checklist ou liberação de setup'], stopCriteria: ['Programa não identificado', 'Parâmetro divergente', 'Fixação inadequada'] },
  },
  {
    id: 'first-piece', code: '5.0', label: 'Validar Primeiro Corte', category: 'quality', nodeType: 'quality', advanced: 'process', layer: 'procedure',
    description: 'Executar e inspecionar a primeira peça para impedir que um setup incorreto gere um lote não conforme.',
    steps: ['Executar um primeiro corte controlado.', 'Medir as características definidas.', 'Comparar com desenho e plano de controle.', 'Liberar produção somente após resultado conforme.'],
    meta: { severity: 'high', riskLevel: 'high', ctq: true, visualPriority: 'critical', auditRequired: true, requiresApproval: true, requiresEvidence: true },
  },
  {
    id: 'first-cut', code: '5.1', label: 'Executar Primeiro Corte', category: 'methods', nodeType: 'methods', advanced: 'operation', layer: 'instruction',
    description: 'Produzir a primeira peça com atenção ao posicionamento, fixação e comportamento da máquina.',
    steps: ['Posicionar o perfil na referência correta.', 'Confirmar apoio e fixação.', 'Manter a área livre e acionar o ciclo.', 'Aguardar fim do ciclo antes de acessar a peça.', 'Identificar a peça como primeira peça para inspeção.'],
    meta: { riskLevel: 'high', severity: 'high', requiresEvidence: true, evidenceExamples: ['Identificação da primeira peça'] },
  },
  {
    id: 'first-inspection', code: '5.2', label: 'Inspecionar Primeira Peça', category: 'quality', nodeType: 'quality', advanced: 'inspection', layer: 'instruction',
    description: 'Verificar todas as características de liberação previstas no desenho, IT e plano de controle, utilizando instrumento adequado e válido.',
    steps: ['Confirmar identificação da peça e da OP.', 'Medir comprimento e demais dimensões aplicáveis.', 'Verificar ângulos, esquadro e acabamento quando exigidos.', 'Registrar valores e resultado.', 'Solicitar aprovação da Qualidade quando o plano exigir.'],
    meta: { ctq: true, severity: 'high', riskLevel: 'high', auditRequired: true, requiresEvidence: true, requiresApproval: true, inspectionFrequency: 'Primeira peça após setup e após ajuste relevante', specialCharacteristic: 'Conforme desenho e plano de controle', requiredRecords: ['Registro de inspeção da primeira peça'], evidenceExamples: ['Valores medidos', 'Identificação do instrumento', 'Data, hora e responsável'], approvalCriteria: ['Todas as características dentro das especificações vigentes'] },
  },
  {
    id: 'first-decision', code: '5.3', label: 'Primeira Peça Conforme?', category: 'quality', nodeType: 'quality', advanced: 'decision', layer: 'procedure',
    description: 'Decisão de liberação: somente uma primeira peça integralmente conforme permite iniciar a produção.',
    steps: ['Revisar todos os resultados registrados.', 'Selecionar o fluxo OK ou NOK.', 'Não liberar sob dúvida ou registro incompleto.'],
    ok: { result: 'Peça conforme e registro completo.', action: 'Liberar o início da produção.', nextStep: '6.0 Produzir e Inspecionar o Lote', alertLevel: 'success' },
    nok: { result: 'Uma ou mais características fora do especificado.', action: 'Bloquear a produção e corrigir setup ou programa.', nextStep: '5.3.2 Ajustar Máquina ou Programa', alertLevel: 'critical' },
    meta: { severity: 'critical', riskLevel: 'high', visualPriority: 'critical', requiresApproval: true, requiredRecords: ['Decisão de liberação da primeira peça'], okFlow: ['Liberar produção'], nokFlow: ['Bloquear produção', 'Ajustar setup/programa', 'Realizar nova inspeção'] },
  },
  {
    id: 'first-ok', code: '5.3.1', label: 'OK: Liberar Produção', category: 'quality', nodeType: 'quality', advanced: 'release', layer: 'record',
    description: 'Formalizar a aprovação da primeira peça e autorizar o início do lote.',
    steps: ['Registrar resultado conforme.', 'Identificar responsável pela liberação.', 'Preservar registro e primeira peça quando exigido.', 'Iniciar produção conforme OP.'],
    meta: { requiresApproval: true, requiresEvidence: true, auditRequired: true, requiredRecords: ['Liberação da primeira peça'] },
  },
  {
    id: 'first-nok', code: '5.3.2', label: 'NOK: Ajustar Máquina ou Programa', category: 'alerts', nodeType: 'alerts', advanced: 'corrective_action', layer: 'instruction',
    description: 'Corrigir a causa do resultado não conforme sem iniciar a produção em série.',
    steps: ['Manter produção bloqueada.', 'Comparar desvio com programa, referência, fixação e ferramenta.', 'Corrigir somente o parâmetro autorizado.', 'Registrar o ajuste realizado.', 'Produzir nova peça para inspeção completa.'],
    meta: { severity: 'high', riskLevel: 'high', visualPriority: 'critical', requiresEvidence: true, trigger: 'Primeira peça fora da especificação', containmentActions: ['Bloquear início do lote', 'Identificar peça NOK'], reactionActions: ['Revisar referência', 'Revisar programa', 'Revisar fixação e condição de corte'], escalationActions: ['Acionar liderança ou Qualidade se a causa não for eliminada'], requiredRecords: ['Registro do ajuste e nova inspeção'] },
  },
  {
    id: 'reinspect-first', code: '5.3.2.1', label: 'Repetir Inspeção da Primeira Peça', category: 'quality', nodeType: 'quality', advanced: 'inspection', layer: 'instruction',
    description: 'Após qualquer ajuste, executar nova peça e repetir a inspeção completa antes de liberar.',
    steps: ['Produzir nova peça após o ajuste.', 'Repetir todas as verificações de liberação.', 'Registrar novos valores.', 'Retornar à decisão de conformidade.'],
    meta: { ctq: true, severity: 'high', requiresEvidence: true, requiresApproval: true, inspectionFrequency: 'Após cada ajuste', requiredRecords: ['Nova inspeção de primeira peça'] },
  },
  {
    id: 'production', code: '6.0', label: 'Produzir e Inspecionar o Lote', category: 'methods', nodeType: 'methods', advanced: 'process', layer: 'procedure',
    description: 'Executar o corte liberado, manter parâmetros controlados e realizar inspeções durante a produção conforme frequência definida.',
    steps: ['Produzir somente após liberação da primeira peça.', 'Preservar identificação e sequência.', 'Inspecionar na frequência vigente.', 'Parar imediatamente diante de desvio ou condição insegura.'],
    meta: { visualPriority: 'important', auditRequired: true, owner: 'Operador de corte' },
  },
  {
    id: 'serial-cut', code: '6.1', label: 'Executar Corte em Produção', category: 'methods', nodeType: 'methods', advanced: 'operation', layer: 'instruction',
    description: 'Realizar o ciclo produtivo mantendo perfil corretamente apoiado, fixado, identificado e protegido contra danos.',
    steps: ['Abastecer sem misturar lotes.', 'Confirmar posicionamento antes de cada ciclo.', 'Observar ruído, vibração, fixação e acabamento.', 'Separar peças sem causar riscos ou batidas.', 'Atualizar quantidade produzida.'],
    meta: { riskLevel: 'high', requiresEvidence: true, requiredRecords: ['Apontamento de produção'], commonFailures: ['Perfil deslocado', 'Rebarba excessiva', 'Medida instável', 'Risco superficial'], symptoms: ['Ruído anormal', 'Vibração', 'Fixação irregular', 'Acabamento diferente do padrão'], immediateActions: ['Parar o ciclo', 'Proteger peças desde a última verificação', 'Avaliar máquina e ferramenta'] },
  },
  {
    id: 'in-process-inspection', code: '6.2', label: 'Inspeção Durante a Produção', category: 'quality', nodeType: 'quality', advanced: 'inspection', layer: 'instruction',
    description: 'Monitorar características críticas e aparência durante o lote para detectar variação antes que todo o pedido seja afetado.',
    steps: ['Selecionar peça conforme frequência do plano de controle ou IT.', 'Medir características definidas.', 'Verificar acabamento, rebarba, risco e deformação.', 'Registrar resultado e quantidade produzida no momento.', 'Se houver NOK, parar e proteger o intervalo desde a última peça aprovada.'],
    tip: 'Ponto pendente: a frequência exata deve ser definida no plano de controle ou IT aprovada; não usar frequência informal.',
    meta: { ctq: true, severity: 'high', riskLevel: 'high', auditRequired: true, requiresEvidence: true, inspectionFrequency: 'Conforme plano de controle ou IT vigente', specialCharacteristic: 'Conforme desenho e plano de controle', requiredRecords: ['Registro de inspeção durante a produção'], nokFlow: ['Parar produção', 'Segregar intervalo suspeito', 'Acionar Qualidade'] },
  },
  {
    id: 'production-decision', code: '6.3', label: 'Resultado da Inspeção Conforme?', category: 'quality', nodeType: 'quality', advanced: 'decision', layer: 'procedure',
    description: 'Direciona o lote para continuidade ou para contenção imediata.',
    steps: ['Comparar resultado com o critério vigente.', 'Registrar decisão.', 'Seguir exclusivamente o fluxo correspondente.'],
    ok: { result: 'Peça e processo conformes.', action: 'Continuar produção e manter frequência de inspeção.', nextStep: '6.3.1 OK: Continuar Produção', alertLevel: 'success' },
    nok: { result: 'Peça, acabamento ou processo não conforme.', action: 'Parar, bloquear e segregar o intervalo suspeito.', nextStep: '6.3.2 NOK: Bloquear e Segregar', alertLevel: 'critical' },
    meta: { severity: 'critical', riskLevel: 'high', visualPriority: 'critical', requiresEvidence: true, okFlow: ['Continuar produção'], nokFlow: ['Parar máquina', 'Segregar lote suspeito', 'Acionar Qualidade'] },
  },
  {
    id: 'production-ok', code: '6.3.1', label: 'OK: Continuar Produção', category: 'quality', nodeType: 'quality', advanced: 'ok', layer: 'instruction',
    description: 'Manter a produção com o processo aprovado e repetir inspeções na frequência definida.',
    steps: ['Registrar resultado conforme.', 'Manter parâmetros sem alteração não autorizada.', 'Continuar produção.', 'Repetir inspeção na frequência estabelecida.'],
    meta: { requiresEvidence: true, requiredRecords: ['Resultado da inspeção em processo'] },
  },
  {
    id: 'production-nok', code: '6.3.2', label: 'NOK: Bloquear e Segregar', category: 'alerts', nodeType: 'alerts', advanced: 'block', layer: 'instruction',
    description: 'Impedir que peças potencialmente não conformes avancem no fluxo ou sejam misturadas com produto aprovado.',
    steps: ['Parar a produção em condição segura.', 'Identificar a última peça aprovada.', 'Segregar todas as peças produzidas após essa referência.', 'Identificar fisicamente o material como bloqueado.', 'Acionar liderança e Qualidade.'],
    meta: { severity: 'critical', riskLevel: 'critical', visualPriority: 'critical', auditRequired: true, requiresEvidence: true, trigger: 'Resultado de inspeção NOK', containmentActions: ['Parar produção', 'Segregar intervalo suspeito', 'Identificar bloqueio'], escalationActions: ['Acionar liderança', 'Acionar Qualidade'], requiredRecords: ['Registro de bloqueio e identificação do lote suspeito'], evidenceExamples: ['Etiqueta de bloqueio', 'Quantidade segregada', 'Última peça aprovada'] },
  },
  {
    id: 'nok-treatment', code: '7.0', label: 'Tratar Não Conformidade', category: 'alerts', nodeType: 'alerts', advanced: 'troubleshooting', layer: 'procedure',
    description: 'Executar contenção, avaliação de retrabalho, reinspeção, refugo ou quarentena de forma controlada e rastreável.',
    steps: ['Conter o material suspeito.', 'Investigar causa provável.', 'Avaliar retrabalho somente com autorização.', 'Reinspecionar após correção.', 'Registrar decisão e destino.'],
    meta: { severity: 'critical', riskLevel: 'critical', visualPriority: 'critical', auditRequired: true, requiresApproval: true, requiresEvidence: true, owner: 'Qualidade / Liderança' },
  },
  {
    id: 'contain-range', code: '7.1', label: 'Conter Intervalo Suspeito', category: 'alerts', nodeType: 'alerts', advanced: 'deviation', layer: 'instruction',
    description: 'Definir e controlar o universo potencialmente afetado desde a última condição comprovadamente conforme.',
    steps: ['Identificar última peça ou inspeção aprovada.', 'Levantar quantidade produzida desde esse ponto.', 'Separar fisicamente o material.', 'Aplicar identificação de bloqueio.', 'Impedir movimentação sem autorização.'],
    meta: { severity: 'critical', riskLevel: 'critical', requiresEvidence: true, requiredRecords: ['Quantidade e identificação do lote contido'], evidenceExamples: ['Foto da segregação', 'Etiqueta de bloqueio'] },
  },
  {
    id: 'rework-decision', code: '7.2', label: 'Retrabalho é Permitido e Viável?', category: 'quality', nodeType: 'quality', advanced: 'decision', layer: 'procedure',
    description: 'Avaliar tecnicamente se a peça pode ser recuperada sem violar desenho, requisito do cliente, segurança ou rastreabilidade.',
    steps: ['Consultar especificação e regra de produto.', 'Avaliar impacto dimensional e superficial.', 'Obter aprovação da Qualidade.', 'Registrar decisão e instrução de retrabalho.'],
    ok: { result: 'Retrabalho tecnicamente permitido e aprovado.', action: 'Executar retrabalho controlado.', nextStep: '7.2.1 Sim: Retrabalhar', alertLevel: 'warning' },
    nok: { result: 'Retrabalho proibido, inviável ou não aprovado.', action: 'Destinar para refugo ou quarentena conforme decisão da Qualidade.', nextStep: '7.2.2 Não: Refugo ou Quarentena', alertLevel: 'critical' },
    meta: { severity: 'high', riskLevel: 'high', requiresApproval: true, requiresEvidence: true, requiredRecords: ['Decisão de retrabalho ou descarte'] },
  },
  {
    id: 'rework', code: '7.2.1', label: 'Sim: Executar Retrabalho Controlado', category: 'quality', nodeType: 'quality', advanced: 'corrective_action', layer: 'instruction',
    description: 'Executar somente o retrabalho formalmente autorizado, mantendo identificação e segregação até a aprovação final.',
    steps: ['Receber instrução de retrabalho aprovada.', 'Registrar quantidade e peças afetadas.', 'Executar sem misturar com produto aprovado.', 'Identificar peças retrabalhadas.', 'Encaminhar para reinspeção completa.'],
    meta: { severity: 'high', requiresApproval: true, requiresEvidence: true, requiredRecords: ['Registro de retrabalho'], evidenceExamples: ['Quantidade retrabalhada', 'Responsável', 'Instrução aplicada'] },
  },
  {
    id: 'rework-inspection', code: '7.2.1.1', label: 'Reinspecionar Após Retrabalho', category: 'quality', nodeType: 'quality', advanced: 'inspection', layer: 'instruction',
    description: 'Comprovar que todas as peças retrabalhadas atendem integralmente aos requisitos antes da liberação.',
    steps: ['Inspecionar 100% das características afetadas.', 'Verificar impactos secundários do retrabalho.', 'Registrar valores e resultado.', 'Liberar somente com aprovação definida.'],
    meta: { ctq: true, severity: 'high', requiresApproval: true, requiresEvidence: true, inspectionFrequency: '100% das peças retrabalhadas nas características afetadas', requiredRecords: ['Registro de reinspeção do retrabalho'] },
  },
  {
    id: 'scrap-quarantine', code: '7.2.2', label: 'Não: Refugo ou Quarentena', category: 'alerts', nodeType: 'alerts', advanced: 'nok', layer: 'instruction',
    description: 'Dar destino controlado ao produto que não pode ser retrabalhado, evitando uso ou envio indevido.',
    steps: ['Manter material segregado.', 'Identificar quantidade e motivo.', 'Aplicar regra de refugo ou quarentena vigente.', 'Obter autorização para destinação.', 'Atualizar os registros de produção e qualidade.'],
    tip: 'O rascunho cita uma regra de lote. O código e o critério oficial dessa regra precisam ser confirmados.',
    meta: { severity: 'critical', riskLevel: 'high', visualPriority: 'critical', auditRequired: true, requiresApproval: true, requiresEvidence: true, requiredRecords: ['Registro de refugo ou quarentena', 'Motivo e quantidade'], evidenceExamples: ['Etiqueta de material não conforme', 'Autorização de destinação'] },
  },
  {
    id: 'deviation-record', code: '7.3', label: 'Registrar e Escalonar o Desvio', category: 'compliance', nodeType: 'methods', advanced: 'record', layer: 'record',
    description: 'Assegurar que causa, contenção, quantidade, decisão e responsáveis fiquem registrados para rastreabilidade e aprendizado.',
    steps: ['Registrar descrição objetiva do desvio.', 'Informar OP, lote, quantidade e intervalo afetado.', 'Registrar contenção e decisão.', 'Anexar evidência quando aplicável.', 'Comunicar responsáveis definidos.'],
    meta: { auditRequired: true, requiresEvidence: true, requiredRecords: ['Registro de não conformidade', 'Plano de contenção', 'Decisão de destino'], lessonsLearned: ['Revisar causa e prevenção antes de repetir o setup'] },
  },
  {
    id: 'palletization', code: '8.0', label: 'Paletizar e Liberar Produto', category: 'outputs', nodeType: 'outputs', advanced: 'process', layer: 'procedure',
    description: 'Organizar, proteger, identificar e inspecionar o produto acabado antes de encaminhá-lo à expedição.',
    steps: ['Paletizar conforme padrão aplicável.', 'Identificar palete e rastreabilidade.', 'Inspecionar condição final.', 'Corrigir embalagem quando necessário.', 'Liberar para expedição.'],
    meta: { visualPriority: 'important', requiresApproval: true, owner: 'Operação / Qualidade' },
  },
  {
    id: 'palletize', code: '8.1', label: 'Paletizar Conforme Padrão', category: 'outputs', nodeType: 'outputs', advanced: 'operation', layer: 'instruction',
    description: 'Acondicionar as peças para evitar risco, amassado, mistura, deformação e movimentação durante transporte interno ou externo.',
    steps: ['Usar palete e proteção especificados.', 'Organizar peças sem contato abrasivo.', 'Respeitar quantidade e arranjo do padrão de embalagem.', 'Manter produto e lote separados.', 'Fixar sem deformar o perfil.'],
    tip: 'Ponto pendente: confirmar quantidade por palete, posição e materiais de proteção no padrão de embalagem aprovado.',
    meta: { riskLevel: 'medium', customerImpact: 'Embalagem inadequada pode causar risco, amassado, deformação e mistura de peças.', requiredRecords: ['Padrão de embalagem vigente'] },
  },
  {
    id: 'identify-pallet', code: '8.2', label: 'Identificar e Rastrear o Palete', category: 'outputs', nodeType: 'outputs', advanced: 'record', layer: 'record',
    description: 'Vincular fisicamente o palete ao produto, pedido, OP, lote, quantidade e status de liberação.',
    steps: ['Emitir ou preencher identificação padrão.', 'Conferir código do produto e cliente.', 'Informar OP, lote e quantidade.', 'Fixar etiqueta em local visível e protegido.', 'Verificar leitura do código, quando aplicável.'],
    tip: 'Ponto pendente: confirmar se a identificação oficial usa código de barras e qual sistema emite a etiqueta.',
    meta: { auditRequired: true, requiresEvidence: true, traceability: 'Produto, OP, pedido, lote e quantidade', requiredRecords: ['Etiqueta de identificação do palete'] },
  },
  {
    id: 'pallet-inspection', code: '8.3', label: 'Inspecionar Qualidade do Palete', category: 'quality', nodeType: 'quality', advanced: 'inspection', layer: 'instruction',
    description: 'Verificar produto, embalagem, identificação, quantidade e integridade antes da movimentação para expedição.',
    steps: ['Conferir identificação e quantidade.', 'Verificar separação e proteção das peças.', 'Avaliar risco, amassado, deformação e sujeira.', 'Confirmar estabilidade e fixação.', 'Registrar resultado final.'],
    meta: { severity: 'high', requiresEvidence: true, requiresApproval: true, inspectionFrequency: 'Cada palete antes da liberação', requiredRecords: ['Inspeção final do palete'], approvalCriteria: ['Identificação correta', 'Quantidade correta', 'Produto protegido e sem dano', 'Palete estável'] },
  },
  {
    id: 'pallet-decision', code: '8.4', label: 'Palete Conforme?', category: 'quality', nodeType: 'quality', advanced: 'decision', layer: 'procedure',
    description: 'Decisão final antes de liberar o produto para expedição.',
    steps: ['Revisar resultado da inspeção final.', 'Confirmar identificação e status.', 'Selecionar fluxo OK ou NOK.'],
    ok: { result: 'Produto, quantidade, identificação e embalagem conformes.', action: 'Liberar e encaminhar para expedição.', nextStep: '8.4.1 OK: Encaminhar para Expedição', alertLevel: 'success' },
    nok: { result: 'Palete, identificação, quantidade ou produto não conforme.', action: 'Bloquear e corrigir o palete.', nextStep: '8.4.2 NOK: Corrigir e Reinspecionar', alertLevel: 'critical' },
    meta: { severity: 'high', riskLevel: 'medium', requiresApproval: true, requiresEvidence: true, okFlow: ['Liberar para expedição'], nokFlow: ['Bloquear palete', 'Corrigir', 'Reinspecionar'] },
  },
  {
    id: 'shipping-release', code: '8.4.1', label: 'OK: Encaminhar para Expedição', category: 'outputs', nodeType: 'outputs', advanced: 'release', layer: 'record',
    description: 'Formalizar a liberação e movimentar somente o palete aprovado para a área de expedição.',
    steps: ['Registrar liberação final.', 'Atualizar status no sistema vigente.', 'Movimentar para área definida.', 'Preservar identificação e integridade.'],
    meta: { requiresApproval: true, requiresEvidence: true, traceability: 'Status final do palete', requiredRecords: ['Liberação para expedição'] },
  },
  {
    id: 'pallet-rework', code: '8.4.2', label: 'NOK: Corrigir e Reinspecionar', category: 'alerts', nodeType: 'alerts', advanced: 'corrective_action', layer: 'instruction',
    description: 'Corrigir embalagem, arranjo, identificação ou quantidade sem liberar o palete enquanto houver desvio.',
    steps: ['Bloquear o palete.', 'Identificar a causa do NOK.', 'Desmontar ou reorganizar quando necessário.', 'Corrigir identificação ou quantidade.', 'Repetir a inspeção completa.'],
    meta: { severity: 'high', requiresEvidence: true, trigger: 'Inspeção final do palete NOK', containmentActions: ['Bloquear palete'], reactionActions: ['Corrigir embalagem ou identificação', 'Reinspecionar'], requiredRecords: ['Registro da correção do palete'] },
  },
  {
    id: 'records', code: '9.0', label: 'Consolidar Registros', category: 'compliance', nodeType: 'methods', advanced: 'process', layer: 'procedure',
    description: 'Reunir as evidências obrigatórias do processo para demonstrar execução, conformidade e rastreabilidade.',
    steps: ['Conferir registros de produção.', 'Conferir inspeções e liberações.', 'Conferir desvios, retrabalho ou refugo.', 'Conferir etiqueta e liberação do palete.', 'Encerrar somente com documentação completa.'],
    meta: { auditRequired: true, requiresEvidence: true, visualPriority: 'important' },
  },
  {
    id: 'production-record', code: '9.1', label: 'Registro de Produção', category: 'compliance', nodeType: 'methods', advanced: 'record', layer: 'record',
    description: 'Apontamento da quantidade produzida, perdas, tempo, operador, equipamento e OP.',
    steps: ['Registrar quantidade boa.', 'Registrar retrabalho e refugo separadamente.', 'Informar operador, máquina, data e turno.', 'Vincular o apontamento à OP.'],
    meta: { auditRequired: true, requiresEvidence: true, requiredRecords: ['Apontamento de produção'] },
  },
  {
    id: 'inspection-record', code: '9.2', label: 'Registro de Inspeção', category: 'compliance', nodeType: 'methods', advanced: 'record', layer: 'record',
    description: 'Evidência dos valores medidos, critérios usados, resultado e responsável pelas inspeções.',
    steps: ['Registrar valor real, não apenas OK.', 'Identificar instrumento utilizado quando exigido.', 'Registrar data, hora e responsável.', 'Vincular à OP e ao lote.'],
    meta: { auditRequired: true, requiresEvidence: true, traceability: 'OP, lote, peça, instrumento e responsável', requiredRecords: ['Inspeção da primeira peça', 'Inspeções durante produção', 'Inspeção final'] },
  },
  {
    id: 'nonconformity-record', code: '9.3', label: 'Registro de Desvio e Destino', category: 'compliance', nodeType: 'methods', advanced: 'record', layer: 'record',
    description: 'Histórico do desvio, contenção, causa, quantidade afetada, retrabalho, refugo, quarentena e decisão final.',
    steps: ['Identificar desvio e origem.', 'Registrar quantidade e lote afetados.', 'Registrar contenção e responsáveis.', 'Registrar destino final e aprovação.'],
    meta: { auditRequired: true, requiresEvidence: true, requiredRecords: ['Não conformidade', 'Retrabalho ou refugo', 'Autorização do destino'] },
  },
  {
    id: 'pallet-record', code: '9.4', label: 'Etiqueta e Liberação do Palete', category: 'compliance', nodeType: 'methods', advanced: 'record', layer: 'record',
    description: 'Evidência final de identificação, quantidade, lote, inspeção e liberação para expedição.',
    steps: ['Conferir etiqueta física.', 'Conferir registro da inspeção final.', 'Conferir status de liberação.', 'Manter rastreabilidade até a expedição.'],
    meta: { auditRequired: true, requiresEvidence: true, traceability: 'Palete vinculado à OP, pedido e lote', requiredRecords: ['Etiqueta do palete', 'Liberação final'] },
  },
  {
    id: 'closure', code: '10.0', label: 'Finalizar Operação', category: 'outputs', nodeType: 'outputs', advanced: 'process', layer: 'procedure',
    description: 'Encerrar o lote com apontamentos completos, máquina em condição segura e área preparada para a próxima operação.',
    steps: ['Conferir saldo e quantidade da OP.', 'Encerrar registros.', 'Retirar materiais e resíduos conforme padrão.', 'Limpar e deixar a máquina segura.', 'Comunicar condição do equipamento no repasse de turno.'],
    meta: { visualPriority: 'important', owner: 'Operador' },
  },
  {
    id: 'finish-order', code: '10.1', label: 'Encerrar Ordem e Saldos', category: 'outputs', nodeType: 'outputs', advanced: 'record', layer: 'record',
    description: 'Conferir produção, perdas, saldo de material e status do pedido antes do encerramento.',
    steps: ['Comparar quantidade produzida com a OP.', 'Registrar saldo de material.', 'Registrar perdas e destino.', 'Encerrar ou devolver a OP conforme regra vigente.'],
    meta: { requiresEvidence: true, requiredRecords: ['Encerramento da OP e saldo de material'] },
  },
  {
    id: 'clean-machine', code: '10.2', label: 'Limpar e Deixar Máquina Segura', category: 'safety', nodeType: 'safety', advanced: 'safety', layer: 'instruction',
    description: 'Remover cavacos e resíduos com método seguro, preservar componentes e deixar a máquina pronta para a próxima operação.',
    steps: ['Parar a máquina em condição segura.', 'Aplicar bloqueio quando houver acesso à zona de risco.', 'Usar ferramenta apropriada; não usar as mãos para retirar cavacos.', 'Limpar apoios, área e dispositivos sem danificar sensores.', 'Comunicar anomalias encontradas.'],
    meta: { severity: 'high', riskLevel: 'high', auditRequired: true, stopCriteria: ['Máquina energizada em intervenção de risco'], requiredRecords: ['Checklist de limpeza ou repasse, quando aplicável'] },
  },
  {
    id: 'handover', code: '10.3', label: 'Liberar Área e Fazer Repasse', category: 'outputs', nodeType: 'outputs', advanced: 'release', layer: 'instruction',
    description: 'Deixar posto organizado e comunicar pendências, bloqueios, ajustes e condição do equipamento ao próximo responsável.',
    steps: ['Organizar ferramentas e instrumentos.', 'Destinar resíduos conforme regra.', 'Comunicar bloqueios e manutenção pendente.', 'Entregar documentação e status do lote.', 'Confirmar área liberada.'],
    meta: { requiresEvidence: true, requiredRecords: ['Repasse de turno ou comunicação de pendência, quando aplicável'] },
  },
];

// Conteúdo reconstruído a partir do fluxo manuscrito fornecido pela operação.
// Mantém linguagem simples no passo a passo e contexto técnico na descrição.
const groundedFlowContent = {
  root: {
    description: 'Fluxo completo do setor de Corte e Acabados para produzir perfis na Serra Doppia de 2 cabeças. Começa na conferência do pedido, passa pela preparação da atividade e da máquina, valida a primeira peça, acompanha o lote e termina com paletização, inspeção final e envio para a expedição.',
    steps: ['Conferir OP, pedido e desenho antes de separar o material.', 'Preparar material, referência da máquina e programa.', 'Fazer o primeiro corte e medir antes de liberar o lote.', 'Durante a produção, inspecionar e separar imediatamente qualquer peça suspeita.', 'Paletizar, identificar, conferir e encaminhar somente produto aprovado.'],
    tip: 'Regra simples: sem documento correto, primeira peça aprovada e registro preenchido, o processo não avança.',
  },
  inputs: {
    label: '1ª Etapa - Conferir Pedido e Documentos',
    description: 'Antes de movimentar material ou programar a serra, o operador precisa saber exatamente o que será produzido. Nesta etapa, OP, pedido, desenho e dados do sistema são comparados para evitar corte do perfil errado, medida errada ou quantidade incorreta.',
    steps: ['Receber a OP e localizar o pedido correspondente.', 'Abrir o desenho técnico da peça e confirmar sua revisão.', 'Comparar código, quantidade, comprimento e ângulos entre os documentos.', 'Consultar o pedido no sistema usado pela empresa.', 'Se qualquer informação não coincidir, parar e pedir correção ao PCP ou à liderança.'],
  },
  'production-order': {
    description: 'A OP transforma o pedido em uma atividade de fábrica. Nela o operador confirma qual item deve cortar, para qual pedido, em qual quantidade e com qual prioridade. A OP acompanha o lote e liga o material produzido aos apontamentos e inspeções.',
    steps: ['Leia o número da OP e do pedido.', 'Confira o código do produto e a quantidade solicitada.', 'Veja se há observações especiais, prioridade ou sequência definida.', 'Deixe a OP identificada junto ao lote durante toda a operação.', 'Não use uma OP de outro produto como referência.'],
    tip: 'OP, pedido e desenho precisam falar da mesma peça. Se um deles estiver diferente, não corte.',
  },
  'technical-drawing': {
    description: 'O desenho é a referência técnica do corte. Ele informa comprimento, ângulo, tolerância, lado de orientação e acabamento exigido. O operador usa essas informações para conferir o programa; a inspeção usa o mesmo desenho para decidir se a peça está conforme.',
    steps: ['Confirme o código da peça e a revisão do desenho.', 'Localize comprimento, ângulos e tolerâncias aplicáveis.', 'Observe o sentido da peça e qual face deve ficar orientada na máquina.', 'Identifique requisitos de aparência ou características especiais.', 'Em caso de desenho ilegível, ausente ou diferente da OP, não programe a serra.'],
    tip: 'Não trabalhe de memória. Mesmo um item conhecido pode ter mudança de revisão.',
  },
  'system-data': {
    label: 'Localizar Pedido no Sistema',
    description: 'O rascunho da operação indica a consulta do pedido e de um relatório no sistema da empresa. Essa consulta confirma saldo, sequência, quantidade e informações atualizadas antes da programação. O nome oficial do sistema e do relatório ainda deve ser registrado na versão aprovada da instrução.',
    steps: ['Pesquise pelo número da OP ou do pedido.', 'Abra o item correto e confira código, quantidade e sequência.', 'Compare a tela com a OP e com o desenho.', 'Se o pedido não aparecer ou houver diferença, faça uma captura ou anote a divergência e acione o PCP.', 'Somente continue depois da informação ser esclarecida.'],
    tip: 'Pendência para validação interna: confirmar o nome do sistema, a tela e o relatório que devem ser consultados.',
  },
  'raw-material': {
    description: 'Depois que os documentos estiverem corretos, separe o perfil indicado na OP. Confira a identificação do material e também sua condição física, porque perfil trocado, amassado, riscado ou empenado não deve chegar à serra como se estivesse liberado.',
    steps: ['Compare a etiqueta do perfil com o código indicado na OP.', 'Confira lote, liga, têmpera ou outra identificação exigida pela empresa.', 'Observe amassados, riscos, empenamento, sujeira e oxidação.', 'Separe a quantidade necessária sem perder a etiqueta do lote.', 'Material duvidoso deve ficar separado até avaliação da liderança ou Qualidade.'],
  },
  setup: {
    label: '2ª Etapa - Preparar Atividade e Serra',
    description: 'Com pedido e material confirmados, prepare o posto para executar a atividade. Esta etapa reúne o abastecimento, as verificações de segurança, o referenciamento e a programação da Serra Doppia. O objetivo é chegar ao primeiro corte sem improviso e sem parâmetro divergente.',
    steps: ['Levar o perfil conferido ao posto e manter sua identificação.', 'Verificar EPIs, proteções, apoios e área ao redor da máquina.', 'Ligar e referenciar a Serra Doppia conforme a rotina do equipamento.', 'Selecionar o programa do item e comparar as medidas com o desenho.', 'Revisar posição dos cabeçotes, batentes e fixação antes do primeiro ciclo.'],
  },
  'separate-material': {
    description: 'Posicione próximo à máquina somente o material da OP em execução. Apoie barras longas de modo estável e proteja as superfícies aparentes. Misturar perfis ou perder a etiqueta nesta etapa compromete todo o rastreamento do lote.',
    steps: ['Retire da área materiais de outras ordens.', 'Posicione as barras nos apoios sem risco de queda ou flexão excessiva.', 'Mantenha a etiqueta do lote visível.', 'Proteja faces acabadas contra atrito e batidas.', 'Confirme novamente o perfil antes de abastecer a serra.'],
  },
  'machine-reference': {
    description: 'O referenciamento informa à Serra Doppia a posição real de seus eixos e cabeçotes. Sem referência concluída, a medida programada pode não representar a posição física da máquina.',
    steps: ['Ligue o equipamento seguindo a sequência do posto.', 'Leia os alarmes apresentados antes de movimentar a máquina.', 'Execute a rotina de referência indicada no painel.', 'Observe se os eixos e cabeçotes concluíram o movimento sem interferência.', 'Não carregue a produção enquanto houver alarme ou referência incompleta.'],
  },
  'load-program': {
    description: 'Selecione o programa correspondente ao código da OP e confira na tela os dados que realmente comandarão o corte. A conferência precisa considerar comprimento, ângulos, quantidade e orientação do perfil, e não apenas o nome do programa.',
    steps: ['Pesquise o programa pelo código autorizado.', 'Compare o comprimento programado com o desenho.', 'Confira ângulo de cada cabeçote e orientação da peça.', 'Confira quantidade e sequência, quando controladas pelo programa.', 'Verifique batentes, pressão de fixação e apoio do perfil.', 'Se a tela não corresponder ao documento, não tente compensar sem autorização.'],
    tip: 'As fotos das telas citadas no rascunho devem ser anexadas depois da validação do programa padrão na própria máquina.',
  },
  'first-piece': {
    description: 'O primeiro corte é a prova do setup. Ele mostra se documento, programa, referência, posicionamento e máquina estão trabalhando juntos. Produzir o lote antes dessa validação pode transformar um único erro em várias peças não conformes.',
    steps: ['Produza apenas uma peça para validação.', 'Identifique a peça como primeira peça da OP.', 'Meça e inspecione antes de iniciar a sequência.', 'Registre o resultado real encontrado.', 'Somente libere o lote quando todos os requisitos verificados estiverem conformes.'],
  },
  'first-cut': {
    description: 'Faça o primeiro ciclo em condição controlada. Observe o assentamento do perfil, a atuação dos prendedores, o movimento dos dois cabeçotes e o acabamento deixado pelos discos.',
    steps: ['Encoste e oriente o perfil conforme a referência definida.', 'Confirme que a barra está apoiada e presa sem deformação.', 'Retire as mãos da zona de risco e verifique se ninguém está exposto.', 'Execute um ciclo e observe ruído, vibração ou movimento anormal.', 'Aguarde a parada segura antes de retirar e identificar a peça.'],
  },
  'first-inspection': {
    description: 'Meça a primeira peça nas características indicadas pelo desenho. Além do comprimento, verifique ângulos, esquadro, rebarba e aparência quando aplicáveis. O valor medido deve ser registrado; marcar somente “OK” não mostra quanto o processo está próximo do limite.',
    steps: ['Confirme que a peça pertence à OP em validação.', 'Escolha instrumento calibrado e adequado à dimensão.', 'Meça comprimento e demais dimensões definidas no plano ou desenho.', 'Confira ângulo, esquadro, rebarba e danos superficiais quando aplicáveis.', 'Registre valores, instrumento, operador e horário.', 'Compare cada resultado com seu limite antes de decidir.'],
  },
  'first-decision': {
    description: 'A decisão é direta: se todas as verificações estiverem dentro do especificado, a produção pode começar. Se uma medida ou condição estiver fora, a máquina continua bloqueada, o setup é corrigido e uma nova primeira peça é inspecionada.',
    steps: ['Revise os valores medidos e o aspecto da peça.', 'Se tudo estiver conforme, registre a liberação.', 'Se houver NOK, identifique a peça e mantenha a produção parada.', 'Corrija programa, referência, apoio, fixação ou condição de corte conforme a causa.', 'Depois do ajuste, produza outra peça e repita toda a inspeção.'],
  },
  production: {
    description: 'Com a primeira peça aprovada, inicie o lote sem abandonar o controle. O operador continua observando a máquina e realiza inspeções durante a produção para perceber desgaste, deslocamento, variação de medida ou dano superficial antes que o pedido inteiro seja afetado.',
    steps: ['Produza conforme a quantidade e sequência da OP.', 'Mantenha material de entrada e peças cortadas identificados.', 'Observe fixação, ruído, vibração, acabamento e formação de cavaco.', 'Inspecione na frequência definida pelo plano de controle ou instrução do item.', 'Ao encontrar NOK, pare, segregue desde a última verificação aprovada e chame a Qualidade.'],
    tip: 'Pendência para validação interna: registrar no mapa a frequência oficial de inspeção para cada família de produto.',
  },
  'in-process-inspection': {
    description: 'A inspeção durante a produção confirma que o processo continua estável após a primeira peça. Ela deve ocorrer na frequência definida e também após parada, ajuste, troca de lote, batida, alarme ou qualquer situação capaz de alterar o corte.',
    steps: ['Separe uma peça sem perder a sequência do lote.', 'Meça as características definidas para acompanhamento.', 'Observe rebarba, risco, amassado e qualidade da face cortada.', 'Registre o valor e o horário da inspeção.', 'Se estiver conforme, continue; se estiver NOK, pare e contenha o intervalo suspeito.'],
  },
  'production-nok': {
    description: 'Ao encontrar uma peça fora do especificado, interrompa o corte e impeça a mistura com peças boas. Considere suspeitas todas as peças produzidas desde a última inspeção aprovada, até que a Qualidade defina o intervalo real.',
    steps: ['Pare a máquina sem criar novo risco.', 'Identifique a peça que revelou o desvio.', 'Separe as peças produzidas desde o último controle aprovado.', 'Marque o lote como bloqueado e não envie para paletização.', 'Acione liderança e Qualidade com OP, medida encontrada e quantidade suspeita.'],
  },
  'rework-decision': {
    description: 'Nem toda peça fora de medida pode ser recortada. Qualidade e liderança avaliam se existe sobremetal, se o retrabalho mantém desenho, acabamento e quantidade necessária e se há autorização. Sem essa decisão, a peça permanece bloqueada.',
    steps: ['Verifique qual característica ficou fora do limite.', 'Avalie se um novo corte é tecnicamente possível.', 'Confirme que o retrabalho não cria outro desvio ou perda de rastreabilidade.', 'Obtenha autorização da Qualidade.', 'Se aprovado, retrabalhe e reinspecione; se não, destine a refugo ou quarentena.'],
  },
  palletization: {
    description: 'Depois do corte e das inspeções, organize as peças aprovadas no palete. O palete faz parte da qualidade do produto: deve evitar mistura, risco, amassado e deformação, além de manter a identificação até a expedição.',
    steps: ['Use o palete e os separadores definidos para o produto.', 'Conte e organize apenas peças aprovadas.', 'Mantenha faces acabadas protegidas e peças estáveis.', 'Identifique produto, OP, pedido, lote e quantidade.', 'Faça a inspeção final do palete antes de encaminhar à expedição.'],
  },
  palletize: {
    description: 'Acondicione as peças de forma repetível, sem jogar, arrastar ou apoiar diretamente uma face acabada contra outra. A quantidade e a forma de montagem devem seguir o padrão de embalagem aprovado para o item.',
    steps: ['Confira se o palete está íntegro e limpo.', 'Coloque proteção nos pontos de contato definidos.', 'Monte camadas alinhadas e estáveis.', 'Respeite a quantidade por camada e por palete quando especificada.', 'Fixe o conjunto sem apertar a ponto de deformar os perfis.'],
    tip: 'Pendência para validação interna: incluir quantidade por palete, desenho de montagem e materiais de proteção de cada produto.',
  },
  'pallet-decision': {
    description: 'Antes da expedição, confira produto, quantidade, etiqueta, proteção e estabilidade. Palete conforme é liberado; palete com erro de montagem ou identificação volta para correção e nova conferência.',
    steps: ['Compare etiqueta, OP, produto e quantidade.', 'Observe estabilidade, proteção, riscos e amassados.', 'Se estiver conforme, registre e encaminhe para expedição.', 'Se estiver NOK, bloqueie o palete.', 'Corrija a montagem ou identificação e repita a inspeção completa.'],
  },
  records: {
    description: 'Os registros mostram o que realmente ocorreu no lote. Ao encerrar, deve ser possível ligar o pedido à OP, ao lote de perfil, às medições, aos desvios, ao operador e ao palete enviado.',
    steps: ['Confira o apontamento de peças boas, retrabalho e refugo.', 'Anexe ou arquive as inspeções da primeira peça e do processo.', 'Registre desvios e decisões de destino.', 'Confirme identificação e liberação do palete.', 'Não encerre a OP com campo obrigatório em branco.'],
  },
  closure: {
    description: 'Finalize o trabalho deixando informação, máquina e posto em condição segura para a próxima ordem ou turno. O encerramento inclui saldo da OP, destino das perdas, limpeza de cavacos e comunicação de qualquer anomalia.',
    steps: ['Compare quantidade produzida, refugo e saldo com a OP.', 'Devolva e identifique o material remanescente.', 'Pare a máquina com segurança antes da limpeza.', 'Remova cavacos com ferramenta adequada e organize o posto.', 'Comunique alarmes, ajustes, bloqueios ou manutenção pendente.'],
  },
};

definitions.forEach((item) => {
  const refined = groundedFlowContent[item.id];
  if (refined) Object.assign(item, refined);
});

const parentCode = (code) => {
  const parts = code.split('.');
  if (code === '1.0') return null;
  if (parts.length === 2 && parts[1] === '0') return '1.0';
  if (parts.length === 2) return `${parts[0]}.0`;
  return parts.slice(0, -1).join('.');
};

const codeToId = new Map(definitions.map((item) => [item.code, item.id]));
const categoryColors = {
  root: '#60a5fa', inputs: '#fb923c', resources: '#f59e0b', methods: '#a78bfa',
  quality: '#34d399', safety: '#facc15', alerts: '#fb7185', outputs: '#22d3ee', compliance: '#38bdf8',
};

const childrenByCode = new Map();
definitions.forEach((item) => {
  const parent = parentCode(item.code);
  if (!parent) return;
  const children = childrenByCode.get(parent) || [];
  children.push(item.code);
  childrenByCode.set(parent, children);
});

const nodeHeight = (code) => code === '1.0' ? 92 : code.split('.').length === 2 ? 78 : 66;
const verticalGap = (code) => {
  const depth = code === '1.0' ? 0 : code.split('.').length - (code.endsWith('.0') ? 1 : 0);
  if (depth <= 1) return 56;
  if (depth === 2) return 34;
  if (depth === 3) return 24;
  return 18;
};
const subtreeHeights = new Map();
const getSubtreeHeight = (code) => {
  if (subtreeHeights.has(code)) return subtreeHeights.get(code);
  const children = childrenByCode.get(code) || [];
  const ownHeight = nodeHeight(code);
  const height = children.length
    ? Math.max(ownHeight, children.reduce((sum, child) => sum + getSubtreeHeight(child), 0) + verticalGap(code) * (children.length - 1))
    : ownHeight;
  subtreeHeights.set(code, height);
  return height;
};

const positions = new Map();
const placeSubtree = (code, top = 0) => {
  const children = childrenByCode.get(code) || [];
  const height = getSubtreeHeight(code);
  const depth = code === '1.0' ? 0 : code.split('.').length - (code.endsWith('.0') ? 1 : 0);
  const xByDepth = [0, 420, 760, 1070, 1360, 1630];
  const x = xByDepth[depth] ?? (1630 + (depth - 5) * 270);

  if (!children.length) {
    positions.set(code, { x, y: top + (height - nodeHeight(code)) / 2 });
    return;
  }

  const childrenHeight = children.reduce((sum, child) => sum + getSubtreeHeight(child), 0)
    + verticalGap(code) * (children.length - 1);
  let cursor = top + Math.max(0, (height - childrenHeight) / 2);
  const centers = [];
  children.forEach((child) => {
    placeSubtree(child, cursor);
    const childPosition = positions.get(child);
    centers.push(childPosition.y + nodeHeight(child) / 2);
    cursor += getSubtreeHeight(child) + verticalGap(code);
  });
  const center = (centers[0] + centers[centers.length - 1]) / 2;
  positions.set(code, { x, y: center - nodeHeight(code) / 2 });
};

placeSubtree('1.0');

const nodes = definitions.map((item) => ({
  id: item.id,
  type: 'mindmap',
  position: positions.get(item.code) || { x: 0, y: 0 },
  data: {
    label: item.label,
    nodeType: item.nodeType,
    category: item.category,
    numberCode: item.code,
    documentLayer: item.layer,
  },
}));

const edges = definitions
  .filter((item) => item.code !== '1.0')
  .map((item, index) => {
    const sourceCode = parentCode(item.code);
    const source = codeToId.get(sourceCode) || 'root';
    const isNok = item.advanced === 'nok' || item.advanced === 'block' || item.id.includes('nok');
    const isOk = item.advanced === 'ok' || item.advanced === 'release';
    return {
      id: `e-${source}-${item.id}`,
      source,
      target: item.id,
      type: 'smoothstep',
      animated: isNok,
      style: {
        stroke: isNok ? '#fb7185' : isOk ? '#34d399' : (categoryColors[item.category] || '#64748b'),
        strokeWidth: item.code.split('.').length === 2 ? 2.4 : 1.8,
        ...(item.layer === 'record' ? { strokeDasharray: '5 5' } : {}),
      },
      data: { relationship: isNok ? 'nok' : isOk ? 'ok' : item.layer },
    };
  });

const nodeDetails = Object.fromEntries(definitions.map((item) => {
  const task = {
    id: `${item.id}-task-1`,
    text: item.label,
    completed: false,
    howTo: (item.steps || []).map((instruction, index) => ({ order: index + 1, instruction })),
    ...(item.ok ? { ifOK: item.ok } : {}),
    ...(item.nok ? { ifNOK: item.nok } : {}),
    ...(item.tip ? { tips: [{ icon: 'info', message: item.tip }] } : {}),
  };

  return [item.id, {
    description: item.description,
    images: [],
    tasks: [task],
    howTo: task.howTo,
    ...(item.ok ? { ifOK: item.ok } : {}),
    ...(item.nok ? { ifNOK: item.nok } : {}),
    ...(item.tip ? { tips: [{ icon: 'info', message: item.tip }] } : {}),
    operational: metadata(item.advanced, item.meta),
  }];
}));

const payload = {
  schema: 'tecnomapper.map.json',
  version: 1,
  exportedAt: new Date().toISOString(),
  title: 'Procedimento Operacional - Corte e Acabados | Serra Doppia 2 Cabeças',
  description: 'Fluxo industrial para corte de perfis de alumínio na Serra Doppia de 2 cabeças, com separação entre Procedimento, Instrução e Registro; preparação, primeira peça, inspeção em processo, reação OK/NOK, paletização, rastreabilidade e liberação para expedição.',
  visibility: 'public',
  tags: ['corte-e-acabados', 'serra-doppia', '2-cabecas', 'procedimento', 'instrucao', 'registro', 'qualidade', 'rastreabilidade'],
  layout: 'hierarchical',
  nodes,
  edges,
  node_details: nodeDetails,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Mapa criado: ${outputPath}`);
console.log(`${nodes.length} nós, ${edges.length} conexões e ${Object.keys(nodeDetails).length} detalhes.`);
