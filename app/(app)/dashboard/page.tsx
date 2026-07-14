'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { Card } from '@/components/ui/Card';
import {
  MessageCircle,
  Flame,
  Smile,
  TrendingUp,
  Loader2,
  CalendarDays,
  Star,
  Heart,
} from 'lucide-react';

export default function DashboardPage() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[var(--warm)] animate-spin mx-auto" />
          <p className="text-sm text-[var(--muted-foreground)] mt-3">加载成长数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-[var(--muted-foreground)]">暂时无法加载数据</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  if (!stats || stats.totalConversations === 0) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🌱</div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            你的成长轨迹将从这里开始
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            完成第一次对话后，知心将在这里为你记录情绪变化、成长里程碑和月度回顾。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">成长轨迹</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<MessageCircle className="w-5 h-5" />}
            label="总对话次数"
            value={String(stats.totalConversations)}
            color="var(--warm)"
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="连续天数"
            value={`${stats.currentStreak} 天`}
            color="orange"
          />
          <StatCard
            icon={<Smile className="w-5 h-5" />}
            label="平均心情"
            value={`${stats.averageMood}/10`}
            color="var(--calm)"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="情绪趋势"
            value={
              stats.moodTrend === 'improving'
                ? '改善中 ↑'
                : stats.moodTrend === 'declining'
                ? '需关注 ↓'
                : '平稳 →'
            }
            color={
              stats.moodTrend === 'improving'
                ? 'var(--calm)'
                : stats.moodTrend === 'declining'
                ? 'orange'
                : 'var(--muted-foreground)'
            }
          />
        </div>

        {/* Simple emotion summary */}
        {data?.moodData && data.moodData.length > 0 && (
          <Card padding="md">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[var(--warm)]" />
              最近的情绪记录
            </h3>
            <div className="space-y-2">
              {data.moodData.slice(-7).reverse().map((mood) => (
                <div
                  key={mood.date}
                  className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0"
                >
                  <span className="text-xs text-[var(--muted-foreground)] w-20">
                    {formatDate(mood.date)}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-[var(--accent)] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${mood.moodScore * 10}%`,
                          backgroundColor:
                            mood.moodScore >= 7
                              ? 'var(--calm)'
                              : mood.moodScore >= 4
                              ? 'var(--warm)'
                              : '#e88',
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {mood.moodScore}/10
                  </span>
                  <div className="flex gap-1">
                    {mood.emotionTags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Milestones */}
        {data?.milestones && data.milestones.length > 0 && (
          <Card padding="md">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-[var(--warm)]" />
              成长里程碑
            </h3>
            <div className="space-y-3">
              {data.milestones.map((milestone) => (
                <div key={milestone.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--warm)] mt-2" />
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {milestone.title}
                    </p>
                    {milestone.description && (
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        {milestone.description}
                      </p>
                    )}
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {formatDate(milestone.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Monthly review */}
        {data?.monthlyReview && (
          <Card padding="md">
            <h3 className="text-sm font-medium text-[var(--foreground)] mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-[var(--warm)]" />
              本月回顾
            </h3>
            <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-line">
              {data.monthlyReview.content}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card padding="sm" className="text-center">
      <div className="text-[var(--muted-foreground)] mb-2 flex justify-center" style={{ color }}>
        {icon}
      </div>
      <div className="text-xl font-semibold text-[var(--foreground)]">{value}</div>
      <div className="text-xs text-[var(--muted-foreground)] mt-1">{label}</div>
    </Card>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
