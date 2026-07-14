import { NextRequest } from 'next/server';
import { getAIClient } from '@/lib/ai/client';
import { getSystemPrompt } from '@/lib/ai/prompts';
import type { WisemanType } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { message, wisemanType } = await request.json() as {
      message: string; wisemanType: WisemanType;
    };

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Message required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = getSystemPrompt(wisemanType || 'default');
    const aiMessages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: message },
    ];

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
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', conversationId: 'local', messageId: crypto.randomUUID(), fullResponse })}\n\n`));
              controller.close();
            },
            onError(err: Error) {
              console.error('Stream error:', err);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'AI error' })}\n\n`));
              controller.close();
            },
          });
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Internal error' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
    });
  } catch (e) {
    console.error('Chat API error:', e);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
