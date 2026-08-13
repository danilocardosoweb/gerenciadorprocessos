/**
 * Detalhes Analíticos e Ações & Evidências para o mapa
 * "Montagem de Paletes - Tramontina"
 * Baseado no Procedimento Operacional IATF 16949
 */

export interface NodeDetail {
  id: string;
  description: string;
  actions: string[];
}

export const tramontinaNodeDetails: NodeDetail[] = [
  // ENTRADAS
  {
    id: "in_pallet",
    description: "Pallet de madeira certificado e em condies estruturais perfeitas. Deve estar livre de umidade excessiva, fungos ou pragas. Verificar selo de qualidade do fornecedor homologado. Pallets danificados devem ser descartados imediatamente conforme procedimento de segregação.",
    actions: [
      "Inspecionar 100% dos pallets na recepo",
      "Verificar ausência de pregos expostos e lascas",
      "Confirmar nivelamento em superfície plana",
      "Registrar número do lote do pallet",
      "Fotografar estado do pallet antes da montagem"
    ]
  },
  {
    id: "in_perfis",
    description: "Perfis de alumínio usinados conforme especificação técnica do cliente. Devem apresentar acabamento superficial adequado, sem arranhes, amassados ou deformaes. Cdigo do produto deve corresponder exatamente  OP.",
    actions: [
      "Conferir código do produto vs. Ordem de Produo",
      "Verificar lote de matéria-prima (rastreabilidade)",
      "Medir amostra dimensional (comprimento e tolerância)",
      "Inspecionar acabamento superficial",
      "Validar quantidade conforme etiqueta de produção"
    ]
  },
  {
    id: "in_etiqueta",
    description: "Etiquetas de rastreabilidade impressas conforme padrão IATF 16949. Devem conter: cliente, código do item, nmero do pedido, quantidade, lote, data de produção e turno. QR Code deve estar legível para leitura digital.",
    actions: [
      "Validar campos obrigatórios da etiqueta",
      "Testar legibilidade do QR Code",
      "Confirmar compatibilidade com sistema do cliente",
      "Verificar posição de aplicao no pallet",
      "Registrar impresso no sistema de rastreabilidade"
    ]
  },

  // ETAPA 1 - PREPARAO DA BASE
  {
    id: "e1_integridade",
    description: "Inspeo crítica da estrutura do pallet antes do incio da montagem. Verificar trincas, deformaes, presena de pregos ou parafusos soltos, e estabilidade das longarinas. Pallets com qualquer anomalia estrutural devem ser retirados da linha.",
    actions: [
      "Testar rigidez do pallet aplicando peso de 50kg",
      "Verificar todas as quatro faces visualmente",
      "Confirmar altura uniforme dos pés do pallet",
      "Checar presença de selo do fornecedor",
      "Registrar número do pallet no sistema"
    ]
  },
  {
    id: "e1_pregos",
    description: "Pregos expostos ou mal fixados representam risco de segurança crítico e podem danificar os perfis de alumínio durante acomodagem. Todos os elementos de fixação devem estar rebaixados ou cobertos.",
    actions: [
      "Passar mo luvada sobre toda a superfcie do pallet",
      "Remover ou martelar pregos salientes",
      "Aplicar fita adesiva protetiva quando necessário",
      "Documentar pallet com anomalias",
      "Isolar pallet no conforme imediatamente"
    ]
  },
  {
    id: "e1_nivelamento",
    description: "Base nivelada  essencial para distribuio uniforme de peso e estabilidade durante transporte e armazenamento. Desnveis podem causar deformaes nos perfis e risco de tombamento.",
    actions: [
      "Posicionar pallet em superfície plana nivelada",
      "Verificar oscilao com nvel de bolha",
      "Medir altura dos cantos do pallet",
      "Corrigir com calços se necessário",
      "Registrar adequao da base"
    ]
  },
  {
    id: "e1_limpo",
    description: "Pallet limpo evita contaminação dos perfis com resíduos de madeira, poeira ou produtos qumicos. A limpeza também facilita a aplicao do stretch e identificação da etiqueta.",
    actions: [
      "Remapar resíduos de madeira e serragem",
      "Limpar com pano seco toda a superfície",
      "Verificar ausência de óleos ou graxas",
      "Aplicar desinfetante se necessário",
      "Inspecionar visualmente após limpeza"
    ]
  },

  // ETAPA 2 - ORGANIZAO DOS PERFIS
  {
    id: "e2_codigo",
    description: "Cada código de perfil deve ser tratado separadamente para evitar contaminação cruzada. Mistura de materiais  no-conformidade grave que invalida todo o pallet e gera retrabalho.",
    actions: [
      "Ler código de barras de cada perfil",
      "Conferir com lista de materiais da OP",
      "Separar fisicamente códigos diferentes",
      "Etiquetar grupo de perfis organizados",
      "Registrar separação no sistema"
    ]
  },
  {
    id: "e2_lote",
    description: "Rastreabilidade por lote é requisito obrigatório IATF 16949. Cada lote de matéria-prima deve ser identificável e rastreável até o produto final entregue ao cliente.",
    actions: [
      "Identificar lote de fundio nos perfis",
      "Separar perfis de lotes diferentes",
      "Registrar lotes no sistema de rastreabilidade",
      "Vincular lote MP ao número do pallet",
      "Conferir certificado de análise do lote"
    ]
  },
  {
    id: "e2_comprimento",
    description: "Perfis de comprimentos diferentes devem ser organizados separadamente para otimizao do espao do pallet e evitar deformaes. Perfis mais longos exigem maior ateno na proteção das extremidades.",
    actions: [
      "Medir e classificar perfis por comprimento",
      "Organizar do maior para o menor",
      "Identificar grupo de comprimento similar",
      "Calcular ocupao do pallet",
      "Documentar quantidade por comprimento"
    ]
  },
  {
    id: "e2_pedido",
    description: "Cada pedido do cliente deve ser tratado como uma unidade independente. No  permitido misturar pedidos diferentes em um mesmo pallet sem autorização expressa da qualidade e logística.",
    actions: [
      "Conferir número do pedido na OP",
      "Validar prioridade do pedido",
      "Separar perfis por pedido",
      "Verificar destino final do pallet",
      "Registrar vínculo pedido-pallet"
    ]
  },

  // ETAPA 3 - ACOMODAO DOS PERFIS
  {
    id: "e3_alinhar",
    description: "Alinhamento perfeito dos perfis garante estabilidade da carga e distribuio uniforme do peso. Perfis desalinhados criam pontos de pressão que podem deformar o material.",
    actions: [
      "Posicionar perfis paralelos entre si",
      "Alinhar extremidades em linha reta",
      "Verificar simetria da disposio",
      "Medir espaçamento entre fileiras",
      "Fotografar alinhamento antes da proteção"
    ]
  },
  {
    id: "e3_peso",
    description: "Distribuio uniforme do peso  fundamental para estabilidade do pallet durante movimentação e transporte. Centro de gravidade deve estar centralizado.",
    actions: [
      "Calcular peso total estimado",
      "Distribuir perfis pesados no centro",
      "Evitar concentrao de peso em um lado",
      "Verificar estabilidade manualmente",
      "Registrar peso no sistema"
    ]
  },
  {
    id: "e3_faces",
    description: "Faces dos perfis devem estar sempre em contato suave, sem sobreposies que possam causar marcas de pressão. Acabamento superficial deve ser preservado.",
    actions: [
      "Inspecionar faces de contato",
      "Verificar ausência de sobreposições",
      "Confirmar proteção entre camadas",
      "Validar integridade superficial",
      "Documentar qualidade da acomodao"
    ]
  },
  {
    id: "e3_limites",
    description: "Nenhum perfil pode ultrapassar os limites físicos do pallet. Projeções além das dimensões do pallet criam riscos de impacto durante transporte e armazenamento.",
    actions: [
      "Verificar projeo em todas as direes",
      "Medir se perfis esto dentro do permetro",
      "Reposicionar se houver extrapolao",
      "Confirmar estabilidade lateral",
      "Registrar conformidade dimensional"
    ]
  },

  // ETAPA 4 - INSTALAO DAS PROTEES
  {
    id: "e4_laterais",
    description: "Sarrafos laterais protegem os perfis contra movimentação lateral e impactos. Devem ser fixados firmemente sem danificar os perfis acomodados.",
    actions: [
      "Posicionar sarrafos nos lados do pallet",
      "Fixar com parafusos ou pregos adequados",
      "Verificar firmeza da fixação",
      "Confirmar altura de proteção",
      "Inspecionar ausência de projeções"
    ]
  },
  {
    id: "e4_travessas",
    description: "Travessas superiores mantm os perfis presos verticalmente evitando tombamento. Devem ser instaladas de forma a no comprimir ou deformar os perfis.",
    actions: [
      "Instalar travessas nas extremidades",
      "Fixar com parafusos ou grampos",
      "Verificar tenso adequada",
      "Confirmar alinhamento horizontal",
      "Testar estabilidade do conjunto"
    ]
  },
  {
    id: "e4_travamento",
    description: "Travamento estrutural garante que todo o conjunto (pallet + perfis + proteções) trabalhe como unidade monoltica, sem movimentação relativa entre componentes.",
    actions: [
      "Verificar unio entre sarrafos e travessas",
      "Confirmar ausência de folgas",
      "Testar estabilidade aplicando força lateral",
      "Validar rigidez do conjunto",
      "Documentar adequao estrutural"
    ]
  },

  // ETAPA 5 - APLICAO DAS FITAS PET
  {
    id: "e5_verticais",
    description: "Cintas verticais de polister (PET) mantm os perfis unidos verticalmente. Aplicao deve ser feita em pontos estratgicos sem comprimir excessivamente.",
    actions: [
      "Posicionar cintas nas extremidades",
      "Adicionar cintas intermediárias se necessário",
      "Verificar caminho da cinta sem obstruções",
      "Confirmar posicionamento simétrico",
      "Registrar número de cintas aplicadas"
    ]
  },
  {
    id: "e5_tensionar",
    description: "Tenso correta das fitas  crítica: muito frouxa no segura; muito tensa deforma os perfis. Deve haver equilbrio entre segurança e preservação do produto.",
    actions: [
      "Aplicar tenso progressiva",
      "Verificar deformao dos perfis",
      "Ajustar se houver marcao nos perfis",
      "Confirmar estabilidade após tenso",
      "Testar resistncia  vibrao"
    ]
  },
  {
    id: "e5_presilhas",
    description: "Presilhas (catracas ou selos) garantem que a tenso aplicada seja mantida durante todo o ciclo de vida do pallet, do armazenamento ao transporte.",
    actions: [
      "Instalar presilhas de qualidade",
      "Travar corretamente mecanismo",
      "Verificar corte excessivo da fita",
      "Confirmar firmeza do travamento",
      "Inspecionar ponta da fita (deve estar protegida)"
    ]
  },

  // ETAPA 6 - APLICAO DO STRETCH
  {
    id: "e6_base",
    description: "Iniciar aplicao do filme stretch pela base cria ancoragem inicial. A primeira volta deve ser aplicada com maior tenso para garantir fixação.",
    actions: [
      "Prender filme na base do pallet",
      "Dar 3 voltas iniciais com tenso alta",
      "Verificar aderência ao pallet",
      "Confirmar cobertura das cantoneiras",
      "Registrar incio da aplicao"
    ]
  },
  {
    id: "e6_cobrir",
    description: "Cobertura completa protege os perfis contra sujeira, umidade, poeira e agentes externos durante armazenamento e transporte. No deve haver reas expostas.",
    actions: [
      "Aplicar filmes em todas as faces",
      "Verificar cobertura do topo",
      "Confirmar proteção das laterais",
      "Checar selagem nas extremidades",
      "Inspecionar ausência de furos ou rasgos"
    ]
  },
  {
    id: "e6_sobrepor",
    description: "Sobreposio de camadas (50% de overlap) garante espessura adequada de proteção e resistncia a rasgos. Mltiplas camadas criam barreira efetiva.",
    actions: [
      "Aplicar mínimo 3 camadas de stretch",
      "Verificar overlap de 50% entre camadas",
      "Confirmar uniformidade da aplicao",
      "Testar resistência do conjunto",
      "Documentar número de camadas"
    ]
  },

  // ETAPA 7 - PROTEO FRONTAL
  {
    id: "e7_tela",
    description: "Tela frontal de proteção (arame ou plstico rgido) protege as extremidades dos perfis contra impactos frontais durante movimentação e transporte.",
    actions: [
      "Posicionar tela na face frontal",
      "Fixar firmemente nas laterais",
      "Verificar cobertura total da face",
      "Confirmar ausência de pontas cortantes",
      "Inspecionar estabilidade da tela"
    ]
  },
  {
    id: "e7_extremidades",
    description: "Extremidades dos perfis são regies crticas que sofrem maior risco de impacto. Devem estar sempre protegidas com material adequado (cantoneiras, espumas, telas).",
    actions: [
      "Instalar cantoneiras nas quinas",
      "Aplicar proteção nas extremidades",
      "Verificar firmeza da proteção",
      "Confirmar cobertura de todas as pontas",
      "Documentar tipo de proteção aplicada"
    ]
  },
  {
    id: "e7_impactos",
    description: "Proteo contra impactos  essencial para preservar a qualidade dimensional e superficial dos perfis. Qualquer batida pode gerar amassado ou risco no conforme.",
    actions: [
      "Verificar proteção estrutural frontal",
      "Confirmar amortecimento adequado",
      "Testar resistncia  pressão leve",
      "Validar integridade após proteção",
      "Registrar adequao da proteção"
    ]
  },

  // ETAPA 8 - RASTREABILIDADE
  {
    id: "e8_etiqueta",
    description: "Etiqueta de identificação  o documento primário de rastreabilidade IATF 16949. Deve ser aplicada em local visvel, protegida contra descolamento e danos, e deve permanecer legível durante toda a vida til do pallet.",
    actions: [
      "Preencher todos os campos obrigatórios",
      "Imprimir em material adequado (polipropileno ou similar)",
      "Verificar legibilidade do QR Code",
      "Aplicar em posição visvel e protegida",
      "Registrar aplicao no sistema"
    ]
  },
  {
    id: "e8_lote",
    description: "Rastreabilidade por lote permite, em caso de não conformidade, identificar rapidamente todos os produtos afetados, isol-los e notificar o cliente conforme requisitos IATF.",
    actions: [
      "Registrar lote do produto final",
      "Vincular lote MP ao pallet",
      "Conferir número do pedido",
      "Validar quantidade declarada",
      "Registrar data e turno de produção"
    ]
  },
  {
    id: "e8_campos",
    description: "Campos da etiqueta devem refletir exatamente o que foi produzido. Qualquer divergncia entre etiqueta e contedo real  não conformidade grave que pode gerar devoluo e penalidades.",
    actions: [
      "Conferir Cliente vs. Pedido",
      "Validar Item e Código Cliente",
      "Verificar Medida e Pedido Tecno",
      "Confirmar QTDE e número do Pallet",
      "Validar Pedido Cliente, Turno, Data e Lotes"
    ]
  },

  // ETAPA 9 - INSPEO FINAL
  {
    id: "e9_alinhados",
    description: "Verificao final do alinhamento garante que nenhum perfis se deslocou durante o processo de proteção e amarrao. Alinhamento  indicador de qualidade visual.",
    actions: [
      "Visualizar frontal do pallet",
      "Verificar alinhamento em linha reta",
      "Confirmar simetria da disposio",
      "Medir se necessário",
      "Registrar conformidade"
    ]
  },
  {
    id: "e9_stretch",
    description: "Integridade do stretch  fundamental para proteção. Rasgos, furos ou descolamento comprometem a proteção contra sujeira e umidade.",
    actions: [
      "Inspecionar visualmente 100% da cobertura",
      "Verificar ausência de rasgos ou furos",
      "Confirmar aderência nas extremidades",
      "Testar resistência do conjunto",
      "Documentar integridade"
    ]
  },
  {
    id: "e9_fitas",
    description: "Fitas PET devem estar corretamente tensionadas e travadas. Fitas frouxas ou soltas no garantem estabilidade da carga durante transporte.",
    actions: [
      "Verificar tenso de todas as fitas",
      "Confirmar travamento das presilhas",
      "Testar estabilidade aplicando força",
      "Verificar ausência de deformações",
      "Registrar adequao das amarraes"
    ]
  },
  {
    id: "e9_protecoes",
    description: "Todas as proteções (laterais, superior, frontal) devem estar instaladas e firmes. Ausncia de qualquer proteção invalida o pallet e gera não conformidade.",
    actions: [
      "Checklist de proteções instaladas",
      "Verificar firmeza de cada elemento",
      "Confirmar cobertura total",
      "Testar estabilidade estrutural",
      "Documentar conformidade"
    ]
  },
  {
    id: "e9_etiqueta",
    description: "Etiqueta deve ser verificada uma última vez antes da liberação. Deve estar legível, completa e corretamente aplicada. QR Code deve ser testado.",
    actions: [
      "Ler QR Code com scanner",
      "Conferir todos os campos",
      "Verificar adeso da etiqueta",
      "Confirmar posição visvel",
      "Registrar liberação no sistema"
    ]
  },
  {
    id: "e9_resultado",
    description: "Deciso final de liberação ou bloqueio do pallet baseada no checklist completo de inspeção. Pallets bloqueados devem ser segregados e tratados conforme procedimento de não conformidade.",
    actions: [
      "Aplicar checklist completo de 7 itens",
      "Preencher responsvel por cada verificação",
      "Decidir LIBERADO ou BLOQUEADO",
      "Registrar decisão no sistema",
      "Segregar pallets bloqueados imediatamente"
    ]
  },

  // IATF 16949
  {
    id: "iatf_rastreabilidade",
    description: "Rastreabilidade total do processo: desde a matéria-prima (lote de alumínio), passando pela usinagem, tratamento superficial, até o pallet final entregue ao cliente. Requisito obrigatório IATF 16949 para recall e análise de falhas.",
    actions: [
      "Manter registro de lotes de MP",
      "Rastrear lote de produto acabado",
      "Vincular pallet ao pedido do cliente",
      "Registrar data e turno de produção",
      "Manter histórico por 15 anos (requisito automotivo)"
    ]
  },
  {
    id: "iatf_identificacao",
    description: "Identificao clara e inequvoca de todos os produtos em todas as etapas do processo. Etiquetas devem ser legveis, durveis e conter informaes conforme especificação do cliente.",
    actions: [
      "Padronizar layout da etiqueta",
      "Validar campos obrigatórios",
      "Testar durabilidade da etiqueta",
      "Verificar legibilidade do QR Code",
      "Auditar identificação mensalmente"
    ]
  },
  {
    id: "iatf_preservacao",
    description: "Preservao do produto contra danos, deterioração e contaminação durante todas as etapas: produção, armazenamento, transporte e entrega. Protees devem ser adequadas ao tipo de produto.",
    actions: [
      "Definir proteções por tipo de perfil",
      "Estabelecer tempo mximo de exposio",
      "Controlar condições de armazenamento",
      "Verificar integridade de proteções",
      "Registrar adequao preservacional"
    ]
  },
  {
    id: "iatf_embalagem",
    description: "Controle especfico do processo de embalagem: desde a seleção do pallet adequado, passando pelos materiais de proteção, at a aplicao do stretch e etiquetagem. Embalagem  parte do produto.",
    actions: [
      "Validar especificação de embalagem",
      "Auditar fornecedores de materiais",
      "Controlar qualidade de pallet",
      "Verificar adequao de proteções",
      "Registrar parmetros de embalagem"
    ]
  },
  {
    id: "iatf_segregacao",
    description: "Segregao física e identificação clara de materiais não conformes, em revisão ou bloqueados. área separada com identificação visual adequada para evitar envio acidental.",
    actions: [
      "Definir área física de segregação",
      "Estabelecer identificação visual (vermelho)",
      "Treinar operadores sobre segregação",
      "Auditar área mensalmente",
      "Registrar disposio de NCs"
    ]
  },
  {
    id: "iatf_visual",
    description: "Controle visual em todas as etapas do processo  método primário de deteco de não conformidades. Operadores devem ser treinados para identificar anomalias visuais.",
    actions: [
      "Definir padres de aceitao visual",
      "Treinar operadores em identificação",
      "Estabelecer fotos padrão (golden sample)",
      "Auditar habilidade visual dos operadores",
      "Registrar evidências fotográficas"
    ]
  },
  {
    id: "iatf_padronizacao",
    description: "Padronizao operacional garante que todos os operadores executem a tarefa da mesma forma, resultando em qualidade consistente. ITs e POPs devem ser claros, atualizados e acessveis.",
    actions: [
      "Manter ITs atualizados",
      "Treinar operadores regularmente",
      "Auditar conformidade ao procedimento",
      "Registrar desvios operacionais",
      "Implementar melhorias contínuas"
    ]
  },

  // SEGURANÇA
  {
    id: "seg_oculos",
    description: "culos de segurança protegem contra resíduos de madeira, partculas de stretch, e possveis projteis durante operaes de amarrao e fixação. Uso obrigatório 100% do tempo na área.",
    actions: [
      "Fornecer óculos adequados (incolor)",
      "Exigir uso 100% do tempo",
      "Substituir quando riscados",
      "Treinar sobre importncia",
      "Auditar uso regularmente"
    ]
  },
  {
    id: "seg_luvas",
    description: "Luvas de proteção contra cortes, farpas de madeira, bordas afiadas de perfis e abraso durante manuseio. Luvas devem ser trocadas regularmente.",
    actions: [
      "Fornecer luvas de proteção adequadas",
      "Exigir uso durante manuseio",
      "Substituir luvas danificadas",
      "Treinar sobre riscos",
      "Auditar uso dos EPIs"
    ]
  },
  {
    id: "seg_botina",
    description: "Botina de segurança com biqueira de ao protege contra queda de materiais sobre os ps e esmagamento durante movimentação de pallets. Uso obrigatório.",
    actions: [
      "Exigir botina com biqueira",
      "Verificar estado de conservação",
      "Substituir quando desgastadas",
      "Treinar sobre proteção",
      "Auditar uso obrigatório"
    ]
  },
  {
    id: "seg_mangote",
    description: "Mangote de proteção para braos quando aplicável, especialmente durante operaes que exigem alcance dentro do pallet ou movimentação de materiais cortantes.",
    actions: [
      "Avaliar necessidade por operação",
      "Fornecer quando necessário",
      "Exigir em operações de risco",
      "Treinar uso correto",
      "Auditar aplicao"
    ]
  },
  {
    id: "seg_alerta1",
    description: "ALERTA CRTICO: Nunca permanecer sob cargas suspensas ou em área onde materiais possam cair. Gravidade e impactos são causas principais de acidentes graves.",
    actions: [
      "Demarcar áreas de risco",
      "Sinalizar proibio de permanncia",
      "Treinar sobre zonas de excluso",
      "Auditar comportamentos inseguros",
      "Aplicar disciplina em desobediência"
    ]
  },
  {
    id: "seg_alerta2",
    description: "ALERTA CRTICO: Movimentao de pallets deve ser realizada exclusivamente por operadores habilitados e treinados. Equipamentos (empilhadeiras, paleteiras) exigem certificao.",
    actions: [
      "Certificar operadores de empilhadeira",
      "Treinar operadores de paleteira manual",
      "Exigir credenciamento",
      "Auditar habilitações",
      "Proibir operação no autorizada"
    ]
  },
  {
    id: "seg_alerta3",
    description: "ALERTA CRTICO: Pallets instveis (desbalanceados, com centro de gravidade fora do centro, ou com amarrao inadequada) representam risco iminente de tombamento.",
    actions: [
      "Treinar identificação de instabilidade",
      "Exigir reparo antes de movimentar",
      "Verificar estabilidade antes de elevar",
      "Proibir movimentação de pallets instveis",
      "Reportar imediatamente à liderança"
    ]
  },

  // SAÍDAS
  {
    id: "out_pallet_montado",
    description: "Produto final palletizado conforme especificação do cliente Tramontina. Todos os requisitos de qualidade, proteção, identificação e rastreabilidade atendidos. Pronto para armazenamento ou expedição.",
    actions: [
      "Conferir todos os itens do checklist",
      "Validar etiqueta e rastreabilidade",
      "Verificar proteções e amarrações",
      "Confirmar liberação da qualidade",
      "Registrar saída no sistema WMS"
    ]
  },
  {
    id: "out_rastreavel",
    description: "Pallet 100% rastreável conforme requisitos IATF 16949. Toda a cadeia de produção  rastreável: desde o lote de alumínio at a entrega ao cliente.",
    actions: [
      "Garantir etiqueta com QR Code legível",
      "Vincular pallet ao pedido do cliente",
      "Registrar no sistema de rastreabilidade",
      "Manter registros por 15 anos",
      "Auditar rastreabilidade trimestralmente"
    ]
  },
  {
    id: "out_liberado",
    description: "Status final após aprovação completa da inspeção. Pallet apto para expedição ao cliente. Documentao completa, qualidade confirmada, prazo de entrega garantido.",
    actions: [
      "Aplicar status LIBERADO no sistema",
      "Posicionar em área de expediente",
      "Notificar logística para transporte",
      "Enviar documentação ao cliente",
      "Registrar data e hora de liberação"
    ]
  }
];

export default tramontinaNodeDetails;
