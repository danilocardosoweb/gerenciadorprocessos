import { Node, Edge } from '@xyflow/react';

export const initialNodes: Node[] = [
  // ROOT
  { id: 'root', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Processo Principal', nodeType: 'root', category: 'root', numberCode: '1.0' } },

  // BRANCHES
  { id: 'inputs',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Entradas',              nodeType: 'inputs',    category: 'inputs', numberCode: '2.0' } },
  { id: 'outputs',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Saídas',                nodeType: 'outputs',   category: 'outputs', numberCode: '3.0' } },
  { id: 'resources', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Recursos / Com o quê?', nodeType: 'resources', category: 'resources', numberCode: '4.0' } },
  { id: 'people',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Pessoas / Quem?',       nodeType: 'people',    category: 'people', numberCode: '5.0' } },
  { id: 'methods',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Métodos / Como?',       nodeType: 'methods',   category: 'methods', numberCode: '6.0' } },
  { id: 'kpis',      type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Indicadores / Medições',nodeType: 'kpis',      category: 'kpis', numberCode: '7.0' } },
  { id: 'safety',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Segurança do Trabalho', nodeType: 'methods',   category: 'methods', numberCode: '8.0' } },
  { id: 'quality',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Controle de Qualidade', nodeType: 'kpis',      category: 'kpis', numberCode: '9.0' } },

  // INPUTS CHILDREN — Seção 5 e 6 do POP
  { id: 'in_op',     type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Ordem de Produção (OP)', category: 'inputs', numberCode: '2.1' } },
  { id: 'in_mat',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Matéria Prima conferida', category: 'inputs', numberCode: '2.2' } },
  { id: 'in_draw',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Desenho Técnico (medidas, tolerâncias)', category: 'inputs', numberCode: '2.3' } },
  { id: 'in_prog',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Programa selecionado', category: 'inputs', numberCode: '2.4' } },

  // OUTPUTS CHILDREN — Seção 11 do POP
  { id: 'out_ok',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Peças Boas Identificadas', category: 'outputs', numberCode: '3.1' } },
  { id: 'out_nc',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Peças de Retrabalho Segregadas', category: 'outputs', numberCode: '3.2' } },
  { id: 'out_scrap', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Sucata / Descarte', category: 'outputs', numberCode: '3.3' } },
  { id: 'out_apo',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Apontamento Registrado', category: 'outputs', numberCode: '3.4' } },

  // RESOURCES CHILDREN — Seção 2 e 7 do POP
  { id: 'res_serra_auto',  type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Serra Automática', category: 'resources' } },
  { id: 'res_serra_dupla', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Serra Dupla', category: 'resources' } },
  { id: 'res_cnc',         type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Centro de Usinagem', category: 'resources' } },
  { id: 'res_gages',       type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Instrumentos de Medição', category: 'resources' } },

  // PEOPLE CHILDREN — Seção 3 do POP
  { id: 'peo_sup',  type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Supervisor', category: 'people' } },
  { id: 'peo_op',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Operador (Treinado)', category: 'people' } },
  { id: 'peo_aux',  type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Auxiliar de Produção', category: 'people' } },
  { id: 'peo_qual', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Qualidade / Suporte', category: 'people' } },

  // METHODS CHILDREN — Seções 7, 8 do POP
  { id: 'met_prep_serra', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Preparação das Serras', category: 'methods' } },
  { id: 'met_prep_cnc',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Preparação CNC', category: 'methods' } },
  { id: 'met_op_serra',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Operação nas Serras', category: 'methods' } },
  { id: 'met_op_cnc',     type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Operação no CNC', category: 'methods' } },
  { id: 'met_nc',         type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Tratamento de Não Conformidades', category: 'methods' } },
  { id: 'met_kaizen',     type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Melhoria Contínua (sugestões, redução de perdas)', category: 'methods' } },

  // SAFETY CHILDREN — Seção 4 do POP
  { id: 'saf_epi',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'EPIs: Óculos, Protetor Auricular, Luvas anticorte, Calçado', category: 'methods' } },
  { id: 'saf_reg1',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Proibido operar sem treinamento', category: 'methods' } },
  { id: 'saf_reg2',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Nunca remover proteções de segurança', category: 'methods' } },
  { id: 'saf_reg3',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Nunca medir peças com máquina em funcionamento', category: 'methods' } },

  // QUALITY CHILDREN — Seção 9 do POP
  { id: 'qua_first',  type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Medir primeiras peças', category: 'kpis' } },
  { id: 'qua_comp',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Conferir medidas', category: 'kpis' } },
  { id: 'qua_draw',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Comparar com Desenho', category: 'kpis' } },
  { id: 'qua_seg',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Segregar peças fora de espec.', category: 'kpis' } },

  // KPIS CHILDREN — Seção 10 do POP
  { id: 'kpi_prod',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Quantidade Produzida', category: 'kpis' } },
  { id: 'kpi_scrap',  type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Índice de Refugo', category: 'kpis' } },
  { id: 'kpi_stop',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Paradas de Máquina', category: 'kpis' } },
  { id: 'kpi_5s',     type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Organização 5S ao final da OP', category: 'kpis' } },
];

export const initialEdges: Edge[] = [
  { id: 'e-root-inputs',    source: 'root', target: 'inputs',    animated: true, type: 'smoothstep', style: { stroke: '#60a5fa', strokeWidth: 2 } },
  { id: 'e-root-outputs',   source: 'root', target: 'outputs',   animated: true, type: 'smoothstep', style: { stroke: '#60a5fa', strokeWidth: 2 } },
  { id: 'e-root-resources', source: 'root', target: 'resources', animated: true, type: 'smoothstep', style: { stroke: '#60a5fa', strokeWidth: 2 } },
  { id: 'e-root-people',    source: 'root', target: 'people',    animated: true, type: 'smoothstep', style: { stroke: '#60a5fa', strokeWidth: 2 } },
  { id: 'e-root-methods',   source: 'root', target: 'methods',   animated: true, type: 'smoothstep', style: { stroke: '#60a5fa', strokeWidth: 2 } },
  { id: 'e-root-kpis',      source: 'root', target: 'kpis',      animated: true, type: 'smoothstep', style: { stroke: '#60a5fa', strokeWidth: 2 } },
  { id: 'e-root-safety',    source: 'root', target: 'safety',    animated: true, type: 'smoothstep', style: { stroke: '#60a5fa', strokeWidth: 2 } },
  { id: 'e-root-quality',   source: 'root', target: 'quality',   animated: true, type: 'smoothstep', style: { stroke: '#60a5fa', strokeWidth: 2 } },

  { id: 'e-in-op',    source: 'inputs', target: 'in_op',   style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-in-mat',   source: 'inputs', target: 'in_mat',  style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-in-draw',  source: 'inputs', target: 'in_draw', style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-in-prog',  source: 'inputs', target: 'in_prog', style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },

  { id: 'e-out-ok',    source: 'outputs', target: 'out_ok',    style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-out-nc',    source: 'outputs', target: 'out_nc',    style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-out-scrap', source: 'outputs', target: 'out_scrap', style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-out-apo',   source: 'outputs', target: 'out_apo',   style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },

  { id: 'e-res-serra-auto',  source: 'resources', target: 'res_serra_auto',  style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-res-serra-dupla', source: 'resources', target: 'res_serra_dupla', style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-res-cnc',         source: 'resources', target: 'res_cnc',         style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-res-gages',       source: 'resources', target: 'res_gages',       style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },

  { id: 'e-peo-sup',  source: 'people', target: 'peo_sup',  style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-peo-op',   source: 'people', target: 'peo_op',   style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-peo-aux',  source: 'people', target: 'peo_aux',  style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-peo-qual', source: 'people', target: 'peo_qual', style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },

  { id: 'e-met-prep-serra', source: 'methods', target: 'met_prep_serra', style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-met-prep-cnc',   source: 'methods', target: 'met_prep_cnc',   style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-met-op-serra',   source: 'methods', target: 'met_op_serra',   style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-met-op-cnc',     source: 'methods', target: 'met_op_cnc',     style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-met-nc',         source: 'methods', target: 'met_nc',         style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-met-kaizen',     source: 'methods', target: 'met_kaizen',     style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },

  { id: 'e-saf-epi',  source: 'safety', target: 'saf_epi',  style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-saf-reg1', source: 'safety', target: 'saf_reg1', style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-saf-reg2', source: 'safety', target: 'saf_reg2', style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-saf-reg3', source: 'safety', target: 'saf_reg3', style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },

  { id: 'e-qua-first', source: 'quality', target: 'qua_first', style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-qua-comp',  source: 'quality', target: 'qua_comp',  style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-qua-draw',  source: 'quality', target: 'qua_draw',  style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-qua-seg',   source: 'quality', target: 'qua_seg',   style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },

  { id: 'e-kpi-prod',  source: 'kpis', target: 'kpi_prod',  style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-kpi-scrap', source: 'kpis', target: 'kpi_scrap', style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-kpi-stop',  source: 'kpis', target: 'kpi_stop',  style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
  { id: 'e-kpi-5s',    source: 'kpis', target: 'kpi_5s',    style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 } },
];
