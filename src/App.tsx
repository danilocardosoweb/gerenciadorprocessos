import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { initialNodes, initialEdges, emptyMapTemplate } from './data';
import { getLayoutedElements } from './lib/layout';
import { MindMapNode } from './components/MindMapNode';
import { Settings2, Download, Plus, Play, ChevronRight, ChevronLeft, Square, Target, ArrowLeft, Search, X, Image as ImageIcon, FileCode, Camera, Save, History, RotateCcw, Trash2, FileText, LogOut, Clock, LayoutGrid, Move } from 'lucide-react';
import { NodeModal, NodeDetails } from './components/NodeModal';
import { AddNodeModal } from './components/AddNodeModal';
import { Node } from '@xyflow/react';
import confetti from 'canvas-confetti';
import { Dashboard } from './components/Dashboard';
import { MarkdownView } from './components/MarkdownView';
import { Sector3DView } from './components/Sector3DView';
import { nodeDetailsSeed } from './data/nodeDetails';
import { tramontinaNodeDetails } from './data/nodeDetailsTramontina';
import { corteSerrasNodeDetails } from './data/nodeDetailsCorteSerras';
import { Login } from './components/Login';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { usePreferences } from './hooks/usePreferences';
import { useAuditLog } from './hooks/useAuditLog';
import { useVersionHistory } from './hooks/useVersionHistory';
import { useToast, ToastContainer } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { useConfirm } from './hooks/useConfirm';
import { useKeyboardShortcuts, useAppShortcuts } from './hooks/useKeyboardShortcuts';
import { WorkInstructionExport } from './components/WorkInstructionExport';
import { OperatorMode } from './components/OperatorMode';
import { usePermissions } from './lib/permissions';

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges,
  'hierarchical'
);

