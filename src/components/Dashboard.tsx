import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
// v1.1 - Added Save button to context menu
import { FolderOpen, Network, Plus, Search, ChevronRight, Settings2, MoreVertical, Calendar, FileText, Edit2, MoveRight, Trash2, Box, Sparkles, LogOut, User, Sun, Moon, Save, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';

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
import { AiImportModal } from './AiImportModal';
import { DocumentManager, DocumentItem } from './DocumentManager';
import { TaskManager } from './TaskManager';
import { GlobalMetrics } from './GlobalMetrics';
import { useSupabase } from '../hooks/useSupabase';
import { supabase } from '../lib/supabase';
import { Preferences } from '../hooks/usePreferences';
import { AuditEntry } from '../hooks/useAuditLog';
import { useSupabaseSync } from '../hooks/useSupabaseSync';
import { SyncStatus } from './SyncStatus';
import { useTheme } from '../hooks/useTheme';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { MobileLayout, useIsMobile } from './MobileLayout';
import { BarChart3 } from 'lucide-react';

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
        description: 'Fluxo completo IATF 16949 para eixos de transmissão.',
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
        content: '# Diretrizes de Qualidade\\n\\nEstas são as diretrizes gerais para o processo de usinagem e inspeção de tolerâncias.\\n\\n## Regras Essenciais\\n- Manter a rugosidade Ra < 1.6 nas faces de vedação.\\n- Inspecionar a cada 50 peças ou troca de inserto (o que ocorrer primeiro).\\n\\n| Parâmetro | Tolerância | Frequência de Medição |\\n| :--- | :--- | :--- |\\n| Diâmetro Externo | +/- 0.05mm | 100% |\\n| Comprimento | +/- 0.10mm | A cada setup |\\n\\n### Referências IATF\\n- IATF 8.5.1\\n- IATF 9.1.1'
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
    description: 'Rascunho de ideias para o comitê de inovação da produção.',
    type: 'markdown',
    updatedAt: 'Há 1 semana',
    content: '# Melhoria Contínua (Kaizen)\\n\\nIdeias levantadas durante o *Gemba Walk*:\\n\\n1. **Redução de Setup na Linha A**\\n   - Criar gabarito rápido para ajuste dos guias.\\n   - Identificar ferramentas de setup com cores.\\n\\n2. **Logística Inbound**\\n   - Sincronização via EDI com o fornecedor X.\\n   - Kanban visual com tags RFID para embalagens retornáveis.'
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
  const [folderTab, setFolderTab] = useState<'items' | 'docs' | 'tasks'>('items');
  
  // Theme
  const { theme, resolvedTheme, setTheme } = useTheme();
  
  // Analytics
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  
  // Mock analytics data
  const analyticsData = {
    totalMaps: items.filter(i => i.type === 'map').length,
    totalDocuments: documents.length,
    activeUsers: 1,
    avgProductionTime: 45,
    approvalRate: 85,
    mapsTrend: 12,
    documentsTrend: 8,
    topAccessedMaps: [
      { name: 'Produção CNC', views: 45 },
      { name: 'Processo PCP', views: 38 },
      { name: 'Qualidade', views: 32 },
    ],
    dailyActivity: [
      { day: 'Seg', actions: 12 },
      { day: 'Ter', actions: 18 },
      { day: 'Qua', actions: 15 },
      { day: 'Qui', actions: 22 },
      { day: 'Sex', actions: 28 },
      { day: 'Sáb', actions: 8 },
      { day: 'Dom', actions: 3 },
    ],
  };
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mobile detection
  const isMobile = useIsMobile();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<'map' | 'folder' | 'markdown' | 'sector3d'>('map');
  const [isAiImportOpen, setIsAiImportOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Context Menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setIsUserMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ── Visibility filter ────────────────────────────────────────────────────
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
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
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
    // optimistic
    const newItem: ProcessItem = {
      id: Math.random().toString(),
      title: data.title,
      description: data.description,
      type: data.type,
      updatedAt: 'Agora mesmo',
      items: data.type === 'folder' ? [] : undefined,
      content: data.type === 'markdown' ? '# Novo Documento\n\nComece a editar aqui...' : undefined
    };

    let parentId = null;

    if (currentFolder) {
      parentId = currentFolder.id;
      setItems(items.map(f => {
        if (f.id === currentFolder.id) {
          const newFolderItems = [...(f.items || []), newItem];
          setCurrentFolder({ ...f, items: newFolderItems });
          return { ...f, items: newFolderItems };
        }
        return f;
      }));
    } else {
      setItems([...items, newItem]);
    }

    const { data: inserted, error } = await supabase.from('process_items').insert({
      title: data.title,
      description: data.description,
      type: data.type,
      parent_id: parentId,
      tags: [],
      visibility: data.visibility,
      allowed_departments: data.allowed_departments,
      allowed_user_ids: data.allowed_user_ids,
      created_by: currentUser?.id ?? null,
    }).select().single();

    if (error) {
      console.error('Erro ao salvar item no Supabase:', error);
      alert(`Erro ao salvar: ${error.message}`);
      return;
    }

    console.log('Item salvo com sucesso:', inserted);
    refreshData();
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
    <MobileLayout currentUser={currentUser} onLogout={onLogout}>
    <div className="app-shell w-full h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans overflow-hidden relative" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
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
          <button 
            onClick={() => setIsAiImportOpen(true)}
            className="h-10 px-4 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 font-bold text-sm rounded-full flex items-center gap-2 transition-all"
          >
            <Sparkles size={16} /> Importar com IA
          </button>
          <button 
            onClick={() => setIsNewItemOpen(true)} 
            className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 whitespace-nowrap"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span className="leading-none">Novo Item</span>
          </button>
          {/* Analytics Button */}
          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium rounded-xl border border-white/10 transition-all"
          >
            <BarChart3 size={18} /> Analytics
          </button>
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
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Settings2 size={16} /> Configurações
                    </button>
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
      <div className="flex-1 overflow-y-auto p-10 z-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb Navigation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
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
            
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-max">
              <button 
                onClick={() => setFolderTab('items')}
                className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all", folderTab === 'items' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}
              >
                {currentFolder ? 'Sub-itens' : 'Visão Geral'}
              </button>
              <button 
                onClick={() => setFolderTab('docs')}
                className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2", folderTab === 'docs' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}
              >
                <FileText size={16} /> Central de Documentos
              </button>
              <button 
                onClick={() => setFolderTab('tasks')}
                className={cn("px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2", folderTab === 'tasks' ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white")}
              >
                <CheckSquare size={16} /> Tarefas
              </button>
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
            <DocumentManager documents={documents} setDocuments={setDocuments} refreshData={refreshData} />
          ) : folderTab === 'tasks' ? (
            <TaskManager 
              currentUser={currentUser} 
              processItems={items}
              department={currentUser?.role}
            />
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                                    alert('✅ Item salvo com sucesso!');
                                  }
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              >
                                <Save size={16} /> Salvar
                              </button>
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
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-h-0">
                    <h3 className="text-lg font-bold text-white mb-1.5 leading-tight group-hover:text-blue-300 transition-colors line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.description}</p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/5 text-[11px] text-slate-400 font-medium">
                    <Calendar size={12} className="text-slate-500" />
                    <span className="tabular-nums">{formatDate(item.updatedAt)}</span>
                    {item.type === 'folder' && (
                      <>
                        <span className="mx-1">•</span>
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
                    details: `Configuração "${key}" alterada para: ${value}`,
                    category: 'config'
                  });
                }
              });
            }}
            currentUser={currentUser}
            enableAuditLog={enableAuditLog}
          />
        )}
        {isAiImportOpen && (
          <AiImportModal 
            onClose={() => setIsAiImportOpen(false)}
            onImport={(data) => {
              handleCreateItem(data as any);
              setIsAiImportOpen(false);
            }}
          />
        )}
        {isNewItemOpen && (
          <NewItemModal
            onClose={() => setIsNewItemOpen(false)}
            onCreate={handleCreateItem}
            initialType={modalInitialType}
            currentUser={currentUser ?? undefined}
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

    {deleteConfirm && createPortal(
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={doDeleteItem}
        title="Remover Item"
        message="Tem certeza que deseja remover este item permanentemente? Esta ação não pode ser desfeita."
        confirmText="Remover"
        cancelText="Cancelar"
        type="danger"
      />,
      document.body
    )}
    </>
  );
}
