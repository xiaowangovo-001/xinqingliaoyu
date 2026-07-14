// ============================================================
// 知心 (ZhiXin) — Local Storage Database
// Replaces Supabase with browser localStorage for zero-config setup.
// All data is stored per-user in the browser.
// ============================================================

const DB_PREFIX = 'zhixin_';

// ============================================================
// TYPES (snake_case for storage, matching what components expect)
// ============================================================
export interface StoredConversation {
  id: string;
  user_id: string;
  wiseman_type: string;
  title: string | null;
  status: 'active' | 'archived';
  updated_at: string;
}

export interface StoredMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  emotion_tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface StoredMemory {
  id: string;
  user_id: string;
  summary: string;
  keywords: string[];
  emotion: string | null;
  significance: number;
  source_conversation_id: string | null;
  created_at: string;
}

export interface StoredMood {
  id: string;
  user_id: string;
  date: string;
  mood_score: number;
  emotion_tags: string[];
  note?: string;
}

export interface StoredMilestone {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  milestone_type: string;
  date: string;
}

export interface StoredReview {
  id: string;
  user_id: string;
  year_month: string;
  content: string;
  generated_at: string;
}

// ============================================================
// GENERIC CRUD HELPERS
// ============================================================
function getCollection<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(DB_PREFIX + key);
  return raw ? JSON.parse(raw) : [];
}

function setCollection<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
}

function generateId(): string {
  return crypto.randomUUID();
}

// ============================================================
// AUTH
// ============================================================
const AUTH_KEY = DB_PREFIX + 'current_user';

export function getCurrentUser(): { id: string; username: string } | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function loginUser(username: string): { id: string; username: string } {
  const user = { id: generateId(), username };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function logoutUser(): void {
  localStorage.removeItem(AUTH_KEY);
}

// ============================================================
// CONVERSATIONS
// ============================================================
export function createConversation(userId: string, wisemanType: string): { id: string } {
  const convs = getCollection<StoredConversation>('conversations');
  const id = generateId();
  convs.push({
    id,
    user_id: userId,
    wiseman_type: wisemanType,
    title: null,
    status: 'active',
    updated_at: new Date().toISOString(),
  });
  setCollection('conversations', convs);
  return { id };
}

export function getConversations(userId: string): StoredConversation[] {
  return getCollection<StoredConversation>('conversations')
    .filter((c) => c.user_id === userId && c.status === 'active')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function updateConversationTitle(conversationId: string, title: string): void {
  const convs = getCollection<StoredConversation>('conversations');
  const idx = convs.findIndex((c) => c.id === conversationId);
  if (idx >= 0) {
    convs[idx].title = title;
    convs[idx].updated_at = new Date().toISOString();
    setCollection('conversations', convs);
  }
}

export function touchConversation(conversationId: string): void {
  const convs = getCollection<StoredConversation>('conversations');
  const idx = convs.findIndex((c) => c.id === conversationId);
  if (idx >= 0) {
    convs[idx].updated_at = new Date().toISOString();
    setCollection('conversations', convs);
  }
}

// ============================================================
// MESSAGES
// ============================================================
export function saveMessage(msg: {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  emotionTags?: string[];
  metadata?: Record<string, unknown>;
}): { id: string } {
  const msgs = getCollection<StoredMessage>('messages');
  const id = generateId();
  msgs.push({
    id,
    conversation_id: msg.conversationId,
    role: msg.role,
    content: msg.content,
    emotion_tags: msg.emotionTags || [],
    metadata: msg.metadata || {},
    created_at: new Date().toISOString(),
  });
  setCollection('messages', msgs);
  return { id };
}

export function getRecentMessages(conversationId: string, limit = 20): StoredMessage[] {
  return getCollection<StoredMessage>('messages')
    .filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-limit);
}

// ============================================================
// MEMORY
// ============================================================
export function getRelevantMemories(userId: string, _keywords: string[], _emotion: string | null, limit = 5): StoredMemory[] {
  return getCollection<StoredMemory>('memory')
    .filter((m) => m.user_id === userId && m.significance >= 2)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export function saveMemoryEntry(entry: {
  userId: string;
  summary: string;
  keywords: string[];
  emotion: string | null;
  significance: number;
  sourceConversationId: string | null;
}): void {
  const mems = getCollection<StoredMemory>('memory');
  mems.push({
    id: generateId(),
    user_id: entry.userId,
    summary: entry.summary,
    keywords: entry.keywords,
    emotion: entry.emotion,
    significance: entry.significance,
    source_conversation_id: entry.sourceConversationId,
    created_at: new Date().toISOString(),
  });
  setCollection('memory', mems);
}

// ============================================================
// MOODS
// ============================================================
export function upsertDailyMood(mood: {
  userId: string;
  moodScore: number;
  emotionTags: string[];
  date?: string;
}): void {
  const moods = getCollection<StoredMood>('moods');
  const date = mood.date || new Date().toISOString().split('T')[0];
  const idx = moods.findIndex((m) => m.user_id === mood.userId && m.date === date);
  if (idx >= 0) {
    moods[idx].mood_score = Math.round((moods[idx].mood_score + mood.moodScore) / 2);
    moods[idx].emotion_tags = [...new Set([...moods[idx].emotion_tags, ...mood.emotionTags])];
  } else {
    moods.push({
      id: generateId(),
      user_id: mood.userId,
      date,
      mood_score: mood.moodScore,
      emotion_tags: mood.emotionTags,
    });
  }
  setCollection('moods', moods);
}

export function getMoodHistory(userId: string, days = 30): StoredMood[] {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];
  return getCollection<StoredMood>('moods')
    .filter((m) => m.user_id === userId && m.date >= sinceStr)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================
// MILESTONES
// ============================================================
export function checkAndCreateMilestone(
  userId: string,
  type: string,
  title: string,
  description?: string
): void {
  const milestones = getCollection<StoredMilestone>('milestones');
  const exists = milestones.find((m) => m.user_id === userId && m.milestone_type === type);
  if (exists) return;
  milestones.push({
    id: generateId(),
    user_id: userId,
    title,
    description: description || null,
    milestone_type: type,
    date: new Date().toISOString().split('T')[0],
  });
  setCollection('milestones', milestones);
}

export function getMilestones(userId: string, days = 30): StoredMilestone[] {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split('T')[0];
  return getCollection<StoredMilestone>('milestones')
    .filter((m) => m.user_id === userId && m.date >= sinceStr)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ============================================================
// REVIEWS
// ============================================================
export function getMonthlyReview(userId: string, yearMonth: string): StoredReview | null {
  return getCollection<StoredReview>('reviews').find(
    (r) => r.user_id === userId && r.year_month === yearMonth
  ) || null;
}

export function saveMonthlyReview(userId: string, yearMonth: string, content: string): void {
  const reviews = getCollection<StoredReview>('reviews');
  const idx = reviews.findIndex((r) => r.user_id === userId && r.year_month === yearMonth);
  if (idx >= 0) {
    reviews[idx].content = content;
    reviews[idx].generated_at = new Date().toISOString();
  } else {
    reviews.push({
      id: generateId(),
      user_id: userId,
      year_month: yearMonth,
      content,
      generated_at: new Date().toISOString(),
    });
  }
  setCollection('reviews', reviews);
}

// ============================================================
// COUNT
// ============================================================
export function getConversationCount(userId: string): number {
  return getCollection<StoredConversation>('conversations').filter((c) => c.user_id === userId).length;
}
