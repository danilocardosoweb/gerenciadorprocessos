import * as mammoth from 'mammoth';
import { getLayoutedElements } from '../lib/layout';

const apiKey = (process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '') as string;

export interface MindMapNode {
  id: string;
  type: 'mindmap';
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType?: string;
    category?: string;
    numberCode?: string;
  };
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  type?: string;
  style?: {
    stroke: string;
    strokeWidth: number;
    strokeDasharray?: string;
  };
}

export interface GeneratedMap {
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export async function generateMindMapFromText(
  text: string,
  fileName: string
): Promise<GeneratedMap> {
  const prompt = `Analise o seguinte documento e crie uma estrutura de mapa mental organizada.

Documento:
${text}

INSTRUÇÕES:
1. Crie um nó raiz com o título principal do processo
2. Organize o conteúdo nas seguintes categorias principais:
   - inputs (Entradas)
   - outputs (Saídas)
   - resources (Recursos / Com o quê?)
   - people (Pessoas / Quem?)
   - methods (Métodos / Como?)
   - kpis (Indicadores / Medições)
   - safety (Segurança do Trabalho)
   - quality (Controle de Qualidade)
3. Para cada categoria, crie nós filhos com os itens específicos encontrados no texto
4. Use códigos numéricos hierárquicos (1.0, 2.0, 2.1, etc.) para organizar

RETORNE APENAS JSON válido no seguinte formato:
{
  "title": "Título do Processo",
  "nodes": [
    { "id": "root", "type": "mindmap", "position": { "x": 0, "y": 0 }, "data": { "label": "Processo Principal", "nodeType": "root", "category": "root", "numberCode": "1.0" } },
    { "id": "inputs", "type": "mindmap", "position": { "x": 0, "y": 0 }, "data": { "label": "Entradas", "nodeType": "inputs", "category": "inputs", "numberCode": "2.0" } },
    ...
  ],
  "edges": [
    { "id": "e-root-inputs", "source": "root", "target": "inputs", "animated": true, "type": "smoothstep", "style": { "stroke": "#60a5fa", "strokeWidth": 2 } },
    ...
  ]
}

IMPORTANTE:
- Retorne APENAS JSON válido, sem texto adicional
- Use ids únicos e descritivos
- Mantenha a estrutura hierárquica clara
- As posições (x, y) podem ser 0,0 pois serão calculadas pelo layout automático`;

  try {
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY não configurada no .env');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No text in response from Gemini');
    }

    // Extrair JSON da resposta (pode ter markdown code blocks)
    const jsonMatch = generatedText.match(/```json\n?([\s\S]*?)\n?```/) || generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const generatedMap: GeneratedMap = JSON.parse(jsonStr);

    // Validação básica
    if (!generatedMap.nodes || !generatedMap.edges) {
      throw new Error('Invalid map structure: missing nodes or edges');
    }

    return generatedMap;
  } catch (error) {
    console.error('Error generating mind map:', error);
    throw new Error('Failed to generate mind map from document');
  }
}

