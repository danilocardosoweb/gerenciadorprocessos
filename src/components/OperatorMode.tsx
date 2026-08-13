import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, Play, Maximize2, Home, ChevronLeft, ChevronRight, Search, X, ZoomIn, ZoomOut, RotateCcw, Video, Image as ImageIcon, Layers, Workflow, ChevronDown } from 'lucide-react';
import { Edge, Node } from '@xyflow/react';
import { NodeDetails } from './NodeModal';
import { ActionFlow } from './ActionFlow';
import { normalizeOperationalMetadata, type OperationalModeName } from '../lib/operationalModel';

interface OperatorModeProps {
  mapTitle: string;
  nodes: Node[];
  edges: Edge[];
  nodeDetailsMap: Record<string, NodeDetails>;
  mode: OperationalModeName;
  currentUserId: string;
  assessmentRefreshToken: number;
  assessments: any[];
  assessmentLoading: boolean;
  onStartAssessment: (assessment: any) => void;
  onOpenAssessments: () => void;
}

type ChecklistCriticality = 'critical' | 'required' | 'info';

interface HowToStep {
  order: number;
  instruction: string;
  visualHint?: string;
}

interface FlowOutcome {
  result: string;
  action: string;
  nextStep?: string;
  alertLevel?: 'success' | 'warning' | 'critical';
}

interface QuickTip {
  icon: string;
  message: string;
}

interface AttachedFile {
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'xls' | 'image' | 'other';
}

interface ChecklistItem {
  text: string;
  criticality: ChecklistCriticality;
  howTo?: HowToStep[];
  ifOK?: FlowOutcome;
  ifNOK?: FlowOutcome;
  tips?: QuickTip[];
  files?: AttachedFile[];
  images?: string[];
}

interface OperatorStep {
  id: string;
  title: string;
  description: string;
  checklist: ChecklistItem[];
  rawChecklist: string[];
  image: string;
  images: string[];
  hasVisualReference: boolean;
  operational: ReturnType<typeof normalizeOperationalMetadata>;
  severity?: 'ok' | 'warning' | 'alert';
}

interface OperatorPhase {
  id: string;
  title: string;
  description: string;
  steps: OperatorStep[];
}

type SummaryTone = 'blue' | 'emerald' | 'amber' | 'violet' | 'cyan' | 'rose';

interface OperatorSummaryBadge {
  label: string;
  tone: SummaryTone;
}

interface OperatorSummaryCard {
  title: string;
  tone: SummaryTone;
  items: string[];
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
];

const hashCode = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const CRITICAL_KEYWORDS = ['conferir', 'verificar', 'checar', 'garantir', 'confirmar código', 'no ligar', 'perigo', 'crítico', 'obrigatório', 'nunca', 'sempre', 'segurança', 'emergência'];
const INFO_KEYWORDS = ['anotar', 'registrar', 'informar', 'observar', 'horário', 'comunicar', 'informativo'];

const classifyItem = (text: string): ChecklistCriticality => {
  const lower = text.toLowerCase();
  if (CRITICAL_KEYWORDS.some(k => lower.includes(k))) return 'critical';
  if (INFO_KEYWORDS.some(k => lower.includes(k))) return 'info';
  return 'required';
};

