import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Shield, Settings, Plus, Search, Check, ChevronRight, Edit2, Trash2, ArrowLeft, Save, FileText, Download, Trash, Filter, ClipboardList, Building2, Eye, Folder, BarChart3, Trophy, Unlock, UserCheck, UserX, RefreshCw, AlertTriangle, Target, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Preferences } from '../hooks/usePreferences';
import { useAuditLog } from '../hooks/useAuditLog';
import { useUsers } from '../hooks/useUsers';
import { ConfirmModal } from './ConfirmModal';
import { GamificationSettingsPanel } from './GamificationSettingsPanel';
import { ROLE_DEFINITIONS, can, type UserRole } from '../lib/permissions';
import { supabase } from '../lib/supabase';

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

type User = { id: number; name: string; email: string; password?: string; role: string; department?: string; status: 'Ativo' | 'Inativo' };
type Role = { id: number; name: string; desc: string; users: number };

type Department = { id: string; name: string; description?: string; color: string; icon: string; isDefault?: boolean };
type SettingsTab = 'users' | 'performance' | 'roles' | 'departments' | 'preferences' | 'gamification' | 'audit';
type PerformanceRisk = 'excellent' | 'good' | 'attention' | 'blocked' | 'no_data' | 'inactive';
type PerformanceRow = {
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Ativo' | 'Inativo';
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  passRate: number;
  totalXp: number;
  level: number;
  badges: number;
  certificates: number;
  activeLocks: number;
  lastActivity: string;
  risk: PerformanceRisk;
  recommendedAction: string;
};

