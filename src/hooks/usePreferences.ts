import { useState, useEffect, useCallback } from 'react';

export interface Preferences {
  requireApproval: boolean;
  emailNotifications: boolean;
  autoSave: boolean;
  darkMode: boolean;
  language: string;
  sessionTimeout: number;
  enableAuditLog: boolean;
  defaultMapLayout: 'LR' | 'TB' | 'RL' | 'BT';
}

const defaultPreferences: Preferences = {
  requireApproval: true,
  emailNotifications: true,
  autoSave: true,
  darkMode: true,
  language: 'pt-BR',
  sessionTimeout: 30,
  enableAuditLog: true,
  defaultMapLayout: 'LR',
};

const STORAGE_KEY = 'tecno_mapper_preferences';

export function usePreferences() {
  const [preferences, setPreferencesState] = useState<Preferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferencesState({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever preferences change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
    }
  }, [preferences, isLoaded]);

  const setPreferences = useCallback((newPrefs: Partial<Preferences>) => {
    setPreferencesState(prev => ({ ...prev, ...newPrefs }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferencesState(defaultPreferences);
  }, []);

  return {
    preferences,
    setPreferences,
    resetPreferences,
    isLoaded,
  };
}
