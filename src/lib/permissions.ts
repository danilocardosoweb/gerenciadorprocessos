/**
 * SISTEMA DE CONTROLE DE ACESSO (RBAC)
 * Role-Based Access Control — Tecno Mapper
 *
 * Níveis hierárquicos (do maior para o menor):
 *   1. Administrador  — Acesso total, irrestrito
 *   2. Gerente        — Gerencia equipe e aprova tarefas, sem config do sistema
 *   3. Editor         — Cria e edita conteúdo próprio
 *   4. Visualizador   — Somente leitura, sem edição
 */

export type UserRole = 'Administrador' | 'Gerente' | 'Editor' | 'Visualizador';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
}

// ─── Hierarquia numérica ────────────────────────────────────────────────────
const ROLE_LEVEL: Record<string, number> = {
  Administrador: 4,
  Gerente:       3,
  Editor:        2,
  Visualizador:  1,
};

export function getRoleLevel(role: string): number {
  return ROLE_LEVEL[role] ?? 0;
}

export function hasMinRole(user: AppUser | null, minRole: UserRole): boolean {
  if (!user) return false;
  return getRoleLevel(user.role) >= getRoleLevel(minRole);
}

// ─── Permissões por módulo ──────────────────────────────────────────────────

/** Mapa Mental / Processos */
export const can = {

  // ── Mapa Mental ──────────────────────────────────────────────────────────
  viewMindMap:        (u: AppUser | null) => hasMinRole(u, 'Visualizador'),
  createNode:         (u: AppUser | null) => hasMinRole(u, 'Editor'),
  editNode:           (u: AppUser | null) => hasMinRole(u, 'Editor'),
  deleteNode:         (u: AppUser | null) => hasMinRole(u, 'Administrador'),
  importWithAI:       (u: AppUser | null) => hasMinRole(u, 'Editor'),
  exportMap:          (u: AppUser | null) => hasMinRole(u, 'Visualizador'),
  manageWorkflow:     (u: AppUser | null) => hasMinRole(u, 'Gerente'),

  // ── Tarefas ───────────────────────────────────────────────────────────────
  viewTasks:          (u: AppUser | null) => hasMinRole(u, 'Visualizador'),
  createTask:         (u: AppUser | null) => hasMinRole(u, 'Editor'),
  editTask:           (u: AppUser | null) => hasMinRole(u, 'Editor'),
  editAnyTask:        (u: AppUser | null) => hasMinRole(u, 'Gerente'),
  deleteTask:         (u: AppUser | null) => hasMinRole(u, 'Gerente'),
  deleteAnyTask:      (u: AppUser | null) => hasMinRole(u, 'Administrador'),
  approveTask:        (u: AppUser | null) => hasMinRole(u, 'Gerente'),
  moveTask:           (u: AppUser | null) => hasMinRole(u, 'Editor'),
  assignTask:         (u: AppUser | null) => hasMinRole(u, 'Gerente'),
  sendTaskAlert:      (u: AppUser | null) => hasMinRole(u, 'Editor'),
  commentTask:        (u: AppUser | null) => hasMinRole(u, 'Editor'),
  viewPrivateTasks:   (u: AppUser | null) => hasMinRole(u, 'Gerente'),
  generateMinutes:    (u: AppUser | null) => hasMinRole(u, 'Gerente'),

  // ── Usuários & Configurações ─────────────────────────────────────────────
  viewSettings:       (u: AppUser | null) => hasMinRole(u, 'Gerente'),
  manageUsers:        (u: AppUser | null) => hasMinRole(u, 'Administrador'),
  createUser:         (u: AppUser | null) => hasMinRole(u, 'Administrador'),
  editUser:           (u: AppUser | null) => hasMinRole(u, 'Administrador'),
  deleteUser:         (u: AppUser | null) => hasMinRole(u, 'Administrador'),
  changeUserRole:     (u: AppUser | null) => hasMinRole(u, 'Administrador'),
  manageDepartments:  (u: AppUser | null) => hasMinRole(u, 'Administrador'),
  manageRoles:        (u: AppUser | null) => hasMinRole(u, 'Administrador'),

  // ── Auditoria & Logs ─────────────────────────────────────────────────────
  viewAuditLog:       (u: AppUser | null) => hasMinRole(u, 'Administrador'),
  exportAuditLog:     (u: AppUser | null) => hasMinRole(u, 'Administrador'),
  clearAuditLog:      (u: AppUser | null) => u?.role === 'Administrador',

  // ── Analytics ────────────────────────────────────────────────────────────
  viewAnalytics:      (u: AppUser | null) => hasMinRole(u, 'Gerente'),
  viewFullAnalytics:  (u: AppUser | null) => hasMinRole(u, 'Administrador'),

  // ── Documentos ───────────────────────────────────────────────────────────
  viewDocuments:      (u: AppUser | null) => hasMinRole(u, 'Visualizador'),
  uploadDocument:     (u: AppUser | null) => hasMinRole(u, 'Editor'),
  deleteDocument:     (u: AppUser | null) => hasMinRole(u, 'Gerente'),

  // ── Modo Operador ─────────────────────────────────────────────────────────
  viewOperatorMode:   (u: AppUser | null) => hasMinRole(u, 'Visualizador'),
};

