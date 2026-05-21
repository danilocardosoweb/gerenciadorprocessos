export interface NodeDetail {
  id: string;
  description: string;
  actions: string[];
  howTo?: {
    order: number;
    instruction: string;
    visualHint?: string;
  }[];
  ifOK?: {
    result: string;
    action: string;
    nextStep?: string;
    alertLevel?: 'success' | 'warning' | 'critical';
  };
  ifNOK?: {
    result: string;
    action: string;
    nextStep?: string;
    alertLevel?: 'success' | 'warning' | 'critical';
  };
  tips?: {
    icon: string;
    message: string;
  }[];
}

export const corteSerrasNodeDetails: NodeDetail[] = [
  // ENTRADAS - MATERIAIS E DOCUMENTAÇÃO
  {
    id: "in_material",
    description: "Recebimento e conferência do material a ser cortado. Verificação da integridade física, identificação correta do perfil/código, estado de conservação (ausência de oxidação, amassados, riscos profundos), e compatibilidade com a Ordem de Produção (OP). Material mal identificado ou danificado pode comprometer toda a produção e segurança do operador.",
    actions: [
      "Conferir código do material com a OP",
      "Verificar integridade física do perfil (oxidação, amassados)",
      "Conferir quantidade informada vs. física",
      "Separar material com defeitos visíveis",
      "Registrar lote e data de recebimento no sistema"
    ],
    howTo: [
      {
        order: 1,
        instruction: "Posicione o perfil na área de leitura com código de barras visível",
        visualHint: "Etiqueta virada para cima, sem dobras"
      },
      {
        order: 2,
        instruction: "Aproxime o leitor do código de barras (5-10cm de distância)",
        visualHint: "Laser vermelho deve cobrir toda a largura do código"
      },
      {
        order: 3,
        instruction: "Acione o gatilho do leitor e aguarde o 'beep' de confirmação",
        visualHint: "Som contínuo = leitura OK | Som intermitente = erro"
      },
      {
        order: 4,
        instruction: "Confera na tela do sistema se o código lido corresponde ao esperado na OP",
        visualHint: "Código exibido em verde = compatível"
      }
    ],
    ifOK: {
      result: "Código de barras lido corretamente e compatível com OP",
      action: "Sistema libera prosseguimento - material identificado",
      nextStep: "Posicione material na zona de corte e prossiga com setup",
      alertLevel: "success"
    },
    ifNOK: {
      result: "Código não lido, ilegível ou INCOMPATÍVEL com OP",
      action: "ISOLAR material imediatamente - não inicie corte",
      nextStep: "Chame o supervisor ou logística para verificar material",
      alertLevel: "critical"
    },
    tips: [
      { icon: "scan", message: "Limpe o código se estiver sujo ou empoeirado" },
      { icon: "alert", message: "Não use material sem código legível" },
      { icon: "lightbulb", message: "Boa iluminação facilita a leitura" }
    ]
  },
  {
    id: "in_op",
    description: "Ordem de Produção (OP) contendo todas as especificações do corte: código do produto, quantidade, comprimentos, tolerâncias dimensionais, ângulos de corte (se aplicável), acabamento superficial requerido, e prioridade de produção. Documento essencial para rastreabilidade e controle de qualidade.",
    actions: [
      "Ler integralmente a OP antes de iniciar",
      "Conferir se há tolerâncias especiais anotadas",
      "Verificar prioridade e prazo de entrega",
      "Anote dúvidas e esclareça com supervisor",
      "Mantenha OP visível durante toda operação"
    ]
  },
  {
    id: "in_desenho",
    description: "Desenho técnico ou especificação do corte, contendo dimensões nominais, tolerâncias (geralmente ±0.5mm para cortes normais, ±0.2mm para cortes precisos), ângulos de corte, quantidade de peças por barra/perfil, e orientação do corte. Documento complementar à OP para garantir precisão.",
    actions: [
      "Analisar desenho técnico completo",
      "Identificar tolerâncias críticas no desenho",
      "Verificar orientação do corte (sentido)",
      "Calcular aproveitamento da barra",
      "Conferir quantidade de peças por barra"
    ]
  },

  // ETAPA 1: PREPARAÇÃO DA SERRA
  {
    id: "e1_lamina",
    description: "Seleção e inspeção da lâmina de serra adequada para o material e tipo de corte. Verificar estado de desgaste, trincas, dentes quebrados ou empenamento. Lâmina desgastada compromete qualidade do corte (rebarbas excessivas, corte torto) e aumenta risco de acidente. Trocar lâmina quando necessário.",
    actions: [
      "Inspecionar visualmente todos os dentes",
      "Verificar trincas na lâmina",
      "Conferir tensão correta da lâmina",
      "Selecionar passo de dente adequado ao material",
      "Registrar número de cortes desde última troca"
    ]
  },
  {
    id: "e1_coolant",
    description: "Verificação do sistema de refrigeração/coolant. Nível adequado de fluido de corte, mistura correta (água + concentrado na proporção recomendada), funcionamento das bombas e bicos de pulverização. Refrigeração deficiente causa sobreaquecimento, deformação do material e desgaste prematuro da lâmina.",
    actions: [
      "Conferir nível do reservatório",
      "Verificar concentração do fluido",
      "Testar funcionamento das bombas",
      "Limpar bicos de pulverização",
      "Verificar vazamentos no sistema"
    ]
  },
  {
    id: "e1_calibracao",
    description: "Calibração e ajuste da máquina antes da produção. Verificar escala do medidor digital (se disponível), calibrar stop de medida, conferir alinhamento da mesa e da lâmina, e ajustar velocidade de avanço conforme espessura e tipo do material. Precisão da máquina é fundamental para tolerâncias.",
    actions: [
      "Calibrar stop de medida com padrão",
      "Verificar escala digital (zero e precisão)",
      "Conferir alinhamento lâmina-mesa",
      "Ajustar velocidade de avanço",
      "Testar funcionamento da pinça/grampo"
    ]
  },
  {
    id: "e1_limp",
    description: "Limpeza completa da área de trabalho e da máquina. Remover resíduos de corte anteriores, aparas de alumínio, excesso de coolant, e garantir que não há obstruções na passagem do material. Ambiente limpo previne contaminação e facilita movimentação segura.",
    actions: [
      "Limpar mesa da serra",
      "Remover aparas acumuladas",
      "Verificar canal de escoamento de cavacos",
      "Limpar área ao redor da máquina",
      "Descartar resíduos nos recipientes corretos"
    ]
  },

  // ETAPA 2: SETUP DO CORTE
  {
    id: "e2_medicao_material",
    description: "Medição inicial do material a ser cortado. Conferir comprimento total da barra/perfil, verificar retilineidade (ausência de curvaturas), e identificar eventuais defeitos de origem que possam afetar o corte. Documentar medidas para cálculo de aproveitamento.",
    actions: [
      "Medir comprimento total com trena",
      "Verificar retilineidade sobre mesa plana",
      "Identificar marcas ou defeitos",
      "Calcular quantidade máxima de peças",
      "Marcar com giz setores com defeitos"
    ]
  },
  {
    id: "e2_setup_stop",
    description: "Configuração do stop de medida ou dispositivo de referência. Ajustar para o comprimento especificado na OP/desenvolvido, considerando a espessura da lâmina (kerf) no cálculo. Stop mal ajustado gera peças fora de especificação e desperdício de material.",
    actions: [
      "Ajustar stop para comprimento desejado",
      "Compensar espessura da lâmina (kerf)",
      "Travar firmemente o stop",
      "Conferir paralelismo stop-lâmina",
      "Marcar posição para conferência"
    ]
  },
  {
    id: "e2_primeira_peca",
    description: "Produção da peça piloto (primeira peça). Corte de uma peça de teste para validação completa do setup. Esta peça deve ser inspecionada 100% antes de liberar produção em série. Se rejeitada, corrigir setup e repetir até aprovação.",
    actions: [
      "Cortar apenas uma peça inicial",
      "Parar máquina após corte piloto",
      "Não prosseguir sem inspeção",
      "Identificar peça como 'TESTE/PILOTO'",
      "Registrar dados do setup na ficha"
    ]
  },

  // ETAPA 3: INSPEÇÃO DA PEÇA PILOTO (CRÍTICO)
  {
    id: "e3_medicao_dimensional",
    description: "Medição dimensional completa da peça piloto usando instrumentos apropriados: paquímetro digital (precisão 0.01mm) ou micrômetro para medidas críticas, trena para comprimentos maiores, esquadro ou ângulo para conferir perpendicularidade. Comparação com especificações da OP. Registrar todas as medidas na ficha de inspeção.",
    actions: [
      "Medir comprimento total com paquímetro",
      "Conferir tolerância (±0.5mm padrão, ±0.2mm precisão)",
      "Verificar perpendicularidade dos cortes",
      "Medir ângulos se aplicável",
      "Registrar todas as medidas na ficha"
    ],
    howTo: [
      {
        order: 1,
        instruction: "Posicione a peça piloto sobre a bancada de medição em superfície plana e limpa",
        visualHint: "Peça apoiada totalmente, sem balanço"
      },
      {
        order: 2,
        instruction: "Meça o comprimento total em 3 pontos diferentes (extremidades e centro)",
        visualHint: "Paquímetro perpendicular à face de corte"
      },
      {
        order: 3,
        instruction: "Verifique a perpendicularidade usando esquadro ou medindo diagonais",
        visualHint: "Esquadro encostado nas faces cortadas - sem folga"
      },
      {
        order: 4,
        instruction: "Compare cada medição com a especificação da OP considerando a tolerância",
        visualHint: "Ex: Comprimento 100mm → aceita 99.5 a 100.5mm"
      }
    ],
    ifOK: {
      result: "Todas as medidas dentro da tolerância especificada",
      action: "Peça piloto APROVADA para liberação",
      nextStep: "Prossiga para inspeção visual e aprovação final",
      alertLevel: "success"
    },
    ifNOK: {
      result: "Uma ou mais dimensões FORA da tolerância",
      action: "NÃO PROSSIGA! Ajuste o stop de medida e refaça peça piloto",
      nextStep: "Chame o supervisor se não conseguir ajustar em 3 tentativas",
      alertLevel: "critical"
    },
    tips: [
      { icon: "scan", message: "Limpe o paquímetro antes de medir" },
      { icon: "lightbulb", message: "Temperatura ambiente afeta medição" }
    ]
  },
  {
    id: "e3_inspe Visual",
    description: "Inspeção visual minuciosa da peça piloto. Verificar ausência de rebarbas excessivas, riscos profundos, amassados, queimaduras por atrito (indicativo de lâmina cega ou avanço rápido), rugosidade superficial, e integridade geral. Olho do operador é primeira linha de qualidade.",
    actions: [
      "Examinar todas as faces cortadas",
      "Verificar rebarbas em bordas",
      "Procurar marcas de queimadura/atrito",
      "Conferir acabamento superficial",
      "Iluminar bem a peça para inspeção"
    ]
  },
  {
    id: "e3_tolerancias",
    description: "Análise crítica das tolerâncias. Conferir se todas as dimensões medidas estão dentro da faixa especificada. Para cortes normais: ±0.5mm. Para cortes precisos ou usinagem posterior: ±0.2mm ou menos. Se qualquer dimensão estiver fora, o setup deve ser corrigido antes da produção.",
    actions: [
      "Comparar medições com especificação",
      "Identificar se há tendência de erro",
      "Calcular desvio padrão se múltiplas peças",
      "Conferir tolerâncias de ângulo",
      "Decidir: aprovar, ajustar ou refazer setup"
    ]
  },
  {
    id: "e3_aprovacao",
    description: "Decisão de aprovação ou rejeição da peça piloto e liberação para produção. Se aprovada: iniciar série, realizar primeira peça ok. Se rejeitada: analisar causa raiz, ajustar setup (stop, avanço, lâmina), cortar nova peça piloto e reiniciar inspeção. Autoridade do operador ou supervisor para aprovar.",
    actions: [
      "Preencher ficha de primeira peça",
      "Obter assinatura de aprovação",
      "Arquivar amostra aprovada se necessário",
      "Liberar máquina para produção",
      "Informar próximo operador do resultado"
    ]
  },

  // ETAPA 4: PRODUÇÃO EM SÉRIE
  {
    id: "e4_corte_continuo",
    description: "Execução dos cortes em série mantendo os parâmetros validados na peça piloto. Alimentar material firmemente contra o stop, acionar a serra com movimento controlado, aplicar pressão moderada e constante, e aguardar corte completo antes de recuar. Repetir ciclo de forma padronizada.",
    actions: [
      "Posicionar material contra o stop",
      "Fixar com grampo/prensa quando necessário",
      "Acionar serra com movimento suave",
      "Aplicar pressão constante no avanço",
      "Aguardar corte completo antes de recuar"
    ]
  },
  {
    id: "e4_monitoramento",
    description: "Monitoramento contínuo durante a produção. Observar qualidade do corte a cada peça ou em amostras frequentes (recomendado: a cada 10 peças ou 30 minutos). Verificar sinais de desgaste da lâmina (rebarbas aumentando, corte torto), temperatura do material, e funcionamento do coolant. Interromper imediatamente se detectar anomalia.",
    actions: [
      "Inspecionar visualmente cada peça ou amostra",
      "Sentir temperatura do material (deve estar morna)",
      "Observar formato das aparas (indicativo de desgaste)",
      "Verificar nível de coolant periodicamente",
      "Parar se notar variação na qualidade"
    ]
  },
  {
    id: "e4_lubrificacao",
    description: "Manutenção da lubrificação durante o corte. Garantir que o fluido de corte está sendo aplicado corretamente sobre a lâmina e a zona de corte. Lubrificação insuficiente causa aquecimento, solda do alumínio na lâmina (gumming), e acabamento ruim. Verificar fluxo e limpar bicos se necessário.",
    actions: [
      "Verificar fluxo de coolant constante",
      "Observar se há nebulização adequada",
      "Limpar bicos se entupidos",
      "Completar reservatório quando necessário",
      "Nunca operar sem lubrificação"
    ]
  },

  // ETAPA 5: INSPEÇÃO DURANTE PRODUÇÃO (AMOSTRAGEM)
  {
    id: "e5_amostragem_dimensao",
    description: "Inspeção dimensional por amostragem durante a produção em série. Recomendável medir 1 peça a cada 10 cortes ou a cada 30 minutos, alternando posições de medição. Uso de paquímetro ou gabarito de contorno rápido. Detecta desvios do setup antes de gerar grande quantidade de refugo.",
    actions: [
      "Selecionar peça de amostra aleatória",
      "Medir comprimento com paquímetro",
      "Conferir se está dentro da tolerância",
      "Registrar resultado na ficha de produção",
      "Ajustar stop imediatamente se necessário"
    ]
  },
  {
    id: "e5_amostragem_visual",
    description: "Inspeção visual 100% ou por amostragem das peças cortadas. Verificar rebarbas, qualidade do corte, marcas de identificação corretas, e ausência de defeitos. Peças com defeitos visíveis devem ser separadas imediatamente para retrabalho ou descarte. Nunca deixar peças ruins fluir para próxima etapa.",
    actions: [
      "Examinar cada peça ao retirar da máquina",
      "Verificar rebarbas nas bordas cortadas",
      "Conferir identificação (etiqueta/gravação)",
      "Separar peças com defeitos visíveis",
      "Contar e registrar peças aprovadas vs. refugadas"
    ]
  },
  {
    id: "e5_conferencia_op",
    description: "Conferência contínua com a Ordem de Produção. A cada peça ou lote, verificar se código, quantidade, e especificações conferem. Erro de interpretação da OP é causa comum de retrabalho. Manter documento atualizado com produção realizada.",
    actions: [
      "Conferir código na OP a cada trocar de material",
      "Marcar peças produzidas na OP",
      "Verificar se quantidade atingiu o solicitado",
      "Anotar desvios ou ocorrências",
      "Sinalizar supervisor em caso de dúvidas"
    ]
  },

  // ETAPA 6: ACABAMENTO E IDENTIFICAÇÃO
  {
    id: "e6_desbarbar",
    description: "Remoção de rebarbas (desbaste) das peças cortadas. Utilizar ferramenta apropriada: lima, escareador, lixadeira manual, ou esmerilhadeira (com cuidado). Rebarbas são perigosas (corte no manuseio), comprometem montagem, e impedem medição precisa. Acabamento deve ser uniforme e não remover material funcional.",
    actions: [
      "Identificar todas as bordas cortadas",
      "Usar escareador ou lima para desbaste",
      "Remover rebarba sem danificar superfície",
      "Sentir borda para conferir lisura",
      "Descartar aparas de desbaste corretamente"
    ]
  },
  {
    id: "e6_limpeza_pecas",
    description: "Limpeza das peças cortadas para remoção de coolant, óleo, e aparas. Peças devem estar secas e limpas antes de inspeção final e embalagem. Resíduos de coolant podem manchar ou causar corrosão. Limpeza também facilita identificação de defeitos.",
    actions: [
      "Limpar coolant com pano ou sopro",
      "Remover aparas aderidas",
      "Secar peças se necessário",
      "Verificar se há marcação de corte visível",
      "Organizar peças em local limpo"
    ]
  },
  {
    id: "e6_identificacao",
    description: "Identificação e rastreabilidade das peças cortadas. Etiquetar com código do produto, lote do material, data, operador, e máquina utilizada. Para peças de diferentes comprimentos ou perfis, separar fisicamente e etiquetar adequadamente. Rastreabilidade é requisito de normas de qualidade.",
    actions: [
      "Separar peças por código e comprimento",
      "Etiquetar com código completo",
      "Registrar lote do material",
      "Identificar operador e data",
      "Separar fisicamente lotes diferentes"
    ]
  },
  {
    id: "e6_organizacao",
    description: "Organização e armazenamento temporário das peças aprovadas. Empilhar de forma segura (sem risco de queda), proteger contra danos (amassados, riscos), e manter separação entre lotes diferentes. Organização facilita contagem e próximas etapas do processo.",
    actions: [
      "Empilhar de forma estável e segura",
      "Usar separadores entre camadas se necessário",
      "Proteger cantos e bordas vulneráveis",
      "Manter etiquetas visíveis",
      "Limpar área de armazenamento temporário"
    ]
  },

  // ETAPA 7: INSPEÇÃO FINAL E LIBERAÇÃO
  {
    id: "e7_inspe Final",
    description: "Inspeção final 100% ou amostral das peças cortadas. Checagem dimensional completa, visual, e de quantidade. Para lotes grandes, inspeção amostral estatisticamente significativa (AQL). Peças devem estar dentro de especificações antes de liberação para próxima etapa ou expedição.",
    actions: [
      "Medir amostra estatisticamente válida",
      "Inspeção visual de 100% ou amostral",
      "Conferir quantidade vs. OP",
      "Verificar identificação e rastreabilidade",
      "Aprovar ou rejeitar lote completo"
    ]
  },
  {
    id: "e7_ficha_inspecao",
    description: "Preenchimento da ficha de inspeção e controle de qualidade. Documentar resultados de medições, quantidade produzida, quantidade refugada, causa dos refugos, e decisão de aprovação. Documentação é essencial para histórico de qualidade e auditorias.",
    actions: [
      "Preencher todos os campos da ficha",
      "Registrar medições dimensionais",
      "Anotar quantidade aprovada e refugada",
      "Identificar causas de rejeição",
      "Assinar e datar documento"
    ]
  },
  {
    id: "e7_liberacao",
    description: "Liberação formal das peças para próxima etapa (usinagem, montagem, tratamento superficial) ou expedição. Com assinatura do operador e/ou inspetor de qualidade. Peças não liberadas devem ser mantidas em área de quarentena com identificação clara.",
    actions: [
      "Assinar liberação na ficha",
      "Mover peças para área de produto acabado",
      "Atualizar status no sistema",
      "Informar próximo setor da disponibilidade",
      "Arquivar documentação de qualidade"
    ]
  },

  // SEGURANÇA
  {
    id: "seg_epi",
    description: "Uso obrigatório de Equipamentos de Proteção Individual (EPIs) durante toda a operação. Óculos de proteção contra cavacos e coolant, luvas resistentes a corte (para manuseio, não durante corte próximo à lâmina), protetor auricular em áreas ruidosas, e fechamento de mangas. Segurança do operador é prioridade absoluta.",
    actions: [
      "Colocar óculos de segurança antes de ligar máquina",
      "Usar luvas adequadas para manuseio",
      "Verificar calçado fechado antiderrapante",
      "Usar protetor auricular se ruído >85dB",
      "Nunca remover EPI durante operação"
    ]
  },
  {
    id: "seg_protecao",
    description: "Proteções da máquina em funcionamento. Guardas de proteção da lâmina devem estar instaladas e funcionando. Dispositivos de parada de emergência acessíveis. Área de corte isolada. Nunca operar com proteções removidas ou desativadas. Equipamento de segurança não é opcional.",
    actions: [
      "Verificar guarda da lâmina instalada",
      "Testar botão de emergência",
      "Conferir funcionamento do freio",
      "Isolar área de risco com marcação",
      "Nunca remover dispositivos de segurança"
    ]
  },
  {
    id: "seg_manuseio",
    description: "Manuseio seguro de materiais longos e pesados. Uso de equipamentos auxiliares (carrinho, mesa de rolos, ponte rolante) para materiais acima de 15kg ou comprimento >2m. Posição ergonômica do operador. Prevenir quedas de material e lesões por esforço.",
    actions: [
      "Avaliar peso/comprimento antes de levantar",
      "Usar equipamentos auxiliares quando necessário",
      "Manter postura ergonômica",
      "Pedir ajuda para materiais pesados",
      "Verificar estabilidade ao posicionar material"
    ]
  },

  // CONTROLE DE QUALIDADE / IATF
  {
    id: "iatf_rastreabilidade",
    description: "Rastreabilidade completa do processo conforme IATF 16949. Registro de material (lote fornecedor), máquina utilizada, operador, data/hora, medições, e liberação. Possibilitar rastreamento de qualquer peça até sua origem. Essencial para recalls e análise de problemas.",
    actions: [
      "Registrar lote do material no sistema",
      "Identificar máquina e operador",
      "Marcar data e hora de produção",
      "Anexar resultados de inspeção",
      "Manter histórico por lote ou série"
    ]
  },
  {
    id: "iatf_controle_processo",
    description: "Controle estatístico do processo (SPC). Monitoramento de capacidade do processo (Cp, Cpk), análise de tendências nas medições, e ação corretiva quando indicadores saem da faixa de controle. Previne produção de não-conformidades em série.",
    actions: [
      "Calcular Cp e Cpk quando aplicável",
      "Plotar gráficos de controle X-barra e R",
      "Identificar tendências de desvio",
      "Agir quando fora dos limites de controle",
      "Documentar ações corretivas tomadas"
    ]
  },
  {
    id: "iatf_instrucao",
    description: "Instrução de trabalho atualizada e disponível. Operador deve ter acesso às instruções atualizadas, desenhos, e especificações. Qualquer dúvida deve ser esclarecida antes da produção. Instruções desatualizadas são causa de não-conformidade.",
    actions: [
      "Verificar se há instrução atualizada",
      "Consultar supervisor em caso de dúvida",
      "Seguir instrução passo a passo",
      "Sugerir melhorias se houver necessidade",
      "Reportar discrepâncias na instrução"
    ]
  },

  // INDICADORES (KPIs)
  {
    id: "kpi_cpk",
    description: "Índice de capacidade do processo (Cpk). Mede a habilidade do processo de produzir dentro das especificações. Cpk > 1.33 considerado capaz, Cpk > 1.67 excelente. Cálculo baseado nas medições dimensionais coletadas. Indicador primário da qualidade do processo de corte.",
    actions: [
      "Coletar medições para cálculo",
      "Calcular desvio padrão do processo",
      "Determinar Cpk mensalmente",
      "Meta: Cpk ≥ 1.33 para todos os cortes",
      "Investigar se Cpk < 1.33"
    ]
  },
  {
    id: "kpi_scrap",
    description: "Taxa de refugo (scrap rate). Percentual de peças rejeitadas vs. total produzido. Meta típica: < 2% para corte de alumínio. Refugos por dimensão fora, defeitos de corte, ou danos no manuseio. Redução do scrap aumenta produtividade e reduz custos.",
    actions: [
      "Contar peças refugadas por turno",
      "Calcular % refugo = (refugo/total) × 100",
      "Classificar refugos por causa",
      "Meta: Scrap < 2%",
      "Implementar ações de redução"
    ]
  },
  {
    id: "kpi_produtividade",
    description: "Produtividade do processo de corte. Peças cortadas por hora ou hora por peça, considerando setup, produção, e paradas. Base para programação de produção e avaliação de eficiência. Setup bem feito aumenta produtividade.",
    actions: [
      "Cronometrar tempo de setup",
      "Medir tempo de ciclo de corte",
      "Calcular peças/hora real",
      "Comparar com padrão estabelecido",
      "Buscar redução de tempos mortos"
    ]
  },
  {
    id: "kpi_medicao",
    description: "Conformidade dimensional. Percentual de peças dentro da tolerância especificada. Medido através de inspeção em amostras ou 100%. Indicador direto da qualidade do corte e precisão do setup.",
    actions: [
      "Inspecionar amostra estatística",
      "Contar peças dentro/fora tolerância",
      "Calcular % conforme = (ok/total) × 100",
      "Meta: 100% dentro da tolerância",
      "Corrigir processo se meta não atingida"
    ],
    howTo: [
      {
        order: 1,
        instruction: "Separe uma amostra de 10 peças do lote produzido (ou 100% se volume pequeno)",
        visualHint: "Peças representativas de todo o período de produção"
      },
      {
        order: 2,
        instruction: "Meça cada peça na dimensão crítica usando paquímetro calibrado",
        visualHint: "Mesmo ponto de medição em todas as peças"
      },
      {
        order: 3,
        instruction: "Compare com tolerância: ±0.5mm padrão ou ±0.2mm precisão",
        visualHint: "Marque ✓ para dentro, ✗ para fora da tolerância"
      },
      {
        order: 4,
        instruction: "Calcule: (peças OK ÷ total) × 100 = % conformidade",
        visualHint: "Ex: 9 OK de 10 = 90% conformidade"
      }
    ],
    ifOK: {
      result: "Conformidade ≥ 98% (meta atingida)",
      action: "Produção APROVADA - mantenha os mesmos parâmetros",
      nextStep: "Documente o resultado e prossiga para próxima etapa",
      alertLevel: "success"
    },
    ifNOK: {
      result: "Conformidade < 98% ou peças fora da tolerância",
      action: "PARE a produção e isole o lote imediatamente",
      nextStep: "Chame o supervisor e revise o setup da máquina",
      alertLevel: "critical"
    },
    tips: [
      { icon: "scan", message: "Amostra deve ser aleatória, não selecionada" },
      { icon: "alert", message: "1 peça fora = investigar causa imediata" },
      { icon: "lightbulb", message: "Temperatura ambiente afeta medição em ±0.1mm" }
    ]
  },

  // SAÍDAS
  {
    id: "out_pecas_cortadas",
    description: "Peças cortadas conforme especificação, inspecionadas, desbarbadas, limpas, identificadas, e liberadas. Qualidade confirmada através de medições e inspeção visual. Prontas para próxima etapa do processo ou expedição.",
    actions: [
      "Verificar se todas estão no padrão",
      "Conferir identificação completa",
      "Contar quantidade final",
      "Separar em local adequado",
      "Aguardar liberação de qualidade"
    ]
  },
  {
    id: "out_documentacao",
    description: "Documentação de qualidade completa: ficha de inspeção preenchida, registros de medições, identificação de lote, e liberação formal. Documentação comprova conformidade e possibilita rastreabilidade conforme requisitos de qualidade.",
    actions: [
      "Ficha de inspeção assinada",
      "Registros de medições anexados",
      "Identificação de lote registrada",
      "Documento de liberação preenchido",
      "Arquivar na pasta do lote"
    ]
  },
  {
    id: "out_rebarbas",
    description: "Aparas de corte e rebarbas coletadas para reciclagem. Separação correta por tipo de material (alumínio, aço, etc.). Descarte adequado conforme normas ambientais e procedimentos da empresa. Nunca misturar materiais diferentes.",
    actions: [
      "Coletar todas as aparas no recipiente",
      "Separar por tipo de material",
      "Verificar se há contaminação",
      "Pesar e registrar para reciclagem",
      "Descartar conforme norma ambiental"
    ]
  },
  {
    id: "out_maquina",
    description: "Máquina liberada e em condições para próximo uso. Limpeza realizada, lâmina em estado adequado (ou trocada se necessário), coolant no nível, e área organizada. Registro de manutenção ou parada se aplicável.",
    actions: [
      "Limpar máquina após uso",
      "Conferir estado da lâmina",
      "Completar coolant se necessário",
      "Registrar número de peças cortadas",
      "Sinalizar se há necessidade de manutenção"
    ]
  }
];

export default corteSerrasNodeDetails;
