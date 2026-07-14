'use client';

import { useCallback } from 'react';
import { useChatStore } from '@/store/chat';
import type { WisemanType } from '@/lib/types';

function getUser() {
  try { const r = localStorage.getItem('zhixin_user'); return r ? JSON.parse(r) : null; } catch { return null; }
}

function saveToLocal(key: string, item: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push(item);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {}
}

function upsertMood(mood: { userId: string; moodScore: number; emotionTags: string[] }) {
  try {
    const raw = localStorage.getItem('zhixin_moods');
    const arr: Record<string, unknown>[] = raw ? JSON.parse(raw) : [];
    const today = new Date().toISOString().split('T')[0];
    const idx = arr.findIndex((m) => m.user_id === mood.userId && m.date === today);
    if (idx >= 0) {
      arr[idx].mood_score = Math.round(((arr[idx].mood_score as number) + mood.moodScore) / 2);
    } else {
      arr.push({ id: crypto.randomUUID(), user_id: mood.userId, date: today, mood_score: mood.moodScore, emotion_tags: mood.emotionTags });
    }
    localStorage.setItem('zhixin_moods', JSON.stringify(arr));
  } catch {}
}

export function useChat() {
  const store = useChatStore();

  const sendMessage = useCallback(async (content: string, wisemanType: WisemanType) => {
    const user = getUser();
    const userMsgId = crypto.randomUUID();
    store.addMessage({ id: userMsgId, conversationId: store.conversationId || '', role: 'user', content, createdAt: new Date().toISOString() });
    store.startStreaming();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, conversationId: store.conversationId, wisemanType, userId: user?.id || 'anonymous' }),
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No body');
      const decoder = new TextDecoder();
      let buffer = '';
      let msgId = crypto.randomUUID();
      let newConvId = store.conversationId;
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const d = JSON.parse(line.slice(6));
              if (d.type === 'chunk') { store.appendStreamChunk(d.content); }
              else if (d.type === 'done') { msgId = d.messageId || msgId; newConvId = d.conversationId === 'new' ? null : (d.conversationId || newConvId); fullResponse = d.fullResponse || ''; }
              else if (d.type === 'error') throw new Error(d.message);
            } catch (e) { if (!(e instanceof SyntaxError)) throw e; }
          }
        }
      }

      // Save to localStorage
      const convId = newConvId || crypto.randomUUID();
      const personaLabels: Record<string, string> = { default: '知心', sushi: '苏轼', wangyangming: '王阳明', socrates: '苏格拉底' };

      // Save conversation
      saveToLocal('zhixin_conversations', { id: convId, wiseman_type: wisemanType, title: content.slice(0, 20), updated_at: new Date().toISOString() });

      // Track mood
      if (user) upsertMood({ userId: user.id, moodScore: 6, emotionTags: [personaLabels[wisemanType] || wisemanType] });

      // Check for first milestone
      const milestones = JSON.parse(localStorage.getItem('zhixin_milestones') || '[]');
      if (!milestones.find((m: Record<string, unknown>) => m.milestone_type === 'first_chat')) {
        milestones.push({ id: crypto.randomUUID(), user_id: user?.id || 'anonymous', title: '第一次对话', description: '你迈出了自我探索的第一步', milestone_type: 'first_chat', date: new Date().toISOString().split('T')[0] });
        localStorage.setItem('zhixin_milestones', JSON.stringify(milestones));
      }

      store.finalizeStream(msgId, convId);
    } catch (err) {
      console.error('Chat error:', err);
      store.appendStreamChunk('\n\n[抱歉，回复生成失败了。请稍后再试。]');
      store.finalizeStream(crypto.randomUUID());
    }
  }, [store]);

  return { sendMessage };
}