export function SettingsModal({ onClose, preferences: externalPreferences, setPreferences: externalSetPreferences, currentUser, enableAuditLog }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');
  const [activeView, setActiveView] = useState<'list' | 'add_user' | 'edit_user' | 'add_role' | 'edit_role' | 'add_department' | 'edit_department'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [performanceRows, setPerformanceRows] = useState<PerformanceRow[]>([]);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);
  const [performanceFilter, setPerformanceFilter] = useState<'all' | PerformanceRisk>('all');
  const [selectedPerformanceUserId, setSelectedPerformanceUserId] = useState<string | null>(null);
  const [performanceNotice, setPerformanceNotice] = useState<string | null>(null);
  
  // Audit Log
  const { logs, clearLogs, downloadTxt, downloadJson, filterLogs, totalCount } = useAuditLog(enableAuditLog ?? true);
  const [auditFilter, setAuditFilter] = useState<'' | 'auth' | 'config' | 'data' | 'security' | 'system'>('');
  const filteredLogs = auditFilter ? filterLogs(auditFilter) : logs;
  
  // Use the useUsers hook for localStorage integration
  const { 
    users, 
    departments, 
    loading: usersLoading, 
    error: usersError, 
    createUser, 
    updateUser, 
    deleteUser,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    refetch: refetchUsers,
  } = useUsers();

  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: 'Administrador', desc: ROLE_DEFINITIONS.Administrador.description, users: 0 },
    { id: 2, name: 'Gerente',        desc: ROLE_DEFINITIONS.Gerente.description,       users: 0 },
    { id: 3, name: 'Editor',         desc: ROLE_DEFINITIONS.Editor.description,        users: 0 },
    { id: 4, name: 'Visualizador',   desc: ROLE_DEFINITIONS.Visualizador.description,  users: 0 },
  ]);

  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({ name: '', description: '', color: '#3b82f6', icon: 'building', isDefault: false });

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
    connectionTheme: 'industrialIATF',
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

  const [editingId, setEditingId] = useState<number | string | null>(null);
  
  // Form States
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('Editor');
  const [userDepartment, setUserDepartment] = useState('');
  const [userStatus, setUserStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');

  const resetUserForm = () => {
    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole('Editor');
    setUserDepartment('');
    setUserStatus('Ativo');
    setEditingId(null);
  };

  const resetRoleForm = () => {
    setRoleName('');
    setRoleDesc('');
    setEditingId(null);
  };

  const isAdmin = currentUser?.role === 'Administrador';

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setActiveView('list');
  };

  const handleSaveUser = async () => {
    if (!userName.trim() || !userEmail.trim()) return;

    const userData = {
      name: userName,
      email: userEmail,
      role: userRole,
      department: userDepartment,
      status: userStatus,
      password: userPassword
    };

    let result;
    if (activeView === 'edit_user' && editingId) {
      result = await updateUser(String(editingId), userData);
    } else {
      result = await createUser(userData);
    }

    if (result.success) {
      setActiveView('list');
      resetUserForm();
    } else {
      alert('Erro ao salvar usuário: ' + result.error);
    }
  };

  const [confirmState, setConfirmState] = useState<{ title: string; message: string; onConfirm: () => void; type?: 'danger' | 'warning' } | null>(null);

  const handleDeleteUser = async (id: string, roleName: string) => {
    setConfirmState({
      title: 'Remover Usuário',
      message: 'Tem certeza que deseja remover este usuário permanentemente Esta ação não pode ser desfeita.',
      type: 'danger',
      onConfirm: async () => {
        const result = await deleteUser(id.toString());
        if (result.success) {
          setRoles(prev => prev.map(r => r.name === roleName ? { ...r, users: Math.max(0, r.users - 1) } : r));
        }
      },
    });
  };

  const handleEditUser = (u: any) => {
    setUserName(u.name);
    setUserEmail(u.email);
    setUserPassword('');
    setUserRole(u.role);
    setUserDepartment(u.department || '');
    setUserStatus(u.status);
    setEditingId(u.id);
    setActiveView('edit_user');
  };

  const handleSaveRole = () => {
    if (!roleName.trim() || !roleDesc.trim()) return;

    if (activeView === 'edit_role' && editingId) {
      // Update role info only - user roles are managed separately in Supabase
      setRoles(roles.map(r => r.id === editingId ? { ...r, name: roleName, desc: roleDesc } : r));
    } else {
      const newRole: Role = { id: Date.now(), name: roleName, desc: roleDesc, users: 0 };
      setRoles([...roles, newRole]);
    }
    setActiveView('list');
    resetRoleForm();
  };

  const handleDeleteRole = (id: number) => {
    setConfirmState({
      title: 'Remover Nível de Acesso',
      message: 'Tem certeza que deseja remover este nível de acesso Usuários com este nível poderão perder permissões.',
      type: 'warning',
      onConfirm: () => setRoles(roles.filter(r => r.id !== id)),
    });
  };

  const handleEditRole = (r: Role) => {
    setRoleName(r.name);
    setRoleDesc(r.desc);
    setEditingId(r.id);
    setActiveView('edit_role');
  };

  const filteredUsers = users.filter(u => (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()));

  const getAttemptPassingScore = (attempt: any) => attempt.assessments?.passing_score ?? 70;
  const getAttemptDate = (attempt: any) => attempt.completed_at || attempt.started_at || attempt.created_at;

  const loadPerformanceData = useCallback(async () => {
    if (!isAdmin) return;
    setPerformanceLoading(true);
    setPerformanceError(null);

    try {
      const [
        attemptsResult,
        achievementsResult,
        badgesResult,
        certificatesResult,
        locksResult,
      ] = await Promise.all([
        supabase.from('assessment_attempts').select('*, assessments(title, passing_score)').order('started_at', { ascending: false }),
        supabase.from('user_achievements').select('*'),
        supabase.from('user_badges').select('*'),
        supabase.from('assessment_certificates').select('*'),
        supabase.from('assessment_attempt_locks').select('*'),
      ]);

      const firstError = attemptsResult.error || achievementsResult.error || badgesResult.error || certificatesResult.error || locksResult.error;
      if (firstError) throw firstError;

      const attempts = attemptsResult.data || [];
      const achievements = achievementsResult.data || [];
      const badges = badgesResult.data || [];
      const certificates = certificatesResult.data || [];
      const locks = locksResult.data || [];
      const now = new Date();

      const rows = users.map((user: any): PerformanceRow => {
        const userAttempts = attempts.filter((attempt: any) => attempt.user_id === user.id);
        const completed = userAttempts.filter((attempt: any) => attempt.status === 'completed' || attempt.score !== null);
        const passed = completed.filter((attempt: any) => (attempt.score || 0) >= getAttemptPassingScore(attempt));
        const averageScore = completed.length ?
           Math.round(completed.reduce((sum: number, attempt: any) => sum + (attempt.score || 0), 0) / completed.length)
          : 0;
        const passRate = completed.length ? Math.round((passed.length / completed.length) * 100) : 0;
        const userAchievement = achievements.find((item: any) => item.user_id === user.id);
        const totalXp = userAchievement?.total_xp || completed.reduce((sum: number, attempt: any) => sum + (attempt.xp_earned || 0), 0);
        const level = userAchievement?.current_level || Math.max(1, Math.floor(Math.sqrt(totalXp / 100)));
        const activeLocks = locks.filter((lock: any) => lock.user_id === user.id && lock.blocked_until && new Date(lock.blocked_until) > now).length;
        const lastActivity = completed
          .map((attempt: any) => getAttemptDate(attempt))
          .filter(Boolean)
          .sort()
          .reverse()[0];

        let risk: PerformanceRisk = 'good';
        let recommendedAction = 'Manter acompanhamento normal e incentivar próxima trilha.';
        if (user.status === 'Inativo') {
          risk = 'inactive';
          recommendedAction = 'Usuário inativo. Reativar somente se ele precisar voltar a acessar o sistema.';
        } else if (activeLocks > 0) {
          risk = 'blocked';
          recommendedAction = 'Usuário bloqueado por tentativas. Recomende revisão do mapa antes de liberar nova tentativa.';
        } else if (completed.length === 0) {
          risk = 'no_data';
          recommendedAction = 'Ainda não realizou avaliações. Oriente a iniciar pelo nível iniciante.';
        } else if (averageScore < 70 || passRate < 70) {
          risk = 'attention';
          recommendedAction = 'Reforçar treinamento, revisar pontos errados e liberar nova tentativa após estudo.';
        } else if (averageScore >= 90 && passRate >= 90) {
          risk = 'excellent';
          recommendedAction = 'Bom candidato para níveis avançados, multiplicador interno ou reconhecimento.';
        }

        return {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          status: user.status || 'Ativo',
          totalAttempts: userAttempts.length,
          completedAttempts: completed.length,
          averageScore,
          passRate,
          totalXp,
          level,
          badges: badges.filter((badge: any) => badge.user_id === user.id).length,
          certificates: certificates.filter((cert: any) => cert.user_id === user.id).length,
          activeLocks,
          lastActivity,
          risk,
          recommendedAction,
        };
      });

      setPerformanceRows(rows.sort((a, b) => b.totalXp - a.totalXp || b.averageScore - a.averageScore));
    } catch (err: any) {
      console.error('Erro ao carregar desempenho:', err);
      setPerformanceError(err.message || 'Não foi possível carregar o desempenho dos usuários.');
    } finally {
      setPerformanceLoading(false);
    }
  }, [isAdmin, users]);

  useEffect(() => {
    if (activeTab === 'performance') {
      loadPerformanceData();
    }
  }, [activeTab, loadPerformanceData]);

  const filteredPerformanceRows = performanceRows.filter((row) => {
    const matchesSearch = `${row.name} ${row.email} ${row.department || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = performanceFilter === 'all' || row.risk === performanceFilter;
    return matchesSearch && matchesRisk;
  });

  const performanceStats = {
    users: performanceRows.length,
    averageScore: performanceRows.filter(row => row.completedAttempts > 0).length ?
       Math.round(performanceRows.filter(row => row.completedAttempts > 0).reduce((sum, row) => sum + row.averageScore, 0) / performanceRows.filter(row => row.completedAttempts > 0).length)
      : 0,
    blocked: performanceRows.filter(row => row.activeLocks > 0).length,
    attention: performanceRows.filter(row => row.risk === 'attention' || row.risk === 'blocked').length,
    certificates: performanceRows.reduce((sum, row) => sum + row.certificates, 0),
  };

  const selectedPerformanceUser = performanceRows.find(row => row.userId === selectedPerformanceUserId) || null;

  const riskConfig: Record<PerformanceRisk, { label: string; className: string }> = {
    excellent: { label: 'Excelente', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    good: { label: 'Em evolução', className: 'bg-blue-500/10 text-blue-300 border-blue-500/30' },
    attention: { label: 'Atenção', className: 'bg-amber-500/10 text-amber-300 border-amber-500/30' },
    blocked: { label: 'Bloqueado', className: 'bg-red-500/10 text-red-300 border-red-500/30' },
    no_data: { label: 'Sem avaliação', className: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
    inactive: { label: 'Inativo', className: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30' },
  };

  const clearUserLocks = (row: PerformanceRow) => {
    setConfirmState({
      title: 'Liberar tentativas',
      message: `Deseja remover os bloqueios de avaliação de ${row.name} Use esta ação apenas quando o líder já orientou o operador a revisar o conteúdo.`,
      type: 'warning',
      onConfirm: async () => {
        const { error } = await supabase.from('assessment_attempt_locks').delete().eq('user_id', row.userId);
        if (error) {
          setPerformanceNotice(`Erro ao liberar bloqueios: ${error.message}`);
          return;
        }
        setPerformanceNotice(`Bloqueios de ${row.name} liberados.`);
        loadPerformanceData();
      },
    });
  };

  const toggleUserStatus = (row: PerformanceRow) => {
    const nextStatus = row.status === 'Ativo' ? 'Inativo' : 'Ativo';
    setConfirmState({
      title: `${nextStatus === 'Ativo' ? 'Reativar' : 'Inativar'} usuário`,
      message: `Deseja alterar o status de ${row.name} para ${nextStatus}`,
      type: nextStatus === 'Ativo' ? 'warning' : 'danger',
      onConfirm: async () => {
        const result = await updateUser(row.userId, { status: nextStatus });
        if (!result.success) {
          setPerformanceNotice(`Erro ao alterar status: ${result.error}`);
          return;
        }
        setPerformanceNotice(`${row.name} agora está ${nextStatus}.`);
        refetchUsers();
        loadPerformanceData();
      },
    });
  };

  const exportPerformanceCsv = () => {
    const header = ['Nome', 'Email', 'Departamento', 'Status', 'Tentativas', 'Média', 'Aprovação', 'XP', 'Nível', 'Selos', 'Certificados', 'Risco', 'Recomendação'];
    const lines = filteredPerformanceRows.map(row => [
      row.name,
      row.email,
      row.department || '',
      row.status,
      row.completedAttempts,
      `${row.averageScore}%`,
      `${row.passRate}%`,
      row.totalXp,
      row.level,
      row.badges,
      row.certificates,
      riskConfig[row.risk].label,
      row.recommendedAction,
    ]);
    const csv = [header, ...lines]
      .map(line => line.map(value => `"${String(value).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `desempenho-usuarios-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 lg:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-md"
      />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative w-full sm:max-w-6xl h-[92vh] sm:h-[85vh] bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col sm:flex-row shadow-2xl shadow-blue-900/20"
      >
        {/* -- Mobile top header -- */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sm:hidden shrink-0">
          <h2 className="text-base font-bold text-white">Ajustes</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* -- Mobile tab bar (horizontal scroll) -- */}
        <div className="flex sm:hidden shrink-0 overflow-x-auto border-b border-white/10 bg-slate-900/60 px-2 gap-1 py-2">
          {[
            { id: 'users',       icon: Users,        label: 'Usu\u00e1rios' },
            ...(isAdmin ? [{ id: 'performance', icon: BarChart3, label: 'Desemp.' }] : []),
            { id: 'roles',       icon: Shield,       label: 'Acesso' },
            { id: 'departments', icon: Building2,    label: 'Depto' },
            { id: 'preferences', icon: Settings,     label: 'Prefer.' },
            ...(isAdmin ? [{ id: 'gamification', icon: Trophy, label: 'Selos' }] : []),
            ...(isAdmin ? [{ id: 'audit', icon: ClipboardList, label: 'Auditoria' }] : []),
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id as typeof activeTab)}
              className={cn(
                'shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold transition-all',
                activeTab === id ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* -- Desktop Sidebar -- */}
        <div className="hidden sm:flex w-56 lg:w-64 bg-slate-900/50 border-r border-white/5 p-5 flex-col pt-8 shrink-0">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white tracking-tight">Ajustes</h2>
          </div>
          <div className="flex flex-col gap-1.5">
            <button onClick={() => handleTabChange('users')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", activeTab === 'users' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}>
              <Users size={17} /> {'Usu\u00e1rios'}
            </button>
            {isAdmin && (
              <button onClick={() => handleTabChange('performance')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", activeTab === 'performance' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}>
                <BarChart3 size={17} /> Desempenho
                {performanceStats.attention > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-full text-[9px] font-bold border border-amber-500/20">
                    {performanceStats.attention}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => handleTabChange('roles')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", activeTab === 'roles' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}>
              <Shield size={17} /> {'N\u00edveis de Acesso'}
            </button>
            <button onClick={() => handleTabChange('departments')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", activeTab === 'departments' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}>
              <Building2 size={17} /> Departamentos
            </button>
            <button onClick={() => handleTabChange('preferences')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", activeTab === 'preferences' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}>
              <Settings size={17} /> {'Prefer\u00eancias'}
            </button>
            {isAdmin && (
              <button onClick={() => handleTabChange('gamification')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", activeTab === 'gamification' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}>
                <Trophy size={17} /> Selos e Certificados
              </button>
            )}
            {isAdmin && (
              <button onClick={() => handleTabChange('audit')} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all", activeTab === 'audit' ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-white/5")}>
                <ClipboardList size={17} /> Auditoria
                <span className="ml-auto px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[9px] font-bold border border-red-500/20">Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 right-4 hidden sm:block z-10">
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors bg-white/5 border border-white/10">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 sm:pt-16 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {activeTab === 'users' && activeView === 'list' && (
                <motion.div 
                  key="users-list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-4xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <div>
                      <h3 className="text-lg sm:text-2xl font-bold text-white">Gerenciar Usuários</h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Adicione ou remova membros e gerencie seus acessos.</p>
                    </div>
                    <button 
                      onClick={() => { resetUserForm(); setActiveView('add_user'); }}
                      className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 w-full sm:w-auto justify-center"
                    >
                      <Plus size={16} /> Novo Usuário
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-4">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text"
                          autoComplete="off"
                          placeholder="Buscar usuário..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div className="text-sm text-slate-400 font-medium ml-auto flex items-center gap-2">
                        {usersLoading ? 'Carregando...' : `${users.length} usuário(s)`}
                        {!usersLoading && <button onClick={refetchUsers} className="text-xs text-blue-400 hover:text-blue-300 transition-colors" title="Recarregar">↻</button>}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-300">
                        <thead className="text-xs uppercase bg-black/10 text-slate-500 font-semibold tracking-wider">
                          <tr>
                            <th className="px-6 py-4 border-b border-white/5">Nome</th>
                            <th className="px-6 py-4 border-b border-white/5">Acesso</th>
                            <th className="px-6 py-4 border-b border-white/5">Departamento</th>
                            <th className="px-6 py-4 border-b border-white/5">Status</th>
                            <th className="px-6 py-4 border-b border-white/5 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersLoading && (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                Carregando usuários...
                              </td>
                            </tr>
                          )}
                          {!usersLoading && usersError && (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center">
                                <p className="text-red-400 text-sm mb-3">Erro ao carregar: {usersError}</p>
                                <button onClick={refetchUsers} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                                  Tentar novamente
                                </button>
                              </td>
                            </tr>
                          )}
                          {!usersLoading && !usersError && filteredUsers.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-slate-500 border-b border-white/5">
                                {users.length === 0 ? (
                                  <span>Nenhum usuário no banco. <button onClick={refetchUsers} className="underline text-blue-400 hover:text-blue-300">Recarregar</button></span>
                                ) : 'Nenhum usuário encontrado.'}
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
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  {u.department || 'Não atribuído'}
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
                          autoComplete="off"
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
                          autoComplete="off"
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
                          autoComplete="new-password"
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
                        <label className="block text-sm font-semibold text-slate-300 mb-2">Departamento</label>
                        <div className="relative">
                          <select 
                            value={userDepartment}
                            onChange={(e) => setUserDepartment(e.target.value)}
                            className="w-full appearance-none bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                          >
                            <option value="" className="bg-slate-800 text-white">Selecione...</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.name} className="bg-slate-800 text-white">{d.name}</option>
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

              {activeTab === 'performance' && isAdmin && (
                <motion.div
                  key="performance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-6xl space-y-5"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="text-blue-400" size={26} />
                        Painel de Desempenho
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Acompanhe aprendizagem, bloqueios, certificados e pontos de atenção dos operadores.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={loadPerformanceData}
                        className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-sm font-semibold flex items-center gap-2 transition-colors"
                      >
                        <RefreshCw size={16} className={performanceLoading ? 'animate-spin' : ''} />
                        Atualizar
                      </button>
                      <button
                        onClick={exportPerformanceCsv}
                        className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Download size={16} />
                        Exportar CSV
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
                    <div className="bg-blue-500/10 border border-blue-500/25 rounded-2xl p-4">
                      <Users className="w-5 h-5 text-blue-300 mb-3" />
                      <div className="text-2xl font-bold text-white">{performanceStats.users}</div>
                      <div className="text-xs text-slate-400">Usuários monitorados</div>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4">
                      <Target className="w-5 h-5 text-emerald-300 mb-3" />
                      <div className="text-2xl font-bold text-white">{performanceStats.averageScore}%</div>
                      <div className="text-xs text-slate-400">Média geral</div>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4">
                      <AlertTriangle className="w-5 h-5 text-amber-300 mb-3" />
                      <div className="text-2xl font-bold text-white">{performanceStats.attention}</div>
                      <div className="text-xs text-slate-400">Precisam de ação</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4">
                      <Unlock className="w-5 h-5 text-red-300 mb-3" />
                      <div className="text-2xl font-bold text-white">{performanceStats.blocked}</div>
                      <div className="text-xs text-slate-400">Com bloqueio ativo</div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/25 rounded-2xl p-4">
                      <Trophy className="w-5 h-5 text-purple-300 mb-3" />
                      <div className="text-2xl font-bold text-white">{performanceStats.certificates}</div>
                      <div className="text-xs text-slate-400">Certificados emitidos</div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-black/20 flex flex-col lg:flex-row gap-3 lg:items-center">
                      <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          autoComplete="off"
                          placeholder="Buscar operador, e-mail ou departamento..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-white placeholder:text-slate-500"
                        />
                      </div>
                      <select
                        value={performanceFilter}
                        onChange={(e) => setPerformanceFilter(e.target.value as any)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                      >
                        <option value="all" className="bg-slate-800">Todos os status</option>
                        <option value="attention" className="bg-slate-800">Atenção</option>
                        <option value="blocked" className="bg-slate-800">Bloqueados</option>
                        <option value="no_data" className="bg-slate-800">Sem avaliação</option>
                        <option value="excellent" className="bg-slate-800">Excelente</option>
                        <option value="inactive" className="bg-slate-800">Inativos</option>
                      </select>
                    </div>

                    {performanceNotice && (
                      <div className="m-4 mb-0 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100 flex items-center justify-between gap-3">
                        <span>{performanceNotice}</span>
                        <button onClick={() => setPerformanceNotice(null)} className="text-blue-200 hover:text-white">
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {performanceError && (
                      <div className="m-4 mb-0 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        Erro ao carregar desempenho: {performanceError}
                      </div>
                    )}

                    {performanceLoading ? (
                      <div className="py-16 text-center text-slate-400">
                        <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-60" />
                        Carregando desempenho dos usuários...
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead className="text-xs uppercase bg-black/10 text-slate-500 font-semibold tracking-wider">
                            <tr>
                              <th className="px-5 py-4 border-b border-white/5">Operador</th>
                              <th className="px-5 py-4 border-b border-white/5">Aprendizagem</th>
                              <th className="px-5 py-4 border-b border-white/5">Gamificação</th>
                              <th className="px-5 py-4 border-b border-white/5">Status</th>
                              <th className="px-5 py-4 border-b border-white/5 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredPerformanceRows.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                  Nenhum usuário encontrado para os filtros atuais.
                                </td>
                              </tr>
                            ) : filteredPerformanceRows.map((row) => (
                              <tr key={row.userId} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                                <td className="px-5 py-4 min-w-[240px]">
                                  <div className="font-semibold text-white">{row.name}</div>
                                  <div className="text-xs text-slate-500">{row.email}</div>
                                  <div className="text-xs text-slate-400 mt-1">{row.department || 'Sem departamento'} • {row.role}</div>
                                </td>
                                <td className="px-5 py-4 min-w-[220px]">
                                  <div className="flex items-center gap-3">
                                    <div className="w-16 h-2 rounded-full bg-slate-700 overflow-hidden">
                                      <div className={cn('h-full rounded-full', row.averageScore >= 70 ? 'bg-emerald-400' : 'bg-amber-400')} style={{ width: `${Math.min(100, row.averageScore)}%` }} />
                                    </div>
                                    <span className="text-white font-bold">{row.averageScore}%</span>
                                  </div>
                                  <div className="text-xs text-slate-400 mt-1">
                                    {row.completedAttempts} concluídas • {row.passRate}% aprovação
                                  </div>
                                </td>
                                <td className="px-5 py-4 min-w-[190px]">
                                  <div className="text-white font-semibold">{row.totalXp} XP • Nível {row.level}</div>
                                  <div className="text-xs text-slate-400 mt-1">
                                    {row.badges} selos • {row.certificates} certificados
                                  </div>
                                </td>
                                <td className="px-5 py-4 min-w-[160px]">
                                  <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border', riskConfig[row.risk].className)}>
                                    {riskConfig[row.risk].label}
                                  </span>
                                  <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                    <Clock size={12} />
                                    {row.lastActivity ? new Date(row.lastActivity).toLocaleDateString('pt-BR') : 'Sem atividade'}
                                  </div>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex flex-wrap justify-end gap-2">
                                    <button
                                      onClick={() => setSelectedPerformanceUserId(row.userId)}
                                      className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/20"
                                    >
                                      Detalhes
                                    </button>
                                    {row.activeLocks > 0 && (
                                      <button
                                        onClick={() => clearUserLocks(row)}
                                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/20"
                                      >
                                        Liberar
                                      </button>
                                    )}
                                    <button
                                      onClick={() => toggleUserStatus(row)}
                                      className={cn(
                                        'px-3 py-1.5 rounded-lg text-xs font-semibold border',
                                        row.status === 'Ativo' ?
                                           'bg-red-500/10 hover:bg-red-500/20 text-red-300 border-red-500/20'
                                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20'
                                      )}
                                    >
                                      {row.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        const user = users.find((item: any) => item.id === row.userId);
                                        if (user) handleEditUser(user);
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10"
                                    >
                                      Editar
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {selectedPerformanceUser && (
                    <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-xl font-bold text-white">{selectedPerformanceUser.name}</h4>
                          <p className="text-sm text-slate-400">{selectedPerformanceUser.email}</p>
                        </div>
                        <button onClick={() => setSelectedPerformanceUserId(null)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white">
                          <X size={18} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5">
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                          <div className="text-xs text-slate-400">Média</div>
                          <div className="text-2xl font-bold text-white">{selectedPerformanceUser.averageScore}%</div>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                          <div className="text-xs text-slate-400">Aprovação</div>
                          <div className="text-2xl font-bold text-white">{selectedPerformanceUser.passRate}%</div>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                          <div className="text-xs text-slate-400">XP</div>
                          <div className="text-2xl font-bold text-white">{selectedPerformanceUser.totalXp}</div>
                        </div>
                        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                          <div className="text-xs text-slate-400">Bloqueios</div>
                          <div className="text-2xl font-bold text-white">{selectedPerformanceUser.activeLocks}</div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-300 mt-0.5" />
                          <div>
                            <div className="font-bold text-white">Ação recomendada</div>
                            <p className="text-sm text-slate-300 mt-1">{selectedPerformanceUser.recommendedAction}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

                  {/* Roles Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map(roleKey => {
                      const def = ROLE_DEFINITIONS[roleKey];
                      const count = users.filter(u => u.role === roleKey).length;
                      return (
                        <div key={roleKey} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col gap-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', def.badge.replace('text-', 'border-').replace('/30','').replace('/15',''))} style={{background:'rgba(255,255,255,0.04)'}}>
                                <Shield size={18} className={def.color} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-white text-sm">{def.label}</h4>
                                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', def.badge)}>{count} usuário{count !== 1 ? 's' : ''}</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{def.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            {def.permissions.map((p, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                <div className={cn('w-1 h-1 rounded-full shrink-0', def.color.replace('text-','bg-'))} />
                                {p}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Full Permission Matrix */}
                  <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-white/10 bg-white/[0.02]">
                      <h4 className="text-sm font-bold text-white">Matriz de Permissões</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Visão consolidada de todas as capacidades por nível</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-4 py-2.5 text-left text-slate-500 font-semibold w-48">Ação</th>
                            {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map(r => (
                              <th key={r} className={cn('px-4 py-2.5 text-center font-bold', ROLE_DEFINITIONS[r].color)}>{r}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {([
                            ['Ver Tarefas',             'viewTasks'],
                            ['Criar Tarefas',           'createTask'],
                            ['Editar Próprias Tarefas', 'editTask'],
                            ['Mover Tarefas',           'moveTask'],
                            ['Aprovar Tarefas',         'approveTask'],
                            ['Excluir Tarefas',         'deleteTask'],
                            ['Excluir Qualquer Tarefa', 'deleteAnyTask'],
                            ['Comentar',               'commentTask'],
                            ['Criar Nó no Mapa',        'createNode'],
                            ['Excluir Nó no Mapa',      'deleteNode'],
                            ['Ver Analytics',           'viewAnalytics'],
                            ['Analytics Completo',      'viewFullAnalytics'],
                            ['Gerenciar Usuários',      'manageUsers'],
                            ['Ver Logs de Auditoria',   'viewAuditLog'],
                            ['Limpar Logs',             'clearAuditLog'],
                          ] as [string, keyof typeof can][]).map(([label, permKey]) => (
                            <tr key={permKey} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                              <td className="px-4 py-2 text-slate-400">{label}</td>
                              {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map(roleKey => {
                                const mockUser = { id: '', name: '', email: '', role: roleKey };
                                const allowed = can[permKey]?.(mockUser) ?? false;
                                return (
                                  <td key={roleKey} className="px-4 py-2 text-center">
                                    {allowed ?
                                       <span className="text-emerald-400 font-bold"></span>
                                      : <span className="text-slate-700"></span>}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                        autoComplete="off"
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
                        placeholder="O que este usuário pode fazer no sistema"
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
                    <h3 className="text-2xl font-bold text-white">{'Prefer\u00eancias do Sistema'}</h3>
                    <p className="text-sm text-slate-400 mt-1">{'Configura\u00e7\u00f5es globais do Tecno Mapper.'}</p>
                  </div>

                  <div className="space-y-8">
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
                            if (enableAuditLog && currentUser.name) console.log(`[AUDIT] ${currentUser.name} alterou: Aprovação Obrigatória = ${!preferences.requireApproval}`);
                          }} />
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-white">Salvamento Automático</h5>
                            <p className="text-sm text-slate-400 mt-1">Salvar alterações automaticamente a cada 30 segundos.</p>
                          </div>
                          <Toggle checked={preferences.autoSave} onChange={() => {
                            setPreferences({ autoSave: !preferences.autoSave });
                            if (enableAuditLog && currentUser.name) console.log(`[AUDIT] ${currentUser.name} alterou: Salvamento Automático = ${!preferences.autoSave}`);
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

                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Notificações</h4>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-white">Notificações por Email</h5>
                          <p className="text-sm text-slate-400 mt-1">Avisar autores quando o mapa receber comentários.</p>
                        </div>
                        <Toggle checked={preferences.emailNotifications} onChange={() => {
                          setPreferences({ emailNotifications: !preferences.emailNotifications });
                          if (enableAuditLog && currentUser.name) console.log(`[AUDIT] ${currentUser.name} alterou: Notificações por Email = ${!preferences.emailNotifications}`);
                        }} />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Exibio</h4>
                      <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h5 className="font-bold text-white">Layout Padro do Mapa</h5>
                              <p className="text-sm text-slate-400 mt-1">Direo de organização automtica dos ns.</p>
                            </div>
                            <select
                              value={preferences.defaultMapLayout}
                              onChange={(e) => {
                                setPreferences({ defaultMapLayout: e.target.value as Preferences['defaultMapLayout'] });
                                if (enableAuditLog && currentUser.name) console.log(`[AUDIT] ${currentUser.name} alterou: Layout Padro = ${e.target.value}`);
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
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h5 className="font-bold text-white">Tema das Conexões</h5>
                              <p className="text-sm text-slate-400 mt-1">Altera o estilo visual das linhas do mapa em tempo real.</p>
                            </div>
                            <select
                              value={preferences.connectionTheme}
                              onChange={(e) => {
                                setPreferences({ connectionTheme: e.target.value as Preferences['connectionTheme'] });
                                if (enableAuditLog && currentUser.name) console.log(`[AUDIT] ${currentUser.name} alterou: Tema das Conexões = ${e.target.value}`);
                              }}
                              className="bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500/50 min-w-[200px]"
                            >
                              <option value="industrialIATF" className="bg-slate-800">Industrial IATF</option>
                              <option value="engineering" className="bg-slate-800">Engenharia</option>
                              <option value="futuristic" className="bg-slate-800">Futurista</option>
                              <option value="classic" className="bg-slate-800">Clássico</option>
                              <option value="minimalist" className="bg-slate-800">Minimalista</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Segurança</h4>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-white">Tempo de Sesso</h5>
                            <p className="text-sm text-slate-400 mt-1">Encerrar sesso após inatividade (minutos).</p>
                          </div>
                          <select
                            value={preferences.sessionTimeout}
                            onChange={(e) => {
                              setPreferences({ sessionTimeout: parseInt(e.target.value) });
                              if (enableAuditLog && currentUser.name) console.log(`[AUDIT] ${currentUser.name} alterou: Tempo de Sesso = ${e.target.value} min`);
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

                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                      <h4 className="font-bold text-red-500">Zona de Perigo</h4>
                      <p className="text-sm text-red-400/80 mt-1 mb-4">Ações destrutivas que afetam todos os usuários da organização.</p>
                      <button
                        onClick={() => {
                          setConfirmState({
                            title: 'Excluir Organizao',
                            message: 'Tem certeza que deseja excluir os dados da organização Esta ação  irreversível e afeta todos os usuários.',
                            type: 'danger',
                            onConfirm: () => {},
                          });
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-colors"
                      >
                        Excluir Organizao
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'gamification' && isAdmin && (
                <motion.div
                  key="gamification"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-6xl"
                >
                  <GamificationSettingsPanel currentUserName={currentUser.name} />
                </motion.div>
              )}

              {activeTab === 'audit' && (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-5xl flex flex-col gap-4"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg sm:text-2xl font-bold text-white">Log de Auditoria</h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Histórico completo de ações dos usuários no sistema.</p>
                    </div>
                    <span className="text-xs sm:text-sm text-slate-400 font-semibold shrink-0">
                      {totalCount} registros
                    </span>
                  </div>

                  {/* Filters & Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Filter select */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex-1 min-w-[140px]">
                      <Filter size={14} className="text-slate-400 shrink-0" />
                      <select
                        value={auditFilter}
                        onChange={(e) => setAuditFilter(e.target.value as any)}
                        className="bg-transparent text-xs sm:text-sm text-white outline-none w-full"
                      >
                        <option value="" className="bg-slate-800">Todas categorias</option>
                        <option value="auth" className="bg-slate-800">Autenticação</option>
                        <option value="config" className="bg-slate-800">Configuração</option>
                        <option value="data" className="bg-slate-800">Dados</option>
                        <option value="security" className="bg-slate-800">Segurança</option>
                        <option value="system" className="bg-slate-800">Sistema</option>
                      </select>
                    </div>
                    {/* Action buttons */}
                    <button
                      onClick={downloadTxt}
                      className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                      title="Exportar TXT"
                    >
                      <FileText size={14} />
                      <span className="hidden sm:inline">Exportar </span>TXT
                    </button>
                    <button
                      onClick={downloadJson}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                      title="Exportar JSON"
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">Exportar </span>JSON
                    </button>
                    <button
                      onClick={clearLogs}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                      title="Limpar logs"
                    >
                      <Trash size={14} />
                      <span className="hidden sm:inline">Limpar</span>
                    </button>
                  </div>

                  {/* Audit Log  cards on mobile, table on desktop */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    {filteredLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                        <ClipboardList size={40} className="mb-3 opacity-20" />
                        <p className="text-sm">Nenhum registro encontrado.</p>
                        <p className="text-xs mt-1">Ações do sistema aparecerão aqui.</p>
                      </div>
                    ) : (
                      <>
                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-auto max-h-72 custom-scrollbar">
                          <table className="w-full">
                            <thead className="bg-white/5 sticky top-0">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Data/Hora</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Usuário</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ação</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Categoria</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Detalhes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {filteredLogs.slice().reverse().map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="px-4 py-3 text-xs text-slate-300 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm text-white">{log.userName}</div>
                                    <div className="text-xs text-slate-500">{log.userRole}</div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-300">{log.action}</td>
                                  <td className="px-4 py-3">
                                    <span className={cn("inline-flex px-2 py-1 rounded-full text-xs font-medium",
                                      log.category === 'auth' && "bg-purple-500/10 text-purple-400",
                                      log.category === 'config' && "bg-blue-500/10 text-blue-400",
                                      log.category === 'data' && "bg-amber-500/10 text-amber-400",
                                      log.category === 'security' && "bg-red-500/10 text-red-400",
                                      log.category === 'system' && "bg-emerald-500/10 text-emerald-400"
                                    )}>{log.category.toUpperCase()}</span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate" title={log.details}>{log.details}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden divide-y divide-white/5 max-h-64 overflow-y-auto custom-scrollbar">
                          {filteredLogs.slice().reverse().map((log) => (
                            <div key={log.id} className="px-4 py-3 flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className={cn("shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold",
                                  log.category === 'auth' && "bg-purple-500/10 text-purple-400",
                                  log.category === 'config' && "bg-blue-500/10 text-blue-400",
                                  log.category === 'data' && "bg-amber-500/10 text-amber-400",
                                  log.category === 'security' && "bg-red-500/10 text-red-400",
                                  log.category === 'system' && "bg-emerald-500/10 text-emerald-400"
                                )}>{log.category.toUpperCase()}</span>
                                <span className="text-[10px] text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                              </div>
                              <p className="text-sm font-semibold text-white leading-tight">{log.action}</p>
                              <p className="text-xs text-slate-400 truncate">{log.details}</p>
                              <p className="text-[10px] text-slate-500">{log.userName} · {log.userRole}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Preview TXT  collapsible */}
                  {filteredLogs.length > 0 && (
                    <details className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                      <summary className="px-4 py-3 text-xs sm:text-sm font-bold text-slate-400 flex items-center gap-2 cursor-pointer select-none list-none">
                        <FileText size={13} /> Pré-visualização do relatório TXT
                        <span className="ml-auto text-slate-600 text-[10px]">toque para expandir</span>
                      </summary>
                      <div className="px-4 pb-4">
                        <pre className="text-[10px] sm:text-xs text-slate-500 font-mono whitespace-pre-wrap max-h-32 overflow-auto custom-scrollbar">
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
                    </details>
                  )}
                </motion.div>
              )}

              {/* Departments Tab */}
              {activeTab === 'departments' && activeView === 'list' && (
                <motion.div 
                  key="departments-list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Building2 className="text-blue-400" size={28} />
                        Departamentos
                      </h3>
                      <p className="text-slate-400 mt-1">Gerencie os departamentos e setores da organização</p>
                    </div>
                    <button 
                      onClick={() => setActiveView('add_department')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
                    >
                      <Plus size={18} />
                      Novo Departamento
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept) => (
                      <motion.div
                        key={dept.id}
                        layout
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: dept.color + '20' }}
                          >
                            <Building2 size={24} style={{ color: dept.color }} />
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingDepartment(dept);
                                setNewDepartment(dept);
                                setActiveView('edit_department');
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            {!dept.isDefault && (
                              <button
                                onClick={() => {
                                  setConfirmState({
                                    title: 'Excluir Departamento',
                                    message: `Tem certeza que deseja excluir o departamento "${dept.name}" Esta ação não pode ser desfeita.`,
                                    type: 'danger',
                                    onConfirm: () => deleteDepartment(dept.id),
                                  });
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        <h4 className="font-semibold text-white mb-1">{dept.name}</h4>
                        <p className="text-sm text-slate-400 line-clamp-2">{dept.description}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span 
                            className="text-xs px-2 py-1 rounded-full font-medium"
                            style={{ backgroundColor: dept.color + '30', color: dept.color }}
                          >
                            {dept.color}
                          </span>
                          {dept.isDefault && (
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-600/30 text-slate-400">
                              Padrão
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Add/Edit Department Form */}
              {(activeTab === 'departments' && (activeView === 'add_department' || activeView === 'edit_department')) && (
                <motion.div 
                  key="department-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-lg"
                >
                  <button 
                    onClick={() => {
                      setActiveView('list');
                      setEditingDepartment(null);
                      setNewDepartment({ name: '', description: '', color: '#3b82f6', icon: 'building', isDefault: false });
                    }}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
                  >
                    <ArrowLeft size={18} />
                    Voltar para lista
                  </button>

                  <h3 className="text-2xl font-bold text-white mb-6">
                    {activeView === 'edit_department' ? 'Editar Departamento' : 'Novo Departamento'}
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Nome do Departamento</label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={newDepartment.name}
                        onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                        placeholder="Ex: Produção"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                      <textarea
                        value={newDepartment.description}
                        onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                        placeholder="Descreva as responsabilidades do departamento..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Cor de Identificação</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={newDepartment.color}
                          onChange={(e) => setNewDepartment({ ...newDepartment, color: e.target.value })}
                          className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          autoComplete="off"
                          value={newDepartment.color}
                          onChange={(e) => setNewDepartment({ ...newDepartment, color: e.target.value })}
                          placeholder="#3b82f6"
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-blue-500/50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={newDepartment.isDefault}
                        onChange={(e) => setNewDepartment({ ...newDepartment, isDefault: e.target.checked })}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isDefault" className="text-sm text-slate-300">
                        Departamento padrão do sistema
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setActiveView('list');
                          setEditingDepartment(null);
                          setNewDepartment({ name: '', description: '', color: '#3b82f6', icon: 'building', isDefault: false });
                        }}
                        className="flex-1 px-4 py-3 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          if (!newDepartment.name?.trim()) return;
                          
                          let result;
                          if (activeView === 'edit_department' && editingDepartment) {
                            result = await updateDepartment(editingDepartment.id, newDepartment);
                          } else {
                            result = await addDepartment({
                              name: newDepartment.name || '',
                              description: newDepartment.description || '',
                              color: newDepartment.color || '#3b82f6',
                              icon: newDepartment.icon || 'Building2',
                              isDefault: newDepartment.isDefault || false
                            });
                          }
                          
                          if (!result?.success) {
                            alert('Erro ao salvar departamento: ' + (result?.error || 'Erro desconhecido'));
                            return;
                          }
                          
                          setActiveView('list');
                          setEditingDepartment(null);
                          setNewDepartment({ name: '', description: '', color: '#3b82f6', icon: 'Building2', isDefault: false });
                        }}
                        disabled={!newDepartment.name?.trim()}
                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                      >
                        {activeView === 'edit_department' ? 'Salvar Alterações' : 'Criar Departamento'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>

    {confirmState && createPortal(
      <ConfirmModal
        isOpen={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={() => { confirmState.onConfirm(); setConfirmState(null); }}
        title={confirmState.title}
        message={confirmState.message}
        confirmText="Confirmar"
        cancelText="Cancelar"
        type={confirmState.type || 'danger'}
      />,
      document.body
    )}
    </>
  );
}
