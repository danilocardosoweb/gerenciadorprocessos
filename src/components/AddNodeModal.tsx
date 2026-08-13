import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Network, Save } from 'lucide-react';
import { Edge, Node } from '@xyflow/react';
import {
  ADVANCED_NODE_TYPE_OPTIONS,
  RISK_OPTIONS,
  SEVERITY_OPTIONS,
  createDefaultOperationalMetadata,
  getSuggestedCategoryForAdvancedType,
  type OperationalNodeMetadata,
} from '../lib/operationalModel';
import { getNextHierarchyCode, type HierarchyNumberingMode } from '../lib/hierarchy';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: {
    label: string;
    category: string;
    requiredIATF: string;
    parentId: string;
    numberCodeMode: HierarchyNumberingMode;
    manualNumberCode: string;
    operational: OperationalNodeMetadata;
  }) => void;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
}

const categories = [
  { id: 'inputs', label: 'Entradas' },
  { id: 'outputs', label: 'Saídas' },
  { id: 'resources', label: 'Recursos' },
  { id: 'people', label: 'Pessoas' },
  { id: 'methods', label: 'Métodos' },
  { id: 'kpis', label: 'Indicadores' },
  { id: 'quality', label: 'Qualidade' },
  { id: 'safety', label: 'Seguranca' },
  { id: 'alerts', label: 'Alertas' },
  { id: 'compliance', label: 'Conformidade' },
];

