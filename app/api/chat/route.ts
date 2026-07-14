import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAIClient } from '@/lib/ai/client';
import { getSystemPrompt } from '@/lib/ai/prompts';
import { analyzeEmotion } from '@/lib/ai/emotion-analyzer';
import { extractMemory } from '@/lib/ai/memory-extractor';
import { saveMessage, getRecentMessages } from '@/lib/db/messages';
import { createConversation } from '@/lib/db/conversations';
import { getRelevantMemories, saveMemoryEntry } from '@/lib/db/memory';
import { upsertDailyMood } from '@/lib/db/moods';
import { checkAndCreateMilestone } from '@/lib/db/milestones';
import type { WisemanType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const { message, conversationId, wisemanType } = await request.json() as {
      message: string; conversationId: string | null; wisemanType: WisemanType;
    };
    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Get or create conversation
    let convId = conversationId;
    if (!convId) {
      const conv = await createConversation(user.id, wisemanType || 'default');
      convId = conv.id;
    }

    // Save user message
    await saveMessage({ conversationId: convId, role: 'user', content: message });

    // Get memory context
    const memories = await getRelevantMemories(user.id, [], null, 5);
    const memoryCtx = memories.length > 0
      ? '\n## 关于这个用户的过去\n' + memories.map(m => `- ${m.summary}`).join('\n')
      : '';

    // Build messages for AI
    const systemPrompt = getSystemPrompt(wisemanType || 'default') + memoryCtx;
    const recentMsgs = await getRecentMessages(convId, 20);
    const aiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...recentMsgs.map(m => ({ role: m.role as 'user'|'assistant', content: m.content })),
    ];

    // Stream
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const client = getAIClient();
          await client.streamChat(aiMessages, {
            onChunk(chunk: string) {
              fullResponse += chunk;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`));
            },
            onDone() {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', conversationId: convId, messageId: crypto.randomUUID() })}\n\n`));
              controller.close();
            },
            onError(err: Error) {
              console.error('Stream error:', err);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'AI response failed' })}\n\n`));
              controller.close();
            },
          });
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Internal error' })}\n\n`));
          controller.close();
        }
      },
    });

    // Post-processing (fire and forget)
    (async () => {
      try {
        await new Promise(r => setTimeout(r, 1000));
        await saveMessage({ conversationId: convId, role: 'assistant', content: fullResponse });
        const em = await analyzeEmotion(message);
        if (em) await upsertDailyMood({ userId: user.id, moodScore: 11 - em.intensity, emotionTags: [em.primaryEmotion, ...em.secondaryEmotions] });
        const mem = await extractMemory(message, fullResponse);
        if (mem && mem.significance >= 2) await saveMemoryEntry({ userId: user.id, ...mem, sourceConversationId: convId });
        await checkAndCreateMilestone(user.id, 'first_chat', '第一次对话', '你迈出了自我探索的第一步');
      } catch (e) { console.error('Post-processing error:', e); }
    })().catch(console.error);

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', 'X-Conversation-Id': convId },
    });
  } catch (e) {
    console.error('Chat API error:', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