const generateItemGuide = (text: string): Partial<ChecklistItem> => {
  const lower = text.toLowerCase();
  
  // Registro de lotes
  if (lower.includes('registro') && lower.includes('lote')) {
    return {
      howTo: [
        { order: 1, instruction: "Identifique o código do lote na etiqueta do material", visualHint: "Etiqueta geralmente na ponta do perfil" },
        { order: 2, instruction: "Abra o sistema de rastreabilidade no tablet/computador", visualHint: "Ícone azul 'Rastreabilidade' na tela inicial" },
        { order: 3, instruction: "Digite o código do lote no campo 'Lote de MP'", visualHint: "Sem espaços ou caracteres especiais" },
        { order: 4, instruction: "Salve e confirme que aparece na lista de lotes ativos", visualHint: "Status deve ficar 'Registrado' em verde" }
      ],
      ifOK: {
        result: "Lote registrado com sucesso no sistema",
        action: "Prossiga com a produção normalmente",
        nextStep: "Inicie o setup da máquina",
        alertLevel: "success"
      },
      ifNOK: {
        result: "Sistema não aceita o código ou o lote não existe",
        action: "NÃO PROSSIGA - Chame o supervisor imediatamente",
        nextStep: "Verifique se o material está no estoque correto",
        alertLevel: "critical"
      },
      tips: [
        { icon: "scan", message: "Fotografe a etiqueta antes de digitar" },
        { icon: "alert", message: "Lote sem registro = não conformidade IATF" }
      ]
    };
  }
  
  // Rastrear produto acabado
  if (lower.includes('rastrear') && (lower.includes('produto acabado') || lower.includes('pallet'))) {
    return {
      howTo: [
        { order: 1, instruction: "Após finalizar a montagem, gere a etiqueta do pallet", visualHint: "Botão 'Gerar Etiqueta' no sistema" },
        { order: 2, instruction: "Aplique a etiqueta em local visível do pallet", visualHint: "Canto frontal direito, altura dos olhos" },
        { order: 3, instruction: "Escaneie o código de barras da etiqueta", visualHint: "Beep confirma leitura" },
        { order: 4, instruction: "Vincule ao lote de MP usado (escaneie o lote anterior)", visualHint: "Sistema mostra 'Vinculado'" }
      ],
      ifOK: {
        result: "Pallet vinculado ao lote de MP com sucesso",
        action: "Libere para expedição",
        nextStep: "Movimente para área de expedição",
        alertLevel: "success"
      },
      ifNOK: {
        result: "Erro no vínculo ou lote de matéria-prima não encontrado",
        action: "PARE - Não libere o pallet",
        nextStep: "Verifique o lote de MP no sistema",
        alertLevel: "critical"
      },
      tips: [
        { icon: "scan", message: "Etiqueta deve ser legível por 15 anos" },
        { icon: "lightbulb", message: "Foto do pallet finalizado como evidência" }
      ]
    };
  }
  
  // Vincular ao pedido
  if (lower.includes('vincular') && lower.includes('pedido')) {
    return {
      howTo: [
        { order: 1, instruction: "Localize o número do pedido na OP (Ordem de Produção)", visualHint: "Campo 'Pedido Cliente' na OP" },
        { order: 2, instruction: "No sistema, abra 'Vincular Pedido'", visualHint: "Menu Expedição > Vincular Pedido" },
        { order: 3, instruction: "Digite o número do pallet e o número do pedido", visualHint: "Ambos os códigos devem aparecer na tela" },
        { order: 4, instruction: "Confirme o vínculo e salve", visualHint: "Status 'Vinculado' aparece em ambos" }
      ],
      ifOK: {
        result: "Pallet vinculado ao pedido do cliente",
        action: "Pronto para expedição",
        nextStep: "Aguarde transporte",
        alertLevel: "success"
      },
      ifNOK: {
        result: "Pedido não existe ou pallet já vinculado",
        action: "Verifique a OP e chame o expedidor",
        nextStep: "Confirme número do pedido com vendas",
        alertLevel: "warning"
      },
      tips: [
        { icon: "check", message: "Sempre confira número do pedido 2x" },
        { icon: "alert", message: "Pedido errado = cliente insatisfeito" }
      ]
    };
  }
  
  // Registrar data e turno
  if (lower.includes('data') || lower.includes('turno')) {
    return {
      howTo: [
        { order: 1, instruction: "Verifique o turno atual no relógio de ponto", visualHint: "1º turno: 06-14h | 2º: 14-22h | 3º: 22-06h" },
        { order: 2, instruction: "Abra o registro de produção no sistema", visualHint: "Ícone 'Produção' no menu principal" },
        { order: 3, instruction: "Preencha data (automática), turno, e quantidade produzida", visualHint: "Data pega do sistema, preencha turno manualmente" },
        { order: 4, instruction: "Salve e tire uma captura da tela como evidência", visualHint: "Botão 'Salvar' deve ficar cinza (registro salvo)" }
      ],
      ifOK: {
        result: "Produção registrada no turno correto",
        action: "Dados disponíveis para relatório",
        nextStep: "Prossiga para próxima etapa",
        alertLevel: "success"
      },
      ifNOK: {
        result: "Sistema fora do ar ou erro ao salvar",
        action: "Anote no papel e informe supervisor",
        nextStep: "Registre manualmente quando sistema voltar",
        alertLevel: "warning"
      },
      tips: [
        { icon: "lightbulb", message: "Print da tela = evidência de registro" },
        { icon: "scan", message: "Data errada afeta indicadores do mês" }
      ]
    };
  }
  
  // Histórico 15 anos
  if (lower.includes('histórico') || lower.includes('15 anos')) {
    return {
      howTo: [
        { order: 1, instruction: "Verifique se o pallet tem etiqueta IATF válida", visualHint: "Etiqueta azul com código de barras" },
        { order: 2, instruction: "Confirme que o lote de matéria-prima e o pedido do cliente estão vinculados", visualHint: "O sistema mostra os três códigos relacionados" },
        { order: 3, instruction: "Salve o registro no sistema de arquivamento", visualHint: "Botão 'Arquivar para IATF'" },
        { order: 4, instruction: "Confira se aparece na lista 'Documentos Arquivados'", visualHint: "Status 'Arquivado IATF'" }
      ],
      ifOK: {
        result: "Documentação arquivada conforme IATF 16949",
        action: "Pallet liberado para expedição",
        nextStep: "Prossiga com expedição normal",
        alertLevel: "success"
      },
      ifNOK: {
        result: "Dados incompletos ou vínculo ausente",
        action: "COMPLETE os vínculos antes de liberar",
        nextStep: "Chame qualidade para auditoria",
        alertLevel: "critical"
      },
      tips: [
        { icon: "scan", message: "Auditoria pode pedir registro a qualquer momento" },
        { icon: "alert", message: "Sem histórico = não conformidade grave" }
      ]
    };
  }
  
  // Medição / paquímetro
  if (lower.includes('medir') || lower.includes('paquímetro') || lower.includes('comprimento')) {
    return {
      howTo: [
        { order: 1, instruction: "Posicione a peça sobre superfície plana e limpa", visualHint: "Bancada de medição, sem sujeira" },
        { order: 2, instruction: "Limpe o paquímetro e zere antes de medir", visualHint: "Feche as hastes e aperte 'ZERO'" },
        { order: 3, instruction: "Meça em 3 pontos diferentes da peça", visualHint: "Extremidades e centro" },
        { order: 4, instruction: "Compare com a especificação: ±0,5 mm ou ±0,2 mm", visualHint: "Ex.: 100 mm deve medir entre 99,5 e 100,5 mm" }
      ],
      ifOK: {
        result: "Todas as medidas dentro da tolerância",
        action: "Peça APROVADA - prossiga",
        nextStep: "Registre na ficha de inspeção",
        alertLevel: "success"
      },
      ifNOK: {
        result: "Medida FORA da tolerância especificada",
        action: "ISOLAR peça - não passe adiante",
        nextStep: "Chame supervisor e revise setup",
        alertLevel: "critical"
      },
      tips: [
        { icon: "scan", message: "Temperatura ambiente afeta medição em 0.1mm" },
        { icon: "lightbulb", message: "Calibração periódica do paquímetro é obrigatória" }
      ]
    };
  }
  
  // Tolerância
  if (lower.includes('tolerância')) {
    return {
      howTo: [
        { order: 1, instruction: "Verifique na OP qual tolerância aplicar", visualHint: "±0,5 mm padrão | ±0,2 mm precisão" },
        { order: 2, instruction: "Meça a peça na dimensão crítica", visualHint: "Use paquímetro calibrado" },
        { order: 3, instruction: "Calcule: Medida - Especificação = Desvio", visualHint: "Ex.: 100,3 - 100 = +0,3 mm" },
        { order: 4, instruction: "Se o desvio estiver dentro da tolerância: APROVADO. Senão: REPROVADO", visualHint: "±0,5 mm aceita de -0,5 a +0,5 mm" }
      ],
      ifOK: {
        result: "Peça dentro da tolerância especificada",
        action: "Libere para próxima etapa",
        nextStep: "Continue a produção",
        alertLevel: "success"
      },
      ifNOK: {
        result: "Peça FORA da tolerância (desvio excessivo)",
        action: "ISOLAR e marcar como refugo",
        nextStep: "Ajuste o stop de medida da máquina",
        alertLevel: "critical"
      },
      tips: [
        { icon: "scan", message: "Tolerância de ±0,2 mm para peças críticas" },
        { icon: "alert", message: "Peça fora da tolerância pode afetar o cliente" }
      ],
      files: [
        { name: "Ficha de Inspeção Dimensional.pdf", url: "/docs/ficha-inspecao.pdf", type: "pdf" },
        { name: "Tabela de Tolerâncias IATF.xlsx", url: "/docs/tabela-tolerancias.xlsx", type: "xls" }
      ],
      images: [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"
      ]
    };
  }
  
  // Código de barras / leitura
  if (lower.includes('código') && (lower.includes('barras') || lower.includes('ler'))) {
    return {
      howTo: [
        { order: 1, instruction: "Posicione o perfil com código de barras visível", visualHint: "Etiqueta virada para cima, sem dobras" },
        { order: 2, instruction: "Aproxime o leitor 5-10cm do código", visualHint: "Laser vermelho deve cobrir o código" },
        { order: 3, instruction: "Acione o gatilho e aguarde o 'beep'", visualHint: "Som contínuo = OK | Intermitente = erro" },
        { order: 4, instruction: "Confira na tela se o código corresponde à OP", visualHint: "Código exibido em verde = compatível" }
      ],
      ifOK: {
        result: "Código lido corretamente e compatível",
        action: "Sistema libera prosseguimento",
        nextStep: "Prossiga com o setup",
        alertLevel: "success"
      },
      ifNOK: {
        result: "Código ilegível ou INCOMPATÍVEL com OP",
        action: "ISOLAR material - não inicie o corte",
        nextStep: "Chame supervisor ou logística",
        alertLevel: "critical"
      },
      tips: [
        { icon: "scan", message: "Limpe o código se estiver sujo" },
        { icon: "lightbulb", message: "Boa iluminação facilita a leitura" }
      ]
    };
  }
  
  // Default: no guide
  return {};
};

