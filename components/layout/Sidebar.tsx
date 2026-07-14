'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { MessageCircle, BarChart3, PlusCircle, X, Sun } from 'lucide-react';

interface SidebarProps { open: boolean; onClose: () => void; }

interface ConvItem { id: string; wiseman_type: string; title: string | null; updated_at: string; }

export function Sidebar({ open, onClose }: SidebarProps) {
  const [convs, setConvs] = useState<ConvItem[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('zhixin_conversations');
      if (raw) setConvs(JSON.parse(raw));
    } catch {}
  }, [pathname]);

  const labels: Record<string, string> = { default: '💌', sushi: '🍃', wangyangming: '🌄', socrates: '🏛️' };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={onClose} />}
      <aside className={cn('fixed md:sticky top-0 left-0 z-50 h-full w-64 bg-[var(--card)] border-r border-[var(--border)] transform transition-transform duration-200 md:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <a href="/chat" className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]"><Sun className="w-5 h-5 text-[var(--warm)]" />知心</a>
            <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-[var(--accent)]"><X className="w-4 h-4 text-[var(--muted-foreground)]" /></button>
          </div>
          <div className="p-3">
            <button onClick={() => { router.push('/chat'); onClose(); }} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--border)] text-sm font-medium"><PlusCircle className="w-4 h-4" />新对话</button>
          </div>
          <nav className="px-3 pb-2">
            <button onClick={() => { router.push('/chat'); onClose(); }} className={cn('flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm', pathname.startsWith('/chat') ? 'bg-[var(--accent)] font-medium' : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]')}><MessageCircle className="w-4 h-4" />对话</button>
            <button onClick={() => { router.push('/dashboard'); onClose(); }} className={cn('flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm', pathname.startsWith('/dashboard') ? 'bg-[var(--accent)] font-medium' : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]')}><BarChart3 className="w-4 h-4" />成长轨迹</button>
          </nav>
          <div className="flex-1 overflow-y-auto px-3">
            <p className="px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">最近对话</p>
            {convs.length === 0 ? <p className="px-4 py-3 text-xs text-[var(--muted-foreground)]">还没有对话记录</p> : convs.map(c => (
              <button key={c.id} onClick={() => { router.push('/chat'); onClose(); }} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-left text-[var(--muted-foreground)] hover:bg-[var(--accent)]">
                <span>{labels[c.wiseman_type] || '💌'}</span><span className="truncate">{c.title || '新对话'}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
