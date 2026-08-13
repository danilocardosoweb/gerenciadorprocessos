import { NodeDetails } from '../components/NodeModal';

const task = (id: string, text: string): NodeDetails['tasks'][number] => ({
  id,
  text,
  completed: false,
});

export const paletesExportacaoNodeDetails: Record<string, NodeDetails> = {
  root: {
    description: `Padronizar a montagem de paletes destinados  exportação garantindo segurança, integridade do produto e conformidade logística internacional. Montagem incorreta pode causar avarias, tombamento, rejeição logística e perdas financeiras. Garantia de estabilidade, rastreabilidade e conformidade para transporte nacional e internacional. Processo contnuo. Responsvel: Produo, Expedio e Qualidade.`,
    images: [],
    tasks: [
      task('root-1', 'Liberar palete para expedição'),
      task('root-2', 'Revisar procedimento de exportação periodicamente'),
    ],
  },
  inputs: {
    description: `Garantir disponibilidade correta de materiais e documentos para montagem. Requisitos técnicos: Paletes homologados, Perfis identificados, Etiqueta exportação, Ordem de produção. Erro de identificação e montagem incorreta. Assegura rastreabilidade do lote.`,
    images: [],
    tasks: [
      task('inputs-1', 'Conferir materiais'),
      task('inputs-2', 'Validar documentação'),
    ],
  },
  in_palete: {
    description: `Utilizar paletes tratados conforme norma ISPM-15. Requisitos técnicos: Carimbo HT visvel, Estrutura ntegra, Sem rachaduras. Rejeio alfandegria. Garantia logística internacional.`,
    images: [],
    tasks: [
      task('in-palete-1', 'Validar carimbo HT'),
      task('in-palete-2', 'Inspecionar estrutura do palete'),
    ],
  },
  in_perfis: {
    description: `Garantir identificação e integridade dos perfis. Requisitos técnicos: Etiqueta legível, Quantidade correta, Sem danos superficiais. Mistura de lotes. Evita reclamações do cliente.`,
    images: [],
    tasks: [
      task('in-perfis-1', 'Conferir lote'),
      task('in-perfis-2', 'Validar integridade dos perfis'),
    ],
  },
  resources: {
    description: `Disponibilizar recursos adequados para montagem segura. Avarias e acidentes. Melhora estabilidade do palete.`,
    images: [],
    tasks: [
      task('resources-1', 'Validar recursos'),
      task('resources-2', 'Verificar equipamentos'),
    ],
  },
  res_fita: {
    description: `Garantir fixação segura da carga. Requisitos técnicos: Tenso adequada, Sem danos na fita. Queda de material. Estabilidade logística.`,
    images: [],
    tasks: [
      task('res-fita-1', 'Inspecionar amarrao'),
      task('res-fita-2', 'Validar tenso da fita'),
    ],
  },
  res_filme: {
    description: `Proteger material contra umidade e movimentação. Requisitos técnicos: Cobertura total, Sem folgas. Danos no transporte. Proteo superficial.`,
    images: [],
    tasks: [
      task('res-filme-1', 'Validar aplicao'),
      task('res-filme-2', 'Verificar cobertura total'),
    ],
  },
  people: {
    description: `Definir responsabilidades operacionais. Falhas operacionais. Padronizao do processo.`,
    images: [],
    tasks: [
      task('people-1', 'Registrar operador'),
      task('people-2', 'Validar treinamento'),
    ],
  },
  pe_operador: {
    description: `Executar montagem conforme padrão exportação. Montagem incorreta. Garantia de conformidade.`,
    images: [],
    tasks: [
      task('pe-operador-1', 'Executar montagem'),
      task('pe-operador-2', 'Preencher checklist'),
    ],
  },
  methods: {
    description: `Padronizar a montagem e expedição. Falhas de estabilidade. Garantia logística.`,
    images: [],
    tasks: [
      task('methods-1', 'Auditar processo'),
      task('methods-2', 'Validar procedimentos'),
    ],
  },
  met_base: {
    description: `Garantir estabilidade inicial do palete. Requisitos técnicos: Palete nivelado, Sem avarias, Capacidade adequada. Instabilidade da carga. Base segura para transporte.`,
    images: [],
    tasks: [
      task('met-base-1', 'Inspecionar palete'),
      task('met-base-2', 'Validar nivelamento'),
    ],
  },
  met_empilhar: {
    description: `Organizar perfis sem deformaes. Requisitos técnicos: Separadores corretos, Alinhamento da carga, Distribuio uniforme. Empenamento e danos. Integridade do produto.`,
    images: [],
    tasks: [
      task('met-empilhar-1', 'Validar alinhamento'),
      task('met-empilhar-2', 'Verificar separadores'),
    ],
  },
  met_amarrar: {
    description: `Fixar carga evitando movimentação. Requisitos técnicos: Aplicar fita PET, Aplicar cantoneiras, Validar tenso. Queda de carga. Segurana logística.`,
    images: [],
    tasks: [
      task('met-amarrar-1', 'Conferir tenso'),
      task('met-amarrar-2', 'Aplicar cantoneiras'),
    ],
  },
  met_ident: {
    description: `Garantir rastreabilidade da carga exportada. Requisitos técnicos: Etiqueta exportação, Lote visvel, Peso identificado. Perda de rastreabilidade. Conformidade logística.`,
    images: [],
    tasks: [
      task('met-ident-1', 'Gerar etiqueta'),
      task('met-ident-2', 'Liberar expedição'),
    ],
  },
  outputs: {
    description: `Garantir entrega segura ao cliente. Avarias e devoluções. Cliente recebe material conforme.`,
    images: [],
    tasks: [
      task('outputs-1', 'Liberar carga'),
      task('outputs-2', 'Validar checklist'),
    ],
  },
  out_palete: {
    description: `Disponibilizar carga pronta para exportação. Falhas logsticas. Integridade garantida.`,
    images: [],
    tasks: [
      task('out-palete-1', 'Inspecionar carga'),
      task('out-palete-2', 'Validar etiquetas'),
    ],
  },
  kpis: {
    description: `Monitorar eficiência e qualidade do processo. Aumento de avarias. Melhoria contínua.`,
    images: [],
    tasks: [
      task('kpis-1', 'Monitorar indicadores'),
      task('kpis-2', 'Atualizar dashboard'),
    ],
  },
  kpi_avaria: {
    description: `Monitorar danos no transporte. Reduo de reclamações.`,
    images: [],
    tasks: [
      task('kpi-avaria-1', 'Registrar ocorrências'),
      task('kpi-avaria-2', 'Analisar causas'),
    ],
  },
  kpi_prod: {
    description: `Monitorar tempo de montagem. Melhoria operacional.`,
    images: [],
    tasks: [
      task('kpi-prod-1', 'Registrar produção'),
      task('kpi-prod-2', 'Medir produtividade'),
    ],
  },
  kpi_reclam: {
    description: `Monitorar satisfao logística. Melhoria contínua.`,
    images: [],
    tasks: [
      task('kpi-reclam-1', 'Analisar ocorrências'),
      task('kpi-reclam-2', 'Implementar melhorias'),
    ],
  },
};

export default paletesExportacaoNodeDetails;
