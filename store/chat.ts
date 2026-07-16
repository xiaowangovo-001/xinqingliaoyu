// ============================================================
// 知心 (ZhiXin) — Chat State (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Message, WisemanType } from '@/lib/types';

const MSG_STORE_PREFIX = 'zhixin_msgs_';

// localStorage helpers for message persistence
function saveMessagesToStorage(convId: string, messages: Message[]): void {
  try {
    localStorage.setItem(MSG_STORE_PREFIX + convId, JSON.stringify(messages));
  } catch { /* quota exceeded – silently skip */ }
}

function loadMessagesFromStorage(convId: string): Message[] {
  try {
    const raw = localStorage.getItem(MSG_STORE_PREFIX + convId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function removeMessagesFromStorage(convId: string): void {
  try {
    localStorage.removeItem(MSG_STORE_PREFIX + convId);
  } catch { /* ignore */ }
}

interface ChatState {
  // Current conversation
  conversationId: string | null;
  messages: Message[];
  wisemanType: WisemanType;

  // Streaming state
  isStreaming: boolean;
  streamBuffer: string;

  // Actions
  setConversationId: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setWisemanType: (type: WisemanType) => void;
  startStreaming: () => void;
  appendStreamChunk: (chunk: string) => void;
  finalizeStream: (messageId: string, conversationId?: string) => void;
  resetChat: () => void;

  // Persistence & history
  persistMessages: () => void;
  restoreLastSession: () => string | null;
  loadConversation: (convId: string, msgs: Message[], wisemanType: WisemanType) => void;
  deleteConversation: (convId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversationId: null,
  messages: [],
  wisemanType: 'default',
  isStreaming: false,
  streamBuffer: '',

  setConversationId: (id) => set({ conversationId: id }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setWisemanType: (type) => {
    // Persist current conversation before resetting
    const { conversationId, messages } = get();
    if (conversationId && messages.length > 0) {
      saveMessagesToStorage(conversationId, messages);
    }
    set({
      wisemanType: type,
      conversationId: null,
      messages: [],
      streamBuffer: '',
    });
  },

  startStreaming: () =>
    set({
      isStreaming: true,
      streamBuffer: '',
    }),

  appendStreamChunk: (chunk) =>
    set((state) => ({
      streamBuffer: state.streamBuffer + chunk,
    })),

  finalizeStream: (messageId, conversationId) =>
    set((state) => {
      const convId = conversationId || state.conversationId || '';
      const assistantMessage: Message = {
        id: messageId,
        conversationId: convId,
        role: 'assistant',
        content: state.streamBuffer,
        createdAt: new Date().toISOString(),
      };
      const newMessages = [...state.messages, assistantMessage];
      // Auto-persist after stream completes
      saveMessagesToStorage(convId, newMessages);
      try { localStorage.setItem('zhixin_active_conv', convId); } catch { /* ignore */ }
      return {
        isStreaming: false,
        streamBuffer: '',
        messages: newMessages,
        conversationId: convId,
      };
    }),

  resetChat: () => {
    const { conversationId, messages } = get();
    // Save current before resetting
    if (conversationId && messages.length > 0) {
      saveMessagesToStorage(conversationId, messages);
    }
    set({
      conversationId: null,
      messages: [],
      streamBuffer: '',
      isStreaming: false,
    });
  },

  // ---- persistence & history ----

  persistMessages: () => {
    const { conversationId, messages } = get();
    if (conversationId && messages.length > 0) {
      saveMessagesToStorage(conversationId, messages);
      // Remember which conversation is active
      try {
        localStorage.setItem('zhixin_active_conv', conversationId);
      } catch { /* ignore */ }
    }
  },

  /** Try to restore the last active conversation from localStorage */
  restoreLastSession: () => {
    try {
      const activeConvId = localStorage.getItem('zhixin_active_conv');
      if (!activeConvId) return null;
      const msgs = loadMessagesFromStorage(activeConvId);
      if (msgs.length === 0) return null;
      // Get wisemanType from conv metadata
      const convs = JSON.parse(localStorage.getItem('zhixin_conversations') || '[]');
      const conv = convs.find((c: { id: string }) => c.id === activeConvId);
      get().loadConversation(activeConvId, msgs, (conv?.wiseman_type as WisemanType) || 'default');
      return activeConvId;
    } catch {
      return null;
    }
  },

  loadConversation: (convId, msgs, wisemanType) => {
    // Save current conversation first
    const { conversationId, messages } = get();
    if (conversationId && conversationId !== convId && messages.length > 0) {
      saveMessagesToStorage(conversationId, messages);
    }
    try { localStorage.setItem('zhixin_active_conv', convId); } catch { /* ignore */ }
    set({
      conversationId: convId,
      messages: msgs,
      wisemanType,
      isStreaming: false,
      streamBuffer: '',
    });
  },

  deleteConversation: (convId) => {
    removeMessagesFromStorage(convId);
    // Update conversation list in localStorage
    try {
      const convs = JSON.parse(localStorage.getItem('zhixin_conversations') || '[]');
      const filtered = convs.filter((c: { id: string }) => c.id !== convId);
      localStorage.setItem('zhixin_conversations', JSON.stringify(filtered));
    } catch { /* ignore */ }
    // If currently viewing this conversation, reset
    if (get().conversationId === convId) {
      set({
        conversationId: null,
        messages: [],
        streamBuffer: '',
        isStreaming: false,
      });
    }
  },
}));
