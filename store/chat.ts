// ============================================================
// 知心 (ZhiXin) — Chat State (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Message, WisemanType } from '@/lib/types';

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
    // Reset conversation when switching wiseman
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
      const assistantMessage: Message = {
        id: messageId,
        conversationId: conversationId || state.conversationId || '',
        role: 'assistant',
        content: state.streamBuffer,
        createdAt: new Date().toISOString(),
      };
      return {
        isStreaming: false,
        streamBuffer: '',
        messages: [...state.messages, assistantMessage],
        conversationId: conversationId || state.conversationId,
      };
    }),

  resetChat: () =>
    set({
      conversationId: null,
      messages: [],
      streamBuffer: '',
      isStreaming: false,
    }),
}));
