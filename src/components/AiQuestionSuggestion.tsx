/**
 * AiQuestionSuggestion Component
 * Suggests assessment questions based on process content using AI
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, Check, X, RefreshCw, Lightbulb } from 'lucide-react';

interface AiQuestionSuggestionProps {
  processContent: string;
  processTitle: string;
  onAcceptSuggestion: (question: {
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
  }) => void;
  onClose: () => void;
}

export function AiQuestionSuggestion({ 
  processContent, 
  processTitle, 
  onAcceptSuggestion, 
  onClose 
}: AiQuestionSuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestion = async () => {
    setLoading(true);
    setError(null);
    setSuggestion(null);

    try {
      // Simulate AI generation - in production, this would call an AI API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a question based on the process content
      const generatedQuestion = generateQuestionFromContent(processContent, processTitle);
      setSuggestion(generatedQuestion);
    } catch (err) {
      setError('Erro ao gerar sugestão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const generateQuestionFromContent = (content: string, title: string) => {
    // This is a simplified mock implementation
    // In production, this would use an AI service like OpenAI, Claude, etc.
    
    const keywords = extractKeywords(content);
    const mainTopic = keywords[0] || 'processo';
    
    return {
      question_text: `Qual é o procedimento correto para ${mainTopic} no ${title}`,
      option_a: 'Verificar os parâmetros antes de iniciar',
      option_b: 'Iniciar sem verificação prvia',
      option_c: 'Pular etapas de segurança',
      option_d: 'Ignorar os manuais de operação',
      correct_answer: 'A' as const,
      explanation: `É essencial verificar todos os parâmetros e condições antes de iniciar o ${mainTopic} para garantir a segurança e a qualidade do processo.`
    };
  };

  const extractKeywords = (text: string): string[] => {
    // Simple keyword extraction
    const words = text.split(/\s+/).filter(word => word.length > 4);
    const uniqueWords = [...new Set(words)];
    return uniqueWords.slice(0, 5);
  };

  const handleAccept = () => {
    if (suggestion) {
      onAcceptSuggestion(suggestion);
      onClose();
    }
  };

  const handleRegenerate = () => {
    generateSuggestion();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-700"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Sugesto de Questo IA</h2>
                <p className="text-white/80 text-sm">Gerar pergunta baseada no conteúdo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {!suggestion && !loading && !error && (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Gerar Sugesto</h3>
              <p className="text-slate-400 mb-6">
                A IA analisar o contedo do processo e sugerir uma pergunta relevante para a avaliação.
              </p>
              <button
                onClick={generateSuggestion}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                Gerar Sugesto
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Analisando contedo e gerando sugestão...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={generateSuggestion}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {suggestion && (
            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-white">Questo Sugerida</h4>
                </div>
                <p className="text-white text-lg mb-4">{suggestion.question_text}</p>

                <div className="space-y-2 mb-4">
                  {[
                    { option: 'option_a', label: 'A' },
                    { option: 'option_b', label: 'B' },
                    { option: 'option_c', label: 'C' },
                    { option: 'option_d', label: 'D' }
                  ].map(({ option, label }) => (
                    <div
                      key={option}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        suggestion.correct_answer === label ?
                           'bg-green-500/20 border border-green-500/30'
                          : 'bg-slate-600/30 border border-slate-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        suggestion.correct_answer === label ?
                           'bg-green-500 text-white'
                          : 'bg-slate-600 text-slate-300'
                      }`}>
                        {label}
                      </div>
                      <span className="text-white">{suggestion[option]}</span>
                      {suggestion.correct_answer === label && (
                        <Check className="w-5 h-5 text-green-400 ml-auto" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightbulb className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-blue-400">Explicao</span>
                  </div>
                  <p className="text-sm text-slate-300">{suggestion.explanation}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRegenerate}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Regenerar
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Aceitar
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
