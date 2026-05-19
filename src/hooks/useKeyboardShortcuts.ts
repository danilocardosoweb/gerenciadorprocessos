import { useEffect, useCallback } from 'react';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    shortcuts.forEach((shortcut) => {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        // Don't trigger if user is typing in an input
        if (
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        ) {
          return;
        }

        event.preventDefault();
        shortcut.action();
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Common shortcuts preset for the app
export function useAppShortcuts(
  actions: {
    onSave?: () => void;
    onSearch?: () => void;
    onAdd?: () => void;
    onPresent?: () => void;
    onBack?: () => void;
    onSettings?: () => void;
    onExport?: () => void;
  }
) {
  const shortcuts: ShortcutConfig[] = [
    {
      key: 's',
      ctrl: true,
      action: actions.onSave || (() => {}),
      description: 'Salvar',
    },
    {
      key: 'f',
      ctrl: true,
      action: actions.onSearch || (() => {}),
      description: 'Buscar',
    },
    {
      key: 'n',
      ctrl: true,
      action: actions.onAdd || (() => {}),
      description: 'Novo item',
    },
    {
      key: 'p',
      ctrl: true,
      action: actions.onPresent || (() => {}),
      description: 'Apresentar',
    },
    {
      key: 'Escape',
      action: actions.onBack || (() => {}),
      description: 'Voltar/Fechar',
    },
    {
      key: ',',
      ctrl: true,
      action: actions.onSettings || (() => {}),
      description: 'Configurações',
    },
    {
      key: 'e',
      ctrl: true,
      shift: true,
      action: actions.onExport || (() => {}),
      description: 'Exportar',
    },
  ].filter(s => s.action);

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}
