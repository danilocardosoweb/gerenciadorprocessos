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
    description: "Pallet de madeira certificado e em condições estruturais perfeitas. Deve estar livre de umidade excessiva, fungos ou pragas. Verificar selo de qualidade do fornecedor homologado. Pallets danificados devem ser descartados imediatamente conforme procedimento de segregação.",
    actions: [
      "Inspecionar 100% dos pallets na recepção",
      "Verificar ausência de pregos expostos e lascas",
      "Confirmar nivelamento em superfície plana",
      "Registrar número do lote do pallet",
      "Fotografar estado do pallet antes da montagem"
    ]
  },
  {
    id: "in_perfis",
    description: "Perfis de alumínio usinados conforme especificação técnica do cliente. Devem apresentar acabamento superficial adequado, sem arranhões, amassados ou deformações. Código do produto deve corresponder exatamente à OP.",
    actions: [
      "Conferir código do produto vs. Ordem de Produção",
      "Verificar lote de matéria-prima (rastreabilidade)",
      "Medir amostra dimensional (comprimento e tolerância)",
      "Inspecionar acabamento superficial",
      "Validar quantidade conforme etiqueta de produção"
    ]
  },
  {
    id: "in_etiqueta",
    description: "Etiquetas de rastreabilidade impressas conforme padrão IATF 16949. Devem conter: cliente, código do item, número do pedido, quantidade, lote, data de produção e turno. QR Code deve estar legível para leitura digital.",
    actions: [
      "Validar campos obrigatórios da etiqueta",
      "Testar legibilidade do QR Code",
      "Confirmar compatibilidade com sistema do cliente",
      "Verificar posição de aplicação no pallet",
      "Registrar impressão no sistema de rastreabilidade"
    ]
  },

  // ETAPA 1 - PREPARAÇÃO DA BASE
  {
    id: "e1_integridade",
    description: "Inspeção crítica da estrutura do pallet antes do início da montagem. Verificar trincas, deformações, presença de pregos ou parafusos soltos, e estabilidade das longarinas. Pallets com qualquer anomalia estrutural devem ser retirados da linha.",
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
      "Passar mão luvada sobre toda a superfície do pallet",
      "Remover ou martelar pregos salientes",
      "Aplicar fita adesiva protetiva quando necessário",
      "Documentar pallet com anomalias",
      "Isolar pallet não conforme imediatamente"
    ]
  },
  {
    id: "e1_nivelamento",
    description: "Base nivelada é essencial para distribuição uniforme de peso e estabilidade durante transporte e armazenamento. Desníveis podem causar deformações nos perfis e risco de tombamento.",
    actions: [
      "Posicionar pallet em superfície plana nivelada",
      "Verificar oscilação com nível de bolha",
      "Medir altura dos cantos do pallet",
      "Corrigir com calços se necessário",
      "Registrar adequação da base"
    ]
  },
  {
    id: "e1_limpo",
    description: "Pallet limpo evita contaminação dos perfis com resíduos de madeira, poeira ou produtos químicos. A limpeza também facilita a aplicação do stretch e identificação da etiqueta.",
    actions: [
      "Remapar resíduos de madeira e serragem",
      "Limpar com pano seco toda a superfície",
      "Verificar ausência de óleos ou graxas",
      "Aplicar desinfetante se necessário",
      "Inspecionar visualmente após limpeza"
    ]
  },

  // ETAPA 2 - ORGANIZAÇÃO DOS PERFIS
  {
    id: "e2_codigo",
    description: "Cada código de perfil deve ser tratado separadamente para evitar contaminação cruzada. Mistura de materiais é não-conformidade grave que invalida todo o pallet e gera retrabalho.",
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
      "Identificar lote de fundição nos perfis",
      "Separar perfis de lotes diferentes",
      "Registrar lotes no sistema de rastreabilidade",
      "Vincular lote MP ao número do pallet",
      "Conferir certificado de análise do lote"
    ]
  },
  {
    id: "e2_comprimento",
    description: "Perfis de comprimentos diferentes devem ser organizados separadamente para otimização do espaço do pallet e evitar deformações. Perfis mais longos exigem maior atenção na proteção das extremidades.",
    actions: [
      "Medir e classificar perfis por comprimento",
      "Organizar do maior para o menor",
      "Identificar grupo de comprimento similar",
      "Calcular ocupação do pallet",
      "Documentar quantidade por comprimento"
    ]
  },
  {
    id: "e2_pedido",
    description: "Cada pedido do cliente deve ser tratado como uma unidade independente. Não é permitido misturar pedidos diferentes em um mesmo pallet sem autorização expressa da qualidade e logística.",
    actions: [
      "Conferir número do pedido na OP",
      "Validar prioridade do pedido",
      "Separar perfis por pedido",
      "Verificar destino final do pallet",
      "Registrar vínculo pedido-pallet"
    ]
  },

  // ETAPA 3 - ACOMODAÇÃO DOS PERFIS
  {
    id: "e3_alinhar",
    description: "Alinhamento perfeito dos perfis garante estabilidade da carga e distribuição uniforme do peso. Perfis desalinhados criam pontos de pressão que podem deformar o material.",
    actions: [
      "Posicionar perfis paralelos entre si",
      "Alinhar extremidades em linha reta",
      "Verificar simetria da disposição",
      "Medir espaçamento entre fileiras",
      "Fotografar alinhamento antes da proteção"
    ]
  },
  {
    id: "e3_peso",
    description: "Distribuição uniforme do peso é fundamental para estabilidade do pallet durante movimentação e transporte. Centro de gravidade deve estar centralizado.",
    actions: [
      "Calcular peso total estimado",
      "Distribuir perfis pesados no centro",
      "Evitar concentração de peso em um lado",
      "Verificar estabilidade manualmente",
      "Registrar peso no sistema"
    ]
  },
  {
    id: "e3_faces",
    description: "Faces dos perfis devem estar sempre em contato suave, sem sobreposições que possam causar marcas de pressão. Acabamento superficial deve ser preservado.",
    actions: [
      "Inspecionar faces de contato",
      "Verificar ausência de sobreposições",
      "Confirmar proteção entre camadas",
      "Validar integridade superficial",
      "Documentar qualidade da acomodação"
    ]
  },
  {
    id: "e3_limites",
    description: "Nenhum perfil pode ultrapassar os limites físicos do pallet. Projeções além das dimensões do pallet criam riscos de impacto durante transporte e armazenamento.",
    actions: [
      "Verificar projeção em todas as direções",
      "Medir se perfis estão dentro do perímetro",
      "Reposicionar se houver extrapolação",
      "Confirmar estabilidade lateral",
      "Registrar conformidade dimensional"
    ]
  },

  // ETAPA 4 - INSTALAÇÃO DAS PROTEÇÕES
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
    description: "Travessas superiores mantêm os perfis presos verticalmente evitando tombamento. Devem ser instaladas de forma a não comprimir ou deformar os perfis.",
    actions: [
      "Instalar travessas nas extremidades",
      "Fixar com parafusos ou grampos",
      "Verificar tensão adequada",
      "Confirmar alinhamento horizontal",
      "Testar estabilidade do conjunto"
    ]
  },
  {
    id: "e4_travamento",
    description: "Travamento estrutural garante que todo o conjunto (pallet + perfis + proteções) trabalhe como unidade monolítica, sem movimentação relativa entre componentes.",
    actions: [
      "Verificar união entre sarrafos e travessas",
      "Confirmar ausência de folgas",
      "Testar estabilidade aplicando força lateral",
      "Validar rigidez do conjunto",
      "Documentar adequação estrutural"
    ]
  },

  // ETAPA 5 - APLICAÇÃO DAS FITAS PET
  {
    id: "e5_verticais",
    description: "Cintas verticais de poliéster (PET) mantêm os perfis unidos verticalmente. Aplicação deve ser feita em pontos estratégicos sem comprimir excessivamente.",
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
    description: "Tensão correta das fitas é crítica: muito frouxa não segura; muito tensa deforma os perfis. Deve haver equilíbrio entre segurança e preservação do produto.",
    actions: [
      "Aplicar tensão progressiva",
      "Verificar deformação dos perfis",
      "Ajustar se houver marcação nos perfis",
      "Confirmar estabilidade após tensão",
      "Testar resistência à vibração"
    ]
  },
  {
    id: "e5_presilhas",
    description: "Presilhas (catracas ou selos) garantem que a tensão aplicada seja mantida durante todo o ciclo de vida do pallet, do armazenamento ao transporte.",
    actions: [
      "Instalar presilhas de qualidade",
      "Travar corretamente mecanismo",
      "Verificar corte excessivo da fita",
      "Confirmar firmeza do travamento",
      "Inspecionar ponta da fita (deve estar protegida)"
    ]
  },

  // ETAPA 6 - APLICAÇÃO DO STRETCH
  {
    id: "e6_base",
    description: "Iniciar aplicação do filme stretch pela base cria ancoragem inicial. A primeira volta deve ser aplicada com maior tensão para garantir fixação.",
    actions: [
      "Prender filme na base do pallet",
      "Dar 3 voltas iniciais com tensão alta",
      "Verificar aderência ao pallet",
      "Confirmar cobertura das cantoneiras",
      "Registrar início da aplicação"
    ]
  },
  {
    id: "e6_cobrir",
    description: "Cobertura completa protege os perfis contra sujeira, umidade, poeira e agentes externos durante armazenamento e transporte. Não deve haver áreas expostas.",
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
    description: "Sobreposição de camadas (50% de overlap) garante espessura adequada de proteção e resistência a rasgos. Múltiplas camadas criam barreira efetiva.",
    actions: [
      "Aplicar mínimo 3 camadas de stretch",
      "Verificar overlap de 50% entre camadas",
      "Confirmar uniformidade da aplicação",
      "Testar resistência do conjunto",
      "Documentar número de camadas"
    ]
  },

  // ETAPA 7 - PROTEÇÃO FRONTAL
  {
    id: "e7_tela",
    description: "Tela frontal de proteção (arame ou plástico rígido) protege as extremidades dos perfis contra impactos frontais durante movimentação e transporte.",
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
    description: "Extremidades dos perfis são regiões críticas que sofrem maior risco de impacto. Devem estar sempre protegidas com material adequado (cantoneiras, espumas, telas).",
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
    description: "Proteção contra impactos é essencial para preservar a qualidade dimensional e superficial dos perfis. Qualquer batida pode gerar amassado ou risco não conforme.",
    actions: [
      "Verificar proteção estrutural frontal",
      "Confirmar amortecimento adequado",
      "Testar resistência à pressão leve",
      "Validar integridade após proteção",
      "Registrar adequação da proteção"
    ]
  },

  // ETAPA 8 - RASTREABILIDADE
  {
    id: "e8_etiqueta",
    description: "Etiqueta de identificação é o documento primário de rastreabilidade IATF 16949. Deve ser aplicada em local visível, protegida contra descolamento e danos, e deve permanecer legível durante toda a vida útil do pallet.",
    actions: [
      "Preencher todos os campos obrigatórios",
      "Imprimir em material adequado (polipropileno ou similar)",
      "Verificar legibilidade do QR Code",
      "Aplicar em posição visível e protegida",
      "Registrar aplicação no sistema"
    ]
  },
  {
    id: "e8_lote",
    description: "Rastreabilidade por lote permite, em caso de não conformidade, identificar rapidamente todos os produtos afetados, isolá-los e notificar o cliente conforme requisitos IATF.",
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
    description: "Campos da etiqueta devem refletir exatamente o que foi produzido. Qualquer divergência entre etiqueta e conteúdo real é não conformidade grave que pode gerar devolução e penalidades.",
    actions: [
      "Conferir Cliente vs. Pedido",
      "Validar Item e Código Cliente",
      "Verificar Medida e Pedido Tecno",
      "Confirmar QTDE e número do Pallet",
      "Validar Pedido Cliente, Turno, Data e Lotes"
    ]
  },

  // ETAPA 9 - INSPEÇÃO FINAL
  {
    id: "e9_alinhados",
    description: "Verificação final do alinhamento garante que nenhum perfis se deslocou durante o processo de proteção e amarração. Alinhamento é indicador de qualidade visual.",
    actions: [
      "Visualizar frontal do pallet",
      "Verificar alinhamento em linha reta",
      "Confirmar simetria da disposição",
      "Medir se necessário",
      "Registrar conformidade"
    ]
  },
  {
    id: "e9_stretch",
    description: "Integridade do stretch é fundamental para proteção. Rasgos, furos ou descolamento comprometem a proteção contra sujeira e umidade.",
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
    description: "Fitas PET devem estar corretamente tensionadas e travadas. Fitas frouxas ou soltas não garantem estabilidade da carga durante transporte.",
    actions: [
      "Verificar tensão de todas as fitas",
      "Confirmar travamento das presilhas",
      "Testar estabilidade aplicando força",
      "Verificar ausência de deformações",
      "Registrar adequação das amarrações"
    ]
  },
  {
    id: "e9_protecoes",
    description: "Todas as proteções (laterais, superior, frontal) devem estar instaladas e firmes. Ausência de qualquer proteção invalida o pallet e gera não conformidade.",
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
      "Verificar adesão da etiqueta",
      "Confirmar posição visível",
      "Registrar liberação no sistema"
    ]
  },
  {
    id: "e9_resultado",
    description: "Decisão final de liberação ou bloqueio do pallet baseada no checklist completo de inspeção. Pallets bloqueados devem ser segregados e tratados conforme procedimento de não conformidade.",
    actions: [
      "Aplicar checklist completo de 7 itens",
      "Preencher responsável por cada verificação",
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
    description: "Identificação clara e inequívoca de todos os produtos em todas as etapas do processo. Etiquetas devem ser legíveis, duráveis e conter informações conforme especificação do cliente.",
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
    description: "Preservação do produto contra danos, deterioração e contaminação durante todas as etapas: produção, armazenamento, transporte e entrega. Proteções devem ser adequadas ao tipo de produto.",
    actions: [
      "Definir proteções por tipo de perfil",
      "Estabelecer tempo máximo de exposição",
      "Controlar condições de armazenamento",
      "Verificar integridade de proteções",
      "Registrar adequação preservacional"
    ]
  },
  {
    id: "iatf_embalagem",
    description: "Controle específico do processo de embalagem: desde a seleção do pallet adequado, passando pelos materiais de proteção, até a aplicação do stretch e etiquetagem. Embalagem é parte do produto.",
    actions: [
      "Validar especificação de embalagem",
      "Auditar fornecedores de materiais",
      "Controlar qualidade de pallet",
      "Verificar adequação de proteções",
      "Registrar parâmetros de embalagem"
    ]
  },
  {
    id: "iatf_segregacao",
    description: "Segregação física e identificação clara de materiais não conformes, em revisão ou bloqueados. Área separada com identificação visual adequada para evitar envio acidental.",
    actions: [
      "Definir área física de segregação",
      "Estabelecer identificação visual (vermelho)",
      "Treinar operadores sobre segregação",
      "Auditar área mensalmente",
      "Registrar disposição de NCs"
    ]
  },
  {
    id: "iatf_visual",
    description: "Controle visual em todas as etapas do processo é método primário de detecção de não conformidades. Operadores devem ser treinados para identificar anomalias visuais.",
    actions: [
      "Definir padrões de aceitação visual",
      "Treinar operadores em identificação",
      "Estabelecer fotos padrão (golden sample)",
      "Auditar habilidade visual dos operadores",
      "Registrar evidências fotográficas"
    ]
  },
  {
    id: "iatf_padronizacao",
    description: "Padronização operacional garante que todos os operadores executem a tarefa da mesma forma, resultando em qualidade consistente. ITs e POPs devem ser claros, atualizados e acessíveis.",
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
    description: "Óculos de segurança protegem contra resíduos de madeira, partículas de stretch, e possíveis projéteis durante operações de amarração e fixação. Uso obrigatório 100% do tempo na área.",
    actions: [
      "Fornecer óculos adequados (incolor)",
      "Exigir uso 100% do tempo",
      "Substituir quando riscados",
      "Treinar sobre importância",
      "Auditar uso regularmente"
    ]
  },
  {
    id: "seg_luvas",
    description: "Luvas de proteção contra cortes, farpas de madeira, bordas afiadas de perfis e abrasão durante manuseio. Luvas devem ser trocadas regularmente.",
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
    description: "Botina de segurança com biqueira de aço protege contra queda de materiais sobre os pés e esmagamento durante movimentação de pallets. Uso obrigatório.",
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
    description: "Mangote de proteção para braços quando aplicável, especialmente durante operações que exigem alcance dentro do pallet ou movimentação de materiais cortantes.",
    actions: [
      "Avaliar necessidade por operação",
      "Fornecer quando necessário",
      "Exigir em operações de risco",
      "Treinar uso correto",
      "Auditar aplicação"
    ]
  },
  {
    id: "seg_alerta1",
    description: "ALERTA CRÍTICO: Nunca permanecer sob cargas suspensas ou em área onde materiais possam cair. Gravidade e impactos são causas principais de acidentes graves.",
    actions: [
      "Demarcar áreas de risco",
      "Sinalizar proibição de permanência",
      "Treinar sobre zonas de exclusão",
      "Auditar comportamentos inseguros",
      "Aplicar disciplina em desobediência"
    ]
  },
  {
    id: "seg_alerta2",
    description: "ALERTA CRÍTICO: Movimentação de pallets deve ser realizada exclusivamente por operadores habilitados e treinados. Equipamentos (empilhadeiras, paleteiras) exigem certificação.",
    actions: [
      "Certificar operadores de empilhadeira",
      "Treinar operadores de paleteira manual",
      "Exigir credenciamento",
      "Auditar habilitações",
      "Proibir operação não autorizada"
    ]
  },
  {
    id: "seg_alerta3",
    description: "ALERTA CRÍTICO: Pallets instáveis (desbalanceados, com centro de gravidade fora do centro, ou com amarração inadequada) representam risco iminente de tombamento.",
    actions: [
      "Treinar identificação de instabilidade",
      "Exigir reparo antes de movimentar",
      "Verificar estabilidade antes de elevar",
      "Proibir movimentação de pallets instáveis",
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
    description: "Pallet 100% rastreável conforme requisitos IATF 16949. Toda a cadeia de produção é rastreável: desde o lote de alumínio até a entrega ao cliente.",
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
    description: "Status final após aprovação completa da inspeção. Pallet apto para expedição ao cliente. Documentação completa, qualidade confirmada, prazo de entrega garantido.",
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
