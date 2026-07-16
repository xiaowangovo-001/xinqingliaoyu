'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useChatStore } from '@/store/chat';
import { cn } from '@/lib/utils/cn';
import { MessageCircle, BarChart3, PlusCircle, X, Sun, Trash2 } from 'lucide-react';
import type { Message, WisemanType } from '@/lib/types';

interface SidebarProps { open: boolean; onClose: () => void; }

interface ConvItem { id: string; wiseman_type: string; title: string | null; updated_at: string; messageCount?: number; }

const MSG_STORE_PREFIX = 'zhixin_msgs_';

function loadMessagesForConv(convId: string): Message[] {
  try {
    const raw = localStorage.getItem(MSG_STORE_PREFIX + convId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [convs, setConvs] = useState<ConvItem[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  const loadConversation = useChatStore((s) => s.loadConversation);
  const deleteConversation = useChatStore((s) => s.deleteConversation);
  const currentConvId = useChatStore((s) => s.conversationId);

  const refreshConvs = useCallback(() => {
    try {
      const raw = localStorage.getItem('zhixin_conversations');
      if (raw) {
        const parsed = JSON.parse(raw);
        // Sort by updated_at descending
        parsed.sort((a: ConvItem, b: ConvItem) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setConvs(parsed);
      } else {
        setConvs([]);
      }
    } catch { setConvs([]); }
  }, []);

  useEffect(() => {
    refreshConvs();
    // Listen for conversation updates from other components (same tab)
    const handler = () => refreshConvs();
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'zhixin_conversations') refreshConvs();
    };
    window.addEventListener('zhixin:conv-updated', handler);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('zhixin:conv-updated', handler);
      window.removeEventListener('storage', storageHandler);
    };
  }, [pathname, refreshConvs]);

  const handleNewChat = () => {
    // Save current conversation before starting new
    useChatStore.getState().resetChat();
    router.push('/chat');
    onClose();
  };

  const handleSelectConv = (conv: ConvItem) => {
    const msgs = loadMessagesForConv(conv.id);
    loadConversation(conv.id, msgs, (conv.wiseman_type as WisemanType) || 'default');
    router.push('/chat');
    onClose();
  };

  const handleDeleteConv = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    deleteConversation(convId);
    refreshConvs();
  };

  const labels: Record<string, string> = {
    default: '💌',
    sushi: '🍃',
    wangyangming: '🌄',
    socrates: '🏛️',
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed md:sticky top-0 left-0 z-50 h-full w-64 bg-[var(--card)] border-r border-[var(--border)] transform transition-transform duration-200 md:translate-x-0 flex flex-col',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <a href="/chat" className="flex items-center gap-2 text-lg font-semibold text-[var(--foreground)]">
            <Sun className="w-5 h-5 text-[var(--warm)]" />知心
          </a>
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-[var(--accent)]">
            <X className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* New chat button */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--border)] text-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />新对话
          </button>
        </div>

        {/* Nav links */}
        <nav className="px-3 pb-2">
          <button
            onClick={() => { router.push('/chat'); onClose(); }}
            className={cn(
              'flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-colors',
              pathname.startsWith('/chat')
                ? 'bg-[var(--accent)] font-medium'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
            )}
          >
            <MessageCircle className="w-4 h-4" />对话
          </button>
          <button
            onClick={() => { router.push('/dashboard'); onClose(); }}
            className={cn(
              'flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm transition-colors',
              pathname.startsWith('/dashboard')
                ? 'bg-[var(--accent)] font-medium'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
            )}
          >
            <BarChart3 className="w-4 h-4" />成长轨迹
          </button>
        </nav>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-3">
          <p className="px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
            最近对话
          </p>
          {convs.length === 0 ? (
            <p className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
              还没有对话记录
            </p>
          ) : (
            convs.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectConv(c)}
                className={cn(
                  'group flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-left transition-colors',
                  currentConvId === c.id
                    ? 'bg-[var(--accent)] text-[var(--foreground)] font-medium'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                )}
              >
                <span className="flex-shrink-0">{labels[c.wiseman_type] || '💌'}</span>
                <span className="truncate flex-1">{c.title || '新对话'}</span>
                <span className="text-xs text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity">
                  {c.messageCount ? `${c.messageCount}条` : ''}
                </span>
                <button
                  onClick={(e) => handleDeleteConv(e, c.id)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--border)] transition-opacity flex-shrink-0"
                  title="删除对话"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                </button>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
