import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, ImagePlus, Plus, CheckCircle2, Circle, UploadCloud, Trash2, MessageSquare, Link, Video, Pencil, Workflow, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useComments } from '../hooks/useComments';
import { CommentsPanel } from './CommentsPanel';
import { ActionFlow } from './ActionFlow';
import { SmartTextArea, WritingSuggestionProvider } from './SmartTextArea';
import {
  ADVANCED_NODE_TYPE_OPTIONS,
  RISK_OPTIONS,
  SEVERITY_OPTIONS,
  VISUAL_PRIORITY_OPTIONS,
  createDefaultOperationalMetadata,
  normalizeOperationalMetadata,
  type OperationalModeName,
  type OperationalNodeMetadata,
} from '../lib/operationalModel';
import {
  deleteProcessMediaUrl,
  normalizeMediaSource,
  normalizeMediaSources,
  uploadProcessMediaFiles,
} from '../lib/processMedia';

interface AttachedFile {
  id: string;
  name: string;
  url: string;
  type: 'pdf' | 'doc' | 'xls' | 'image' | 'other';
}

interface NodeTask {
  id: string;
  text: string;
  completed: boolean;
  howTo?: HowToStep[];
  ifOK?: FlowOutcome;
  ifNOK?: FlowOutcome;
  tips?: QuickTip[];
  files?: AttachedFile[];
  images?: string[];
}

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

export interface NodeDetails {
  description: string;
  images: string[];
  tasks: NodeTask[];
  howTo?: HowToStep[];
  ifOK?: FlowOutcome;
  ifNOK?: FlowOutcome;
  tips?: QuickTip[];
  operational?: OperationalNodeMetadata;
}

interface NodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: any;
  nodeId: string;
  details: NodeDetails;
  onUpdateDetails: (id: string, newDetails: NodeDetails | ((prev: NodeDetails) => NodeDetails)) => void;
  onUpdateNodeLabel?: (id: string, newLabel: string) => void;
  currentUser?: { name: string; email: string; role: string } | null;
  suggestionCorpus?: string[];
  writingSuggestionsEnabled?: boolean;
  onWritingSuggestionsEnabledChange?: (enabled: boolean) => void;
}

// Task Editor Component for managing guide, files and images per task
interface TaskEditorProps {
  nodeId: string;
  task: NodeTask;
  onToggle: () => void;
  onEditText: () => void;
  onDelete: () => void;
  onUpdateTask: (task: NodeTask) => void;
}

const createGuideDraft = (task: NodeTask) => ({
  howTo: Array.isArray(task?.howTo) ? task.howTo.map((step) => ({ ...step })) : [],
  ifOK: task?.ifOK ? { ...task.ifOK } : undefined,
  ifNOK: task?.ifNOK ? { ...task.ifNOK } : undefined,
});

