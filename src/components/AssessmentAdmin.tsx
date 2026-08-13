/**
 * AssessmentAdmin Component
 * Admin interface for creating, editing, and managing assessments
 * Modern, intuitive design for administrators and managers
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Settings2,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { useAssessments } from '../hooks/useAssessments';
import { usePermissions } from '../lib/permissions';
import type {
  Assessment,
  AssessmentQuestion,
  AssessmentFormData,
  QuestionFormData,
  AssessmentDifficulty
} from '../types/assessments';

interface AssessmentAdminProps {
  processItemId: string;
  processTitle: string;
  currentUser: any;
  onClose: () => void;
}

export function AssessmentAdmin({ processItemId, processTitle, currentUser, onClose }: AssessmentAdminProps) {
  const permissions = usePermissions(currentUser);
  const {
    assessments,
    loading,
    error,
    fetchAssessments,
    createAssessment,
    importEducationalAssessments,
    updateAssessment,
    deleteAssessment,
    publishAssessment,
    fetchQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion
  } = useAssessments();

  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublished, setFilterPublished] = useState<boolean | null>(null);
  const [scopeMode, setScopeMode] = useState<'map' | 'all'>(processItemId ? 'map' : 'all');

  // Form state
  const [formData, setFormData] = useState<AssessmentFormData>({
    title: '',
    description: '',
    process_item_id: processItemId,
    question_count: 10,
    is_mandatory: false,
    passing_score: 70,
    time_limit_seconds: undefined,
    tags: [],
    difficulty: 'intermediate',
    xp_reward: 100
  });

  // Question form state
  const [questionForm, setQuestionForm] = useState<QuestionFormData>({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    weight: 1,
    explanation: '',
    image_url: '',
    time_limit_seconds: undefined,
    related_node_id: ''
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [isImportingCatalog, setIsImportingCatalog] = useState(false);

  const refreshAssessments = useCallback(() => {
    fetchAssessments(scopeMode === 'map' ? processItemId : undefined, true);
  }, [fetchAssessments, processItemId, scopeMode]);

  const handleImportEducationalCatalog = async () => {
    if (!permissions.can.createAssessment) return;

    const userId = currentUser.id || '';
    if (!userId) {
      alert('Usuário não identificado. Faça login novamente.');
      return;
    }

    const confirmMessage = processItemId ?
       `Gerar as 3 avaliações desta trilha para "${processTitle || 'o mapa atual'}"`
      : 'Gerar o catálogo educacional completo com 24 avaliações (8 mapas × 3 níveis)';

    if (!window.confirm(confirmMessage)) return;

    try {
      setIsImportingCatalog(true);
      const result = await importEducationalAssessments(userId, {
        processItemId: processItemId || undefined,
        processTitle: processTitle || undefined,
        publish: true
      });

      refreshAssessments();
      alert(`Catélogo gerado com sucesso. Criadas: ${result.created.length}. Já existentes: ${result.skipped.length}.`);
    } catch (err: any) {
      alert(`Erro ao gerar catálogo educacional: ${err.message || 'verifique o banco e as permissões.'}`);
    } finally {
      setIsImportingCatalog(false);
    }
  };

  useEffect(() => {
    refreshAssessments();
  }, [refreshAssessments]);

  const handleCreateAssessment = async () => {
    if (!permissions.can.createAssessment) return;
    
    const userId = currentUser.id || '';
    if (!userId) {
      alert('Erro: usuário não identificado. Faça login novamente.');
      return;
    }

    try {
      const newAssessment = await createAssessment(formData, userId);
      if (newAssessment) {
        setSelectedAssessment(newAssessment);
        setView('edit');
        const fetchedQuestions = await fetchQuestions(newAssessment.id);
        setQuestions(fetchedQuestions || []);
      }
    } catch (err: any) {
      alert(`Erro ao criar avaliação: ${err.message || error || 'falha de permissão ou estrutura do banco.'}`);
    }
  };

  const handleUpdateAssessment = async () => {
    if (!selectedAssessment || !permissions.can.editAssessment) return;
    
    const updated = await updateAssessment(selectedAssessment.id, formData);
    if (updated) {
      setSelectedAssessment(updated);
      setView('list');
      refreshAssessments();
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!permissions.can.deleteAssessment) return;
    
    if (confirm('Tem certeza que deseja excluir esta avaliação')) {
      await deleteAssessment(id);
      refreshAssessments();
    }
  };

  const handleDuplicateAssessment = async (assessment: Assessment) => {
    if (!permissions.can.createAssessment) return;

    try {
      const duplicated = await createAssessment(
        {
          title: `${assessment.title} (Cópia)`,
          description: assessment.description,
          process_item_id: assessment.process_item_id,
          question_count: assessment.question_count,
          is_mandatory: assessment.is_mandatory,
          passing_score: assessment.passing_score,
          time_limit_seconds: assessment.time_limit_seconds,
          tags: assessment.tags || [],
          difficulty: assessment.difficulty,
          xp_reward: assessment.xp_reward || 100
        },
        currentUser.id || ''
      );

      if (duplicated) {
        const originalQuestions = await fetchQuestions(assessment.id);
        for (const q of originalQuestions) {
          await addQuestion(duplicated.id, {
            question_text: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            option_d: q.option_d,
            correct_option: q.correct_option,
            weight: q.weight,
            explanation: q.explanation,
            image_url: q.image_url,
            time_limit_seconds: q.time_limit_seconds,
            related_node_id: q.related_node_id
          }, q.order_index);
        }

        refreshAssessments();
      }
    } catch (err: any) {
      alert(`Erro ao duplicar avaliação: ${err.message || 'verifique o banco e as permissões.'}`);
    }
  };

  const handlePublishToggle = async (assessment: Assessment) => {
    if (!permissions.can.publishAssessment) return;

    if (!assessment.is_published) {
      const assessmentQuestions = await fetchQuestions(assessment.id);
      if (!assessmentQuestions.length) {
        alert('Adicione pelo menos uma questão antes de publicar a avaliação.');
        return;
      }
    }
    
    await publishAssessment(assessment.id, !assessment.is_published);
    refreshAssessments();
  };

  const handleEditAssessment = async (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setFormData({
      title: assessment.title,
      description: assessment.description || '',
      process_item_id: assessment.process_item_id,
      question_count: assessment.question_count,
      is_mandatory: assessment.is_mandatory,
      passing_score: assessment.passing_score,
      time_limit_seconds: assessment.time_limit_seconds,
      tags: assessment.tags || [],
      difficulty: assessment.difficulty,
      xp_reward: assessment.xp_reward || 100
    });
    
    const qs = await fetchQuestions(assessment.id);
    setQuestions(qs);
    setView('edit');
  };

  const handleAddQuestion = async () => {
    if (!selectedAssessment || !permissions.can.manageQuestions) return;
    
    try {
      const newQuestion = await addQuestion(
        selectedAssessment.id,
        questionForm,
        questions.length
      );
      
      if (newQuestion) {
        setQuestions([...questions, newQuestion]);
        setShowQuestionForm(false);
        resetQuestionForm();
      }
    } catch (err: any) {
      alert(`Erro ao adicionar questão: ${err.message || 'verifique o banco e as permissões.'}`);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion || !permissions.can.manageQuestions) return;
    
    const updated = await updateQuestion(editingQuestion.id, questionForm);
    if (updated) {
      setQuestions(questions.map(q => q.id === editingQuestion.id ? updated : q));
      setShowQuestionForm(false);
      setEditingQuestion(null);
      resetQuestionForm();
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!permissions.can.manageQuestions) return;
    
    await deleteQuestion(questionId);
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      weight: 1,
      explanation: '',
      image_url: '',
      time_limit_seconds: undefined,
      related_node_id: ''
    });
  };

  const filteredAssessments = assessments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (a.description && a.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterPublished === null || 
                         (filterPublished ? a.is_published : !a.is_published);
    return matchesSearch && matchesFilter;
  });

  const dashboardStats = {
    total: assessments.length,
    published: assessments.filter((item) => item.is_published).length,
    drafts: assessments.filter((item) => !item.is_published).length,
    avgQuestions: assessments.length ?
       Math.round(assessments.reduce((sum, item) => sum + (item.question_count || 10), 0) / assessments.length)
      : 0
  };

  if (view === 'list') {
    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-700"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Gerenciar Avaliações</h2>
                {processTitle && (
                  <p className="text-white/80 text-sm mt-1">{processTitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-6 py-4 bg-slate-700/50 border-b border-slate-700">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar avaliações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setFilterPublished(filterPublished === null ? true : filterPublished === true ? false : null)}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    filterPublished === true ?
                       'bg-green-500/20 border-green-500 text-green-400' 
                      : filterPublished === false ?
                       'bg-slate-600 border-slate-500 text-slate-300'
                      : 'bg-slate-700 border-slate-600 text-slate-300'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
                {processItemId && (
                  <button
                    onClick={() => setScopeMode(scopeMode === 'map' ? 'all' : 'map')}
                    className="px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors text-sm"
                    title="Alternar entre avaliações deste mapa e todas as avaliações"
                  >
                    {scopeMode === 'map' ? 'Este mapa' : 'Todos os temas'}
                  </button>
                )}
              </div>
              
              {permissions.can.createAssessment && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleImportEducationalCatalog}
                    disabled={loading || isImportingCatalog}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Target className="w-4 h-4" />
                    {isImportingCatalog ? 'Gerando trilhas...' : 'Gerar catálogo'}
                  </button>
                  <button
                    onClick={() => {
                      setFormData({
                        title: '',
                        description: '',
                        process_item_id: scopeMode === 'map' ? processItemId : undefined,
                        question_count: 10,
                        is_mandatory: false,
                        passing_score: 70,
                        time_limit_seconds: undefined,
                        tags: [],
                        difficulty: 'intermediate',
                        xp_reward: 100
                      });
                      setView('create');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Avaliação
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-slate-400 uppercase tracking-wide">Total</div>
                <div className="text-lg font-black text-white">{dashboardStats.total}</div>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <div className="text-xs text-emerald-200 uppercase tracking-wide">Publicadas</div>
                <div className="text-lg font-black text-emerald-100">{dashboardStats.published}</div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
                <div className="text-xs text-amber-200 uppercase tracking-wide">Rascunhos</div>
                <div className="text-lg font-black text-amber-100">{dashboardStats.drafts}</div>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
                <div className="text-xs text-blue-200 uppercase tracking-wide">Média questáes</div>
                <div className="text-lg font-black text-blue-100">{dashboardStats.avgQuestions}</div>
              </div>
            </div>
          </div>

          {/* Assessment List */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            {loading ? (
              <div className="text-center text-slate-400 py-8">Carregando...</div>
            ) : filteredAssessments.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma avaliação encontrada</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAssessments.map((assessment) => (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">{assessment.title}</h3>
                          {assessment.is_published ? (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                              Publicado
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-600 text-slate-400 text-xs rounded-full">
                              Rascunho
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            {assessment.question_count} questáes
                          </span>
                        </div>
                        {assessment.description && (
                          <p className="text-slate-400 text-sm mb-2">{assessment.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Dificuldade: {assessment.difficulty}</span>
                          <span>Nota mínima: {assessment.passing_score}%</span>
                          {assessment.time_limit_seconds && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {Math.floor(assessment.time_limit_seconds / 60)}min
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {permissions.can.editAssessment && (
                          <button
                            onClick={() => handleEditAssessment(assessment)}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                        {permissions.can.createAssessment && (
                          <button
                            onClick={() => handleDuplicateAssessment(assessment)}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                            title="Duplicar"
                          >
                            <Copy className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                        {permissions.can.publishAssessment && (
                          <button
                            onClick={() => handlePublishToggle(assessment)}
                            className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                            title={assessment.is_published ? 'Despublicar' : 'Publicar'}
                          >
                            {assessment.is_published ? (
                              <EyeOff className="w-4 h-4 text-slate-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        )}
                        {permissions.can.deleteAssessment && (
                          <button
                            onClick={() => handleDeleteAssessment(assessment.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (view === 'create' || view === 'edit') {
    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {view === 'create' ? 'Nova Avaliação' : 'Editar Avaliação'}
              </h2>
              <button
                onClick={() => {
                  setView('list');
                  setSelectedAssessment(null);
                  setQuestions([]);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(90vh-80px)]">
            {/* Left Panel - Assessment Form */}
            <div className="w-1/2 p-6 border-r border-slate-700 overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Configurações
              </h3>
              
              <div className="space-y-4">
                {!selectedAssessment && (
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
                    Salve a avaliação primeiro para liberar a criação das questões.
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Ttulo da avaliação"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descrio
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="Descrio da avaliação"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Quantidade de Questáes
                    </label>
                    <select
                      value={formData.question_count}
                      onChange={(e) => setFormData({ ...formData, question_count: (e.target.value === '10' ? 10 : 20) as 10 | 20 })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value={10}>10 questáes</option>
                      <option value={20}>20 questáes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Dificuldade
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as AssessmentDifficulty })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="beginner">Iniciante</option>
                      <option value="intermediate">Intermediário</option>
                      <option value="advanced">Avançado</option>
                      <option value="expert">Especialista</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nota Mínima (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.passing_score}
                      onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tempo Limite (segundos)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.time_limit_seconds || ''}
                      onChange={(e) => setFormData({ ...formData, time_limit_seconds: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      placeholder="Sem limite"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {processItemId && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Escopo
                      </label>
                      <select
                        value={formData.process_item_id ? 'map' : 'free'}
                        onChange={(e) => setFormData({
                          ...formData,
                          process_item_id: e.target.value === 'map' ? processItemId : undefined
                        })}
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="map">Vinculada a este mapa</option>
                        <option value="free">Tema livre / geral</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Recompensa XP
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.xp_reward || 100}
                      onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mandatory"
                    checked={formData.is_mandatory}
                    onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="mandatory" className="text-sm text-slate-300">
                    Avaliação obrigatória
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      setView('list');
                      setSelectedAssessment(null);
                      setQuestions([]);
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  {view === 'create' ? (
                    <button
                      onClick={handleCreateAssessment}
                      disabled={!formData.title || loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      {loading ? 'Criando...' : 'Criar'}
                    </button>
                  ) : (
                    <button
                      onClick={handleUpdateAssessment}
                      disabled={!formData.title || loading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Salvando...' : 'Salvar'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Questions */}
            <div className="w-1/2 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Questáes ({questions.length}/{formData.question_count})
                </h3>
                {permissions.can.manageQuestions && (view === 'edit' || view === 'create') && (
                  <button
                    onClick={() => { if (!selectedAssessment) { alert('Primeiro salve a avaliação para liberar a criação das questões.'); return; } resetQuestionForm(); setEditingQuestion(null); setShowQuestionForm(true); }}
                    disabled={questions.length >= formData.question_count || !selectedAssessment}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </button>
                )}
              </div>

              {showQuestionForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 mb-4"
                >
                  <h4 className="text-white font-semibold mb-3">
                    {editingQuestion ? 'Editar Questo' : 'Nova Questo'}
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Pergunta *
                      </label>
                      <textarea
                        value={questionForm.question_text}
                        onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                        rows={2}
                        placeholder="Digite a pergunta"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <div key={opt}>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Opo {opt} *
                          </label>
                          <input
                            type="text"
                            value={questionForm[`option_${opt.toLowerCase()}` as keyof QuestionFormData] as string}
                            onChange={(e) => setQuestionForm({ ...questionForm, [`option_${opt.toLowerCase()}`]: e.target.value } as any)}
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                            placeholder={`Opo ${opt}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Resposta Correta *
                      </label>
                      <select
                        value={questionForm.correct_option}
                        onChange={(e) => setQuestionForm({ ...questionForm, correct_option: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Explicao
                      </label>
                      <textarea
                        value={questionForm.explanation}
                        onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                        rows={2}
                        placeholder="Explicao da resposta correta"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={editingQuestion ? handleUpdateQuestion : handleAddQuestion}
                        disabled={!questionForm.question_text || !questionForm.option_a || !questionForm.option_b || !questionForm.option_c || !questionForm.option_d}
                        className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {editingQuestion ? 'Atualizar' : 'Adicionar'}
                      </button>
                      <button
                        onClick={() => {
                          setShowQuestionForm(false);
                          setEditingQuestion(null);
                          resetQuestionForm();
                        }}
                        className="px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                {questions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-700/30 rounded-lg p-3 border border-slate-600 hover:border-slate-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-blue-400">#{index + 1}</span>
                          <span className="text-xs text-slate-500">Peso: {question.weight}</span>
                        </div>
                        <p className="text-white text-sm line-clamp-2">{question.question_text}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {permissions.can.manageQuestions && (
                          <>
                            <button
                              onClick={() => {
                                setEditingQuestion(question);
                                setQuestionForm({
                                  question_text: question.question_text,
                                  option_a: question.option_a,
                                  option_b: question.option_b,
                                  option_c: question.option_c,
                                  option_d: question.option_d,
                                  correct_option: question.correct_option,
                                  weight: question.weight,
                                  explanation: question.explanation || '',
                                  image_url: question.image_url || '',
                                  time_limit_seconds: question.time_limit_seconds,
                                  related_node_id: question.related_node_id || ''
                                });
                                setShowQuestionForm(true);
                              }}
                              className="p-1.5 hover:bg-slate-600 rounded transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-slate-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(question.id)}
                              className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
