import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, FileText, Loader2, Settings2, ShieldCheck, X } from 'lucide-react';
import { downloadBlob, generateWordDocument, wordFilename } from '../lib/wordDocument';

interface WorkInstructionExportProps {
  isOpen: boolean;
  onClose: () => void;
  mapTitle: string;
  nodes: any[];
  edges: any[];
  nodeDetails: Record<string, any>;
  currentUser: { name: string; email: string; role: string; department?: string } | null;
}

const today = () => new Date().toLocaleDateString('pt-BR');

const deriveCode = (title: string) => {
  const words = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .split(/[^A-Z0-9]+/)
    .filter(Boolean);
  const acronym = words.slice(0, 4).map((word) => word.slice(0, 3)).join('-');
  return `POP-${acronym || 'PROCESSO'}-001`;
};

const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0b1528] px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-600';

export function WorkInstructionExport({
  isOpen,
  onClose,
  mapTitle,
  nodes,
  edges,
  nodeDetails,
  currentUser,
}: WorkInstructionExportProps) {
  const [documentCode, setDocumentCode] = useState('');
  const [revision, setRevision] = useState('Rev. 00');
  const [sector, setSector] = useState('Corte e Acabados');
  const [equipment, setEquipment] = useState('Serra Doppia 2 Cabeças');
  const [preparedBy, setPreparedBy] = useState('');
  const [approvedBy, setApprovedBy] = useState('A definir');
  const [effectiveDate, setEffectiveDate] = useState(today());
  const [includeTechnical, setIncludeTechnical] = useState(true);
  const [includeTasks, setIncludeTasks] = useState(true);
  const [includeRecords, setIncludeRecords] = useState(true);
  const [includeTroubleshooting, setIncludeTroubleshooting] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setDocumentCode(deriveCode(mapTitle));
    setPreparedBy(currentUser?.name || 'A definir');
    setSector(currentUser?.department || 'Corte e Acabados');
    setErrorMessage('');
  }, [isOpen, mapTitle, currentUser]);

  const stats = useMemo(() => {
    const details = Object.values(nodeDetails || {});
    return {
      nodes: nodes.filter((node) => node?.id && node?.data).length,
      instructions: details.reduce((total, detail: any) => total + (Array.isArray(detail?.tasks) ? detail.tasks.length : 0), 0),
      records: details.reduce((total, detail: any) => total + (Array.isArray(detail?.operational?.requiredRecords) ? detail.operational.requiredRecords.length : 0), 0),
      risks: details.filter((detail: any) => ['high', 'critical'].includes(detail?.operational?.riskLevel)).length,
    };
  }, [nodes, nodeDetails]);

  if (!isOpen) return null;

  const handleGenerateWord = async () => {
    setErrorMessage('');
    setIsGenerating(true);
    try {
      const blob = await generateWordDocument({
        mapTitle,
        documentCode,
        revision,
        sector,
        equipment,
        preparedBy,
        approvedBy,
        effectiveDate,
        includeTechnical,
        includeTasks,
        includeRecords,
        includeTroubleshooting,
        nodes,
        edges,
        nodeDetails,
      });
      downloadBlob(blob, wordFilename(mapTitle));
    } catch (error) {
      console.error('Error generating Word document:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível gerar o documento Word.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#020817]/85 p-4 backdrop-blur-md">
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#111d32] shadow-2xl shadow-blue-950/50">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-[#12284b] to-[#17213a] px-6 py-5 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-blue-400/25 bg-blue-500/15 p-3 text-blue-300">
              <FileText size={26} />
            </div>
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.28em] text-blue-300">Documento controlado</p>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Gerar Procedimento em Word</h2>
              <p className="mt-1 max-w-3xl text-sm text-slate-400">Converta o mapa completo em um documento profissional para aprovação, treinamento e impressão.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Fechar">
            <X size={22} />
          </button>
        </header>

        <div className="grid flex-1 overflow-y-auto lg:grid-cols-[1.35fr_0.65fr]">
          <main className="space-y-7 p-6 sm:p-8">
            <section>
              <div className="mb-4 flex items-center gap-2 text-white">
                <Settings2 size={18} className="text-blue-300" />
                <h3 className="font-bold">Identificação e controle</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Código do documento
                  <input value={documentCode} onChange={(event) => setDocumentCode(event.target.value)} className={fieldClass} />
                </label>
                <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Revisão
                  <input value={revision} onChange={(event) => setRevision(event.target.value)} className={fieldClass} />
                </label>
                <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Setor
                  <input value={sector} onChange={(event) => setSector(event.target.value)} className={fieldClass} />
                </label>
                <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Equipamento
                  <input value={equipment} onChange={(event) => setEquipment(event.target.value)} className={fieldClass} />
                </label>
                <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Elaborado por
                  <input value={preparedBy} onChange={(event) => setPreparedBy(event.target.value)} className={fieldClass} />
                </label>
                <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Aprovado por
                  <input value={approvedBy} onChange={(event) => setApprovedBy(event.target.value)} className={fieldClass} />
                </label>
                <label className="space-y-2 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:col-span-2">
                  Data de vigência
                  <input value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} className={fieldClass} />
                </label>
              </div>
            </section>

            <section>
              <h3 className="mb-4 font-bold text-white">Conteúdo do documento</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { checked: includeTechnical, set: setIncludeTechnical, title: 'Controles técnicos', text: 'CTQ, inspeção, IATF, risco e aprovação.' },
                  { checked: includeTasks, set: setIncludeTasks, title: 'Instruções de execução', text: 'Tarefas, como executar e critérios OK/NOK.' },
                  { checked: includeRecords, set: setIncludeRecords, title: 'Registros e evidências', text: 'Comprovação, rastreabilidade e assinaturas.' },
                  { checked: includeTroubleshooting, set: setIncludeTroubleshooting, title: 'Falhas e reação', text: 'Causas, contenção, parada e escalonamento.' },
                ].map((item) => (
                  <label key={item.title} className="flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-blue-400/35 hover:bg-blue-500/5">
                    <input type="checkbox" checked={item.checked} onChange={(event) => item.set(event.target.checked)} className="mt-1 h-4 w-4 accent-blue-500" />
                    <span>
                      <span className="block text-sm font-bold text-slate-100">{item.title}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-slate-500">{item.text}</span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {errorMessage && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{errorMessage}</div>}
          </main>

          <aside className="border-t border-white/10 bg-[#0c1729] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="sticky top-0 space-y-5">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] p-5">
                <div className="mb-3 flex items-center gap-2 font-bold text-emerald-300"><ShieldCheck size={20} /> Estrutura profissional</div>
                <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
                  {['Capa e identificação documental', 'Definições de Procedimento, Instrução e Registro', 'Hierarquia numerada do mapa', 'Controle de revisão e assinaturas', 'Cabeçalho, rodapé e páginas numeradas'].map((text) => (
                    <li key={text} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />{text}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[['Nós', stats.nodes], ['Instruções', stats.instructions], ['Registros', stats.records], ['Riscos altos', stats.risks]].map(([label, value]) => (
                  <div key={String(label)} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
                    <div className="mt-1 text-xl font-bold text-white">{value}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-4 text-xs leading-relaxed text-amber-100/80">
                Campos não preenchidos no mapa não serão inventados. O Word indicará “A definir” somente nos controles obrigatórios, facilitando a revisão antes da aprovação.
              </div>

              <button
                onClick={handleGenerateWord}
                disabled={isGenerating || !nodes.length}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={19} className="animate-spin" /> : <Download size={19} />}
                {isGenerating ? 'Gerando documento...' : 'Gerar Word (.docx)'}
              </button>
              <p className="text-center text-xs leading-relaxed text-slate-500">Abra o arquivo no Word para revisar, aprovar e imprimir com a paginação correta.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
