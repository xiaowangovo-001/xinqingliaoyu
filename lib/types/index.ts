// ============================================================
// 知心 (ZhiXin) — Shared TypeScript type definitions
// ============================================================

export type WisemanType = 'default' | 'sushi' | 'wangyangming' | 'socrates';

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  emotionTags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  wisemanType: WisemanType;
  title: string | null;
  status: 'active' | 'archived';
  updatedAt: string;
  preview?: string;
}

export interface MemoryEntry {
  id: string;
  userId: string;
  summary: string;
  keywords: string[];
  emotion: string | null;
  significance: number;
  sourceConversationId: string | null;
  createdAt: string;
}

export interface DailyMood {
  id: string;
  userId: string;
  date: string;
  moodScore: number;
  emotionTags: string[];
  note?: string;
}

export interface Milestone {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  milestoneType: 'streak' | 'mood_improvement' | 'insight' | 'first_chat' | 'custom';
  date: string;
}

export interface DashboardData {
  moodData: DailyMood[];
  milestones: Milestone[];
  stats: DashboardStats;
  monthlyReview: MonthlyReview | null;
}

export interface DashboardStats {
  totalConversations: number;
  currentStreak: number;
  averageMood: number;
  topEmotion: string;
  moodTrend: 'improving' | 'stable' | 'declining';
}

export interface MonthlyReview {
  yearMonth: string;
  content: string;
  generatedAt: string;
}

export interface EmotionAnalysis {
  primaryEmotion: string;
  secondaryEmotions: string[];
  intensity: number;
  keywords: string[];
  cognitivePattern?: string;
  interventionStrategy?: string;
}

export interface WisemanPersona {
  id: WisemanType;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  triggerKeywords: string[];
  introMessage: string;
}
