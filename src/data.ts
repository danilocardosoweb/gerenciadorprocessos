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
        label: "Instrução de Trabalho - Serra Doppia 2 Cabeças",
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
        label: "Ordem de Produção",
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
        label: "Líder de Produção",
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
        label: "Técnico de Manutenção",
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
        label: "2. Configurar Medidas e Ângulos",
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
        label: "OK: Encaminhar Produção",
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
        label: "4. Registrar Produção e Rastreabilidade",
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
        label: "Instrução de Trabalho - Serra Emmegi Automática 1 Cabeça",
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
        label: "Ordem de Produção",
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
        label: "Líder de Produção",
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
        label: "Técnico de Manutenção",
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
        label: "NOK: Acionar Manutenção",
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
        label: "3. Ajustar Batente e Fixação",
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
        label: "OK: Liberar Produção",
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
        label: "Registro de Produção",
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
