import { useState, useEffect, useCallback } from 'react';

export interface AuditEntry {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  details: string;
  category: 'auth' | 'config' | 'data' | 'security' | 'system';
}

const STORAGE_KEY = 'tecno_mapper_audit_log';
const MAX_ENTRIES = 1000; // Limit to prevent storage overflow

export function useAuditLog(enabled: boolean) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load logs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setLogs(parsed.slice(-MAX_ENTRIES)); // Keep only last 1000 entries
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever logs change
  useEffect(() => {
    if (isLoaded && logs.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(-MAX_ENTRIES)));
      } catch (error) {
        console.error('Error saving audit logs:', error);
      }
    }
  }, [logs, isLoaded]);

  const addLog = useCallback((entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    if (!enabled) return;

    const newEntry: AuditEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    setLogs(prev => [...prev.slice(-MAX_ENTRIES + 1), newEntry]);

    // Also log to console for immediate visibility
    console.log(`[AUDIT] ${newEntry.timestamp} | ${newEntry.userName} | ${newEntry.action} | ${newEntry.details}`);
  }, [enabled]);

  const clearLogs = useCallback(() => {
    if (confirm('Tem certeza que deseja apagar todo o histórico de auditoria? Esta ação não pode ser desfeita.')) {
      setLogs([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const exportAsTxt = useCallback(() => {
    const header = `================================================================================
RELATÓRIO DE AUDITORIA - TECNO MAPPER
Gerado em: ${new Date().toLocaleString('pt-BR')}
Total de registros: ${logs.length}
================================================================================

`;

    const entries = logs.map((log, index) => {
      const date = new Date(log.timestamp).toLocaleString('pt-BR');
      return `[${(index + 1).toString().padStart(4, '0')}] ${date}
        Usuário: ${log.userName} (${log.userEmail}) [${log.userRole}]
        Ação: ${log.action}
        Categoria: ${log.category.toUpperCase()}
        Detalhes: ${log.details}
        ${'─'.repeat(70)}
`;
    }).join('\n');

    const footer = `
================================================================================
FIM DO RELATÓRIO
================================================================================`;

    return header + entries + footer;
  }, [logs]);

  const downloadTxt = useCallback(() => {
    const content = exportAsTxt();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auditoria-tecno-mapper-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportAsTxt]);

  const exportAsJson = useCallback(() => {
    return JSON.stringify(logs, null, 2);
  }, [logs]);

  const downloadJson = useCallback(() => {
    const content = exportAsJson();
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auditoria-tecno-mapper-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportAsJson]);

  const filterLogs = useCallback((
    category?: AuditEntry['category'],
    startDate?: Date,
    endDate?: Date,
    userName?: string
  ) => {
    return logs.filter(log => {
      if (category && log.category !== category) return false;
      if (startDate && new Date(log.timestamp) < startDate) return false;
      if (endDate && new Date(log.timestamp) > endDate) return false;
      if (userName && !log.userName.toLowerCase().includes(userName.toLowerCase())) return false;
      return true;
    });
  }, [logs]);

  return {
    logs,
    addLog,
    clearLogs,
    exportAsTxt,
    downloadTxt,
    exportAsJson,
    downloadJson,
    filterLogs,
    totalCount: logs.length,
    isLoaded,
  };
}
