import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { repairMojibake } from './textEncoding';

const PAGE_WIDTH = 9638;
const BLUE = '153B6F';
const DARK_BLUE = '10233F';
const LIGHT_BLUE = 'EAF2FB';
const LIGHT_GRAY = 'F2F4F7';
const GRAY = '667085';
const GREEN = '067647';
const RED = 'B42318';
const AMBER = 'B54708';

export interface WordDocumentOptions {
  mapTitle: string;
  documentCode: string;
  revision: string;
  sector: string;
  equipment: string;
  preparedBy: string;
  approvedBy: string;
  effectiveDate: string;
  includeTechnical: boolean;
  includeTasks: boolean;
  includeRecords: boolean;
  includeTroubleshooting: boolean;
  nodes: any[];
  edges: any[];
  nodeDetails: Record<string, any>;
}

interface HierarchyEntry {
  node: any;
  depth: number;
}

const clean = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return repairMojibake(value).trim() || fallback;
};

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => clean(item)).filter(Boolean) : [];

const codeParts = (value: unknown) => clean(value)
  .split('.')
  .map((part) => Number.parseInt(part.replace(/\D/g, ''), 10))
  .map((part) => (Number.isFinite(part) ? part : Number.MAX_SAFE_INTEGER));

const compareNodes = (a: any, b: any) => {
  const aCode = codeParts(a?.data?.numberCode);
  const bCode = codeParts(b?.data?.numberCode);
  const length = Math.max(aCode.length, bCode.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (aCode[index] ?? -1) - (bCode[index] ?? -1);
    if (difference) return difference;
  }
  return clean(a?.data?.label).localeCompare(clean(b?.data?.label), 'pt-BR');
};

const buildHierarchy = (nodes: any[], edges: any[]): HierarchyEntry[] => {
  const validNodes = nodes.filter((node) => node?.id && node?.data);
  const nodeMap = new Map(validNodes.map((node) => [node.id, node]));
  const children = new Map<string, string[]>();
  const parentIds = new Set<string>();

  edges.forEach((edge) => {
    if (!edge?.source || !edge?.target || !nodeMap.has(edge.source) || !nodeMap.has(edge.target)) return;
    children.set(edge.source, [...(children.get(edge.source) || []), edge.target]);
    parentIds.add(edge.target);
  });

  const roots = validNodes.filter((node) => !parentIds.has(node.id)).sort(compareNodes);
  const ordered: HierarchyEntry[] = [];
  const visited = new Set<string>();

  const visit = (node: any, depth: number) => {
    if (!node || visited.has(node.id)) return;
    visited.add(node.id);
    ordered.push({ node, depth });
    (children.get(node.id) || [])
      .map((id) => nodeMap.get(id))
      .filter(Boolean)
      .sort(compareNodes)
      .forEach((child) => visit(child, depth + 1));
  };

  roots.forEach((root) => visit(root, 0));
  validNodes.filter((node) => !visited.has(node.id)).sort(compareNodes).forEach((node) => visit(node, 1));
  return ordered;
};

const borders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: 'B8C2CE' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'B8C2CE' },
  left: { style: BorderStyle.SINGLE, size: 4, color: 'B8C2CE' },
  right: { style: BorderStyle.SINGLE, size: 4, color: 'B8C2CE' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 3, color: 'D0D5DD' },
  insideVertical: { style: BorderStyle.SINGLE, size: 3, color: 'D0D5DD' },
};

const cell = (text: string, width: number, options?: { bold?: boolean; fill?: string; color?: string }) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: options?.fill ? { fill: options.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 110, bottom: 110, left: 130, right: 130 },
    children: [new Paragraph({
      spacing: { before: 0, after: 0 },
      children: [new TextRun({
        text: clean(text, 'A definir'),
        bold: options?.bold,
        color: options?.color || '243447',
        size: 19,
      })],
    })],
  });

