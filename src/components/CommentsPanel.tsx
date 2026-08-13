import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Check, Trash2, User } from 'lucide-react';
import { Comment } from '../hooks/useComments';

interface CommentsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  currentUser: { name: string; email: string; role: string } | null;
  onAddComment: (text: string) => void;
  onResolveComment: (id: string) => void;
  onDeleteComment: (id: string) => void;
  nodeName: string;
}

export function CommentsPanel({
  isOpen,
  onClose,
  comments,
  currentUser,
  onAddComment,
  onResolveComment,
  onDeleteComment,
  nodeName,
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  const filteredComments = showResolved
    ? comments
    : comments.filter(c => !c.resolved);

  const unresolvedCount = comments.filter(c => !c.resolved).length;
  const resolvedCount = comments.filter(c => c.resolved).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0f172a] border-l border-white/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <MessageSquare size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Comentários</h3>
                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{nodeName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowResolved(false)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    !showResolved
                      ? 'bg-blue-500/20 text-blue-400 font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Ativos {unresolvedCount > 0 && `(${unresolvedCount})`}
                </button>
                <button
                  onClick={() => setShowResolved(true)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    showResolved
                      ? 'bg-blue-500/20 text-blue-400 font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Resolvidos {resolvedCount > 0 && `(${resolvedCount})`}
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredComments.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
                  <p>{showResolved ? 'Nenhum comentário resolvido' : 'Nenhum comentário ainda'}</p>
                  {!showResolved && (
                    <p className="text-sm mt-1">Seja o primeiro a comentar!</p>
                  )}
                </div>
              ) : (
                filteredComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${
                      comment.resolved
                        ? 'bg-white/[0.02] border-white/5 opacity-60'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                        <User size={14} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-white">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(comment.timestamp).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className={`text-sm ${comment.resolved ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                          {comment.text}
                        </p>

                        {/* Actions */}
                        {!comment.resolved && (
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => onResolveComment(comment.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                            >
                              <Check size={12} />
                              Resolver
                            </button>
                            {comment.userEmail === currentUser?.email && (
                              <button
                                onClick={() => onDeleteComment(comment.id)}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 size={12} />
                                Excluir
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            {!showResolved && (
              <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar comentário..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
