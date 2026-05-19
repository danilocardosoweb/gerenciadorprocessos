import { useState, useEffect, useCallback } from 'react';

interface PendingChange {
  id: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
}

interface SyncState {
  isOnline: boolean;
  pendingChanges: PendingChange[];
  lastSync: string | null;
  isSyncing: boolean;
}

const STORAGE_KEY = 'tecno_mapper_offline_queue';
const LAST_SYNC_KEY = 'tecno_mapper_last_sync';

export function useOfflineSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isOnline: navigator.onLine,
    pendingChanges: [],
    lastSync: null,
    isSyncing: false,
  });

  // Load pending changes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const lastSync = localStorage.getItem(LAST_SYNC_KEY);
      if (stored) {
        setSyncState(prev => ({
          ...prev,
          pendingChanges: JSON.parse(stored),
          lastSync: lastSync || null,
        }));
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setSyncState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setSyncState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save pending changes to localStorage
  const savePendingChanges = useCallback((changes: PendingChange[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }, []);

  const queueChange = useCallback((
    type: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ) => {
    const newChange: PendingChange = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      table,
      data,
    };

    setSyncState(prev => {
      const newChanges = [...prev.pendingChanges, newChange];
      savePendingChanges(newChanges);
      return { ...prev, pendingChanges: newChanges };
    });
  }, [savePendingChanges]);

  const removePendingChange = useCallback((changeId: string) => {
    setSyncState(prev => {
      const newChanges = prev.pendingChanges.filter(c => c.id !== changeId);
      savePendingChanges(newChanges);
      return { ...prev, pendingChanges: newChanges };
    });
  }, [savePendingChanges]);

  const clearPendingChanges = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSyncState(prev => ({ ...prev, pendingChanges: [] }));
  }, []);

  const syncNow = useCallback(async (syncFn?: () => Promise<void>) => {
    if (!syncFn || syncState.pendingChanges.length === 0) return;

    setSyncState(prev => ({ ...prev, isSyncing: true }));

    try {
      await syncFn();
      clearPendingChanges();
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [syncState.pendingChanges, clearPendingChanges]);

  return {
    isOnline: syncState.isOnline,
    pendingChanges: syncState.pendingChanges,
    pendingCount: syncState.pendingChanges.length,
    lastSync: syncState.lastSync,
    isSyncing: syncState.isSyncing,
    queueChange,
    removePendingChange,
    clearPendingChanges,
    syncNow,
  };
}
