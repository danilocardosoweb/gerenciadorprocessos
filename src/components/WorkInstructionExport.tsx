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
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible">
          <div className="max-w-[210mm] mx-auto print:max-w-none print:mx-0">
            
            {/* Document Header */}
            <div className="border-2 border-black p-4 mb-6 print:border-2 print:border-black">
              <div className="grid grid-cols-3 gap-4 mb-4 border-b-2 border-black pb-4">
                <div className="col-span-2">
                  <div className="text-xs text-gray-600 mb-1">TÍTULO DO DOCUMENTO</div>
                  <div className="font-bold text-lg uppercase">{mapTitle}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-600 mb-1">CÓDIGO</div>
                  <div className="font-bold">{docCode}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-600">REVISION</div>
                  <div className="font-bold">Rev. 01</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">DATA</div>
                  <div className="font-bold">{today}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">ELABORADO POR</div>
                  <div className="font-bold">{currentUser?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">APROVADO POR</div>
                  <div className="font-bold">________________</div>
                </div>
              </div>
            </div>

            {/* Objective Section */}
            {rootNode && (
              <div className="mb-6 border-2 border-black p-4 print:border-2 print:border-black">
                <div className="font-bold text-sm uppercase bg-black text-white px-3 py-1 -mx-4 -mt-4 mb-3 w-fit print:bg-black print:text-white">
                  1. OBJETIVO
                </div>
                <p className="text-sm leading-relaxed">
                  Esta instrução tem por objetivo orientar os colaboradores sobre o procedimento operacional
                  <strong> "{rootNode.data.label}"</strong>, estabelecendo as etapas necessárias para execução segura e eficiente das atividades.
                </p>
              </div>
            )}

            {/* Scope Section */}
            <div className="mb-6 border-2 border-black p-4 print:border-2 print:border-black">
              <div className="font-bold text-sm uppercase bg-black text-white px-3 py-1 -mx-4 -mt-4 mb-3 w-fit print:bg-black print:text-white">
                2. ESCOPO
              </div>
              <p className="text-sm leading-relaxed">
                Esta instrução se aplica a todos os colaboradores envolvidos na operação de <strong>{mapTitle}</strong>,
                incluindo operadores, técnicos e supervisores.
              </p>
            </div>

            {/* Legend */}
            <div className="mb-6 border-2 border-black p-4 print:border-2 print:border-black">
              <div className="font-bold text-sm uppercase bg-black text-white px-3 py-1 -mx-4 -mt-4 mb-3 w-fit print:bg-black print:text-white">
                3. LEGENDA DOS SÍMBOLOS
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span>Início do processo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span>Processo/Operação</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span>Decisão/Verificação</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rotate-45"></div>
                  <span>Documento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Alerta/Segurança</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span>Fim do processo</span>
                </div>
              </div>
            </div>

            {/* Procedure Steps */}
            <div className="mb-6 border-2 border-black p-4 print:border-2 print:border-black">
              <div className="font-bold text-sm uppercase bg-black text-white px-3 py-1 -mx-4 -mt-4 mb-4 w-fit print:bg-black print:text-white">
                4. DESENVOLVIMENTO DA OPERAÇÃO
              </div>

              {phases.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Nenhuma etapa definida no mapa mental
                </div>
              ) : (
                <div className="space-y-6">
                  {phases.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="border border-gray-400 p-3 print:border print:border-gray-400">
                      {/* Phase Header */}
                      <div className="font-bold text-sm uppercase bg-gray-200 px-3 py-2 -mx-3 -mt-3 mb-3 border-b border-gray-400 print:bg-gray-200 print:border-b">
                        FASE {phaseIndex + 1}: {phase.title}
                      </div>

                      {/* Steps Table */}
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="border-b-2 border-black bg-gray-100 print:bg-gray-100">
                            <th className="text-left p-2 border-r border-gray-400 w-16">ETAPA</th>
                            <th className="text-left p-2 border-r border-gray-400">DESCRIÇÃO DA ATIVIDADE</th>
                            <th className="text-left p-2">OBSERVAÇÕES / PONTOS DE ATENÇÃO</th>
                          </tr>
                        </thead>
                        <tbody>
                          {phase.steps.map((step, stepIndex) => (
                            <tr key={stepIndex} className="border-b border-gray-300">
                              <td className="p-2 border-r border-gray-300 align-top font-mono text-xs">
                                {step.stepNumber}
                              </td>
                              <td className="p-2 border-r border-gray-300 align-top">
                                <div className="font-semibold">{step.node.data.label}</div>
                                {step.node.data.description && (
                                  <div className="text-gray-600 mt-1 text-xs">
                                    {step.node.data.description}
                                  </div>
                                )}
                              </td>
                              <td className="p-2 align-top">
                                {step.node.data.nodeType === 'decision' && (
                                  <span className="text-amber-600 text-xs">⚠️ Verificar condição antes de prosseguir</span>
                                )}
                                {step.node.data.nodeType === 'document' && (
                                  <span className="text-blue-600 text-xs">📄 Gerar documentação</span>
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
            <div className="mb-6 border-2 border-red-500 p-4 print:border-2 print:border-red-500">
              <div className="font-bold text-sm uppercase bg-red-500 text-white px-3 py-1 -mx-4 -mt-4 mb-3 w-fit print:bg-red-500 print:text-white">
                ⚠️ OBSERVAÇÕES DE SEGURANÇA
              </div>
              <ul className="text-sm space-y-2 list-disc list-inside">
                <li>Utilizar sempre os EPIs adequados (óculos, luvas, protetor auricular conforme necessário)</li>
                <li>Verificar condições das máquinas e equipamentos antes de iniciar</li>
                <li>Em caso de dúvida, consultar o supervisor antes de prosseguir</li>
                <li>Manter a área de trabalho limpa e organizada</li>
              </ul>
            </div>

            {/* Approval Signatures */}
            <div className="border-2 border-black p-4 print:border-2 print:border-black">
              <div className="font-bold text-sm uppercase bg-black text-white px-3 py-1 -mx-4 -mt-4 mb-4 w-fit print:bg-black print:text-white">
                5. CONTROLE DE REVISÕES
              </div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-100 print:bg-gray-100">
                    <th className="text-left p-2 border-r border-gray-400">REVISÃO</th>
                    <th className="text-left p-2 border-r border-gray-400">DATA</th>
                    <th className="text-left p-2 border-r border-gray-400">DESCRIÇÃO DA MUDANÇA</th>
                    <th className="text-left p-2">RESPONSÁVEL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="p-2 border-r border-gray-300">01</td>
                    <td className="p-2 border-r border-gray-300">{today}</td>
                    <td className="p-2 border-r border-gray-300">Emissão inicial</td>
                    <td className="p-2">{currentUser?.name || 'N/A'}</td>
                  </tr>
                  <tr className="border-b border-gray-300">
                    <td className="p-2 border-r border-gray-300">&nbsp;</td>
                    <td className="p-2 border-r border-gray-300">&nbsp;</td>
                    <td className="p-2 border-r border-gray-300">&nbsp;</td>
                    <td className="p-2">&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Document Footer */}
            <div className="mt-6 pt-4 border-t-2 border-black text-center text-xs text-gray-500 print:border-t-2">
              <p>Documento gerado automaticamente pelo sistema TecnoMapper</p>
              <p>{today} - {currentUser?.email || 'sistema'}</p>
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
