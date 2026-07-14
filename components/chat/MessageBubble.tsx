'use client';

import { cn } from '@/lib/utils/cn';
import { PERSONA_META } from '@/lib/ai/prompts';
import type { Message, WisemanType } from '@/lib/types';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  wisemanType: WisemanType;
}

export function MessageBubble({ message, wisemanType }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const persona = PERSONA_META[wisemanType];

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in-up',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
          isUser
            ? 'bg-[var(--primary)] text-white'
            : 'bg-[var(--accent)] text-[var(--foreground)]'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <span className="text-base">{persona?.icon || '💌'}</span>
        )}
      </div>

      {/* Content */}
      <div className={cn('max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        {/* Sender name */}
        <div
          className={cn(
            'text-xs text-[var(--muted-foreground)] mb-1 px-1',
            isUser && 'text-right'
          )}
        >
          {isUser ? '你' : persona?.name || '知心'}
        </div>

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-[var(--primary)] text-[var(--primary-foreground)] rounded-tr-md'
              : 'bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded-tl-md shadow-sm'
          )}
        >
          {/* Render newlines as paragraphs */}
          {message.content.split('\n').map((line, i) =>
            line === '' ? (
              <br key={i} />
            ) : (
              <p key={i} className={i > 0 ? 'mt-1' : ''}>
                {line}
              </p>
            )
          )}
        </div>

        {/* Emotion tags for user messages */}
        {isUser && message.emotionTags && message.emotionTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 justify-end">
            {message.emotionTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={cn(
            'text-xs text-[var(--muted-foreground)] mt-1 px-1',
            isUser && 'text-right'
          )}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
