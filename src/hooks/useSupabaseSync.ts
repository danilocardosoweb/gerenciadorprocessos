import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SyncItem {
  id: string;
  table: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: string;
  synced: boolean;
  error?: string;
}

interface SupabaseSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  queue: SyncItem[];
  error: string | null;
}

const QUEUE_KEY = 'tecno_mapper_supabase_queue';

export function useSupabaseSync() {
  const [state, setState] = useState<SupabaseSyncState>({
    isConnected: true,
    isSyncing: false,
    lastSync: null,
    queue: [],
    error: null,
  });

  // Load queue from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        const queue = JSON.parse(stored);
        setState(prev => ({ ...prev, queue }));
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }, []);

  // Save queue to localStorage
  const saveQueue = useCallback((queue: SyncItem[]) => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }, []);

  // Check Supabase connection
  const checkConnection = useCallback(async () => {
    try {
      const { error } = await supabase.from('process_items').select('count', { count: 'exact', head: true });
      const isConnected = !error;
      setState(prev => ({ ...prev, isConnected }));
      return isConnected;
    } catch {
      setState(prev => ({ ...prev, isConnected: false }));
      return false;
    }
  }, []);

  // Add item to sync queue
  const queueOperation = useCallback((
    table: string,
    operation: 'insert' | 'update' | 'delete',
    data: any
  ) => {
    const newItem: SyncItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      table,
      operation,
      data,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    setState(prev => {
      const newQueue = [...prev.queue, newItem];
      saveQueue(newQueue);
      return { ...prev, queue: newQueue };
    });
  }, [saveQueue]);

  // Execute sync operation
  const executeSync = useCallback(async (item: SyncItem): Promise<boolean> => {
    try {
      switch (item.operation) {
        case 'insert':
          const { error: insertError } = await supabase
            .from(item.table)
            .insert(item.data);
          if (insertError) throw insertError;
          break;

        case 'update':
          const { error: updateError } = await supabase
            .from(item.table)
            .update(item.data)
            .eq('id', item.data.id);
          if (updateError) throw updateError;
          break;

        case 'delete':
          const { error: deleteError } = await supabase
            .from(item.table)
            .delete()
            .eq('id', item.data.id);
          if (deleteError) throw deleteError;
          break;
      }
      return true;
    } catch (error: any) {
      console.error('Sync operation failed:', error);
      return false;
    }
  }, []);

  // Process all pending operations
  const syncAll = useCallback(async () => {
    const isConnected = await checkConnection();
    if (!isConnected) {
      setState(prev => ({ ...prev, error: 'Sem conexão com o servidor' }));
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true, error: null }));

    const pendingItems = state.queue.filter(item => !item.synced);
    const newQueue = [...state.queue];
    let successCount = 0;

    for (const item of pendingItems) {
      const success = await executeSync(item);
      const itemIndex = newQueue.findIndex(q => q.id === item.id);

      if (success && itemIndex !== -1) {
        newQueue[itemIndex].synced = true;
        successCount++;
      } else if (itemIndex !== -1) {
        newQueue[itemIndex].error = 'Falha na sincronização';
      }
    }

    // Remove synced items from queue
    const unsyncedItems = newQueue.filter(item => !item.synced);
    saveQueue(unsyncedItems);

    setState(prev => ({
      ...prev,
      isSyncing: false,
      lastSync: new Date(),
      queue: unsyncedItems,
      error: successCount === pendingItems.length ? null : 'Algumas operações falharam',
    }));
  }, [checkConnection, executeSync, saveQueue, state.queue]);

  // Clear queue
  const clearQueue = useCallback(() => {
    localStorage.removeItem(QUEUE_KEY);
    setState(prev => ({ ...prev, queue: [] }));
  }, []);

  // Remove specific item from queue
  const removeFromQueue = useCallback((itemId: string) => {
    setState(prev => {
      const newQueue = prev.queue.filter(q => q.id !== itemId);
      saveQueue(newQueue);
      return { ...prev, queue: newQueue };
    });
  }, [saveQueue]);

  // Auto-sync when coming online
  useEffect(() => {
    const handleOnline = () => {
      if (state.queue.length > 0 && !state.isSyncing) {
        syncAll();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncAll, state.queue.length, state.isSyncing]);

  return {
    isConnected: state.isConnected,
    isSyncing: state.isSyncing,
    lastSync: state.lastSync,
    queue: state.queue,
    pendingCount: state.queue.filter(q => !q.synced).length,
    error: state.error,
    queueOperation,
    syncAll,
    checkConnection,
    clearQueue,
    removeFromQueue,
  };
}
