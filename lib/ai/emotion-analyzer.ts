// ============================================================
// 知心 (ZhiXin) — Emotion Analysis Engine
// ============================================================

import { getAIClient } from './client';
import { EMOTION_ANALYSIS_PROMPT } from './prompts';
import type { EmotionAnalysis } from '@/lib/types';

export async function analyzeEmotion(userMessage: string): Promise<EmotionAnalysis | null> {
  try {
    const client = getAIClient();
    const response = await client.complete(
      [
        { role: 'system', content: EMOTION_ANALYSIS_PROMPT },
        { role: 'user', content: `请分析以下文本的情绪：\n\n${userMessage}` },
      ],
      { temperature: 0.1, maxTokens: 512 }
    );

    // Parse JSON from response (handle markdown code fences)
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
      primaryEmotion: result.primaryEmotion || '平静',
      secondaryEmotions: result.secondaryEmotions || [],
      intensity: Math.min(10, Math.max(1, result.intensity || 5)),
      keywords: result.keywords || [],
      cognitivePattern: result.cognitivePattern || undefined,
      interventionStrategy: result.needSummary || undefined,
    };
  } catch (error) {
    console.error('Emotion analysis failed:', error);
    return null;
  }
}
