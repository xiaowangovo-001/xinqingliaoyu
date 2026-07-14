// ============================================================
// 知心 (ZhiXin) — Memory Extraction Engine
// ============================================================

import { getAIClient } from './client';
import { MEMORY_EXTRACTION_PROMPT } from './prompts';

interface MemoryExtractionResult {
  summary: string;
  keywords: string[];
  emotion: string | null;
  significance: number;
}

export async function extractMemory(
  userMessage: string,
  assistantResponse: string
): Promise<MemoryExtractionResult | null> {
  try {
    const client = getAIClient();
    const conversationText = `用户：${userMessage}\n\nAI：${assistantResponse}`;

    const response = await client.complete(
      [
        { role: 'system', content: MEMORY_EXTRACTION_PROMPT },
        { role: 'user', content: `请从以下对话中提取值得记忆的信息：\n\n${conversationText}` },
      ],
      { temperature: 0.1, maxTokens: 512 }
    );

    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    const result = JSON.parse(jsonStr);
    return {
      summary: result.summary || '',
      keywords: result.keywords || [],
      emotion: result.emotion || null,
      significance: Math.min(5, Math.max(1, result.significance || 3)),
    };
  } catch (error) {
    console.error('Memory extraction failed:', error);
    return null;
  }
}
