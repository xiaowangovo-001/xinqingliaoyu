'use client';

import { useCallback } from 'react';
import { useChatStore } from '@/store/chat';
import { streamChat } from '@/lib/ai/browser-client';
import { getSystemPrompt } from '@/lib/ai/prompts';
import type { WisemanType } from '@/lib/types';

function getUser() {
  try { const r = localStorage.getItem('zhixin_user'); return r ? JSON.parse(r) : null; } catch { return null; }
}

function saveConversationMeta(convId: string, wisemanType: WisemanType, title: string, messageCount: number) {
  try {
    const convs = JSON.parse(localStorage.getItem('zhixin_conversations') || '[]');
    // Update existing or add new
    const existing = convs.findIndex((c: { id: string }) => c.id === convId);
    const entry = {
      id: convId,
      wiseman_type: wisemanType,
      title: title.slice(0, 50),
      updated_at: new Date().toISOString(),
      messageCount,
    };
    if (existing >= 0) {
      convs[existing] = entry;
    } else {
      convs.unshift(entry);
    }
    // Keep last 200 conversations
    localStorage.setItem('zhixin_conversations', JSON.stringify(convs.slice(0, 200)));
    // Notify sidebar to refresh
    window.dispatchEvent(new Event('zhixin:conv-updated'));
  } catch { /* ignore */ }
}

export function useChat() {
  const store = useChatStore();

  const sendMessage = useCallback(async (content: string, wisemanType: WisemanType) => {
    const user = getUser();
    const convId = store.conversationId || crypto.randomUUID();
    const userMsgId = crypto.randomUUID();

    store.addMessage({
      id: userMsgId, conversationId: convId,
      role: 'user', content, createdAt: new Date().toISOString(),
    });

    // If this is a new conversation, set its ID now
    if (!store.conversationId) {
      store.setConversationId(convId);
    }

    store.startStreaming();

    // Build messages for AI
    const systemPrompt = getSystemPrompt(wisemanType || 'default');
    const aiMessages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content },
    ];

    await streamChat(aiMessages, {
      onChunk(chunk: string) {
        store.appendStreamChunk(chunk);
      },
      onDone(fullResponse: string) {
        const msgId = crypto.randomUUID();

        // Save conversation metadata to localStorage
        const msgCount = store.messages.length + 1; // +1 for the assistant message about to be added
        saveConversationMeta(convId, wisemanType, content, msgCount);

        // Track mood
        if (user) {
          try {
            const moods = JSON.parse(localStorage.getItem('zhixin_moods') || '[]');
            const today = new Date().toISOString().split('T')[0];
            moods.push({ id: crypto.randomUUID(), user_id: user.id, date: today, mood_score: 6, emotion_tags: [wisemanType] });
            localStorage.setItem('zhixin_moods', JSON.stringify(moods));

            // First chat milestone
            const milestones = JSON.parse(localStorage.getItem('zhixin_milestones') || '[]');
            if (!milestones.find((m: Record<string, unknown>) => m.milestone_type === 'first_chat')) {
              milestones.push({ id: crypto.randomUUID(), user_id: user.id, title: '第一次对话', description: '你迈出了自我探索的第一步', milestone_type: 'first_chat', date: today });
              localStorage.setItem('zhixin_milestones', JSON.stringify(milestones));
            }
          } catch { /* ignore */ }
        }

        store.finalizeStream(msgId, convId);
      },
      onError(err: Error) {
        console.error('DeepSeek error:', err);
        store.appendStreamChunk('\n\n[抱歉，回复生成失败了。请稍后再试。]');
        store.finalizeStream(crypto.randomUUID(), convId);
      },
    });
  }, [store]);

  return { sendMessage };
}
