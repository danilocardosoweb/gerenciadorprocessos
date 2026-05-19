import { NodeDetails } from '../components/NodeModal';

const task = (id: string, text: string): NodeDetails['tasks'][number] => ({
  id,
  text,
  completed: false,
});

export const nodeDetailsSeed: Record<string, NodeDetails> = {
  root: {
    description: `Procedimento Operacional Padrão do setor de usinagem de perfis de alumínio. Consolidamos objetivo, escopo, responsabilidades e controles descritos no POP para que cada nó represente uma etapa crítica do fluxo (entrada, execução, segurança, qualidade e indicadores).`,
    images: [],
    tasks: [
      task('root-1', 'Revisar POP completo com supervisão sempre que houver alteração de processo'),
      task('root-2', 'Garantir que novos operadores recebam treinamento usando este mapa'),
    ],
  },
  inputs: {
    description: `Itens necessários antes de liberar qualquer OP: documento emitido pelo PCP via MRP, perfis corretos conferidos, desenho técnico atualizado e programa CNC correspondente.`,
    images: [],
    tasks: [
      task('inputs-1', 'Checar se OP contém código, quantidade e prioridade'),
      task('inputs-2', 'Validar desenho técnico e versão do programa CNC'),
    ],
  },
  outputs: {
    description: `Resultados esperados após cada ordem: peças conforme identificadas, itens segregados para retrabalho, sucata encaminhada corretamente e apontamentos registrados no sistema.`,
    images: [],
    tasks: [
      task('outputs-1', 'Identificar fisicamente peças boas, retrabalhos e sucata'),
      task('outputs-2', 'Registrar produção e perdas na planilha/sistema ao finalizar a OP'),
    ],
  },
  resources: {
    description: `Equipamentos disponíveis no setor: (1) Serra Automática Emmegi 1 Cabeça - para cortes seriados retos ou simples ângulo único, alta produtividade, ciclo automático. (2) Serra Dupla Doppia 2 Cabeças - para cortes angulares simultâneos em esquadria, precisão angular ±0.1°, duas cabeças sincronizadas. (3) Centro de Usinagem CNC - furações, fresamentos e usinagens complexas. Importante: escolher serra correta conforme desenho - Emmegi para cortes retos/únicos, Doppia para cortes em esquadria/ângulos simultâneos.`,
    images: [],
    tasks: [
      task('resources-1', 'Identificar qual serra usar: Emmegi (corte reto/simples) vs Doppia (ângulos/esquadria)'),
      task('resources-2', 'Verificar check-list de manutenção diária das serras e CNC'),
      task('resources-3', 'Confirmar calibração de instrumentos (paquímetro, transferidor) antes do turno'),
    ],
  },
  people: {
    description: `Papéis definidos: Supervisor (planeja e libera), Operador (executa e controla), Auxiliar (apoia fluxo de materiais) e Qualidade/PCP (suporte a desvios).`,
    images: [],
    tasks: [
      task('people-1', 'Confirmar registro de treinamento válido para cada operador'),
      task('people-2', 'Planejar cobertura de férias para não abrir lacunas de responsabilidade'),
    ],
  },
  methods: {
    description: `Sequência operacional do POP: preparação de máquinas, execução segura nas serras/CNC, controles em processo, apontamentos e tratamento de não conformidades.`,
    images: [],
    tasks: [
      task('methods-1', 'Revisar instruções passo a passo no início de cada lote'),
      task('methods-2', 'Documentar ajustes de processo liberados pelo supervisor'),
    ],
  },
  kpis: {
    description: `Indicadores mínimos: quantidade produzida, refugo %, registro de paradas e disciplina 5S. Esses dados alimentam o acompanhamento diário do supervisor.`,
    images: [],
    tasks: [
      task('kpis-1', 'Atualizar quadro diário com produção, refugo e paradas'),
      task('kpis-2', 'Enviar relatório semanal ao PCP com tendência dos índices'),
    ],
  },
  safety: {
    description: `Seção 4 do POP reforça EPIs obrigatórios e regras de bloqueio: óculos, protetor auricular, luvas anticorte e calçado; proibição de operar sem treinamento ou com proteções removidas.`,
    images: [],
    tasks: [
      task('safety-1', 'Aplicar check-list de EPIs no início de cada turno'),
      task('safety-2', 'Registrar e tratar qualquer violação de segurança imediatamente'),
    ],
  },
  quality: {
    description: `Controle em processo descrito no item 9: medir primeiras peças, comparar contra desenho e segregar desvios. Garante atendimento às tolerâncias críticas de comprimento, furos e diâmetros.`,
    images: [],
    tasks: [
      task('quality-1', 'Salvar registros dimensionais da primeira peça e da amostragem'),
      task('quality-2', 'Acionar Qualidade caso haja tendência de desvio antes do fim da OP'),
    ],
  },
  in_op: {
    description: `A OP emitida pelo PCP via MRP deve trazer código do produto, quantidade, desenho, tolerâncias e prioridade. O operador só inicia após validar todas as informações e sanar dúvidas com PCP.`,
    images: [],
    tasks: [
      task('in-op-1', 'Conferir assinatura/liberação do PCP antes de iniciar'),
      task('in-op-2', 'Registrar no quadro o nº da OP e o prazo de entrega'),
    ],
  },
  in_mat: {
    description: `Perfis de alumínio precisam ser conferidos quanto ao código, comprimento bruto e condição visual (amassados, riscos, empenos). Material fora de especificação é devolvido antes de cortar.`,
    images: [],
    tasks: [
      task('in-mat-1', 'Registrar lote e fornecedor na ficha de processo'),
      task('in-mat-2', 'Segregar perfis danificados para análise do recebimento'),
    ],
  },
  in_draw: {
    description: `Desenho técnico define medidas, furos e tolerâncias. É referência para conferências dimensionais e para selecionar o programa CNC correto.`,
    images: [],
    tasks: [
      task('in-draw-1', 'Garantir que a versão impressa corresponde ao último revisionamento'),
      task('in-draw-2', 'Destacar tolerâncias críticas no quadro de acompanhamento'),
    ],
  },
  in_prog: {
    description: `Programa CNC deve ser selecionado conforme OP e validado com simulação/zeragem antes da produção.`,
    images: [],
    tasks: [
      task('in-prog-1', 'Executar simulação a seco ao trocar de código'),
      task('in-prog-2', 'Guardar backup do programa aprovado em pasta controlada'),
    ],
  },
  out_ok: {
    description: `Peças produzidas conforme especificação recebem identificação imediata (etiqueta ou lote) e seguem para a próxima etapa logística.`,
    images: [],
    tasks: [
      task('out-ok-1', 'Fixar etiqueta com nº da OP e quantidade liberada'),
      task('out-ok-2', 'Atualizar o estoque de semiacabados após conferência'),
    ],
  },
  out_nc: {
    description: `Itens fora de especificação vão para retrabalho com identificação e registro da causa. O POP orienta parar o processo e comunicar o supervisor/qualidade.`,
    images: [],
    tasks: [
      task('out-nc-1', 'Abrir relatório de não conformidade quando houver desvio'),
      task('out-nc-2', 'Registrar ação de retrabalho ou sucata após avaliação'),
    ],
  },
  out_scrap: {
    description: `Sucata e cavacos são segregados e enviados para descarte conforme orientação ambiental.`,
    images: [],
    tasks: [
      task('out-scrap-1', 'Preencher planilha de peso/volume de sucata por OP'),
      task('out-scrap-2', 'Garantir armazenagem em contentor identificado'),
    ],
  },
  out_apo: {
    description: `Apontamento de produção registra quantidade produzida, refugo e motivo das perdas ao final da OP.`,
    images: [],
    tasks: [
      task('out-apo-1', 'Registrar início/fim da OP e horas extras utilizadas'),
      task('out-apo-2', 'Enviar apontamento diário para o PCP até o fim do turno'),
    ],
  },
  res_serra_auto: {
    description: `Serra Automática Emmegi 1 Cabeça - Equipamento italiano de alta precisão para cortes seriados em perfis de alumínio. Características: avanço automático por servo-motor, cabeça inclinável para cortes em ângulo (até 45°), sistema de lubrificação por névoa, batente móvel com escala digital (precisão ±0.1mm). Capacidade de corte: até 150mm de altura. Ciclo automático completo com retorno da mesa. Diferencial: produtividade para lotes grandes com corte único ou em ângulo.`,
    images: [],
    tasks: [
      task('res-serra-auto-1', 'Verificar nível de lubrificante no reservatório antes do turno'),
      task('res-serra-auto-2', 'Conferir desgaste do disco (mínimo 60% de diâmetro útil)'),
      task('res-serra-auto-3', 'Programar comprimento no display digital e validar contra OP'),
      task('res-serra-auto-4', 'Ajustar pressão do grampo conforme perfil (evita deformação)'),
      task('res-serra-auto-5', 'Executar corte teste e medir peça antes de liberar produção'),
      task('res-serra-auto-6', 'Registrar contador de peças ao final de cada OP'),
    ],
  },
  res_serra_dupla: {
    description: `Serra Dupla Doppia 2 Cabeças - Equipamento especializado para cortes angulares simultâneos em esquadria. Características: duas cabeças independentes (esquerda/direita) que cortam simultaneamente, ângulos ajustáveis de 90° a 22.5° (interno/externo), sistema de fixação por pneumática com 4+2 grampos, mesa de apoio com rolos para perfis longos. Precisão angular: ±0.1°. Corte simultâneo garante esquadro perfeito entre faces. Indicada para: cortes em esquadria (45°/45°, 30°/60°), perfis grandes que precisam de estabilidade bilateral, e quando o ângulo entre faces precisa ser exato. NÃO usar para cortes retos simples - usar Emmegi nesses casos.`,
    images: [],
    tasks: [
      task('res-serra-dupla-1', 'Verificar lubrificação das duas cabeças antes do turno'),
      task('res-serra-dupla-2', 'Conferir discos em ambas cabeças (trocar se desgaste > 40%)'),
      task('res-serra-dupla-3', 'Programar ângulos nas duas cabeças conforme desenho técnico'),
      task('res-serra-dupla-4', 'Validar esquadro com gabarito antes do primeiro corte'),
      task('res-serra-dupla-5', 'Ajustar pressão dos grampos laterais para evitar vibração'),
      task('res-serra-dupla-6', 'Medir ângulos das primeiras peças com transferidor de precisão'),
      task('res-serra-dupla-7', 'Registrar setup realizado (ângulos Esq/Dir) no formulário'),
    ],
  },
  res_cnc: {
    description: `Centro de Usinagem CNC responsável por furações e usinagens complexas. Requer verificação de ferramentas, zeragem e simulação.`,
    images: [],
    tasks: [
      task('res-cnc-1', 'Medir desgaste da ferramenta e registrar substituições'),
      task('res-cnc-2', 'Acompanhar alarmes e atualizar manutenção preventiva'),
    ],
  },
  res_gages: {
    description: `Instrumentos de medição (paquímetros, gabaritos) precisam estar calibrados e limpos para garantir leitura confiável.`,
    images: [],
    tasks: [
      task('res-gages-1', 'Checar etiqueta de calibração antes de usar'),
      task('res-gages-2', 'Limpar e guardar os instrumentos após cada turno'),
    ],
  },
  peo_sup: {
    description: `Supervisor garante cumprimento do POP, prioriza OPs, acompanha indicadores e autoriza ajustes.`,
    images: [],
    tasks: [
      task('peo-sup-1', 'Realizar reunião rápida de alinhamento no início do turno'),
      task('peo-sup-2', 'Validar resultados diários com Qualidade e PCP'),
    ],
  },
  peo_op: {
    description: `Operador de usinagem opera serras/CNC, prepara máquinas, executa controles dimensionais e aponta produção.`,
    images: [],
    tasks: [
      task('peo-op-1', 'Conferir 100% das primeiras peças do lote'),
      task('peo-op-2', 'Comunicar imediatamente qualquer anomalia sonora ou visual'),
    ],
  },
  peo_aux: {
    description: `Auxiliar abastece, remove peças, movimenta materiais e mantém posto organizado.` ,
    images: [],
    tasks: [
      task('peo-aux-1', 'Garantir segregação de sucata e resíduos conforme POP'),
      task('peo-aux-2', 'Executar limpeza entre trocas de OP seguindo 5S'),
    ],
  },
  peo_qual: {
    description: `Qualidade e PCP suportam desvios, tratam indicadores e mantêm documentos atualizados.`,
    images: [],
    tasks: [
      task('peo-qual-1', 'Atualizar desenhos e instruções disponíveis na célula'),
      task('peo-qual-2', 'Acompanhar indicadores críticos junto ao supervisor semanalmente'),
    ],
  },
  met_prep_serra: {
    description: `Preparação específica de cada serra conforme tipo de corte: PARA SERRA EMMEGI (1 cabeça): selecionar programa ou ajustar comprimento digital, verificar disco único, lubrificação por névoa, grampo central. PARA SERRA DOPPIA (2 cabeças): ajustar ângulos nas DUAS cabeças simultaneamente, verificar discos em ambas, lubrificação dupla, grampos laterais + central. REGRA DE OURO: Emmegi para cortes retos ou ângulo único; Doppia para cortes em esquadria (45+45, 30+60) ou quando precisar de estabilidade bilateral.`,
    images: [],
    tasks: [
      task('met-prep-serra-1', 'Escolher serra correta antes de iniciar setup (ver desenho: há ângulos em esquadria?)'),
      task('met-prep-serra-2', 'Emmegi: programar comprimento, ajustar grampo único, verificar batente'),
      task('met-prep-serra-3', 'Doppia: ajustar ângulos Esq/Dir, verificar esquadro, grampos laterais'),
      task('met-prep-serra-4', 'Registrar setup realizado no formulário específico da máquina'),
    ],
  },
  met_prep_cnc: {
    description: `Setup do CNC: seleção de programa, conferência das ferramentas, fixação, zeragem e simulação prevista no POP.`,
    images: [],
    tasks: [
      task('met-prep-cnc-1', 'Executar “dry run” após trocar dispositivos'),
      task('met-prep-cnc-2', 'Checar torque dos grampos e registrar no checklist'),
    ],
  },
  met_op_serra: {
    description: `Operação das serras conforme tipo: EMMEGI (automática): posicionar perfil no batente, fechar proteção, iniciar ciclo automático (corte + retorno), aguardar parada completa. DOPPIA (dupla): posicionar perfil centrado entre cabeças, fechar grampos pneumáticos, iniciar corte simultâneo das duas cabeças. ATENÇÃO: na Doppia, NUNCA operar com apenas uma cabeça - sempre usar ambas para garantir estabilidade. Segurança: aguardar parada completa antes de abrir proteção; nunca remover peça com disco em movimento.`,
    images: [],
    tasks: [
      task('met-op-serra-1', 'Identificar serra em uso e seguir procedimento específico'),
      task('met-op-serra-2', 'Emmegi: aguardar ciclo completo (corte + retorno mesa)'),
      task('met-op-serra-3', 'Doppia: garantir que ambas cabeças pararam antes de abrir proteção'),
      task('met-op-serra-4', 'Nunca remover peça com disco girando - risco de acidente'),
      task('met-op-serra-5', 'Registrar ocorrência caso necessite interromper ciclo'),
    ],
  },
  met_op_cnc: {
    description: `Operação no CNC: iniciar ciclo automático, monitorar ruídos/vibração e interromper em caso de anomalia.`,
    images: [],
    tasks: [
      task('met-op-cnc-1', 'Configurar alarmes de carga para detectar esforço anormal'),
      task('met-op-cnc-2', 'Documentar ajustes de avanço/rotação aprovados'),
    ],
  },
  met_nc: {
    description: `Tratamento de não conformidades: parar processo, comunicar supervisor/qualidade, registrar ocorrência e aguardar instrução de retrabalho ou sucata.`,
    images: [],
    tasks: [
      task('met-nc-1', 'Abrir ticket no sistema QMS sempre que parar a máquina'),
      task('met-nc-2', 'Anexar fotos/medidas da peça para acelerar análise'),
    ],
  },
  met_kaizen: {
    description: `Compromisso com melhoria contínua: registrar sugestões que reduzam setup, perdas e retrabalhos, conforme item 13 do POP.`,
    images: [],
    tasks: [
      task('met-kaizen-1', 'Reunir equipe quinzenalmente para revisar ideias'),
      task('met-kaizen-2', 'Documentar ganhos quando uma sugestão é implantada'),
    ],
  },
  saf_epi: {
    description: `Lista de EPIs obrigatórios: óculos, protetor auricular, luvas anticorte para manuseio de perfis e calçado de segurança.`,
    images: [],
    tasks: [
      task('saf-epi-1', 'Substituir imediatamente qualquer EPI danificado'),
      task('saf-epi-2', 'Registrar entrega e validade dos EPIs por colaborador'),
    ],
  },
  saf_reg1: {
    description: `Regra 1: Proibido operar máquinas sem treinamento formal registrado.`,
    images: [],
    tasks: [
      task('saf-reg1-1', 'Bloquear login de operadores sem certificação vigente'),
      task('saf-reg1-2', 'Atualizar matriz de treinamento trimestralmente'),
    ],
  },
  saf_reg2: {
    description: `Regra 2: Nunca remover proteções de segurança das máquinas.`,
    images: [],
    tasks: [
      task('saf-reg2-1', 'Inspecionar proteções a cada troca de turno'),
      task('saf-reg2-2', 'Abrir chamado imediato se algum sensor/proteção falhar'),
    ],
  },
  saf_reg3: {
    description: `Regra 3: É proibido medir peças com a máquina em funcionamento; aguardar parada total.`,
    images: [],
    tasks: [
      task('saf-reg3-1', 'Reforçar instrução durante integração de novos colaboradores'),
      task('saf-reg3-2', 'Registrar advertência em caso de descumprimento'),
    ],
  },
  qua_first: {
    description: `Primeiras peças do lote são 100% medidas para validar setup antes de seguir em massa.`,
    images: [],
    tasks: [
      task('qua-first-1', 'Anexar registro dimensional da primeira peça ao relatório da OP'),
      task('qua-first-2', 'Liberar produção só após aprovação da Qualidade quando exigido'),
    ],
  },
  qua_comp: {
    description: `Itens a conferir: comprimento, posição dos furos, diâmetros e distâncias críticas.`,
    images: [],
    tasks: [
      task('qua-comp-1', 'Utilizar gabarito específico para furos quando disponível'),
      task('qua-comp-2', 'Registrar medições intermediárias conforme frequência definida'),
    ],
  },
  qua_draw: {
    description: `Comparar todas as medições com o desenho técnico vigente, garantindo atendimento às tolerâncias.`,
    images: [],
    tasks: [
      task('qua-draw-1', 'Validar número da revisão impresso nos desenhos do posto'),
      task('qua-draw-2', 'Reportar imediatamente qualquer divergência entre desenho e OP'),
    ],
  },
  qua_seg: {
    description: `Peças fora de especificação devem ser segregadas e identificadas para análise e possível reposição.`,
    images: [],
    tasks: [
      task('qua-seg-1', 'Utilizar etiquetas vermelhas para itens segregados'),
      task('qua-seg-2', 'Fotografar e anexar ao relatório de não conformidade'),
    ],
  },
  kpi_prod: {
    description: `Quantidade produzida por OP é registrada no apontamento diário e comparada com objetivo do PCP.`,
    images: [],
    tasks: [
      task('kpi-prod-1', 'Atualizar quadro de produção a cada lote finalizado'),
      task('kpi-prod-2', 'Enviar consolidação semanal para o PCP'),
    ],
  },
  kpi_scrap: {
    description: `Índice de refugo e motivos das perdas são obrigatórios para análise de tendência e planos de ação.`,
    images: [],
    tasks: [
      task('kpi-scrap-1', 'Classificar perda por causa (processo, matéria-prima, equipamento)'),
      task('kpi-scrap-2', 'Apresentar indicador em reunião de performance'),
    ],
  },
  kpi_stop: {
    description: `Registro de paradas: setup, manutenção, falta de material etc., conforme item 10 do POP.`,
    images: [],
    tasks: [
      task('kpi-stop-1', 'Adotar código padrão para cada tipo de parada'),
      task('kpi-stop-2', 'Compartilhar dados com manutenção para planejar preventivas'),
    ],
  },
  kpi_5s: {
    description: `Finalização da OP inclui limpeza de cavacos, organização e cumprimento dos 5S na área.`,
    images: [],
    tasks: [
      task('kpi-5s-1', 'Executar checklist de limpeza antes de liberar o posto'),
      task('kpi-5s-2', 'Registrar auditoria 5S semanal com fotos'),
    ],
  },
};
