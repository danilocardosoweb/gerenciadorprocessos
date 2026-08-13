import React from 'react';
import { Sun, Moon, Monitor, type LucideIcon } from 'lucide-react';
import { Theme } from '../hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
}

export function ThemeToggle({ theme, resolvedTheme, setTheme }: ThemeToggleProps) {
  const options: { value: Theme; label: string; icon: LucideIcon }[] = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor },
  ];

  return (
    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = theme === option.value;
        const isResolved = resolvedTheme === (option.value === 'system' ? (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : option.value);

        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={option.label}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
