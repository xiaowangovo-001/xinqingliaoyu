'use client';

import { useCallback } from 'react';
import { useChatStore } from '@/store/chat';
import { streamChat } from '@/lib/ai/browser-client';
import { getSystemPrompt } from '@/lib/ai/prompts';
import type { WisemanType } from '@/lib/types';

function getUser() {
  try { const r = localStorage.getItem('zhixin_user'); return r ? JSON.parse(r) : null; } catch { return null; }
}

export function useChat() {
  const store = useChatStore();

  const sendMessage = useCallback(async (content: string, wisemanType: WisemanType) => {
    const user = getUser();
    const userMsgId = crypto.randomUUID();
    store.addMessage({
      id: userMsgId, conversationId: store.conversationId || '',
      role: 'user', content, createdAt: new Date().toISOString(),
    });
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
        // Save conversation to localStorage
        const convId = store.conversationId || crypto.randomUUID();
        try {
          const convs = JSON.parse(localStorage.getItem('zhixin_conversations') || '[]');
          convs.unshift({ id: convId, wiseman_type: wisemanType, title: content.slice(0, 20), updated_at: new Date().toISOString() });
          localStorage.setItem('zhixin_conversations', JSON.stringify(convs.slice(0, 50)));

          // Track mood
          if (user) {
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
          }
        } catch {}

        store.finalizeStream(crypto.randomUUID(), convId);
      },
      onError(err: Error) {
        console.error('DeepSeek error:', err);
        store.appendStreamChunk('\n\n[抱歉，回复生成失败了。请稍后再试。]');
        store.finalizeStream(crypto.randomUUID());
      },
    });
  }, [store]);

  return { sendMessage };
}