// ─── Descrição dos níveis para UI ─────────────────────────────────────────
export const ROLE_DEFINITIONS: Record<UserRole, { label: string; description: string; color: string; badge: string; permissions: string[] }> = {
  Administrador: {
    label: 'Administrador',
    description: 'Acesso irrestrito a todos os módulos, configurações, logs e usuários.',
    color: 'text-red-400',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    permissions: [
      'Tudo que Gerente pode fazer',
      'Gerenciar usuários e níveis de acesso',
      'Excluir qualquer tarefa ou nó',
      'Ver e exportar logs de auditoria',
      'Configurações avançadas do sistema',
      'Excluir departamentos',
      'Visualizar analytics completo',
    ],
  },
  Gerente: {
    label: 'Gerente',
    description: 'Gerencia equipes, aprova tarefas e visualiza relatórios. Sem acesso a configurações do sistema.',
    color: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    permissions: [
      'Tudo que Editor pode fazer',
      'Aprovar e mover tarefas de qualquer membro',
      'Atribuir tarefas a usuários',
      'Excluir tarefas (do departamento)',
      'Gerar atas de reunião',
      'Ver analytics e relatórios',
      'Gerenciar documentos',
    ],
  },
  Editor: {
    label: 'Editor',
    description: 'Cria e edita tarefas e conteúdo próprio. Não pode excluir nem aprovar.',
    color: 'text-blue-400',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    permissions: [
      'Criar e editar tarefas próprias',
      'Criar e editar nós no mapa mental',
      'Comentar e enviar alertas em tarefas',
      'Mover tarefas de status',
      'Fazer upload de documentos',
      'Importar com IA',
      'Exportar mapas',
    ],
  },
  Visualizador: {
    label: 'Visualizador',
    description: 'Apenas leitura. Não pode criar, editar ou excluir nenhum conteúdo.',
    color: 'text-slate-400',
    badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    permissions: [
      'Visualizar mapas mentais e processos',
      'Visualizar tarefas públicas',
      'Exportar mapas (somente leitura)',
      'Modo operador (apresentação)',
      'Visualizar documentos',
    ],
  },
};

// ─── Hook helper ────────────────────────────────────────────────────────────
export function usePermissions(currentUser: AppUser | null) {
  return {
    can: Object.fromEntries(
      Object.entries(can).map(([key, fn]) => [key, fn(currentUser)])
    ) as Record<keyof typeof can, boolean>,
    role: currentUser?.role as UserRole | undefined,
    isAdmin: currentUser?.role === 'Administrador',
    isGerente: hasMinRole(currentUser, 'Gerente'),
    isEditor: hasMinRole(currentUser, 'Editor'),
    isVisualizador: hasMinRole(currentUser, 'Visualizador'),
    roleLevel: getRoleLevel(currentUser?.role ?? ''),
  };
}
