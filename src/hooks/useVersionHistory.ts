import { useState, useEffect, useCallback } from 'react';

export interface VersionSnapshot {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  description: string;
  nodes: any[];
  edges: any[];
  nodeDetails: Record<string, any>;
}

const STORAGE_KEY_PREFIX = 'tecno_mapper_versions_';
const MAX_VERSIONS = 20;

export function useVersionHistory(mapId: string) {
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `${STORAGE_KEY_PREFIX}${mapId}`;

  // Load versions from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setVersions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Save to localStorage when versions change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(versions.slice(-MAX_VERSIONS)));
      } catch (error) {
        console.error('Error saving versions:', error);
      }
    }
  }, [versions, isLoaded, storageKey]);

  const saveVersion = useCallback((
    userName: string,
    userEmail: string,
    description: string,
    nodes: any[],
    edges: any[],
    nodeDetails: Record<string, any>
  ) => {
    const newVersion: VersionSnapshot = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userName,
      userEmail,
      description,
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      nodeDetails: JSON.parse(JSON.stringify(nodeDetails)),
    };

    setVersions(prev => [...prev.slice(-MAX_VERSIONS + 1), newVersion]);
    return newVersion.id;
  }, []);

  const restoreVersion = useCallback((versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return null;
    return {
      nodes: version.nodes,
      edges: version.edges,
      nodeDetails: version.nodeDetails,
    };
  }, [versions]);

  const deleteVersion = useCallback((versionId: string) => {
    setVersions(prev => prev.filter(v => v.id !== versionId));
  }, []);

  const clearAllVersions = useCallback(() => {
    if (confirm('Tem certeza que deseja apagar todo o histórico de versões?')) {
      setVersions([]);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  const exportVersions = useCallback(() => {
    const data = {
      mapId,
      exportedAt: new Date().toISOString(),
      versions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `versoes-${mapId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [mapId, versions]);

  return {
    versions,
    saveVersion,
    restoreVersion,
    deleteVersion,
    clearAllVersions,
    exportVersions,
    totalCount: versions.length,
    isLoaded,
  };
}
