const uniq = (values = []) => [...new Set(values.filter((value) => typeof value === 'string' && value.trim()).map((value) => value.trim()))];

const uniqPending = (values = []) => {
  const seen = new Set();
  return values.filter((value) => {
    if (!value || typeof value !== 'object' || typeof value.issue !== 'string') return false;
    const key = value.issue.trim().toLocaleLowerCase('pt-BR');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const pending = (issue, reason, suggestedValidator, impact) => ({ issue, reason, suggestedValidator, impact });

const operator = ['Operador da Serra Doppia'];
const leadership = ['Liderança de Corte e Acabados'];
const quality = ['Qualidade'];
const pcp = ['PCP'];

const controls = {
  root: {
    ok: ['Todas as macroetapas obrigatórias foram concluídas na sequência definida.', 'Não existe material bloqueado sem decisão nem registro obrigatório pendente.'],
    nok: ['Existe macroetapa obrigatória incompleta, bloqueio sem decisão ou registro obrigatório ausente.'],
    next: 'doc-governance', roles: leadership, support: [...operator, ...quality], records: ['Registros definidos nas etapas aplicáveis'],
  },
  'doc-governance': {
    ok: ['Procedimento, instruções e registros aplicáveis estão identificados e em versão vigente.'],
    nok: ['Documento ausente, obsoleto, ilegível ou usado fora de sua finalidade.'],
    next: 'inputs', roles: leadership, support: quality, records: ['Revisões vigentes dos documentos aplicáveis'],
  },
  'procedure-definition': {
    ok: ['Fluxo, responsabilidades, decisões e registros do processo estão definidos na revisão vigente.'],
    nok: ['O fluxo possui etapa, responsabilidade, decisão ou registro obrigatório sem definição.'],
    next: 'instruction-definition', roles: leadership, support: quality, records: ['Revisão vigente do procedimento'],
  },
  'instruction-definition': {
    ok: ['A instrução vigente descreve a sequência de execução, os controles e a reação ao desvio.'],
    nok: ['A instrução está ausente, obsoleta ou não define como executar e reagir ao desvio.'],
    next: 'record-definition', roles: leadership, support: quality, records: ['Instrução vigente da atividade'],
  },
  'record-definition': {
    ok: ['Os registros exigidos identificam OP, lote, resultado, data/hora e responsável conforme a etapa.'],
    nok: ['Registro obrigatório ausente, ilegível, incompleto ou sem vínculo rastreável com a operação.'],
    next: 'inputs', roles: operator, support: [...leadership, ...quality], records: ['Registro de produção', 'Registro de inspeção', 'Registro de desvio quando houver desvio'],
  },
  inputs: {
    ok: ['OP, pedido, desenho, dados oficiais e material correspondem entre si.'],
    nok: ['Existe divergência, ausência ou ilegibilidade em qualquer entrada necessária ao corte.'],
    next: 'production-order', roles: operator, support: [...pcp, ...leadership], records: ['OP e documentos vigentes usados na conferência'],
  },
  'production-order': {
    ok: ['Número da OP e pedido identificados.', 'Código do produto, quantidade, prioridade e observações conferidos.', 'OP mantida identificada junto ao lote.'],
    nok: ['OP ausente, pertencente a outro item, ilegível ou divergente do pedido, desenho ou material.'],
    next: 'technical-drawing', roles: operator, support: [...pcp, ...leadership], records: ['Ordem de Produção'], evidence: ['OP identificada e vinculada ao lote em execução'], traceability: 'Número da OP, pedido, código do produto e lote de matéria-prima.',
  },
  'technical-drawing': {
    ok: ['Código e revisão do desenho correspondem à OP.', 'Dimensões, ângulos, tolerâncias e requisitos de acabamento aplicáveis foram identificados.'],
    nok: ['Desenho ausente, ilegível, sem revisão identificável ou divergente da OP.'],
    next: 'system-data', roles: operator, support: [...pcp, ...quality], records: ['Desenho técnico vigente'], evidence: ['Código e revisão do desenho usados na conferência'], traceability: 'Código e revisão do desenho vinculados à OP.',
  },
  'system-data': {
    ok: ['Pedido localizado no sistema oficial e dados conferidos com a OP e o desenho.'],
    nok: ['Pedido não localizado ou dados do sistema divergentes da documentação da operação.'],
    next: 'raw-material', roles: operator, support: [...pcp, ...leadership], records: ['Consulta ao sistema oficial'],
    pending: [pending('Nome do sistema e relatório oficial não confirmados.', 'A instrução precisa indicar a fonte oficial da consulta.', 'PCP / TI / Liderança de Corte e Acabados', 'Sem essa validação não é possível nomear a tela ou relatório obrigatório.')],
  },
  'raw-material': {
    ok: ['Código e identificação do perfil correspondem à OP.', 'Lote está identificado e preservado.', 'Perfil não apresenta dano impeditivo identificado na inspeção visual.'],
    nok: ['Perfil divergente, sem rastreabilidade ou com dano que impeça seu uso.'],
    next: 'setup', roles: operator, support: [...leadership, ...quality], records: ['Identificação do lote de matéria-prima'], evidence: ['Etiqueta ou identificação do lote preservada junto ao material'], traceability: 'OP, código do perfil e lote de matéria-prima.',
  },
  setup: {
    ok: ['Material posicionado, segurança verificada, máquina referenciada e programa conferido antes do primeiro corte.'],
    nok: ['Qualquer requisito de material, segurança, referência ou programa permanece pendente ou divergente.'],
    next: 'separate-material', roles: operator, support: [...leadership, ...quality], records: ['Registros de segurança e setup exigidos nas subetapas'],
  },
  'separate-material': {
    ok: ['Somente o material da OP está na área, apoiado de forma estável, protegido e com lote identificado.'],
    nok: ['Material misturado, sem identificação, instável, danificado ou sem proteção necessária.'],
    next: 'safety-check', roles: operator, support: leadership, records: ['Vínculo entre lote de matéria-prima e OP'], evidence: ['Identificação do lote mantida junto ao material'], traceability: 'OP e lote preservados durante o abastecimento.',
  },
  'safety-check': {
    ok: ['EPIs definidos no documento aprovado estão sendo usados.', 'Proteções e dispositivos de segurança estão íntegros e sem neutralização.', 'Fixação está segura, zona de risco está livre e checklist não possui pendência.'],
    nok: ['EPI obrigatório ausente, proteção ou parada de emergência com anomalia, fixação insegura, pessoa na zona de risco ou checklist incompleto.'],
    next: 'machine-reference', nokNext: 'safety-check', roles: operator, support: ['Liderança de Corte e Acabados', 'Segurança do Trabalho', 'Manutenção'], records: ['Checklist de segurança do equipamento', 'Registro de liberação após correção de NOK'], evidence: ['Checklist datado com equipamento, turno e responsável', 'Registro do desvio, correção e nova verificação'],
    pending: [pending('Lista oficial de EPIs e autoridade formal de liberação não confirmadas.', 'Segurança e retomada exigem requisito e autoridade definidos.', 'Segurança do Trabalho / Liderança', 'A máquina não pode ser liberada por regra presumida.')],
  },
  'machine-reference': {
    ok: ['Rotina de referência concluída sem alarme impeditivo e sem interferência observada.'],
    nok: ['Referência incompleta, alarme impeditivo ou movimento anormal.'],
    next: 'load-program', nokNext: 'machine-reference', roles: operator, support: ['Liderança de Corte e Acabados', 'Manutenção'], records: ['Registro de alarme ou intervenção quando houver falha'], evidence: ['Painel sem alarme impeditivo após a conclusão da referência'],
  },
  'load-program': {
    ok: ['Programa corresponde ao código da peça e à OP.', 'Comprimentos, ângulos, quantidade e orientação conferem com o desenho vigente.', 'Setup foi revisado antes do primeiro corte.'],
    nok: ['Programa não identificado, divergente, alterado sem controle ou com parâmetro diferente da documentação vigente.'],
    next: 'first-piece', nokNext: 'load-program', roles: operator, support: [...leadership, ...quality], records: ['Registro de conferência do programa e setup'], evidence: ['Identificação do programa e parâmetros conferidos contra OP e desenho'], traceability: 'OP, desenho, revisão e identificação do programa usado no setup.',
    pending: [pending('Autoridade formal e meio oficial de evidência do setup não confirmados.', 'O ponto é de alto risco e exige liberação rastreável.', 'Produção / Qualidade', 'Sem validação, a aprovação formal do setup permanece indefinida.')],
  },
  'first-piece': {
    ok: ['Uma única primeira peça foi produzida, identificada, inspecionada e registrada antes do lote.'],
    nok: ['Produção do lote iniciada sem primeira peça identificada, inspecionada, registrada e liberada.'],
    next: 'first-cut', nokNext: 'first-piece', roles: operator, support: quality, records: ['Registro de inspeção da primeira peça'], evidence: ['Primeira peça identificada e registro de inspeção vinculado à OP'], traceability: 'OP, lote, primeira peça, data/hora e responsável pela inspeção.',
  },
  'first-cut': {
    ok: ['Perfil permaneceu apoiado e fixado, ciclo ocorreu sem anomalia e primeira peça foi identificada para inspeção.'],
    nok: ['Fixação inadequada, ruído, vibração, movimento anormal, dano aparente ou perda da identificação da primeira peça.'],
    next: 'first-inspection', nokNext: 'setup', roles: operator, support: [...leadership, 'Manutenção'], records: ['Identificação da primeira peça'], evidence: ['Primeira peça identificada antes da inspeção'], traceability: 'Primeira peça vinculada à OP e ao lote.',
  },
  'first-inspection': {
    ok: ['Todas as características previstas no desenho e no controle aplicável foram verificadas e registradas dentro dos requisitos.'],
    nok: ['Uma ou mais características estão fora do requisito, não foram verificadas ou não possuem resultado registrado.'],
    next: 'first-decision', nokNext: 'setup', roles: operator, support: quality, records: ['Registro de inspeção da primeira peça'], evidence: ['Valores medidos, resultado, data/hora, OP, lote e responsável pela inspeção'], traceability: 'OP, lote, peça, instrumento identificado quando exigido e responsável.',
    pending: [pending('Autoridade formal de aprovação da primeira peça não confirmada.', 'A primeira peça é o gate de liberação do lote.', 'Produção / Qualidade', 'A produção não deve iniciar sem autoridade definida e liberação registrada.')],
  },
  'first-decision': {
    ok: ['Primeira peça atende aos requisitos verificados, registro está completo e liberação exigida foi registrada.'],
    nok: ['Resultado fora do requisito, inspeção incompleta, evidência ausente ou liberação exigida não registrada.'],
    next: 'production', nokNext: 'setup', roles: operator, support: quality, records: ['Liberação da primeira peça'], evidence: ['Registro completo da inspeção e da liberação da primeira peça'], traceability: 'Liberação vinculada à OP, lote e primeira peça.',
  },
  production: {
    ok: ['Primeira peça está liberada, lote permanece identificado e controles em processo estão sendo executados.'],
    nok: ['Produção sem liberação da primeira peça, perda de rastreabilidade ou controle em processo não executado.'],
    next: 'serial-cut', nokNext: 'production-nok', roles: operator, support: [...leadership, ...quality], records: ['Apontamento de produção', 'Registros de inspeção em processo'], evidence: ['Quantidade produzida e inspeções vinculadas à OP e ao lote'], traceability: 'OP, lote, operador, equipamento, quantidade e resultados de inspeção.',
  },
  'serial-cut': {
    ok: ['Perfil está identificado, apoiado e fixado; ciclo ocorre sem anomalia; peças permanecem separadas e protegidas.'],
    nok: ['Mistura de lote, deslocamento do perfil, fixação inadequada, ruído, vibração, rebarba, dano ou medida suspeita.'],
    next: 'in-process-inspection', nokNext: 'production-nok', roles: operator, support: [...leadership, 'Manutenção', ...quality], records: ['Apontamento da quantidade produzida'], evidence: ['Quantidade apontada e vinculada à OP'], traceability: 'OP, lote e quantidade produzida.',
  },
  'in-process-inspection': {
    ok: ['Características previstas no controle aplicável foram verificadas e registradas na frequência oficial.'],
    nok: ['Resultado fora do requisito, inspeção não realizada, frequência não atendida ou registro incompleto.'],
    next: 'production-decision', nokNext: 'production-nok', roles: operator, support: quality, records: ['Registro de inspeção durante a produção'], evidence: ['Valores medidos, OP, lote, data/hora e responsável'], traceability: 'OP, lote, sequência/intervalo inspecionado e responsável.',
    pending: [pending('Frequência numérica oficial e eventos de reinício da inspeção não confirmados.', 'A frequência precisa ser objetiva para execução e auditoria.', 'Qualidade / Engenharia de Processo', 'Sem validação não é possível publicar periodicidade oficial.')],
  },
  'production-decision': {
    ok: ['Resultado registrado atende aos requisitos e não existe perda de rastreabilidade.'],
    nok: ['Resultado fora do requisito, registro incompleto ou perda de rastreabilidade.'],
    next: 'production-ok', nokNext: 'production-nok', roles: operator, support: quality, records: ['Resultado da inspeção em processo'], evidence: ['Decisão OK/NOK vinculada ao registro de inspeção'], traceability: 'Decisão vinculada à OP, lote e intervalo inspecionado.',
  },
  'production-ok': {
    ok: ['Inspeção em processo foi aprovada, registrada e o lote continua identificado.'],
    nok: ['Aprovação não registrada, nova anomalia detectada ou rastreabilidade perdida.'],
    next: 'serial-cut', nokNext: 'production-nok', roles: operator, support: quality, records: ['Registro da inspeção aprovada'], evidence: ['Resultado aprovado vinculado à OP e ao lote'], traceability: 'OP, lote e última inspeção aprovada.',
  },
  'production-nok': {
    ok: ['Produção interrompida, material suspeito identificado e bloqueado, desvio registrado e Qualidade comunicada.'],
    nok: ['Produção continua, intervalo suspeito não está controlado ou desvio não está registrado/comunicado.'],
    next: 'nok-treatment', nokNext: 'production-nok', roles: operator, support: [...leadership, ...quality], records: ['Registro de bloqueio e segregação', 'Registro do desvio'], evidence: ['Identificação do material bloqueado, quantidade e vínculo com OP/lote'], traceability: 'OP, lote, última inspeção aprovada, intervalo suspeito, quantidade e status.',
    pending: [pending('Método oficial de identificação, local de bloqueio e regra do intervalo suspeito não confirmados.', 'A contenção precisa impedir mistura e definir o alcance do risco.', 'Qualidade / Produção', 'Sem validação, a forma oficial de bloqueio e a extensão do intervalo permanecem indefinidas.')],
  },
  'nok-treatment': {
    ok: ['Material afetado está contido, desvio registrado e decisão de retrabalho, quarentena ou refugo foi formalizada.'],
    nok: ['Material sem contenção, registro incompleto ou destino ainda não autorizado.'],
    next: 'contain-range', nokNext: 'nok-treatment', roles: operator, support: [...leadership, ...quality], records: ['Registro de não conformidade e contenção'], evidence: ['Quantidade, lote, condição encontrada, contenção e responsáveis registrados'], traceability: 'OP, lote, intervalo afetado e status do material.',
  },
  'contain-range': {
    ok: ['Todo o intervalo suspeito está identificado, fisicamente segregado e impedido de seguir no processo.'],
    nok: ['Parte do intervalo suspeito não foi localizada, identificada ou permanece disponível para uso/expedição.'],
    next: 'rework-decision', nokNext: 'contain-range', roles: operator, support: quality, records: ['Registro do intervalo suspeito e quantidade contida'], evidence: ['Identificação física do material bloqueado e relação das quantidades'], traceability: 'OP, lote, última inspeção aprovada e intervalo contido.',
  },
  'rework-decision': {
    ok: ['Retrabalho está tecnicamente permitido, possui instrução/critério definido e autorização registrada.'],
    nok: ['Retrabalho não é permitido, não é viável ou não possui critério/autorização registrada.'],
    next: 'rework', nokNext: 'scrap-quarantine', roles: quality, support: [...leadership, ...operator], records: ['Decisão e autorização de retrabalho ou destino alternativo'], evidence: ['Decisão vinculada ao desvio, lote, quantidade e responsável pela autorização'], traceability: 'OP, lote, quantidade bloqueada e decisão de destino.',
    pending: [pending('Cargos autorizados a aprovar retrabalho e liberação pós-retrabalho não confirmados.', 'Retrabalho não pode ser tratado como automaticamente aprovado.', 'Qualidade / Engenharia / Produção', 'Sem validação, a autoridade formal deve permanecer pendente.')],
  },
  rework: {
    ok: ['Retrabalho autorizado foi executado somente nas peças identificadas e conforme a instrução definida.'],
    nok: ['Retrabalho sem autorização, fora da instrução ou com perda da identificação das peças.'],
    next: 'rework-inspection', nokNext: 'scrap-quarantine', roles: operator, support: quality, records: ['Registro da execução do retrabalho'], evidence: ['Quantidade retrabalhada, instrução usada, data/hora e executor'], traceability: 'OP, lote, peças retrabalhadas e autorização.',
  },
  'rework-inspection': {
    ok: ['Cem por cento das características afetadas foram reinspecionadas, atendem ao requisito e possuem resultado registrado.'],
    nok: ['Característica afetada reprovada novamente, reinspeção incompleta ou registro/liberação ausente.'],
    next: 'production-ok', nokNext: 'scrap-quarantine', roles: quality, support: [...operator, ...leadership], records: ['Registro de reinspeção pós-retrabalho', 'Liberação pós-retrabalho'], evidence: ['Resultados de 100% das características afetadas e decisão de liberação'], traceability: 'OP, lote, peças retrabalhadas, resultados e responsável pela liberação.',
  },
  'scrap-quarantine': {
    ok: ['Material permanece identificado e bloqueado até destino formal registrado.'],
    nok: ['Material sem identificação, misturado, movimentado ou destinado sem autorização registrada.'],
    next: 'deviation-record', nokNext: 'scrap-quarantine', roles: operator, support: [...quality, ...leadership], records: ['Registro de refugo ou quarentena', 'Motivo, quantidade e autorização de destino'], evidence: ['Etiqueta de material não conforme e decisão de destino'], traceability: 'OP, lote, quantidade, motivo, status e destino.',
  },
  'deviation-record': {
    ok: ['Desvio, quantidade, lote, contenção, decisão, responsáveis e destino estão registrados.'],
    nok: ['Registro incompleto, sem vínculo com o material ou sem decisão de destino.'],
    next: 'records', nokNext: 'deviation-record', roles: operator, support: [...quality, ...leadership], records: ['Registro de não conformidade', 'Plano de contenção', 'Decisão de destino'], evidence: ['Registro completo e evidências usadas na contenção e decisão'], traceability: 'OP, lote, intervalo, quantidade, contenção e destino.',
  },
  palletization: {
    ok: ['Somente peças aprovadas seguem para paletização, mantendo identificação, proteção e quantidade.'],
    nok: ['Peça não liberada, mistura, perda de identificação ou condição de embalagem não definida.'],
    next: 'palletize', nokNext: 'palletization', roles: operator, support: [...quality, ...leadership], records: ['Padrão de embalagem e registros das subetapas'], evidence: ['Palete identificado e vinculado às peças aprovadas'], traceability: 'OP, pedido, produto, lote e quantidade do palete.',
  },
  palletize: {
    ok: ['Palete íntegro e limpo; peças protegidas, alinhadas, estáveis e montadas conforme padrão aprovado.'],
    nok: ['Palete danificado, montagem instável, proteção ausente, mistura ou risco de dano/deformação.'],
    next: 'identify-pallet', nokNext: 'palletize', roles: operator, support: leadership, records: ['Padrão de embalagem vigente'], evidence: ['Condição final do arranjo antes da identificação'], traceability: 'Peças do mesmo produto/OP mantidas no palete.',
  },
  'identify-pallet': {
    ok: ['Etiqueta legível identifica produto, OP, pedido, lote, quantidade e status conforme dados disponíveis.'],
    nok: ['Etiqueta ausente, ilegível, divergente ou sem vínculo rastreável com o conteúdo do palete.'],
    next: 'pallet-inspection', nokNext: 'identify-pallet', roles: operator, support: [...quality, 'Expedição'], records: ['Etiqueta de identificação do palete'], evidence: ['Etiqueta física conferida contra o conteúdo e a documentação'], traceability: 'Produto, OP, pedido, lote, quantidade e status do palete.',
    pending: [pending('Uso oficial de código de barras e sistema emissor da etiqueta não confirmados.', 'A instrução deve refletir o método real de identificação.', 'Qualidade / Expedição / TI', 'Sem validação não é possível exigir tecnologia específica.')],
  },
  'pallet-inspection': {
    ok: ['Produto, quantidade, identificação, proteção, estabilidade e condição visual atendem ao padrão vigente.'],
    nok: ['Quantidade, identificação, embalagem, estabilidade ou condição visual divergente do padrão.'],
    next: 'pallet-decision', nokNext: 'pallet-rework', roles: operator, support: quality, records: ['Registro de inspeção final do palete'], evidence: ['Resultado da inspeção vinculado à etiqueta e à OP'], traceability: 'Palete, OP, pedido, lote, quantidade e responsável pela inspeção.',
  },
  'pallet-decision': {
    ok: ['Inspeção final aprovada, etiqueta correta, evidência completa e liberação exigida registrada.'],
    nok: ['Desvio de produto, quantidade, identificação ou embalagem; registro/evidência/liberação ausente.'],
    next: 'shipping-release', nokNext: 'pallet-rework', roles: quality, support: [...operator, 'Expedição'], records: ['Decisão e liberação final do palete'], evidence: ['Registro de inspeção e liberação vinculados à etiqueta do palete'], traceability: 'Palete, OP, pedido, lote, resultado e liberação.',
    pending: [pending('Cargo autorizado a liberar o palete para expedição não confirmado.', 'A liberação final precisa de autoridade formal.', 'Qualidade / Expedição', 'O palete não deve seguir enquanto a autoridade oficial não estiver definida.')],
  },
  'shipping-release': {
    ok: ['Palete possui inspeção aprovada, identificação preservada e liberação registrada antes da movimentação.'],
    nok: ['Palete movimentado sem inspeção aprovada, sem identificação ou sem liberação exigida.'],
    next: 'records', nokNext: 'pallet-decision', roles: operator, support: ['Qualidade', 'Expedição'], records: ['Liberação para expedição'], evidence: ['Status de liberação vinculado ao palete e à OP'], traceability: 'Palete, OP, pedido, lote e status final.',
  },
  'pallet-rework': {
    ok: ['Correção concluída, registrada e palete mantido bloqueado para nova inspeção completa.'],
    nok: ['Correção incompleta, sem registro ou palete liberado sem reinspeção.'],
    next: 'pallet-inspection', nokNext: 'pallet-rework', roles: operator, support: quality, records: ['Registro da correção do palete'], evidence: ['Desvio encontrado, correção executada, quantidade e responsável'], traceability: 'Palete, OP, desvio e correção.',
  },
  records: {
    ok: ['Todos os registros exigidos pelas ocorrências da OP estão completos, legíveis e rastreáveis.'],
    nok: ['Existe registro obrigatório ausente, incompleto, ilegível ou sem vínculo com OP/lote.'],
    next: 'closure', nokNext: 'records', roles: operator, support: [...quality, ...leadership], records: ['Apontamento de produção', 'Registros de inspeção', 'Registro de desvio/destino quando houver NOK', 'Etiqueta e liberação do palete'], evidence: ['Conjunto de registros vinculados à OP e às ocorrências do lote'], traceability: 'OP, lote, produção, inspeções, desvios, palete e responsáveis.',
    pending: [pending('Responsável por conferir a documentação e autorizar o encerramento da OP não confirmado.', 'O encerramento deve ser impedido quando faltar registro obrigatório.', 'Produção / Qualidade / PCP', 'Sem validação, a autoridade final de conferência permanece indefinida.')],
  },
  'production-record': {
    ok: ['Quantidade boa, retrabalho, refugo, operador, máquina, data/turno e OP estão registrados sem divergência conhecida.'],
    nok: ['Quantidade divergente ou campo obrigatório do apontamento ausente.'],
    next: 'records', nokNext: 'production-record', roles: operator, support: [...leadership, ...pcp], records: ['Apontamento de produção'], evidence: ['Apontamento completo vinculado à OP'], traceability: 'OP, operador, máquina, data/turno, quantidades boas, retrabalho e refugo.',
  },
  'inspection-record': {
    ok: ['Valores reais, critérios, instrumento quando exigido, resultado, data/hora e responsável estão registrados.'],
    nok: ['Registro sem valor real, critério, resultado, identificação ou responsável exigido.'],
    next: 'records', nokNext: 'inspection-record', roles: operator, support: quality, records: ['Inspeção da primeira peça', 'Inspeções durante a produção', 'Inspeção final'], evidence: ['Registros de medição vinculados à OP e ao lote'], traceability: 'OP, lote, peça/intervalo, instrumento quando exigido e responsável.',
  },
  'nonconformity-record': {
    ok: ['Desvio, origem, quantidade, contenção, responsáveis, retrabalho/refugo/quarentena e destino final estão registrados.'],
    nok: ['Não conformidade sem contenção, quantidade, responsável, decisão ou destino final registrado.'],
    next: 'records', nokNext: 'nonconformity-record', roles: quality, support: [...operator, ...leadership], records: ['Registro de não conformidade', 'Registro de retrabalho/refugo/quarentena', 'Autorização do destino'], evidence: ['Registro completo e decisão de destino vinculada ao material'], traceability: 'OP, lote, intervalo, quantidade, contenção e destino.',
  },
  'pallet-record': {
    ok: ['Etiqueta física, inspeção final e liberação correspondem ao conteúdo do palete.'],
    nok: ['Etiqueta, quantidade, inspeção ou status de liberação ausente/divergente.'],
    next: 'records', nokNext: 'pallet-record', roles: operator, support: ['Qualidade', 'Expedição'], records: ['Etiqueta do palete', 'Inspeção e liberação final'], evidence: ['Etiqueta e liberação vinculadas à OP e ao lote'], traceability: 'Palete, OP, pedido, lote, quantidade e liberação.',
  },
  closure: {
    ok: ['Quantidades e saldos conferidos, registros completos, material bloqueado com destino e posto deixado seguro.'],
    nok: ['Saldo divergente, registro incompleto, bloqueio sem destino, anomalia não comunicada ou posto inseguro.'],
    next: 'finish-order', nokNext: 'closure', roles: operator, support: [...leadership, ...pcp, ...quality], records: ['Encerramento da OP e registros das ocorrências'], evidence: ['Conferência final das quantidades, registros e pendências'], traceability: 'OP, saldos, perdas, registros, bloqueios e condição de encerramento.',
  },
  'finish-order': {
    ok: ['Quantidade produzida, perdas e saldo de material conferem com os registros da OP.'],
    nok: ['Saldo ou quantidade divergente, perda sem destino ou OP sem condição documental de encerramento.'],
    next: 'clean-machine', nokNext: 'finish-order', roles: operator, support: [...leadership, ...pcp], records: ['Encerramento da OP e saldo de material'], evidence: ['Quantidades e saldos conferidos e registrados'], traceability: 'OP, quantidade boa, perdas e saldo de material.',
  },
  'clean-machine': {
    ok: ['Máquina parada em condição segura, cavacos/resíduos removidos com método seguro e anomalias comunicadas.'],
    nok: ['Intervenção em condição insegura, resíduos que impeçam o próximo uso ou anomalia não comunicada.'],
    next: 'handover', nokNext: 'clean-machine', roles: operator, support: ['Liderança de Corte e Acabados', 'Manutenção', 'Segurança do Trabalho'], records: ['Registro de anomalia quando encontrada'], evidence: ['Registro da anomalia e comunicação quando houver desvio'],
    pending: [pending('Existência e obrigatoriedade de checklist formal de limpeza/repasse não confirmadas.', 'Não deve ser exigido formulário inexistente.', 'Produção / Segurança do Trabalho', 'Até a validação, registrar obrigatoriamente apenas as anomalias encontradas.')],
  },
  handover: {
    ok: ['Área organizada, ferramentas e documentos destinados, bloqueios/pendências comunicados e condição do lote repassada.'],
    nok: ['Área insegura/desorganizada ou pendência, bloqueio, documento ou anomalia sem comunicação.'],
    next: null, nokNext: 'handover', roles: operator, support: leadership, records: ['Registro de pendência, bloqueio ou anomalia quando existente'], evidence: ['Comunicação rastreável das pendências existentes'], traceability: 'OP/lote e pendências comunicadas no encerramento.',
    pending: [pending('Meio oficial para registrar o repasse de turno ou pendência não confirmado.', 'A evidência deve usar o canal real da empresa.', 'Produção / Liderança', 'Sem validação não é possível nomear formulário ou sistema específico.')],
  },
};

const target = (nodesById, id) => {
  if (!id) return 'Fim do processo';
  const node = nodesById.get(id);
  if (!node) throw new Error(`Destino inexistente no enriquecimento: ${id}`);
  return `${node.data?.numberCode || ''} ${node.data?.label || ''}`.trim();
};

const isControlNode = (operational = {}) => (
  operational.auditRequired
  || operational.requiresApproval
  || operational.requiresEvidence
  || operational.ctq
  || ['inspection', 'decision', 'safety', 'record', 'release', 'block', 'nok', 'corrective_action', 'critical_point'].includes(operational.nodeTypeAdvanced)
);

const defaultNokFlow = [
  'Interromper ou manter a etapa sem liberação.',
  'Identificar a condição NOK e o material afetado.',
  'Bloquear ou segregar o material quando houver risco de uso indevido.',
  'Registrar o desvio e comunicar os papéis definidos.',
  'Corrigir a causa e repetir a verificação.',
  'Obter aprovação quando exigida e registrar a liberação antes de retomar.',
];

export function enrichSerraDoppiaMap(map) {
  const nodes = Array.isArray(map.nodes) ? map.nodes : [];
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const detailsMap = map.node_details && typeof map.node_details === 'object' ? map.node_details : {};
  const enrichedDetails = {};

  for (const node of nodes) {
    const id = node.id;
    const details = detailsMap[id] && typeof detailsMap[id] === 'object' ? detailsMap[id] : {};
    const spec = controls[id];
    if (!spec) throw new Error(`Nó sem regra de enriquecimento: ${id}`);

    const currentOperational = details.operational && typeof details.operational === 'object' ? details.operational : {};
    const requiresEvidence = Boolean(currentOperational.requiresEvidence || spec.evidence?.length);
    const requiresApproval = Boolean(currentOperational.requiresApproval);
    const roles = uniq([...(currentOperational.responsibleRoles || []), ...(spec.roles || [])]);
    const supportRoles = uniq([...(currentOperational.supportRoles || []), ...(spec.support || [])]);
    const approvalAuthority = uniq(currentOperational.approvalAuthority || []);
    const pendingValidation = uniqPending([
      ...(Array.isArray(currentOperational.pendingValidation) ? currentOperational.pendingValidation : []),
      ...(spec.pending || []),
    ]);

    if (requiresApproval && approvalAuthority.length === 0) {
      const alreadyPending = pendingValidation.some((item) => item?.issue?.toLowerCase().includes('autoridade'));
      if (!alreadyPending) {
        pendingValidation.push(pending(
          `Autoridade formal de aprovação da etapa ${node.data?.numberCode || ''} não confirmada.`,
          'A etapa está configurada para exigir aprovação antes do avanço.',
          supportRoles.join(' / ') || 'Liderança / Qualidade',
          'A aprovação não pode ser presumida; validar o papel autorizado antes da publicação oficial.',
        ));
      }
    }

    const requiredRecords = uniq([...(currentOperational.requiredRecords || []), ...(spec.records || [])]);
    const evidenceExamples = uniq([...(currentOperational.evidenceExamples || []), ...(spec.evidence || [])]);
    if (requiresEvidence && requiredRecords.length === 0) {
      requiredRecords.push('PENDENTE DE VALIDAÇÃO: definir o registro oficial obrigatório desta etapa.');
    }
    if (requiresEvidence && evidenceExamples.length === 0) {
      evidenceExamples.push('PENDENTE DE VALIDAÇÃO: definir a evidência objetiva exigida para esta etapa.');
    }

    const okCriteria = uniq([...(currentOperational.okCriteria || []), ...spec.ok]);
    const nokCriteria = uniq([...(currentOperational.nokCriteria || []), ...spec.nok]);
    const restartCriteria = uniq([
      ...(currentOperational.restartCriteria || []),
      'Condição NOK corrigida e causa imediata controlada.',
      'Verificação repetida com resultado conforme.',
      ...(requiresEvidence ? ['Registros e evidências obrigatórios concluídos.'] : []),
      ...(requiresApproval ? ['Aprovação exigida registrada pela autoridade validada.'] : []),
    ]);
    const nextStep = target(nodesById, spec.next);
    const nokNextStep = target(nodesById, spec.nokNext || id);
    const controlNode = isControlNode({ ...currentOperational, requiresEvidence, requiresApproval });
    const okFlow = uniq([
      ...(currentOperational.okFlow || []),
      ...(requiresEvidence ? ['Registrar o resultado e preservar a rastreabilidade.'] : ['Confirmar a conclusão da etapa.']),
      `Seguir para ${nextStep}.`,
    ]);
    const nokFlow = uniq([
      ...(currentOperational.nokFlow || []),
      ...(controlNode ? defaultNokFlow : [
        'Não avançar enquanto a condição estiver divergente.',
        'Corrigir a condição e repetir a verificação antes de prosseguir.',
      ]),
      `Retornar para ${nokNextStep} após a correção.`,
    ]);

    const reactionPlan = currentOperational.reactionPlan && typeof currentOperational.reactionPlan === 'object'
      ? currentOperational.reactionPlan
      : {};
    const troubleshooting = currentOperational.troubleshooting && typeof currentOperational.troubleshooting === 'object'
      ? currentOperational.troubleshooting
      : {};
    const nokAction = controlNode
      ? 'Não avançar. Interromper ou manter a etapa bloqueada, identificar e registrar a condição, comunicar os papéis definidos, corrigir, reverificar e liberar somente após atender aos critérios de retomada.'
      : 'Não avançar. Corrigir a divergência e repetir a verificação desta etapa.';
    const ifOK = {
      ...(details.ifOK || {}),
      result: details.ifOK?.result || okCriteria[0],
      action: details.ifOK?.action || okFlow[0],
      nextStep,
      alertLevel: 'success',
    };
    const ifNOK = {
      ...(details.ifNOK || {}),
      result: details.ifNOK?.result || nokCriteria[0],
      action: details.ifNOK?.action || nokAction,
      nextStep: nokNextStep,
      alertLevel: 'critical',
    };

    const tasks = (Array.isArray(details.tasks) && details.tasks.length ? details.tasks : [{
      id: `${id}-task-1`, text: node.data?.label || id, completed: false,
    }]).map((task) => ({ ...task, ifOK, ifNOK }));

    enrichedDetails[id] = {
      ...details,
      ifOK,
      ifNOK,
      tasks,
      operational: {
        ...currentOperational,
        traceability: spec.traceability || currentOperational.traceability || '',
        requiresEvidence,
        requiresApproval,
        requiredRecords,
        evidenceExamples,
        approvalCriteria: uniq([...(currentOperational.approvalCriteria || []), ...okCriteria]),
        approvalAuthority,
        okCriteria,
        nokCriteria,
        okFlow,
        nokFlow,
        restartCriteria,
        responsibleRoles: roles,
        supportRoles,
        pendingValidation,
        reactionPlan: {
          ...reactionPlan,
          trigger: reactionPlan.trigger || nokCriteria.join(' '),
          actions: uniq([...(reactionPlan.actions || []), 'Interromper ou manter a etapa sem liberação.', 'Identificar e registrar a condição NOK.', 'Corrigir a causa e repetir a verificação.']),
          containmentActions: uniq([...(reactionPlan.containmentActions || []), controlNode ? 'Manter produto/material afetado identificado e impedido de avançar.' : 'Manter a etapa sem liberação até a correção.']),
          escalationActions: uniq([...(reactionPlan.escalationActions || []), ...supportRoles.map((role) => `Comunicar ${role}.`)]),
          stopProductionCriteria: uniq([...(reactionPlan.stopProductionCriteria || []), ...nokCriteria]),
          restartCriteria,
          owner: reactionPlan.owner || roles[0] || '',
        },
        troubleshooting: {
          ...troubleshooting,
          immediateActions: uniq([...(troubleshooting.immediateActions || []), 'Não avançar enquanto o requisito permanecer NOK.', 'Preservar identificação e rastreabilidade do material afetado.']),
          stopCriteria: uniq([...(troubleshooting.stopCriteria || []), ...nokCriteria]),
          whoToCall: uniq([...(troubleshooting.whoToCall || []), ...supportRoles]),
          requiredEvidence: uniq([...(troubleshooting.requiredEvidence || []), ...evidenceExamples]),
        },
      },
    };
  }

  return { ...map, node_details: enrichedDetails };
}