function Flow({ mapId, mapTitle, onBack, currentUser }: { mapId: string, mapTitle: string, onBack: () => void, currentUser: { id: string; name: string; email: string; role: string } | null }) {
  const { setCenter, fitView, getNodes, getEdges } = useReactFlow();
  
  const [layoutMode, setLayoutMode] = useState<'manual' | 'auto'>('auto');
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutMode === 'auto' ? layoutedNodes : initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [mapWorkflowStatus, setMapWorkflowStatus] = useState<string | null>(null);
  const [mapCreatedBy, setMapCreatedBy] = useState<string | null>(null);
  
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Presentation State
  const [hoveredNodePosition, setHoveredNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [presentationPath, setPresentationPath] = useState<string[]>([]);
  const [presentationIndex, setPresentationIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [viewMode, setViewMode] = useState<'technical' | 'operator'>('technical');
  const [hoveredNode, setHoveredNode] = useState<any | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number, y: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Toast notifications
  const { toasts, removeToast, success } = useToast();
  
  // Confirm modal state
  const { confirm, confirmState, closeConfirm, handleConfirm } = useConfirm();
  
  // Centralized permissions
  const perms = usePermissions(currentUser as any);

  // Auto-arrange function
  const handleAutoLayout = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = getLayoutedElements(getNodes(), getEdges(), 'hierarchical');
    setNodes(newNodes);
    setEdges(newEdges);
    setLayoutMode('auto');
    fitView({ duration: 800 });
  }, [getNodes, getEdges, setNodes, setEdges, fitView]);

  // Toggle layout mode
  const toggleLayoutMode = useCallback(() => {
    const newMode = layoutMode === 'auto' ? 'manual' : 'auto';
    setLayoutMode(newMode);
    if (newMode === 'auto') {
      handleAutoLayout();
    }
  }, [layoutMode, handleAutoLayout]);
  
  // Delete node function - admins always can, creators can when in review/needs_revision
  const handleDeleteNode = useCallback((nodeId: string) => {
    const isAdmin = perms.can.deleteNode;
    const isCreator = currentUser?.id === mapCreatedBy;
    const isEditableStatus = mapWorkflowStatus === 'review' || mapWorkflowStatus === 'needs_revision' || mapWorkflowStatus === 'draft';
    
    if (!isAdmin && !(isCreator && isEditableStatus)) {
      alert('❌ Você não tem permissão para excluir nós. Apenas Administradores ou o criador (quando em revisão) podem realizar esta ação.');
      return;
    }
    
    // Remove node
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    
    // Remove connected edges
    setEdges((prev) => prev.filter((e) => e.source !== nodeId && e.target !== nodeId));
    
    success('Nó excluído', 'O nó foi removido com sucesso');
  }, [perms.can.deleteNode, currentUser?.id, mapCreatedBy, mapWorkflowStatus, setNodes, setEdges, success]);
  
  // Delete node with confirmation
  const handleDeleteNodeWithConfirm = useCallback(async (nodeId: string) => {
    const confirmed = await confirm({
      title: 'EXCLUIR NÓ?',
      message: 'Esta ação irá EXCLUIR este nó permanentemente.\n\nEsta ação NÃO pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });
    
    if (confirmed) {
      handleDeleteNode(nodeId);
    }
  }, [confirm, handleDeleteNode]);

  // Update nodes with isAdmin and onDelete props
  const nodesWithAdminProps = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        isAdmin: perms.isAdmin,
        isPresenting,
        onDeleteConfirm: handleDeleteNodeWithConfirm,
      },
    }));
  }, [nodes, perms.isAdmin, isPresenting, handleDeleteNodeWithConfirm]);

  // Keyboard shortcuts
  useAppShortcuts({
    onSave: () => success('Salvo!', 'Alterações salvas com sucesso'),
    onSearch: () => setIsSearchOpen(true),
    onAdd: () => setIsAddModalOpen(true),
    onPresent: () => startPresentation(),
    onBack: () => { if (selectedNodeId) closeModal(); else onBack(); },
  });

  // Calculate smart tooltip position to keep it on screen
  const getTooltipPosition = () => {
    if (!hoverPosition) return { left: 0, top: 0 };

    const tooltipWidth = 480;
    const tooltipHeight = 300; // estimated max height
    const padding = 20;

    let left = hoverPosition.x;
    let top = hoverPosition.y - tooltipHeight - padding;

    // Prevent going off left edge
    if (left - tooltipWidth / 2 < padding) {
      left = tooltipWidth / 2 + padding;
    }
    // Prevent going off right edge
    if (left + tooltipWidth / 2 > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth / 2 - padding;
    }
    // If too close to top, show below the cursor instead
    if (top < padding) {
      top = hoverPosition.y + padding;
    }

    return { left, top };
  };

  const tooltipPos = getTooltipPosition();

  const [nodeDetailsMap, setNodeDetailsMap] = useState<Record<string, NodeDetails>>(nodeDetailsSeed);
  
  // Load nodes and edges from Supabase when mapId changes
  useEffect(() => {
    if (!mapId) return;
    
    const loadMapData = async () => {
      try {
        const { supabase } = await import('./lib/supabase');
        const { data, error } = await supabase
          .from('process_items')
          .select('nodes, edges, title, node_details, workflow_status, created_by')
          .eq('id', mapId)
          .single();
        
        if (error) {
          console.error('Error loading map data:', error);
          return;
        }
        
        if (data?.nodes && data?.edges) {
          // Apply layout to loaded nodes and edges
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            data.nodes,
            data.edges,
            'LR'
          );
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          console.log('Map data loaded from database:', data.nodes.length, 'nodes,', data.edges.length, 'edges');
          
          // Load saved node_details from database if exists
          if (data.node_details) {
            setNodeDetailsMap((prev) => ({
              ...prev,
              ...data.node_details
            }));
            console.log('Node details loaded from database:', Object.keys(data.node_details).length, 'nodes');
          }
          
          // If this is the Tramontina map, integrate the detailed descriptions
          if (data.title?.toLowerCase().includes('tramontina') || mapTitle?.toLowerCase().includes('tramontina')) {
            console.log('Detected Tramontina map - integrating detailed node descriptions...');
            
            // Create a mapping of normalized labels to details for fuzzy matching
            const labelToDetailsMap: Record<string, NodeDetails> = {};
            tramontinaNodeDetails.forEach(detail => {
              // Normalize the label for matching (lowercase, remove special chars)
              const normalizedLabel = detail.id.toLowerCase().replace(/[^a-z0-9]/g, '');
              labelToDetailsMap[normalizedLabel] = {
                description: detail.description,
                images: [],
                tasks: detail.actions.map((action, index) => ({
                  id: `task-${detail.id}-${index}`,
                  text: action,
                  completed: false
                }))
              };
            });
            
            // Match nodes by their label/content
            const matchedDetails: Record<string, NodeDetails> = {};
            let matchCount = 0;
            
            data.nodes.forEach((node: any) => {
              const nodeLabel = (node.data?.label || '').toLowerCase();
              const normalizedNodeLabel = nodeLabel.replace(/[^a-z0-9]/g, '');
              
              // Try exact match first
              let matchedDetail: NodeDetails | null = null;
              let matchedId: string | null = null;
              
              // Check if any tramontina detail ID matches part of the node label
              for (const [detailId, detail] of Object.entries(labelToDetailsMap)) {
                if (normalizedNodeLabel.includes(detailId) || detailId.includes(normalizedNodeLabel.substring(0, 10))) {
                  matchedDetail = detail;
                  matchedId = detailId;
                  break;
                }
              }
              
              // Also try matching by keywords in the label
              if (!matchedDetail) {
                // Keyword matching for specific sections
                if (nodeLabel.includes('pallet') && nodeLabel.includes('integridade')) {
                  matchedDetail = labelToDetailsMap['e1integridade'];
                } else if (nodeLabel.includes('pallet') && nodeLabel.includes('limpo')) {
                  matchedDetail = labelToDetailsMap['e1limpo'];
                } else if (nodeLabel.includes('código') || nodeLabel.includes('codigo')) {
                  matchedDetail = labelToDetailsMap['e2codigo'];
                } else if (nodeLabel.includes('lote')) {
                  matchedDetail = labelToDetailsMap['e2lote'];
                } else if (nodeLabel.includes('comprimento') || nodeLabel.includes('medida')) {
                  matchedDetail = labelToDetailsMap['e2comprimento'];
                } else if (nodeLabel.includes('pedido')) {
                  matchedDetail = labelToDetailsMap['e2pedido'];
                } else if (nodeLabel.includes('alinhar') || nodeLabel.includes('alinhamento')) {
                  matchedDetail = labelToDetailsMap['e3alinhar'];
                } else if (nodeLabel.includes('peso') && nodeLabel.includes('uniforme')) {
                  matchedDetail = labelToDetailsMap['e3peso'];
                } else if (nodeLabel.includes('laterais') || nodeLabel.includes('sarrafos')) {
                  matchedDetail = labelToDetailsMap['e4laterais'];
                } else if (nodeLabel.includes('travessas')) {
                  matchedDetail = labelToDetailsMap['e4travessas'];
                } else if (nodeLabel.includes('fita') || nodeLabel.includes('pet')) {
                  matchedDetail = labelToDetailsMap['e5verticais'];
                } else if (nodeLabel.includes('stretch')) {
                  matchedDetail = labelToDetailsMap['e6base'];
                } else if (nodeLabel.includes('tela') || nodeLabel.includes('frontal')) {
                  matchedDetail = labelToDetailsMap['e7tela'];
                } else if (nodeLabel.includes('etiqueta') && nodeLabel.includes('visível')) {
                  matchedDetail = labelToDetailsMap['e8etiqueta'];
                } else if (nodeLabel.includes('inspeção') || nodeLabel.includes('final')) {
                  matchedDetail = labelToDetailsMap['e9alinhados'];
                } else if (nodeLabel.includes('iatf') || nodeLabel.includes('controle')) {
                  matchedDetail = labelToDetailsMap['iatfrastreabilidade'];
                } else if (nodeLabel.includes('segurança') || nodeLabel.includes('epi')) {
                  matchedDetail = labelToDetailsMap['segoculos'];
                }
              }
              
              if (matchedDetail && node.id) {
                matchedDetails[node.id] = matchedDetail;
                matchCount++;
              }
            });
            
            console.log(`Matched ${matchCount} nodes with detailed descriptions`);
            
            // Merge with existing nodeDetailsMap
            setNodeDetailsMap(prev => ({
              ...prev,
              ...matchedDetails
            }));
            
            if (matchCount > 0) {
              console.log(`Successfully integrated ${matchCount} detailed node descriptions`);
            } else {
              console.log('No matches found. Node labels:', data.nodes.map((n: any) => n.data?.label).slice(0, 10));
            }
          }
          
          // If this is the Corte em Serras map, integrate the detailed descriptions
          if (data.title?.toLowerCase().includes('corte') || data.title?.toLowerCase().includes('serra') || 
              mapTitle?.toLowerCase().includes('corte') || mapTitle?.toLowerCase().includes('serra')) {
            console.log('Detected Corte em Serras map - integrating detailed node descriptions...');
            
            // Create a mapping of normalized labels to details for fuzzy matching
            const corteLabelToDetailsMap: Record<string, NodeDetails> = {};
            corteSerrasNodeDetails.forEach(detail => {
              // Normalize the label for matching (lowercase, remove special chars)
              const normalizedLabel = detail.id.toLowerCase().replace(/[^a-z0-9]/g, '');
              corteLabelToDetailsMap[normalizedLabel] = {
                description: detail.description,
                images: [],
                tasks: detail.actions.map((action, index) => ({
                  id: `task-${detail.id}-${index}`,
                  text: action,
                  completed: false
                }))
              };
            });
            
            // Match nodes by their label/content
            const corteMatchedDetails: Record<string, NodeDetails> = {};
            let corteMatchCount = 0;
            
            data.nodes.forEach((node: any) => {
              const nodeLabel = (node.data?.label || '').toLowerCase();
              const normalizedNodeLabel = nodeLabel.replace(/[^a-z0-9]/g, '');
              
              // Try exact match first
              let matchedDetail: NodeDetails | null = null;
              
              // Check if any corte detail ID matches part of the node label
              for (const [detailId, detail] of Object.entries(corteLabelToDetailsMap)) {
                if (normalizedNodeLabel.includes(detailId) || detailId.includes(normalizedNodeLabel.substring(0, 10))) {
                  matchedDetail = detail;
                  break;
                }
              }
              
              // Also try matching by keywords in the label
              if (!matchedDetail) {
                // Keyword matching for specific sections
                if (nodeLabel.includes('material') && (nodeLabel.includes('receb') || nodeLabel.includes('confer'))) {
                  matchedDetail = corteLabelToDetailsMap['inmaterial'];
                } else if (nodeLabel.includes('op') || nodeLabel.includes('ordem') || nodeLabel.includes('produção')) {
                  matchedDetail = corteLabelToDetailsMap['inop'];
                } else if (nodeLabel.includes('desenho') || nodeLabel.includes('técnico')) {
                  matchedDetail = corteLabelToDetailsMap['indesenho'];
                } else if (nodeLabel.includes('lâmina') || nodeLabel.includes('lamina')) {
                  matchedDetail = corteLabelToDetailsMap['e1lamina'];
                } else if (nodeLabel.includes('coolant') || nodeLabel.includes('lubrif') || nodeLabel.includes('refrigeração')) {
                  matchedDetail = corteLabelToDetailsMap['e1coolant'];
                } else if (nodeLabel.includes('calibra') || nodeLabel.includes('setup') || nodeLabel.includes('stop')) {
                  matchedDetail = corteLabelToDetailsMap['e1calibracao'];
                } else if (nodeLabel.includes('limpeza') && nodeLabel.includes('máquina')) {
                  matchedDetail = corteLabelToDetailsMap['e1limp'];
                } else if (nodeLabel.includes('peça piloto') || nodeLabel.includes('primeira peça')) {
                  matchedDetail = corteLabelToDetailsMap['e2primeirapeca'];
                } else if (nodeLabel.includes('medir') || nodeLabel.includes('dimensional') || nodeLabel.includes('paquímetro')) {
                  matchedDetail = corteLabelToDetailsMap['e3medicaodimensional'];
                } else if (nodeLabel.includes('visual') || nodeLabel.includes('inspeção') && nodeLabel.includes('rebarba')) {
                  matchedDetail = corteLabelToDetailsMap['e3inspevisual'];
                } else if (nodeLabel.includes('tolerância') || nodeLabel.includes('tolerancia')) {
                  matchedDetail = corteLabelToDetailsMap['e3tolerancias'];
                } else if (nodeLabel.includes('aprovação') || nodeLabel.includes('liberação')) {
                  matchedDetail = corteLabelToDetailsMap['e3aprovacao'];
                } else if (nodeLabel.includes('desbarbar') || nodeLabel.includes('rebarba')) {
                  matchedDetail = corteLabelToDetailsMap['e6desbarbar'];
                } else if (nodeLabel.includes('epi') || nodeLabel.includes('segurança') || nodeLabel.includes('óculos')) {
                  matchedDetail = corteLabelToDetailsMap['segepi'];
                } else if (nodeLabel.includes('rastreabilidade') || nodeLabel.includes('lote')) {
                  matchedDetail = corteLabelToDetailsMap['iatfrastreabilidade'];
                } else if (nodeLabel.includes('cpk') || nodeLabel.includes('capacidade')) {
                  matchedDetail = corteLabelToDetailsMap['kpicpk'];
                } else if (nodeLabel.includes('scrap') || nodeLabel.includes('refugo')) {
                  matchedDetail = corteLabelToDetailsMap['kpiscrap'];
                }
              }
              
              if (matchedDetail && node.id) {
                corteMatchedDetails[node.id] = matchedDetail;
                corteMatchCount++;
              }
            });
            
            console.log(`Matched ${corteMatchCount} Corte em Serras nodes with detailed descriptions`);
            
            // Merge with existing nodeDetailsMap
            setNodeDetailsMap(prev => ({
              ...prev,
              ...corteMatchedDetails
            }));
            
            if (corteMatchCount > 0) {
              console.log(`Successfully integrated ${corteMatchCount} Corte em Serras detailed node descriptions`);
            } else {
              console.log('No Corte matches found. Node labels:', data.nodes.map((n: any) => n.data?.label).slice(0, 10));
            }
          }
          
          // Set workflow status and creator
          setMapWorkflowStatus(data.workflow_status || 'draft');
          setMapCreatedBy(data.created_by || null);
        }
      } catch (err) {
        console.error('Error loading map:', err);
      }
    };
    
    loadMapData();
  }, [mapId, mapTitle, setNodes, setEdges, setNodeDetailsMap]);

  // Version History
  const { versions, saveVersion, restoreVersion, deleteVersion, clearAllVersions, exportVersions, totalCount: versionCount } = useVersionHistory(mapId);
  const [isVersionPanelOpen, setIsVersionPanelOpen] = useState(false);
  const [versionDescription, setVersionDescription] = useState('');

  // Global Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string; label: string; type: string }[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  // Export Menu State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Work Instruction Export Modal
  const [isWorkInstructionOpen, setIsWorkInstructionOpen] = useState(false);

  // Export functions - REQUIRES: npm install html-to-image
  // Uncomment after installing dependency
  const handleExportPng = useCallback(async () => {
    alert('Funcionalidade de exportação requer instalação: npm install html-to-image');
    setIsExportMenuOpen(false);
    // try {
    //   const { toPng } = await import('html-to-image');
    //   const flowElement = document.querySelector('.react-flow') as HTMLElement;
    //   if (!flowElement) return;
    //   const dataUrl = await toPng(flowElement, { backgroundColor: '#0f172a', pixelRatio: 2 });
    //   const link = document.createElement('a');
    //   link.download = `mapa-${mapTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
    //   link.href = dataUrl;
    //   link.click();
    //   setIsExportMenuOpen(false);
    // } catch (error) {
    //   alert('Erro ao exportar imagem');
    // }
  }, [mapTitle]);

  const handleExportSvg = useCallback(async () => {
    alert('Funcionalidade de exportação requer instalação: npm install html-to-image');
    setIsExportMenuOpen(false);
    // try {
    //   const { toSvg } = await import('html-to-image');
    //   const flowElement = document.querySelector('.react-flow') as HTMLElement;
    //   if (!flowElement) return;
    //   const dataUrl = await toSvg(flowElement, { backgroundColor: '#0f172a' });
    //   const link = document.createElement('a');
    //   link.download = `mapa-${mapTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.svg`;
    //   link.href = dataUrl;
    //   link.click();
    //   setIsExportMenuOpen(false);
    // } catch (error) {
    //   alert('Erro ao exportar SVG');
    // }
  }, [mapTitle]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as HTMLElement)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = nodes.filter(node => {
      const data = node.data as any;
      const label = (data?.label || '').toLowerCase();
      const nodeType = (data?.nodeType || '').toLowerCase();
      const details = nodeDetailsMap[node.id];
      const description = (details?.description || '').toLowerCase();
      const tasks = details?.tasks?.map(t => t.text.toLowerCase()).join(' ') || '';

      return label.includes(query) ||
             nodeType.includes(query) ||
             description.includes(query) ||
             tasks.includes(query);
    }).map(node => {
      const data = node.data as any;
      return {
        id: node.id,
        label: String(data?.label || node.id),
        type: String(data?.nodeType || 'node')
      };
    });

    setSearchResults(results);
    setCurrentResultIndex(0);
  }, [searchQuery, nodes, nodeDetailsMap]);

  const navigateToResult = useCallback((index: number) => {
    if (searchResults.length === 0) return;
    const result = searchResults[index];
    const node = nodes.find(n => n.id === result.id);
    if (node && node.position) {
      setCenter(node.position.x + 100, node.position.y + 50, { zoom: 1.2, duration: 800 });
    }
  }, [searchResults, nodes, setCenter]);

  const nextResult = () => {
    const newIndex = (currentResultIndex + 1) % searchResults.length;
    setCurrentResultIndex(newIndex);
    navigateToResult(newIndex);
  };

  const prevResult = () => {
    const newIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1;
    setCurrentResultIndex(newIndex);
    navigateToResult(newIndex);
  };

  // Keyboard shortcut for search (Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nodeTypes = useMemo(() => ({ mindmap: MindMapNode }), []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, animated: true, type: 'smoothstep', style: { stroke: '#fbbf24', strokeWidth: 2 } } as any, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: import('react').MouseEvent, node: any) => {
    if (isPresenting) return;
    setSelectedNodeId(node.id);
    setSelectedNodeData(node.data);
  }, [isPresenting]);

  const onNodeMouseEnter = useCallback((event: import('react').MouseEvent, node: any) => {
    if (isPresenting) {
      setHoveredNode(node);
      setHoverPosition({ x: event.clientX, y: event.clientY });
    }
  }, [isPresenting]);

  const onNodeMouseMove = useCallback((event: import('react').MouseEvent) => {
    if (hoveredNode && isPresenting) {
      setHoverPosition({ x: event.clientX, y: event.clientY });
    }
  }, [hoveredNode, isPresenting]);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNode(null);
    setHoverPosition(null);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedNodeData(null);
  }, []);

  const handleUpdateDetails = useCallback(async (id: string, newDetails: NodeDetails | ((prev: NodeDetails) => NodeDetails)) => {
    // Get the actual new details (handle both direct values and functional updates)
    const resolvedDetails = typeof newDetails === 'function' 
      ? newDetails(nodeDetailsMap[id] || { description: '', images: [], tasks: [] })
      : newDetails;
    
    // Update local state first
    setNodeDetailsMap((prev) => ({ ...prev, [id]: resolvedDetails }));
    
    // Save to database
    if (mapId) {
      try {
        const { supabase } = await import('./lib/supabase');
        
        // Get current node_details from database
        const { data: currentData, error: fetchError } = await supabase
          .from('process_items')
          .select('node_details')
          .eq('id', mapId)
          .single();
        
        if (fetchError) {
          console.error('Error fetching current node_details:', fetchError);
          return;
        }
        
        // Merge with existing node_details
        const existingDetails = currentData?.node_details || {};
        const updatedDetails = {
          ...existingDetails,
          [id]: resolvedDetails
        };
        
        // Save back to database
        const { error: updateError } = await supabase
          .from('process_items')
          .update({ node_details: updatedDetails })
          .eq('id', mapId);
        
        if (updateError) {
          console.error('Error saving node_details:', updateError);
        } else {
          console.log('Node details saved successfully for node:', id);
        }
      } catch (err) {
        console.error('Error in handleUpdateDetails:', err);
      }
    }
  }, [mapId, nodeDetailsMap]);

  const handleUpdateNodeLabel = useCallback((id: string, newLabel: string) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
    // Also update selectedNodeData if it's the current node
    if (selectedNodeId === id && selectedNodeData) {
      setSelectedNodeData({ ...selectedNodeData, label: newLabel });
    }
  }, [selectedNodeId, selectedNodeData, setNodes]);

  const handleAddNodeSafe = useCallback((data: { label: string; category: string; requiredIATF: string; parentId: string }) => {
    const newNodeId = `node-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'mindmap',
      position: { x: 0, y: 0 },
      data: {
        label: data.label,
        nodeType: data.category,
        category: data.category,
        requiredIATF: data.requiredIATF,
      },
    };

    const newEdge: Edge = {
      id: `e-${data.parentId}-${newNodeId}`,
      source: data.parentId,
      target: newNodeId,
      animated: true,
      type: 'smoothstep',
      style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: 4 },
    };

    const nextNodes = [...nodes, newNode];
    const nextEdges = [...edges, newEdge];
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nextNodes, nextEdges, 'LR');
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);
  
  const getCurrentNodeDetails = (): NodeDetails => {
    if (!selectedNodeId) return { description: '', images: [], tasks: [] };
    return nodeDetailsMap[selectedNodeId] || { description: '', images: [], tasks: [] };
  };

  // --- Presentation Logic ---
  
  const startPresentation = () => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    
    // Build DFS path for presentation to show category then all its children
    const root = currentNodes.find(n => n.id === 'root');
    if (!root) return;

    const path: string[] = [];
    const visited = new Set<string>();

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      path.push(nodeId);

      const children = currentEdges.filter(e => e.source === nodeId).map(e => e.target);
      for (const child of children) {
        traverse(child);
      }
    };

    traverse(root.id);
    
    // Add any unconnected nodes just in case
    currentNodes.forEach(n => {
      if (!visited.has(n.id)) path.push(n.id);
    });

    setPresentationPath(path);
    setPresentationIndex(0);
    setIsPresenting(true);
    closeModal();
  };

  const stopPresentation = () => {
    setIsPresenting(false);
    fitView({ duration: 800, padding: 0.2 });
    
    // trigger confetti if they reached the end
    if (presentationIndex === presentationPath.length - 1 && presentationPath.length > 0) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
        disableForReducedMotion: true
      });
    }
  };

  const nextSlide = () => {
    if (presentationIndex < presentationPath.length - 1) {
      setPresentationIndex(prev => prev + 1);
    } else {
      stopPresentation();
    }
  };

  const prevSlide = () => {
    if (presentationIndex > 0) {
      setPresentationIndex(prev => prev - 1);
    }
  };

  // Update nodes visually when presentation state changes
  useEffect(() => {
    setNodes(nds => 
      nds.map(node => {
        const isFocus = isPresenting && node.id === presentationPath[presentationIndex];
        const isMuted = isPresenting && !isFocus;
        
        return {
          ...node,
          data: {
            ...node.data,
            isFocus,
            isMuted
          }
        };
      })
    );
    
    // Re-center camera
    if (isPresenting && presentationPath[presentationIndex]) {
      const activeNode = getNodes().find(n => n.id === presentationPath[presentationIndex]);
      if (activeNode) {
        // Assume approximate widths
        setCenter(activeNode.position.x + 100, activeNode.position.y + 40, { zoom: 1.4, duration: 800 });
      }
    }
  }, [isPresenting, presentationIndex, presentationPath, setNodes, setCenter, getNodes]);

  return (
    <div className="w-full h-screen bg-[#0f172a] text-slate-100 flex font-sans overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none z-0"></div>

      <div className="flex-1 h-full relative z-10 w-full flex flex-col">
        {/* Map Header when not presenting */}
        {!isPresenting && (
          <div className="flex items-center px-3 sm:px-6 bg-white/[0.02] backdrop-blur-xl border-b border-white/5 shrink-0 z-20 gap-2 sm:gap-4 min-h-[56px] sm:h-16 lg:h-20">
            {/* Back + Title */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 shrink-0">
              <button 
                onClick={onBack}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors shrink-0"
                title="Voltar ao Dashboard"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="min-w-0 hidden sm:block">
                <p className="text-[9px] text-slate-400 uppercase tracking-[0.4em] font-semibold m-0">Procedimento</p>
                <h1 className="text-base lg:text-xl font-bold tracking-tight text-white m-0 leading-tight truncate max-w-[160px] lg:max-w-none">
                  {mapTitle}
                </h1>
              </div>
            </div>

            {/* Mode toggle — center */}
            <div className="flex-1 flex justify-center">
              <div className="relative flex items-center bg-[#0a1628] border border-white/10 rounded-xl p-0.5 gap-0 shadow-xl">
                {/* sliding indicator */}
                <div
                  className={`absolute top-0.5 bottom-0.5 rounded-lg transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    viewMode === 'operator'
                      ? 'left-0.5 right-[calc(50%+1px)] bg-gradient-to-r from-blue-600 to-blue-500 shadow-[0_0_16px_rgba(59,130,246,0.5)]'
                      : 'left-[calc(50%+1px)] right-0.5 bg-gradient-to-r from-slate-100 to-white shadow-[0_2px_12px_rgba(0,0,0,0.4)]'
                  }`}
                />
                <button
                  onClick={() => setViewMode('operator')}
                  className="relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors duration-200 select-none whitespace-nowrap"
                  style={{ color: viewMode === 'operator' ? '#fff' : 'rgb(148,163,184)' }}
                >
                  <Square size={11} strokeWidth={2.5} />
                  <span className="hidden xs:inline">Modo </span>Operador
                </button>
                <button
                  onClick={() => setViewMode('technical')}
                  className="relative z-10 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors duration-200 select-none whitespace-nowrap"
                  style={{ color: viewMode === 'technical' ? '#0f172a' : 'rgb(148,163,184)' }}
                >
                  <Target size={11} strokeWidth={2.5} />
                  <span className="hidden xs:inline">Modo </span>Técnico
                </button>
              </div>
            </div>

            {/* Action buttons — hidden labels on mobile, icon-only */}
            <div className="flex items-center gap-1 sm:gap-2 pointer-events-auto shrink-0">
              {viewMode === 'technical' ? (
                <>
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 flex items-center justify-center gap-2 bg-white/5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                    title="Buscar (Ctrl+F)"
                  >
                    <Search size={15} />
                    <span className="hidden lg:inline text-sm font-medium">Buscar</span>
                  </button>
                  <button
                    onClick={() => {
                      const desc = prompt('Descreva as alterações desta versão:');
                      if (desc) {
                        saveVersion(
                          currentUser?.name || 'Usuário',
                          currentUser?.email || '',
                          desc,
                          nodes,
                          edges,
                          nodeDetailsMap
                        );
                        alert('Versão salva com sucesso!');
                      }
                    }}
                    className="hidden sm:flex w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 items-center justify-center gap-2 bg-white/5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                    title="Salvar versão"
                  >
                    <Save size={15} />
                    <span className="hidden lg:inline text-sm font-medium">Salvar</span>
                  </button>
                  <button
                    onClick={() => setIsVersionPanelOpen(true)}
                    className="hidden md:flex relative w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 items-center justify-center gap-2 bg-white/5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                    title="Histórico de versões"
                  >
                    <History size={15} />
                    <span className="hidden lg:inline text-sm font-medium">Versões</span>
                    {versionCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {versionCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={startPresentation}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                  >
                    <Play size={16} /> Apresentar
                  </button>
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 flex items-center justify-center gap-2 bg-white/5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                    title="Adicionar nó"
                  >
                    <Plus size={15} />
                    <span className="hidden lg:inline text-sm font-medium">Adicionar</span>
                  </button>
                  <div className="relative" ref={exportMenuRef}>
                    <button
                      onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                      className="w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 flex items-center justify-center gap-2 bg-blue-600 rounded-xl border border-blue-500 text-white hover:bg-blue-500 transition-colors"
                      title="Exportar"
                    >
                      <Download size={15} />
                      <span className="hidden lg:inline text-sm font-medium">Exportar</span>
                    </button>
                    {isExportMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                        <button
                          onClick={handleExportPng}
                          className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-slate-300 hover:text-white"
                        >
                          <Camera size={18} className="text-emerald-400" />
                          <div>
                            <div className="font-medium text-sm">Exportar PNG</div>
                            <div className="text-xs text-slate-500">Imagem de alta qualidade</div>
                          </div>
                        </button>
                        <button
                          onClick={handleExportSvg}
                          className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-slate-300 hover:text-white border-t border-white/5"
                        >
                          <FileCode size={18} className="text-blue-400" />
                          <div>
                            <div className="font-medium text-sm">Exportar SVG</div>
                            <div className="text-xs text-slate-500">Vetor escalável</div>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setIsWorkInstructionOpen(true);
                            setIsExportMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors text-slate-300 hover:text-white border-t border-white/5"
                        >
                          <FileText size={18} className="text-amber-400" />
                          <div>
                            <div className="font-medium text-sm">Folha de Instruções</div>
                            <div className="text-xs text-slate-500">PDF para impressão</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-blue-300 font-bold whitespace-nowrap">Fluxo Guiado</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 relative overflow-hidden">
          {viewMode === 'technical' ? (
            <ReactFlow
              nodes={nodesWithAdminProps}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onNodeClick={onNodeClick}
              onNodeMouseEnter={onNodeMouseEnter}
              onNodeMouseMove={onNodeMouseMove}
              onNodeMouseLeave={onNodeMouseLeave}
              fitView
              minZoom={0.1}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
              nodesDraggable={!isPresenting}
              nodesConnectable={!isPresenting}
              elementsSelectable={!isPresenting}
              panOnDrag={!isPresenting}
              zoomOnScroll={!isPresenting}
              zoomOnDoubleClick={!isPresenting}
            >
              <Background color="#1e293b" gap={24} size={2} />
              
              {/* Hide controls during presentation */}
              {!isPresenting && (
                <>
                  <Controls className="!bg-white/5 !border-white/10 !backdrop-blur-xl !shadow-sm !rounded-xl overflow-hidden [&>button]:!border-b [&>button]:!border-white/5 [&>button]:!bg-transparent [&>button]:!text-slate-300 [&>button:hover]:!bg-white/10 [&>button:hover]:!text-white" />
                  <MiniMap 
                    className="!bg-[#0f172a]/90 !border-white/10 !backdrop-blur-xl !shadow-sm !rounded-xl"
                    maskColor="rgba(15, 23, 42, 0.7)"
                    nodeColor={(n: any) => {
                      if (n.data?.category === 'root') return '#4f46e5';
                      if (n.data?.category === 'inputs') return '#fb923c';
                      if (n.data?.category === 'outputs') return '#34d399';
                      if (n.data?.category === 'resources') return '#fbbf24';
                      if (n.data?.category === 'people') return '#818cf8';
                      if (n.data?.category === 'methods') return '#fb7185';
                      if (n.data?.category === 'kpis') return '#a78bfa';
                      return '#475569';
                    }}
                  />
                </>
              )}
              {isPresenting && (
                <Panel position="bottom-center" className="mb-6">
                  <div className="flex items-center gap-4 bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl px-6 py-3 shadow-2xl">
                    <span className="text-sm font-bold text-slate-200 uppercase tracking-widest mr-4">
                      Etapa {presentationIndex + 1} de {presentationPath.length}
                    </span>
                    
                    <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                      <button 
                        onClick={prevSlide}
                        disabled={presentationIndex === 0}
                        className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={nextSlide}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                      >
                        {presentationIndex === presentationPath.length - 1 ? 'Concluir' : 'Próximo'}
                        {presentationIndex !== presentationPath.length - 1 && <ChevronRight size={18} />}
                      </button>
                    </div>
                    
                    <div className="border-l border-white/10 pl-6 ml-2">
                      <button 
                        onClick={stopPresentation}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-full transition-all"
                        title="Encerrar"
                      >
                        <Square size={20} className="fill-current" />
                      </button>
                    </div>
                  </div>
                </Panel>
              )}

              {/* Layout Controls Panel */}
              {!isPresenting && (
                <Panel position="top-right" className="mt-4">
                  <div className="flex flex-col gap-2 bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                    <button
                      onClick={handleAutoLayout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title="Auto-arrumar layout"
                    >
                      <LayoutGrid size={16} />
                      <span>Auto-arrumar</span>
                    </button>
                    <button
                      onClick={toggleLayoutMode}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      title={layoutMode === 'auto' ? 'Mudar para manual' : 'Mudar para automático'}
                    >
                      <Move size={16} />
                      <span>{layoutMode === 'auto' ? 'Manual' : 'Auto'}</span>
                    </button>
                  </div>
                </Panel>
              )}
            </ReactFlow>
          ) : (
            <div className="absolute inset-0">
              <OperatorMode mapTitle={mapTitle} nodes={nodes} edges={edges} nodeDetailsMap={nodeDetailsMap} />
            </div>
          )}
        </div>
      </div>

      {/* Tooltip for Presentation Hover */}
      {isPresenting && hoveredNode && hoverPosition && (
        <div
          ref={tooltipRef}
          className="fixed z-50 pointer-events-none w-[480px] max-w-[90vw] bg-black/60 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl p-6"
          style={{ left: tooltipPos.left, top: tooltipPos.top, transform: 'translate(-50%, 0)' }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl shrink-0">
              <Target size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-base leading-tight">{hoveredNode.data.label}</h3>
              <p className="text-xs text-blue-400 uppercase tracking-widest font-semibold mt-1">{hoveredNode.data.category}</p>
            </div>
          </div>

          <div className="text-sm text-slate-300 leading-relaxed line-clamp-5">
            {nodeDetailsMap[hoveredNode.id]?.description || 'Nenhuma descrição detalhada disponível para este node.'}
          </div>

          {(nodeDetailsMap[hoveredNode.id]?.tasks?.length || 0) > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Ações Registradas</span>
              <div className="space-y-2">
                {nodeDetailsMap[hoveredNode.id]?.tasks.slice(0, 3).map((t: any) => (
                  <div key={t.id} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${t.completed ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                    <span className={t.completed ? 'line-through text-slate-500' : ''}>{t.text}</span>
                  </div>
                ))}
                {(nodeDetailsMap[hoveredNode.id]?.tasks?.length || 0) > 3 && (
                  <div className="text-xs text-blue-400 font-medium pl-4">+ {(nodeDetailsMap[hoveredNode.id]?.tasks?.length || 0) - 3} outras...</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Search Panel */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 pointer-events-none">
          <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 pointer-events-auto">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Search size={20} className="text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Buscar nós, descrições, tarefas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>Use ESC para fechar</span>
                <span>{searchResults.length} resultados</span>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      setCurrentResultIndex(index);
                      navigateToResult(index);
                      setIsSearchOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                      index === currentResultIndex ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{result.label}</div>
                      <div className="text-xs text-slate-500">{result.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                <Search size={32} className="mx-auto mb-3 opacity-20" />
                <p>Nenhum resultado encontrado</p>
                <p className="text-sm mt-1">Tente buscar por outro termo</p>
              </div>
            )}

            {searchResults.length > 1 && (
              <div className="p-3 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
                <button
                  onClick={prevResult}
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-slate-400">
                  {currentResultIndex + 1} de {searchResults.length}
                </span>
                <button
                  onClick={nextResult}
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Próximo →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Version History Panel */}
      {isVersionPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col pointer-events-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Histórico de Versões</h3>
                <p className="text-sm text-slate-400 mt-1">Restaure versões anteriores do mapa</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".json"
                  id="import-versions"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const text = await file.text();
                      const data = JSON.parse(text);
                      if (data.versions && Array.isArray(data.versions)) {
                        const confirmed = await confirm({
                          title: 'CONFIRMAR IMPORTAÇÃO?',
                          message: `Você está prestes a importar ${data.versions.length} versões.\n\nElas serão ADICIONADAS ao histórico existente.`,
                          confirmText: 'Importar',
                          cancelText: 'Cancelar',
                          type: 'warning'
                        });
                        if (confirmed) {
                          data.versions.forEach((v: any) => saveVersion(v.userName, v.userEmail, v.description, v.nodes, v.edges, v.nodeDetails));
                          success('Versões importadas', `${data.versions.length} versões foram adicionadas ao histórico.`);
                        }
                      } else {
                        alert('❌ Arquivo inválido. Formato incorreto.');
                      }
                    } catch (err) {
                      alert('❌ Erro ao importar: ' + (err as Error).message);
                    }
                    e.target.value = '';
                  }}
                />
                <label
                  htmlFor="import-versions"
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                >
                  Importar JSON
                </label>
                <button
                  onClick={exportVersions}
                  className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Exportar JSON
                </button>
                <button
                  onClick={() => setIsVersionPanelOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {versions.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Nenhuma versão salva</p>
                  <p className="text-sm mt-1">Use "Salvar Versão" para criar snapshots</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.slice().reverse().map((version, index) => (
                    <div key={version.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                              v{versions.length - index}
                            </span>
                            <span className="text-sm text-slate-400">
                              {new Date(version.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{version.description}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Por: {version.userName}</span>
                            <span>•</span>
                            <span>{version.nodes.length} nós</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={async () => {
                              const restored = restoreVersion(version.id);
                              if (restored) {
                                const confirmed = await confirm({
                                  title: 'RESTAURAR VERSÃO?',
                                  message: 'Esta ação irá RESTAURAR uma versão anterior.\n\nAs alterações ATUAIS serão SUBSTITUÍDAS.',
                                  confirmText: 'Restaurar',
                                  cancelText: 'Cancelar',
                                  type: 'warning'
                                });
                                if (confirmed) {
                                  setNodes(restored.nodes);
                                  setEdges(restored.edges);
                                  setNodeDetailsMap(restored.nodeDetails);
                                  setIsVersionPanelOpen(false);
                                  success('Versão restaurada', 'O mapa foi restaurado para a versão selecionada.');
                                }
                              }
                            }}
                            className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Restaurar esta versão"
                          >
                            <RotateCcw size={18} />
                          </button>
                          <button
                            onClick={async () => {
                              const confirmed = await confirm({
                                title: 'EXCLUIR VERSÃO?',
                                message: 'Esta ação irá EXCLUIR esta versão permanentemente.',
                                confirmText: 'Excluir',
                                cancelText: 'Cancelar',
                                type: 'danger'
                              });
                              if (confirmed) {
                                deleteVersion(version.id);
                                success('Versão excluída', 'A versão foi removida do histórico.');
                              }
                            }}
                            className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir versão"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {versions.length > 0 && (
              <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
                <span className="text-sm text-slate-400">{versions.length} versões salvas</span>
                <button
                  onClick={clearAllVersions}
                  className="text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  Limpar tudo
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <NodeModal
        isOpen={!!selectedNodeId && !isPresenting}
        onClose={closeModal}
        nodeData={selectedNodeData}
        nodeId={selectedNodeId || ''}
        details={getCurrentNodeDetails()}
        onUpdateDetails={handleUpdateDetails}
        onUpdateNodeLabel={handleUpdateNodeLabel}
        currentUser={currentUser}
      />

      <AddNodeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNodeSafe}
        nodes={nodes}
        selectedNodeId={selectedNodeId}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Work Instruction Export Modal */}
      <WorkInstructionExport
        isOpen={isWorkInstructionOpen}
        onClose={() => setIsWorkInstructionOpen(false)}
        mapTitle={mapTitle}
        nodes={nodes}
        edges={edges}
        currentUser={currentUser}
      />
    </div>
  );
}

export default function App() {
  // All state hooks must be at the top before any conditionals
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string; department?: string } | null>(null);
  const [currentMap, setCurrentMap] = useState<{ id: string; title: string } | null>(null);
  const [currentMarkdown, setCurrentMarkdown] = useState<{ id: string; title: string; content: string } | null>(null);
  const [currentSector3D, setCurrentSector3D] = useState<{ id: string; title: string } | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // Preferences system
  const { preferences, setPreferences } = usePreferences();

  // Audit log system
  const { addLog, logs: auditLogs } = useAuditLog(preferences.enableAuditLog);

  // Session timeout tracking
  const lastActivityRef = useRef<number>(Date.now());

  // Check for password reset token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    if (accessToken) {
      setIsResetPasswordOpen(true);
    }
  }, []);


  // Session timeout check
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTimeout = () => {
      const inactive = Date.now() - lastActivityRef.current;
      const timeoutMs = preferences.sessionTimeout * 60 * 1000;

      if (inactive > timeoutMs) {
        addLog({
          userName: currentUser?.name || 'Sistema',
          userEmail: currentUser?.email || '-',
          userRole: currentUser?.role || '-',
          action: 'Sessão Expirada',
          details: `Sessão encerrada por inatividade de ${preferences.sessionTimeout} minutos`,
          category: 'security'
        });
        setShowSessionExpired(true);
      }
    };

    const interval = setInterval(checkTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated, preferences.sessionTimeout]);

  // Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('click', updateActivity);
    };
  }, [isAuthenticated]);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const { supabase } = await import('./lib/supabase');
      // First try: exact case-insensitive email match
      let { data: user, error } = await supabase
        .from('tecno_users')
        .select('id, name, email, role, department, status, password')
        .ilike('email', email.trim())
        .neq('status', 'Inativo')
        .single();

      // Fallback: if not found, search all active users and match manually (handles typos in stored email)
      if (error || !user) {
        const { data: allUsers } = await supabase
          .from('tecno_users')
          .select('id, name, email, role, department, status, password')
          .neq('status', 'Inativo');
        user = (allUsers || []).find((u: any) =>
          u.email?.toLowerCase() === email.trim().toLowerCase() && u.password === password
        ) || null;
        error = null;
      }

      console.log('[LOGIN DEBUG] email typed:', email.trim());
      console.log('[LOGIN DEBUG] error:', error);
      console.log('[LOGIN DEBUG] user found:', user ? { id: user.id, email: user.email, status: user.status, hasPassword: !!user.password, passwordMatch: user.password === password } : null);

      if (!error && user && user.password === password) {
        setIsAuthenticated(true);
        setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role, department: user.department ?? undefined });
        addLog({
          userName: user.name,
          userEmail: user.email,
          userRole: user.role,
          action: 'Login',
          details: `Usuário autenticado com sucesso`,
          category: 'auth'
        });
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    addLog({
      userName: 'Desconhecido',
      userEmail: email,
      userRole: '-',
      action: 'Falha de Login',
      details: `Tentativa de login falhou`,
      category: 'security'
    });
    return false;
  };

  const handleLogout = () => {
    addLog({
      userName: currentUser?.name || 'Desconhecido',
      userEmail: currentUser?.email || '-',
      userRole: currentUser?.role || '-',
      action: 'Logout',
      details: `Usuário encerrou a sessão`,
      category: 'auth'
    });
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentMap(null);
    setCurrentMarkdown(null);
    setCurrentSector3D(null);
  };

  // Early return for login screen (allowed after all hooks)
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const handleUpdateMarkdown = (id: string, newContent: string) => {
    // In a real app, this would update the global state or dashboard items.
    // For now we just update it locally to test the component behavior.
    if (currentMarkdown && currentMarkdown.id === id) {
      setCurrentMarkdown({ ...currentMarkdown, content: newContent });
    }
  };

  if (currentSector3D) {
    return (
      <Sector3DView 
        id={currentSector3D.id}
        title={currentSector3D.title}
        onClose={() => setCurrentSector3D(null)}
      />
    );
  }

  if (currentMarkdown) {
    return (
      <MarkdownView
        title={currentMarkdown.title}
        initialContent={currentMarkdown.content}
        onBack={() => setCurrentMarkdown(null)}
        onSave={(newContent) => handleUpdateMarkdown(currentMarkdown.id, newContent)}
      />
    );
  }

  if (currentMap) {
    return (
      <ReactFlowProvider>
        <Flow 
          mapId={currentMap.id} 
          mapTitle={currentMap.title} 
          onBack={() => setCurrentMap(null)}
          currentUser={currentUser}
        />
      </ReactFlowProvider>
    );
  }

  return (
    <>
      <Dashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        preferences={preferences}
        setPreferences={setPreferences}
        enableAuditLog={preferences.enableAuditLog}
        addLog={addLog}
        onOpenMap={(id, title) => {
          addLog({
            userName: currentUser?.name || 'Desconhecido',
            userEmail: currentUser?.email || '-',
            userRole: currentUser?.role || '-',
            action: 'Abrir Mapa',
            details: `Mapa aberto: ${title}`,
            category: 'data'
          });
          setCurrentMap({ id, title });
        }}
        onOpenMarkdown={(id, title, content) => {
          addLog({
            userName: currentUser?.name || 'Desconhecido',
            userEmail: currentUser?.email || '-',
            userRole: currentUser?.role || '-',
            action: 'Abrir Documento',
            details: `Documento markdown aberto: ${title}`,
            category: 'data'
          });
          setCurrentMarkdown({ id, title, content });
        }}
        onOpenSector3D={(id, title) => {
          addLog({
            userName: currentUser?.name || 'Desconhecido',
            userEmail: currentUser?.email || '-',
            userRole: currentUser?.role || '-',
            action: 'Abrir Setor 3D',
            details: `Visualização 3D aberta: ${title}`,
            category: 'data'
          });
          setCurrentSector3D({ id, title });
        }}
      />

      {/* Session Expired Modal */}
      <AnimatePresence>
        {showSessionExpired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-sm mx-4 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock size={24} className="text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Sessão Expirada</h2>
                  <p className="text-sm text-amber-400/80">Por inatividade</p>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Sua sessão foi encerrada automaticamente após{' '}
                  <span className="font-semibold text-white">{preferences.sessionTimeout} minutos</span>{' '}
                  de inatividade. Faça login novamente para continuar.
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => {
                    setShowSessionExpired(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  <LogOut size={16} /> Fazer Login Novamente
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />
    </>
  );
}