const buildChecklist = (
  details: NodeDetails,
  fallbackLabel: string,
  operational: ReturnType<typeof normalizeOperationalMetadata>,
): ChecklistItem[] => {
  const buildTaskItem = (task: NonNullable<NodeDetails['tasks']>[number]): ChecklistItem | null => {
    const text = typeof task?.text === 'string' ? task.text.trim() : '';
    if (!text) return null;

    const suggestedGuide = generateItemGuide(text);
    const taskHowTo = Array.isArray(task.howTo) ? task.howTo.filter(Boolean) : [];
    const taskTips = Array.isArray(task.tips) ? task.tips.filter(Boolean) : [];
    const taskFiles = Array.isArray(task.files) ? task.files.filter(Boolean) : [];
    const taskImages = Array.isArray(task.images) ? task.images.filter(Boolean) : [];

    return {
      text,
      criticality: classifyItem(text),
      ...suggestedGuide,
      ...(taskHowTo.length > 0 ? { howTo: taskHowTo } : {}),
      ...(task.ifOK ? { ifOK: task.ifOK } : {}),
      ...(task.ifNOK ? { ifNOK: task.ifNOK } : {}),
      ...(taskTips.length > 0 ? { tips: taskTips } : {}),
      ...(taskFiles.length > 0 ? { files: taskFiles } : {}),
      ...(taskImages.length > 0 ? { images: taskImages } : {}),
    };
  };

  if (details?.tasks?.length) {
    const taskItems = details.tasks.slice(0, 6).map(buildTaskItem).filter(Boolean) as ChecklistItem[];
    if (taskItems.length > 0) {
      const firstItem = taskItems[0];
      if ((!firstItem.howTo || firstItem.howTo.length === 0) && Array.isArray(details.howTo) && details.howTo.length > 0) {
        firstItem.howTo = details.howTo;
      }
      if (!firstItem.ifOK && details.ifOK) firstItem.ifOK = details.ifOK;
      if (!firstItem.ifNOK && details.ifNOK) firstItem.ifNOK = details.ifNOK;
      if ((!firstItem.tips || firstItem.tips.length === 0) && Array.isArray(details.tips) && details.tips.length > 0) {
        firstItem.tips = details.tips;
      }
      return taskItems;
    }
  }

  let texts: string[] = [];
  if (operational) {
    texts = uniqueItems([
      ...operational.approvalCriteria.map((item) => `Conferir: ${item}`),
      operational.inspectionFrequency ? `Realizar inspeção: ${operational.inspectionFrequency}` : undefined,
      operational.specialCharacteristic ? `Verificar ponto crítico: ${operational.specialCharacteristic}` : undefined,
      ...operational.requiredRecords.map((item) => `Registrar: ${item}`),
      operational.traceability ? `Garantir rastreabilidade: ${operational.traceability}` : undefined,
    ], 6);
  } else if (details?.description) {
    texts = details.description
      .split(/\.|\n|;/)
      .map(item => item.trim())
      .filter(item => item.length > 6)
      .slice(0, 5);
  } else {
    texts = [
      `Confirmar condição de ${fallbackLabel || 'item'}`,
      'Validar integridade visual',
      'Registrar desvios imediatamente',
    ];
  }
  return texts.map(text => ({ 
    text, 
    criticality: classifyItem(text),
    ...generateItemGuide(text)
  }));
};

const pickImage = (details?: NodeDetails, seed = '0') => {
  if (details?.images?.length) {
    return details.images[0];
  }
  return `${FALLBACK_IMAGES[hashCode(seed) % FALLBACK_IMAGES.length]}&sat=${(hashCode(seed) % 40) + 60}`;
};

const hasVisualReference = (details?: NodeDetails) => (
  Array.isArray(details?.images) && details.images.some((image) => typeof image === 'string' && image.trim().length > 0)
);

const pickImages = (details?: NodeDetails, seed = '0'): string[] => {
  if (details?.images?.length) return details.images.slice(0, 6);
  return [`${FALLBACK_IMAGES[hashCode(seed) % FALLBACK_IMAGES.length]}&sat=${(hashCode(seed) % 40) + 60}`];
};

