'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Menu, LogOut, Sun } from 'lucide-react';

export function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [username, setUsername] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const raw = localStorage.getItem('zhixin_user');
    if (raw) setUsername(JSON.parse(raw).username);
  }, []);

  const title = pathname.startsWith('/chat') ? '对话' : pathname.startsWith('/dashboard') ? '成长轨迹' : '知心';

  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="md:hidden p-2 -ml-2 rounded-xl hover:bg-[var(--accent)]"><Menu className="w-5 h-5 text-[var(--muted-foreground)]" /></button>
          <span className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2"><Sun className="w-5 h-5 text-[var(--warm)]" />{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)] hidden sm:block">{username}</span>
          <Button variant="ghost" size="sm" onClick={() => { localStorage.removeItem('zhixin_user'); router.push('/'); }}><LogOut className="w-4 h-4" /><span className="hidden sm:inline">退出</span></Button>
        </div>
      </div>
    </header>
  );
}