function TaskEditor({ nodeId, task, onToggle, onEditText, onDelete, onUpdateTask }: TaskEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'files' | 'images'>('guide');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [guideDraft, setGuideDraft] = useState(() => createGuideDraft(task));
  const taskImageInputRef = useRef<HTMLInputElement>(null);
  const howToSteps = Array.isArray(guideDraft.howTo) ? guideDraft.howTo : [];
  const attachedFiles = Array.isArray(task?.files) ? task.files : [];
  const taskImages = normalizeMediaSources(task?.images);
  const taskText = typeof task?.text === 'string' ? task.text : '';
  const guideStepsCount = howToSteps.length;
  const hasGuideChanges = JSON.stringify(guideDraft) !== JSON.stringify(createGuideDraft(task));

  useEffect(() => {
    setGuideDraft(createGuideDraft(task));
  }, [task]);

  // Add howTo step
  const addHowToStep = () => {
    const newStep: HowToStep = {
      order: howToSteps.length + 1,
      instruction: "Nova instrução...",
      visualHint: "Dica visual..."
    };
    setGuideDraft((prev) => ({
      ...prev,
      howTo: [...howToSteps, newStep],
    }));
  };

  // Update howTo step
  const updateHowToStep = (index: number, field: keyof HowToStep, value: string | number) => {
    const newHowTo = [...howToSteps];
    newHowTo[index] = { ...newHowTo[index], [field]: value };
    setGuideDraft((prev) => ({ ...prev, howTo: newHowTo }));
  };

  // Remove howTo step
  const removeHowToStep = (index: number) => {
    const newHowTo = howToSteps.filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, order: i + 1 }));
    setGuideDraft((prev) => ({ ...prev, howTo: newHowTo }));
  };

  // Update flow outcome (ifOK/ifNOK)
  const updateFlowOutcome = (type: 'ifOK' | 'ifNOK', field: keyof FlowOutcome, value: string) => {
    setGuideDraft((prev) => ({
      ...prev,
      [type]: { ...((prev[type] as FlowOutcome | undefined) || {}), [field]: value },
    }));
  };

  // Add file
  const addFile = () => {
    const name = prompt("Nome do arquivo:");
    const url = prompt("URL do arquivo:");
    if (name && url) {
      const type = name.endsWith('.pdf') ? 'pdf' : 
                   name.endsWith('.doc') || name.endsWith('.docx') ? 'doc' :
                   name.endsWith('.xls') || name.endsWith('.xlsx') ? 'xls' : 'other';
      const newFile: AttachedFile = {
        id: Date.now().toString(),
        name,
        url,
        type
      };
      onUpdateTask({ ...task, files: [...attachedFiles, newFile] });
    }
  };

  // Remove file
  const removeFile = (fileId: string) => {
    onUpdateTask({
      ...task,
      files: attachedFiles.filter(f => f.id !== fileId)
    });
  };

  // Add image URL
  const addImage = () => {
    const url = prompt("URL da imagem:");
    if (!url) return;
    try {
      new URL(url);
      setImageError('');
      onUpdateTask({ ...task, images: [...taskImages, url.trim()] });
    } catch {
      setImageError('Informe uma URL válida iniciada por http:// ou https://.');
    }
  };

  const uploadTaskImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploadingImage(true);
    setImageError('');
    try {
      const urls = await uploadProcessMediaFiles(Array.from(files), `${nodeId}-${task.id}`);
      onUpdateTask({ ...task, images: [...taskImages, ...urls] });
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.');
    } finally {
      setIsUploadingImage(false);
      if (taskImageInputRef.current) taskImageInputRef.current.value = '';
    }
  };

  // Remove image
  const removeImage = async (index: number) => {
    void deleteProcessMediaUrl(taskImages[index]);
    onUpdateTask({
      ...task,
      images: taskImages.filter((_, i) => i !== index)
    });
  };

  const hasGuide = howToSteps.length > 0 || Boolean(task.ifOK) || Boolean(task.ifNOK);
  const hasFiles = attachedFiles.length > 0;
  const hasImages = taskImages.length > 0;

  const openGuideEditor = () => {
    setGuideDraft(createGuideDraft(task));
    setIsExpanded(true);
    setActiveTab('guide');
  };

  const saveGuideChanges = () => {
    onUpdateTask({
      ...task,
      howTo: guideDraft.howTo,
      ifOK: guideDraft.ifOK,
      ifNOK: guideDraft.ifNOK,
    });
  };

  const cancelGuideChanges = () => {
    setGuideDraft(createGuideDraft(task));
  };


  return (
    <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
      {/* Task Header */}
      <div className="flex items-start gap-3 p-3 group">
        <button 
          className="mt-0.5 text-blue-400 focus:outline-none"
          onClick={onToggle}
        >
          {task.completed ? <CheckCircle2 size={18} className="text-emerald-400" /> : <Circle size={18} />}
        </button>
        <span 
          className={cn("text-sm transition-colors flex-1", task.completed ? "text-slate-500 line-through" : "text-slate-200")}
          onClick={onToggle}
          style={{ cursor: 'pointer' }}
        >
          {task.text}
        </span>
        
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              isExpanded ? "text-blue-400 bg-blue-500/10" : "text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
            )}
            title={isExpanded ? "Recolher" : "Expandir para adicionar guia, arquivos e imagens"}
          >
            <Workflow size={14} />
          </button>
          <button
            onClick={onEditText}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            title="Editar texto"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="px-3 pb-3 -mt-1 flex flex-wrap items-center gap-2">
        <p className="text-[11px] text-slate-500">
          {guideStepsCount > 0 ?
             `${guideStepsCount} passo(s) cadastrados em "Como executar"`
            : 'Ainda sem passo a passo. Cadastre aqui o "Como executar" desta ação.'}
        </p>
        <button
          onClick={openGuideEditor}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-colors"
        >
          <Workflow size={12} />
          {guideStepsCount > 0 ? 'Editar passo a passo' : 'Criar passo a passo'}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10 p-3 space-y-3">
          {/* Tab Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('guide')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === 'guide' ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:text-slate-300"
              )}
            >
              Guia ({guideStepsCount} passos)
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === 'files' ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:text-slate-300"
              )}
            >
              Arquivos ({attachedFiles.length})
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                activeTab === 'images' ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:text-slate-300"
              )}
            >
              Imagens ({taskImages.length})
            </button>
          </div>

          {/* Guide Tab */}
          {activeTab === 'guide' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-500/15 bg-blue-500/[0.05] px-3 py-2">
                <p className="text-[11px] text-slate-400">
                  {hasGuideChanges ? 'Existem alterações pendentes neste guia.' : 'As informações abaixo já estão sincronizadas com o mapa.'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelGuideChanges}
                    disabled={!hasGuideChanges}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 border border-white/10 hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveGuideChanges}
                    disabled={!hasGuideChanges}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Salvar alterações
                  </button>
                </div>
              </div>

              {/* How To Steps */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-medium text-slate-300">Como Executar (Passo a Passo)</h4>
                  <button
                    onClick={addHowToStep}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus size={12} /> Adicionar Passo
                  </button>
                </div>
                {howToSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 items-start p-2 bg-white/5 rounded-lg">
                    <span className="text-xs font-bold text-blue-400 w-5">{step.order}</span>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={step.instruction}
                        onChange={(e) => updateHowToStep(idx, 'instruction', e.target.value)}
                        className="w-full text-xs bg-transparent border-b border-white/10 focus:border-blue-500 outline-none text-slate-200"
                        placeholder="Instrução..."
                      />
                      <input
                        type="text"
                        value={step.visualHint || ''}
                        onChange={(e) => updateHowToStep(idx, 'visualHint', e.target.value)}
                        className="w-full text-xs bg-transparent border-b border-white/10 focus:border-blue-500 outline-none text-slate-400"
                        placeholder="Dica visual..."
                      />
                    </div>
                    <button
                      onClick={() => removeHowToStep(idx)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* If OK */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-2">
                <h4 className="text-xs font-medium text-emerald-300"> Se OK (Quando der certo)</h4>
                <input
                  type="text"
                  value={guideDraft.ifOK?.result || ''}
                  onChange={(e) => updateFlowOutcome('ifOK', 'result', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-emerald-500/30 focus:border-emerald-400 outline-none text-slate-200"
                  placeholder="Resultado esperado..."
                />
                <input
                  type="text"
                  value={guideDraft.ifOK?.action || ''}
                  onChange={(e) => updateFlowOutcome('ifOK', 'action', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-emerald-500/30 focus:border-emerald-400 outline-none text-slate-200"
                  placeholder="Ação a tomar..."
                />
                <input
                  type="text"
                  value={guideDraft.ifOK?.nextStep || ''}
                  onChange={(e) => updateFlowOutcome('ifOK', 'nextStep', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-emerald-500/30 focus:border-emerald-400 outline-none text-slate-300"
                  placeholder="Próximo passo..."
                />
              </div>

              {/* If NOK */}
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2">
                <h4 className="text-xs font-medium text-red-300">Se NOK (Quando der errado)</h4>
                <input
                  type="text"
                  value={guideDraft.ifNOK?.result || ''}
                  onChange={(e) => updateFlowOutcome('ifNOK', 'result', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-red-500/30 focus:border-red-400 outline-none text-slate-200"
                  placeholder="Resultado quando der errado..."
                />
                <input
                  type="text"
                  value={guideDraft.ifNOK?.action || ''}
                  onChange={(e) => updateFlowOutcome('ifNOK', 'action', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-red-500/30 focus:border-red-400 outline-none text-slate-200"
                  placeholder="Ação corretiva..."
                />
                <input
                  type="text"
                  value={guideDraft.ifNOK?.nextStep || ''}
                  onChange={(e) => updateFlowOutcome('ifNOK', 'nextStep', e.target.value)}
                  className="w-full text-xs bg-transparent border-b border-red-500/30 focus:border-red-400 outline-none text-slate-300"
                  placeholder="O que fazer agora..."
                />
              </div>
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-medium text-slate-300">Arquivos Anexados</h4>
                <button
                  onClick={addFile}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus size={12} /> Adicionar Arquivo
                </button>
              </div>
              {attachedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <span className="text-lg">
                    {file.type === 'pdf' ? 'PDF' : file.type === 'doc' ? 'DOC' : file.type === 'xls' ? 'XLS' : 'ARQ'}
                  </span>
                  <span className="flex-1 text-xs text-slate-300 truncate">{file.name}</span>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Link size={14} />
                  </a>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-medium text-slate-300">Imagens desta ação</h4>
                  <p className="text-[10px] text-slate-500">Específicas para: {taskText.substring(0, 30)}{taskText.length > 30 ? '...' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={taskImageInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm,video/ogg"
                    className="hidden"
                    onChange={(event) => void uploadTaskImages(event.target.files)}
                  />
                  <button
                    onClick={() => taskImageInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 flex items-center gap-1"
                  >
                    {isUploadingImage ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                    Enviar
                  </button>
                  <button
                    onClick={addImage}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Link size={12} /> URL
                  </button>
                </div>
              </div>
              {imageError && <p className="text-[10px] text-red-400">{imageError}</p>}
              <div className="grid grid-cols-2 gap-2">
                {taskImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Imagem ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const parseListValue = (value: string) =>
  value
    .split(/\r\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);

function OperationalListEditor({
  label,
  value,
  placeholder,
  onChange,
  suggestionCorpus,
}: {
  label: string;
  value: string[];
  placeholder: string;
  onChange: (value: string[]) => void;
  suggestionCorpus?: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</label>
      <SmartTextArea
        value={value.join('\n')}
        onValueChange={(nextValue) => onChange(parseListValue(nextValue))}
        corpus={suggestionCorpus}
        placeholder={placeholder}
        className="w-full min-h-[86px] p-3 pb-12 text-xs rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-y"
      />
      <p className="text-[10px] text-slate-500">Use uma linha por item.</p>
    </div>
  );
}

const normalizeGuideAnchor = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^\s*\d+(?:[\.\-]\d+)*\s*/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isPrimaryGuideTask = (task: NodeTask, nodeLabel: string, allTasks: NodeTask[]) => {
  if (!task) return false;
  if (allTasks.length <= 1) return true;
  if (typeof task.id === 'string' && task.id.startsWith('root-task')) return true;

  const normalizedTask = normalizeGuideAnchor(task.text || '');
  const normalizedLabel = normalizeGuideAnchor(nodeLabel || '');

  if (!normalizedTask || !normalizedLabel) return false;
  return normalizedTask === normalizedLabel
    || normalizedTask.includes(normalizedLabel)
    || normalizedLabel.includes(normalizedTask);
};

export function NodeModal({ isOpen, onClose, nodeData, nodeId, details: rawDetails, onUpdateDetails, onUpdateNodeLabel, currentUser, suggestionCorpus = [], writingSuggestionsEnabled = true, onWritingSuggestionsEnabledChange }: NodeModalProps) {
  const safeNodeData = nodeData || {};
  const details: NodeDetails = {
    ...(rawDetails || {}),
    description: typeof rawDetails?.description === 'string' ? rawDetails.description : '',
    images: normalizeMediaSources(rawDetails?.images),
    tasks: Array.isArray(rawDetails?.tasks)
      ? rawDetails.tasks.filter(Boolean).map((task, index) => ({
          ...task,
          id: String(task?.id || `${nodeId}-task-${index + 1}`),
          text: typeof task?.text === 'string' ? task.text : `Ação ${index + 1}`,
          completed: Boolean(task?.completed),
          howTo: Array.isArray(task?.howTo) ? task.howTo.filter(Boolean) : [],
          images: normalizeMediaSources(task?.images),
          files: Array.isArray(task?.files) ? task.files.filter(Boolean) : [],
        }))
      : [],
  };
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaUploadError, setMediaUploadError] = useState('');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(safeNodeData.label || '');
  const operational = normalizeOperationalMetadata(details.operational, safeNodeData);

  const updateOperational = <K extends keyof OperationalNodeMetadata>(field: K, value: OperationalNodeMetadata[K]) => {
    onUpdateDetails(nodeId, {
      ...details,
      operational: {
        ...operational,
        [field]: value,
      },
    });
  };

  const updateReactionPlan = <K extends keyof OperationalNodeMetadata['reactionPlan']>(
    field: K,
    value: OperationalNodeMetadata['reactionPlan'][K],
  ) => {
    updateOperational('reactionPlan', {
      ...operational.reactionPlan,
      [field]: value,
    });
  };

  const updateTroubleshooting = <K extends keyof OperationalNodeMetadata['troubleshooting']>(
    field: K,
    value: OperationalNodeMetadata['troubleshooting'][K],
  ) => {
    updateOperational('troubleshooting', {
      ...operational.troubleshooting,
      [field]: value,
    });
  };

  const toggleOperationalMode = (mode: OperationalModeName) => {
    const nextModes = operational.operationalMode.includes(mode) ?
       operational.operationalMode.filter((entry) => entry !== mode)
      : [...operational.operationalMode, mode];
    updateOperational('operationalMode', nextModes);
  };

  // Update label value when nodeData changes
  useEffect(() => {
    setLabelValue(safeNodeData.label || '');
  }, [safeNodeData.label]);

  const handleLabelSave = () => {
    if (labelValue.trim() && labelValue !== nodeData?.label && onUpdateNodeLabel) {
      onUpdateNodeLabel(nodeId, labelValue.trim());
    }
    setIsEditingLabel(false);
  };

  const handleLabelCancel = () => {
    setLabelValue(safeNodeData.label || '');
    setIsEditingLabel(false);
  };

  // Comments functionality
  const {
    comments,
    unresolvedCount,
    addComment,
    resolveComment,
    deleteComment,
  } = useComments(nodeId);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    if (!files.length || isUploadingMedia) return;
    setIsUploadingMedia(true);
    setMediaUploadError('');
    try {
      const uploadedUrls = await uploadProcessMediaFiles(Array.from(files), nodeId);
      onUpdateDetails(nodeId, {
        ...details,
        images: [...normalizeMediaSources(details.images), ...uploadedUrls],
      });
    } catch (error) {
      setMediaUploadError(error instanceof Error ? error.message : 'Não foi possível enviar a mídia.');
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    try {
      new URL(url);
      setUrlError('');
      const currentImages = details.images || [];
      onUpdateDetails(nodeId, { ...details, images: [...currentImages, url] });
      setUrlInput('');
    } catch {
      setUrlError('URL inválida. Use http:// ou https://');
    }
  };

  const isVideo = (src: string) => /\.(mp4|webm|ogg)$/i.test(src);
  const isGif   = (src: string) => /\.gif$/i.test(src);

  const removeImage = (index: number) => {
    const currentImages = normalizeMediaSources(details.images);
    void deleteProcessMediaUrl(currentImages[index]);
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    onUpdateDetails(nodeId, { ...details, images: newImages });
  };

  const toggleTask = (taskId: string) => {
    const currentTasks = details.tasks || [];
    const newTasks = currentTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    onUpdateDetails(nodeId, { ...details, tasks: newTasks });
  };

  const addTask = () => {
    const text = prompt("Digite a nova ação:");
    if (text) {
      const newTask = { id: Date.now().toString(), text, completed: false };
      const currentTasks = details.tasks || [];
      onUpdateDetails(nodeId, { ...details, tasks: [...currentTasks, newTask] });
    }
  };

  const deleteTask = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir esta ação?')) {
      const currentTasks = details.tasks || [];
      const newTasks = currentTasks.filter(t => t.id !== taskId);
      onUpdateDetails(nodeId, { ...details, tasks: newTasks });
    }
  };

  const editTask = (taskId: string, currentText: string) => {
    const newText = prompt("Editar ação:", currentText);
    if (newText && newText !== currentText) {
      const currentTasks = details.tasks || [];
      const newTasks = currentTasks.map(t => t.id === taskId ? { ...t, text: newText } : t);
      onUpdateDetails(nodeId, { ...details, tasks: newTasks });
    }
  };


  const hasTaskImages = Boolean(details.tasks.some((task) => task.images && task.images.length > 0));
  const generalMediaCount = details.images.length || 0;

  return (
    <WritingSuggestionProvider corpus={suggestionCorpus} enabled={writingSuggestionsEnabled}>
    <AnimatePresence>
      {isOpen && nodeData && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#0f172a]/60 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-[96vw] xl:max-w-6xl 2xl:max-w-7xl h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[92vh] overflow-hidden flex flex-col bg-[#080f1d]/98 sm:bg-black/40 backdrop-blur-2xl border-0 sm:border border-white/20 shadow-2xl rounded-none sm:rounded-3xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 p-3 sm:p-6 border-b border-white/10 bg-white/5 safe-top">
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
                  <div className="mt-0.5 shrink-0 p-2.5 sm:p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                    <Info className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditingLabel ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={labelValue}
                          onChange={(e) => setLabelValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleLabelSave();
                            if (e.key === 'Escape') handleLabelCancel();
                          }}
                          autoFocus
                          className="flex-1 px-3 py-1.5 bg-black/30 border border-blue-500/50 rounded-lg text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <button
                          onClick={handleLabelSave}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Salvar"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button
                          onClick={handleLabelCancel}
                          className="p-1.5 text-slate-400 hover:bg-white/10 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex min-w-0 items-start gap-2 group">
                        <h2 
                          className="min-w-0 break-words text-lg sm:text-2xl font-bold leading-tight text-white tracking-tight cursor-pointer hover:text-blue-300 transition-colors"
                          onClick={() => setIsEditingLabel(true)}
                          title="Clique para editar"
                        >
                          {safeNodeData.label || 'Nó sem título'}
                        </h2>
                        <button
                          onClick={() => setIsEditingLabel(true)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                          title="Editar título"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                        {safeNodeData.category || safeNodeData.nodeType || 'processo'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
                  {onWritingSuggestionsEnabledChange && (
                    <button
                      type="button"
                      onClick={() => onWritingSuggestionsEnabledChange(!writingSuggestionsEnabled)}
                      className={cn(
                        'hidden sm:flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
                        writingSuggestionsEnabled
                          ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
                          : 'border-white/10 bg-white/5 text-slate-500 hover:text-slate-300',
                      )}
                      title="Sugestões locais de palavras e frases. Use Tab para aceitar."
                    >
                      <span className="text-sm">✦</span>
                      Sugestões {writingSuggestionsEnabled ? 'ativas' : 'desativadas'}
                    </button>
                  )}
                  <button
                    onClick={() => setIsCommentsOpen(true)}
                    className="p-2 sm:p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
                    title="Comentários"
                  >
                    <MessageSquare size={24} />
                    {unresolvedCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unresolvedCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 sm:p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content Grid */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-6">
                {/* Left Column: Info & Tasks */}
                <div className="contents">
                  <section className="xl:order-1 xl:col-span-7 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                      Detalhes Analíticos
                    </h3>
                    <SmartTextArea
                      value={details.description}
                      onValueChange={(description) => onUpdateDetails(nodeId, { ...details, description })}
                      corpus={suggestionCorpus}
                      className="w-full min-h-[150px] sm:h-40 p-4 pb-14 text-sm rounded-xl border border-white/10 bg-white/5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-y shadow-inner"
                      placeholder="Descreva o contexto, especificações ou impactos deste nó no processo..."
                    />
                  </section>

                  <section className="xl:order-3 xl:col-span-12 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                          Inteligência Operacional
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Configure criticidade, CTQ, auditoria, reação, troubleshooting e rastreabilidade.
                        </p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 font-semibold whitespace-nowrap">
                        {ADVANCED_NODE_TYPE_OPTIONS.find((item) => item.value === operational.nodeTypeAdvanced)?.label || 'Operação'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-3 xl:grid-cols-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tipo avançado</label>
                        <select
                          value={operational.nodeTypeAdvanced}
                          onChange={(e) => {
                            const nextMeta = createDefaultOperationalMetadata({
                              ...operational,
                              nodeTypeAdvanced: e.target.value as OperationalNodeMetadata['nodeTypeAdvanced'],
                            });
                            onUpdateDetails(nodeId, { ...details, operational: nextMeta });
                          }}
                          className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors"
                        >
                          {ADVANCED_NODE_TYPE_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Severidade</label>
                        <select
                          value={operational.severity}
                          onChange={(e) => updateOperational('severity', e.target.value as OperationalNodeMetadata['severity'])}
                          className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors"
                        >
                          {SEVERITY_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Risco</label>
                        <select
                          value={operational.riskLevel}
                          onChange={(e) => updateOperational('riskLevel', e.target.value as OperationalNodeMetadata['riskLevel'])}
                          className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors"
                        >
                          {RISK_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Prioridade visual</label>
                        <select
                          value={operational.visualPriority}
                          onChange={(e) => updateOperational('visualPriority', e.target.value as OperationalNodeMetadata['visualPriority'])}
                          className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors"
                        >
                          {VISUAL_PRIORITY_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Frequência de inspeção</label>
                        <input
                          type="text"
                          value={operational.inspectionFrequency}
                          onChange={(e) => updateOperational('inspectionFrequency', e.target.value)}
                          placeholder="Ex: 1ª peça + a cada 2 horas"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Requisito IATF</label>
                        <input
                          type="text"
                          value={operational.requiredIATF}
                          onChange={(e) => updateOperational('requiredIATF', e.target.value)}
                          placeholder="Ex: 8.5.1.3"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Característica especial / CTQ</label>
                        <input
                          type="text"
                          value={operational.specialCharacteristic}
                          onChange={(e) => updateOperational('specialCharacteristic', e.target.value)}
                          placeholder="Ex: perpendicularidade / comprimento crítico"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Impacto / requisito do cliente</label>
                        <input
                          type="text"
                          value={operational.customer}
                          onChange={(e) => updateOperational('customer', e.target.value)}
                          placeholder="Ex: cliente automotivo / superfície visível"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Rastreabilidade / registro mestre</label>
                        <input
                          type="text"
                          value={operational.traceability}
                          onChange={(e) => updateOperational('traceability', e.target.value)}
                          placeholder="Ex: lote MP + ficha dimensional + etiqueta final"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                      {[
                        { key: 'ctq', label: 'CTQ / característica especial' },
                        { key: 'auditRequired', label: 'Exige auditoria em processo' },
                        { key: 'requiresEvidence', label: 'Exige evidência obrigatória' },
                        { key: 'requiresApproval', label: 'Exige aprovação / liberação' },
                      ].map((item) => {
                        const currentValue = Boolean(operational[item.key as keyof OperationalNodeMetadata]);
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => updateOperational(item.key as keyof OperationalNodeMetadata, (!currentValue) as never)}
                            className={cn(
                              'text-left px-3 py-3 rounded-xl border transition-colors',
                              currentValue ?
                                 'bg-blue-500/15 border-blue-500/30 text-blue-200'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200',
                            )}
                          >
                            <span className="block text-xs font-semibold leading-snug">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Modos operacionais aplicáveis</label>
                      <div className="flex flex-wrap gap-2">
                        {(['operator', 'quality', 'audit', 'troubleshooting', 'training'] as OperationalModeName[]).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => toggleOperationalMode(mode)}
                            className={cn(
                              'px-3 py-2 rounded-full text-xs font-semibold border transition-colors',
                              operational.operationalMode.includes(mode) ?
                                 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200',
                            )}
                          >
                            {mode === 'operator' && 'Operador'}
                            {mode === 'quality' && 'Qualidade'}
                            {mode === 'audit' && 'Auditoria'}
                            {mode === 'troubleshooting' && 'Troubleshooting'}
                            {mode === 'training' && 'Treinamento'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <OperationalListEditor
                        label="Critrios de aprovação"
                        value={operational.approvalCriteria}
                        placeholder="Ex: medida dentro da tolerância&#10;etiqueta legível&#10;registro preenchido"
                        onChange={(value) => updateOperational('approvalCriteria', value)}
                      />
                      <OperationalListEditor
                        label="Registros obrigatórios"
                        value={operational.requiredRecords}
                        placeholder="Ex: ficha de inspeção&#10;check-list de setup&#10;registro do lote"
                        onChange={(value) => updateOperational('requiredRecords', value)}
                      />
                      <OperationalListEditor
                        label="Fluxo OK / liberação"
                        value={operational.okFlow}
                        placeholder="Ex: liberar produção&#10;registrar aprovação&#10;seguir processo"
                        onChange={(value) => updateOperational('okFlow', value)}
                      />
                      <OperationalListEditor
                        label="Fluxo NOK / contenção"
                        value={operational.nokFlow}
                        placeholder="Ex: parar máquina&#10;segregar lote&#10;chamar qualidade"
                        onChange={(value) => updateOperational('nokFlow', value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <OperationalListEditor
                        label="Evidências esperadas"
                        value={operational.evidenceExamples}
                        placeholder="Ex: foto da peça&#10;assinatura do inspetor&#10;print do sistema"
                        onChange={(value) => updateOperational('evidenceExamples', value)}
                      />
                      <OperationalListEditor
                        label="Lições aprendidas"
                        value={operational.lessonsLearned}
                        placeholder="Ex: revisar batente a cada troca&#10;validar disco antes da partida"
                        onChange={(value) => updateOperational('lessonsLearned', value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="space-y-3 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                        <div>
                          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Plano de reação</h4>
                          <p className="text-[11px] text-slate-500 mt-1">Plano padrão de ao em desvio, contenção e escalonamento.</p>
                        </div>
                        <input
                          type="text"
                          value={operational.reactionPlan.trigger}
                          onChange={(e) => updateReactionPlan('trigger', e.target.value)}
                          placeholder="Gatilho do plano de reação"
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500/40"
                        />
                        <input
                          type="text"
                          value={operational.reactionPlan.owner}
                          onChange={(e) => updateReactionPlan('owner', e.target.value)}
                          placeholder="Responsável pelo escalonamento"
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-emerald-500/40"
                        />
                        <OperationalListEditor
                          label="Ações imediatas"
                          value={operational.reactionPlan.actions}
                          placeholder="Ex: interromper operação&#10;validar ltimas peças"
                          onChange={(value) => updateReactionPlan('actions', value)}
                        />
                        <OperationalListEditor
                          label="Conteno"
                          value={operational.reactionPlan.containmentActions}
                          placeholder="Ex: bloquear lote&#10;abrir ocorrência"
                          onChange={(value) => updateReactionPlan('containmentActions', value)}
                        />
                        <OperationalListEditor
                          label="Escalonamento"
                          value={operational.reactionPlan.escalationActions}
                          placeholder="Ex: acionar qualidade&#10;chamar engenharia"
                          onChange={(value) => updateReactionPlan('escalationActions', value)}
                        />
                        <OperationalListEditor
                          label="Quando parar produção"
                          value={operational.reactionPlan.stopProductionCriteria}
                          placeholder="Ex: 2 peças NOK seguidas&#10;risco ao operador"
                          onChange={(value) => updateReactionPlan('stopProductionCriteria', value)}
                        />
                      </div>

                      <div className="space-y-3 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
                        <div>
                          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-widest">Troubleshooting</h4>
                          <p className="text-[11px] text-slate-500 mt-1">Falhas, sintomas, causas prováveis, parada e quem acionar.</p>
                        </div>
                        <OperationalListEditor
                          label="Falhas comuns"
                          value={operational.troubleshooting.commonFailures}
                          placeholder="Ex: corte fora de esquadro&#10;rebarba excessiva"
                          onChange={(value) => updateTroubleshooting('commonFailures', value)}
                        />
                        <OperationalListEditor
                          label="Sintomas"
                          value={operational.troubleshooting.symptoms}
                          placeholder="Ex: variao dimensional&#10;marcas superficiais"
                          onChange={(value) => updateTroubleshooting('symptoms', value)}
                        />
                        <OperationalListEditor
                          label="Causas prováveis"
                          value={operational.troubleshooting.probableCauses}
                          placeholder="Ex: disco gasto&#10;perfil mal fixado"
                          onChange={(value) => updateTroubleshooting('probableCauses', value)}
                        />
                        <OperationalListEditor
                          label="Ações imediatas"
                          value={operational.troubleshooting.immediateActions}
                          placeholder="Ex: parar máquina&#10;refazer setup"
                          onChange={(value) => updateTroubleshooting('immediateActions', value)}
                        />
                        <OperationalListEditor
                          label="Quando parar a máquina"
                          value={operational.troubleshooting.stopCriteria}
                          placeholder="Ex: falha repetitiva&#10;risco ao operador"
                          onChange={(value) => updateTroubleshooting('stopCriteria', value)}
                        />
                        <OperationalListEditor
                          label="Quem acionar"
                          value={operational.troubleshooting.whoToCall}
                          placeholder="Ex: supervisor&#10;qualidade&#10;manuteno"
                          onChange={(value) => updateTroubleshooting('whoToCall', value)}
                        />
                        <OperationalListEditor
                          label="Evidência obrigatória"
                          value={operational.troubleshooting.requiredEvidence}
                          placeholder="Ex: foto da falha&#10;peça segregada identificada"
                          onChange={(value) => updateTroubleshooting('requiredEvidence', value)}
                        />
                        <div className="space-y-2">
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Impacto no cliente</label>
                          <textarea
                            value={operational.troubleshooting.customerImpact}
                            onChange={(e) => updateTroubleshooting('customerImpact', e.target.value)}
                            placeholder="Explique o impacto provável no cliente ou no processo seguinte."
                            className="w-full min-h-[90px] p-3 text-xs rounded-xl border border-white/10 bg-black/20 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Action Flow Guide - Didactic visualization */}
                  {(details.howTo || details.ifOK || details.ifNOK) && (
                    <section className="xl:order-4 xl:col-span-12 rounded-2xl border border-purple-500/15 bg-purple-500/[0.04] p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Workflow className="w-4 h-4 text-purple-400" />
                        <h3 className="text-sm font-bold text-purple-300 uppercase tracking-widest">
                          Guia de Execução
                        </h3>
                      </div>
                      <ActionFlow 
                        howTo={details.howTo}
                        ifOK={details.ifOK}
                        ifNOK={details.ifNOK}
                        tips={details.tips}
                      />
                    </section>
                  )}

                  <section className={cn(
                    'rounded-2xl border border-white/10 bg-white/[0.035] p-5',
                    hasTaskImages ? 'xl:order-5 xl:col-span-7' : 'xl:order-5 xl:col-span-12',
                  )}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                        Ações & Evidências
                      </h3>
                      <button onClick={addTask} className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-colors">
                        <Plus size={14} /> Adicionar
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {(!details.tasks || details.tasks.length === 0) ? (
                        <div className="text-sm text-slate-500 italic p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                          Nenhuma ação registrada.
                        </div>
                      ) : (
                        details.tasks.map(task => (
                          <TaskEditor
                            key={task.id}
                            nodeId={nodeId}
                            task={task}
                            onToggle={() => toggleTask(task.id)}
                            onEditText={() => editTask(task.id, task.text)}
                            onDelete={() => deleteTask(task.id)}
                            onUpdateTask={(updatedTask) => {
                              // Use functional update to ensure we have latest details
                              onUpdateDetails(nodeId, (prevDetails: NodeDetails) => {
                                const currentDetails = prevDetails || details;
                                const currentTasks = Array.isArray(currentDetails.tasks) ? currentDetails.tasks : [];
                                const newTasks = currentTasks.map(t => t.id === task.id ? updatedTask : t);
                                if (!isPrimaryGuideTask(updatedTask, safeNodeData.label || '', currentTasks)) {
                                  return { ...currentDetails, tasks: newTasks };
                                }

                                return {
                                  ...currentDetails,
                                  tasks: newTasks,
                                  howTo: Array.isArray(updatedTask.howTo) ? updatedTask.howTo : currentDetails.howTo,
                                  ifOK: updatedTask.ifOK || currentDetails.ifOK,
                                  ifNOK: updatedTask.ifNOK || currentDetails.ifNOK,
                                  tips: Array.isArray(updatedTask.tips) ? updatedTask.tips : currentDetails.tips,
                                };
                              });
                            }}
                          />
                        ))
                      )}
                    </div>
                  </section>

                  {/* Task Images Gallery - Separate section for all task images */}
                  {details.tasks && details.tasks.some(t => t.images && t.images.length > 0) && (
                    <section className="xl:order-6 xl:col-span-5 rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <ImagePlus size={16} className="text-amber-400" />
                          <h3 className="text-sm font-bold text-amber-300 uppercase tracking-widest">
                            Imagens das ações
                          </h3>
                          <span className="text-xs text-slate-500">
                            ({details.tasks.reduce((acc, t) => acc + (t.images?.length || 0), 0)} imagens)
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 italic">
                          Imagens específicas de cada ação/evidência
                        </p>
                      </div>
                      <div className="grid grid-cols-2 2xl:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                        {details.tasks.map(task => 
                          task.images?.map((img, idx) => (
                            <div key={`${task.id}-${idx}`} className="relative group">
                              <img 
                                src={img} 
                                alt={`${task.text} - Imagem ${idx + 1}`} 
                                className="w-full h-24 object-cover rounded-lg border border-white/10" 
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-2">
                                <p className="text-[10px] text-white truncate">{task.text}</p>
                                <button
                                  onClick={() => {
                                    void deleteProcessMediaUrl(normalizeMediaSource(img));
                                    const newImages = task.images?.filter((_, i) => i !== idx) || [];
                                    onUpdateDetails(nodeId, (prevDetails: NodeDetails) => {
                                      const currentDetails = prevDetails || details;
                                      const currentTasks = Array.isArray(currentDetails.tasks) ? currentDetails.tasks : [];
                                      const newTasks = currentTasks.map(t => 
                                        t.id === task.id ? { ...t, images: newImages } : t
                                      );
                                      return { ...currentDetails, tasks: newTasks };
                                    });
                                  }}
                                  className="absolute top-1 right-1 p-1 bg-red-500/80 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </section>
                  )}
                </div>

                {/* Right Column: Media Gallery - Node Level Images */}
                <div className="xl:order-2 xl:col-span-5 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <ImagePlus size={16} /> Imagens do Processo (Geral)
                      </h3>
                      <p className="text-xs text-slate-500 mt-2">Imagens de referência geral deste nó/processo</p>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 font-semibold whitespace-nowrap">
                      {generalMediaCount} arquivo(s)
                    </div>
                  </div>
                  
                  {/* Dropzone */}
                  <div
                    className={cn(
                      "w-full min-h-[170px] p-5 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-colors cursor-pointer",
                      dragActive ? "border-blue-400 bg-blue-500/10" : "border-white/20 bg-white/5 hover:bg-white/10",
                      isUploadingMedia && "pointer-events-none opacity-70"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingMedia ? (
                      <Loader2 size={28} className="mb-2 animate-spin text-blue-400" />
                    ) : (
                      <UploadCloud size={28} className={dragActive ? "text-blue-400 mb-2" : "text-slate-400 mb-2"} />
                    )}
                    <p className="text-sm text-slate-300 font-medium mb-0.5">
                      {isUploadingMedia ? 'Enviando mídia...' : 'Arraste ou clique para enviar'}
                    </p>
                    <p className="text-xs text-slate-500">PNG · JPG · GIF · MP4 · WebM</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/mp4,video/webm,video/ogg"
                      onChange={handleChange}
                      disabled={isUploadingMedia}
                      className="hidden"
                    />
                  </div>
                  {mediaUploadError && (
                    <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                      {mediaUploadError}
                    </p>
                  )}

                  {/* URL input */}
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1"><Link size={10} /> Ou cole uma URL (imagem • GIF • vídeo)</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoComplete="off"
                        value={urlInput}
                        onChange={e => { setUrlInput(e.target.value); setUrlError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
                        placeholder="https://example.com/referencia.jpg"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors"
                      />
                      <button
                        onClick={handleAddUrl}
                        className="px-3 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold hover:bg-blue-500/30 transition-colors"
                      >Adicionar</button>
                    </div>
                    {urlError && <p className="text-[10px] text-red-400">{urlError}</p>}
                  </div>

                  {/* Media Grid */}
                  {details.images && details.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[380px] pr-1 custom-scrollbar">
                      {details.images.map((src, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video bg-black/50 border border-white/10">
                          {/* type badge */}
                          <div className="absolute top-1.5 left-1.5 z-10">
                            {isVideo(src) && (
                              <span className="flex items-center gap-1 text-[9px] font-bold bg-purple-500/70 text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                <Video size={9} /> Vídeo
                              </span>
                            )}
                            {isGif(src) && (
                              <span className="text-[9px] font-bold bg-pink-500/70 text-white px-1.5 py-0.5 rounded-md backdrop-blur-sm">GIF</span>
                            )}
                          </div>
                          {/* media */}
                          {isVideo(src) ? (
                            <video src={src} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <img src={src} alt="Evidence" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                          )}
                          {/* order badge */}
                          <div className="absolute top-1.5 right-1.5 z-10">
                            <span className="text-[9px] font-black text-white bg-black/50 px-1.5 py-0.5 rounded-md backdrop-blur-sm">#{idx + 1}</span>
                          </div>
                          {/* delete overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                              className="p-2 bg-rose-500/90 text-white rounded-full hover:bg-rose-500 transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(!details.images || details.images.length === 0) && (
                    <div className="rounded-2xl border border-white/10 bg-black/10 px-4 py-6 text-center">
                      <p className="text-sm text-slate-500">Nenhuma midia adicionada ainda.</p>
                      <p className="text-xs text-slate-600 mt-1">Use imagens gerais para referencia visual do processo inteiro.</p>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          </div>

          {/* Comments Panel */}
          <CommentsPanel
            isOpen={isCommentsOpen}
            onClose={() => setIsCommentsOpen(false)}
            comments={comments}
            currentUser={currentUser || null}
            onAddComment={(text) => addComment(currentUser?.name || 'Usuário', currentUser?.email || '', text)}
            onResolveComment={resolveComment}
            onDeleteComment={deleteComment}
            nodeName={safeNodeData.label || 'Nó'}
          />
        </>
      )}
    </AnimatePresence>
    </WritingSuggestionProvider>
  );
}
