'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const name = username.trim();
    if (!name) { setError('请输入一个昵称'); return; }
    if (name.length < 2) { setError('昵称至少2个字符'); return; }
    if (name.length > 20) { setError('昵称最多20个字符'); return; }
    localStorage.setItem('zhixin_user', JSON.stringify({ id: crypto.randomUUID(), username: name }));
    router.push('/chat');
  };

  return (
    <Card className="w-full max-w-md mx-auto" padding="lg">
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <div className="text-center">
          <div className="text-5xl mb-4">☀️</div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">欢迎来到知心</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">输入一个昵称，开始你的情绪探索之旅</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">{error}</div>}
        <Input id="username" type="text" label="你的昵称" placeholder="比如：小明、Alice、清风..." value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} autoFocus />
        <Button type="submit" size="lg" className="w-full">开始使用</Button>
        <p className="text-center text-xs text-[var(--muted-foreground)]">无需注册 · 数据保存在浏览器中 · 完全私密</p>
      </form>
    </Card>
  );
}
