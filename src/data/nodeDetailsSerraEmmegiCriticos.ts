import { NodeDetails } from '../components/NodeModal';

const task = (id: string, text: string): NodeDetails['tasks'][number] => ({
  id,
  text,
  completed: false,
});

export const serraEmmegiCriticosNodeDetails: Record<string, NodeDetails> = {
  root: {
    description: `Padronizar o processo de corte de itens críticos garantindo tolerncias rigorosas, inspeção 100% dimensional e rastreabilidade total conforme requisitos automotivos e IATF. Requisitos técnicos: Inspeo dimensional 100%, Controle rigoroso de tolerância, Validao frequente de setup, Monitoramento contnuo do disco, Controle de estabilidade trmica. Requisitos de segurança: Uso obrigatório de EPIs, Não acessar área de corte durante ciclo, Parada imediata em vibrao anormal. Falhas podem gerar não conformidade crítica, montagem incorreta no cliente, sucata e reclamações automotivas. Garante repetibilidade dimensional e conformidade de itens especiais. Operao contínua. Responsvel: Produo, Qualidade e Processo.`,
    images: [],
    tasks: [
      task('root-1', 'Monitorar produção crítica'),
      task('root-2', 'Validar conformidade IATF'),
    ],
  },
  inputs: {
    description: `Garantir que todos os dados e materiais estejam corretos antes do corte. Requisitos técnicos: Desenho atualizado, Plano de controle, Perfil correto, Programa CNC validado. Erro de processo e peças fora de especificação. Assegura estabilidade dimensional.`,
    images: [],
    tasks: [
      task('inputs-1', 'Conferir documentação'),
      task('inputs-2', 'Validar materiais'),
    ],
  },
  in_desenho: {
    description: `Garantir leitura correta das tolerncias especiais. Requisitos técnicos: Validar revisão, Conferir cotas crticas, Validar tolerncias. Produo incorreta. Evita desvios dimensionais.`,
    images: [],
    tasks: [
      task('in-desenho-1', 'Validar revisão'),
      task('in-desenho-2', 'Conferir cotas críticas'),
    ],
  },
  in_programa: {
    description: `Garantir programa correto para itens críticos. Requisitos técnicos: Sequência validada, Medidas corretas, Offset atualizado. Corte incorreto. Mantém repetibilidade.`,
    images: [],
    tasks: [
      task('in-programa-1', 'Validar programa'),
      task('in-programa-2', 'Verificar offsets'),
    ],
  },
  resources: {
    description: `Disponibilizar recursos adequados para precisão dimensional. Desvio dimensional e instabilidade do processo. Controle dimensional robusto.`,
    images: [],
    tasks: [
      task('resources-1', 'Validar recursos'),
      task('resources-2', 'Verificar calibração'),
    ],
  },
  res_serra: {
    description: `Executar cortes de alta precisão. Requisitos técnicos: Disco calibrado, Sem vibrao, Lubrificao correta. Variao dimensional. Preciso do corte.`,
    images: [],
    tasks: [
      task('res-serra-1', 'Inspecionar máquina'),
      task('res-serra-2', 'Verificar disco'),
    ],
  },
  res_medicao: {
    description: `Garantir medições precisas. Requisitos técnicos: Paqumetro calibrado, Trena validada, Etiqueta de calibração vlida. Medio incorreta. Controle dimensional confivel.`,
    images: [],
    tasks: [
      task('res-medicao-1', 'Validar calibração'),
      task('res-medicao-2', 'Verificar instrumentos'),
    ],
  },
  people: {
    description: `Definir responsabilidades crticas do processo. Falha operacional. Padronizao do processo.`,
    images: [],
    tasks: [
      task('people-1', 'Registrar operador'),
      task('people-2', 'Validar treinamento'),
    ],
  },
  pe_operador: {
    description: `Executar processo conforme plano de controle. Requisitos técnicos: Treinamento validado, Conhecimento de tolerncias. Erro operacional. Maior estabilidade dimensional.`,
    images: [],
    tasks: [
      task('pe-operador-1', 'Validar treinamento'),
      task('pe-operador-2', 'Executar conforme POP'),
    ],
  },
  methods: {
    description: `Garantir execução padronizada do processo crítico. Desvios dimensionais. Repetibilidade do processo.`,
    images: [],
    tasks: [
      task('methods-1', 'Auditar operação'),
      task('methods-2', 'Validar procedimentos'),
    ],
  },
  met_setup: {
    description: `Garantir estabilidade dimensional antes da produção. Requisitos técnicos: Validar batente, Validar offset, Executar corte piloto, Inspecionar primeira peça. Produo fora de tolerância. Controle inicial do processo.`,
    images: [],
    tasks: [
      task('met-setup-1', 'Aprovar primeira peça'),
      task('met-setup-2', 'Validar setup'),
    ],
  },
  met_inspecao: {
    description: `Garantir conformidade total das medidas crticas. Requisitos técnicos: Medir todas as peças, Registrar medidas, Validar tolerncias crticas. Envio de peça NOK ao cliente. Garantia total dimensional. Frequncia: Todas as peças.`,
    images: [],
    tasks: [
      task('met-inspecao-1', 'Registrar medições'),
      task('met-inspecao-2', 'Anexar evidência'),
    ],
  },
  met_corte: {
    description: `Manter estabilidade durante toda produção. Requisitos técnicos: Monitorar aquecimento, Monitorar vibrao, Validar medidas periodicamente. Variao dimensional. Controle estatístico do processo.`,
    images: [],
    tasks: [
      task('met-corte-1', 'Registrar produção'),
      task('met-corte-2', 'Monitorar processo'),
    ],
  },
  met_nok: {
    description: `Bloquear imediatamente peças fora de especificação. Requisitos técnicos: Segregar material, Identificar NOK, Acionar qualidade. Mistura de lotes conformes e NOK. Proteo do cliente.`,
    images: [],
    tasks: [
      task('met-nok-1', 'Abrir ocorrência'),
      task('met-nok-2', 'Segregar material'),
    ],
  },
  outputs: {
    description: `Garantir liberação apenas de peças conformes. Cliente receber peça NOK. Confiabilidade do processo.`,
    images: [],
    tasks: [
      task('outputs-1', 'Liberar lote'),
      task('outputs-2', 'Validar conformidade'),
    ],
  },
  out_ok: {
    description: `Disponibilizar peças conformes para próxima etapa. Garantia dimensional total.`,
    images: [],
    tasks: [
      task('out-ok-1', 'Liberar peças'),
      task('out-ok-2', 'Identificar lote'),
    ],
  },
  out_nok: {
    description: `Segregar peças fora de tolerância. Mistura de material. Proteo do cliente.`,
    images: [],
    tasks: [
      task('out-nok-1', 'Segregar material'),
      task('out-nok-2', 'Identificar NOK'),
    ],
  },
  kpis: {
    description: `Monitorar estabilidade dimensional e performance do processo. Melhoria contínua.`,
    images: [],
    tasks: [
      task('kpis-1', 'Atualizar dashboard'),
      task('kpis-2', 'Analisar tendências'),
    ],
  },
  kpi_ppm: {
    description: `Monitorar peças NOK. Reduo de falhas.`,
    images: [],
    tasks: [
      task('kpi-ppm-1', 'Analisar falhas'),
      task('kpi-ppm-2', 'Calcular PPM'),
    ],
  },
  kpi_cp: {
    description: `Avaliar estabilidade do processo. Controle estatístico.`,
    images: [],
    tasks: [
      task('kpi-cp-1', 'Atualizar CEP'),
      task('kpi-cp-2', 'Calcular Cp/Cpk'),
    ],
  },
  kpi_refugo: {
    description: `Monitorar perdas do processo. Reduo de desperdcios.`,
    images: [],
    tasks: [
      task('kpi-refugo-1', 'Registrar sucata'),
      task('kpi-refugo-2', 'Analisar causas'),
    ],
  },
};

export default serraEmmegiCriticosNodeDetails;