// File Attachment Component
const FileAttachments = ({ files }: { files: AttachedFile[] }) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'doc': return 'DOC';
      case 'xls': return 'XLS';
      case 'image': return 'IMG';
      default: return 'ARQ';
    }
  };

  return (
    <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        Arquivos para consulta
      </h4>
      <div className="space-y-2">
        {files.map((file, idx) => (
          <a
            key={idx}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
          >
            <span className="text-lg">{getFileIcon(file.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-200 truncate group-hover:text-blue-300 transition-colors">
                {file.name}
              </p>
              <p className="text-[9px] text-slate-500 uppercase">{file.type}</p>
            </div>
            <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
};

// Image Carousel Component
const ImageCarousel = ({ images }: { images: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="mt-4">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        Imagens de referência
      </h4>
      <div className="relative bg-black/30 rounded-xl overflow-hidden border border-white/10">
        {/* Main Image */}
        <div className="relative aspect-video">
          <img
            src={images[currentIndex]}
            alt={`Referência ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded-full text-[10px] text-white font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-1.5 p-2 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-12 h-8 rounded overflow-hidden flex-shrink-0 transition-all ${
                  idx === currentIndex ? 'ring-2 ring-blue-400' : 'opacity-50 hover:opacity-80'
                }`}
              >
                <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CRITICALITY_CONFIG: Record<ChecklistCriticality, { icon: string; label: string; bar: string; bg: string; border: string; text: string; glow: string }> = {
  critical: { icon: '=4', label: 'CRÍTICO',     bar: 'bg-red-500',    bg: 'bg-red-500/10',    border: 'border-red-500/40',    text: 'text-red-300',    glow: '0 0 18px rgba(239,68,68,0.35)' },
  required: { icon: '!', label: 'OBRIGATÓRIO', bar: 'bg-amber-400',  bg: 'bg-amber-400/8',   border: 'border-amber-400/30',  text: 'text-amber-300',  glow: '0 0 18px rgba(251,191,36,0.3)' },
  info:     { icon: '=5', label: 'INFORMATIVO',  bar: 'bg-blue-400',   bg: 'bg-blue-400/8',    border: 'border-blue-400/30',   text: 'text-blue-300',   glow: '0 0 18px rgba(96,165,250,0.25)' },
};

const OPERATOR_STEP_TYPE_LABELS: Record<string, string> = {
  process: 'Visão geral do processo',
  operation: 'Execução da operação',
  inspection: 'Conferência e inspeção',
  decision: 'Ponto de decisão',
  alert: 'Alerta operacional',
  risk: 'Ponto de risco',
  safety: 'Segurança obrigatória',
  ctq: 'Ponto crítico de qualidade',
  error: 'Tratativa de erro',
  deviation: 'Tratativa de desvio',
  corrective_action: 'Ação corretiva',
  root_cause: 'Causa provável',
  troubleshooting: 'Suporte rápido',
  record: 'Registro obrigatório',
  evidence: 'Evidência obrigatória',
  client: 'Requisito do cliente',
  audit: 'Ponto auditável',
  critical_point: 'Ponto crítico',
  nok: 'Fluxo de não conformidade',
  ok: 'Fluxo aprovado',
  block: 'Bloqueio operacional',
  release: 'Liberação',
};

const SUMMARY_TONE_STYLES: Record<SummaryTone, { badge: string; card: string; title: string; bullet: string }> = {
  blue: {
    badge: 'bg-blue-500/15 border border-blue-500/30 text-blue-300',
    card: 'border-blue-500/15 bg-blue-500/[0.06]',
    title: 'text-blue-300',
    bullet: 'bg-blue-400',
  },
  emerald: {
    badge: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300',
    card: 'border-emerald-500/15 bg-emerald-500/[0.06]',
    title: 'text-emerald-300',
    bullet: 'bg-emerald-400',
  },
  amber: {
    badge: 'bg-amber-500/15 border border-amber-500/30 text-amber-300',
    card: 'border-amber-500/15 bg-amber-500/[0.06]',
    title: 'text-amber-300',
    bullet: 'bg-amber-400',
  },
  violet: {
    badge: 'bg-violet-500/15 border border-violet-500/30 text-violet-300',
    card: 'border-violet-500/15 bg-violet-500/[0.06]',
    title: 'text-violet-300',
    bullet: 'bg-violet-400',
  },
  cyan: {
    badge: 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300',
    card: 'border-cyan-500/15 bg-cyan-500/[0.06]',
    title: 'text-cyan-300',
    bullet: 'bg-cyan-400',
  },
  rose: {
    badge: 'bg-rose-500/15 border border-rose-500/30 text-rose-300',
    card: 'border-rose-500/15 bg-rose-500/[0.06]',
    title: 'text-rose-300',
    bullet: 'bg-rose-400',
  },
};

const uniqueItems = (items: Array<string | undefined | null>, limit = 4) => {
  const normalized = items
    .flatMap((item) => (item ? [item] : []))
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set(normalized)).slice(0, limit);
};

const getLocalRiskWeight = (value: string) => ({ none: 0, low: 1, medium: 2, high: 3, critical: 4 }[value] || 0);

const buildOperatorSummary = (step: OperatorStep, mode: OperationalModeName) => {
  const op = step.operational;
  const isHighRisk = getLocalRiskWeight(op.riskLevel) >= 3 || op.nodeTypeAdvanced === 'block' || op.nodeTypeAdvanced === 'safety';
  const typeLabel = OPERATOR_STEP_TYPE_LABELS[op.nodeTypeAdvanced] || 'Etapa operacional';
  const badges: OperatorSummaryBadge[] = [];
  const cards: OperatorSummaryCard[] = [];

  if (op.ctq || op.specialCharacteristic) {
    badges.push({ label: 'Conferência importante', tone: 'violet' });
  }
  if (op.requiresEvidence || op.requiredRecords.length > 0) {
    badges.push({ label: 'Registro obrigatório', tone: 'blue' });
  }
  if (op.requiresApproval) {
    badges.push({ label: 'Liberação necessria', tone: 'emerald' });
  }
  if (isHighRisk) {
    badges.push({ label: 'Pare se houver desvio', tone: 'amber' });
  }
  if (mode !== 'operator' && op.auditRequired) {
    badges.push({ label: 'Ponto auditável', tone: 'cyan' });
  }

  const validateItems = uniqueItems([
    ...op.approvalCriteria,
    op.inspectionFrequency ? `Conferir: ${op.inspectionFrequency}` : undefined,
    op.specialCharacteristic ? `Verificar: ${op.specialCharacteristic}` : undefined,
  ]);

  if (validateItems.length > 0) {
    cards.push({ title: 'Como saber se está certo', tone: 'emerald', items: validateItems });
  }

  const problemItems = uniqueItems([
    ...op.nokFlow,
    ...op.reactionPlan.actions,
    ...op.troubleshooting.immediateActions,
    ...op.reactionPlan.stopProductionCriteria.map((item) => `Pare quando: ${item}`),
    ...op.troubleshooting.whoToCall.map((item) => `Acionar: ${item}`),
  ], 5);

  if (problemItems.length > 0) {
    cards.push({ title: 'Se der problema', tone: isHighRisk ? 'rose' : 'amber', items: problemItems });
  }

  const registerItems = uniqueItems([
    ...op.requiredRecords,
    ...op.evidenceExamples,
    (op.traceability && (op.requiresEvidence || op.requiredRecords.length > 0 || op.requiresApproval)) ?
       `Rastrear por: ${op.traceability}`
      : undefined,
  ]);

  if (registerItems.length > 0) {
    cards.push({ title: 'O que registrar', tone: 'blue', items: registerItems });
  }

  if (mode === 'training' || mode === 'troubleshooting') {
    const learningItems = uniqueItems([
      ...op.troubleshooting.commonFailures.map((item) => `Falha comum: ${item}`),
      ...op.troubleshooting.probableCauses.map((item) => `Causa provável: ${item}`),
      ...op.lessonsLearned,
      op.customer ? `Impacto no cliente: ${op.customer}` : undefined,
    ], 5);

    if (learningItems.length > 0) {
      cards.push({ title: mode === 'training' ? 'O que merece atenção' : 'Falhas e causas comuns', tone: 'amber', items: learningItems });
    }
  }

  return { typeLabel, badges, cards };
};

export function OperatorMode({ mapTitle, nodes, edges, nodeDetailsMap, mode = 'operator' }: OperatorModeProps) {
  const [view, setView] = useState<'home' | 'wizard' | 'complete'>('home');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [checkState, setCheckState] = useState<Record<string, boolean>>({});
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Right panel states
  const [refMode, setRefMode] = useState<'image' | 'compare'>('image');
  const [isImageCollapsed, setIsImageCollapsed] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const phases = useMemo<OperatorPhase[]>(() => {
    if (!nodes.length) return [];

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const childrenMap = new Map<string, string[]>();

    edges.forEach(edge => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, []);
      }
      childrenMap.get(edge.source)!.push(edge.target);
    });

    const isChild = new Set(edges.map(edge => edge.target));
    const rootNode = nodes.find(node => !isChild.has(node.id)) || nodes[0];

    const getChildren = (nodeId: string) => (childrenMap.get(nodeId) || []).map(id => nodeMap.get(id)).filter(Boolean) as Node[];

    const createStep = (node: Node): OperatorStep => {
      const data = (node.data || {}) as any;
      const details = nodeDetailsMap[node.id];
      const operational = normalizeOperationalMetadata(details.operational, data);
      const checklist = buildChecklist(details, data.label, operational);
      return {
        id: node.id,
        title: data.label || 'Etapa',
        description: details.description || data.description || 'Siga as instruções apresentadas nesta etapa.',
        checklist,
        rawChecklist: checklist.map(c => c.text),
        image: pickImage(details, node.id),
        images: pickImages(details, node.id),
        hasVisualReference: hasVisualReference(details),
        operational,
        severity:
          operational.riskLevel === 'high' || operational.riskLevel === 'critical' || operational.nodeTypeAdvanced === 'block' ?
             'alert'
            : operational.ctq || operational.auditRequired || operational.nodeTypeAdvanced === 'inspection' || operational.nodeTypeAdvanced === 'decision' ?
               'warning'
              : 'ok',
      };
    };

    const collectSteps = (nodeId: string, visited = new Set<string>()): OperatorStep[] => {
      if (visited.has(nodeId)) return [];
      visited.add(nodeId);
      const children = getChildren(nodeId);
      if (!children.length) {
        const node = nodeMap.get(nodeId);
        return node ? [createStep(node)] : [];
      }
      return children.flatMap(child => collectSteps(child.id, visited));
    };

    const phaseNodes = getChildren(rootNode.id);
    if (!phaseNodes.length) {
      return [{ id: rootNode.id, title: (rootNode.data as any)?.label || 'Processo', description: nodeDetailsMap[rootNode.id]?.description, steps: nodes.map(createStep) }];
    }

    return phaseNodes.map(phaseNode => {
      const steps = collectSteps(phaseNode.id).slice(0, 20);
      return {
        id: phaseNode.id,
        title: (phaseNode.data as any)?.label || 'Fase',
        description: nodeDetailsMap[phaseNode.id]?.description,
        steps: steps.length ? steps : [createStep(phaseNode)],
      };
    });
  }, [nodes, edges, nodeDetailsMap]);

  const currentPhase = phases[phaseIndex];
  const currentStep = currentPhase?.steps[stepIndex];
  const totalSteps = phases.reduce((sum, phase) => sum + phase.steps.length, 0);
  const completedSteps = phases.slice(0, phaseIndex).reduce((sum, phase) => sum + phase.steps.length, 0) + stepIndex;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const operatorSummary = useMemo(
    () => (currentStep ? buildOperatorSummary(currentStep, mode) : null),
    [currentStep, mode],
  );

  useEffect(() => {
    setCheckState({});
    const firstGuidedItem = currentStep?.checklist.find((item) => (
      (Array.isArray(item.howTo) && item.howTo.length > 0)
      || Boolean(item.ifOK)
      || Boolean(item.ifNOK)
    ));
    setExpandedItem(firstGuidedItem?.text || null);
    setIsImageCollapsed(!currentStep?.hasVisualReference);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setActiveImageIdx(0);
  }, [phaseIndex, stepIndex, currentStep]);

  const handleStart = (index = 0) => {
    setPhaseIndex(index);
    setStepIndex(0);
    setView('wizard');
  };

  const handleChecklistToggle = (itemText: string) => {
    setCheckState(prev => {
      const next = { ...prev, [itemText]: !prev[itemText] };
      return next;
    });
  };

  const handleZoom = useCallback((delta: number) => {
    setZoom(z => Math.min(4, Math.max(1, z + delta)));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, ox: panOffset.x, oy: panOffset.y };
  }, [zoom, panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || !panStart.current) return;
    setPanOffset({
      x: panStart.current.ox + (e.clientX - panStart.current.x),
      y: panStart.current.oy + (e.clientY - panStart.current.y),
    });
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const canAdvance = currentStep ? currentStep.checklist.every(item => checkState[item.text]) : false;

  const handleNext = useCallback(() => {
    if (!currentPhase || !currentStep) return;

    if (stepIndex < currentPhase.steps.length - 1) {
      setStepIndex(prev => prev + 1);
    } else if (phaseIndex < phases.length - 1) {
      setPhaseIndex(prev => prev + 1);
      setStepIndex(0);
    } else {
      setView('complete');
    }
  }, [currentPhase, currentStep, stepIndex, phaseIndex, phases.length]);

  const handleBack = useCallback(() => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    } else if (phaseIndex > 0) {
      const previousPhaseIndex = phaseIndex - 1;
      setPhaseIndex(previousPhaseIndex);
      setStepIndex(phases[previousPhaseIndex].steps.length - 1);
    } else {
      setView('home');
    }
  }, [stepIndex, phaseIndex, phases]);

  // Fullscreen API
  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  // Exit fullscreen when going home (entering wizard must be done via user interaction)
  useEffect(() => {
    if (view !== 'wizard') {
      exitFullscreen();
    }
  }, [view, exitFullscreen]);

  // Build flat list of all steps for search
  const allSteps = useMemo(() => {
    const result: { phaseIndex: number; stepIndex: number; phaseTitle: string; step: OperatorStep }[] = [];
    phases.forEach((phase, pi) => {
      phase.steps.forEach((step, si) => {
        result.push({ phaseIndex: pi, stepIndex: si, phaseTitle: phase.title, step });
      });
    });
    return result;
  }, [phases]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return allSteps;
    const q = searchQuery.toLowerCase();
    return allSteps.filter(({ step, phaseTitle }) =>
      step.title.toLowerCase().includes(q) ||
      step.description.toLowerCase().includes(q) ||
      phaseTitle.toLowerCase().includes(q) ||
      step.checklist.some(c => c.text.toLowerCase().includes(q))
    );
  }, [searchQuery, allSteps]);

  const jumpToStep = useCallback((pi: number, si: number) => {
    setPhaseIndex(pi);
    setStepIndex(si);
    setView('wizard');
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'f' || e.key === 'F') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        return;
      }
      if (searchOpen) {
        if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
        return;
      }
      if (view !== 'wizard') return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); if (canAdvance) handleNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handleBack(); }
      if (e.key === 'Escape') setView('home');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, canAdvance, handleNext, handleBack, searchOpen]);

  if (!phases.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-[#050a14]">
        Nenhum fluxo definido para exibição no modo operador.
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#060d1a] text-white flex flex-col">

      {/* PPPPPPPPPPPPPP HOME SCREEN PPPPPPPPPPPPPP */}
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col overflow-y-auto"
          >
            {/* decorative bg */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-700/15 rounded-full blur-[100px]" />
            </div>

            {/* hero */}
            <div className="relative flex flex-col items-center justify-center min-h-full px-6 sm:px-8 text-center py-10">
              <p className="text-[10px] tracking-[0.4em] uppercase text-blue-300 font-bold mb-2">
                {mode === 'training' ? 'Modo Treinamento · Aprendizado Guiado' : 'Modo Operador · Execução Guiada'}
              </p>
              <h1 
                className="font-black text-white leading-tight max-w-4xl"
                style={{
                  fontSize: mapTitle.length > 60 ? 'clamp(1.25rem, 3vw, 1.75rem)' :
                            mapTitle.length > 35 ? 'clamp(1.5rem, 4vw, 2.25rem)' :
                            'clamp(1.75rem, 5vw, 3rem)',
                  wordBreak: 'break-word'
                }}
              >{mapTitle}</h1>
              <p 
                className="text-slate-400 mt-2 max-w-xl"
                style={{ fontSize: 'clamp(0.875rem, 2vw, 1.125rem)' }}
              >
                {mode === 'training' ?
                   'Aprenda o processo com explicações simples, pontos de atenção e reação aos desvios.'
                  : 'Veja somente o essencial da etapa atual: o que fazer, como conferir e como reagir se algo sair do padrão.'}
              </p>

              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => { handleStart(0); enterFullscreen(); }}
                  className="flex items-center gap-2 bg-emerald-500 text-slate-900 font-bold text-base px-6 py-3 rounded-xl shadow-[0_12px_30px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-95 transition-all"
                >
                  <Play size={18} fill="currentColor" /> Começar
                </button>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 text-slate-300 bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  <Search size={16} /> Buscar
                </button>
                <button
                  onClick={enterFullscreen}
                  className="flex items-center gap-2 px-3 py-3 rounded-xl border border-white/10 text-slate-400 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Maximize2 size={16} />
                </button>
              </div>

              {/* phase cards */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full max-w-5xl">
                {phases.map((phase, index) => (
                  <button
                    key={phase.id}
                    onClick={() => { handleStart(index); enterFullscreen(); }}
                    className="group bg-white/5 border border-white/10 rounded-xl p-3 text-left hover:border-blue-400/60 hover:bg-white/10 transition-all active:scale-[0.97]"
                  >
                    <span className="text-[8px] font-bold text-blue-300 tracking-[0.2em] uppercase">Fase {index + 1}</span>
                    <h3 className="text-sm font-bold text-white mt-1 mb-0.5 leading-tight">{phase.title}</h3>
                    <p className="text-[10px] text-slate-500">{phase.steps.length} etapas</p>
                    <div className="mt-2 flex justify-end">
                      <ArrowRight className="text-blue-400 group-hover:translate-x-1 transition-transform" size={14} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* bottom hint */}
            <div className="relative text-center pt-4 pb-8 text-xs text-slate-600">
              Use as setas ← → do teclado ou toque nos botões para navegar
            </div>
          </motion.div>
        )}

        {/* PPPPPPPPPPPPPP WIZARD  FULLSCREEN SLIDE PPPPPPPPPPPPPP */}
        {view === 'wizard' && currentPhase && currentStep && (
          <motion.div
            key={`slide-${phaseIndex}-${stepIndex}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 flex flex-col"
          >
            {/*  HEADER BAR  */}
            <div className="shrink-0 flex min-w-0 items-center gap-2 overflow-x-auto px-3 py-2 bg-[#060d1a]/95 border-b border-white/5 z-10 sm:px-4">
              <button
                onClick={() => setView('home')}
                className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-medium transition-colors"
              >
                <Home size={13} /> Início
              </button>
              <div className="w-px h-3 bg-white/10" />
              <span className="min-w-[150px] flex-1 truncate text-[10px] text-blue-300 font-bold uppercase tracking-widest">
                Fase {phaseIndex + 1}  {currentPhase.title}
              </span>
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
              >
                <Search size={12} /> Buscar
              </button>
              <span className="text-xs text-slate-400 tabular-nums font-semibold">
                {completedSteps + 1}/{totalSteps}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                {progressPercent}%
              </span>

              {/* Expand image button - discreet when collapsed */}
              {isImageCollapsed && currentStep.hasVisualReference && (
                <button
                  onClick={() => setIsImageCollapsed(false)}
                  className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded text-[10px] text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-500/20"
                  title="Expandir imagem"
                >
                  <ImageIcon size={12} />
                  <span>Expandir</span>
                  <ChevronRight size={12} />
                </button>
              )}
            </div>

            {/*  PROGRESS BAR  */}
            <div className="shrink-0 h-1.5 bg-slate-800/60">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-300"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/*  MAIN SLIDE CONTENT  */}
            <div className={`flex-1 min-h-0 ${isImageCollapsed ? 'block overflow-y-auto' : 'grid xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] overflow-y-auto xl:overflow-hidden'}`}>

              {/* LEFT PANEL: info + checklist */}
              <div className={`flex flex-col gap-0 min-h-0 ${isImageCollapsed ? '' : 'xl:border-r xl:border-white/5'}`}>
                {/* title zone */}
                <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/5 sm:px-6 sm:pt-5">
                  <p className="text-[9px] tracking-[0.4em] uppercase text-blue-300 font-bold mb-1">Etapa</p>
                  <h2 
                    className="font-black text-white leading-tight"
                    style={{ 
                      fontSize: currentStep.title.length > 50 ? 'clamp(1rem, 2.5vw, 1.25rem)' : 
                                currentStep.title.length > 30 ? 'clamp(1.25rem, 3vw, 1.75rem)' : 
                                'clamp(1.5rem, 4vw, 2.5rem)',
                      wordBreak: 'break-word',
                      hyphens: 'auto'
                    }}
                  >{currentStep.title}</h2>
                  {currentStep.description && (
                    <p 
                      className="text-slate-400 mt-2 leading-relaxed"
                      style={{
                        fontSize: currentStep.description.length > 150 ? 'clamp(0.75rem, 1.5vw, 0.875rem)' :
                                  currentStep.description.length > 80 ? 'clamp(0.875rem, 2vw, 1rem)' :
                                  'clamp(1rem, 2.5vw, 1.125rem)',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >{currentStep.description}</p>
                  )}

                  {operatorSummary && (
                    <>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-200">
                          {operatorSummary.typeLabel}
                        </span>
                        {operatorSummary.badges.map((badge) => (
                          <span
                            key={badge.label}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${SUMMARY_TONE_STYLES[badge.tone].badge}`}
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>

                      {operatorSummary.cards.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-3">
                          {operatorSummary.cards.map((card) => (
                            <div
                              key={card.title}
                              className={`rounded-2xl border px-4 py-3 ${SUMMARY_TONE_STYLES[card.tone].card}`}
                            >
                              <p className={`text-[10px] uppercase tracking-[0.25em] font-bold ${SUMMARY_TONE_STYLES[card.tone].title}`}>
                                {card.title}
                              </p>
                              <div className="mt-2 space-y-2">
                                {card.items.map((item) => (
                                  <div key={item} className="flex items-start gap-2">
                                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${SUMMARY_TONE_STYLES[card.tone].bullet}`} />
                                    <p className="text-xs text-slate-200 leading-relaxed">{item}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* checklist  scrollable only if too many items */}
                <div className="flex-1 min-h-[220px] overflow-y-auto px-3 py-3 sm:px-5">
                  {/* criticality legend */}
                  <div className="flex flex-wrap items-center gap-2 mb-3 sm:gap-3">
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold"> Faça e marque o que já foi concluído:</p>
                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                      {(['critical','required','info'] as ChecklistCriticality[]).map(c => (
                        <span key={c} className={`text-[9px] font-bold flex items-center gap-0.5 ${CRITICALITY_CONFIG[c].text}`}>
                          {CRITICALITY_CONFIG[c].icon} {CRITICALITY_CONFIG[c].label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {currentStep.checklist.map((item, i) => {
                      const checked = checkState[item.text];
                      const cfg = CRITICALITY_CONFIG[item.criticality];
                      const isExpanded = expandedItem === item.text;
                      const hasGuide = (Array.isArray(item.howTo) && item.howTo.length > 0) || Boolean(item.ifOK) || Boolean(item.ifNOK);
                      
                      return (
                        <motion.div
                          key={i}
                          layout
                          className={`rounded-xl border overflow-hidden transition-all ${
                            checked ? 'border-emerald-400/50' : cfg.border
                          } ${isExpanded ? 'ring-2 ring-blue-500/20' : ''}`}
                          style={{
                            background: checked ? 'rgba(16,185,129,0.12)' : undefined,
                            boxShadow: checked ? '0 0 16px rgba(16,185,129,0.25)' : undefined,
                          }}
                        >
                          {/* Main item row */}
                          <motion.button
                            onClick={() => handleChecklistToggle(item.text)}
                            whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center gap-0 text-left"
                          >
                            {/* criticality bar */}
                            <div className={`shrink-0 w-1 self-stretch ${checked ? 'bg-emerald-400' : cfg.bar}`} />
                            <div className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 ${
                              checked ? '' : cfg.bg
                            }`}>
                              {/* icon */}
                              <motion.div
                                animate={checked ? { scale: [1, 1.3, 1], rotate: [0, 10, 0] } : { scale: 1 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                              >
                                <CheckCircle2
                                  className={`shrink-0 transition-colors duration-200 ${
                                    checked ? 'text-emerald-400' : 'text-slate-600'
                                  }`}
                                  size={18}
                                />
                              </motion.div>
                              {/* text */}
                              <div className="flex-1">
                                <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider mb-0.5 ${
                                  checked ? 'text-emerald-400' : cfg.text
                                }`}>
                                  {cfg.icon} {cfg.label}
                                </span>
                                <span
                                  className={`font-medium leading-snug block transition-colors ${
                                    checked ? 'text-emerald-100 line-through decoration-emerald-400/50' : 'text-slate-200'
                                  }`}
                                  style={{
                                    fontSize: item.text.length > 100 ? 'clamp(0.7rem, 1.2vw, 0.8rem)' :
                                              item.text.length > 60  ? 'clamp(0.8rem, 1.5vw, 0.9rem)' :
                                              'clamp(0.85rem, 1.8vw, 0.95rem)',
                                    wordBreak: 'break-word',
                                  }}
                                >{item.text}</span>
                              </div>
                              {/* checked badge */}
                              <AnimatePresence>
                                {checked && (
                                  <motion.span
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="shrink-0 text-[9px] font-black text-emerald-400 bg-emerald-400/15 border border-emerald-400/30 px-2 py-0.5 rounded-full"
                                  > OK</motion.span>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.button>

                          {/* Guide button - separate from check toggle */}
                          {hasGuide && (
                            <button
                              onClick={() => setExpandedItem(isExpanded ? null : item.text)}
                              className={`w-full flex items-center justify-center gap-2 py-1.5 text-[10px] font-medium transition-colors border-t ${
                                isExpanded 
                                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' 
                                  : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-300'
                              }`}
                            >
                              <Workflow size={12} />
                              <span>{isExpanded ? 'Recolher Guia de Execução' : 'Abrir Guia de Execução'}</span>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown size={12} />
                              </motion.div>
                            </button>
                          )}

                          {/* Expanded guide content */}
                          <AnimatePresence>
                            {isExpanded && hasGuide && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3 bg-[#0a0f1a] border-t border-white/5">
                                  <ActionFlow
                                    howTo={item.howTo}
                                    ifOK={item.ifOK}
                                    ifNOK={item.ifNOK}
                                    tips={item.tips}
                                  />
                                  
                                  {/* Attached Files */}
                                  {item.files && item.files.length > 0 && (
                                    <FileAttachments files={item.files} />
                                  )}
                                  
                                  {/* Image Carousel */}
                                  {item.images && item.images.length > 0 && (
                                    <ImageCarousel images={item.images} />
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* step completion banner */}
                  <AnimatePresence>
                    {canAdvance && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
                        className="mt-3 relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10"
                      >
                        {/* glow sweep */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 1.5, ease: 'easeInOut' }}
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: 2, duration: 0.4 }}
                        >
                          <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                        </motion.div>
                        <div>
                          <p className="text-xs font-black text-emerald-300"> Etapa concluída com sucesso</p>
                          <p className="text-[10px] text-emerald-400/70">Todos os itens foram confirmados. Avance para continuar.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* action bar  always at bottom */}
                <div className="sticky bottom-0 z-20 shrink-0 px-3 py-3 border-t border-white/5 bg-[#060d1a]/95 backdrop-blur-xl sm:px-5">
                  <div className="flex gap-2 items-stretch">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors sm:px-4"
                    >
                      <ChevronLeft size={16} /> Voltar
                    </button>

                    {/* Smart advance button */}
                    <div className="flex-1 relative">
                      <AnimatePresence mode="wait">
                        {!canAdvance ? (
                          /* LOCKED STATE */
                          <motion.button
                            key="locked"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                            disabled
                            className="w-full h-full flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl bg-slate-800/80 border border-white/5 cursor-not-allowed"
                          >
                            <span className="text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                              Complete os itens obrigatórios
                            </span>
                            <span className="text-slate-600 font-bold text-sm">
                              Marque o que foi feito para continuar
                            </span>
                          </motion.button>
                        ) : (
                          /* UNLOCKED STATE  animated, pulsing, inviting */
                          <motion.button
                            key="unlocked"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
                            onClick={handleNext}
                            className="w-full h-full relative overflow-hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm text-slate-900 active:scale-[0.97] transition-transform"
                            style={{
                              background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
                              boxShadow: '0 0 20px rgba(16,185,129,0.5), 0 4px 15px rgba(16,185,129,0.3)',
                            }}
                          >
                            {/* shimmer sweep */}
                            <motion.span
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                              animate={{ x: ['-120%', '220%'] }}
                              transition={{ repeat: Infinity, duration: 2, ease: 'linear', repeatDelay: 1 }}
                            />
                            <motion.span
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                            >
                              <ArrowRight size={17} strokeWidth={3} />
                            </motion.span>
                            <span className="relative z-10">
                              {phaseIndex < phases.length - 1 && stepIndex === currentPhase.steps.length - 1 ?
                                 '→ Próxima fase'
                                : stepIndex < currentPhase.steps.length - 1 ?
                                 '→ Próxima etapa'
                                : ' Concluir leitura'}
                            </span>
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL: visual reference (MES-style) with animation */}
              <AnimatePresence mode="wait">
                {!isImageCollapsed && (
                  <motion.div
                    key="right-panel"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="relative flex min-h-[320px] flex-col bg-[#040910] xl:min-h-0"
                  >

                {/*  Top toolbar  */}
                <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border-b border-white/5 bg-[#060d1a]/80 z-20">
                  <span className="text-[9px] uppercase tracking-widest text-amber-300 font-black mr-1">Referência Visual</span>
                  
                  {/* Collapse/Expand button */}
                  <button
                    onClick={() => setIsImageCollapsed(!isImageCollapsed)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      isImageCollapsed ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={isImageCollapsed ? "Expandir imagem" : "Recolher imagem"}
                  >
                    {isImageCollapsed ? (
                      <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg> Expandir</>
                    ) : (
                      <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Recolher</>
                    )}
                  </button>

                  {!isImageCollapsed && (
                    <>
                      {/* mode toggles */}
                      <button
                        onClick={() => setRefMode('image')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          refMode === 'image' ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      ><ImageIcon size={11} /> Imagem</button>
                      <button
                        onClick={() => setRefMode('compare')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          refMode === 'compare' ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' : 'text-slate-500 hover:text-slate-300'
                        }`}
                      ><Layers size={11} /> Comparar</button>
                      <div className="flex-1" />
                      {/* zoom controls */}
                      <button onClick={() => handleZoom(0.5)} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"><ZoomIn size={13} /></button>
                      <button onClick={() => handleZoom(-0.5)} disabled={zoom <= 1} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"><ZoomOut size={13} /></button>
                      <button onClick={handleResetZoom} disabled={zoom <= 1} className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"><RotateCcw size={13} /></button>
                      <span className="text-[10px] text-slate-500 tabular-nums w-8 text-right">{Math.round(zoom * 100)}%</span>
                    </>
                  )}
                </div>

                {/*  Image/Video viewer  */}
                {refMode === 'image' && (
                  <div
                    ref={imgRef}
                    className="flex-1 relative overflow-hidden"
                    style={{ cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`img-${phaseIndex}-${stepIndex}-${activeImageIdx}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                        style={{
                          transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                          transformOrigin: 'center center',
                          transition: isPanning ? 'none' : 'transform 0.2s ease',
                        }}
                      >
                        {(() => {
                          const src = currentStep.images[activeImageIdx] || currentStep.image;
                          const isVideo = src.match(/\.(mp4|webm|ogg)$/i);
                          if (isVideo) return (
                            <video
                              src={src}
                              autoPlay loop muted playsInline
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          );
                          return (
                            <img
                              src={src}
                              alt={currentStep.title}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                            />
                          );
                        })()}
                      </motion.div>
                    </AnimatePresence>
                    {/* dark overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#040910] via-transparent to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#060d1a]/20 to-transparent pointer-events-none" />

                    {/* video/gif badge */}
                    {(currentStep.images[activeImageIdx] || '').match(/\.(mp4|webm|ogg|gif)$/i) && (
                      <div className="absolute top-10 left-2 z-10">
                        <span className="flex items-center gap-1 text-[10px] font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 px-2 py-1 rounded-full backdrop-blur-sm">
                          <Video size={10} /> {(currentStep.images[activeImageIdx] || '').match(/\.gif$/i) ? 'GIF' : 'Vídeo'}
                        </span>
                      </div>
                    )}

                    {/* status badges  top-right inside viewer */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-1 rounded-full backdrop-blur-sm">✓ OK</span>
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-red-500/20 border border-red-500/40 text-red-300 px-2 py-1 rounded-full backdrop-blur-sm">× NOK</span>
                      <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-1 rounded-full backdrop-blur-sm"> Ateno</span>
                    </div>

                    {/* image thumbnails strip (if multiple) */}
                    {currentStep.images.length > 1 && (
                      <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5 px-3 z-10">
                        {currentStep.images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageIdx(idx)}
                            className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                              idx === activeImageIdx ? 'border-blue-400 scale-105' : 'border-white/10 opacity-50 hover:opacity-80'
                            }`}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/*  Compare mode  */}
                {refMode === 'compare' && (
                  <div className="flex-1 flex min-h-0 relative">
                    {/* LEFT: padrão esperado */}
                    <div className="flex-1 relative overflow-hidden">
                      <img
                        src={currentStep.images[0] || currentStep.image}
                        alt="Referência"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#040910]/90 via-transparent to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#040910]/30" />
                      {/* header label */}
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-1 rounded-lg backdrop-blur-sm"> Padro</span>
                      </div>
                      {/* bottom info */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-[10px] font-bold text-emerald-300 mb-0.5">Padro Esperado</p>
                        <p className="text-xs text-slate-300 leading-snug">{currentStep.title}</p>
                      </div>
                    </div>

                    {/* DIVIDER */}
                    <div className="shrink-0 w-px bg-white/10 relative z-10">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0d1929] border-2 border-white/20 flex items-center justify-center shadow-lg">
                        <span className="text-[9px] font-black text-slate-300">VS</span>
                      </div>
                    </div>

                    {/* RIGHT: comparação */}
                    <div className="flex-1 relative overflow-hidden">
                      {currentStep.images[1] ? (
                        <>
                          <img
                            src={currentStep.images[1]}
                            alt="Comparao"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#040910]/90 via-transparent to-transparent" />
                          <div className="absolute top-2 left-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-300 bg-blue-500/20 border border-blue-500/40 px-2 py-1 rounded-lg backdrop-blur-sm">= Referência</span>
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-[10px] font-bold text-blue-300 mb-0.5">Imagem de Referência</p>
                            <p className="text-xs text-slate-300 leading-snug">Compare com o padrão.</p>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a1020]">
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <Layers size={24} className="text-slate-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-400">Segunda imagem</p>
                            <p className="text-[11px] text-slate-600 mt-1">Adicione no editor do nó</p>
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-[10px] text-slate-500">Arraste uma imagem para o editor do nó</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}


                {/*  Bottom info (only image mode)  */}
                {refMode === 'image' && (
                  <div className="shrink-0 px-4 py-2 border-t border-white/5 bg-[#060d1a]/90 z-10">
                    <p className="text-[8px] tracking-[0.3em] uppercase text-amber-300 font-bold mb-0.5">Referência</p>
                    <p className="text-xs font-bold text-white leading-tight">{currentStep.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Confira o padrão esperado.</p>
                    {/* step dots */}
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      {currentPhase.steps.map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-full transition-all duration-300 ${
                            i < stepIndex ? 'w-4 h-1.5 bg-emerald-400' :
                            i === stepIndex ? 'w-6 h-1.5 bg-blue-400' :
                            'w-4 h-1.5 bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    )}

        {/* PPPPPPPPPPPPPP COMPLETE SCREEN PPPPPPPPPPPPPP */}
        {view === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 gap-6"
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.15),_transparent_70%)]" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-28 h-28 rounded-full bg-emerald-400/20 border-2 border-emerald-400/40 flex items-center justify-center"
            >
              <CheckCircle2 size={60} className="text-emerald-400" />
            </motion.div>
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.5em] text-emerald-300 font-bold">Leitura Concluída</p>
              <h3 className="text-5xl font-black mt-3 text-white">Excelente!</h3>
              <p className="text-xl text-slate-300 mt-3 max-w-lg">
                Você concluiu as etapas guiadas de <strong className="text-white">{mapTitle}</strong> com sucesso.
              </p>
            </div>
            <div className="relative flex flex-wrap gap-4 justify-center mt-2">
              <button
                onClick={() => handleStart(0)}
                className="px-10 py-5 rounded-2xl bg-blue-500 text-white font-black text-lg hover:bg-blue-400 transition-colors"
              >
                Repetir
              </button>
              <button
                onClick={() => setView('home')}
                className="px-10 py-5 rounded-2xl border border-white/10 text-white font-black text-lg hover:bg-white/5 transition-colors"
              >
                <Home size={20} className="inline mr-2" />Início
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* PPPPPPPPPPPPPP SEARCH MODAL PPPPPPPPPPPPPP */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center pt-20 px-4 bg-black/70 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) { setSearchOpen(false); setSearchQuery(''); } }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-[#0d1929] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                <Search size={20} className="text-slate-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar etapas, fases, tarefas..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 text-lg outline-none"
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* hint */}
              <div className="flex items-center justify-between px-5 py-2 text-xs text-slate-600">
                <span>Use ESC para fechar · Ctrl+F para abrir</span>
                <span>{searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}</span>
              </div>

              {/* results */}
              <div className="max-h-[55vh] overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="px-5 py-10 text-center text-slate-500 text-sm">Nenhum resultado encontrado.</div>
                ) : (
                  searchResults.map(({ phaseIndex: pi, stepIndex: si, phaseTitle, step }) => (
                    <button
                      key={`${pi}-${si}`}
                      onClick={() => jumpToStep(pi, si)}
                      className="w-full flex items-start gap-4 px-5 py-4 border-b border-white/5 text-left hover:bg-white/5 transition-colors group"
                    >
                      <div className="shrink-0 mt-0.5 w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <span className="text-[10px] font-black text-blue-300">{pi + 1}.{si + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-blue-300 uppercase tracking-widest font-bold mb-0.5">{phaseTitle}</p>
                        <p className="text-base font-bold text-white leading-tight group-hover:text-blue-200 transition-colors">{step.title}</p>
                        {step.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{step.description}</p>
                        )}
                        {step.checklist.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {step.checklist.slice(0, 3).map((c, i) => (
                              <span key={i} className="text-[10px] bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full">{c.text}</span>
                            ))}
                            {step.checklist.length > 3 && (
                              <span className="text-[10px] text-slate-600">+{step.checklist.length - 3} itens</span>
                            )}
                          </div>
                        )}
                      </div>
                      <ArrowRight size={16} className="shrink-0 mt-1 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
