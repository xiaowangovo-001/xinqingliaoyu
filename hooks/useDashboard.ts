'use client';

import { useState, useEffect } from 'react';
import type { DashboardData } from '@/lib/types';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    try {
      const moods = JSON.parse(localStorage.getItem('zhixin_moods') || '[]');
      const milestones = JSON.parse(localStorage.getItem('zhixin_milestones') || '[]');
      const conversations = JSON.parse(localStorage.getItem('zhixin_conversations') || '[]');

      const moodData = moods.map((m: Record<string, unknown>) => ({
        id: m.id, userId: m.user_id, date: m.date as string,
        moodScore: m.mood_score as number, emotionTags: (m.emotion_tags as string[]) || [],
      }));

      const scores = moodData.map((m: { moodScore: number }) => m.moodScore);
      const avgMood = scores.length ? Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10 : 0;

      const ec: Record<string, number> = {};
      moodData.forEach((m: { emotionTags: string[] }) => m.emotionTags?.forEach((t: string) => { ec[t] = (ec[t] || 0) + 1; }));
      const topEmotion = Object.entries(ec).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

      let streak = 0;
      if (moodData.length) {
        const dates = moodData.map((m: { date: string }) => m.date).sort().reverse();
        const t = new Date().toISOString().split('T')[0];
        const y = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (dates[0] === t || dates[0] === y) { streak = 1; for (let i = 1; i < dates.length; i++) { if ((new Date(dates[i-1]).getTime() - new Date(dates[i]).getTime()) / 86400000 === 1) streak++; else break; } }
      }

      const h = Math.floor(scores.length / 2);
      const f = scores.slice(0, h), s = scores.slice(h);
      const fa = f.length ? f.reduce((a: number, b: number) => a + b, 0) / f.length : 0;
      const sa = s.length ? s.reduce((a: number, b: number) => a + b, 0) / s.length : 0;
      const trend = sa > fa ? 'improving' : sa < fa ? 'declining' : 'stable';

      setData({
        moodData,
        milestones: milestones.map((m: Record<string, unknown>) => ({
          id: m.id, userId: m.user_id, title: m.title, description: m.description,
          milestoneType: m.milestone_type, date: m.date,
        })),
        stats: { totalConversations: conversations.length, currentStreak: streak, averageMood: avgMood, topEmotion, moodTrend: trend as 'improving'|'stable'|'declining' },
        monthlyReview: null,
      });
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);
  return { data, loading, error: '', refetch: fetchDashboard };
}
