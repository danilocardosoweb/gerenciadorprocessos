import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  X,
  Home,
  Folder,
  FileText,
  Settings,
  User,
  LogOut,
  ChevronRight,
  Plus,
  CheckSquare,
  BarChart3,
  Search,
} from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentUser?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
  onNewItem?: () => void;
  onOpenSettings?: () => void;
  activeTab?: string;
}

export function MobileLayout({
  children,
  currentUser,
  onLogout,
  onNavigate,
  onNewItem,
  onOpenSettings,
  activeTab,
}: MobileLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = (id: string) => {
    onNavigate?.(id);
    setIsMenuOpen(false);
  };

  const menuItems = [
    { id: 'items', label: 'Visão Geral', icon: Home, desc: 'Todos os processos' },
    { id: 'docs', label: 'Documentos', icon: FileText, desc: 'Central de documentos' },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, desc: 'Gerenciar tarefas' },
    { id: 'settings', label: 'Configurações', icon: Settings, desc: 'Preferências do sistema' },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 lg:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 text-slate-300 hover:text-white rounded-xl"
          >
            <Menu size={22} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-base font-bold text-white leading-tight">Tecno Mapper</h1>
            {currentUser && (
              <p className="text-[10px] text-slate-400 leading-none">{currentUser.name}</p>
            )}
          </div>
          <button
            onClick={onNewItem}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            title="Novo Item"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0f172a] border-r border-white/10 z-50 lg:hidden"
            >
              {/* Menu Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                {currentUser && (
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const isSettings = item.id === 'settings';
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isSettings) {
                          onOpenSettings?.();
                          setIsMenuOpen(false);
                        } else {
                          navigate(item.id);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={20} />
                      <div className="text-left">
                        <p className="font-medium text-sm leading-tight">{item.label}</p>
                        <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                      </div>
                      <ChevronRight size={14} className="ml-auto text-slate-500" />
                    </button>
                  );
                })}
              </nav>

              {/* Logout Button */}
              {onLogout && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <LogOut size={20} />
                    <span className="font-medium">Sair</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-14 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/10 lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          <button
            onClick={() => navigate('items')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'items' || !activeTab ? 'text-blue-400' : 'text-slate-500'
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] font-medium">Início</span>
          </button>
          <button
            onClick={() => navigate('docs')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'docs' ? 'text-blue-400' : 'text-slate-500'
            }`}
          >
            <FileText size={20} />
            <span className="text-[10px] font-medium">Docs</span>
          </button>
          <button
            onClick={onNewItem}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-500"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center -mt-5 shadow-lg shadow-blue-500/30">
              <Plus size={22} className="text-white" />
            </div>
            <span className="text-[10px] font-medium mt-1">Novo</span>
          </button>
          <button
            onClick={() => navigate('tasks')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
              activeTab === 'tasks' ? 'text-blue-400' : 'text-slate-500'
            }`}
          >
            <CheckSquare size={20} />
            <span className="text-[10px] font-medium">Tarefas</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-slate-500"
          >
            <Settings size={20} />
            <span className="text-[10px] font-medium">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

// Hook to detect mobile viewport
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
