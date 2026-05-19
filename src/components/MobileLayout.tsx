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
} from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentUser?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
  onNavigate?: (page: string) => void;
}

export function MobileLayout({
  children,
  currentUser,
  onLogout,
  onNavigate,
}: MobileLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'maps', label: 'Mapas', icon: Folder },
    { id: 'documents', label: 'Documentos', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-xl border-b border-white/10 lg:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 text-slate-300 hover:text-white"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">Tecno Mapper</h1>
          <div className="w-8" /> {/* Spacer for centering */}
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
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate?.(item.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight size={16} className="ml-auto text-slate-500" />
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
      <main className="pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
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
