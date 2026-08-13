import { NodeDetails } from '../components/NodeModal';

const task = (id: string, text: string): NodeDetails['tasks'][number] => ({
  id,
  text,
  completed: false,
});

export const usinagemExpFomNodeDetails: Record<string, NodeDetails> = {
  root: {
    description: `Padronizar a usinagem de perfis EXP em barras de 5 metros utilizando centro de usinagem CNC FOM Industrie para execução de furos, drenos e usinagens crticas com alta precisão dimensional e rastreabilidade total. Requisitos técnicos: Usinagem CNC automatizada, Controle dimensional rigoroso, Execuo de furos e drenos críticos, Fixao pneumtica estável, Controle de vibrao e temperatura, Validao contínua do setup. Requisitos de segurança: Uso obrigatório de EPI, Bloqueio durante setup, Não acessar área de movimento CNC, Parada imediata em ruído anormal. Desvios podem causar infiltração, falha de montagem, retrabalho, sucata e reclamações de cliente automotivo/exportação. Garante repetibilidade dimensional, alinhamento de furos e conformidade funcional dos drenos. Operao contínua. Responsvel: Produo, Qualidade e Engenharia de Processo.`,
    images: [],
    tasks: [
      task('root-1', 'Monitorar processo CNC'),
      task('root-2', 'Registrar produção'),
    ],
  },
  inputs: {
    description: `Garantir que materiais, programas e desenhos estejam corretos antes da usinagem. Requisitos técnicos: Perfil correto, Desenho validado, Programa CNC atualizado, Plano de controle aprovado. Erro de usinagem e perda de rastreabilidade. Evita produção NOK.`,
    images: [],
    tasks: [
      task('inputs-1', 'Conferir documentação'),
      task('inputs-2', 'Validar materiais'),
    ],
  },
  in_perfil: {
    description: `Garantir perfil correto para usinagem. Requisitos técnicos: Sem empenamento, Sem avarias, Etiqueta legível, Liga correta. Erro dimensional e montagem incorreta. Estabilidade da usinagem.`,
    images: [],
    tasks: [
      task('in-perfil-1', 'Validar perfil'),
      task('in-perfil-2', 'Conferir etiqueta'),
    ],
  },
  in_cnc: {
    description: `Garantir programa correto para furos e drenos. Requisitos técnicos: Offsets atualizados, Ferramentas corretas, Sequncia validada. Furos deslocados e drenos incorretos. Preciso do processo.`,
    images: [],
    tasks: [
      task('in-cnc-1', 'Validar CNC'),
      task('in-cnc-2', 'Verificar offsets'),
    ],
  },
  resources: {
    description: `Disponibilizar equipamentos e instrumentos adequados para usinagem crítica. Variao dimensional e falha funcional. Maior estabilidade operacional.`,
    images: [],
    tasks: [
      task('resources-1', 'Liberar máquina'),
      task('resources-2', 'Validar instrumentos'),
    ],
  },
  res_fom: {
    description: `Executar furos, drenos e usinagens automticas com alta repetibilidade. Requisitos técnicos: Fixao pneumtica, Controle multi-eixos, Lubrificao automtica, Ferramentas calibradas. Desalinhamento e falhas funcionais. Preciso repetitiva do processo.`,
    images: [],
    tasks: [
      task('res-fom-1', 'Inspecionar máquina'),
      task('res-fom-2', 'Verificar fixação'),
    ],
  },
  res_tool: {
    description: `Garantir integridade das ferramentas CNC. Requisitos técnicos: Brocas ntegras, Fresas afiadas, Sem desgaste excessivo. Rebarba e desvio dimensional. Acabamento e precisão.`,
    images: [],
    tasks: [
      task('res-tool-1', 'Validar desgaste'),
      task('res-tool-2', 'Verificar ferramentas'),
    ],
  },
  res_metrology: {
    description: `Garantir medições confiveis. Requisitos técnicos: Paqumetro calibrado, Gabaritos aprovados, Etiqueta vlida. Liberao incorreta. Controle dimensional robusto.`,
    images: [],
    tasks: [
      task('res-metrology-1', 'Validar calibração'),
      task('res-metrology-2', 'Verificar gabaritos'),
    ],
  },
  people: {
    description: `Definir responsabilidades crticas da usinagem. Falha operacional. Padronizao da operação.`,
    images: [],
    tasks: [
      task('people-1', 'Registrar operador'),
      task('people-2', 'Validar treinamento'),
    ],
  },
  pe_operador: {
    description: `Executar usinagem conforme plano de controle. Requisitos técnicos: Treinamento FOM, Leitura de desenho, Conhecimento de tolerncias. Erro operacional. Estabilidade do processo.`,
    images: [],
    tasks: [
      task('pe-operador-1', 'Validar treinamento'),
      task('pe-operador-2', 'Executar conforme POP'),
    ],
  },
  methods: {
    description: `Padronizar execução da usinagem crítica. Falhas funcionais. Preciso e repetibilidade.`,
    images: [],
    tasks: [
      task('methods-1', 'Auditar operação'),
      task('methods-2', 'Validar procedimentos'),
    ],
  },
  met_setup: {
    description: `Garantir estabilidade dimensional antes da produção. Requisitos técnicos: Fixao correta, Validar offsets, Testar ferramentas, Executar peça piloto. Furos deslocados e medidas incorretas. Controle inicial do processo.`,
    images: [],
    tasks: [
      task('met-setup-1', 'Liberar setup'),
      task('met-setup-2', 'Executar peça piloto'),
    ],
  },
  met_drain: {
    description: `Executar usinagens críticas conforme desenho EXP. Requisitos técnicos: Posicionamento exato, Profundidade correta, Sem rebarba, Controle de alinhamento. Falha de drenagem e montagem. Conformidade funcional.`,
    images: [],
    tasks: [
      task('met-drain-1', 'Validar drenos'),
      task('met-drain-2', 'Registrar produção'),
    ],
  },
  met_100: {
    description: `Garantir conformidade total das cotas crticas. Requisitos técnicos: Medir todos os furos, Validar posição dos drenos, Registrar medidas. Pea NOK enviada ao cliente. Garantia dimensional total.`,
    images: [],
    tasks: [
      task('met-100-1', 'Registrar medições'),
      task('met-100-2', 'Anexar fotos'),
    ],
  },
  met_nok: {
    description: `Bloquear imediatamente peças fora de especificação. Requisitos técnicos: Segregar lote, Identificar NOK, Abrir ocorrncia. Mistura de peças conformes e NOK. Proteo do cliente.`,
    images: [],
    tasks: [
      task('met-nok-1', 'Abrir NCR'),
      task('met-nok-2', 'Segregar lote'),
    ],
  },
  outputs: {
    description: `Garantir liberação apenas de peças conformes. Cliente receber peça NOK. Confiabilidade total do processo.`,
    images: [],
    tasks: [
      task('outputs-1', 'Liberar lote'),
      task('outputs-2', 'Validar conformidade'),
    ],
  },
  out_ok: {
    description: `Disponibilizar peças conformes para montagem. Garantia funcional e dimensional.`,
    images: [],
    tasks: [
      task('out-ok-1', 'Liberar produção'),
      task('out-ok-2', 'Identificar lote'),
    ],
  },
  kpis: {
    description: `Monitorar estabilidade e performance da usinagem. Melhoria contínua.`,
    images: [],
    tasks: [
      task('kpis-1', 'Atualizar dashboard'),
      task('kpis-2', 'Analisar indicadores'),
    ],
  },
  kpi_cp: {
    description: `Avaliar estabilidade dimensional do processo. Controle estatístico robusto.`,
    images: [],
    tasks: [
      task('kpi-cp-1', 'Atualizar CEP'),
      task('kpi-cp-2', 'Calcular Cp/Cpk'),
    ],
  },
  kpi_rebarba: {
    description: `Monitorar acabamento da usinagem. Melhor acabamento funcional.`,
    images: [],
    tasks: [
      task('kpi-rebarba-1', 'Registrar defeitos'),
      task('kpi-rebarba-2', 'Analisar causas'),
    ],
  },
  kpi_nok: {
    description: `Monitorar falhas crticas. Reduo de reclamações.`,
    images: [],
    tasks: [
      task('kpi-nok-1', 'Analisar ocorrências'),
      task('kpi-nok-2', 'Implementar melhorias'),
    ],
  },
};

export default usinagemExpFomNodeDetails;
