import { Node, Edge } from '@xyflow/react';

// Empty template for new maps (only a root node)
export const emptyMapTemplate = {
  nodes: [
    { id: 'root', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Novo Processo', nodeType: 'root', category: 'root', numberCode: '1.0' } }
  ] as Node[],
  edges: [] as Edge[]
};

// Serra Doppia 2 Cabeças Template
export const serraDoppiaTemplate = {
  nodes: [
    {
      id: "root",
      type: "mindmap",
      position: { x: 0, y: 0 },
      data: {
        label: "Instruo de Trabalho - Serra Doppia 2 Cabeas",
        nodeType: "root",
        category: "root",
        numberCode: "1.0"
      }
    },
    {
      id: "inputs",
      type: "mindmap",
      position: { x: -700, y: -250 },
      data: {
        label: "Entradas",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.0"
      }
    },
    {
      id: "in_op",
      type: "mindmap",
      position: { x: -1000, y: -450 },
      data: {
        label: "Ordem de Produo",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.1"
      }
    },
    {
      id: "in_desenho",
      type: "mindmap",
      position: { x: -1000, y: -350 },
      data: {
        label: "Desenho Técnico",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.2"
      }
    },
    {
      id: "in_perfil",
      type: "mindmap",
      position: { x: -1000, y: -250 },
      data: {
        label: "Perfil de Alumínio",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.3"
      }
    },
    {
      id: "in_programa",
      type: "mindmap",
      position: { x: -1000, y: -150 },
      data: {
        label: "Programa de Corte",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.4"
      }
    },
    {
      id: "in_epi",
      type: "mindmap",
      position: { x: -1000, y: -50 },
      data: {
        label: "EPIs Obrigatórios",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.5"
      }
    },
    {
      id: "resources",
      type: "mindmap",
      position: { x: -700, y: 300 },
      data: {
        label: "Recursos",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.0"
      }
    },
    {
      id: "res_serra",
      type: "mindmap",
      position: { x: -1000, y: 100 },
      data: {
        label: "Serra Doppia 2 Cabeças",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.1"
      }
    },
    {
      id: "res_trena",
      type: "mindmap",
      position: { x: -1000, y: 200 },
      data: {
        label: "Trena e Paquímetro",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.2"
      }
    },
    {
      id: "res_coletor",
      type: "mindmap",
      position: { x: -1000, y: 300 },
      data: {
        label: "Leitor Código de Barras",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.3"
      }
    },
    {
      id: "res_ponte",
      type: "mindmap",
      position: { x: -1000, y: 400 },
      data: {
        label: "Ponte Rolante",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.4"
      }
    },
    {
      id: "res_check",
      type: "mindmap",
      position: { x: -1000, y: 500 },
      data: {
        label: "Checklist de Máquina",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.5"
      }
    },
    {
      id: "people",
      type: "mindmap",
      position: { x: 700, y: -250 },
      data: {
        label: "Pessoas",
        nodeType: "people",
        category: "people",
        numberCode: "5.0"
      }
    },
    {
      id: "pe_operador",
      type: "mindmap",
      position: { x: 1000, y: -450 },
      data: {
        label: "Operador de Serra",
        nodeType: "people",
        category: "people",
        numberCode: "5.1"
      }
    },
    {
      id: "pe_lider",
      type: "mindmap",
      position: { x: 1000, y: -350 },
      data: {
        label: "Lder de Produo",
        nodeType: "people",
        category: "people",
        numberCode: "5.2"
      }
    },
    {
      id: "pe_qualidade",
      type: "mindmap",
      position: { x: 1000, y: -250 },
      data: {
        label: "Inspetor da Qualidade",
        nodeType: "people",
        category: "people",
        numberCode: "5.3"
      }
    },
    {
      id: "pe_manut",
      type: "mindmap",
      position: { x: 1000, y: -150 },
      data: {
        label: "Tcnico de Manuteno",
        nodeType: "people",
        category: "people",
        numberCode: "5.4"
      }
    },
    {
      id: "methods",
      type: "mindmap",
      position: { x: 0, y: 600 },
      data: {
        label: "Métodos Operacionais",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.0"
      }
    },
    {
      id: "met_inicio",
      type: "mindmap",
      position: { x: -400, y: 800 },
      data: {
        label: "1. Realizar Checklist Inicial",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.1"
      }
    },
    {
      id: "met_inicio_ok",
      type: "mindmap",
      position: { x: -700, y: 950 },
      data: {
        label: "OK: Liberar Máquina",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.1.1"
      }
    },
    {
      id: "met_inicio_nok",
      type: "mindmap",
      position: { x: -250, y: 950 },
      data: {
        label: "NOK: Informar Liderança",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.1.2"
      }
    },
    {
      id: "met_setup",
      type: "mindmap",
      position: { x: -100, y: 800 },
      data: {
        label: "2. Configurar Medidas e ?ângulos",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.2"
      }
    },
    {
      id: "met_setup_ok",
      type: "mindmap",
      position: { x: -100, y: 950 },
      data: {
        label: "OK: Validar Primeiro Corte",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.2.1"
      }
    },
    {
      id: "met_corte",
      type: "mindmap",
      position: { x: 250, y: 800 },
      data: {
        label: "3. Executar Corte",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.3"
      }
    },
    {
      id: "met_corte_ok",
      type: "mindmap",
      position: { x: 150, y: 950 },
      data: {
        label: "OK: Encaminhar Produo",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.3.1"
      }
    },
    {
      id: "met_corte_nok",
      type: "mindmap",
      position: { x: 450, y: 950 },
      data: {
        label: "NOK: Segregar Material",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.3.2"
      }
    },
    {
      id: "met_rastreio",
      type: "mindmap",
      position: { x: 550, y: 800 },
      data: {
        label: "4. Registrar Produo e Rastreabilidade",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.4"
      }
    },
    {
      id: "outputs",
      type: "mindmap",
      position: { x: 700, y: 300 },
      data: {
        label: "Saídas",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.0"
      }
    },
    {
      id: "out_corte",
      type: "mindmap",
      position: { x: 1000, y: 100 },
      data: {
        label: "Perfis Cortados",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.1"
      }
    },
    {
      id: "out_qualidade",
      type: "mindmap",
      position: { x: 1000, y: 200 },
      data: {
        label: "Produto Conforme",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.2"
      }
    },
    {
      id: "out_rastreio",
      type: "mindmap",
      position: { x: 1000, y: 300 },
      data: {
        label: "Rastreabilidade Registrada",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.3"
      }
    },
    {
      id: "out_refugo",
      type: "mindmap",
      position: { x: 1000, y: 400 },
      data: {
        label: "Refugo Identificado",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.4"
      }
    },
    {
      id: "kpis",
      type: "mindmap",
      position: { x: 0, y: -700 },
      data: {
        label: "KPIs",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.0"
      }
    },
    {
      id: "kpi_eficiencia",
      type: "mindmap",
      position: { x: -300, y: -950 },
      data: {
        label: "Eficiência de Corte",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.1"
      }
    },
    {
      id: "kpi_setup",
      type: "mindmap",
      position: { x: -100, y: -1050 },
      data: {
        label: "Tempo de Setup",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.2"
      }
    },
    {
      id: "kpi_refugo",
      type: "mindmap",
      position: { x: 100, y: -1050 },
      data: {
        label: "Índice de Refugo",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.3"
      }
    },
    {
      id: "kpi_seg",
      type: "mindmap",
      position: { x: 300, y: -950 },
      data: {
        label: "Incidentes de Segurança",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.4"
      }
    }
  ] as Node[],
  edges: [
    {
      id: "e-root-inputs",
      source: "root",
      target: "inputs",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    {
      id: "e-root-resources",
      source: "root",
      target: "resources",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    {
      id: "e-root-people",
      source: "root",
      target: "people",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    {
      id: "e-root-methods",
      source: "root",
      target: "methods",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    {
      id: "e-root-outputs",
      source: "root",
      target: "outputs",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    {
      id: "e-root-kpis",
      source: "root",
      target: "kpis",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    // Inputs children
    { id: "e-in-op", source: "inputs", target: "in_op", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-in-desenho", source: "inputs", target: "in_desenho", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-in-perfil", source: "inputs", target: "in_perfil", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-in-programa", source: "inputs", target: "in_programa", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-in-epi", source: "inputs", target: "in_epi", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Resources children
    { id: "e-res-serra", source: "resources", target: "res_serra", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-res-trena", source: "resources", target: "res_trena", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-res-coletor", source: "resources", target: "res_coletor", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-res-ponte", source: "resources", target: "res_ponte", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-res-check", source: "resources", target: "res_check", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // People children
    { id: "e-pe-operador", source: "people", target: "pe_operador", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-pe-lider", source: "people", target: "pe_lider", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-pe-qualidade", source: "people", target: "pe_qualidade", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-pe-manut", source: "people", target: "pe_manut", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Methods children
    { id: "e-met-inicio", source: "methods", target: "met_inicio", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-inicio-ok", source: "met_inicio", target: "met_inicio_ok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-inicio-nok", source: "met_inicio", target: "met_inicio_nok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-setup", source: "methods", target: "met_setup", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-setup-ok", source: "met_setup", target: "met_setup_ok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-corte", source: "methods", target: "met_corte", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-corte-ok", source: "met_corte", target: "met_corte_ok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-corte-nok", source: "met_corte", target: "met_corte_nok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-rastreio", source: "methods", target: "met_rastreio", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Outputs children
    { id: "e-out-corte", source: "outputs", target: "out_corte", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-out-qualidade", source: "outputs", target: "out_qualidade", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-out-rastreio", source: "outputs", target: "out_rastreio", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-out-refugo", source: "outputs", target: "out_refugo", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // KPIs children
    { id: "e-kpi-eficiencia", source: "kpis", target: "kpi_eficiencia", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpi-setup", source: "kpis", target: "kpi_setup", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpi-refugo", source: "kpis", target: "kpi_refugo", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpi-seg", source: "kpis", target: "kpi_seg", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } }
  ] as Edge[]
};

// Serra Emmegi Automática 1 Cabeça Template
export const serraEmmegiTemplate = {
  nodes: [
    {
      id: "root",
      type: "mindmap",
      position: { x: 0, y: 0 },
      data: {
        label: "Instruo de Trabalho - Serra Emmegi Automtica 1 Cabea",
        nodeType: "root",
        category: "root",
        numberCode: "1.0"
      }
    },
    {
      id: "inputs",
      type: "mindmap",
      position: { x: -700, y: -250 },
      data: {
        label: "Entradas",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.0"
      }
    },
    {
      id: "in_op",
      type: "mindmap",
      position: { x: -1000, y: -450 },
      data: {
        label: "Ordem de Produo",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.1"
      }
    },
    {
      id: "in_desenho",
      type: "mindmap",
      position: { x: -1000, y: -350 },
      data: {
        label: "Desenho Técnico",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.2"
      }
    },
    {
      id: "in_perfil",
      type: "mindmap",
      position: { x: -1000, y: -250 },
      data: {
        label: "Perfil de Alumínio",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.3"
      }
    },
    {
      id: "in_programa",
      type: "mindmap",
      position: { x: -1000, y: -150 },
      data: {
        label: "Programa CNC de Corte",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.4"
      }
    },
    {
      id: "in_epi",
      type: "mindmap",
      position: { x: -1000, y: -50 },
      data: {
        label: "EPIs Obrigatórios",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.5"
      }
    },
    {
      id: "resources",
      type: "mindmap",
      position: { x: -700, y: 300 },
      data: {
        label: "Recursos",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.0"
      }
    },
    {
      id: "res_serra",
      type: "mindmap",
      position: { x: -1000, y: 100 },
      data: {
        label: "Serra Emmegi Automática",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.1"
      }
    },
    {
      id: "res_cnc",
      type: "mindmap",
      position: { x: -1000, y: 200 },
      data: {
        label: "Controlador CNC",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.2"
      }
    },
    {
      id: "res_trena",
      type: "mindmap",
      position: { x: -1000, y: 300 },
      data: {
        label: "Paquímetro e Trena",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.3"
      }
    },
    {
      id: "res_ponte",
      type: "mindmap",
      position: { x: -1000, y: 400 },
      data: {
        label: "Ponte Rolante",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.4"
      }
    },
    {
      id: "res_check",
      type: "mindmap",
      position: { x: -1000, y: 500 },
      data: {
        label: "Checklist de Segurança",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.5"
      }
    },
    {
      id: "people",
      type: "mindmap",
      position: { x: 700, y: -250 },
      data: {
        label: "Pessoas",
        nodeType: "people",
        category: "people",
        numberCode: "5.0"
      }
    },
    {
      id: "pe_operador",
      type: "mindmap",
      position: { x: 1000, y: -450 },
      data: {
        label: "Operador CNC",
        nodeType: "people",
        category: "people",
        numberCode: "5.1"
      }
    },
    {
      id: "pe_lider",
      type: "mindmap",
      position: { x: 1000, y: -350 },
      data: {
        label: "Lder de Produo",
        nodeType: "people",
        category: "people",
        numberCode: "5.2"
      }
    },
    {
      id: "pe_qualidade",
      type: "mindmap",
      position: { x: 1000, y: -250 },
      data: {
        label: "Inspetor da Qualidade",
        nodeType: "people",
        category: "people",
        numberCode: "5.3"
      }
    },
    {
      id: "pe_manut",
      type: "mindmap",
      position: { x: 1000, y: -150 },
      data: {
        label: "Tcnico de Manuteno",
        nodeType: "people",
        category: "people",
        numberCode: "5.4"
      }
    },
    {
      id: "methods",
      type: "mindmap",
      position: { x: 0, y: 650 },
      data: {
        label: "Métodos Operacionais",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.0"
      }
    },
    {
      id: "met_check",
      type: "mindmap",
      position: { x: -500, y: 850 },
      data: {
        label: "1. Realizar Checklist Inicial",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.1"
      }
    },
    {
      id: "met_check_ok",
      type: "mindmap",
      position: { x: -700, y: 1000 },
      data: {
        label: "OK: Liberar Equipamento",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.1.1"
      }
    },
    {
      id: "met_check_nok",
      type: "mindmap",
      position: { x: -300, y: 1000 },
      data: {
        label: "NOK: Acionar Manuteno",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.1.2"
      }
    },
    {
      id: "met_programa",
      type: "mindmap",
      position: { x: -150, y: 850 },
      data: {
        label: "2. Carregar Programa CNC",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.2"
      }
    },
    {
      id: "met_programa_ok",
      type: "mindmap",
      position: { x: -150, y: 1000 },
      data: {
        label: "OK: Confirmar Medidas",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.2.1"
      }
    },
    {
      id: "met_setup",
      type: "mindmap",
      position: { x: 200, y: 850 },
      data: {
        label: "3. Ajustar Batente e Fixao",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.3"
      }
    },
    {
      id: "met_setup_ok",
      type: "mindmap",
      position: { x: 200, y: 1000 },
      data: {
        label: "OK: Executar Primeiro Corte",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.3.1"
      }
    },
    {
      id: "met_corte",
      type: "mindmap",
      position: { x: 550, y: 850 },
      data: {
        label: "4. Executar Processo Automático",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.4"
      }
    },
    {
      id: "met_corte_ok",
      type: "mindmap",
      position: { x: 400, y: 1000 },
      data: {
        label: "OK: Liberar Produo",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.4.1"
      }
    },
    {
      id: "met_corte_nok",
      type: "mindmap",
      position: { x: 700, y: 1000 },
      data: {
        label: "NOK: Segregar Material",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.4.2"
      }
    },
    {
      id: "outputs",
      type: "mindmap",
      position: { x: 700, y: 300 },
      data: {
        label: "Saídas",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.0"
      }
    },
    {
      id: "out_corte",
      type: "mindmap",
      position: { x: 1000, y: 100 },
      data: {
        label: "Perfis Cortados",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.1"
      }
    },
    {
      id: "out_qualidade",
      type: "mindmap",
      position: { x: 1000, y: 200 },
      data: {
        label: "Produto Conforme",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.2"
      }
    },
    {
      id: "out_rastreio",
      type: "mindmap",
      position: { x: 1000, y: 300 },
      data: {
        label: "Registro de Produo",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.3"
      }
    },
    {
      id: "out_refugo",
      type: "mindmap",
      position: { x: 1000, y: 400 },
      data: {
        label: "Refugo Identificado",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.4"
      }
    },
    {
      id: "kpis",
      type: "mindmap",
      position: { x: 0, y: -700 },
      data: {
        label: "KPIs",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.0"
      }
    },
    {
      id: "kpi_prod",
      type: "mindmap",
      position: { x: -300, y: -950 },
      data: {
        label: "Produtividade Hora",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.1"
      }
    },
    {
      id: "kpi_setup",
      type: "mindmap",
      position: { x: -100, y: -1050 },
      data: {
        label: "Tempo de Setup",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.2"
      }
    },
    {
      id: "kpi_refugo",
      type: "mindmap",
      position: { x: 100, y: -1050 },
      data: {
        label: "Índice de Refugo",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.3"
      }
    },
    {
      id: "kpi_seguranca",
      type: "mindmap",
      position: { x: 300, y: -950 },
      data: {
        label: "Acidentes e Incidentes",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.4"
      }
    }
  ] as Node[],
  edges: [
    {
      id: "e-root-inputs",
      source: "root",
      target: "inputs",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    {
      id: "e-root-resources",
      source: "root",
      target: "resources",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    {
      id: "e-root-people",
      source: "root",
      target: "people",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    {
      id: "e-root-methods",
      source: "root",
      target: "methods",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    {
      id: "e-root-outputs",
      source: "root",
      target: "outputs",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    {
      id: "e-root-kpis",
      source: "root",
      target: "kpis",
      animated: true,
      type: "smoothstep",
      style: { stroke: "#60a5fa", strokeWidth: 2 }
    },
    // Inputs children
    { id: "e-in-op", source: "inputs", target: "in_op", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-in-desenho", source: "inputs", target: "in_desenho", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-in-perfil", source: "inputs", target: "in_perfil", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-in-programa", source: "inputs", target: "in_programa", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-in-epi", source: "inputs", target: "in_epi", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Resources children
    { id: "e-res-serra", source: "resources", target: "res_serra", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-res-cnc", source: "resources", target: "res_cnc", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-res-trena", source: "resources", target: "res_trena", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-res-ponte", source: "resources", target: "res_ponte", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-res-check", source: "resources", target: "res_check", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // People children
    { id: "e-pe-operador", source: "people", target: "pe_operador", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-pe-lider", source: "people", target: "pe_lider", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-pe-qualidade", source: "people", target: "pe_qualidade", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-pe-manut", source: "people", target: "pe_manut", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Methods children
    { id: "e-met-check", source: "methods", target: "met_check", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-check-ok", source: "met_check", target: "met_check_ok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-check-nok", source: "met_check", target: "met_check_nok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-programa", source: "methods", target: "met_programa", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-programa-ok", source: "met_programa", target: "met_programa_ok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-setup", source: "methods", target: "met_setup", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-setup-ok", source: "met_setup", target: "met_setup_ok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-corte", source: "methods", target: "met_corte", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-corte-ok", source: "met_corte", target: "met_corte_ok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-met-corte-nok", source: "met_corte", target: "met_corte_nok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Outputs children
    { id: "e-out-corte", source: "outputs", target: "out_corte", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-out-qualidade", source: "outputs", target: "out_qualidade", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-out-rastreio", source: "outputs", target: "out_rastreio", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-out-refugo", source: "outputs", target: "out_refugo", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // KPIs children
    { id: "e-kpi-prod", source: "kpis", target: "kpi_prod", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpi-setup", source: "kpis", target: "kpi_setup", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpi-refugo", source: "kpis", target: "kpi_refugo", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpi-seguranca", source: "kpis", target: "kpi_seguranca", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } }
  ] as Edge[]
};

export const paletesExportacaoTemplate = {
  nodes: [
    {
      id: "root",
      type: "mindmap",
      position: { x: 0, y: 0 },
      data: {
        label: "Montagem de Paletes para Exportao",
        nodeType: "root",
        category: "root",
        numberCode: "1.0",
        analyticalDetails: {
          objective: "Padronizar a montagem de paletes destinados  exportação garantindo segurança, integridade do produto e conformidade logística internacional.",
          riskImpact: "Montagem incorreta pode causar avarias, tombamento, rejeição logística e perdas financeiras.",
          qualityImpact: "Garantia de estabilidade, rastreabilidade e conformidade para transporte nacional e internacional.",
          frequency: "Processo contínuo",
          responsible: "Produo, Expedio e Qualidade"
        },
        actionsEvidence: [
          {
            action: "Liberar palete para expedição",
            evidence: "Checklist aprovado",
            type: "approval"
          }
        ]
      }
    },
    {
      id: "inputs",
      type: "mindmap",
      position: { x: -700, y: -300 },
      data: {
        label: "Entradas",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.0",
        analyticalDetails: {
          objective: "Garantir disponibilidade correta de materiais e documentos para montagem.",
          technicalRequirements: [
            "Paletes homologados",
            "Perfis identificados",
            "Etiqueta exportação",
            "Ordem de produção"
          ],
          riskImpact: "Erro de identificação e montagem incorreta.",
          qualityImpact: "Assegura rastreabilidade do lote."
        },
        actionsEvidence: [
          {
            action: "Conferir materiais",
            evidence: "Checklist de recebimento",
            type: "inspection"
          }
        ]
      }
    },
    {
      id: "in_palete",
      type: "mindmap",
      position: { x: -1050, y: -500 },
      data: {
        label: "Palete de Madeira HT",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.1",
        analyticalDetails: {
          objective: "Utilizar paletes tratados conforme norma ISPM-15.",
          technicalRequirements: [
            "Carimbo HT visível",
            "Estrutura íntegra",
            "Sem rachaduras"
          ],
          riskImpact: "Rejeio alfandegria.",
          qualityImpact: "Garantia logística internacional."
        },
        actionsEvidence: [
          {
            action: "Validar carimbo HT",
            evidence: "Foto do palete",
            type: "image"
          }
        ]
      }
    },
    {
      id: "in_perfis",
      type: "mindmap",
      position: { x: -1050, y: -380 },
      data: {
        label: "Perfis de Alumínio",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.2",
        analyticalDetails: {
          objective: "Garantir identificação e integridade dos perfis.",
          technicalRequirements: [
            "Etiqueta legível",
            "Quantidade correta",
            "Sem danos superficiais"
          ],
          riskImpact: "Mistura de lotes.",
          qualityImpact: "Evita reclamações do cliente."
        },
        actionsEvidence: [
          {
            action: "Conferir lote",
            evidence: "Leitura código barras",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "resources",
      type: "mindmap",
      position: { x: -700, y: 300 },
      data: {
        label: "Recursos",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.0",
        analyticalDetails: {
          objective: "Disponibilizar recursos adequados para montagem segura.",
          riskImpact: "Avarias e acidentes.",
          qualityImpact: "Melhora estabilidade do palete."
        },
        actionsEvidence: [
          {
            action: "Validar recursos",
            evidence: "Checklist operacional",
            type: "inspection"
          }
        ]
      }
    },
    {
      id: "res_fita",
      type: "mindmap",
      position: { x: -1050, y: 100 },
      data: {
        label: "Fita PET de Amarrao",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.1",
        analyticalDetails: {
          objective: "Garantir fixação segura da carga.",
          technicalRequirements: [
            "Tenso adequada",
            "Sem danos na fita"
          ],
          riskImpact: "Queda de material.",
          qualityImpact: "Estabilidade logística."
        },
        actionsEvidence: [
          {
            action: "Inspecionar amarrao",
            evidence: "Foto da carga",
            type: "image"
          }
        ]
      }
    },
    {
      id: "res_filme",
      type: "mindmap",
      position: { x: -1050, y: 220 },
      data: {
        label: "Filme Stretch",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.2",
        analyticalDetails: {
          objective: "Proteger material contra umidade e movimentação.",
          technicalRequirements: [
            "Cobertura total",
            "Sem folgas"
          ],
          riskImpact: "Danos no transporte.",
          qualityImpact: "Proteo superficial."
        },
        actionsEvidence: [
          {
            action: "Validar aplicao",
            evidence: "Registro visual",
            type: "image"
          }
        ]
      }
    },
    {
      id: "people",
      type: "mindmap",
      position: { x: 700, y: -300 },
      data: {
        label: "Pessoas",
        nodeType: "people",
        category: "people",
        numberCode: "5.0",
        analyticalDetails: {
          objective: "Definir responsabilidades operacionais.",
          riskImpact: "Falhas operacionais.",
          qualityImpact: "Padronizao do processo."
        },
        actionsEvidence: [
          {
            action: "Registrar operador",
            evidence: "Login sistema",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "pe_operador",
      type: "mindmap",
      position: { x: 1050, y: -500 },
      data: {
        label: "Operador de Montagem",
        nodeType: "people",
        category: "people",
        numberCode: "5.1",
        analyticalDetails: {
          objective: "Executar montagem conforme padrão exportação.",
          riskImpact: "Montagem incorreta.",
          qualityImpact: "Garantia de conformidade."
        },
        actionsEvidence: [
          {
            action: "Executar montagem",
            evidence: "Checklist preenchido",
            type: "digital_record"
          }
        ]
      }
    },
    {
      id: "methods",
      type: "mindmap",
      position: { x: 0, y: 650 },
      data: {
        label: "Métodos Operacionais",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.0",
        analyticalDetails: {
          objective: "Padronizar a montagem e expedição.",
          riskImpact: "Falhas de estabilidade.",
          qualityImpact: "Garantia logística."
        },
        actionsEvidence: [
          {
            action: "Auditar processo",
            evidence: "Checklist auditoria",
            type: "inspection"
          }
        ]
      }
    },
    {
      id: "met_base",
      type: "mindmap",
      position: { x: -450, y: 900 },
      data: {
        label: "1. Preparar Base do Palete",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.1",
        analyticalDetails: {
          objective: "Garantir estabilidade inicial do palete.",
          technicalRequirements: [
            "Palete nivelado",
            "Sem avarias",
            "Capacidade adequada"
          ],
          riskImpact: "Instabilidade da carga.",
          qualityImpact: "Base segura para transporte."
        },
        actionsEvidence: [
          {
            action: "Inspecionar palete",
            evidence: "Foto da base",
            type: "image"
          }
        ]
      }
    },
    {
      id: "met_empilhar",
      type: "mindmap",
      position: { x: -100, y: 900 },
      data: {
        label: "2. Posicionar Perfis",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.2",
        analyticalDetails: {
          objective: "Organizar perfis sem deformações.",
          technicalRequirements: [
            "Separadores corretos",
            "Alinhamento da carga",
            "Distribuio uniforme"
          ],
          riskImpact: "Empenamento e danos.",
          qualityImpact: "Integridade do produto."
        },
        actionsEvidence: [
          {
            action: "Validar alinhamento",
            evidence: "Foto lateral",
            type: "image"
          }
        ]
      }
    },
    {
      id: "met_amarrar",
      type: "mindmap",
      position: { x: 250, y: 900 },
      data: {
        label: "3. Realizar Amarrao",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.3",
        analyticalDetails: {
          objective: "Fixar carga evitando movimentação.",
          technicalRequirements: [
            "Aplicar fita PET",
            "Aplicar cantoneiras",
            "Validar tensão"
          ],
          riskImpact: "Queda de carga.",
          qualityImpact: "Segurança logística."
        },
        actionsEvidence: [
          {
            action: "Conferir tensão",
            evidence: "Checklist amarrao",
            type: "inspection"
          }
        ]
      }
    },
    {
      id: "met_ident",
      type: "mindmap",
      position: { x: 600, y: 900 },
      data: {
        label: "4. Identificar e Liberar",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.4",
        analyticalDetails: {
          objective: "Garantir rastreabilidade da carga exportada.",
          technicalRequirements: [
            "Etiqueta exportação",
            "Lote visível",
            "Peso identificado"
          ],
          riskImpact: "Perda de rastreabilidade.",
          qualityImpact: "Conformidade logística."
        },
        actionsEvidence: [
          {
            action: "Gerar etiqueta",
            evidence: "Etiqueta impressa",
            type: "label"
          },
          {
            action: "Liberar expedição",
            evidence: "Aprovao qualidade",
            type: "approval"
          }
        ]
      }
    },
    {
      id: "outputs",
      type: "mindmap",
      position: { x: 700, y: 300 },
      data: {
        label: "Saídas",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.0",
        analyticalDetails: {
          objective: "Garantir entrega segura ao cliente.",
          riskImpact: "Avarias e devoluções.",
          qualityImpact: "Cliente recebe material conforme."
        },
        actionsEvidence: [
          {
            action: "Liberar carga",
            evidence: "Checklist aprovado",
            type: "approval"
          }
        ]
      }
    },
    {
      id: "out_palete",
      type: "mindmap",
      position: { x: 1050, y: 120 },
      data: {
        label: "Palete Montado",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.1",
        analyticalDetails: {
          objective: "Disponibilizar carga pronta para exportação.",
          riskImpact: "Falhas logísticas.",
          qualityImpact: "Integridade garantida."
        },
        actionsEvidence: [
          {
            action: "Inspecionar carga",
            evidence: "Foto final",
            type: "image"
          }
        ]
      }
    },
    {
      id: "kpis",
      type: "mindmap",
      position: { x: 0, y: -750 },
      data: {
        label: "KPIs",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.0",
        analyticalDetails: {
          objective: "Monitorar eficiência e qualidade do processo.",
          riskImpact: "Aumento de avarias.",
          qualityImpact: "Melhoria contínua."
        },
        actionsEvidence: [
          {
            action: "Monitorar indicadores",
            evidence: "Dashboard",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "kpi_avaria",
      type: "mindmap",
      position: { x: -300, y: -980 },
      data: {
        label: "Índice de Avarias",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.1",
        analyticalDetails: {
          objective: "Monitorar danos no transporte.",
          qualityImpact: "Reduo de reclamações."
        },
        actionsEvidence: [
          {
            action: "Registrar ocorrências",
            evidence: "Relatério logístico",
            type: "report"
          }
        ]
      }
    },
    {
      id: "kpi_prod",
      type: "mindmap",
      position: { x: 0, y: -1080 },
      data: {
        label: "Produtividade de Montagem",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.2",
        analyticalDetails: {
          objective: "Monitorar tempo de montagem.",
          qualityImpact: "Melhoria operacional."
        },
        actionsEvidence: [
          {
            action: "Registrar produção",
            evidence: "Apontamento sistema",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "kpi_reclam",
      type: "mindmap",
      position: { x: 300, y: -980 },
      data: {
        label: "Reclamações Cliente",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.3",
        analyticalDetails: {
          objective: "Monitorar satisfao logística.",
          qualityImpact: "Melhoria contínua."
        },
        actionsEvidence: [
          {
            action: "Analisar ocorrências",
            evidence: "Indicadores qualidade",
            type: "report"
          }
        ]
      }
    }
  ],
  edges: [
    {
      id: "e-root-inputs",
      source: "root",
      target: "inputs",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-resources",
      source: "root",
      target: "resources",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-people",
      source: "root",
      target: "people",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-methods",
      source: "root",
      target: "methods",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-outputs",
      source: "root",
      target: "outputs",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-kpis",
      source: "root",
      target: "kpis",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    // Inputs children
    { id: "e-inputs-in_palete", source: "inputs", target: "in_palete", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-inputs-in_perfis", source: "inputs", target: "in_perfis", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Resources children
    { id: "e-resources-res_fita", source: "resources", target: "res_fita", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-resources-res_filme", source: "resources", target: "res_filme", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // People children
    { id: "e-people-pe_operador", source: "people", target: "pe_operador", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Methods children
    { id: "e-methods-met_base", source: "methods", target: "met_base", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-methods-met_empilhar", source: "methods", target: "met_empilhar", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-methods-met_amarrar", source: "methods", target: "met_amarrar", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-methods-met_ident", source: "methods", target: "met_ident", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Outputs children
    { id: "e-outputs-out_palete", source: "outputs", target: "out_palete", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // KPIs children
    { id: "e-kpis-kpi_avaria", source: "kpis", target: "kpi_avaria", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpis-kpi_prod", source: "kpis", target: "kpi_prod", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpis-kpi_reclam", source: "kpis", target: "kpi_reclam", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } }
  ]
};

export const serraEmmegiCriticosTemplate = {
  nodes: [
    {
      id: "root",
      type: "mindmap",
      position: { x: 0, y: 0 },
      data: {
        label: "Serra Emmegi Automática 1 Cabeça - Itens Críticos",
        nodeType: "root",
        category: "root",
        numberCode: "1.0",
        analyticalDetails: {
          objective: "Padronizar o processo de corte de itens críticos garantindo tolerncias rigorosas, inspeção 100% dimensional e rastreabilidade total conforme requisitos automotivos e IATF.",
          technicalRequirements: [
            "Inspeo dimensional 100%",
            "Controle rigoroso de tolerância",
            "Validao frequente de setup",
            "Monitoramento contínuo do disco",
            "Controle de estabilidade térmica"
          ],
          riskImpact: "Falhas podem gerar não conformidade crítica, montagem incorreta no cliente, sucata e reclamações automotivas.",
          qualityImpact: "Garante repetibilidade dimensional e conformidade de itens especiais.",
          safetyRequirements: [
            "Uso obrigatório de EPIs",
            "Não acessar ?área de corte durante ciclo",
            "Parada imediata em vibrao anormal"
          ],
          frequency: "Operao contínua",
          responsible: "Produo, Qualidade e Processo"
        },
        actionsEvidence: [
          {
            action: "Monitorar produção crítica",
            evidence: "Logs de produção",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "inputs",
      type: "mindmap",
      position: { x: -750, y: -300 },
      data: {
        label: "Entradas",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.0",
        analyticalDetails: {
          objective: "Garantir que todos os dados e materiais estejam corretos antes do corte.",
          technicalRequirements: [
            "Desenho atualizado",
            "Plano de controle",
            "Perfil correto",
            "Programa CNC validado"
          ],
          riskImpact: "Erro de processo e peças fora de especificação.",
          qualityImpact: "Assegura estabilidade dimensional."
        },
        actionsEvidence: [
          {
            action: "Conferir documentação",
            evidence: "Checklist eletrônico",
            type: "digital_record"
          }
        ]
      }
    },
    {
      id: "in_desenho",
      type: "mindmap",
      position: { x: -1100, y: -520 },
      data: {
        label: "Desenho Técnico Crítico",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.1",
        analyticalDetails: {
          objective: "Garantir leitura correta das tolerncias especiais.",
          technicalRequirements: [
            "Validar revisão",
            "Conferir cotas críticas",
            "Validar tolerncias"
          ],
          riskImpact: "Produo incorreta.",
          qualityImpact: "Evita desvios dimensionais."
        },
        actionsEvidence: [
          {
            action: "Validar revisão",
            evidence: "Registro aprovação",
            type: "approval"
          }
        ]
      }
    },
    {
      id: "in_programa",
      type: "mindmap",
      position: { x: -1100, y: -380 },
      data: {
        label: "Programa CNC Validado",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.2",
        analyticalDetails: {
          objective: "Garantir programa correto para itens críticos.",
          technicalRequirements: [
            "Sequência validada",
            "Medidas corretas",
            "Offset atualizado"
          ],
          riskImpact: "Corte incorreto.",
          qualityImpact: "Mantém repetibilidade."
        },
        actionsEvidence: [
          {
            action: "Validar programa",
            evidence: "Print tela CNC",
            type: "image"
          }
        ]
      }
    },
    {
      id: "resources",
      type: "mindmap",
      position: { x: -750, y: 320 },
      data: {
        label: "Recursos",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.0",
        analyticalDetails: {
          objective: "Disponibilizar recursos adequados para precisão dimensional.",
          riskImpact: "Desvio dimensional e instabilidade do processo.",
          qualityImpact: "Controle dimensional robusto."
        },
        actionsEvidence: [
          {
            action: "Validar recursos",
            evidence: "Checklist setup",
            type: "inspection"
          }
        ]
      }
    },
    {
      id: "res_serra",
      type: "mindmap",
      position: { x: -1100, y: 80 },
      data: {
        label: "Serra Emmegi Automática",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.1",
        analyticalDetails: {
          objective: "Executar cortes de alta precisão.",
          technicalRequirements: [
            "Disco calibrado",
            "Sem vibrao",
            "Lubrificao correta"
          ],
          riskImpact: "Variao dimensional.",
          qualityImpact: "Preciso do corte."
        },
        actionsEvidence: [
          {
            action: "Inspecionar máquina",
            evidence: "Checklist equipamento",
            type: "inspection"
          }
        ]
      }
    },
    {
      id: "res_medicao",
      type: "mindmap",
      position: { x: -1100, y: 220 },
      data: {
        label: "Instrumentos Calibrados",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.2",
        analyticalDetails: {
          objective: "Garantir medições precisas.",
          technicalRequirements: [
            "Paquímetro calibrado",
            "Trena validada",
            "Etiqueta de calibração vlida"
          ],
          riskImpact: "Medio incorreta.",
          qualityImpact: "Controle dimensional confiável."
        },
        actionsEvidence: [
          {
            action: "Validar calibração",
            evidence: "Etiqueta INMETRO",
            type: "image"
          }
        ]
      }
    },
    {
      id: "people",
      type: "mindmap",
      position: { x: 750, y: -300 },
      data: {
        label: "Pessoas",
        nodeType: "people",
        category: "people",
        numberCode: "5.0",
        analyticalDetails: {
          objective: "Definir responsabilidades críticas do processo.",
          riskImpact: "Falha operacional.",
          qualityImpact: "Padronizao do processo."
        },
        actionsEvidence: [
          {
            action: "Registrar operador",
            evidence: "Login sistema",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "pe_operador",
      type: "mindmap",
      position: { x: 1100, y: -520 },
      data: {
        label: "Operador CNC Especialista",
        nodeType: "people",
        category: "people",
        numberCode: "5.1",
        analyticalDetails: {
          objective: "Executar processo conforme plano de controle.",
          technicalRequirements: [
            "Treinamento validado",
            "Conhecimento de tolerncias"
          ],
          riskImpact: "Erro operacional.",
          qualityImpact: "Maior estabilidade dimensional."
        },
        actionsEvidence: [
          {
            action: "Validar treinamento",
            evidence: "Registro treinamento",
            type: "document"
          }
        ]
      }
    },
    {
      id: "methods",
      type: "mindmap",
      position: { x: 0, y: 720 },
      data: {
        label: "Métodos Operacionais",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.0",
        analyticalDetails: {
          objective: "Garantir execução padronizada do processo crítico.",
          riskImpact: "Desvios dimensionais.",
          qualityImpact: "Repetibilidade do processo."
        },
        actionsEvidence: [
          {
            action: "Auditar operação",
            evidence: "Checklist auditoria",
            type: "inspection"
          }
        ]
      }
    },
    {
      id: "met_setup",
      type: "mindmap",
      position: { x: -500, y: 980 },
      data: {
        label: "1. Realizar Setup Crítico",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.1",
        analyticalDetails: {
          objective: "Garantir estabilidade dimensional antes da produção.",
          technicalRequirements: [
            "Validar batente",
            "Validar offset",
            "Executar corte piloto",
            "Inspecionar primeira peça"
          ],
          riskImpact: "Produo fora de tolerância.",
          qualityImpact: "Controle inicial do processo."
        },
        actionsEvidence: [
          {
            action: "Aprovar primeira peça",
            evidence: "Relatério dimensional",
            type: "measurement"
          }
        ]
      }
    },
    {
      id: "met_inspecao",
      type: "mindmap",
      position: { x: -120, y: 980 },
      data: {
        label: "2. Inspeo 100% Dimensional",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.2",
        analyticalDetails: {
          objective: "Garantir conformidade total das medidas críticas.",
          technicalRequirements: [
            "Medir todas as peças",
            "Registrar medidas",
            "Validar tolerncias crticas"
          ],
          riskImpact: "Envio de peça NOK ao cliente.",
          qualityImpact: "Garantia total dimensional.",
          frequency: "Todas as peças"
        },
        actionsEvidence: [
          {
            action: "Registrar medições",
            evidence: "Planilha inspeção",
            type: "measurement"
          },
          {
            action: "Anexar evidência",
            evidence: "Foto medição",
            type: "image"
          }
        ]
      }
    },
    {
      id: "met_corte",
      type: "mindmap",
      position: { x: 250, y: 980 },
      data: {
        label: "3. Executar Corte Controlado",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.3",
        analyticalDetails: {
          objective: "Manter estabilidade durante toda produção.",
          technicalRequirements: [
            "Monitorar aquecimento",
            "Monitorar vibrao",
            "Validar medidas periodicamente"
          ],
          riskImpact: "Variao dimensional.",
          qualityImpact: "Controle estatístico do processo."
        },
        actionsEvidence: [
          {
            action: "Registrar produção",
            evidence: "Log produção",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "met_nok",
      type: "mindmap",
      position: { x: 620, y: 980 },
      data: {
        label: "4. Tratativa de Não Conformidade",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.4",
        analyticalDetails: {
          objective: "Bloquear imediatamente peças fora de especificação.",
          technicalRequirements: [
            "Segregar material",
            "Identificar NOK",
            "Acionar qualidade"
          ],
          riskImpact: "Mistura de lotes conformes e NOK.",
          qualityImpact: "Proteo do cliente."
        },
        actionsEvidence: [
          {
            action: "Abrir ocorrência",
            evidence: "Relatério NCR",
            type: "report"
          }
        ]
      }
    },
    {
      id: "outputs",
      type: "mindmap",
      position: { x: 750, y: 320 },
      data: {
        label: "Saídas",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.0",
        analyticalDetails: {
          objective: "Garantir liberação apenas de peças conformes.",
          riskImpact: "Cliente receber peça NOK.",
          qualityImpact: "Confiabilidade do processo."
        },
        actionsEvidence: [
          {
            action: "Liberar lote",
            evidence: "Aprovao qualidade",
            type: "approval"
          }
        ]
      }
    },
    {
      id: "out_ok",
      type: "mindmap",
      position: { x: 1100, y: 120 },
      data: {
        label: "Peças Aprovadas",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.1",
        analyticalDetails: {
          objective: "Disponibilizar peças conformes para próxima etapa.",
          qualityImpact: "Garantia dimensional total."
        },
        actionsEvidence: [
          {
            action: "Liberar peças",
            evidence: "Etiqueta aprovado",
            type: "label"
          }
        ]
      }
    },
    {
      id: "out_nok",
      type: "mindmap",
      position: { x: 1100, y: 260 },
      data: {
        label: "Peas Não Conformes",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.2",
        analyticalDetails: {
          objective: "Segregar peças fora de tolerância.",
          riskImpact: "Mistura de material.",
          qualityImpact: "Proteo do cliente."
        },
        actionsEvidence: [
          {
            action: "Segregar material",
            evidence: "Etiqueta NOK",
            type: "label"
          }
        ]
      }
    },
    {
      id: "kpis",
      type: "mindmap",
      position: { x: 0, y: -820 },
      data: {
        label: "KPIs",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.0",
        analyticalDetails: {
          objective: "Monitorar estabilidade dimensional e performance do processo.",
          qualityImpact: "Melhoria contínua."
        },
        actionsEvidence: [
          {
            action: "Atualizar dashboard",
            evidence: "Indicadores sistema",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "kpi_ppm",
      type: "mindmap",
      position: { x: -350, y: -1080 },
      data: {
        label: "PPM Não Conformidade",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.1",
        analyticalDetails: {
          objective: "Monitorar peças NOK.",
          qualityImpact: "Reduo de falhas."
        },
        actionsEvidence: [
          {
            action: "Analisar falhas",
            evidence: "Relatério qualidade",
            type: "report"
          }
        ]
      }
    },
    {
      id: "kpi_cp",
      type: "mindmap",
      position: { x: 0, y: -1180 },
      data: {
        label: "Capabilidade Processo Cp/Cpk",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.2",
        analyticalDetails: {
          objective: "Avaliar estabilidade do processo.",
          qualityImpact: "Controle estatístico."
        },
        actionsEvidence: [
          {
            action: "Atualizar CEP",
            evidence: "Gráfico controle",
            type: "report"
          }
        ]
      }
    },
    {
      id: "kpi_refugo",
      type: "mindmap",
      position: { x: 350, y: -1080 },
      data: {
        label: "Índice de Refugo",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.3",
        analyticalDetails: {
          objective: "Monitorar perdas do processo.",
          qualityImpact: "Reduo de desperdcios."
        },
        actionsEvidence: [
          {
            action: "Registrar sucata",
            evidence: "Apontamento produção",
            type: "system_log"
          }
        ]
      }
    }
  ],
  edges: [
    {
      id: "e-root-inputs",
      source: "root",
      target: "inputs",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-resources",
      source: "root",
      target: "resources",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-people",
      source: "root",
      target: "people",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-methods",
      source: "root",
      target: "methods",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-outputs",
      source: "root",
      target: "outputs",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-kpis",
      source: "root",
      target: "kpis",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    // Inputs children
    { id: "e-inputs-in_desenho", source: "inputs", target: "in_desenho", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-inputs-in_programa", source: "inputs", target: "in_programa", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Resources children
    { id: "e-resources-res_serra", source: "resources", target: "res_serra", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-resources-res_medicao", source: "resources", target: "res_medicao", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // People children
    { id: "e-people-pe_operador", source: "people", target: "pe_operador", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Methods children
    { id: "e-methods-met_setup", source: "methods", target: "met_setup", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-methods-met_inspecao", source: "methods", target: "met_inspecao", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-methods-met_corte", source: "methods", target: "met_corte", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-methods-met_nok", source: "methods", target: "met_nok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Outputs children
    { id: "e-outputs-out_ok", source: "outputs", target: "out_ok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-outputs-out_nok", source: "outputs", target: "out_nok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // KPIs children
    { id: "e-kpis-kpi_ppm", source: "kpis", target: "kpi_ppm", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpis-kpi_cp", source: "kpis", target: "kpi_cp", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpis-kpi_refugo", source: "kpis", target: "kpi_refugo", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } }
  ]
};

export const usinagemExpFomTemplate = {
  nodes: [
    {
      id: "root",
      type: "mindmap",
      position: { x: 0, y: 0 },
      data: {
        label: "Usinagem EXP - FOM Industrie CNC",
        nodeType: "root",
        category: "root",
        numberCode: "1.0",
        analyticalDetails: {
          objective: "Padronizar a usinagem de perfis EXP em barras de 5 metros utilizando centro de usinagem CNC FOM Industrie para execução de furos, drenos e usinagens crticas com alta precisão dimensional e rastreabilidade total.",
          technicalRequirements: [
            "Usinagem CNC automatizada",
            "Controle dimensional rigoroso",
            "Execuo de furos e drenos críticos",
            "Fixao pneumtica estável",
            "Controle de vibrao e temperatura",
            "Validao contínua do setup"
          ],
          riskImpact: "Desvios podem causar infiltração, falha de montagem, retrabalho, sucata e reclamações de cliente automotivo/exportação.",
          qualityImpact: "Garante repetibilidade dimensional, alinhamento de furos e conformidade funcional dos drenos.",
          safetyRequirements: [
            "Uso obrigatório de EPI",
            "Bloqueio durante setup",
            "Não acessar ?área de movimento CNC",
            "Parada imediata em ruído anormal"
          ],
          frequency: "Operao contínua",
          responsible: "Produo, Qualidade e Engenharia de Processo"
        },
        actionsEvidence: [
          {
            action: "Monitorar processo CNC",
            evidence: "Logs da máquina FOM",
            type: "system_log"
          },
          {
            action: "Registrar produção",
            evidence: "Apontamento MES",
            type: "digital_record"
          }
        ]
      }
    },
    {
      id: "inputs",
      type: "mindmap",
      position: { x: -850, y: -320 },
      data: {
        label: "Entradas",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.0",
        analyticalDetails: {
          objective: "Garantir que materiais, programas e desenhos estejam corretos antes da usinagem.",
          technicalRequirements: [
            "Perfil correto",
            "Desenho validado",
            "Programa CNC atualizado",
            "Plano de controle aprovado"
          ],
          riskImpact: "Erro de usinagem e perda de rastreabilidade.",
          qualityImpact: "Evita produção NOK."
        },
        actionsEvidence: [
          {
            action: "Conferir documentação",
            evidence: "Checklist digital",
            type: "digital_record"
          }
        ]
      }
    },
    {
      id: "in_perfil",
      type: "mindmap",
      position: { x: -1220, y: -560 },
      data: {
        label: "Perfil EXP 5 Metros",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.1",
        analyticalDetails: {
          objective: "Garantir perfil correto para usinagem.",
          technicalRequirements: [
            "Sem empenamento",
            "Sem avarias",
            "Etiqueta legível",
            "Liga correta"
          ],
          riskImpact: "Erro dimensional e montagem incorreta.",
          qualityImpact: "Estabilidade da usinagem."
        },
        actionsEvidence: [
          {
            action: "Validar perfil",
            evidence: "Leitura código barras",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "in_cnc",
      type: "mindmap",
      position: { x: -1220, y: -400 },
      data: {
        label: "Programa CNC FOM",
        nodeType: "inputs",
        category: "inputs",
        numberCode: "2.2",
        analyticalDetails: {
          objective: "Garantir programa correto para furos e drenos.",
          technicalRequirements: [
            "Offsets atualizados",
            "Ferramentas corretas",
            "Sequência validada"
          ],
          riskImpact: "Furos deslocados e drenos incorretos.",
          qualityImpact: "Preciso do processo."
        },
        actionsEvidence: [
          {
            action: "Validar CNC",
            evidence: "Print tela máquina",
            type: "image"
          }
        ]
      }
    },
    {
      id: "resources",
      type: "mindmap",
      position: { x: -850, y: 350 },
      data: {
        label: "Recursos",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.0",
        analyticalDetails: {
          objective: "Disponibilizar equipamentos e instrumentos adequados para usinagem crítica.",
          riskImpact: "Variao dimensional e falha funcional.",
          qualityImpact: "Maior estabilidade operacional."
        },
        actionsEvidence: [
          {
            action: "Liberar máquina",
            evidence: "Checklist setup",
            type: "inspection"
          }
        ]
      }
    },
    {
      id: "res_fom",
      type: "mindmap",
      position: { x: -1220, y: 80 },
      data: {
        label: "Centro CNC FOM Industrie",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.1",
        analyticalDetails: {
          objective: "Executar furos, drenos e usinagens automáticas com alta repetibilidade.",
          technicalRequirements: [
            "Fixao pneumtica",
            "Controle multi-eixos",
            "Lubrificao automtica",
            "Ferramentas calibradas"
          ],
          riskImpact: "Desalinhamento e falhas funcionais.",
          qualityImpact: "Preciso repetitiva do processo."
        },
        actionsEvidence: [
          {
            action: "Inspecionar máquina",
            evidence: "Checklist eletrônico",
            type: "inspection"
          }
        ]
      }
    },
    {
      id: "res_tool",
      type: "mindmap",
      position: { x: -1220, y: 250 },
      data: {
        label: "Ferramentas de Usinagem",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.2",
        analyticalDetails: {
          objective: "Garantir integridade das ferramentas CNC.",
          technicalRequirements: [
            "Brocas íntegras",
            "Fresas afiadas",
            "Sem desgaste excessivo"
          ],
          riskImpact: "Rebarba e desvio dimensional.",
          qualityImpact: "Acabamento e precisão."
        },
        actionsEvidence: [
          {
            action: "Validar desgaste",
            evidence: "Foto ferramenta",
            type: "image"
          }
        ]
      }
    },
    {
      id: "res_metrology",
      type: "mindmap",
      position: { x: -1220, y: 420 },
      data: {
        label: "Metrologia Calibrada",
        nodeType: "resources",
        category: "resources",
        numberCode: "4.3",
        analyticalDetails: {
          objective: "Garantir medições confiáveis.",
          technicalRequirements: [
            "Paquímetro calibrado",
            "Gabaritos aprovados",
            "Etiqueta válida"
          ],
          riskImpact: "Liberao incorreta.",
          qualityImpact: "Controle dimensional robusto."
        },
        actionsEvidence: [
          {
            action: "Validar calibração",
            evidence: "Etiqueta INMETRO",
            type: "image"
          }
        ]
      }
    },
    {
      id: "people",
      type: "mindmap",
      position: { x: 850, y: -320 },
      data: {
        label: "Pessoas",
        nodeType: "people",
        category: "people",
        numberCode: "5.0",
        analyticalDetails: {
          objective: "Definir responsabilidades críticas da usinagem.",
          riskImpact: "Falha operacional.",
          qualityImpact: "Padronizao da operação."
        },
        actionsEvidence: [
          {
            action: "Registrar operador",
            evidence: "Login operador",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "pe_operador",
      type: "mindmap",
      position: { x: 1220, y: -560 },
      data: {
        label: "Operador CNC Especialista",
        nodeType: "people",
        category: "people",
        numberCode: "5.1",
        analyticalDetails: {
          objective: "Executar usinagem conforme plano de controle.",
          technicalRequirements: [
            "Treinamento FOM",
            "Leitura de desenho",
            "Conhecimento de tolerncias"
          ],
          riskImpact: "Erro operacional.",
          qualityImpact: "Estabilidade do processo."
        },
        actionsEvidence: [
          {
            action: "Validar treinamento",
            evidence: "Registro RH",
            type: "document"
          }
        ]
      }
    },
    {
      id: "methods",
      type: "mindmap",
      position: { x: 0, y: 780 },
      data: {
        label: "Métodos Operacionais",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.0",
        analyticalDetails: {
          objective: "Padronizar execução da usinagem crítica.",
          riskImpact: "Falhas funcionais.",
          qualityImpact: "Preciso e repetibilidade."
        },
        actionsEvidence: [
          {
            action: "Auditar operação",
            evidence: "Checklist auditoria",
            type: "inspection"
          }
        ]
      }
    },
    {
      id: "met_setup",
      type: "mindmap",
      position: { x: -620, y: 1080 },
      data: {
        label: "1. Realizar Setup Técnico",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.1",
        analyticalDetails: {
          objective: "Garantir estabilidade dimensional antes da produção.",
          technicalRequirements: [
            "Fixao correta",
            "Validar offsets",
            "Testar ferramentas",
            "Executar peça piloto"
          ],
          riskImpact: "Furos deslocados e medidas incorretas.",
          qualityImpact: "Controle inicial do processo."
        },
        actionsEvidence: [
          {
            action: "Liberar setup",
            evidence: "Aprovao qualidade",
            type: "approval"
          },
          {
            action: "Executar peça piloto",
            evidence: "Relatério dimensional",
            type: "measurement"
          }
        ]
      }
    },
    {
      id: "met_drain",
      type: "mindmap",
      position: { x: -180, y: 1080 },
      data: {
        label: "2. Executar Furos e Drenos",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.2",
        analyticalDetails: {
          objective: "Executar usinagens críticas conforme desenho EXP.",
          technicalRequirements: [
            "Posicionamento exato",
            "Profundidade correta",
            "Sem rebarba",
            "Controle de alinhamento"
          ],
          riskImpact: "Falha de drenagem e montagem.",
          qualityImpact: "Conformidade funcional."
        },
        actionsEvidence: [
          {
            action: "Validar drenos",
            evidence: "Foto usinagem",
            type: "image"
          },
          {
            action: "Registrar produção",
            evidence: "Log CNC",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "met_100",
      type: "mindmap",
      position: { x: 260, y: 1080 },
      data: {
        label: "3. Inspeo 100% Dimensional",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.3",
        analyticalDetails: {
          objective: "Garantir conformidade total das cotas críticas.",
          technicalRequirements: [
            "Medir todos os furos",
            "Validar posição dos drenos",
            "Registrar medidas"
          ],
          riskImpact: "Peça NOK enviada ao cliente.",
          qualityImpact: "Garantia dimensional total."
        },
        actionsEvidence: [
          {
            action: "Registrar medições",
            evidence: "Planilha inspeção",
            type: "measurement"
          },
          {
            action: "Anexar fotos",
            evidence: "Foto paquímetro",
            type: "image"
          }
        ]
      }
    },
    {
      id: "met_nok",
      type: "mindmap",
      position: { x: 700, y: 1080 },
      data: {
        label: "4. Tratativa NOK",
        nodeType: "methods",
        category: "methods",
        numberCode: "6.4",
        analyticalDetails: {
          objective: "Bloquear imediatamente peças fora de especificação.",
          technicalRequirements: [
            "Segregar lote",
            "Identificar NOK",
            "Abrir ocorrência"
          ],
          riskImpact: "Mistura de peças conformes e NOK.",
          qualityImpact: "Proteo do cliente."
        },
        actionsEvidence: [
          {
            action: "Abrir NCR",
            evidence: "Relatério qualidade",
            type: "report"
          }
        ]
      }
    },
    {
      id: "outputs",
      type: "mindmap",
      position: { x: 850, y: 350 },
      data: {
        label: "Saídas",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.0",
        analyticalDetails: {
          objective: "Garantir liberação apenas de peças conformes.",
          riskImpact: "Cliente receber peça NOK.",
          qualityImpact: "Confiabilidade total do processo."
        },
        actionsEvidence: [
          {
            action: "Liberar lote",
            evidence: "Etiqueta aprovado",
            type: "approval"
          }
        ]
      }
    },
    {
      id: "out_ok",
      type: "mindmap",
      position: { x: 1220, y: 120 },
      data: {
        label: "Peças Usinadas OK",
        nodeType: "outputs",
        category: "outputs",
        numberCode: "3.1",
        analyticalDetails: {
          objective: "Disponibilizar peças conformes para montagem.",
          qualityImpact: "Garantia funcional e dimensional."
        },
        actionsEvidence: [
          {
            action: "Liberar produção",
            evidence: "Etiqueta aprovado",
            type: "label"
          }
        ]
      }
    },
    {
      id: "kpis",
      type: "mindmap",
      position: { x: 0, y: -900 },
      data: {
        label: "KPIs",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.0",
        analyticalDetails: {
          objective: "Monitorar estabilidade e performance da usinagem.",
          qualityImpact: "Melhoria contínua."
        },
        actionsEvidence: [
          {
            action: "Atualizar dashboard",
            evidence: "Indicadores MES",
            type: "system_log"
          }
        ]
      }
    },
    {
      id: "kpi_cp",
      type: "mindmap",
      position: { x: -420, y: -1180 },
      data: {
        label: "Capabilidade Cp/Cpk",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.1",
        analyticalDetails: {
          objective: "Avaliar estabilidade dimensional do processo.",
          qualityImpact: "Controle estatístico robusto."
        },
        actionsEvidence: [
          {
            action: "Atualizar CEP",
            evidence: "Gráfico controle",
            type: "report"
          }
        ]
      }
    },
    {
      id: "kpi_rebarba",
      type: "mindmap",
      position: { x: 0, y: -1280 },
      data: {
        label: "Índice de Rebarba",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.2",
        analyticalDetails: {
          objective: "Monitorar acabamento da usinagem.",
          qualityImpact: "Melhor acabamento funcional."
        },
        actionsEvidence: [
          {
            action: "Registrar defeitos",
            evidence: "Relatério qualidade",
            type: "report"
          }
        ]
      }
    },
    {
      id: "kpi_nok",
      type: "mindmap",
      position: { x: 420, y: -1180 },
      data: {
        label: "PPM Não Conformidade",
        nodeType: "kpis",
        category: "kpis",
        numberCode: "7.3",
        analyticalDetails: {
          objective: "Monitorar falhas críticas.",
          qualityImpact: "Reduo de reclamações."
        },
        actionsEvidence: [
          {
            action: "Analisar ocorrências",
            evidence: "Dashboard qualidade",
            type: "report"
          }
        ]
      }
    }
  ],
  edges: [
    {
      id: "e-root-inputs",
      source: "root",
      target: "inputs",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-resources",
      source: "root",
      target: "resources",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-people",
      source: "root",
      target: "people",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-methods",
      source: "root",
      target: "methods",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-outputs",
      source: "root",
      target: "outputs",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    {
      id: "e-root-kpis",
      source: "root",
      target: "kpis",
      animated: true,
      type: "smoothstep",
      style: {
        stroke: "#60a5fa",
        strokeWidth: 2
      }
    },
    // Inputs children
    { id: "e-inputs-in_perfil", source: "inputs", target: "in_perfil", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-inputs-in_cnc", source: "inputs", target: "in_cnc", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Resources children
    { id: "e-resources-res_fom", source: "resources", target: "res_fom", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-resources-res_tool", source: "resources", target: "res_tool", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-resources-res_metrology", source: "resources", target: "res_metrology", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // People children
    { id: "e-people-pe_operador", source: "people", target: "pe_operador", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Methods children
    { id: "e-methods-met_setup", source: "methods", target: "met_setup", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-methods-met_drain", source: "methods", target: "met_drain", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-methods-met_100", source: "methods", target: "met_100", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-methods-met_nok", source: "methods", target: "met_nok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // Outputs children
    { id: "e-outputs-out_ok", source: "outputs", target: "out_ok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    // KPIs children
    { id: "e-kpis-kpi_cp", source: "kpis", target: "kpi_cp", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpis-kpi_rebarba", source: "kpis", target: "kpi_rebarba", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } },
    { id: "e-kpis-kpi_nok", source: "kpis", target: "kpi_nok", style: { stroke: "#334155", strokeWidth: 1.5, strokeDasharray: 4 } }
  ]
};

export const initialNodes: Node[] = [
  // ROOT
  { id: 'root', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Processo Principal', nodeType: 'root', category: 'root', numberCode: '1.0' } },

  // BRANCHES
  { id: 'inputs',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Entradas',              nodeType: 'inputs',    category: 'inputs', numberCode: '2.0' } },
  { id: 'outputs',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Saídas',                nodeType: 'outputs',   category: 'outputs', numberCode: '3.0' } },
  { id: 'resources', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Recursos / Com o quê', nodeType: 'resources', category: 'resources', numberCode: '4.0' } },
  { id: 'people',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Pessoas / Quem?',       nodeType: 'people',    category: 'people', numberCode: '5.0' } },
  { id: 'methods',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Métodos / Como',       nodeType: 'methods',   category: 'methods', numberCode: '6.0' } },
  { id: 'kpis',      type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Indicadores / Medições',nodeType: 'kpis',      category: 'kpis', numberCode: '7.0' } },
  { id: 'safety',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Segurança do Trabalho', nodeType: 'methods',   category: 'methods', numberCode: '8.0' } },
  { id: 'quality',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Controle de Qualidade', nodeType: 'kpis',      category: 'kpis', numberCode: '9.0' } },

  // INPUTS CHILDREN  Seo 5 e 6 do POP
  { id: 'in_op',     type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Ordem de Produo (OP)', category: 'inputs', numberCode: '2.1' } },
  { id: 'in_mat',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Matéria Prima conferida', category: 'inputs', numberCode: '2.2' } },
  { id: 'in_draw',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Desenho Tcnico (medidas, tolerncias)', category: 'inputs', numberCode: '2.3' } },
  { id: 'in_prog',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Programa selecionado', category: 'inputs', numberCode: '2.4' } },

  // OUTPUTS CHILDREN  Seo 11 do POP
  { id: 'out_ok',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Peças Boas Identificadas', category: 'outputs', numberCode: '3.1' } },
  { id: 'out_nc',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Peças de Retrabalho Segregadas', category: 'outputs', numberCode: '3.2' } },
  { id: 'out_scrap', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Sucata / Descarte', category: 'outputs', numberCode: '3.3' } },
  { id: 'out_apo',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Apontamento Registrado', category: 'outputs', numberCode: '3.4' } },

  // RESOURCES CHILDREN  Seo 2 e 7 do POP
  { id: 'res_serra_auto',  type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Serra Automática', category: 'resources' } },
  { id: 'res_serra_dupla', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Serra Dupla', category: 'resources' } },
  { id: 'res_cnc',         type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Centro de Usinagem', category: 'resources' } },
  { id: 'res_gages',       type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Instrumentos de Medio', category: 'resources' } },

  // PEOPLE CHILDREN  Seo 3 do POP
  { id: 'peo_sup',  type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Supervisor', category: 'people' } },
  { id: 'peo_op',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Operador (Treinado)', category: 'people' } },
  { id: 'peo_aux',  type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Auxiliar de Produo', category: 'people' } },
  { id: 'peo_qual', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Qualidade / Suporte', category: 'people' } },

  // METHODS CHILDREN  Seções 7, 8 do POP
  { id: 'met_prep_serra', type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Preparao das Serras', category: 'methods' } },
  { id: 'met_prep_cnc',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Preparao CNC', category: 'methods' } },
  { id: 'met_op_serra',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Operao nas Serras', category: 'methods' } },
  { id: 'met_op_cnc',     type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Operao no CNC', category: 'methods' } },
  { id: 'met_nc',         type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Tratamento de Não Conformidades', category: 'methods' } },
  { id: 'met_kaizen',     type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Melhoria Contnua (sugestes, redução de perdas)', category: 'methods' } },

  // SAFETY CHILDREN  Seo 4 do POP
  { id: 'saf_epi',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'EPIs: óculos, Protetor Auricular, Luvas anticorte, Calçado', category: 'methods' } },
  { id: 'saf_reg1',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Proibido operar sem treinamento', category: 'methods' } },
  { id: 'saf_reg2',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Nunca remover proteções de segurança', category: 'methods' } },
  { id: 'saf_reg3',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Nunca medir peças com máquina em funcionamento', category: 'methods' } },

  // QUALITY CHILDREN  Seo 9 do POP
  { id: 'qua_first',  type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Medir primeiras peças', category: 'kpis' } },
  { id: 'qua_comp',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Conferir medidas', category: 'kpis' } },
  { id: 'qua_draw',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Comparar com Desenho', category: 'kpis' } },
  { id: 'qua_seg',    type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Segregar peças fora de espec.', category: 'kpis' } },

  // KPIS CHILDREN  Seo 10 do POP
  { id: 'kpi_prod',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Quantidade Produzida', category: 'kpis' } },
  { id: 'kpi_scrap',  type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Índice de Refugo', category: 'kpis' } },
  { id: 'kpi_stop',   type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Paradas de Máquina', category: 'kpis' } },
  { id: 'kpi_5s',     type: 'mindmap', position: { x: 0, y: 0 }, data: { label: 'Organizao 5S ao final da OP', category: 'kpis' } },
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
