import React from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  FileText,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle,
  ListTodo,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AnalyticsData {
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

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  data: AnalyticsData;
}

export function AnalyticsDashboard({ isOpen, onClose, data }: AnalyticsDashboardProps) {
  if (!isOpen) return null;

  const StatCard = ({
    title,
    value,
    trend,
    trendUp,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string | number;
    trend?: number;
    trendUp?: boolean;
    icon: LucideIcon;
    color: string;
  }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3">
          {trendUp ? (
            <ArrowUpRight size={16} className="text-emerald-400" />
          ) : (
            <ArrowDownRight size={16} className="text-red-400" />
          )}
          <span className={`text-sm ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend}%
          </span>
          <span className="text-slate-500 text-sm">vs mês anterior</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <BarChart3 size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Dashboard Analytics</h2>
              <p className="text-sm text-slate-400">Métricas e indicadores do sistema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total de Mapas"
              value={data.totalMaps}
              trend={data.mapsTrend}
              trendUp={data.mapsTrend > 0}
              icon={FileText}
              color="bg-blue-500"
            />
            <StatCard
              title="Documentos"
              value={data.totalDocuments}
              trend={data.documentsTrend}
              trendUp={data.documentsTrend > 0}
              icon={TrendingUp}
              color="bg-emerald-500"
            />
            <StatCard
              title="Usuários Ativos"
              value={data.activeUsers}
              icon={Users}
              color="bg-purple-500"
            />
            <StatCard
              title="Taxa de Aprovação"
              value={`${data.approvalRate}%`}
              icon={CheckCircle2}
              color="bg-amber-500"
            />
          </div>

          {/* Task Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              title="Total de Tarefas"
              value={data.totalTasks}
              icon={ListTodo}
              color="bg-slate-500"
            />
            <StatCard
              title="Concluídas"
              value={data.completedTasks}
              icon={CheckCircle}
              color="bg-emerald-500"
            />
            <StatCard
              title="Atrasadas"
              value={data.overdueTasks}
              icon={AlertTriangle}
              color="bg-red-500"
            />
          </div>

          {/* Task Status Breakdown */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-8">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <ListTodo size={18} className="text-blue-400" />
              Tarefas por Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatusBadge label="Backlog" count={data.tasksByStatus.backlog} color="bg-slate-500" />
              <StatusBadge label="A Fazer" count={data.tasksByStatus.todo} color="bg-blue-500" />
              <StatusBadge label="Em Andamento" count={data.tasksByStatus.in_progress} color="bg-yellow-500" />
              <StatusBadge label="Em Reviso" count={data.tasksByStatus.review} color="bg-purple-500" />
              <StatusBadge label="Concluído" count={data.tasksByStatus.done} color="bg-emerald-500" />
              <StatusBadge label="Cancelado" count={data.tasksByStatus.cancelled} color="bg-red-500" />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Accessed Maps */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-400" />
                Mapas Mais Acessados
              </h3>
              <div className="space-y-3">
                {data.topAccessedMaps.map((map, index) => (
                  <div key={map.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-400">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-white">{map.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${(map.views / data.topAccessedMaps[0].views) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-10 text-right">{map.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Activity */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={18} className="text-emerald-400" />
                Atividade dos Últimos 7 Dias
              </h3>
              <div className="h-40 flex items-end gap-2">
                {data.dailyActivity.map((day) => {
                  const maxActions = Math.max(...data.dailyActivity.map((d) => d.actions));
                  const height = maxActions > 0 ? (day.actions / maxActions) * 100 : 0;
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-emerald-500/30 rounded-t-sm hover:bg-emerald-500/50 transition-colors relative group"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {day.actions} ações
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const StatusBadge = ({ label, count, color }: { label: string; count: number; color: string }) => (
  <div className={`p-3 rounded-lg ${color}/20 border border-${color.replace('bg-', '')}/30`}>
    <p className="text-xs text-slate-400 mb-1">{label}</p>
    <p className="text-xl font-bold text-white">{count}</p>
  </div>
);
