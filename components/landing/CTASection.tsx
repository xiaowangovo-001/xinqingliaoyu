'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  const router = useRouter();

  return (
    <section className="py-24 px-4 bg-[var(--muted)]">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-[var(--foreground)]">
          准备好开始了吗？
        </h2>
        <p className="mt-4 text-lg text-[var(--muted-foreground)] leading-relaxed">
          不需要完美的心情，不需要华丽的言语。
          <br />
          你只需要带着自己，来到这里。
        </p>
        <div className="mt-8">
          <Button size="lg" onClick={() => router.push('/login')} className="min-w-44">
            免费开始
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <p className="mt-4 text-xs text-[var(--muted-foreground)]">
          无需下载，浏览器中即可使用
        </p>
      </div>
    </section>
  );
}