// Hardcoded Corte em Serras map for reliability
export function getCorteSerrasMindMapHardcoded(): GeneratedMap {
  const title = "Operação de Corte em Serras - Controle de Qualidade";
  
  const nodes = [
    // Root
    { id: "root", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Operação de Corte em Serras", nodeType: "root", category: "root", numberCode: "1.0" } },
    
    // ENTRADAS
    { id: "in_material", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Material a Ser Cortado (Perfil/Alumínio/Aço)", nodeType: "inputs", category: "inputs", numberCode: "2.0" } },
    { id: "in_op", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Ordem de Produção (OP) - Documento Principal", nodeType: "inputs", category: "inputs", numberCode: "2.1" } },
    { id: "in_desenho", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Desenho Técnico do Corte - Especificações", nodeType: "inputs", category: "inputs", numberCode: "2.2" } },
    
    // ETAPA 1: PREPARAÇÃO
    { id: "e1_lamina", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Lâmina de Serra - Seleção e Inspeção", nodeType: "methods", category: "methods", numberCode: "3.0" } },
    { id: "e1_coolant", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Sistema de Coolant - Refrigeração/Lubrificação", nodeType: "methods", category: "methods", numberCode: "3.1" } },
    { id: "e1_calibracao", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Calibração do Stop de Medida - Precisão", nodeType: "methods", category: "methods", numberCode: "3.2" } },
    { id: "e1_limpeza", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Limpeza da Máquina - Preparação", nodeType: "methods", category: "methods", numberCode: "3.3" } },
    
    // ETAPA 2: SETUP
    { id: "e2_medicao_material", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Medição do Material Inicial - Conferência", nodeType: "methods", category: "methods", numberCode: "4.0" } },
    { id: "e2_setup_stop", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Ajuste do Stop de Medida - Configuração", nodeType: "methods", category: "methods", numberCode: "4.1" } },
    { id: "e2_primeira_peca", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Corte da Peça Piloto - Validação Inicial", nodeType: "methods", category: "methods", numberCode: "4.2" } },
    
    // ETAPA 3: INSPEÇÃO PILOTO (QUALITY)
    { id: "e3_medicao", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Medição Dimensional Completa - Paquímetro/Trena", nodeType: "quality", category: "quality", numberCode: "5.0" } },
    { id: "e3_visual", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Inspeção Visual da Qualidade - Rebarbas/Acabamento", nodeType: "quality", category: "quality", numberCode: "5.1" } },
    { id: "e3_tolerancias", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Análise de Tolerâncias - ±0.5mm ou ±0.2mm", nodeType: "quality", category: "quality", numberCode: "5.2" } },
    { id: "e3_aprovacao", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Aprovação da Peça Piloto - Liberação", nodeType: "quality", category: "quality", numberCode: "5.3" } },
    
    // ETAPA 4: PRODUÇÃO
    { id: "e4_corte", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Corte Contínuo Monitorado - Produção", nodeType: "methods", category: "methods", numberCode: "6.0" } },
    { id: "e4_monitoramento", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Monitoramento de Qualidade - Observação Constante", nodeType: "methods", category: "methods", numberCode: "6.1" } },
    { id: "e4_lubrificacao", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Controle de Lubrificação - Coolant Durante Corte", nodeType: "methods", category: "methods", numberCode: "6.2" } },
    
    // ETAPA 5: INSPEÇÃO DURANTE PRODUÇÃO
    { id: "e5_amostragem", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Amostragem Dimensional - Cada 10 Peças", nodeType: "quality", category: "quality", numberCode: "7.0" } },
    { id: "e5_visual_continua", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Inspeção Visual Contínua - 100% ou Amostral", nodeType: "quality", category: "quality", numberCode: "7.1" } },
    { id: "e5_conferencia_op", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Conferência com OP - Rastreabilidade", nodeType: "quality", category: "quality", numberCode: "7.2" } },
    
    // ETAPA 6: ACABAMENTO
    { id: "e6_desbarbar", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Desbaste de Rebarbas - Acabamento", nodeType: "methods", category: "methods", numberCode: "8.0" } },
    { id: "e6_limpeza_pecas", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Limpeza das Peças - Pós-Corte", nodeType: "methods", category: "methods", numberCode: "8.1" } },
    { id: "e6_identificacao", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Identificação das Peças - Rastreabilidade", nodeType: "methods", category: "methods", numberCode: "8.2" } },
    { id: "e6_organizacao", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Organização para Próxima Etapa - Armazenamento", nodeType: "methods", category: "methods", numberCode: "8.3" } },
    
    // ETAPA 7: INSPEÇÃO FINAL
    { id: "e7_inspe_final", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Inspeção Final 100% ou Amostral - Validação", nodeType: "quality", category: "quality", numberCode: "9.0" } },
    { id: "e7_ficha", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Ficha de Inspeção Preenchida - Documentação", nodeType: "quality", category: "quality", numberCode: "9.1" } },
    { id: "e7_liberacao", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Liberação para Próxima Etapa - Aprovação", nodeType: "quality", category: "quality", numberCode: "9.2" } },
    
    // SEGURANÇA
    { id: "seg_epi", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Uso de EPIs - Óculos, Luvas, Protetor Auricular", nodeType: "safety", category: "safety", numberCode: "10.0" } },
    { id: "seg_protecao", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Proteções da Máquina - Guardas e Emergência", nodeType: "safety", category: "safety", numberCode: "10.1" } },
    { id: "seg_manuseio", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Manuseio Seguro de Materiais Longos - Ergonomia", nodeType: "safety", category: "safety", numberCode: "10.2" } },
    
    // IATF/QUALIDADE
    { id: "iatf_rastreabilidade", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Rastreabilidade do Lote - Identificação", nodeType: "compliance", category: "compliance", numberCode: "11.0" } },
    { id: "iatf_spc", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Controle Estatístico do Processo (SPC) - Cp/Cpk", nodeType: "compliance", category: "compliance", numberCode: "11.1" } },
    { id: "iatf_instrucao", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Instrução de Trabalho Atualizada - Procedimento", nodeType: "compliance", category: "compliance", numberCode: "11.2" } },
    
    // KPIs
    { id: "kpi_cpk", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Cpk (Capacidade do Processo) - Índice", nodeType: "kpis", category: "kpis", numberCode: "12.0" } },
    { id: "kpi_scrap", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Taxa de Refugo (Scrap) - Percentual", nodeType: "kpis", category: "kpis", numberCode: "12.1" } },
    { id: "kpi_produtividade", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Produtividade (Peças/Hora) - Eficiência", nodeType: "kpis", category: "kpis", numberCode: "12.2" } },
    { id: "kpi_conformidade", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Conformidade Dimensional - % Dentro Tolerância", nodeType: "kpis", category: "kpis", numberCode: "12.3" } },
    
    // SAÍDAS
    { id: "out_pecas", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Peças Cortadas Aprovadas - Produto", nodeType: "outputs", category: "outputs", numberCode: "13.0" } },
    { id: "out_documentacao", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Documentação de Qualidade - Registros", nodeType: "outputs", category: "outputs", numberCode: "13.1" } },
    { id: "out_rebarbas", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Aparas para Reciclagem - Resíduos", nodeType: "outputs", category: "outputs", numberCode: "13.2" } },
    { id: "out_maquina", type: "mindmap", position: { x: 0, y: 0 }, data: { label: "Máquina Liberada - Status", nodeType: "outputs", category: "outputs", numberCode: "13.3" } },
  ];
  
  const edges = [
    // Root to categories
    { id: "e-root-in_material", source: "root", target: "in_material", animated: true, type: "smoothstep", style: { stroke: "#60a5fa", strokeWidth: 2 } },
    { id: "e-root-e1_lamina", source: "root", target: "e1_lamina", animated: true, type: "smoothstep", style: { stroke: "#60a5fa", strokeWidth: 2 } },
    { id: "e-root-seg_epi", source: "root", target: "seg_epi", animated: true, type: "smoothstep", style: { stroke: "#60a5fa", strokeWidth: 2 } },
    { id: "e-root-iatf_rastreabilidade", source: "root", target: "iatf_rastreabilidade", animated: true, type: "smoothstep", style: { stroke: "#60a5fa", strokeWidth: 2 } },
    { id: "e-root-kpi_cpk", source: "root", target: "kpi_cpk", animated: true, type: "smoothstep", style: { stroke: "#60a5fa", strokeWidth: 2 } },
    { id: "e-root-out_pecas", source: "root", target: "out_pecas", animated: true, type: "smoothstep", style: { stroke: "#60a5fa", strokeWidth: 2 } },
    
    // Inputs connections
    { id: "e-in_material-in_op", source: "in_material", target: "in_op", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    { id: "e-in_op-in_desenho", source: "in_op", target: "in_desenho", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    
    // Etapa 1 connections
    { id: "e-e1_lamina-e1_coolant", source: "e1_lamina", target: "e1_coolant", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    { id: "e-e1_coolant-e1_calibracao", source: "e1_coolant", target: "e1_calibracao", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    { id: "e-e1_calibracao-e1_limpeza", source: "e1_calibracao", target: "e1_limpeza", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    
    // Etapa 2 connections
    { id: "e-e2_medicao-e2_setup", source: "e2_medicao_material", target: "e2_setup_stop", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    { id: "e-e2_setup-e2_primeira", source: "e2_setup_stop", target: "e2_primeira_peca", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    
    // Etapa 3 connections
    { id: "e-e3_medicao-e3_visual", source: "e3_medicao", target: "e3_visual", type: "smoothstep", style: { stroke: "#f472b6", strokeWidth: 2 } },
    { id: "e-e3_visual-e3_tolerancias", source: "e3_visual", target: "e3_tolerancias", type: "smoothstep", style: { stroke: "#f472b6", strokeWidth: 2 } },
    { id: "e-e3_tolerancias-e3_aprovacao", source: "e3_tolerancias", target: "e3_aprovacao", type: "smoothstep", style: { stroke: "#f472b6", strokeWidth: 2 } },
    
    // Etapa 4 connections
    { id: "e-e4_corte-e4_monitor", source: "e4_corte", target: "e4_monitoramento", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    { id: "e-e4_monitor-e4_lub", source: "e4_monitoramento", target: "e4_lubrificacao", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    
    // Etapa 5 connections
    { id: "e-e5_amostragem-e5_visual", source: "e5_amostragem", target: "e5_visual_continua", type: "smoothstep", style: { stroke: "#f472b6", strokeWidth: 2 } },
    { id: "e-e5_visual-e5_op", source: "e5_visual_continua", target: "e5_conferencia_op", type: "smoothstep", style: { stroke: "#f472b6", strokeWidth: 2 } },
    
    // Etapa 6 connections
    { id: "e-e6_desbarbar-e6_limpeza", source: "e6_desbarbar", target: "e6_limpeza_pecas", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    { id: "e-e6_limpeza-e6_id", source: "e6_limpeza_pecas", target: "e6_identificacao", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    { id: "e-e6_id-e6_org", source: "e6_identificacao", target: "e6_organizacao", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    
    // Etapa 7 connections
    { id: "e-e7_inspe-e7_ficha", source: "e7_inspe_final", target: "e7_ficha", type: "smoothstep", style: { stroke: "#f472b6", strokeWidth: 2 } },
    { id: "e-e7_ficha-e7_lib", source: "e7_ficha", target: "e7_liberacao", type: "smoothstep", style: { stroke: "#f472b6", strokeWidth: 2 } },
    
    // Safety connections
    { id: "e-seg_epi-seg_prot", source: "seg_epi", target: "seg_protecao", type: "smoothstep", style: { stroke: "#fbbf24", strokeWidth: 2 } },
    { id: "e-seg_prot-seg_man", source: "seg_protecao", target: "seg_manuseio", type: "smoothstep", style: { stroke: "#fbbf24", strokeWidth: 2 } },
    
    // IATF connections
    { id: "e-iatf_rast-iatf_spc", source: "iatf_rastreabilidade", target: "iatf_spc", type: "smoothstep", style: { stroke: "#a78bfa", strokeWidth: 1 } },
    { id: "e-iatf_spc-iatf_inst", source: "iatf_spc", target: "iatf_instrucao", type: "smoothstep", style: { stroke: "#a78bfa", strokeWidth: 1 } },
    
    // KPI connections
    { id: "e-kpi_cpk-kpi_scrap", source: "kpi_cpk", target: "kpi_scrap", type: "smoothstep", style: { stroke: "#34d399", strokeWidth: 1 } },
    { id: "e-kpi_scrap-kpi_prod", source: "kpi_scrap", target: "kpi_produtividade", type: "smoothstep", style: { stroke: "#34d399", strokeWidth: 1 } },
    { id: "e-kpi_prod-kpi_conf", source: "kpi_produtividade", target: "kpi_conformidade", type: "smoothstep", style: { stroke: "#34d399", strokeWidth: 1 } },
    
    // Output connections
    { id: "e-out_pecas-out_doc", source: "out_pecas", target: "out_documentacao", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    { id: "e-out_doc-out_reb", source: "out_documentacao", target: "out_rebarbas", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
    { id: "e-out_reb-out_maq", source: "out_rebarbas", target: "out_maquina", type: "smoothstep", style: { stroke: "#94a3b8", strokeWidth: 1 } },
  ];
  
  // Apply layout to nodes for proper positioning
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodes,
    edges,
    'LR'
  );
  
  return { title, nodes: layoutedNodes as MindMapNode[], edges: layoutedEdges as MindMapEdge[] };
}

export async function generateCorteSerrasMindMap(): Promise<GeneratedMap> {
  // Use hardcoded version directly for reliability
  console.log('Using hardcoded Corte em Serras map for reliability');
  return getCorteSerrasMindMapHardcoded();
}

// Extract text from files for AI processing
export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // TXT files
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await file.text();
  }

  // PDF files - extract text using pdfjs-dist
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      if (!fullText.trim()) {
        throw new Error('PDF sem texto extraível (pode ser uma imagem). Use o campo de texto manual.');
      }
      
      return fullText;
    } catch (error: any) {
      console.error('PDF extraction error:', error);
      throw new Error(error.message || 'Falha ao extrair texto do PDF. Use o campo de texto manual.');
    }
  }

  // DOCX files using mammoth
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('Error extracting DOCX:', error);
      throw new Error('Failed to extract text from DOCX file. Please try converting to TXT or use "Colar Texto" option.');
    }
  }

  // DOC (old format) - not supported natively
  if (fileName.endsWith('.doc')) {
    throw new Error('Formato .doc antigo não suportado. Salve como .docx ou .txt e tente novamente.');
  }

  throw new Error('Formato de arquivo não suportado. Use .pdf, .docx ou .txt, ou cole o texto manualmente.');
}
