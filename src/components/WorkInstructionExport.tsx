import React from 'react';
import { FileText, Printer, X } from 'lucide-react';

interface WorkInstructionEdge {
  source: string;
  target: string;
}

interface WorkInstructionNodeData {
  label: string;
  nodeType: string;
  numberCode?: string;
  description?: string;
  [key: string]: any;
}

interface WorkInstructionNode {
  id: string;
  data: WorkInstructionNodeData;
}

interface WorkInstructionExportProps {
  isOpen: boolean;
  onClose: () => void;
  mapTitle: string;
  nodes: any[]; // ReactFlow Node type
  edges: WorkInstructionEdge[];
  currentUser: { name: string; email: string; role: string } | null;
}

export function WorkInstructionExport({ isOpen, onClose, mapTitle, nodes, edges, currentUser }: WorkInstructionExportProps) {
  if (!isOpen) return null;

  // Build hierarchical structure from nodes and edges
  const buildHierarchy = () => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const childrenMap = new Map<string, string[]>();
    const parentMap = new Map<string, string>();

    edges.forEach(edge => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, []);
      }
      childrenMap.get(edge.source)?.push(edge.target);
      parentMap.set(edge.target, edge.source);
    });

    // Find root node (no parent)
    const rootNode = nodes.find(n => !parentMap.has(n.id));
    
    return { rootNode, nodeMap, childrenMap };
  };

  const { rootNode: rawRootNode, nodeMap, childrenMap } = buildHierarchy();
  const rootNode = rawRootNode as WorkInstructionNode | undefined;

  // Recursive function to get all steps in order
  const getAllSteps = (nodeId: string, level = 0): Array<{ node: WorkInstructionNode; level: number; stepNumber: string }> => {
    const node = nodeMap.get(nodeId) as WorkInstructionNode;
    if (!node) return [];

    const children = childrenMap.get(nodeId) || [];
    const steps: Array<{ node: WorkInstructionNode; level: number; stepNumber: string }> = [];

    // Add current node as step (skip root at level 0)
    if (level > 0) {
      const stepNumber = node.data.numberCode || `${level}`;
      steps.push({ node, level, stepNumber });
    }

    // Process children
    children.forEach((childId, index) => {
      const childSteps = getAllSteps(childId, level + 1);
      steps.push(...childSteps);
    });

    return steps;
  };

  const allSteps = rootNode ? getAllSteps(rootNode.id, 0) : [];

  // Group steps by phase (level 1 items)
  const phases: Array<{ title: string; steps: typeof allSteps }> = [];
  let currentPhase: { title: string; steps: typeof allSteps } | null = null;

  allSteps.forEach(step => {
    if (step.level === 1) {
      if (currentPhase) {
        phases.push(currentPhase);
      }
      currentPhase = { title: step.node.data.label, steps: [] };
    } else if (currentPhase && step.level > 1) {
      currentPhase.steps.push(step);
    }
  });
  if (currentPhase) {
    phases.push(currentPhase);
  }

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('pt-BR');
  const docCode = `FIT-${mapTitle.substring(0, 3).toUpperCase()}-${new Date().getFullYear()}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:backdrop-blur-none print:static print:block print:overflow-visible">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col print:max-h-none print:rounded-none print:shadow-none print:w-full print:max-w-none">
        
        {/* Header - Hidden in print */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-400" size={24} />
            <div>
              <h2 className="text-lg font-bold">Folha de Instruções de Trabalho</h2>
              <p className="text-sm text-slate-400">Visualização para impressão</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              <Printer size={18} />
              Imprimir / Salvar PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Document Content - Printable Area */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible bg-white">
          <div className="max-w-[210mm] mx-auto print:max-w-none print:mx-0 text-gray-900">
            
            {/* Document Header */}
            <div className="border-2 border-gray-900 p-4 mb-6 print:border-2 print:border-gray-900 bg-gray-50">
              <div className="grid grid-cols-3 gap-4 mb-4 border-b-2 border-gray-900 pb-4">
                <div className="col-span-2">
                  <div className="text-xs text-gray-700 mb-1 font-semibold uppercase tracking-wider">Título do Documento</div>
                  <div className="font-bold text-xl uppercase text-black">{mapTitle}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-700 mb-1 font-semibold uppercase tracking-wider">Código</div>
                  <div className="font-bold text-lg text-black">{docCode}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="bg-white p-2 rounded border border-gray-300">
                  <div className="text-xs text-gray-700 mb-1 font-semibold uppercase">Revisão</div>
                  <div className="font-bold text-black text-base">Rev. 01</div>
                </div>
                <div className="bg-white p-2 rounded border border-gray-300">
                  <div className="text-xs text-gray-700 mb-1 font-semibold uppercase">Data</div>
                  <div className="font-bold text-black text-base">{today}</div>
                </div>
                <div className="bg-white p-2 rounded border border-gray-300">
                  <div className="text-xs text-gray-700 mb-1 font-semibold uppercase">Elaborado por</div>
                  <div className="font-bold text-black text-base truncate">{currentUser?.name || 'N/A'}</div>
                </div>
                <div className="bg-white p-2 rounded border border-gray-300">
                  <div className="text-xs text-gray-700 mb-1 font-semibold uppercase">Aprovado por</div>
                  <div className="font-bold text-gray-500 text-base">________________</div>
                </div>
              </div>
            </div>

            {/* Objective Section */}
            {rootNode && (
              <div className="mb-6 border-2 border-gray-800 p-4 print:border-2 print:border-gray-800 bg-white">
                <div className="font-bold text-base uppercase bg-gray-800 text-white px-4 py-2 -mx-4 -mt-4 mb-4 w-fit print:bg-gray-800 print:text-white shadow-sm">
                  1. OBJETIVO
                </div>
                <p className="text-base leading-relaxed text-gray-800">
                  Esta instrução tem por objetivo orientar os colaboradores sobre o procedimento operacional
                  <strong className="text-black"> "{rootNode.data.label}"</strong>, estabelecendo as etapas necessárias para execução segura e eficiente das atividades.
                </p>
              </div>
            )}

            {/* Scope Section */}
            <div className="mb-6 border-2 border-gray-800 p-4 print:border-2 print:border-gray-800 bg-white">
              <div className="font-bold text-base uppercase bg-gray-800 text-white px-4 py-2 -mx-4 -mt-4 mb-4 w-fit print:bg-gray-800 print:text-white shadow-sm">
                2. ESCOPO
              </div>
              <p className="text-base leading-relaxed text-gray-800">
                Esta instrução se aplica a todos os colaboradores envolvidos na operação de <strong className="text-black">{mapTitle}</strong>,
                incluindo operadores, técnicos e supervisores.
              </p>
            </div>

            {/* Legend */}
            <div className="mb-6 border-2 border-gray-800 p-4 print:border-2 print:border-gray-800 bg-white">
              <div className="font-bold text-base uppercase bg-gray-800 text-white px-4 py-2 -mx-4 -mt-4 mb-4 w-fit print:bg-gray-800 print:text-white shadow-sm">
                3. LEGENDA DOS SÍMBOLOS
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-blue-800 shadow-sm flex-shrink-0"></div>
                  <span className="font-medium text-gray-900">Início do processo</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="w-5 h-5 bg-emerald-600 rounded border-2 border-emerald-800 shadow-sm flex-shrink-0"></div>
                  <span className="font-medium text-gray-900">Processo/Operação</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="w-5 h-5 rounded-full bg-amber-500 border-2 border-amber-700 shadow-sm flex-shrink-0"></div>
                  <span className="font-medium text-gray-900">Decisão/Verificação</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="w-5 h-5 bg-purple-600 rotate-45 border-2 border-purple-800 shadow-sm flex-shrink-0"></div>
                  <span className="font-medium text-gray-900">Documento</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-red-800 shadow-sm flex-shrink-0"></div>
                  <span className="font-medium text-gray-900">Alerta/Segurança</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="w-5 h-5 bg-gray-700 rounded border-2 border-gray-900 shadow-sm flex-shrink-0"></div>
                  <span className="font-medium text-gray-900">Fim do processo</span>
                </div>
              </div>
            </div>

            {/* Procedure Steps */}
            <div className="mb-6 border-2 border-gray-800 p-4 print:border-2 print:border-gray-800 bg-white">
              <div className="font-bold text-base uppercase bg-gray-800 text-white px-4 py-2 -mx-4 -mt-4 mb-4 w-fit print:bg-gray-800 print:text-white shadow-sm">
                4. DESENVOLVIMENTO DA OPERAÇÃO
              </div>

              {phases.length === 0 ? (
                <div className="text-center text-gray-600 py-8 font-medium">
                  Nenhuma etapa definida no mapa mental
                </div>
              ) : (
                <div className="space-y-6">
                  {phases.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="border-2 border-gray-400 p-3 print:border-2 print:border-gray-400 bg-gray-50">
                      {/* Phase Header */}
                      <div className="font-bold text-base uppercase bg-gray-300 px-3 py-2 -mx-3 -mt-3 mb-3 border-b-2 border-gray-400 print:bg-gray-300 print:border-b-2 text-gray-900">
                        FASE {phaseIndex + 1}: {phase.title}
                      </div>

                      {/* Steps Table */}
                      <table className="w-full text-sm border-collapse border-2 border-gray-600">
                        <thead>
                          <tr className="border-b-2 border-gray-600 bg-gray-200 print:bg-gray-200">
                            <th className="text-left p-3 border-r-2 border-gray-600 w-20 font-bold text-gray-900">ETAPA</th>
                            <th className="text-left p-3 border-r-2 border-gray-600 font-bold text-gray-900">DESCRIÇÃO DA ATIVIDADE</th>
                            <th className="text-left p-3 font-bold text-gray-900">OBSERVAÇÕES</th>
                          </tr>
                        </thead>
                        <tbody>
                          {phase.steps.map((step, stepIndex) => (
                            <tr key={stepIndex} className={stepIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="p-3 border-r-2 border-gray-400 align-top font-mono text-sm font-bold text-gray-800">
                                {step.stepNumber}
                              </td>
                              <td className="p-3 border-r-2 border-gray-400 align-top">
                                <div className="font-bold text-gray-900 text-sm">{step.node.data.label}</div>
                                {step.node.data.description && (
                                  <div className="text-gray-700 mt-1 text-xs leading-relaxed">
                                    {step.node.data.description}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 align-top">
                                {step.node.data.nodeType === 'decision' && (
                                  <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-bold bg-amber-100 px-2 py-1 rounded">
                                    ⚠️ Verificar condição
                                  </span>
                                )}
                                {step.node.data.nodeType === 'document' && (
                                  <span className="inline-flex items-center gap-1 text-blue-700 text-xs font-bold bg-blue-100 px-2 py-1 rounded">
                                    📄 Gerar documentação
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Safety Warnings */}
            <div className="mb-6 border-2 border-red-600 p-4 print:border-2 print:border-red-600 bg-red-50">
              <div className="font-bold text-base uppercase bg-red-600 text-white px-4 py-2 -mx-4 -mt-4 mb-4 w-fit print:bg-red-600 print:text-white shadow-sm flex items-center gap-2">
                ⚠️ OBSERVAÇÕES DE SEGURANÇA
              </div>
              <ul className="text-base space-y-3 list-disc list-inside text-gray-800">
                <li className="font-medium">Utilizar sempre os EPIs adequados (óculos, luvas, protetor auricular conforme necessário)</li>
                <li className="font-medium">Verificar condições das máquinas e equipamentos antes de iniciar</li>
                <li className="font-medium">Em caso de dúvida, consultar o supervisor antes de prosseguir</li>
                <li className="font-medium">Manter a área de trabalho limpa e organizada</li>
              </ul>
            </div>

            {/* Approval Signatures */}
            <div className="border-2 border-gray-800 p-4 print:border-2 print:border-gray-800 bg-white">
              <div className="font-bold text-base uppercase bg-gray-800 text-white px-4 py-2 -mx-4 -mt-4 mb-4 w-fit print:bg-gray-800 print:text-white shadow-sm">
                5. CONTROLE DE REVISÕES
              </div>
              <table className="w-full text-base border-collapse border-2 border-gray-600">
                <thead>
                  <tr className="border-b-2 border-gray-600 bg-gray-200 print:bg-gray-200">
                    <th className="text-left p-3 border-r-2 border-gray-600 font-bold text-gray-900">REV.</th>
                    <th className="text-left p-3 border-r-2 border-gray-600 font-bold text-gray-900">DATA</th>
                    <th className="text-left p-3 border-r-2 border-gray-600 font-bold text-gray-900">DESCRIÇÃO</th>
                    <th className="text-left p-3 font-bold text-gray-900">RESPONSÁVEL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="p-3 border-r-2 border-gray-400 font-bold">01</td>
                    <td className="p-3 border-r-2 border-gray-400">{today}</td>
                    <td className="p-3 border-r-2 border-gray-400">Emissão inicial</td>
                    <td className="p-3 font-medium">{currentUser?.name || 'N/A'}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 border-r-2 border-gray-400">&nbsp;</td>
                    <td className="p-3 border-r-2 border-gray-400">&nbsp;</td>
                    <td className="p-3 border-r-2 border-gray-400">&nbsp;</td>
                    <td className="p-3">&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Document Footer */}
            <div className="mt-6 pt-4 border-t-2 border-gray-400 text-center text-sm text-gray-600 print:border-t-2">
              <p className="font-medium">Documento gerado automaticamente pelo sistema TecnoMapper</p>
              <p className="text-xs mt-1">{today} • {currentUser?.email || 'sistema'}</p>
            </div>

          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
