import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, FileText, Mail, Download, Copy, Check, ChevronDown,
  Calendar, Clock, Users, AlertCircle, CheckCircle2, Circle,
  ArrowRight, Building2, Sparkles, Printer, Eye, Edit3,
  Flag, Zap, Target, TrendingUp, Send, Plus, CalendarPlus, Trash2, AtSign
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: string;
  due_date?: string;
  assigned_user?: { name: string; email: string } | null;
  department_data?: { name: string; color: string } | null;
}

interface MeetingMinutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  currentUser: { name: string; email: string; role: string } | null;
}

const statusLabel: Record<string, string> = {
  backlog: 'Backlog', todo: 'A Fazer', in_progress: 'Em Progresso',
  review: 'Em Revisão', done: 'Concluído',
};
const priorityLabel: Record<string, string> = {
  low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente',
};
const priorityColor: Record<string, string> = {
  low: '#64748b', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444',
};
const statusIcon: Record<string, string> = {
  backlog: '○', todo: '◎', in_progress: '◑', review: '◕', done: '●',
};

export function MeetingMinutesModal({ isOpen, onClose, tasks, currentUser }: MeetingMinutesModalProps) {
  const [step, setStep] = useState<'config' | 'preview' | 'send'>('config');
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [toList, setToList] = useState<string[]>([]);
  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');

  // Config state
  const [meetingTitle, setMeetingTitle] = useState('Ata de Reunião – Status das Tarefas');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingTime, setMeetingTime] = useState(new Date().toTimeString().slice(0, 5));
  const [meetingLocation, setMeetingLocation] = useState('');
  const [attendees, setAttendees] = useState('');
  const [observations, setObservations] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['todo', 'in_progress', 'review', 'done']);
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'department'>('status');
  const [includeDescription, setIncludeDescription] = useState(true);
  const [includeMetrics, setIncludeMetrics] = useState(true);

  const previewRef = useRef<HTMLDivElement>(null);

  const filteredTasks = tasks.filter(t => selectedStatuses.includes(t.status));

  const toggleStatus = (s: string) => {
    setSelectedStatuses(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const metrics = {
    total: filteredTasks.length,
    done: filteredTasks.filter(t => t.status === 'done').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    urgent: filteredTasks.filter(t => t.priority === 'urgent').length,
    completion: filteredTasks.length > 0
      ? Math.round((filteredTasks.filter(t => t.status === 'done').length / filteredTasks.length) * 100)
      : 0,
  };

  const groupedTasks = useCallback((): Record<string, Task[]> => {
    if (groupBy === 'status') {
      const order = ['in_progress', 'review', 'todo', 'backlog', 'done'];
      const result: Record<string, Task[]> = {};
      order.forEach(s => {
        const t = filteredTasks.filter(x => x.status === s);
        if (t.length > 0) result[statusLabel[s]] = t;
      });
      return result;
    }
    if (groupBy === 'priority') {
      const order = ['urgent', 'high', 'medium', 'low'];
      const result: Record<string, Task[]> = {};
      order.forEach(p => {
        const t = filteredTasks.filter(x => x.priority === p);
        if (t.length > 0) result[priorityLabel[p]] = t;
      });
      return result;
    }
    if (groupBy === 'department') {
      const result: Record<string, Task[]> = {};
      filteredTasks.forEach(t => {
        const key = t.department_data?.name || 'Sem Departamento';
        if (!result[key]) result[key] = [];
        result[key].push(t);
      });
      return result;
    }
    return {};
  }, [filteredTasks, groupBy]);

  const getEmailHTML = () => {
    const dateStr = new Date(meetingDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const groups = groupedTasks();

    const taskRows = Object.entries(groups).map(([group, groupTasks]) => `
      <tr><td colspan="5" style="padding:12px 16px 4px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#94a3b8; border-top:1px solid #e2e8f0;">${group}</td></tr>
      ${groupTasks.map(t => `
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:10px 16px; font-size:13px; color:#1e293b; font-weight:500;">${statusIcon[t.status]} ${t.title}${includeDescription && t.description ? `<br/><span style="font-size:11px;color:#64748b;">${t.description}</span>` : ''}</td>
          <td style="padding:10px 8px; font-size:11px; text-align:center;"><span style="background:${priorityColor[t.priority]}22; color:${priorityColor[t.priority]}; padding:2px 8px; border-radius:20px; font-weight:600;">${priorityLabel[t.priority]}</span></td>
          <td style="padding:10px 8px; font-size:12px; color:#475569; text-align:center;">${t.assigned_user?.name || '—'}</td>
          <td style="padding:10px 8px; font-size:12px; color:#475569; text-align:center;">${t.department_data?.name || '—'}</td>
          <td style="padding:10px 8px; font-size:12px; color:#475569; text-align:center;">${t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : '—'}</td>
        </tr>
      `).join('')}
    `).join('');

    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;">
<div style="max-width:760px;margin:32px auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.12);">
  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e293b 0%,#0f172a 100%);padding:40px 48px 32px;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
      <div style="width:40px;height:40px;background:linear-gradient(135deg,#3b82f6,#6366f1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">📋</div>
      <div>
        <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:#64748b;text-transform:uppercase;">Tecno Mapper</div>
        <div style="font-size:11px;color:#475569;">Gerenciamento de Processos</div>
      </div>
    </div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">${meetingTitle}</h1>
    <div style="display:flex;flex-wrap:wrap;gap:16px;margin-top:16px;">
      <div style="display:flex;align-items:center;gap:6px;color:#94a3b8;font-size:13px;">📅 ${dateStr}</div>
      ${meetingTime ? `<div style="display:flex;align-items:center;gap:6px;color:#94a3b8;font-size:13px;">🕐 ${meetingTime}</div>` : ''}
      ${meetingLocation ? `<div style="display:flex;align-items:center;gap:6px;color:#94a3b8;font-size:13px;">📍 ${meetingLocation}</div>` : ''}
      <div style="display:flex;align-items:center;gap:6px;color:#94a3b8;font-size:13px;">👤 ${currentUser?.name || 'Sistema'}</div>
    </div>
  </div>

  ${includeMetrics ? `
  <!-- Metrics -->
  <div style="background:#f1f5f9;padding:24px 48px;display:flex;gap:16px;flex-wrap:wrap;">
    <div style="flex:1;min-width:120px;background:white;border-radius:12px;padding:16px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <div style="font-size:28px;font-weight:800;color:#1e293b;">${metrics.total}</div>
      <div style="font-size:11px;color:#64748b;font-weight:600;margin-top:2px;">TOTAL</div>
    </div>
    <div style="flex:1;min-width:120px;background:white;border-radius:12px;padding:16px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <div style="font-size:28px;font-weight:800;color:#10b981;">${metrics.completion}%</div>
      <div style="font-size:11px;color:#64748b;font-weight:600;margin-top:2px;">CONCLUÍDO</div>
    </div>
    <div style="flex:1;min-width:120px;background:white;border-radius:12px;padding:16px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <div style="font-size:28px;font-weight:800;color:#f59e0b;">${metrics.inProgress}</div>
      <div style="font-size:11px;color:#64748b;font-weight:600;margin-top:2px;">EM PROGRESSO</div>
    </div>
    <div style="flex:1;min-width:120px;background:white;border-radius:12px;padding:16px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <div style="font-size:28px;font-weight:800;color:#ef4444;">${metrics.urgent}</div>
      <div style="font-size:11px;color:#64748b;font-weight:600;margin-top:2px;">URGENTES</div>
    </div>
  </div>` : ''}

  <!-- Tasks Table -->
  <div style="background:white;padding:0;">
    ${attendees ? `<div style="padding:20px 48px 0;"><strong style="font-size:12px;color:#475569;text-transform:uppercase;letter-spacing:1px;">Participantes:</strong><p style="margin:4px 0 0;color:#1e293b;font-size:14px;">${attendees}</p></div>` : ''}
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:left;">Tarefa</th>
          <th style="padding:10px 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:center;width:80px;">Prior.</th>
          <th style="padding:10px 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:center;width:120px;">Responsável</th>
          <th style="padding:10px 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:center;width:110px;">Depto</th>
          <th style="padding:10px 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:center;width:90px;">Prazo</th>
        </tr>
      </thead>
      <tbody>${taskRows}</tbody>
    </table>
  </div>

  ${observations ? `
  <!-- Observations -->
  <div style="background:#fffbeb;border-top:3px solid #f59e0b;padding:24px 48px;">
    <strong style="font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:1px;">📝 Observações & Próximos Passos</strong>
    <p style="margin:8px 0 0;color:#78350f;font-size:14px;white-space:pre-wrap;">${observations}</p>
  </div>` : ''}

  <!-- Footer -->
  <div style="background:#f8fafc;padding:24px 48px;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
      Documento gerado por <strong>Tecno Mapper</strong> em ${new Date().toLocaleString('pt-BR')} por ${currentUser?.name || 'Sistema'}
    </p>
  </div>
</div>
</body></html>`;
  };

  const handleCopyHTML = async () => {
    await navigator.clipboard.writeText(getEmailHTML());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([getEmailHTML()], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ata-reuniao-${meetingDate}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(getEmailHTML());
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  };

  // ── Calendar invite (.ics) ─────────────────────────────────────────────
  const handleDownloadICS = () => {
    const dtStart = new Date(`${meetingDate}T${meetingTime || '09:00'}:00`);
    const dtEnd   = new Date(dtStart.getTime() + 60 * 60 * 1000); // +1h
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace('.000', '');
    const attendeeLines = toList
      .map(e => `ATTENDEE;RSVP=TRUE;ROLE=REQ-PARTICIPANT:mailto:${e}`)
      .join('\n');
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TecnoMapper//Meeting//PT',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:tecno-mapper-${Date.now()}@tecnoperfilalumino.com.br`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(dtStart)}`,
      `DTEND:${fmt(dtEnd)}`,
      `SUMMARY:${meetingTitle}`,
      meetingLocation ? `LOCATION:${meetingLocation}` : '',
      `DESCRIPTION:Ata de Reunião gerada pelo Tecno Mapper.\nParticipantes: ${attendees || 'N/A'}\nResponsável: ${currentUser?.name || 'Sistema'}`,
      `ORGANIZER;CN=${currentUser?.name || 'Sistema'}:mailto:${currentUser?.email || 'sistema@tecnomapper.com'}`,
      attendeeLines,
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `convite-reuniao-${meetingDate}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Build plain-text email body (same style as reference app) ────────────
  const getPlainTextBody = (): string => {
    const dateStr = new Date(meetingDate + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const sep  = '='.repeat(52);
    const sep2 = '-'.repeat(52);
    const groups = groupedTasks();
    const name  = currentUser?.name || 'Sistema';

    const lines: string[] = [];

    lines.push(sep);
    lines.push(meetingTitle.toUpperCase());
    lines.push(`Data: ${dateStr}${meetingTime ? ' às ' + meetingTime : ''}`);
    if (meetingLocation) lines.push(`Local: ${meetingLocation}`);
    lines.push(`Responsável: ${name}`);
    lines.push(sep);
    lines.push('');

    lines.push('Prezados,');
    lines.push('');
    lines.push(`Segue abaixo a ata de reunião com o status atualizado das tarefas.`);
    lines.push('');

    if (attendees) {
      lines.push(`Participantes: ${attendees}`);
      lines.push('');
    }

    if (includeMetrics) {
      lines.push('RESUMO:');
      lines.push(`  - Total de tarefas:  ${metrics.total}`);
      lines.push(`  - Concluídas:        ${metrics.done} (${metrics.completion}%)`);
      lines.push(`  - Em Progresso:      ${metrics.inProgress}`);
      lines.push(`  - Urgentes:          ${metrics.urgent}`);
      lines.push('');
    }

    let groupIdx = 1;
    for (const [group, groupTasks] of Object.entries(groups)) {
      lines.push(`${groupIdx}) ${group.toUpperCase()}`);
      lines.push(sep2);
      const colHeader = 'TAREFA | PRIORIDADE | RESPONSÁVEL | DEPARTAMENTO | PRAZO';
      lines.push(colHeader);
      lines.push(sep2);
      groupTasks.forEach(t => {
        const prio  = priorityLabel[t.priority] || t.priority;
        const resp  = t.assigned_user?.name || '—';
        const dept  = t.department_data?.name || '—';
        const prazo = t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : '—';
        const icon  = statusIcon[t.status] || '○';
        lines.push(`${icon} ${t.title} | ${prio} | ${resp} | ${dept} | ${prazo}`);
        if (includeDescription && t.description) {
          lines.push(`   → ${t.description}`);
        }
      });
      lines.push('');
      groupIdx++;
    }

    if (observations) {
      lines.push('OBSERVAÇÕES E PRÓXIMOS PASSOS:');
      lines.push(sep2);
      lines.push(observations);
      lines.push('');
    }

    lines.push(sep);
    lines.push(`Documento gerado pelo Tecno Mapper`);
    lines.push(`em ${new Date().toLocaleString('pt-BR')} por ${name}`);
    lines.push(sep);

    return lines.join('\n');
  };

  // ── Open mailto: with formatted plain-text body ────────────────────────
  const handleDownloadEML = () => {
    const body  = getPlainTextBody();
    const to    = toList.join(',');
    const cc    = ccInput.trim();
    const subj  = encodeURIComponent(meetingTitle);
    const bodyE = encodeURIComponent(body);
    const ccPart = cc ? `cc=${encodeURIComponent(cc)}&` : '';
    window.open(`mailto:${to}?${ccPart}subject=${subj}&body=${bodyE}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const addTo = () => {
    const emails = toInput.split(/[,;\s]+/).map(e => e.trim()).filter(e => e.includes('@'));
    if (emails.length) { setToList(prev => [...new Set([...prev, ...emails])]); setToInput(''); }
  };

  if (!isOpen) return null;

  const groups = groupedTasks();
  const allStatuses = ['backlog', 'todo', 'in_progress', 'review', 'done'];
  const readyToSend = toList.length > 0;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Gerar Ata de Reunião</h2>
              <p className="text-xs text-slate-400">{filteredTasks.length} tarefas incluídas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Step tabs */}
            <div className="flex items-center bg-white/5 rounded-lg p-1 mr-2">
              <button onClick={() => setStep('config')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all', step === 'config' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white')}>
                <Edit3 size={12} /> Configurar
              </button>
              <button onClick={() => setStep('preview')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all', step === 'preview' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white')}>
                <Eye size={12} /> Preview
              </button>
              <button onClick={() => setStep('send')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all', step === 'send' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white')}>
                <Send size={12} /> Enviar
              </button>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex">
          <AnimatePresence mode="wait">
            {step === 'config' ? (
              <motion.div key="config" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Meeting Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={12} />Informações da Reunião</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <input value={meetingTitle} onChange={e => setMeetingTitle(e.target.value)}
                        placeholder="Título da ata..."
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Data</label>
                      <input type="date" value={meetingDate} onChange={e => setMeetingDate(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Horário</label>
                      <input type="time" value={meetingTime} onChange={e => setMeetingTime(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Local / Plataforma</label>
                      <input value={meetingLocation} onChange={e => setMeetingLocation(e.target.value)}
                        placeholder="Ex: Sala 3, Google Meet..."
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Participantes</label>
                      <input value={attendees} onChange={e => setAttendees(e.target.value)}
                        placeholder="Ex: João, Maria, Carlos..."
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
                    </div>
                  </div>
                </div>

                {/* Task Filter */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target size={12} />Filtrar Tarefas por Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {allStatuses.map(s => (
                      <button key={s} onClick={() => toggleStatus(s)}
                        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                          selectedStatuses.includes(s)
                            ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                            : 'bg-white/5 border-white/10 text-slate-500 hover:text-white')}>
                        {selectedStatuses.includes(s) ? <Check size={11} /> : <Circle size={11} />}
                        {statusLabel[s]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group By */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={12} />Agrupar por</h3>
                  <div className="flex gap-2">
                    {[['status','Status'],['priority','Prioridade'],['department','Departamento']].map(([val, label]) => (
                      <button key={val} onClick={() => setGroupBy(val as any)}
                        className={cn('flex-1 py-2 rounded-xl text-xs font-semibold border transition-all',
                          groupBy === val ? 'bg-violet-500/20 border-violet-500/40 text-violet-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white')}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sparkles size={12} />Opções</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      [includeDescription, setIncludeDescription, 'Incluir descrições das tarefas'],
                      [includeMetrics, setIncludeMetrics, 'Incluir painel de métricas'],
                    ].map(([val, setter, label], i) => (
                      <button key={i} onClick={() => (setter as any)((v: boolean) => !v)}
                        className={cn('flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all text-left',
                          val ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white')}>
                        <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0',
                          val ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600')}>
                          {val && <Check size={10} className="text-white" />}
                        </div>
                        {label as string}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Observations */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Edit3 size={12} />Observações & Próximos Passos</h3>
                  <textarea rows={4} value={observations} onChange={e => setObservations(e.target.value)}
                    placeholder="Adicione notas, decisões tomadas ou próximos passos..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none resize-none" />
                </div>
              </motion.div>
            ) : (
              <motion.div key="preview" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="flex-1 overflow-y-auto">
                {/* Preview */}
                <div ref={previewRef} className="m-4 rounded-xl overflow-hidden border border-white/10 bg-white text-slate-800 text-sm" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
                  {/* Header */}
                  <div className="p-8" style={{ background: 'linear-gradient(135deg,#1e293b,#0f172a)' }}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>📋</div>
                      <div>
                        <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Tecno Mapper</div>
                        <div className="text-xs text-slate-400">Gerenciamento de Processos</div>
                      </div>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white mb-3">{meetingTitle}</h1>
                    <div className="flex flex-wrap gap-4 text-slate-400 text-xs">
                      <span>📅 {new Date(meetingDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      {meetingTime && <span>🕐 {meetingTime}</span>}
                      {meetingLocation && <span>📍 {meetingLocation}</span>}
                      <span>👤 {currentUser?.name}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  {includeMetrics && (
                    <div className="grid grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-100">
                      {[
                        { v: metrics.total, l: 'Total', c: '#1e293b' },
                        { v: `${metrics.completion}%`, l: 'Concluído', c: '#10b981' },
                        { v: metrics.inProgress, l: 'Em Progresso', c: '#f59e0b' },
                        { v: metrics.urgent, l: 'Urgentes', c: '#ef4444' },
                      ].map(({ v, l, c }) => (
                        <div key={l} className="bg-white rounded-xl p-3 text-center shadow-sm border border-slate-100">
                          <div className="text-2xl font-extrabold" style={{ color: c }}>{v}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{l}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Attendees */}
                  {attendees && (
                    <div className="px-6 pt-4 pb-0">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Participantes: </span>
                      <span className="text-sm text-slate-700">{attendees}</span>
                    </div>
                  )}

                  {/* Tasks */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50">
                          {['Tarefa', 'Prioridade', 'Responsável', 'Departamento', 'Prazo'].map(h => (
                            <th key={h} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-left border-b border-slate-100">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(groups).map(([group, groupTasks]) => (
                          <React.Fragment key={group}>
                            <tr>
                              <td colSpan={5} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 border-t border-slate-100">{group}</td>
                            </tr>
                            {groupTasks.map(t => (
                              <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-2.5">
                                  <div className="font-medium text-slate-800 text-sm">{statusIcon[t.status]} {t.title}</div>
                                  {includeDescription && t.description && <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{t.description}</div>}
                                </td>
                                <td className="px-3 py-2.5 text-center">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${priorityColor[t.priority]}22`, color: priorityColor[t.priority] }}>
                                    {priorityLabel[t.priority]}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-xs text-slate-500 text-center">{t.assigned_user?.name || '—'}</td>
                                <td className="px-3 py-2.5 text-xs text-slate-500 text-center">{t.department_data?.name || '—'}</td>
                                <td className="px-3 py-2.5 text-xs text-slate-500 text-center">{t.due_date ? new Date(t.due_date).toLocaleDateString('pt-BR') : '—'}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Observations */}
                  {observations && (
                    <div className="mx-4 mb-4 mt-2 p-4 rounded-xl bg-amber-50 border-l-4 border-amber-400">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">📝 Observações & Próximos Passos</div>
                      <p className="text-sm text-amber-900 whitespace-pre-wrap">{observations}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
                    Documento gerado por <strong>Tecno Mapper</strong> em {new Date().toLocaleString('pt-BR')} por {currentUser?.name}
                  </div>
                </div>
              </motion.div>
            )}
            {/* Send step */}
            {step === 'send' && (
              <motion.div key="send" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* Intro */}
                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <Mail size={18} className="text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-300">E-mail formatado pronto para enviar</p>
                    <p className="text-xs text-slate-400 mt-1">Abre seu cliente de e-mail (Outlook, Gmail, Thunderbird) com destinatários, Cc, assunto e corpo já preenchidos em formato profissional — igual ao seu outro app. Basta clicar em <strong className="text-slate-300">Enviar</strong>.</p>
                  </div>
                </div>

                {/* To field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AtSign size={11} />Para (destinatários)
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={toInput}
                      onChange={e => setToInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTo(); } }}
                      placeholder="email@empresa.com — Enter ou vírgula para adicionar"
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none"
                    />
                    <button onClick={addTo} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                  {/* Chips */}
                  {toList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {toList.map(email => (
                        <span key={email} className="flex items-center gap-1.5 text-xs bg-blue-500/15 text-blue-300 border border-blue-500/25 px-2.5 py-1 rounded-full">
                          {email}
                          <button onClick={() => setToList(prev => prev.filter(e => e !== email))} className="hover:text-red-400 transition-colors">
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* CC */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cc (opcional)</label>
                  <input
                    value={ccInput}
                    onChange={e => setCcInput(e.target.value)}
                    placeholder="cc@empresa.com, outro@empresa.com"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none"
                  />
                </div>

                {/* Subject preview */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assunto</label>
                  <div className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-slate-300">{meetingTitle}</div>
                </div>

                {/* Plain-text preview */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Eye size={11} />Preview do Corpo do E-mail
                  </label>
                  <pre className="rounded-xl border border-white/[0.06] bg-[#0a1120] text-slate-300 text-[11px] leading-relaxed p-4 overflow-auto whitespace-pre-wrap font-mono" style={{ maxHeight: 280 }}>
                    {getPlainTextBody()}
                  </pre>
                </div>

                {/* Calendar invite */}
                <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-start gap-3">
                  <CalendarPlus size={18} className="text-violet-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-violet-300">Convite de Agenda (.ics)</p>
                    <p className="text-xs text-slate-400 mt-0.5">Gera um arquivo .ics compatível com Outlook, Google Calendar, Apple Calendar e qualquer cliente de agenda.</p>
                  </div>
                  <button onClick={handleDownloadICS}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl transition-colors">
                    <Download size={13} /> Baixar .ics
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Zap size={11} className="text-violet-400" />
            {filteredTasks.length} tarefas · {Object.keys(groups).length} grupos
          </div>
          <div className="flex items-center gap-2">
            {step === 'config' && (
              <button onClick={() => setStep('preview')}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition-colors">
                <Eye size={14} /> Ver Preview <ArrowRight size={13} />
              </button>
            )}
            {step === 'preview' && (
              <>
                <button onClick={handlePrint} title="Imprimir / Salvar PDF"
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors">
                  <Printer size={13} /> PDF
                </button>
                <button onClick={handleDownloadHTML} title="Baixar HTML"
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors">
                  <Download size={13} /> HTML
                </button>
                <button onClick={handleCopyHTML}
                  className={cn('flex items-center gap-1.5 px-3 py-2 border text-xs font-semibold rounded-xl transition-all',
                    copied ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300')}>
                  {copied ? <><Check size={13} /> Copiado!</> : <><Copy size={13} /> Copiar HTML</>}
                </button>
                <button onClick={() => setStep('send')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                  <Send size={14} /> Enviar <ArrowRight size={13} />
                </button>
              </>
            )}
            {step === 'send' && (
              <>
                <button onClick={handleDownloadICS}
                  className="flex items-center gap-1.5 px-3 py-2 bg-violet-600/80 hover:bg-violet-500 border border-violet-500/40 text-white text-xs font-semibold rounded-xl transition-colors">
                  <CalendarPlus size={13} /> Convidar Agenda
                </button>
                <button
                  onClick={handleDownloadEML}
                  disabled={!readyToSend}
                  className={cn('flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all',
                    readyToSend
                      ? copiedEmail
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/10'
                  )}>
                  {copiedEmail
                    ? <><Check size={14} /> Abrindo cliente de e-mail...</>
                    : <><Mail size={14} /> Abrir no Cliente de E-mail</>}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
