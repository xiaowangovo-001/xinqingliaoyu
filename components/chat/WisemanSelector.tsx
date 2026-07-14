'use client';

import { cn } from '@/lib/utils/cn';
import { PERSONA_META } from '@/lib/ai/prompts';
import type { WisemanType } from '@/lib/types';

interface WisemanSelectorProps {
  selected: WisemanType;
  onSelect: (type: WisemanType) => void;
  disabled?: boolean;
}

const WISEMAN_ORDER: WisemanType[] = ['default', 'sushi', 'wangyangming', 'socrates'];

export function WisemanSelector({ selected, onSelect, disabled }: WisemanSelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {WISEMAN_ORDER.map((type) => {
        const meta = PERSONA_META[type];
        const isSelected = selected === type;
        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            disabled={disabled}
            className={cn(
              'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
              isSelected
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-sm'
                : 'bg-[var(--card)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--warm)] hover:text-[var(--foreground)]'
            )}
          >
            <span>{meta.icon}</span>
            <span className="hidden sm:inline">{meta.name.split('·')[0]}</span>
            <span className="sm:hidden">{type === 'default' ? '知心' : meta.name.split('·')[0]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function getWisemanIntro(wisemanType: WisemanType): string {
  return PERSONA_META[wisemanType].introMessage;
}
