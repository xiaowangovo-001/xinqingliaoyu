'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useChatStore } from '@/store/chat';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Loader2 } from 'lucide-react';

const MSG_STORE_PREFIX = 'zhixin_msgs_';

function loadMessagesForConv(convId: string) {
  try {
    const raw = localStorage.getItem(MSG_STORE_PREFIX + convId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const convId = searchParams.get('id');

  const loadConversation = useChatStore((s) => s.loadConversation);
  const currentConvId = useChatStore((s) => s.conversationId);

  useEffect(() => {
    if (convId && convId !== currentConvId) {
      // Load the conversation from localStorage
      const msgs = loadMessagesForConv(convId);
      if (msgs.length > 0) {
        // Determine wisemanType from conversation metadata
        let wisemanType = 'default';
        try {
          const convs = JSON.parse(localStorage.getItem('zhixin_conversations') || '[]');
          const conv = convs.find((c: { id: string }) => c.id === convId);
          if (conv?.wiseman_type) {
            wisemanType = conv.wiseman_type;
          }
        } catch { /* ignore */ }
        loadConversation(convId, msgs, wisemanType as 'default' | 'sushi' | 'wangyangming' | 'socrates');
      }
    }
  }, [convId]); // Only run when URL id changes

  return <ChatInterface />;
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 text-[var(--warm)] animate-spin" />
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
