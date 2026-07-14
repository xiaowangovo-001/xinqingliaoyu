'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const QUICK_EMOTIONS = [
  { emoji: '😰', label: '焦虑' },
  { emoji: '😔', label: '低落' },
  { emoji: '😤', label: '委屈' },
  { emoji: '🤔', label: '迷茫' },
  { emoji: '😴', label: '疲惫' },
];

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 150) + 'px';
    }
  }, [input]);

  return (
    <div className="border-t border-[var(--border)] bg-[var(--background)] p-4">
      {/* Quick emotion select */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {QUICK_EMOTIONS.map(({ emoji, label }) => (
          <button
            key={label}
            onClick={() => setInput((prev) => prev + ` ${emoji}`)}
            disabled={disabled}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[var(--accent)] hover:bg-[var(--border)] text-xs transition-colors"
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="说说你的感受..."
          rows={1}
          disabled={disabled}
          className={cn(
            'flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm',
            'placeholder:text-[var(--muted-foreground)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--warm)] focus:border-transparent',
            'disabled:opacity-50'
          )}
        />

        <button
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all',
            input.trim() && !disabled
              ? 'bg-[var(--primary)] text-white hover:opacity-90 shadow-sm'
              : 'bg-[var(--accent)] text-[var(--muted-foreground)] cursor-not-allowed'
          )}
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-xs text-[var(--muted-foreground)] mt-2 text-center">
        按 Enter 发送，Shift + Enter 换行
      </p>
    </div>
  );
}
