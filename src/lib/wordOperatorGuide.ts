import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  LevelFormat,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { normalizeOperationalMetadata } from './operationalModel';
import { repairMojibake } from './textEncoding';
import type { WordDocumentOptions } from './wordDocument';

// compact_reference_guide with the named posto_a4 override used throughout.
const PAGE_WIDTH = 9638;
const NAVY = '0B1F33';
const DEEP_BLUE = '12335B';
const BLUE = '1E5AA8';
const CYAN = '00A6A6';
const GREEN = '067647';
const GREEN_FILL = 'ECFDF3';
const AMBER = 'B54708';
const AMBER_FILL = 'FFF4E5';
const RED = 'B42318';
const RED_FILL = 'FEF3F2';
const INK = '172B4D';
const MUTED = '667085';
const LIGHT = 'F5F7FA';
const LINE = 'CBD5E1';
const WHITE = 'FFFFFF';

interface HierarchyEntry {
  node: any;
  depth: number;
  parentId?: string;
}

const clean = (value: unknown, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return repairMojibake(value).trim() || fallback;
};

const unique = (values: unknown[]): string[] => {
  const seen = new Set<string>();
  return values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => clean(value))
    .filter((value) => {
      if (!value || seen.has(value.toLocaleLowerCase('pt-BR'))) return false;
      seen.add(value.toLocaleLowerCase('pt-BR'));
      return true;
    });
};

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
  const validNodes = (Array.isArray(nodes) ? nodes : []).filter((node) => node?.id && node?.data);
  const nodeMap = new Map(validNodes.map((node) => [String(node.id), node]));
  const children = new Map<string, string[]>();
  const parentById = new Map<string, string>();

  (Array.isArray(edges) ? edges : []).forEach((edge) => {
    const source = String(edge?.source || '');
    const target = String(edge?.target || '');
    if (!nodeMap.has(source) || !nodeMap.has(target)) return;
    children.set(source, [...(children.get(source) || []), target]);
    if (!parentById.has(target)) parentById.set(target, source);
  });

  const roots = validNodes.filter((node) => !parentById.has(String(node.id))).sort(compareNodes);
  const output: HierarchyEntry[] = [];
  const visited = new Set<string>();

  const visit = (node: any, depth: number, parentId?: string) => {
    const id = String(node?.id || '');
    if (!id || visited.has(id)) return;
    visited.add(id);
    output.push({ node, depth, parentId });
    (children.get(id) || [])
      .map((childId) => nodeMap.get(childId))
      .filter(Boolean)
      .sort(compareNodes)
      .forEach((child) => visit(child, depth + 1, id));
  };

  roots.forEach((root) => visit(root, 0));
  validNodes.filter((node) => !visited.has(String(node.id))).sort(compareNodes).forEach((node) => visit(node, 1));
  return output;
};

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: WHITE },
  bottom: { style: BorderStyle.NONE, size: 0, color: WHITE },
  left: { style: BorderStyle.NONE, size: 0, color: WHITE },
  right: { style: BorderStyle.NONE, size: 0, color: WHITE },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: WHITE },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: WHITE },
};

const gridBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: LINE },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE },
  left: { style: BorderStyle.SINGLE, size: 4, color: LINE },
  right: { style: BorderStyle.SINGLE, size: 4, color: LINE },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 3, color: LINE },
  insideVertical: { style: BorderStyle.SINGLE, size: 3, color: LINE },
};

const spacer = (after = 80) => new Paragraph({ spacing: { after } });

const bulletParagraphs = (items: string[], color = INK) => items.map((item) => new Paragraph({
  numbering: { reference: 'operator-guide-bullets', level: 0 },
  spacing: { after: 80, line: 300 },
  children: [new TextRun({ text: clean(item), color, size: 21 })],
}));

const labelCell = (label: string, value: string, width: number) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  shading: { fill: WHITE, type: ShadingType.CLEAR },
  margins: { top: 90, bottom: 90, left: 120, right: 120 },
  children: [new Paragraph({
    spacing: { after: 0 },
    children: [
      new TextRun({ text: `${label}\n`, bold: true, color: BLUE, size: 16, allCaps: true }),
      new TextRun({ text: clean(value, 'Pendente de validação'), color: INK, size: 19 }),
    ],
  })],
});

