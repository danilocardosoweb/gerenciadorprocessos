import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Shield, Settings, Plus, Search, Check, ChevronRight, Edit2, Trash2, ArrowLeft, Save, FileText, Download, Trash, Filter, ClipboardList } from 'lucide-react';
import { cn } from '../lib/utils';
import { Preferences } from '../hooks/usePreferences';
import { useAuditLog } from '../hooks/useAuditLog';

interface SettingsModalProps {
  onClose: () => void;
  preferences?: Preferences;
  setPreferences?: (newPrefs: Partial<Preferences>) => void;
  currentUser?: { name: string; email: string; role: string } | null;
  enableAuditLog?: boolean;
}

// Toggle Switch Component
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={cn("w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors", checked ? "bg-emerald-500" : "bg-slate-600")}
    >
      <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", checked ? "translate-x-6" : "translate-x-0")}></div>
    </div>
  );
}

type User = { id: number; name: string; email: string; password?: string; role: string; status: 'Ativo' | 'Inativo' };
type Role = { id: number; name: string; desc: string; users: number };

export function SettingsModal({ onClose, preferences: externalPreferences, setPreferences: externalSetPreferences, currentUser, enableAuditLog }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'preferences' | 'audit'>('users');
  const [activeView, setActiveView] = useState<'list' | 'add_user' | 'edit_user' | 'add_role' | 'edit_role'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audit Log
  const { logs, clearLogs, downloadTxt, downloadJson, filterLogs, totalCount } = useAuditLog(enableAuditLog ?? true);
  const [auditFilter, setAuditFilter] = useState<'' | 'auth' | 'config' | 'data' | 'security' | 'system'>('');
  const filteredLogs = auditFilter ? filterLogs(auditFilter) : logs;
  
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Danilo Cardoso', email: 'pcp@tecnoperfilalumino.com.br', password: 'admin123', role: 'Administrador', status: 'Ativo' },
    { id: 2, name: 'João Silva', email: 'joao.silva@exemplo.com', password: '123456', role: 'Editor', status: 'Ativo' },
    { id: 3, name: 'Maria Souza', email: 'maria.souza@exemplo.com', password: '123456', role: 'Editor', status: 'Ativo' },
  ]);

  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: 'Administrador', desc: 'Acesso total ao sistema, configurações e mapas.', users: 1 },
    { id: 2, name: 'Editor', desc: 'Pode criar e editar mapas e documentos, mas não gerencia usuários.', users: 2 },
    { id: 3, name: 'Visualizador', desc: 'Apenas visualiza mapas e documentos aprovados.', users: 0 },
  ]);

  // Use external preferences if provided, otherwise use local state
  const [localPreferences, setLocalPreferences] = useState<Preferences>({
    requireApproval: true,
    emailNotifications: true,
    autoSave: true,
    darkMode: true,
    language: 'pt-BR',
    sessionTimeout: 30,
    enableAuditLog: true,
    defaultMapLayout: 'LR',
  });

  const preferences = externalPreferences || localPreferences;
  
  // Wrapper to handle both external setter (partial update) and local setter (full state)
  const setPreferences = useCallback((newPrefs: Partial<Preferences>) => {
    if (externalSetPreferences) {
      externalSetPreferences(newPrefs);
    } else {
      setLocalPreferences(prev => ({ ...prev, ...newPrefs }));
    }
  }, [externalSetPreferences]);

  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form States
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('Editor');
  const [userStatus, setUserStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');

  const resetUserForm = () => {
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('Editor');
    setUserStatus('Ativo');
    setEditingId(null);
  };

  const resetRoleForm = () => {
    setRoleName('');
    setRoleDesc('');
    setEditingId(null);
  };

  const handleTabChange = (tab: 'users' | 'roles' | 'preferences' | 'audit') => {
    setActiveTab(tab);
    setActiveView('list');
  };

  const handleSaveUser = () => {
    if (!userName.trim() || !userEmail.trim()) return;

    if (activeView === 'edit_user' && editingId) {
      setUsers(prev => prev.map(u => u.id === editingId ? { ...u, name: userName, email: userEmail, role: userRole, status: userStatus, ...(userPassword && { password: userPassword }) } : u));
    } else {
      const newUser: User = { id: Date.now(), name: userName, email: userEmail, password: userPassword, role: userRole, status: userStatus };
      setUsers(prev => [...prev, newUser]);
      // Update role count
      setRoles(prev => prev.map(r => r.name === userRole ? { ...r, users: r.users + 1 } : r));
    }
    setActiveView('list');
    resetUserForm();
  };

  const handleDeleteUser = (id: number, roleName: string) => {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setRoles(prev => prev.map(r => r.name === roleName ? { ...r, users: Math.max(0, r.users - 1) } : r));
    }
  };

  const handleEditUser = (u: User) => {
    setUserName(u.name);
    setUserEmail(u.email);
    setUserPassword('');
    setUserRole(u.role);
    setUserStatus(u.status);
    setEditingId(u.id);
    setActiveView('edit_user');
  };

  const handleSaveRole = () => {
    if (!roleName.trim() || !roleDesc.trim()) return;

    if (activeView === 'edit_role' && editingId) {
      // Update users who had this role if name changed? Let's keep it simple and just update the role info.
      const oldRole = roles.find(r => r.id === editingId);
      if (oldRole && oldRole.name !== roleName) {
        setUsers(users.map(u => u.role === oldRole.name ? { ...u, role: roleName } : u));
      }
      setRoles(roles.map(r => r.id === editingId ? { ...r, name: roleName, desc: roleDesc } : r));
    } else {
      const newRole: Role = { id: Date.now(), name: roleName, desc: roleDesc, users: 0 };
      setRoles([...roles, newRole]);
    }
    setActiveView('list');
    resetRoleForm();
  };

  const handleDeleteRole = (id: number) => {
    if (confirm('Tem certeza que deseja remover este nível de acesso?')) {
      setRoles(roles.filter(r => r.id !== id));
    }
  };

  const handleEditRole = (r: Role) => {
    setRoleName(r.name);
    setRoleDesc(r.desc);
    setEditingId(r.id);
    setActiveView('edit_role');
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-md"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl h-[85vh] bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex shadow-2xl shadow-blue-900/20"
      >
        {/* Sidebar */}
        <div className="w-64 bg-slate-900/50 border-r border-white/5 p-6 flex flex-col pt-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight">Ajustes</h2>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors sm:hidden">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => handleTabChange('users')}
              className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", activeTab === 'users' ? "bg-blue-600 font-bold text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-white/5")}
            >
              <Users size={18} />
              Usuários
            </button>
            <button 
              onClick={() => handleTabChange('roles')}
              className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", activeTab === 'roles' ? "bg-blue-600 font-bold text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-white/5")}
            >
              <Shield size={18} />
              Níveis de Acesso
            </button>
            <button 
              onClick={() => handleTabChange('preferences')}
              className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", activeTab === 'preferences' ? "bg-blue-600 font-bold text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-white/5")}
            >
              <Settings size={18} />
              Preferências
            </button>
            <button 
              onClick={() => handleTabChange('audit')}
              className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", activeTab === 'audit' ? "bg-blue-600 font-bold text-white shadow-md shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-white/5")}
            >
              <ClipboardList size={18} />
              Auditoria
              <span className="ml-1 px-2 py-0.5 bg-slate-700 rounded-full text-xs">{totalCount}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="absolute top-6 right-8 hidden sm:block z-10">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors bg-white/5 border border-white/10 backdrop-blur shadow-xl">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-10 sm:pt-20 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {activeTab === 'users' && activeView === 'list' && (
                <motion.div 
                  key="users-list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-4xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Gerenciar Usuários</h3>
                      <p className="text-sm text-slate-400 mt-1">Adicione ou remova membros e gerencie seus acessos.</p>
                    </div>
                    <button 
                      onClick={() => { resetUserForm(); setActiveView('add_user'); }}
                      className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      <Plus size={18} /> Novo Usuário
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text" 
                          placeholder="Buscar usuário..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="text-sm text-slate-400 font-medium ml-auto">
                        {filteredUsers.length} usuário(s)
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-300">
                        <thead className="text-xs uppercase bg-black/10 text-slate-500 font-semibold tracking-wider">
                          <tr>
                            <th className="px-6 py-4 border-b border-white/5">Nome</th>
                            <th className="px-6 py-4 border-b border-white/5">Acesso</th>
                            <th className="px-6 py-4 border-b border-white/5">Status</th>
                            <th className="px-6 py-4 border-b border-white/5 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-8 text-center text-slate-500 border-b border-white/5">
                                Nenhum usuário encontrado.
                              </td>
                            </tr>
                          )}
                          {filteredUsers.map(u => (
                            <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4">
                                <div className="font-medium text-white">{u.name}</div>
                                <div className="text-xs text-slate-500">{u.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                  u.status === 'Ativo' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                )}>
                                  <span className={cn("w-1.5 h-1.5 rounded-full", u.status === 'Ativo' ? "bg-emerald-400" : "bg-slate-400")} />
                                  {u.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEditUser(u)} className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors" title="Editar Usuário">
                                    <Edit2 size={16} />
                                  </button>
                                  <button onClick={() => handleDeleteUser(u.id, u.role)} className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-500/10 transition-colors" title="Remover Usuário">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (activeView === 'add_user' || activeView === 'edit_user') && (
                <motion.div 
                  key="users-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-2xl"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <button 
                      onClick={() => setActiveView('list')}
                      className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {activeView === 'add_user' ? 'Novo Usuário' : 'Editar Usuário'}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">Preencha os dados do membro da equipe.</p>
                    </div>
                  </div>

                  <div className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Nome Completo</label>
                        <input 
                          type="text" 
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Ex: João Silva"
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                        <input 
                          type="email" 
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="Ex: joao@empresa.com"
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">
                          {activeView === 'edit_user' ? 'Nova Senha (opcional)' : 'Senha'}
                        </label>
                        <input 
                          type="password" 
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          placeholder={activeView === 'edit_user' ? 'Deixe em branco para manter a atual' : 'Defina uma senha'}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Nível de Acesso</label>
                        <div className="relative">
                          <select 
                            value={userRole}
                            onChange={(e) => setUserRole(e.target.value)}
                            className="w-full appearance-none bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                          >
                            {roles.map(r => (
                              <option key={r.id} value={r.name} className="bg-slate-800 text-white">{r.name}</option>
                            ))}
                          </select>
                          <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Status</label>
                        <div className="relative">
                          <select 
                            value={userStatus}
                            onChange={(e) => setUserStatus(e.target.value as 'Ativo' | 'Inativo')}
                            className="w-full appearance-none bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                          >
                            <option value="Ativo" className="bg-slate-800 text-white">Ativo</option>
                            <option value="Inativo" className="bg-slate-800 text-white">Inativo</option>
                          </select>
                          <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3">
                      <button 
                        onClick={() => setActiveView('list')}
                        className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-bold text-sm transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleSaveUser}
                        disabled={!userName.trim() || !userEmail.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
                      >
                        <Save size={16} /> Salvar Usuário
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'roles' && activeView === 'list' && (
                <motion.div 
                  key="roles-list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-4xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Níveis de Acesso</h3>
                      <p className="text-sm text-slate-400 mt-1">Crie personas e atribua permissões de visualização ou edição.</p>
                    </div>
                    <button 
                      onClick={() => { resetRoleForm(); setActiveView('add_role'); }}
                      className="h-10 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-600/20"
                    >
                      <Plus size={18} /> Nova Função
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roles.map(r => (
                      <div key={r.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors flex flex-col h-full group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                            <Shield size={24} className="text-purple-400" />
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/10">
                            {r.users} usuários
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{r.name}</h4>
                        <p className="text-sm text-slate-400 mb-6 flex-1">{r.desc}</p>
                        <div className="pt-4 border-t border-white/5 flex items-center gap-2 justify-end">
                          <button onClick={() => handleEditRole(r)} className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors" title="Editar">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteRole(r.id)} className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors" title="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'roles' && (activeView === 'add_role' || activeView === 'edit_role') && (
                <motion.div 
                  key="roles-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-2xl"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <button 
                      onClick={() => setActiveView('list')}
                      className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {activeView === 'add_role' ? 'Nova Função' : 'Editar Função'}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">Defina as responsabilidades deste nível de acesso.</p>
                    </div>
                  </div>

                  <div className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Nome da Função</label>
                      <input 
                        type="text" 
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="Ex: Analista de Qualidade"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">Descrição</label>
                      <textarea 
                        value={roleDesc}
                        onChange={(e) => setRoleDesc(e.target.value)}
                        placeholder="O que este usuário pode fazer no sistema?"
                        className="w-full h-24 resize-none bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500"
                      />
                    </div>
                    
                    <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3">
                      <button 
                        onClick={() => setActiveView('list')}
                        className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-bold text-sm transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleSaveRole}
                        disabled={!roleName.trim() || !roleDesc.trim()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none"
                      >
                        <Save size={16} /> Salvar Função
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-4xl"
                >
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white">Preferências do Sistema</h3>
                    <p className="text-sm text-slate-400 mt-1">Configurações globais do Tecno Mapper.</p>
                  </div>

                  <div className="space-y-8">
                    {/* Workflow Section */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Fluxo de Trabalho</h4>
                      <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-white">Aprovação Obrigatória</h5>
                            <p className="text-sm text-slate-400 mt-1">Exigir aprovação de mapas antes de serem publicados.</p>
                          </div>
                          <Toggle checked={preferences.requireApproval} onChange={() => {
                            setPreferences({ requireApproval: !preferences.requireApproval });
                            if (enableAuditLog && currentUser?.name) console.log(`[AUDIT] ${currentUser.name} alterou: Aprovação Obrigatória = ${!preferences.requireApproval}`);
                          }} />
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-white">Salvamento Automático</h5>
                            <p className="text-sm text-slate-400 mt-1">Salvar alterações automaticamente a cada 30 segundos.</p>
                          </div>
                          <Toggle checked={preferences.autoSave} onChange={() => {
                            setPreferences({ autoSave: !preferences.autoSave });
                            if (enableAuditLog && currentUser?.name) console.log(`[AUDIT] ${currentUser.name} alterou: Salvamento Automático = ${!preferences.autoSave}`);
                          }} />
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-white">Log de Auditoria</h5>
                            <p className="text-sm text-slate-400 mt-1">Registrar todas as ações dos usuários para auditoria.</p>
                          </div>
                          <Toggle checked={preferences.enableAuditLog} onChange={() => {
                            setPreferences({ enableAuditLog: !preferences.enableAuditLog });
                            if (currentUser?.name) console.log(`[AUDIT] ${currentUser.name} alterou: Log de Auditoria = ${!preferences.enableAuditLog}`);
                          }} />
                        </div>
                      </div>
                    </div>

                    {/* Notifications Section */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Notificações</h4>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-white">Notificações por Email</h5>
                          <p className="text-sm text-slate-400 mt-1">Avisar autores quando o mapa receber comentários.</p>
                        </div>
                        <Toggle checked={preferences.emailNotifications} onChange={() => {
                          setPreferences({ emailNotifications: !preferences.emailNotifications });
                          if (enableAuditLog && currentUser?.name) console.log(`[AUDIT] ${currentUser.name} alterou: Notificações por Email = ${!preferences.emailNotifications}`);
                        }} />
                      </div>
                    </div>

                    {/* Display Section */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Exibição</h4>
                      <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h5 className="font-bold text-white">Layout Padrão do Mapa</h5>
                              <p className="text-sm text-slate-400 mt-1">Direção de organização automática dos nós.</p>
                            </div>
                            <select
                              value={preferences.defaultMapLayout}
                              onChange={(e) => {
                                setPreferences({ defaultMapLayout: e.target.value as Preferences['defaultMapLayout'] });
                                if (enableAuditLog && currentUser?.name) console.log(`[AUDIT] ${currentUser.name} alterou: Layout Padrão = ${e.target.value}`);
                              }}
                              className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                            >
                              <option value="LR" className="bg-slate-800">Esquerda → Direita</option>
                              <option value="TB" className="bg-slate-800">Topo → Base</option>
                              <option value="RL" className="bg-slate-800">Direita → Esquerda</option>
                              <option value="BT" className="bg-slate-800">Base → Topo</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Section */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Segurança</h4>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-white">Tempo de Sessão</h5>
                            <p className="text-sm text-slate-400 mt-1">Encerrar sessão após inatividade (minutos).</p>
                          </div>
                          <select
                            value={preferences.sessionTimeout}
                            onChange={(e) => {
                              setPreferences({ sessionTimeout: parseInt(e.target.value) });
                              if (enableAuditLog && currentUser?.name) console.log(`[AUDIT] ${currentUser.name} alterou: Tempo de Sessão = ${e.target.value} min`);
                            }}
                            className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                          >
                            <option value={15} className="bg-slate-800">15 minutos</option>
                            <option value={30} className="bg-slate-800">30 minutos</option>
                            <option value={60} className="bg-slate-800">1 hora</option>
                            <option value={120} className="bg-slate-800">2 horas</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                      <h4 className="font-bold text-red-500">Zona de Perigo</h4>
                      <p className="text-sm text-red-400/80 mt-1 mb-4">Ações destrutivas que afetam todos os usuários da organização.</p>
                      <button
                        onClick={() => {
                          if (confirm('Atenção: Tem certeza que deseja apagar os dados da organização? Esta ação é irreversível.')) {
                            alert('Organização bloqueada para exclusão (modo de demonstração).');
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-colors"
                      >
                        Excluir Organização
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'audit' && (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-5xl h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Log de Auditoria</h3>
                      <p className="text-sm text-slate-400 mt-1">Histórico completo de ações dos usuários no sistema.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-400">{totalCount} registros</span>
                    </div>
                  </div>

                  {/* Filters & Actions */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                      <Filter size={16} className="text-slate-400" />
                      <select
                        value={auditFilter}
                        onChange={(e) => setAuditFilter(e.target.value as any)}
                        className="bg-transparent text-sm text-white outline-none"
                      >
                        <option value="" className="bg-slate-800">Todas categorias</option>
                        <option value="auth" className="bg-slate-800">Autenticação</option>
                        <option value="config" className="bg-slate-800">Configuração</option>
                        <option value="data" className="bg-slate-800">Dados</option>
                        <option value="security" className="bg-slate-800">Segurança</option>
                        <option value="system" className="bg-slate-800">Sistema</option>
                      </select>
                    </div>
                    <div className="flex-1"></div>
                    <button
                      onClick={downloadTxt}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <FileText size={16} /> Exportar TXT
                    </button>
                    <button
                      onClick={downloadJson}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Download size={16} /> Exportar JSON
                    </button>
                    <button
                      onClick={clearLogs}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <Trash size={16} /> Limpar
                    </button>
                  </div>

                  {/* Audit Log List */}
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                      {filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                          <ClipboardList size={48} className="mb-4 opacity-20" />
                          <p>Nenhum registro de auditoria encontrado.</p>
                          <p className="text-sm mt-1">Ações do sistema aparecerão aqui.</p>
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead className="bg-white/5 sticky top-0">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Data/Hora</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Usuário</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ação</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</th>
                              <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Detalhes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredLogs.slice().reverse().map((log) => (
                              <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="text-sm text-white">{log.userName}</div>
                                  <div className="text-xs text-slate-500">{log.userRole}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-300">{log.action}</td>
                                <td className="px-4 py-3">
                                  <span className={cn(
                                    "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                                    log.category === 'auth' && "bg-purple-500/10 text-purple-400",
                                    log.category === 'config' && "bg-blue-500/10 text-blue-400",
                                    log.category === 'data' && "bg-amber-500/10 text-amber-400",
                                    log.category === 'security' && "bg-red-500/10 text-red-400",
                                    log.category === 'system' && "bg-emerald-500/10 text-emerald-400"
                                  )}>
                                    {log.category.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate" title={log.details}>
                                  {log.details}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Preview TXT */}
                  {filteredLogs.length > 0 && (
                    <div className="mt-4 bg-black/30 border border-white/10 rounded-2xl p-4">
                      <h4 className="text-sm font-bold text-slate-400 mb-2 flex items-center gap-2">
                        <FileText size={14} /> Pré-visualização do relatório TXT
                      </h4>
                      <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap max-h-32 overflow-auto custom-scrollbar">
                        {`================================================================================
RELATÓRIO DE AUDITORIA - TECNO MAPPER
Total de registros: ${filteredLogs.length}
================================================================================

${filteredLogs.slice(-5).map((log, i) => `[${(filteredLogs.length - 5 + i + 1).toString().padStart(4, '0')}] ${new Date(log.timestamp).toLocaleString('pt-BR')}
  Usuário: ${log.userName} [${log.userRole}]
  Ação: ${log.action}
  Detalhes: ${log.details}`).join('\n\n')}

... e mais ${Math.max(0, filteredLogs.length - 5)} registros`}
                      </pre>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

