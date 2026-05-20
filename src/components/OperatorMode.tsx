import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2, Play, Volume2, Maximize2, Home, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Edge, Node } from '@xyflow/react';
import { NodeDetails } from './NodeModal';

interface OperatorModeProps {
  mapTitle: string;
  nodes: Node[];
  edges: Edge[];
  nodeDetailsMap: Record<string, NodeDetails>;
}

interface OperatorStep {
  id: string;
  title: string;
  description: string;
  checklist: string[];
  image: string;
  severity?: 'ok' | 'warning' | 'alert';
}

interface OperatorPhase {
  id: string;
  title: string;
  description?: string;
  steps: OperatorStep[];
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

const buildChecklist = (details?: NodeDetails, fallbackLabel?: string) => {
  if (details?.tasks?.length) {
    return details.tasks.slice(0, 5).map(task => task.text.trim()).filter(Boolean);
  }

  if (details?.description) {
    return details.description
      .split(/\.|\n|;/)
      .map(item => item.trim())
      .filter(item => item.length > 6)
      .slice(0, 4);
  }

  return [
    `Confirmar condição de ${fallbackLabel || 'item'}`,
    'Validar integridade visual',
    'Registrar desvios imediatamente',
  ];
};

const pickImage = (details?: NodeDetails, seed = '0') => {
  if (details?.images?.length) {
    return details.images[0];
  }
  return `${FALLBACK_IMAGES[hashCode(seed) % FALLBACK_IMAGES.length]}&sat=${(hashCode(seed) % 40) + 60}`;
};

export function OperatorMode({ mapTitle, nodes, edges, nodeDetailsMap }: OperatorModeProps) {
  const [view, setView] = useState<'home' | 'wizard' | 'complete'>('home');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [checkState, setCheckState] = useState<Record<string, boolean>>({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
      return {
        id: node.id,
        title: data.label || 'Etapa',
        description: details?.description || data.description || 'Siga as instruções apresentadas nesta etapa.',
        checklist: buildChecklist(details, data.label),
        image: pickImage(details, node.id),
        severity: data.nodeType === 'decision' ? 'warning' : data.nodeType === 'alert' ? 'alert' : 'ok',
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

  useEffect(() => {
    setCheckState({});
  }, [phaseIndex, stepIndex]);

  const handleStart = (index = 0) => {
    setPhaseIndex(index);
    setStepIndex(0);
    setView('wizard');
  };

  const handleChecklistToggle = (item: string) => {
    setCheckState(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const canAdvance = currentStep ? currentStep.checklist.every(item => checkState[item]) : false;

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

  if (!phases.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-300 bg-[#050a14]">
        Nenhum fluxo definido para exibição no modo operador.
      </div>
    );
  }

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

  // Auto-enter fullscreen when wizard starts; exit when going home
  useEffect(() => {
    if (view === 'wizard') {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [view, enterFullscreen, exitFullscreen]);

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
      step.checklist.some(c => c.toLowerCase().includes(q))
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

  return (
    <div className="absolute inset-0 bg-[#060d1a] text-white flex flex-col overflow-hidden">

      {/* ══════════════ HOME SCREEN ══════════════ */}
      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col overflow-hidden"
          >
            {/* decorative bg */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-700/15 rounded-full blur-[100px]" />
            </div>

            {/* hero */}
            <div className="relative flex flex-col items-center justify-center flex-1 px-8 text-center">
              <p className="text-[10px] tracking-[0.4em] uppercase text-blue-300 font-bold mb-2">Modo Operador · Execução Guiada</p>
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
                Siga as instruções passo a passo. Cada tela mostra apenas o que você precisa fazer agora.
              </p>

              <div className="mt-10 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => { handleStart(0); enterFullscreen(); }}
                  className="flex items-center gap-2 bg-emerald-500 text-slate-900 font-bold text-base px-6 py-3 rounded-xl shadow-[0_12px_30px_rgba(16,185,129,0.3)] hover:bg-emerald-400 active:scale-95 transition-all"
                >
                  <Play size={18} fill="currentColor" /> Iniciar
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
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full max-w-5xl">
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
            <div className="relative text-center pb-6 text-xs text-slate-600">
              Use as setas ← → do teclado ou toque nos botões para navegar
            </div>
          </motion.div>
        )}

        {/* ══════════════ WIZARD — FULLSCREEN SLIDE ══════════════ */}
        {view === 'wizard' && currentPhase && currentStep && (
          <motion.div
            key={`slide-${phaseIndex}-${stepIndex}`}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 flex flex-col"
          >
            {/* ── HEADER BAR ── */}
            <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#060d1a]/95 border-b border-white/5 z-10">
              <button
                onClick={() => setView('home')}
                className="flex items-center gap-1 text-slate-400 hover:text-white text-xs font-medium transition-colors"
              >
                <Home size={13} /> Início
              </button>
              <div className="w-px h-3 bg-white/10" />
              <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest truncate">
                Fase {phaseIndex + 1} — {currentPhase.title}
              </span>
              <div className="flex-1" />
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
            </div>

            {/* ── PROGRESS BAR ── */}
            <div className="shrink-0 h-1.5 bg-slate-800/60">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-emerald-400 to-amber-300"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* ── MAIN SLIDE CONTENT ── */}
            <div className="flex-1 grid lg:grid-cols-2 min-h-0">

              {/* LEFT PANEL: info + checklist */}
              <div className="flex flex-col gap-0 border-r border-white/5 min-h-0">
                {/* title zone */}
                <div className="shrink-0 px-6 pt-5 pb-3 border-b border-white/5">
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
                </div>

                {/* checklist — scrollable only if too many items */}
                <div className="flex-1 overflow-y-auto px-5 py-3">
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-2">
                    ☑ Confirme cada item:
                  </p>
                  <div className="space-y-1.5">
                    {currentStep.checklist.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => handleChecklistToggle(item)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all active:scale-[0.98] ${
                          checkState[item]
                            ? 'border-emerald-400/50 bg-emerald-400/10 text-white'
                            : 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07]'
                        }`}
                      >
                        <CheckCircle2
                          className={`shrink-0 transition-all duration-200 ${checkState[item] ? 'text-emerald-400 scale-105' : 'text-slate-700'}`}
                          size={18}
                        />
                        <span 
                          className="font-medium leading-snug"
                          style={{
                            fontSize: item.length > 100 ? 'clamp(0.7rem, 1.2vw, 0.8rem)' :
                                      item.length > 60 ? 'clamp(0.8rem, 1.5vw, 0.9rem)' :
                                      'clamp(0.9rem, 2vw, 1rem)',
                            wordBreak: 'break-word'
                          }}
                        >{item}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* action bar — always at bottom */}
                <div className="shrink-0 px-5 py-2.5 border-t border-white/5 bg-[#060d1a]/80">
                  {!canAdvance && (
                    <p className="text-[10px] text-amber-400 text-center mb-2 font-semibold">
                      ⚠️ Marque todos os itens
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors"
                    >
                      <ChevronLeft size={16} /> Voltar
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!canAdvance}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all active:scale-[0.98] ${
                        canAdvance
                          ? 'bg-emerald-400 text-slate-900 hover:bg-emerald-300 shadow-[0_8px_25px_rgba(16,185,129,0.3)]'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {canAdvance ? (
                        <>✓ Confirmar <ChevronRight size={16} /></>
                      ) : (
                        <>Marque os itens</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL: image reference */}
              <div className="relative flex flex-col min-h-0">
                {/* background image fills the panel */}
                <img
                  src={currentStep.image}
                  alt={currentStep.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060d1a] via-[#060d1a]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060d1a]/30 to-transparent" />

                {/* status badges top-right */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-1 rounded-full backdrop-blur-sm">🟩 OK</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-red-500/20 border border-red-500/40 text-red-300 px-2 py-1 rounded-full backdrop-blur-sm">🟥 NOK</span>
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-1 rounded-full backdrop-blur-sm">🟨 Atenção</span>
                </div>

                {/* bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <p className="text-[8px] tracking-[0.3em] uppercase text-amber-300 font-bold mb-0.5">Referência</p>
                  <p className="text-sm font-bold text-white leading-tight">{currentStep.title}</p>
                  <p className="text-xs text-slate-300 mt-0.5">Confira o padrão esperado.</p>

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
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════ COMPLETE SCREEN ══════════════ */}
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
              <p className="text-sm uppercase tracking-[0.5em] text-emerald-300 font-bold">Processo Concluído</p>
              <h3 className="text-5xl font-black mt-3 text-white">Excelente!</h3>
              <p className="text-xl text-slate-300 mt-3 max-w-lg">
                Todas as etapas de <strong className="text-white">{mapTitle}</strong> foram confirmadas com sucesso.
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
      {/* ══════════════ SEARCH MODAL ══════════════ */}
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
                              <span key={i} className="text-[10px] bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full">{c}</span>
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