const controlGrid = (options: WordDocumentOptions) => new Table({
  width: { size: PAGE_WIDTH, type: WidthType.DXA },
  columnWidths: [2409, 2409, 2410, 2410],
  borders: gridBorders,
  rows: [
    new TableRow({
      cantSplit: true,
      children: [
        labelCell('Código', options.documentCode, 2409),
        labelCell('Revisão', options.revision, 2409),
        labelCell('Setor', options.sector, 2410),
        labelCell('Equipamento', options.equipment, 2410),
      ],
    }),
    new TableRow({
      cantSplit: true,
      children: [
        labelCell('Elaborado por', options.preparedBy, 2409),
        labelCell('Aprovado por', options.approvedBy, 2409),
        labelCell('Vigência', options.effectiveDate, 2410),
        labelCell('Situação', 'Cópia de uso no posto', 2410),
      ],
    }),
  ],
});

const definitionCell = (title: string, summary: string, color: string, width: number) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  verticalAlign: VerticalAlign.TOP,
  shading: { fill: LIGHT, type: ShadingType.CLEAR },
  margins: { top: 150, bottom: 150, left: 150, right: 150 },
  borders: {
    ...noBorders,
    top: { style: BorderStyle.SINGLE, size: 22, color },
  },
  children: [
    new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: title, bold: true, color, size: 23 })] }),
    new Paragraph({ spacing: { after: 0, line: 290 }, children: [new TextRun({ text: summary, color: INK, size: 19 })] }),
  ],
});

const phaseCard = (number: string, title: string, width: number, index: number) => new TableCell({
  width: { size: width, type: WidthType.DXA },
  shading: { fill: index % 2 === 0 ? 'EAF2FB' : 'E8F7F6', type: ShadingType.CLEAR },
  margins: { top: 110, bottom: 110, left: 130, right: 130 },
  borders: gridBorders,
  children: [
    new Paragraph({ spacing: { after: 45 }, children: [new TextRun({ text: clean(number, String(index + 1)), bold: true, color: index % 2 === 0 ? BLUE : CYAN, size: 18 })] }),
    new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: clean(title), bold: true, color: NAVY, size: 19 })] }),
  ],
});

const zone = (label: string, items: string[], color: string, fill: string, emptyLabel?: string) => {
  const content = items.length ? items : [emptyLabel || 'PENDENTE DE VALIDAÇÃO'];
  const pending = !items.length;
  return [
    new Table({
      width: { size: PAGE_WIDTH, type: WidthType.DXA },
      columnWidths: [150, PAGE_WIDTH - 150],
      borders: {
        ...noBorders,
        top: { style: BorderStyle.SINGLE, size: 4, color },
        bottom: { style: BorderStyle.SINGLE, size: 4, color },
        left: { style: BorderStyle.SINGLE, size: 4, color },
        right: { style: BorderStyle.SINGLE, size: 4, color },
      },
      rows: [new TableRow({
        children: [
          new TableCell({
            width: { size: 150, type: WidthType.DXA },
            shading: { fill: color, type: ShadingType.CLEAR },
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [new Paragraph('')],
          }),
          new TableCell({
            width: { size: PAGE_WIDTH - 150, type: WidthType.DXA },
            shading: { fill, type: ShadingType.CLEAR },
            margins: { top: 110, bottom: 110, left: 150, right: 150 },
            children: [
              new Paragraph({
                keepNext: true,
                spacing: { after: 60 },
                children: [new TextRun({ text: label, bold: true, color, size: 18, allCaps: true })],
              }),
              ...bulletParagraphs(content, pending ? AMBER : INK),
            ],
          }),
        ],
      })],
    }),
    spacer(90),
  ];
};

