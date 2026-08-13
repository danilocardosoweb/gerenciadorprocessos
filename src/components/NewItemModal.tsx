import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Network, FolderOpen, FileText, Box, Lightbulb, Globe, Lock, Building2, Users, Check, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

type Visibility = 'public' | 'departments' | 'private';

export interface NewItemData {
  title: string;
  description: string;
  type: 'map' | 'folder' | 'markdown' | 'sector3d';
  visibility: Visibility;
  allowed_departments: string[];
  allowed_user_ids: string[];
  tags?: string[];
  nodes?: any[];
  edges?: any[];
  nodeDetails?: Record<string, any>;
}

interface NewItemModalProps {
  onClose: () => void;
  onCreate: (data: NewItemData) => void | Promise<void>;
  initialType?: 'map' | 'folder' | 'markdown' | 'sector3d';
  currentUser?: { id: string; name: string; email: string; role: string } | null;
  isOpen?: boolean;
}

export function NewItemModal({ onClose, onCreate, initialType = 'map', currentUser, isOpen }: NewItemModalProps) {
  const [type, setType] = useState<'map' | 'folder' | 'markdown' | 'sector3d'>(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showKaizenInfo, setShowKaizenInfo] = useState(initialType === 'markdown');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Visibility
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [allDepartments, setAllDepartments] = useState<{ id: string; name: string; color: string }[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; department?: string }[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deptDropOpen, setDeptDropOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);

  useEffect(() => {
    const fetchDepartments = () => {
      supabase.from('departments').select('*').order('created_at', { ascending: true }).then(({ data, error }) => {
        if (error) console.error('L Error fetching departments:', error);
        if (data) setAllDepartments(data);
      });
    };
    
    const fetchUsers = () => {
      supabase.from('tecno_users').select('*').eq('status', 'Ativo').order('created_at', { ascending: true }).then(({ data, error }) => {
        if (error) console.error('L Error fetching users:', error);
        if (data) setAllUsers(data.filter(u => u.id !== currentUser?.id));
      });
    };

    fetchDepartments();
    fetchUsers();
  }, [currentUser?.id, isOpen, initialType]);

  const toggleDept = (name: string) =>
    setSelectedDepts(prev => prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]);

  const toggleUser = (id: string) =>
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);

  const handleCreate = async () => {
    if (!title.trim() || isCreating) return;
    setIsCreating(true);
    setCreateError('');
    try {
      await onCreate({
        title,
        description,
        type,
        visibility,
        allowed_departments: visibility === 'departments' ? selectedDepts : [],
        allowed_user_ids: visibility === 'departments' ? selectedUsers : [],
      });
      onClose();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Não foi possível criar o item.');
    } finally {
      setIsCreating(false);
    }
  };

  const types = [
    { id: 'map' as const, label: 'Mapa de Processo', icon: Network, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { id: 'folder' as const, label: 'Pasta', icon: FolderOpen, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { id: 'markdown' as const, label: 'Ideia (Kaizen)', icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { id: 'sector3d' as const, label: 'Setor 3D', icon: Box, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  ];

  const visibilityOptions: { id: Visibility; label: string; desc: string; icon: LucideIcon; color: string }[] = [
    { id: 'public',      label: 'Público',      desc: 'Todos os usuários ativos podem ver',        icon: Globe,      color: 'text-emerald-400' },
    { id: 'departments', label: 'Restrito',      desc: 'Apenas departamentos/usuários selecionados', icon: Building2, color: 'text-amber-400'   },
    { id: 'private',     label: 'Privado',       desc: 'Somente você e administradores',            icon: Lock,       color: 'text-red-400'     },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0a1120]/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-[#111827] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden"
        onClick={e => { e.stopPropagation(); setDeptDropOpen(false); setUserDropOpen(false); }}
      >
        {/* Header */}
        <div className="px-8 pt-7 pb-5 border-b border-white/[0.06]">
          <button onClick={onClose} className="absolute top-5 right-5 p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
          <h2 className="text-xl font-bold text-white">Criar Novo Item</h2>
          <p className="text-slate-500 text-xs mt-1">Adicione um processo, pasta ou documento ao workspace.</p>
        </div>

        <div className="px-8 py-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Type selector */}
          <div className="flex gap-3">
            {types.map(t => {
              const Icon = t.icon;
              const isSelected = type === t.id;
              return (
                <button key={t.id} onClick={() => { setType(t.id); setShowKaizenInfo(t.id === 'markdown'); }}
                  className={cn('flex-1 flex flex-col items-center justify-center gap-2.5 py-4 rounded-2xl border transition-all',
                    isSelected ? 'bg-white/8 border-white/20' : 'bg-white/[0.03] border-white/[0.05] opacity-50 hover:opacity-90 hover:bg-white/5'
                  )}>
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', t.bg, t.color)}>
                    <Icon size={18} />
                  </div>
                  <span className="text-[11px] font-semibold text-white leading-tight text-center">{t.label}</span>
                </button>
              );
            })}
          </div>

          {type === 'map' && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4"
            >
              <div className="flex gap-3">
                <Network size={18} className="mt-0.5 shrink-0 text-blue-400" />
                <div>
                  <p className="text-sm font-bold text-blue-100">Comece com clareza</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    O mapa será criado somente com o processo principal. No editor, sugestões opcionais ajudarão você a adicionar cada etapa, sem preencher conteúdo automaticamente.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Kaizen info */}
          <AnimatePresence>
            {showKaizenInfo && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                <div className="flex gap-3">
                  <Lightbulb className="text-emerald-400 shrink-0 mt-0.5" size={16} />
                  <div className="text-xs text-slate-400">
                    <p className="font-semibold text-emerald-300 mb-1">Kaizen - Melhoria Contínua</p>
                    <p>Use para sugerir melhorias, documentar problemas e propor soluções. Escreva em Markdown.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Título</label>
            <input type="text" autoComplete="off" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Processo Comercial  Vendas B2B"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-600"
              autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Descrição (opcional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Descreva brevemente o propósito deste item..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/40 transition-all placeholder:text-slate-600 resize-none h-20"
            />
          </div>

          {/*  VISIBILITY  */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">Visibilidade</label>
            <div className="grid grid-cols-3 gap-2">
              {visibilityOptions.map(v => {
                const Icon = v.icon;
                const sel = visibility === v.id;
                return (
                  <button key={v.id} onClick={() => setVisibility(v.id)}
                    className={cn('flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all',
                      sel ? 'border-white/20 bg-white/8' : 'border-white/[0.05] bg-white/[0.02] opacity-60 hover:opacity-100 hover:bg-white/5'
                    )}>
                    <Icon size={16} className={sel ? v.color : 'text-slate-500'} />
                    <span className={cn('text-[11px] font-bold', sel ? 'text-white' : 'text-slate-500')}>{v.label}</span>
                    <span className="text-[9px] text-slate-600 leading-tight">{v.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Department + User pickers  only when restricted */}
          <AnimatePresence>
            {visibility === 'departments' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="space-y-3 pt-1">

                  {/* Department picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      <Building2 size={11} className="inline mr-1 text-amber-400" />
                      Departamentos com acesso
                    </label>
                    <div className="relative">
                      <button onClick={e => { e.stopPropagation(); setDeptDropOpen(o => !o); setUserDropOpen(false); }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-left hover:border-white/20 transition-colors">
                        <span className={selectedDepts.length ? 'text-white' : 'text-slate-600'}>
                          {selectedDepts.length ? `${selectedDepts.length} departamento(s) selecionado(s)` : 'Selecionar departamentos...'}
                        </span>
                        <ChevronDown size={14} className="text-slate-500" />
                      </button>
                      {deptDropOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-[#1a2540] border border-white/10 rounded-xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                          <div className="max-h-48 overflow-y-auto py-1">
                            {allDepartments.map(d => (
                              <button key={d.id} onClick={() => toggleDept(d.name)}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/5 transition-colors text-left">
                                <div className={cn('w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0',
                                  selectedDepts.includes(d.name) ? 'bg-blue-500 border-blue-500' : 'border-white/20'
                                )}>
                                  {selectedDepts.includes(d.name) && <Check size={10} className="text-white" />}
                                </div>
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                                <span className="text-sm text-slate-300">{d.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedDepts.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedDepts.map(d => (
                          <span key={d} onClick={() => toggleDept(d)}
                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 cursor-pointer hover:bg-amber-500/25 transition-colors">
                            {d} <X size={9} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* User picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      <Users size={11} className="inline mr-1 text-blue-400" />
                      Usuários adicionais (opcional)
                    </label>
                    <div className="relative">
                      <button onClick={e => { e.stopPropagation(); setUserDropOpen(o => !o); setDeptDropOpen(false); }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-sm text-left hover:border-white/20 transition-colors">
                        <span className={selectedUsers.length ? 'text-white' : 'text-slate-600'}>
                          {selectedUsers.length ? `${selectedUsers.length} usuário(s) selecionado(s)` : 'Adicionar usuários específicos...'}
                        </span>
                        <ChevronDown size={14} className="text-slate-500" />
                      </button>
                      {userDropOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-[#1a2540] border border-white/10 rounded-xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                          <div className="max-h-48 overflow-y-auto py-1">
                            {allUsers.map(u => (
                              <button key={u.id} onClick={() => toggleUser(u.id)}
                                className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-white/5 transition-colors text-left">
                                <div className={cn('w-4 h-4 rounded flex items-center justify-center border transition-all shrink-0',
                                  selectedUsers.includes(u.id) ? 'bg-blue-500 border-blue-500' : 'border-white/20'
                                )}>
                                  {selectedUsers.includes(u.id) && <Check size={10} className="text-white" />}
                                </div>
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm text-slate-300">{u.name}</div>
                                  {u.department && <div className="text-[10px] text-slate-600">{u.department}</div>}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedUsers.map(uid => {
                          const u = allUsers.find(x => x.id === uid);
                          return u ? (
                            <span key={uid} onClick={() => toggleUser(uid)}
                              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 cursor-pointer hover:bg-blue-500/25 transition-colors">
                              {u.name.split(' ')[0]} <X size={9} />
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {selectedDepts.length === 0 && selectedUsers.length === 0 && (
                    <p className="text-[10px] text-amber-400/70 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      Atenção: selecione ao menos um departamento ou usuário; caso contrário, ninguém verá este item.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create button */}
          {createError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
              {createError}
            </div>
          )}

          <button onClick={handleCreate} disabled={!title.trim() || isCreating}
            className="w-full h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none">
            {isCreating ? 'Criando com segurança...' : `Criar ${types.find(t => t.id === type)?.label}`}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