const controlTable = (options: WordDocumentOptions) => new Table({
  width: { size: PAGE_WIDTH, type: WidthType.DXA },
  columnWidths: [1600, 3219, 1600, 3219],
  borders,
  rows: [
    new TableRow({ children: [cell('Código', 1600, { bold: true, fill: LIGHT_BLUE }), cell(options.documentCode, 3219), cell('Revisão', 1600, { bold: true, fill: LIGHT_BLUE }), cell(options.revision, 3219)] }),
    new TableRow({ children: [cell('Setor', 1600, { bold: true, fill: LIGHT_BLUE }), cell(options.sector, 3219), cell('Equipamento', 1600, { bold: true, fill: LIGHT_BLUE }), cell(options.equipment, 3219)] }),
    new TableRow({ children: [cell('Elaborado por', 1600, { bold: true, fill: LIGHT_BLUE }), cell(options.preparedBy, 3219), cell('Aprovado por', 1600, { bold: true, fill: LIGHT_BLUE }), cell(options.approvedBy, 3219)] }),
    new TableRow({ children: [cell('Vigência', 1600, { bold: true, fill: LIGHT_BLUE }), cell(options.effectiveDate, 3219), cell('Situação', 1600, { bold: true, fill: LIGHT_BLUE }), cell('Emissão controlada', 3219, { color: GREEN, bold: true })] }),
  ],
});

const sectionTitle = (text: string, level: 1 | 2 | 3 = 1) => new Paragraph({
  heading: level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
  keepNext: true,
  children: [new TextRun(clean(text))],
});

const body = (text: string, options?: { bold?: boolean; color?: string; italic?: boolean }) => new Paragraph({
  spacing: { after: 130, line: 290 },
  children: [new TextRun({ text: clean(text), bold: options?.bold, color: options?.color, italics: options?.italic })],
});

const bullets = (items: string[], color?: string) => items.map((item) => new Paragraph({
  bullet: { level: 0 },
  spacing: { after: 70, line: 270 },
  indent: { left: 440, hanging: 220 },
  children: [new TextRun({ text: clean(item), color })],
}));

const labelParagraph = (label: string, value: string, color = BLUE) => new Paragraph({
  spacing: { before: 60, after: 80 },
  children: [
    new TextRun({ text: `${label}: `, bold: true, color }),
    new TextRun({ text: clean(value, 'A definir') }),
  ],
});

const callout = (label: string, values: string[], color: string, fill: string) => {
  if (!values.length) return [];
  return [new Table({
    width: { size: PAGE_WIDTH, type: WidthType.DXA },
    columnWidths: [PAGE_WIDTH],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color },
      bottom: { style: BorderStyle.SINGLE, size: 6, color },
      left: { style: BorderStyle.SINGLE, size: 18, color },
      right: { style: BorderStyle.SINGLE, size: 6, color },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [new TableRow({ children: [new TableCell({
      width: { size: PAGE_WIDTH, type: WidthType.DXA },
      shading: { fill, type: ShadingType.CLEAR },
      margins: { top: 130, bottom: 130, left: 180, right: 180 },
      children: [
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: label, bold: true, color })] }),
        ...bullets(values, color),
      ],
    })] })],
  }), new Paragraph({ spacing: { after: 100 } })];
};

