import { useState, useEffect, useCallback } from 'react';

export type WorkflowStatus = 'draft' | 'review' | 'needs_revision' | 'approved' | 'published' | 'archived';

export interface WorkflowState {
  status: WorkflowStatus;
  approver?: string;
  approvedAt?: string;
  comments: string[];
  history: WorkflowHistoryEntry[];
}

export interface WorkflowHistoryEntry {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  action: 'create' | 'submit' | 'approve' | 'reject' | 'publish' | 'archive';
  fromStatus?: WorkflowStatus;
  toStatus: WorkflowStatus;
  comment?: string;
}

const STORAGE_KEY_PREFIX = 'tecno_mapper_workflow_';

export function useWorkflow(mapId: string, currentUser?: { name: string; email: string } | null) {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    status: 'draft',
    comments: [],
    history: [],
  });

  const storageKey = `${STORAGE_KEY_PREFIX}${mapId}`;

  // Load workflow from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setWorkflow(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
    }
  }, [storageKey]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(workflow));
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  }, [workflow, storageKey]);

  const transition = useCallback((
    newStatus: WorkflowStatus,
    comment?: string
  ) => {
    if (!currentUser) return;

    const newEntry: WorkflowHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userEmail: currentUser.email,
      action: getActionType(workflow.status, newStatus),
      fromStatus: workflow.status,
      toStatus: newStatus,
      comment,
    };

    setWorkflow(prev => ({
      status: newStatus,
      approver: newStatus === 'approved' ? currentUser.name : prev.approver,
      approvedAt: newStatus === 'approved' ? new Date().toISOString() : prev.approvedAt,
      comments: comment ? [...prev.comments, comment] : prev.comments,
      history: [...prev.history, newEntry],
    }));
  }, [workflow.status, currentUser]);

  const canTransition = useCallback((from: WorkflowStatus, to: WorkflowStatus, userRole?: string) => {
    const transitions: Record<WorkflowStatus, WorkflowStatus[]> = {
      draft: ['review'],
      review: ['needs_revision', 'approved'],
      needs_revision: ['review'],
      approved: ['published', 'draft'],
      published: ['archived', 'draft'],
      archived: ['draft'],
    };

    const allowed = transitions[from] || [];
    
    // Only admin can approve/publish
    if ((to === 'approved' || to === 'published') && userRole !== 'Administrador') {
      return false;
    }

    return allowed.includes(to);
  }, []);

  const getStatusLabel = (status: WorkflowStatus): string => {
    const labels: Record<WorkflowStatus, string> = {
      draft: 'Rascunho',
      review: 'Em Revisão',
      needs_revision: 'Precisa de Revisão',
      approved: 'Aprovado',
      published: 'Publicado',
      archived: 'Arquivado',
    };
    return labels[status];
  };

  const getStatusColor = (status: WorkflowStatus): string => {
    const colors: Record<WorkflowStatus, string> = {
      draft: 'bg-slate-500',
      review: 'bg-amber-500',
      needs_revision: 'bg-orange-500',
      approved: 'bg-emerald-500',
      published: 'bg-blue-500',
      archived: 'bg-slate-600',
    };
    return colors[status];
  };

  return {
    workflow,
    transition,
    canTransition: (to: WorkflowStatus, userRole?: string) => canTransition(workflow.status, to, userRole),
    getStatusLabel,
    getStatusColor,
  };
}

function getActionType(from: WorkflowStatus, to: WorkflowStatus): WorkflowHistoryEntry['action'] {
  if (to === 'review') return 'submit';
  if (to === 'approved') return 'approve';
  if (to === 'published') return 'publish';
  if (to === 'archived') return 'archive';
  if (to === 'draft' && from === 'review') return 'reject';
  return 'create';
}
