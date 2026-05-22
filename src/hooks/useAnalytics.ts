import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface AnalyticsData {
  totalMaps: number;
  totalDocuments: number;
  activeUsers: number;
  avgProductionTime: number;
  approvalRate: number;
  mapsTrend: number;
  documentsTrend: number;
  topAccessedMaps: { name: string; views: number }[];
  dailyActivity: { day: string; actions: number }[];
  // Task breakdown
  tasksByStatus: {
    backlog: number;
    todo: number;
    in_progress: number;
    review: number;
    done: number;
    cancelled: number;
  };
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export function useAnalytics(auditLogs: { timestamp: string; action: string; details: string }[]) {
  const [data, setData] = useState<AnalyticsData>({
    totalMaps: 0,
    totalDocuments: 0,
    activeUsers: 0,
    avgProductionTime: 0,
    approvalRate: 0,
    mapsTrend: 0,
    documentsTrend: 0,
    topAccessedMaps: [],
    dailyActivity: [],
    tasksByStatus: { backlog: 0, todo: 0, in_progress: 0, review: 0, done: 0, cancelled: 0 },
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        { data: processItems },
        { data: documents },
        { data: tasks },
        { data: activeUsers },
      ] = await Promise.all([
        supabase.from('process_items').select('id, type, title, created_at'),
        supabase.from('documents').select('id, created_at'),
        supabase.from('tasks').select('id, status, due_date, completed_at, created_at'),
        supabase.from('tecno_users').select('id').eq('status', 'Ativo'),
      ]);

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // ── Process Items ──────────────────────────────────────────────────────
      const allMaps = (processItems || []).filter((i: any) => i.type === 'map');
      const mapsThisMonth = allMaps.filter((i: any) => new Date(i.created_at) >= thisMonthStart).length;
      const mapsLastMonth = allMaps.filter((i: any) => {
        const d = new Date(i.created_at);
        return d >= lastMonthStart && d <= lastMonthEnd;
      }).length;
      const mapsTrend = mapsLastMonth > 0
        ? Math.round(((mapsThisMonth - mapsLastMonth) / mapsLastMonth) * 100)
        : mapsThisMonth > 0 ? 100 : 0;

      // ── Documents ─────────────────────────────────────────────────────────
      const allDocs = documents || [];
      const docsThisMonth = allDocs.filter((d: any) => new Date(d.created_at) >= thisMonthStart).length;
      const docsLastMonth = allDocs.filter((d: any) => {
        const dt = new Date(d.created_at);
        return dt >= lastMonthStart && dt <= lastMonthEnd;
      }).length;
      const documentsTrend = docsLastMonth > 0
        ? Math.round(((docsThisMonth - docsLastMonth) / docsLastMonth) * 100)
        : docsThisMonth > 0 ? 100 : 0;

      // ── Tasks ─────────────────────────────────────────────────────────────
      const allTasks = tasks || [];
      const tasksByStatus = {
        backlog:     allTasks.filter((t: any) => t.status === 'backlog').length,
        todo:        allTasks.filter((t: any) => t.status === 'todo').length,
        in_progress: allTasks.filter((t: any) => t.status === 'in_progress').length,
        review:      allTasks.filter((t: any) => t.status === 'review').length,
        done:        allTasks.filter((t: any) => t.status === 'done').length,
        cancelled:   allTasks.filter((t: any) => t.status === 'cancelled').length,
      };

      const activeTasks = allTasks.filter((t: any) => t.status !== 'cancelled');
      const completedTasks = tasksByStatus.done;
      const totalActive = activeTasks.length;

      // Approval rate = done / (all non-cancelled) * 100
      const approvalRate = totalActive > 0
        ? Math.round((completedTasks / totalActive) * 100)
        : 0;

      // Avg production time = average days from created_at to completed_at for done tasks
      const doneTasks = allTasks.filter((t: any) => t.status === 'done' && t.completed_at && t.created_at);
      const avgMs = doneTasks.length > 0
        ? doneTasks.reduce((sum: number, t: any) => {
            return sum + (new Date(t.completed_at).getTime() - new Date(t.created_at).getTime());
          }, 0) / doneTasks.length
        : 0;
      const avgProductionTime = Math.round(avgMs / (1000 * 60 * 60 * 24)); // days

      // Overdue = tasks not done/cancelled with due_date < now
      const overdueTasks = allTasks.filter((t: any) => {
        if (!t.due_date) return false;
        if (t.status === 'done' || t.status === 'cancelled') return false;
        return new Date(t.due_date) < now;
      }).length;

      // ── Daily Activity (last 7 days from audit logs) ─────────────────────
      const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dailyActivity = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayEnd = new Date(dayStart.getTime() + 86400000);
        const actions = auditLogs.filter(l => {
          const t = new Date(l.timestamp);
          return t >= dayStart && t < dayEnd;
        }).length;
        return { day: dayLabels[d.getDay()], actions };
      });

      // ── Top accessed maps (from audit logs "Abrir Mapa") ──────────────────
      const mapAccessCounts: Record<string, number> = {};
      auditLogs.forEach(l => {
        if (l.action === 'Abrir Mapa') {
          const name = l.details.replace('Mapa aberto: ', '').trim();
          mapAccessCounts[name] = (mapAccessCounts[name] || 0) + 1;
        }
      });
      const topAccessedMaps = Object.entries(mapAccessCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, views]) => ({ name, views }));

      // Fallback: if no log data, use process items sorted by title
      const topMaps = topAccessedMaps.length > 0
        ? topAccessedMaps
        : allMaps.slice(0, 5).map((m: any) => ({ name: m.title, views: 0 }));

      setData({
        totalMaps: allMaps.length,
        totalDocuments: allDocs.length,
        activeUsers: (activeUsers || []).length,
        avgProductionTime,
        approvalRate,
        mapsTrend,
        documentsTrend,
        topAccessedMaps: topMaps,
        dailyActivity,
        tasksByStatus,
        totalTasks: allTasks.length,
        completedTasks,
        overdueTasks,
      });
    } catch (err) {
      console.error('❌ useAnalytics error:', err);
    } finally {
      setLoading(false);
    }
  }, [auditLogs]);

  useEffect(() => {
    refresh();
  }, []);

  return { data, loading, refresh };
}