const nodeHeader = (number: string, title: string, type: string, critical: boolean) => new Table({
  width: { size: PAGE_WIDTH, type: WidthType.DXA },
  columnWidths: [7700, 1938],
  borders: noBorders,
  rows: [new TableRow({
    cantSplit: true,
    children: [
      new TableCell({
        width: { size: 7700, type: WidthType.DXA },
        shading: { fill: critical ? NAVY : DEEP_BLUE, type: ShadingType.CLEAR },
        margins: { top: 150, bottom: 150, left: 180, right: 140 },
        children: [new Paragraph({
          spacing: { after: 0 },
          children: [
            new TextRun({ text: `${clean(number)}  `, bold: true, color: critical ? '6EC1FF' : '9ED0FF', size: 23 }),
            new TextRun({ text: clean(title), bold: true, color: WHITE, size: 25 }),
          ],
        })],
      }),
      new TableCell({
        width: { size: 1938, type: WidthType.DXA },
        verticalAlign: VerticalAlign.CENTER,
        shading: { fill: critical ? RED : BLUE, type: ShadingType.CLEAR },
        margins: { top: 130, bottom: 130, left: 100, right: 100 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 0 },
          children: [new TextRun({ text: clean(type, 'Processo').toUpperCase(), bold: true, color: WHITE, size: 15 })],
        })],
      }),
    ],
  })],
});

const nodeContent = (entry: HierarchyEntry, options: WordDocumentOptions) => {
  const { node } = entry;
  const details = options.nodeDetails?.[node.id] || {};
  const operational = normalizeOperationalMetadata(details?.operational, node?.data || {});
  const tasks = Array.isArray(details?.tasks) ? details.tasks.filter(Boolean) : [];
  const howTo = tasks.flatMap((task: any) => Array.isArray(task?.howTo) ? task.howTo : []);
  const taskActions = tasks.map((task: any) => clean(task?.text)).filter(Boolean);
  const taskOk = tasks.flatMap((task: any) => [task?.ifOK?.result, task?.ifOK?.action]);
  const taskNok = tasks.flatMap((task: any) => [task?.ifNOK?.result, task?.ifNOK?.action, task?.ifNOK?.nextStep]);
  const topOk = details?.ifOK || {};
  const topNok = details?.ifNOK || {};
  const reaction = operational.reactionPlan;
  const troubleshooting = operational.troubleshooting;
  const number = clean(node?.data?.numberCode, '-');
  const title = clean(node?.data?.label, 'Etapa sem título');
  const type = clean(node?.data?.nodeTypeAdvanced || operational.nodeTypeAdvanced, 'Processo');
  const description = clean(details?.description || node?.data?.description);
  const critical = operational.severity === 'critical'
    || operational.riskLevel === 'critical'
    || operational.riskLevel === 'high'
    || operational.requiresApproval
    || operational.ctq;

  const doItems = unique([
    options.includeTasks ? taskActions : [],
    options.includeTasks ? howTo.map((step: any) => step?.action || step?.text || step) : [],
  ]);
  const confirmItems = unique([
    options.includeTechnical ? operational.okCriteria : [],
    options.includeTechnical ? operational.approvalCriteria : [],
    taskOk,
    topOk.result,
    topOk.action,
  ]);
  const nokItems = unique([
    options.includeTechnical ? operational.nokCriteria : [],
    options.includeTroubleshooting ? reaction.actions : [],
    options.includeTroubleshooting ? reaction.containmentActions : [],
    taskNok,
    topNok.result,
    topNok.action,
  ]);
  const recordItems = unique([
    options.includeRecords ? operational.requiredRecords : [],
    options.includeRecords ? operational.evidenceExamples : [],
    options.includeRecords && operational.traceability ? operational.traceability : [],
    options.includeTroubleshooting ? troubleshooting.requiredEvidence : [],
  ]);
  const responsibilities = unique([
    operational.responsibleRoles.map((role) => `Executa: ${role}`),
    operational.supportRoles.map((role) => `Apoia: ${role}`),
    operational.approvalAuthority.map((role) => `Libera: ${role}`),
    reaction.owner ? `Plano de reação: ${reaction.owner}` : '',
  ]);
  const nextSteps = unique([
    operational.okFlow,
    topOk.nextStep,
    tasks.map((task: any) => task?.ifOK?.nextStep),
  ]);
  const pending = operational.pendingValidation.flatMap((item) => [
    item?.issue ? `Informação faltante: ${item.issue}` : '',
    item?.suggestedValidator ? `Validar com: ${item.suggestedValidator}` : '',
    item?.impact ? `Impacto: ${item.impact}` : '',
  ]);

  return [
    nodeHeader(number, title, type, critical),
    ...(description ? [new Paragraph({
      spacing: { before: 120, after: 120, line: 300 },
      children: [new TextRun({ text: description, color: INK, size: 22 })],
    })] : []),
    ...zone('1. Faça', doItems, BLUE, 'EFF6FF', 'PENDENTE DE VALIDAÇÃO: definir a instrução de execução.'),
    ...zone('2. Confirme', confirmItems, GREEN, GREEN_FILL, 'PENDENTE DE VALIDAÇÃO: definir o critério objetivo de conformidade.'),
    ...zone('3. Se NOK', nokItems, RED, RED_FILL, 'PENDENTE DE VALIDAÇÃO: definir bloqueio, contenção, comunicação e revalidação.'),
    ...zone('4. Registre', recordItems, AMBER, AMBER_FILL, 'PENDENTE DE VALIDAÇÃO: definir o registro ou a evidência aplicável.'),
    ...(responsibilities.length ? zone('Responsáveis e autoridade', responsibilities, CYAN, 'E8F7F6') : []),
    ...(nextSteps.length ? zone('Próximo', nextSteps, BLUE, 'EFF6FF') : []),
    ...(pending.length ? zone('Pendente de validação', pending, AMBER, AMBER_FILL) : []),
    spacer(180),
  ];
};

