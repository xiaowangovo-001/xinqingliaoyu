'use client';

import { cn } from '@/lib/utils/cn';
import { PERSONA_META } from '@/lib/ai/prompts';
import type { WisemanType } from '@/lib/types';

interface TypingIndicatorProps {
  wisemanType: WisemanType;
  text: string;
}

export function TypingIndicator({ wisemanType, text }: TypingIndicatorProps) {
  const persona = PERSONA_META[wisemanType];

  return (
    <div className="flex gap-3 animate-fade-in-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center">
        <span className="text-base">{persona?.icon || '💌'}</span>
      </div>
      <div>
        <div className="text-xs text-[var(--muted-foreground)] mb-1 px-1">
          {persona?.name || '知心'}
        </div>
        <div className="rounded-2xl rounded-tl-md px-4 py-2.5 bg-[var(--card)] border border-[var(--border)] shadow-sm">
          {text ? (
            <p className="text-sm leading-relaxed text-[var(--foreground)]">
              {text}
              <span className="inline-block w-1.5 h-4 bg-[var(--warm)] ml-0.5 animate-pulse rounded-sm" />
            </p>
          ) : (
            <div className="flex gap-1.5 py-1">
              <span className="typing-dot w-2 h-2 rounded-full bg-[var(--muted-foreground)]" />
              <span className="typing-dot w-2 h-2 rounded-full bg-[var(--muted-foreground)]" />
              <span className="typing-dot w-2 h-2 rounded-full bg-[var(--muted-foreground)]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
