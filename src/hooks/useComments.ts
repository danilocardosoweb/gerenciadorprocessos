import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Comment {
  id: string;
  nodeId: string;
  userName: string;
  userEmail: string;
  text: string;
  timestamp: string;
  resolved: boolean;
}

function toComment(r: any): Comment {
  return {
    id: r.id,
    nodeId: r.node_id,
    userName: r.user_name,
    userEmail: r.user_email || '',
    text: r.text,
    timestamp: r.created_at,
    resolved: r.resolved,
  };
}

export function useComments(nodeId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from('node_comments')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setComments(data.map(toComment));
        setIsLoaded(true);
      });
  }, []);

  const addComment = useCallback(async (
    userName: string,
    userEmail: string,
    text: string
  ) => {
    if (!nodeId || !text.trim()) return;
    const { data } = await supabase
      .from('node_comments')
      .insert({ node_id: nodeId, user_name: userName, user_email: userEmail, text: text.trim() })
      .select().single();
    if (data) setComments(prev => [...prev, toComment(data)]);
  }, [nodeId]);

  const resolveComment = useCallback(async (commentId: string) => {
    await supabase.from('node_comments').update({ resolved: true }).eq('id', commentId);
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, resolved: true } : c));
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    await supabase.from('node_comments').delete().eq('id', commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, []);

  const getNodeComments = useCallback((targetNodeId: string) => {
    return comments.filter(c => c.nodeId === targetNodeId && !c.resolved);
  }, [comments]);

  const getAllNodeComments = useCallback((targetNodeId: string) => {
    return comments.filter(c => c.nodeId === targetNodeId);
  }, [comments]);

  const nodeComments = nodeId ? comments.filter(c => c.nodeId === nodeId) : [];
  const unresolvedCount = nodeComments.filter(c => !c.resolved).length;
  const totalCount = nodeComments.length;

  return {
    comments: nodeComments,
    allComments: comments,
    unresolvedCount,
    totalCount,
    addComment,
    resolveComment,
    deleteComment,
    getNodeComments,
    getAllNodeComments,
    isLoaded,
  };
}