const heading = (text: string, size = 30, color = NAVY) => new Paragraph({
  keepNext: true,
  spacing: { before: 180, after: 100 },
  children: [new TextRun({ text: clean(text), bold: true, color, size })],
});

export async function generateOperatorGuideDocument(options: WordDocumentOptions): Promise<Blob> {
  const hierarchy = buildHierarchy(options.nodes, options.edges);
  const root = hierarchy.find((entry) => entry.depth === 0) || hierarchy[0];
  const phases = hierarchy.filter((entry) => entry.depth === 1);
  const operationalEntries = hierarchy.filter((entry) => entry !== root);
  const rootDetails = root ? options.nodeDetails?.[root.node.id] || {} : {};
  const purpose = clean(rootDetails?.description || root?.node?.data?.description, 'Guia visual para consulta e execução segura do processo no posto de trabalho.');
  const allRecords = unique(operationalEntries.flatMap(({ node }) => {
    const op = normalizeOperationalMetadata(options.nodeDetails?.[node.id]?.operational, node.data || {});
    return [...op.requiredRecords, ...op.evidenceExamples];
  }));
  const allPending = unique(operationalEntries.flatMap(({ node }) => {
    const op = normalizeOperationalMetadata(options.nodeDetails?.[node.id]?.operational, node.data || {});
    return op.pendingValidation.map((item) => `${clean(node.data?.numberCode)} ${clean(node.data?.label)}: ${clean(item?.issue)}`);
  }));

  const cover = [
    new Table({
      width: { size: PAGE_WIDTH, type: WidthType.DXA },
      columnWidths: [PAGE_WIDTH],
      borders: noBorders,
      rows: [new TableRow({ children: [new TableCell({
        width: { size: PAGE_WIDTH, type: WidthType.DXA },
        shading: { fill: NAVY, type: ShadingType.CLEAR },
        margins: { top: 360, bottom: 360, left: 320, right: 320 },
        children: [
          new Paragraph({ spacing: { after: 140 }, children: [new TextRun({ text: 'TECNO MAPPER  |  GUIA VISUAL DO SETOR', bold: true, color: '6EC1FF', size: 18, characterSpacing: 80 })] }),
          new Paragraph({ spacing: { after: 120, line: 300 }, children: [new TextRun({ text: clean(options.mapTitle), bold: true, color: WHITE, size: 39 })] }),
          new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: `${clean(options.sector)}  •  ${clean(options.equipment)}`, color: 'D5E8FF', size: 22 })] }),
        ],
      })] })],
    }),
    spacer(180),
    new Table({
      width: { size: PAGE_WIDTH, type: WidthType.DXA },
      columnWidths: [3212, 3213, 3213],
      borders: noBorders,
      rows: [new TableRow({
        cantSplit: true,
        children: [
          definitionCell('FAÇA', 'Execute somente a atividade e a sequência descritas neste guia.', BLUE, 3212),
          definitionCell('CONFIRME', 'Antes de avançar, verifique o critério objetivo indicado na etapa.', GREEN, 3213),
          definitionCell('SE NOK', 'Interrompa ou bloqueie quando indicado. Corrija e revalide antes de retomar.', RED, 3213),
        ],
      })],
    }),
    spacer(180),
    controlGrid(options),
    spacer(180),
    heading('Finalidade deste guia', 26, BLUE),
    new Paragraph({ spacing: { after: 120, line: 300 }, children: [new TextRun({ text: purpose, color: INK, size: 22 })] }),
    new Table({
      width: { size: PAGE_WIDTH, type: WidthType.DXA },
      columnWidths: [PAGE_WIDTH],
      borders: noBorders,
      rows: [new TableRow({ children: [new TableCell({
        shading: { fill: AMBER_FILL, type: ShadingType.CLEAR },
        borders: { ...noBorders, left: { style: BorderStyle.SINGLE, size: 22, color: AMBER } },
        margins: { top: 130, bottom: 130, left: 180, right: 180 },
        children: [new Paragraph({ spacing: { after: 0 }, children: [
          new TextRun({ text: 'REGRA DE AVANÇO  ', bold: true, color: AMBER, size: 18 }),
          new TextRun({ text: 'Sem requisito atendido, sem evidência obrigatória e sem liberação quando exigida, o processo não avança.', bold: true, color: INK, size: 20 }),
        ] })],
      })] })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  const quickStart = [
    heading('Leitura em 60 segundos', 34),
    new Paragraph({ spacing: { after: 140, line: 300 }, children: [new TextRun({ text: 'Este documento separa três camadas que trabalham juntas, mas não são sinônimos.', color: MUTED, size: 21 })] }),
    new Table({
      width: { size: PAGE_WIDTH, type: WidthType.DXA },
      columnWidths: [3212, 3213, 3213],
      borders: noBorders,
      rows: [new TableRow({
        cantSplit: true,
        children: [
          definitionCell('PROCEDIMENTO', 'Mostra o fluxo: o que acontece, em qual sequência, quem participa e onde há decisão.', BLUE, 3212),
          definitionCell('INSTRUÇÃO', 'Explica como executar: ação, cuidado, parâmetro, conferência e resposta ao desvio.', CYAN, 3213),
          definitionCell('REGISTRO', 'Comprova o resultado: identifica data, responsável, lote/OP, medição, decisão e liberação.', AMBER, 3213),
        ],
      })],
    }),
    heading('Rota visual do processo', 28, BLUE),
  ];

  const phaseRows: TableRow[] = [];
  for (let index = 0; index < phases.length; index += 2) {
    const first = phases[index];
    const second = phases[index + 1];
    phaseRows.push(new TableRow({
      cantSplit: true,
      children: [
        phaseCard(clean(first?.node?.data?.numberCode), clean(first?.node?.data?.label), 4819, index),
        second
          ? phaseCard(clean(second.node?.data?.numberCode), clean(second.node?.data?.label), 4819, index + 1)
          : new TableCell({ width: { size: 4819, type: WidthType.DXA }, borders: noBorders, children: [new Paragraph('')] }),
      ],
    }));
  }
  quickStart.push(new Table({ width: { size: PAGE_WIDTH, type: WidthType.DXA }, columnWidths: [4819, 4819], borders: noBorders, rows: phaseRows }));
  quickStart.push(spacer(120));
  quickStart.push(...zone('Como usar no posto', [
    'Localize a fase e a etapa pelo número.',
    'Execute a zona “Faça” e confirme o resultado antes de avançar.',
    'Se houver NOK, siga a reação completa e não retome sem a condição de liberação.',
    'Gere ou anexe o registro indicado na própria etapa.',
  ], BLUE, 'EFF6FF'));
  quickStart.push(new Paragraph({ children: [new PageBreak()] }));

  const sections: any[] = [...cover, ...quickStart];
  let currentPhaseId = '';
  operationalEntries.forEach((entry) => {
    if (entry.depth === 1) {
      currentPhaseId = String(entry.node.id);
      sections.push(new Table({
        width: { size: PAGE_WIDTH, type: WidthType.DXA },
        columnWidths: [PAGE_WIDTH],
        borders: noBorders,
        rows: [new TableRow({ children: [new TableCell({
          shading: { fill: DEEP_BLUE, type: ShadingType.CLEAR },
          margins: { top: 230, bottom: 230, left: 230, right: 230 },
          children: [
            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: `FASE ${clean(entry.node.data?.numberCode)}`, bold: true, color: '6EC1FF', size: 18, characterSpacing: 60 })] }),
            new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: clean(entry.node.data?.label), bold: true, color: WHITE, size: 34 })] }),
          ],
        })] })],
      }));
      sections.push(spacer(160));
    } else if (currentPhaseId && entry.parentId !== currentPhaseId && entry.depth > 2) {
      sections.push(new Paragraph({
        keepNext: true,
        spacing: { before: 80, after: 70 },
        children: [new TextRun({ text: `SUBETAPA ${clean(entry.node.data?.numberCode)}`, bold: true, color: MUTED, size: 16, characterSpacing: 50 })],
      }));
    }
    sections.push(...nodeContent(entry, options));
  });

  sections.push(new Paragraph({ children: [new PageBreak()] }));
  sections.push(heading('Fechamento e consulta rápida', 34));
  sections.push(new Paragraph({ spacing: { after: 130, line: 300 }, children: [new TextRun({ text: 'Use esta seção antes de encerrar a ordem, liberar o lote ou entregar o processo ao turno seguinte.', color: MUTED, size: 21 })] }));
  sections.push(...zone('Registros e evidências identificados no mapa', allRecords, BLUE, 'EFF6FF', 'PENDENTE DE VALIDAÇÃO: o mapa não possui registros consolidados.'));
  if (allPending.length) sections.push(...zone('Pendências que impedem a oficialização completa', allPending, AMBER, AMBER_FILL));
  sections.push(...zone('Checklist de encerramento', [
    'Todas as etapas obrigatórias foram concluídas.',
    'Os resultados de inspeção e os desvios foram registrados.',
    'Nenhum material bloqueado foi liberado sem a autoridade definida.',
    'Os registros permitem rastrear ordem, produto, lote, data e responsável quando aplicável.',
  ], GREEN, GREEN_FILL));
  sections.push(spacer(180));
  sections.push(new Table({
    width: { size: PAGE_WIDTH, type: WidthType.DXA },
    columnWidths: [4819, 4819],
    borders: gridBorders,
    rows: [new TableRow({
      children: [
        labelCell('Responsável pela conferência', 'Nome / assinatura / data', 4819),
        labelCell('Liberação quando exigida', 'Nome / assinatura / data', 4819),
      ],
    })],
  }));

  const document = new Document({
    creator: 'Tecno Mapper',
    title: `${clean(options.mapTitle)} - Guia Visual do Setor`,
    description: 'Guia visual para execução, conferência, reação e registro no posto de trabalho.',
    numbering: {
      config: [{
        reference: 'operator-guide-bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 540, hanging: 270 }, spacing: { after: 80, line: 300 } },
            run: { color: BLUE, size: 21 },
          },
        }],
      }],
    },
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 22, color: INK }, paragraph: { spacing: { after: 120, line: 300 } } },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134, header: 709, footer: 709 },
        },
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 0 },
          children: [
            new TextRun({ text: `${clean(options.documentCode)}  |  ${clean(options.revision)}  |  GUIA VISUAL DO SETOR`, color: MUTED, size: 15 }),
          ],
        })] }),
      },
      footers: {
        default: new Footer({ children: [new Table({
          width: { size: PAGE_WIDTH, type: WidthType.DXA },
          columnWidths: [7000, 2638],
          borders: { ...noBorders, top: { style: BorderStyle.SINGLE, size: 5, color: LINE } },
          rows: [new TableRow({ children: [
            new TableCell({ width: { size: 7000, type: WidthType.DXA }, borders: noBorders, margins: { top: 80, bottom: 0, left: 0, right: 0 }, children: [new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: 'Tecno Mapper  |  Cópia de uso no posto  |  Consulte sempre a revisão vigente', color: MUTED, size: 15 })] })] }),
            new TableCell({ width: { size: 2638, type: WidthType.DXA }, borders: noBorders, margins: { top: 80, bottom: 0, left: 0, right: 0 }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0 }, children: [new TextRun({ text: 'Página ', color: MUTED, size: 15 }), new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 15 }), new TextRun({ text: ' de ', color: MUTED, size: 15 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], color: MUTED, size: 15 })] })] }),
          ] })],
        })] }),
      },
      children: sections,
    }],
  });

  return Packer.toBlob(document);
}

export const operatorGuideFilename = (title: string) => {
  const safe = clean(title, 'processo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return `${safe || 'processo'}-guia-visual-do-setor.docx`;
};
