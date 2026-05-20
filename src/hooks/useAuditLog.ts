import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

const MAX_ENTRIES = 1000;

export function useAuditLog(enabled: boolean) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(MAX_ENTRIES)
      .then(({ data, error }) => {
        if (error) console.error('❌ Error fetching audit logs:', error);
        if (data) {
          setLogs(data.map(r => ({
            id: r.id,
            timestamp: r.timestamp,
            userName: r.user_name,
            userEmail: r.user_email || '',
            userRole: r.user_role || '',
            action: r.action,
            details: r.details || '',
            category: r.category as AuditEntry['category'],
          })));
        }
        setIsLoaded(true);
      });
  }, []);

  const addLog = useCallback((entry: Omit<AuditEntry, 'id' | 'timestamp'>) => {
    if (!enabled) return;
    const timestamp = new Date().toISOString();
    console.log(`[AUDIT] ${timestamp} | ${entry.userName} | ${entry.action} | ${entry.details}`);

    const newEntry: AuditEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp,
    };
    setLogs(prev => [newEntry, ...prev.slice(0, MAX_ENTRIES - 1)]);

    supabase.from('audit_logs').insert({
      user_name: entry.userName,
      user_email: entry.userEmail,
      user_role: entry.userRole,
      action: entry.action,
      details: entry.details,
      category: entry.category,
      timestamp,
    }).then(({ error }) => { if (error) console.error('Audit log error:', error); });
  }, [enabled]);

  const clearLogs = useCallback(async () => {
    setLogs([]);
    await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
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
