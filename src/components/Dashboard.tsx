import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
// v1.1 - Added Save button to context menu
import { FolderOpen, Network, Plus, Search, ChevronRight, Settings2, MoreVertical, Calendar, FileText, Edit2, MoveRight, Trash2, Box, LogOut, User, Sun, Moon, Save, CheckSquare, Globe, Lock, Building2, Eye, Check, X, RefreshCw, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import { MapJsonImportModal } from './MapJsonImportModal';

// Helper to format dates nicely
function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === 'Agora mesmo') return 'Agora mesmo';
  
  // If it's already a friendly string (not ISO), return as-is
  if (!dateStr.includes('T') && !dateStr.includes('-')) return dateStr;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: diffDays > 365 ? 'numeric' : undefined
    });
  } catch {
    return dateStr;
  }
}
import { SettingsModal } from './SettingsModal';
import { ConfirmModal } from './ConfirmModal';
import { NewItemModal, type NewItemData } from './NewItemModal';
import { DocumentManager, DocumentItem } from './DocumentManager';
import { TaskManager } from './TaskManager';
import { GlobalMetrics } from './GlobalMetrics';
import { useSupabase } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import { Preferences } from '../hooks/usePreferences';
import { AuditEntry } from '../hooks/useAuditLog';
import { usePermissions } from '../lib/permissions';
import { useWorkflow, WorkflowStatus } from '../hooks/useWorkflow';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { SyncStatus } from './SyncStatus';
import { useTheme } from '../hooks/useTheme';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { useAnalytics } from '../hooks/useAnalytics';
import { MobileLayout, useIsMobile } from './MobileLayout';
import { BarChart3, Target } from 'lucide-react';
import { AssessmentDashboard } from './AssessmentDashboard';

export interface ProcessItem {
  id: string;
  title: string;
  description: string;
  type: 'folder' | 'map' | 'markdown' | 'sector3d';
  updatedAt: string;
  items?: ProcessItem[];
  content?: string;
  parent_id?: string | null;
  tags?: string[];
  visibility?: 'public' | 'departments' | 'private';
  allowed_departments?: string[];
  allowed_user_ids?: string[];
  created_by?: string | null;
  workflow_status?: WorkflowStatus;
  workflow_approver?: string;
  workflow_approved_at?: string;
  workflow_comments?: string[];
}

const initialData: ProcessItem[] = [
  {
    id: 'f1',
    title: 'Processos de Usinagem',
    description: 'Mapas relacionados à célula CNC e tornos.',
    type: 'folder',
    updatedAt: 'Hoje, 10:30',
    items: [
      {
        id: 'm1',
        title: 'Célula de Usinagem 04 - Eixos',
        description: 'Fluxo completo IATF 16949 para eixos de transmisso.',
        type: 'map',
        updatedAt: 'Hoje, 10:32',
      },
      {
        id: 'm2',
        title: 'Torno CNC - Flanges',
        description: 'Processo simplificado de torneamento.',
        type: 'map',
        updatedAt: 'Ontem',
      },
      {
        id: 'md1',
        title: 'Diretrizes de Qualidade - Usinagem',
        description: 'Regras de inspeção e tolerâncias para todas as células de usinagem.',
        type: 'markdown',
        updatedAt: 'Ontem, 16:45',
        content: '# Diretrizes de Qualidade\\n\\nEstas são as diretrizes gerais para o processo de usinagem e inspeção de tolerâncias.\\n\\n## Regras Essenciais\\n- Manter a rugosidade Ra < 1,6 nas faces de vedação.\\n- Inspecionar a cada 50 peças ou troca de inserto (o que ocorrer primeiro).\\n\\n| Parâmetro | Tolerância | Frequência de medição |\\n| :--- | :--- | :--- |\\n| Diâmetro externo | +/- 0,05 mm | 100% |\\n| Comprimento | +/- 0,10 mm | A cada setup |\\n\\n### Referências IATF\\n- IATF 8.5.1\\n- IATF 9.1.1'
      }
    ]
  },
  {
    id: 'f2',
    title: 'Montagem Final',
    description: 'Linhas de montagem e testes.',
    type: 'folder',
    updatedAt: 'Há 3 dias',
    items: [
      {
        id: 'm3',
        title: 'Linha A - Montagem de Motores',
        description: 'Processo de montagem de motores elétricos.',
        type: 'map',
        updatedAt: 'Há 3 dias',
      },
      {
        id: 's3d_1',
        title: '3D - Layout da Montagem',
        description: 'Gêmeo digital e layout 3D da linha de montagem com indicadores em tempo real.',
        type: 'sector3d',
        updatedAt: 'Há 1 hora',
      }
    ]
  },
  {
    id: 'md2',
    title: 'Ideias para Melhoria Contínua',
    description: 'Rascunho de ideias para o comit de inovao da produção.',
    type: 'markdown',
    updatedAt: 'Há 1 semana',
    content: '# Melhoria Contnua (Kaizen)\\n\\nIdeias levantadas durante o *Gemba Walk*:\\n\\n1. **Reduo de Setup na Linha A**\\n   - Criar gabarito rpido para ajuste dos guias.\\n   - Identificar ferramentas de setup com cores.\\n\\n2. **Logstica Inbound**\\n   - Sincronizao via EDI com o fornecedor X.\\n   - Kanban visual com tags RFID para embalagens retornveis.'
  },
  {
    id: 'm4',
    title: 'Processo de Logística Inbound',
    description: 'Recebimento e inspeção de matéria-prima.',
    type: 'map',
    updatedAt: 'Semana passada',
  }
];

