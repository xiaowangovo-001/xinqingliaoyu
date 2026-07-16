'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chat';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import { WisemanSelector } from '@/components/chat/WisemanSelector';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { useChat } from '@/hooks/useChat';
import type { WisemanType } from '@/lib/types';
import { PERSONA_META } from '@/lib/ai/prompts';
import { Sparkles } from 'lucide-react';

export function ChatInterface() {
  const messages = useChatStore((s) => s.messages);
  const wisemanType = useChatStore((s) => s.wisemanType);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamBuffer = useChatStore((s) => s.streamBuffer);
  const setWisemanType = useChatStore((s) => s.setWisemanType);
  const restoreLastSession = useChatStore((s) => s.restoreLastSession);
  const { sendMessage } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-restore last session on mount if no messages loaded
  const didRestore = useRef(false);
  useEffect(() => {
    if (!didRestore.current && messages.length === 0) {
      didRestore.current = true;
      restoreLastSession();
    }
  }, [messages.length, restoreLastSession]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamBuffer]);

  const handleSend = (text: string) => {
    sendMessage(text, wisemanType);
  };

  const handleWisemanChange = (type: WisemanType) => {
    if (isStreaming) return;
    setWisemanType(type);
  };

  const persona = PERSONA_META[wisemanType];

  return (
    <div className="flex flex-col h-full">
      {/* Wiseman selector bar */}
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--card)]/50">
        <WisemanSelector
          selected={wisemanType}
          onSelect={handleWisemanChange}
          disabled={isStreaming}
        />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="text-5xl mb-4">{persona?.icon || '💌'}</div>
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
              {persona?.name || '知心'}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] max-w-sm mb-6">
              {persona?.introMessage || '嗨，我在这里。今天过得怎么样？'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['今天心情有点糟', '我最近很焦虑', '想聊聊未来的方向', '就是想找人说说话'].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSend(suggestion)}
                    disabled={isStreaming}
                    className="px-4 py-2 rounded-full border border-[var(--border)] text-sm text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        ) : (
          /* Message list */
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} wisemanType={wisemanType} />
            ))}

            {/* Streaming message */}
            {isStreaming && (
              <TypingIndicator wisemanType={wisemanType} text={streamBuffer} />
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <MessageInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}
