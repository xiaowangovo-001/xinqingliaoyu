'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Sun, Moon, Wind } from 'lucide-react';

export function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--warm)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--calm)]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        {/* Tagline badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-sm mb-8">
          <Sun className="w-4 h-4 text-[var(--warm)]" />
          一个记得你、理解你的AI情绪陪伴者
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[var(--foreground)] leading-tight tracking-tight">
          你的每一份情绪
          <br />
          <span className="text-[var(--warm)]">都值得被认真对待</span>
        </h1>

        <p className="mt-6 text-lg text-[var(--muted-foreground)] max-w-xl mx-auto leading-relaxed">
          知心是一个AI情绪陪伴工具。它记得你的过去，理解你的现在，
          <br className="hidden sm:block" />
          还能在你需要时，请来千年智者——苏轼、王阳明、苏格拉底——与你对话。
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={() => router.push('/login')} className="min-w-40">
            开始探索
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
            已有账号？登录
          </Button>
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <div className="p-2 rounded-xl bg-[var(--warm)]/10">
              <Wind className="w-5 h-5 text-[var(--warm)]" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-[var(--foreground)]">情绪分析</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                洞察表面情绪之下的核心需求
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <div className="p-2 rounded-xl bg-[var(--calm)]/10">
              <Sun className="w-5 h-5 text-[var(--calm)]" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-[var(--foreground)]">长期记忆</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                它记得你的成长轨迹和每一次转折
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <div className="p-2 rounded-xl bg-purple-50">
              <Moon className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-[var(--foreground)]">千年智者</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                苏轼的豁达、王阳明的内省、苏格拉底的诘问
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