const collectNodeContent = (entry: HierarchyEntry, details: any, options: WordDocumentOptions) => {
  const { node, depth } = entry;
  const data = node.data || {};
  const operational = details?.operational || {};
  const reactionPlan = operational.reactionPlan || {};
  const troubleshooting = operational.troubleshooting || {};
  const number = clean(data.numberCode);
  const title = `${number ? `${number} ` : ''}${clean(data.label, 'Item sem título')}`;
  const output: any[] = [sectionTitle(title, depth <= 1 ? 2 : 3)];
  const description = clean(details?.description, clean(data.description));

  if (description) output.push(body(description));

  if (options.includeTechnical) {
    const classifications = [
      operational.ctq ? 'CTQ / característica especial' : '',
      operational.auditRequired ? 'Auditoria requerida' : '',
      operational.requiresApproval ? 'Liberação requerida' : '',
      operational.requiresEvidence ? 'Evidência obrigatória' : '',
      operational.riskLevel && operational.riskLevel !== 'none' ? `Risco: ${operational.riskLevel}` : '',
    ].filter(Boolean);
    if (classifications.length) output.push(labelParagraph('Classificação', classifications.join(' | ')));
    if (clean(operational.inspectionFrequency)) output.push(labelParagraph('Frequência de inspeção', operational.inspectionFrequency));
    if (clean(operational.specialCharacteristic)) output.push(labelParagraph('Característica especial / CTQ', operational.specialCharacteristic));
    if (clean(operational.requiredIATF)) output.push(labelParagraph('Requisito aplicável', operational.requiredIATF));
    if (clean(operational.traceability)) output.push(labelParagraph('Rastreabilidade', operational.traceability));
    output.push(...callout('Critérios de aprovação', strings(operational.approvalCriteria), GREEN, 'ECFDF3'));
    output.push(...callout('Fluxo OK / liberação', strings(operational.okFlow), GREEN, 'ECFDF3'));
    output.push(...callout('Fluxo NOK / contenção', strings(operational.nokFlow), RED, 'FEF3F2'));
  }

  if (options.includeTasks) {
    const tasks = Array.isArray(details?.tasks) ? details.tasks : [];
    tasks.forEach((task: any, taskIndex: number) => {
      const taskText = clean(task?.text);
      if (!taskText) return;
      output.push(new Paragraph({
        keepNext: true,
        spacing: { before: 110, after: 70 },
        children: [new TextRun({ text: `Instrução ${taskIndex + 1} - ${taskText}`, bold: true, color: DARK_BLUE })],
      }));
      const howTo = Array.isArray(task?.howTo) ? [...task.howTo] : [];
      howTo.sort((a, b) => (Number(a?.order) || 0) - (Number(b?.order) || 0));
      howTo.forEach((step: any, index: number) => {
        const instruction = clean(step?.instruction);
        if (!instruction) return;
        output.push(new Paragraph({
          numbering: { reference: 'operational-steps', level: 0 },
          spacing: { after: 70, line: 270 },
          children: [
            new TextRun(instruction),
            ...(clean(step?.visualHint) ? [new TextRun({ text: ` (${clean(step.visualHint)})`, italics: true, color: GRAY })] : []),
          ],
        }));
      });
      const ok = task?.ifOK;
      const nok = task?.ifNOK;
      if (clean(ok?.result) || clean(ok?.action)) {
        output.push(labelParagraph('Se OK', [clean(ok?.result), clean(ok?.action), clean(ok?.nextStep)].filter(Boolean).join(' - '), GREEN));
      }
      if (clean(nok?.result) || clean(nok?.action)) {
        output.push(labelParagraph('Se NOK', [clean(nok?.result), clean(nok?.action), clean(nok?.nextStep)].filter(Boolean).join(' - '), RED));
      }
      const tips = Array.isArray(task?.tips) ? task.tips.map((tip: any) => clean(tip?.message)).filter(Boolean) : [];
      if (tips.length) output.push(...callout('Pontos de atenção', tips, AMBER, 'FFFAEB'));
    });
  }

  if (options.includeTroubleshooting) {
    output.push(...callout('Falhas e sintomas', [...strings(troubleshooting.commonFailures), ...strings(troubleshooting.symptoms)], RED, 'FEF3F2'));
    output.push(...callout('Causas prováveis', strings(troubleshooting.probableCauses), AMBER, 'FFFAEB'));
    output.push(...callout('Ação imediata', [...strings(troubleshooting.immediateActions), ...strings(reactionPlan.actions)], BLUE, LIGHT_BLUE));
    output.push(...callout('Critérios para parar e escalar', [...strings(troubleshooting.stopCriteria), ...strings(reactionPlan.stopProductionCriteria), ...strings(reactionPlan.escalationActions)], RED, 'FEF3F2'));
  }

  if (options.includeRecords) {
    const records = [
      ...strings(operational.requiredRecords),
      ...strings(operational.evidenceExamples),
      ...strings(troubleshooting.requiredEvidence),
    ];
    output.push(...callout('Registros e evidências obrigatórias', Array.from(new Set(records)), BLUE, LIGHT_BLUE));
  }

  return output;
};

