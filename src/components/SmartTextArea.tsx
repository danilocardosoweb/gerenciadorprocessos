import React, { createContext, useContext, useMemo, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { getWritingSuggestions } from '../lib/writingSuggestions';

interface SmartTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  value: string;
  onValueChange: (value: string) => void;
  corpus?: string[];
  suggestionsEnabled?: boolean;
}

const WritingSuggestionContext = createContext<{ corpus: string[]; enabled: boolean }>({ corpus: [], enabled: true });

export function WritingSuggestionProvider({ corpus, enabled = true, children }: { corpus: string[]; enabled?: boolean; children: React.ReactNode }) {
  return <WritingSuggestionContext.Provider value={{ corpus, enabled }}>{children}</WritingSuggestionContext.Provider>;
}

export function SmartTextArea({
  value,
  onValueChange,
  corpus,
  suggestionsEnabled = true,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: SmartTextAreaProps) {
  const context = useContext(WritingSuggestionContext);
  const activeCorpus = corpus || context.corpus;
  const isEnabled = suggestionsEnabled && context.enabled;
  const [focused, setFocused] = useState(false);
  const [dismissedValue, setDismissedValue] = useState<string | null>(null);
  const suggestions = useMemo(
    () => isEnabled && focused && dismissedValue !== value ? getWritingSuggestions(value, activeCorpus) : [],
    [isEnabled, focused, dismissedValue, value, activeCorpus],
  );

  const acceptSuggestion = (insertText: string) => {
    onValueChange(`${value}${insertText}`);
    setDismissedValue(null);
  };

  return (
    <div className="relative">
      <textarea
        {...props}
        value={value}
        spellCheck
        autoCapitalize="sentences"
        className={className}
        onChange={(event) => {
          setDismissedValue(null);
          onValueChange(event.target.value);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          window.setTimeout(() => setFocused(false), 120);
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Tab' && suggestions[0]) {
            event.preventDefault();
            acceptSuggestion(suggestions[0].insertText);
            return;
          }
          if (event.key === 'Escape' && suggestions.length) {
            event.preventDefault();
            setDismissedValue(value);
            return;
          }
          onKeyDown?.(event);
        }}
      />

      {suggestions.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2 overflow-x-auto rounded-xl border border-blue-400/25 bg-[#0b1528]/95 p-2 shadow-xl shadow-black/30 backdrop-blur-md">
          <Sparkles size={14} className="shrink-0 text-cyan-300" />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => acceptSuggestion(suggestions[0].insertText)}
            className="min-w-0 flex-1 truncate text-left text-xs text-slate-200"
            title={suggestions[0].value}
          >
            <span className="text-slate-500">Sugestão: </span>{suggestions[0].value}
          </button>
          <kbd className="hidden shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 sm:inline">TAB</kbd>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setDismissedValue(value)}
            className="shrink-0 rounded p-1 text-slate-500 hover:bg-white/10 hover:text-white"
            aria-label="Ocultar sugestão"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {isEnabled && focused && suggestions.length === 0 && value.trim().length > 4 && (
        <span className={cn('pointer-events-none absolute bottom-2.5 right-3 text-[9px] font-medium text-slate-600', props.disabled && 'hidden')}>
          Assistência de escrita ativa
        </span>
      )}
    </div>
  );
}
