import { useState, useEffect, useCallback } from 'react';

export interface Comment {
  id: string;
  nodeId: string;
  userName: string;
  userEmail: string;
  text: string;
  timestamp: string;
  resolved: boolean;
}

const STORAGE_KEY = 'tecno_mapper_comments';

export function useComments(nodeId?: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all comments from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setComments(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
      } catch (error) {
        console.error('Error saving comments:', error);
      }
    }
  }, [comments, isLoaded]);

  const addComment = useCallback((
    userName: string,
    userEmail: string,
    text: string
  ) => {
    if (!nodeId || !text.trim()) return;

    const newComment: Comment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nodeId,
      userName,
      userEmail,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    setComments(prev => [...prev, newComment]);
  }, [nodeId]);

  const resolveComment = useCallback((commentId: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId ? { ...c, resolved: true } : c
      )
    );
  }, []);

  const deleteComment = useCallback((commentId: string) => {
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