export async function generateWordDocument(options: WordDocumentOptions) {
  const hierarchy = buildHierarchy(options.nodes, options.edges);
  const root = hierarchy[0];
  const rootDetails = root ? options.nodeDetails[root.node.id] : undefined;
  const rootDescription = clean(rootDetails?.description, clean(root?.node?.data?.description));
  const children: any[] = [];

  children.push(
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 700, after: 180 }, children: [new TextRun({ text: 'TECNO MAPPER', bold: true, color: BLUE, size: 24, characterSpacing: 180 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: clean(options.mapTitle, 'Procedimento Operacional'), bold: true, color: DARK_BLUE, size: 38 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 500 }, children: [new TextRun({ text: 'PROCEDIMENTO | INSTRUÇÃO | REGISTRO', bold: true, color: GRAY, size: 20, characterSpacing: 80 })] }),
    controlTable(options),
    new Paragraph({ spacing: { before: 360, after: 120 }, children: [new TextRun({ text: 'FINALIDADE DO DOCUMENTO', bold: true, color: BLUE, size: 22 })] }),
    body(rootDescription || `Padronizar a execução de ${options.mapTitle}, assegurando segurança, qualidade, rastreabilidade e repetibilidade do processo.`),
    new Paragraph({ spacing: { before: 360 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CÓPIA CONTROLADA PARA TREINAMENTO E EXECUÇÃO OPERACIONAL', bold: true, color: RED, size: 17 })] }),
    new Paragraph({ children: [new PageBreak()] }),
  );

  children.push(
    sectionTitle('1. Como este documento deve ser usado'),
    body('Este documento reúne três camadas complementares. Elas não devem ser tratadas como sinônimos:'),
    new Table({
      width: { size: PAGE_WIDTH, type: WidthType.DXA },
      columnWidths: [1900, 7738],
      borders,
      rows: [
        new TableRow({ tableHeader: true, children: [cell('CAMADA', 1900, { bold: true, fill: BLUE, color: 'FFFFFF' }), cell('DEFINIÇÃO E USO', 7738, { bold: true, fill: BLUE, color: 'FFFFFF' })] }),
        new TableRow({ children: [cell('Procedimento', 1900, { bold: true, fill: LIGHT_BLUE }), cell('Define o fluxo geral: o que deve acontecer, em qual sequência, quem participa, quais decisões são tomadas e quais controles garantem o resultado.', 7738)] }),
        new TableRow({ children: [cell('Instrução', 1900, { bold: true, fill: LIGHT_BLUE }), cell('Explica como executar uma atividade. Apresenta ações práticas, parâmetros, cuidados, critérios OK/NOK e resposta imediata em caso de desvio.', 7738)] }),
        new TableRow({ children: [cell('Registro', 1900, { bold: true, fill: LIGHT_BLUE }), cell('É a evidência de que a atividade ou inspeção foi realizada. Deve identificar data, responsável, lote/OP, resultado e decisão tomada, permitindo rastreabilidade.', 7738)] }),
      ],
    }),
    new Paragraph({ spacing: { after: 180 } }),
    sectionTitle('2. Objetivo e escopo'),
    body(rootDescription || `Orientar os colaboradores envolvidos em ${options.mapTitle}.`),
    labelParagraph('Setor de aplicação', options.sector),
    labelParagraph('Equipamento principal', options.equipment),
    sectionTitle('3. Regras de controle documental'),
    ...bullets([
      'Utilizar somente a revisão vigente e aprovada.',
      'Interromper a execução e consultar a liderança quando houver dúvida, conflito de informação ou condição não prevista.',
      'Registrar resultados de inspeção, desvios, contenções e liberações nos formulários ou sistemas definidos.',
      'Revisar este documento sempre que houver alteração de produto, processo, equipamento, risco ou requisito do cliente.',
    ]),
    sectionTitle('4. Procedimento e instruções operacionais'),
  );

  hierarchy.filter((entry) => entry.depth > 0).forEach((entry) => {
    children.push(...collectNodeContent(entry, options.nodeDetails[entry.node.id] || {}, options));
  });

  children.push(
    sectionTitle('5. Registros consolidados'),
    body('Os registros abaixo devem ser preenchidos no momento da execução, mantidos legíveis e vinculados à OP, lote ou peça correspondente.'),
  );

  const consolidatedRecords = hierarchy.flatMap(({ node }) => {
    const operational = options.nodeDetails[node.id]?.operational || {};
    return [...strings(operational.requiredRecords), ...strings(operational.evidenceExamples)];
  });
  children.push(...bullets(Array.from(new Set(consolidatedRecords)).length ? Array.from(new Set(consolidatedRecords)) : ['Registro de produção e quantidade.', 'Registro de inspeção e liberação.', 'Registro de não conformidade, quando aplicável.']));

  children.push(
    sectionTitle('6. Aprovação e controle de revisão'),
    new Table({
      width: { size: PAGE_WIDTH, type: WidthType.DXA },
      columnWidths: [1600, 1800, 3638, 2600],
      borders,
      rows: [
        new TableRow({ tableHeader: true, children: [cell('REVISÃO', 1600, { bold: true, fill: BLUE, color: 'FFFFFF' }), cell('DATA', 1800, { bold: true, fill: BLUE, color: 'FFFFFF' }), cell('ALTERAÇÃO', 3638, { bold: true, fill: BLUE, color: 'FFFFFF' }), cell('RESPONSÁVEL', 2600, { bold: true, fill: BLUE, color: 'FFFFFF' })] }),
        new TableRow({ children: [cell(options.revision, 1600), cell(options.effectiveDate, 1800), cell('Emissão do documento a partir do mapa operacional vigente.', 3638), cell(options.preparedBy, 2600)] }),
      ],
    }),
    new Paragraph({ spacing: { before: 420, after: 80 }, children: [new TextRun({ text: 'Elaboração: ____________________________________', bold: true })] }),
    body(`Nome: ${clean(options.preparedBy, 'A definir')}    Data: ____/____/________`),
    new Paragraph({ spacing: { before: 260, after: 80 }, children: [new TextRun({ text: 'Aprovação: _____________________________________', bold: true })] }),
    body(`Nome: ${clean(options.approvedBy, 'A definir')}    Data: ____/____/________`),
  );

  const document = new Document({
    creator: clean(options.preparedBy, 'Tecno Mapper'),
    title: clean(options.mapTitle),
    description: 'Procedimento operacional gerado a partir do mapa mental Tecno Mapper.',
    numbering: {
      config: [{
        reference: 'operational-steps',
        levels: [{
          level: 0,
          format: 'decimal',
          text: '%1.',
          alignment: AlignmentType.START,
          style: { paragraph: { indent: { left: 480, hanging: 240 } } },
        }],
      }],
    },
    styles: {
      default: { document: { run: { font: 'Aptos', size: 21, color: '243447' }, paragraph: { spacing: { after: 110, line: 280 } } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Aptos Display', size: 28, bold: true, color: DARK_BLUE }, paragraph: { spacing: { before: 320, after: 150 }, keepNext: true, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Aptos Display', size: 24, bold: true, color: BLUE }, paragraph: { spacing: { before: 250, after: 110 }, keepNext: true, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Aptos', size: 21, bold: true, color: '344054' }, paragraph: { spacing: { before: 180, after: 80 }, keepNext: true, outlineLevel: 2 } },
      ],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1000, right: 1134, bottom: 1000, left: 1134, header: 500, footer: 500 },
        },
      },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${clean(options.documentCode)} | ${clean(options.revision)}`, color: GRAY, size: 16 })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tecno Mapper | Documento controlado | Página ', color: GRAY, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: GRAY, size: 16 }), new TextRun({ text: ' de ', color: GRAY, size: 16 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], color: GRAY, size: 16 })] })] }) },
      children,
    }],
  });

  return Packer.toBlob(document);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function wordFilename(title: string) {
  const safeTitle = clean(title, 'procedimento-operacional')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `${safeTitle || 'procedimento-operacional'}.docx`;
}