export function AddNodeModal({ isOpen, onClose, onAdd, nodes = [], edges = [], selectedNodeId }: AddNodeModalProps) {
  const [label, setLabel] = useState('');
  const [requiredIATF, setRequiredIATF] = useState('');
  const [parentId, setParentId] = useState(selectedNodeId || 'root');
  const [numberCodeMode, setNumberCodeMode] = useState<HierarchyNumberingMode>('numeric');
  const [manualNumberCode, setManualNumberCode] = useState('');
  const [nodeTypeAdvanced, setNodeTypeAdvanced] = useState<OperationalNodeMetadata['nodeTypeAdvanced']>('operation');
  const [category, setCategory] = useState(getSuggestedCategoryForAdvancedType('operation'));
  const [severity, setSeverity] = useState<OperationalNodeMetadata['severity']>('medium');
  const [riskLevel, setRiskLevel] = useState<OperationalNodeMetadata['riskLevel']>('none');
  const [ctq, setCtq] = useState(false);
  const [auditRequired, setAuditRequired] = useState(false);
  const [requiresEvidence, setRequiresEvidence] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [inspectionFrequency, setInspectionFrequency] = useState('');

  useEffect(() => {
    setParentId(selectedNodeId || 'root');
  }, [selectedNodeId]);

  const previewNumberCode = useMemo(() => {
    if (numberCodeMode === 'manual') {
      return manualNumberCode.trim() || 'Informe um codigo';
    }

    const parentNode = nodes.find((node) => node.id === parentId);
    const parentCode = String((parentNode.data as any).numberCode || '1.0').trim() || '1.0';

    const siblingCodes = edges
      .filter((edge) => edge.source === parentId)
      .map((edge) => nodes.find((node) => node.id === edge.target))
      .filter(Boolean)
      .map((node) => String((node!.data as any).numberCode || '').trim())
      .filter(Boolean);

    return getNextHierarchyCode(parentCode, siblingCodes, numberCodeMode === 'alpha' ? 'alpha' : 'numeric');
  }, [numberCodeMode, manualNumberCode, nodes, edges, parentId]);

  const resetForm = () => {
    setLabel('');
    setRequiredIATF('');
    setParentId(selectedNodeId || 'root');
    setNumberCodeMode('numeric');
    setManualNumberCode('');
    setNodeTypeAdvanced('operation');
    setCategory(getSuggestedCategoryForAdvancedType('operation'));
    setSeverity('medium');
    setRiskLevel('none');
    setCtq(false);
    setAuditRequired(false);
    setRequiresEvidence(false);
    setRequiresApproval(false);
    setInspectionFrequency('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const operational = createDefaultOperationalMetadata({
      nodeTypeAdvanced,
      severity,
      riskLevel,
      ctq,
      auditRequired,
      requiresEvidence,
      requiresApproval,
      inspectionFrequency,
      requiredIATF,
    });

    onAdd({
      label,
      category,
      requiredIATF,
      parentId,
      numberCodeMode,
      manualNumberCode,
      operational,
    });

    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#0f172a]/60 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="pointer-events-auto w-full max-w-3xl bg-black/40 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                    <Network size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Novo Elemento Operacional</h2>
                    <p className="text-xs text-slate-500 mt-1">Crie o no ja com estrutura industrial, criticidade e hierarquia definida.</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome do elemento</label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Ex: Conferir esquadro do corte"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tipo operacional</label>
                    <select
                      value={nodeTypeAdvanced}
                      onChange={(e) => {
                        const nextType = e.target.value as OperationalNodeMetadata['nodeTypeAdvanced'];
                        setNodeTypeAdvanced(nextType);
                        setCategory(getSuggestedCategoryForAdvancedType(nextType));
                      }}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors appearance-none"
                    >
                      {ADVANCED_NODE_TYPE_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Categoria visual</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors appearance-none"
                    >
                      {categories.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Severidade</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as OperationalNodeMetadata['severity'])}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors appearance-none"
                    >
                      {SEVERITY_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Risco</label>
                    <select
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value as OperationalNodeMetadata['riskLevel'])}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors appearance-none"
                    >
                      {RISK_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Requisito IATF</label>
                    <input
                      type="text"
                      value={requiredIATF}
                      onChange={(e) => setRequiredIATF(e.target.value)}
                      placeholder="Ex: 8.5.1"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Frequencia de inspecao</label>
                    <input
                      type="text"
                      value={inspectionFrequency}
                      onChange={(e) => setInspectionFrequency(e.target.value)}
                      placeholder="Ex: 1a peca + a cada hora"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Conectar a (pai)</label>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors appearance-none"
                    >
                      {nodes.map((node) => (
                        <option key={node.id} value={node.id}>
                          {((node.data as any).numberCode ? `${(node.data as any).numberCode} - ` : '') + (node.data.label as string)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estrutura da numeracao</label>
                    <select
                      value={numberCodeMode}
                      onChange={(e) => setNumberCodeMode(e.target.value as HierarchyNumberingMode)}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none hover:border-white/20 focus:border-blue-500/50 transition-colors appearance-none"
                    >
                      <option value="numeric">Sequencia numerica</option>
                      <option value="alpha">Detalhe alfabetico</option>
                      <option value="manual">Codigo manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Codigo do no</label>
                    <input
                      type="text"
                      value={numberCodeMode === 'manual' ? manualNumberCode : previewNumberCode}
                      onChange={(e) => setManualNumberCode(e.target.value)}
                      readOnly={numberCodeMode !== 'manual'}
                      placeholder={numberCodeMode === 'manual' ? 'Ex: 6.1.A' : ''}
                      className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors ${
                        numberCodeMode === 'manual' ?
                           'bg-white/5 border border-white/10 text-slate-200 focus:border-blue-500/50 focus:bg-white/10'
                          : 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                      }`}
                    />
                    <p className="text-[11px] text-slate-500 mt-2">
                      Numerico para sequencia do processo. Alfabetico para criterios, falhas, riscos, reacao e apoio operacional.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Exigencias operacionais</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'CTQ', value: ctq, setValue: setCtq },
                      { label: 'Auditoria', value: auditRequired, setValue: setAuditRequired },
                      { label: 'Evidencia', value: requiresEvidence, setValue: setRequiresEvidence },
                      { label: 'Aprovacao', value: requiresApproval, setValue: setRequiresApproval },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => item.setValue(!item.value)}
                        className={`px-3 py-3 rounded-xl border text-sm font-semibold transition-colors ${
                          item.value ?
                             'bg-blue-500/15 border-blue-500/30 text-blue-200'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <Save size={18} /> SALVAR ELEMENTO
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