interface DashboardProps {
  currentUser: { id: string; name: string; email: string; role: string; department?: string } | null;
  onLogout: () => void;
  preferences: Preferences;
  setPreferences: (newPrefs: Partial<Preferences>) => void;
  enableAuditLog: boolean;
  addLog?: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  onOpenMap: (mapId: string, mapTitle: string) => void;
  onOpenMarkdown: (mdId: string, mdTitle: string, mdContent: string) => void;
  onOpenSector3D: (id: string, title: string) => void;
}

export function Dashboard({ currentUser, onLogout, preferences, setPreferences, enableAuditLog, addLog, onOpenMap, onOpenMarkdown, onOpenSector3D }: DashboardProps) {
  const { items, setItems, documents, setDocuments, loading, refreshData } = useSupabase();
  const perms = usePermissions(currentUser as any);
  
  // Filter items pending approval (for managers/admins)
  const pendingApprovals = items.filter(item => 
    item.type !== 'folder' && item.workflow_status === 'review'
  );
  
  // Filter items needing revision by creator (for the person who created them)
  const needsRevision = items.filter(item => 
    item.type !== 'folder' && 
    item.workflow_status === 'needs_revision' && 
    item.created_by === currentUser?.id
  );
  
  // Sync functionality
  const {
    isConnected,
    isSyncing,
    lastSync,
    pendingCount,
    error: syncError,
    queueOperation,
    syncAll,
  } = useSupabaseSync();
  
  const [currentFolder, setCurrentFolder] = useState<ProcessItem | null>(null);
  const [folderTab, setFolderTab] = useState<'items' | 'docs' | 'tasks' | 'approvals' | 'revision'>('items');
  
  // Theme
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  // Analytics
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const { data: analyticsData, loading: analyticsLoading, refresh: refreshAnalytics } = useAnalytics([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mobile detection
  const isMobile = useIsMobile();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isMapJsonImportOpen, setIsMapJsonImportOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<'map' | 'folder' | 'markdown' | 'sector3d'>('map');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAssessmentDashboardOpen, setIsAssessmentDashboardOpen] = useState(false);
  
  // Context Menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Visibility edit modal
  const [visibilityItem, setVisibilityItem] = useState<ProcessItem | null>(null);
  const [visEditValue, setVisEditValue] = useState<'public' | 'departments' | 'private'>('public');
  const [visEditDepts, setVisEditDepts] = useState<string[]>([]);
  const [allDepts, setAllDepts] = useState<{ id: string; name: string; color: string }[]>([]);

  // Rejection modal
  const [rejectItem, setRejectItem] = useState<ProcessItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Approve confirmation modal
  const [approveItem, setApproveItem] = useState<ProcessItem | null>(null);

  useEffect(() => {
    supabase.from('departments').select('*').order('created_at', { ascending: true }).then(({ data, error }) => {
      if (error) console.error('L Error fetching departments:', error);
      if (data) setAllDepts(data);
    });
  }, []);

  const handleSaveVisibility = async () => {
    if (!visibilityItem) return;
    const upd = {
      visibility: visEditValue,
      allowed_departments: visEditValue === 'departments' ? visEditDepts : [],
    };
    const { error } = await supabase.from('process_items').update(upd).eq('id', visibilityItem.id);
    if (error) { alert('Erro ao salvar: ' + error.message); return; }
    setItems(prev => prev.map(i => i.id === visibilityItem.id ? { ...i, ...upd } : i));
    setVisibilityItem(null);
    refreshData();
  };

  const handleReject = async () => {
    if (!rejectItem || !rejectReason.trim()) {
      alert('Por favor, informe o motivo da rejeição.');
      return;
    }
    const { error } = await supabase.from('process_items').update({ 
      workflow_status: 'needs_revision',
      workflow_approver: currentUser.name,
      workflow_approved_at: new Date().toISOString(),
      workflow_comments: [rejectReason]
    }).eq('id', rejectItem.id);
    if (error) {
      alert('Erro ao rejeitar: ' + error.message);
    } else {
      addLog({
        userName: currentUser.name || 'Desconhecido',
        userEmail: currentUser.email || '-',
        userRole: currentUser.role || '-',
        action: 'Rejeitar',
        details: `Item "${rejectItem.title}" rejeitado. Motivo: ${rejectReason}`,
        category: 'workflow'
      });
      setRejectItem(null);
      setRejectReason('');
      refreshData();
    }
  };

  const handleApprove = async () => {
    if (!approveItem) return;
    const { error } = await supabase.from('process_items').update({ 
      workflow_status: 'approved',
      workflow_approver: currentUser.name,
      workflow_approved_at: new Date().toISOString()
    }).eq('id', approveItem.id);
    if (error) {
      alert('Erro ao aprovar: ' + error.message);
    } else {
      addLog({
        userName: currentUser.name || 'Desconhecido',
        userEmail: currentUser.email || '-',
        userRole: currentUser.role || '-',
        action: 'Aprovar',
        details: `Item "${approveItem.title}" aprovado`,
        category: 'workflow'
      });
      setApproveItem(null);
      refreshData();
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setIsUserMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  //  Visibility filter 
  function filterByVisibility(list: ProcessItem[]): ProcessItem[] {
    if (!currentUser) return [];
    const isAdmin = currentUser.role === 'Administrador';
    return list.filter(item => {
      if (isAdmin) return true;
      const v = item.visibility ?? 'public';
      if (v === 'public') return true;
      if (v === 'private') return item.created_by === currentUser.id;
      const deptMatch = (item.allowed_departments ?? []).includes(currentUser.department ?? '');
      const userMatch = (item.allowed_user_ids ?? []).includes(currentUser.id);
      return deptMatch || userMatch || item.created_by === currentUser.id;
    });
  }

  const displayItems = currentFolder ? currentFolder.items || [] : items;
  const visibleDisplayItems = filterByVisibility(displayItems);

  const filteredItems = visibleDisplayItems.filter(item =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCountByType = (type: string) => {
    let count = 0;
    items.forEach(item => {
      if (item.type === type) count++;
      if (item.type === 'folder' && item.items) {
        count += item.items.filter(i => i.type === type).length;
      }
    });
    return count;
  };

  const mappedProcessesCount = getCountByType('map');
  const ideasCount = getCountByType('markdown');
  const expiringDocsCount = documents.filter(d => d.status === 'expiring').length;
  // Calculate mock compliance score (just as an example based on existing valid docs ratio)
  const validDocsCount = documents.filter(d => d.status === 'valid').length;
  const complianceScore = documents.length > 0 ? Math.round((validDocsCount / documents.length) * 100) : 100;

  const handleItemClick = (item: ProcessItem) => {
    if (item.type === 'folder') {
      setCurrentFolder(item);
      setSearchQuery('');
    } else if (item.type === 'map') {
      onOpenMap(item.id, item.title);
    } else if (item.type === 'markdown') {
      onOpenMarkdown(item.id, item.title, item.content || '');
    } else if (item.type === 'sector3d') {
      onOpenSector3D(item.id, item.title);
    }
  };

  const handleCreateItem = async (data: NewItemData) => {
    const parentId = currentFolder?.id ?? null;
    const initialMapNodes = data.type === 'map'
      ? [{
          id: 'root',
          type: 'mindmap',
          position: { x: 0, y: 0 },
          data: {
            label: data.title.trim(),
            nodeType: 'root',
            category: 'root',
            numberCode: '1.0',
            creationState: 'guided',
          },
        }]
      : null;

    const { data: inserted, error } = await supabase.from('process_items').insert({
      title: data.title,
      description: data.description,
      type: data.type,
      parent_id: parentId,
      tags: data.tags || [],
      visibility: data.visibility,
      allowed_departments: data.allowed_departments,
      allowed_user_ids: data.allowed_user_ids,
      created_by: currentUser?.id ?? null,
      nodes: data.nodes ?? initialMapNodes,
      edges: data.edges ?? (data.type === 'map' ? [] : null),
      node_details: data.nodeDetails ?? (data.type === 'map' ? {} : null),
    }).select().single();

    if (error) {
      console.error('Erro ao salvar item no Supabase:', error);
      throw new Error(error.message);
    }

    await refreshData();

    if (data.type === 'map' && inserted?.id) {
      onOpenMap(inserted.id, inserted.title || data.title);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDeleteItem = (id: string) => {
    setDeleteConfirm(id);
  };

  const doDeleteItem = async () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm;
    setDeleteConfirm(null);

    // Optimistic delete
    if (currentFolder) {
      setItems(items.map(f => {
        if (f.id === currentFolder.id) {
          const newFolderItems = f.items ? f.items.filter(i => i.id !== id) : [];
          setCurrentFolder({ ...f, items: newFolderItems });
          return { ...f, items: newFolderItems };
        }
        return f;
      }));
    } else {
      setItems(items.filter(i => i.id !== id));
    }

    await supabase.from('process_items').delete().eq('id', id);
    refreshData();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
  };

  return (
    <>
    <MobileLayout
      currentUser={currentUser}
      onLogout={onLogout}
      activeTab={folderTab}
      onNavigate={(tab) => {
        setFolderTab(tab as 'items' | 'docs' | 'tasks');
        setCurrentFolder(null);
      }}
      onNewItem={() => setIsNewItemOpen(true)}
      onOpenSettings={() => setIsSettingsOpen(true)}
    >
    <div className="app-shell w-full h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans overflow-hidden relative pt-14 lg:pt-0" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* Header - Hidden on mobile (shown in MobileLayout) */}
      <header className="hidden lg:flex h-20 items-center justify-between px-10 bg-white/[0.02] backdrop-blur-3xl border-b border-white/5 z-[50] sticky top-0 relative">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight inline-flex items-center gap-2">
              Tecno <span className="text-blue-400 font-light">Mapper</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-0.5">Gerenciamento de Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar processos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
            />
          </div>
          {perms.can.createNode && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMapJsonImportOpen(true)} 
              className="inline-flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-medium rounded-full border border-white/10 transition-all duration-200 whitespace-nowrap"
            >
              <Upload size={16} strokeWidth={2.25} />
              <span className="leading-none">Importar JSON</span>
            </button>
            <button 
              onClick={() => setIsNewItemOpen(true)} 
              className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span className="leading-none">Novo Item</span>
            </button>
          </div>
          )}
          {/* Analytics Button - Gerente+ only */}
          {perms.can.viewAnalytics && (
          <button
            onClick={() => { setIsAnalyticsOpen(true); refreshAnalytics(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl border border-white/10 transition-all"
          >
            <BarChart3 size={18} /> Analytics
          </button>
          )}
          {/* Assessment Dashboard Button - Gerente+ only */}
          {perms.can.viewAssessmentAnalytics && (
          <button
            onClick={() => { setIsAssessmentDashboardOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl border border-white/10 transition-all"
          >
            <Target size={18} /> Avaliações
          </button>
          )}
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            title={resolvedTheme === 'dark' ? 'Mudar para claro' : 'Mudar para escuro'}
          >
            {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsUserMenuOpen(!isUserMenuOpen);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                {currentUser?.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white leading-tight">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{currentUser?.role}</p>
              </div>
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl bg-opacity-95"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 border-b border-white/10">
                    <p className="font-semibold text-white">{currentUser?.name}</p>
                    <p className="text-sm text-slate-400">{currentUser?.email}</p>
                  </div>
                  <div className="p-2">
                    {perms.can.viewSettings && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Settings2 size={16} /> Configurações
                    </button>
                    )}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut size={16} /> Sair
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 z-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <button 
                onClick={() => {
                  setCurrentFolder(null);
                  setFolderTab('items');
                }}
                className={cn("hover:text-blue-400 transition-colors", !currentFolder ? "text-blue-400" : "text-slate-500")}
              >
                Meus Processos
              </button>
              <AnimatePresence>
                {currentFolder && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2"
                  >
                    <ChevronRight size={16} className="text-slate-600" />
                    <span className="text-blue-400">{currentFolder.title}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto max-w-full">
              <button 
                onClick={() => setFolderTab('items')}
                className={cn("shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap", folderTab === 'items' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}
              >
                {currentFolder ? 'Sub-itens' : 'Visão Geral'}
              </button>
              <button 
                onClick={() => setFolderTab('docs')}
                className={cn("shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap", folderTab === 'docs' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}
              >
                <FileText size={14} /> <span className="hidden sm:inline">Central de </span>Documentos
              </button>
              <button 
                onClick={() => setFolderTab('tasks')}
                className={cn("shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap", folderTab === 'tasks' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}
              >
                <CheckSquare size={14} /> Tarefas
              </button>
              {perms.can.approveTask && (
                <button 
                  onClick={() => setFolderTab('approvals')}
                  className={cn("shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap", folderTab === 'approvals' ? "bg-amber-500/20 text-amber-400 shadow-sm" : "text-slate-400 hover:text-amber-400")}
                >
                  <Check size={14} /> Aprovações {pendingApprovals.length > 0 && <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingApprovals.length}</span>}
                </button>
              )}
              {needsRevision.length > 0 && (
                <button 
                  onClick={() => setFolderTab('revision')}
                  className={cn("shrink-0 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap", folderTab === 'revision' ? "bg-orange-500/20 text-orange-400 shadow-sm" : "text-slate-400 hover:text-orange-400")}
                >
                  <RefreshCw size={14} /> Precisa Revisar <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{needsRevision.length}</span>
                </button>
              )}
            </div>
          </div>

          {(!currentFolder && folderTab === 'items') && (
            <GlobalMetrics 
              mappedProcessesCount={mappedProcessesCount} 
              expiringDocsCount={expiringDocsCount}
              ideasCount={ideasCount}
              complianceScore={complianceScore}
              onAddProcess={() => {
                setModalInitialType('map');
                setIsNewItemOpen(true);
              }}
              onAddIdea={() => {
                setModalInitialType('markdown');
                setIsNewItemOpen(true);
              }}
              onViewDocs={() => {
                setFolderTab('docs');
              }}
            />
          )}

          {folderTab === 'docs' ? (
            <DocumentManager documents={documents} setDocuments={setDocuments} refreshData={refreshData} currentUser={currentUser} />
          ) : folderTab === 'tasks' ? (
            <TaskManager 
              currentUser={currentUser} 
              processItems={items}
              department={currentUser?.role}
              addLog={addLog}
            />
          ) : folderTab === 'approvals' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Aprovações Pendentes</h3>
              {pendingApprovals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Check size={48} className="mb-4 opacity-20" />
                  <p>Nenhuma aprovação pendente.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingApprovals.map(item => (
                    <div key={item.id} className="bg-white/5 border border-amber-500/30 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          {item.type === 'map' ? <Network size={20} /> : <FileText size={20} />}
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold bg-amber-500/20 text-amber-400 rounded-full">Em Reviso</span>
                      </div>
                      <h4 className="text-white font-medium mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setApproveItem(item);
                          }}
                          className="flex-1 px-3 py-2 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        >
                          Aprovar
                        </button>
                        <button 
                          onClick={() => {
                            setRejectItem(item);
                            setRejectReason('');
                          }}
                          className="flex-1 px-3 py-2 text-xs font-semibold bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Rejeitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : folderTab === 'revision' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Precisa de Reviso</h3>
              {needsRevision.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <RefreshCw size={48} className="mb-4 opacity-20" />
                  <p>Nenhum item precisa de revisão.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {needsRevision.map(item => (
                    <div key={item.id} className="bg-white/5 border border-orange-500/30 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                          {item.type === 'map' ? <Network size={20} /> : <FileText size={20} />}
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold bg-orange-500/20 text-orange-400 rounded-full">Precisa Reviso</span>
                      </div>
                      <h4 className="text-white font-medium mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                      {item.workflow_comments && item.workflow_comments.length > 0 && (
                        <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-xs text-red-300 font-semibold mb-1">Motivo da rejeição:</p>
                          <p className="text-xs text-red-200/80">{item.workflow_comments[0]}</p>
                          {item.workflow_approver && (
                            <p className="text-[10px] text-red-300/60 mt-1"> {item.workflow_approver}</p>
                          )}
                        </div>
                      )}
                      <button 
                        onClick={() => onOpenMap(item.id, item.title)}
                        className="w-full px-3 py-2 text-xs font-semibold bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                      >
                        Revisar e Enviar Novamente
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Search size={48} className="mb-4 opacity-20" />
              <p>Nenhum resultado encontrado.</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              key={currentFolder ? currentFolder.id : 'root'}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  onClick={() => handleItemClick(item)}
                  className="group relative h-auto sm:h-56 min-h-[180px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex flex-col gap-3 active:scale-[0.98] touch-manipulation"
                >
                  {/* Item Icon & Actions */}
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner",
                      item.type === 'folder' ? "bg-amber-500/20 text-amber-400" : 
                      item.type === 'markdown' ? "bg-emerald-500/20 text-emerald-400" : 
                      item.type === 'sector3d' ? "bg-purple-500/20 text-purple-400" : 
                      "bg-blue-500/20 text-blue-400"
                    )}>
                      {item.type === 'folder' ? <FolderOpen size={24} /> : 
                       item.type === 'markdown' ? <FileText size={24} /> : 
                       item.type === 'sector3d' ? <Box size={24} /> : 
                       <Network size={24} />}
                    </div>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === item.id ? null : item.id);
                        }}
                        className={cn(
                          "p-2 text-slate-500 hover:text-white transition-opacity rounded-full hover:bg-white/10",
                          openMenuId === item.id ? "opacity-100 bg-white/10 text-white" : "opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <MoreVertical size={18} />
                      </button>

                      <AnimatePresence>
                        {openMenuId === item.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl z-[90] overflow-hidden backdrop-blur-xl bg-opacity-95"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-1">
                              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                <Edit2 size={16} /> Renomear
                              </button>
                              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                <MoveRight size={16} /> Mover para...
                              </button>
                              <button 
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  // Save to Supabase immediately
                                  const { error } = await supabase.from('process_items').upsert({
                                    id: item.id,
                                    title: item.title,
                                    description: item.description,
                                    type: item.type,
                                    parent_id: item.parent_id || null,
                                    content: item.content || null,
                                    tags: item.tags || [],
                                    updated_at: new Date().toISOString()
                                  });
                                  if (error) {
                                    alert('Erro ao salvar: ' + error.message);
                                  } else {
                                    alert(' Item salvo com sucesso!');
                                  }
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              >
                                <Save size={16} /> Salvar
                              </button>
                              {(currentUser?.role === 'Administrador' || item.created_by === currentUser?.id) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setVisEditValue(item.visibility ?? 'public');
                                    setVisEditDepts(item.allowed_departments ?? []);
                                    setVisibilityItem(item);
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                  <Eye size={16} /> Visibilidade
                                </button>
                              )}
                              {item.type !== 'folder' && (
                                <>
                                  {item.workflow_status === 'draft' && (
                                    <button 
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        const { error } = await supabase.from('process_items').update({ 
                                          workflow_status: 'review' 
                                        }).eq('id', item.id);
                                        if (error) {
                                          alert('Erro ao enviar para revisão: ' + error.message);
                                        } else {
                                          addLog({
                                            userName: currentUser.name || 'Desconhecido',
                                            userEmail: currentUser.email || '-',
                                            userRole: currentUser.role || '-',
                                            action: 'Enviar para Reviso',
                                            details: `Item "${item.title}" enviado para aprovação`,
                                            category: 'workflow'
                                          });
                                          refreshData();
                                        }
                                      }}
                                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 rounded-lg transition-colors"
                                    >
                                      <Check size={16} /> Enviar para Reviso
                                    </button>
                                  )}
                                  {item.workflow_status === 'review' && perms.can.approveTask && (
                                    <>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuId(null);
                                          setApproveItem(item);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                      >
                                        <Check size={16} /> Aprovar
                                      </button>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenMenuId(null);
                                          setRejectItem(item);
                                          setRejectReason('');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-colors"
                                      >
                                        <X size={16} /> Rejeitar
                                      </button>
                                    </>
                                  )}
                                  {item.workflow_status === 'approved' && perms.can.approveTask && (
                                    <button 
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        const { error } = await supabase.from('process_items').update({ 
                                          workflow_status: 'published' 
                                        }).eq('id', item.id);
                                        if (error) {
                                          alert('Erro ao publicar: ' + error.message);
                                        } else {
                                          addLog({
                                            userName: currentUser.name || 'Desconhecido',
                                            userEmail: currentUser.email || '-',
                                            userRole: currentUser.role || '-',
                                            action: 'Publicar',
                                            details: `Item "${item.title}" publicado`,
                                            category: 'workflow'
                                          });
                                          refreshData();
                                        }
                                      }}
                                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 rounded-lg transition-colors"
                                    >
                                      <Globe size={16} /> Publicar
                                    </button>
                                  )}
                                  {item.workflow_status === 'needs_revision' && item.created_by === currentUser?.id && (
                                    <button 
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        setOpenMenuId(null);
                                        const { error } = await supabase.from('process_items').update({ 
                                          workflow_status: 'review' 
                                        }).eq('id', item.id);
                                        if (error) {
                                          alert('Erro ao enviar para revisão: ' + error.message);
                                        } else {
                                          addLog({
                                            userName: currentUser.name || 'Desconhecido',
                                            userEmail: currentUser.email || '-',
                                            userRole: currentUser.role || '-',
                                            action: 'Enviar para Reviso',
                                            details: `Item "${item.title}" reenviado para aprovação após revisão`,
                                            category: 'workflow'
                                          });
                                          refreshData();
                                        }
                                      }}
                                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-orange-300 hover:text-orange-200 hover:bg-orange-500/10 rounded-lg transition-colors"
                                    >
                                      <RefreshCw size={16} /> Revisar e Enviar Novamente
                                    </button>
                                  )}
                                </>
                              )}
                              {perms.can.deleteNode && (
                              <>
                              <div className="h-px bg-white/5 my-1 mx-2" />
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteItem(item.id);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} /> Excluir
                              </button>
                              </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-h-0">
                    <div className="flex items-start gap-2 mb-1.5">
                      <h3 className="text-lg font-bold text-white leading-tight group-hover:text-blue-300 transition-colors line-clamp-2 flex-1">{item.title}</h3>
                      {item.workflow_status && (item.workflow_status === 'review' || item.workflow_status === 'needs_revision') && (
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0",
                          item.workflow_status === 'review' ? "bg-amber-500/20 text-amber-400" :
                          item.workflow_status === 'needs_revision' ? "bg-orange-500/20 text-orange-400" :
                          "bg-slate-500/20 text-slate-400"
                        )}>
                          {item.workflow_status === 'review' ? 'Em Reviso' :
                           item.workflow_status === 'needs_revision' ? 'Precisa Reviso' : item.workflow_status}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5 text-[11px] text-slate-400 font-medium">
                    <Calendar size={12} className="text-slate-500" />
                    <span className="tabular-nums">{formatDate(item.updatedAt)}</span>
                    {item.type === 'folder' && (
                      <>
                        <span className="mx-1">"</span>
                        <span>{item.items?.length || 0} items</span>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

        </div>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            onClose={() => {
              setIsSettingsOpen(false);
              addLog?.({
                userName: currentUser?.name || 'Desconhecido',
                userEmail: currentUser?.email || '-',
                userRole: currentUser?.role || '-',
                action: 'Fechar Configurações',
                details: 'Painel de ajustes fechado',
                category: 'system'
              });
            }}
            preferences={preferences}
            setPreferences={(newPrefs) => {
              setPreferences(newPrefs);
              // Log preference changes
              Object.entries(newPrefs).forEach(([key, value]) => {
                if (key !== undefined) {
                  addLog?.({
                    userName: currentUser?.name || 'Desconhecido',
                    userEmail: currentUser?.email || '-',
                    userRole: currentUser?.role || '-',
                    action: 'Alterar Preferência',
                    details: `Configurao "${key}" alterada para: ${value}`,
                    category: 'config'
                  });
                }
              });
            }}
            currentUser={currentUser}
            enableAuditLog={enableAuditLog}
          />
        )}
        {isNewItemOpen && (
          <NewItemModal
            onClose={() => setIsNewItemOpen(false)}
            onCreate={handleCreateItem}
            initialType={modalInitialType}
            currentUser={currentUser ?? undefined}
            isOpen={isNewItemOpen}
          />
        )}
        {isMapJsonImportOpen && (
          <MapJsonImportModal
            isOpen={isMapJsonImportOpen}
            onClose={() => setIsMapJsonImportOpen(false)}
            onImport={handleCreateItem}
          />
        )}
        
        {/* Analytics Dashboard */}
        <AnalyticsDashboard 
          isOpen={isAnalyticsOpen} 
          onClose={() => setIsAnalyticsOpen(false)} 
          data={analyticsData}
        />
      </AnimatePresence>

    </div>
    </MobileLayout>

    {visibilityItem && createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setVisibilityItem(null)}
          className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">Visibilidade do Item</h2>
          <p className="text-xs text-slate-400 mb-5 truncate">{visibilityItem.title}</p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            {([
              ['public',      'Público',   'Todos podem ver',              Globe,     'text-emerald-400', 'border-emerald-500/40 bg-emerald-500/10'],
              ['departments', 'Restrito',  'Só departamentos selecionados', Building2, 'text-amber-400',   'border-amber-500/40 bg-amber-500/10'],
              ['private',     'Privado',   'Só você e admins',             Lock,      'text-red-400',     'border-red-500/40 bg-red-500/10'],
            ] as const).map(([val, label, desc, Icon, color, activeStyle]) => (
              <button key={val} type="button"
                onClick={() => setVisEditValue(val)}
                className={cn('flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all text-xs',
                  visEditValue === val ? `${activeStyle} border` : 'border-white/10 bg-white/[0.03] hover:bg-white/5 opacity-60 hover:opacity-100')}>
                <Icon size={18} className={cn(visEditValue === val ? color : 'text-slate-400')} />
                <span className={cn('font-semibold', visEditValue === val ? 'text-white' : 'text-slate-400')}>{label}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{desc}</span>
                {visEditValue === val && <Check size={11} className={cn('mt-0.5', color)} />}
              </button>
            ))}
          </div>

          {visEditValue === 'departments' && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-400 mb-2">Departamentos com acesso</p>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {allDepts.map(d => {
                  const sel = visEditDepts.includes(d.name);
                  return (
                    <button key={d.id} type="button"
                      onClick={() => setVisEditDepts(prev => sel ? prev.filter(n => n !== d.name) : [...prev, d.name])}
                      className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        sel ? 'bg-amber-500/15 text-white' : 'hover:bg-white/5 text-slate-400')}>
                      <div className="w-3 h-3 rounded-sm border flex items-center justify-center shrink-0 transition-colors"
                        style={{ borderColor: sel ? d.color : undefined, backgroundColor: sel ? d.color + '44' : undefined }}>
                        {sel && <Check size={9} className="text-white" />}
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setVisibilityItem(null)}
              className="flex-1 px-4 py-2.5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button onClick={handleSaveVisibility}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-500/20">
              Salvar
            </button>
          </div>
        </motion.div>
      </div>,
      document.body
    )}

    {rejectItem && createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => { setRejectItem(null); setRejectReason(''); }}
          className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">Rejeitar Item</h2>
          <p className="text-xs text-slate-400 mb-4">{rejectItem.title}</p>

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-400 mb-2 block">Motivo da rejeição</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Descreva o motivo da rejeição para que o criador possa fazer as correções necessárias..."
              className="w-full h-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => { setRejectItem(null); setRejectReason(''); }}
              className="flex-1 px-4 py-2.5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleReject}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-red-500/20"
            >
              Rejeitar
            </button>
          </div>
        </motion.div>
      </div>,
      document.body
    )}

    {approveItem && createPortal(
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setApproveItem(null)}
          className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 mx-auto">
            <Check size={24} />
          </div>
          <h2 className="text-lg font-bold text-white mb-2 text-center">Aprovar Item</h2>
          <p className="text-sm text-slate-300 mb-6 text-center">{approveItem.title}</p>
          <p className="text-xs text-slate-400 mb-6 text-center">Tem certeza que deseja aprovar este item Aps a aprovação, ele poder ser publicado.</p>

          <div className="flex gap-3">
            <button 
              onClick={() => setApproveItem(null)}
              className="flex-1 px-4 py-2.5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleApprove}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-colors shadow-lg shadow-emerald-500/20"
            >
              Aprovar
            </button>
          </div>
        </motion.div>
      </div>,
      document.body
    )}

    {deleteConfirm && createPortal(
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={doDeleteItem}
        title="Remover Item"
        message="Tem certeza que deseja remover este item permanentemente Esta ação não pode ser desfeita."
        confirmText="Remover"
        cancelText="Cancelar"
        type="danger"
      />,
      document.body
    )}

    {isAssessmentDashboardOpen && createPortal(
      <AssessmentDashboard
        currentUserId={currentUser.id || ''}
        onClose={() => setIsAssessmentDashboardOpen(false)}
      />,
      document.body
    )}
    </>
  );
}
