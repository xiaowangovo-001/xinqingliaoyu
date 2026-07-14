// ============================================================
// 知心 (ZhiXin) — Browser-side DeepSeek API Client
// Calls DeepSeek directly from the browser. Used for GitHub Pages
// static deployment where server-side API routes are unavailable.
// ============================================================

import { DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL } from './api-key';

const API_KEY = DEEPSEEK_API_KEY;
const BASE_URL = DEEPSEEK_BASE_URL;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onDone: (fullContent: string) => void;
  onError: (error: Error) => void;
}

export async function streamChat(
  messages: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-pro',
        messages,
        stream: true,
        temperature: 0.8,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API error ${response.status}: ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            callbacks.onDone(fullContent);
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              callbacks.onChunk(content);
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }

    callbacks.onDone(fullContent);
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
}
