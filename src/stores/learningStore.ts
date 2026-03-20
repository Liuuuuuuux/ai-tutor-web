import { create } from 'zustand';
import type { LearningSession, KnowledgePoint, ChatMessage } from '@/types';

interface LearningState {
  // 当前会话
  currentSession: LearningSession | null;
  currentKnowledgePoint: KnowledgePoint | null;

  // 会话模式
  mode: 'TEACHING' | 'COACH';

  // 学习进度
  progress: number;

  // 聊天消息
  messages: ChatMessage[];

  // 流式状态
  isStreaming: boolean;
  streamingContent: string;

  // Actions
  setCurrentSession: (session: LearningSession | null) => void;
  setCurrentKnowledgePoint: (point: KnowledgePoint | null) => void;
  setMode: (mode: 'TEACHING' | 'COACH') => void;
  setProgress: (progress: number) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setStreaming: (isStreaming: boolean) => void;
  appendStreamingContent: (content: string) => void;
  clearStreamingContent: () => void;
  reset: () => void;
}

const initialState = {
  currentSession: null,
  currentKnowledgePoint: null,
  mode: 'TEACHING' as const,
  progress: 0,
  messages: [],
  isStreaming: false,
  streamingContent: '',
};

export const useLearningStore = create<LearningState>((set) => ({
  ...initialState,

  setCurrentSession: (session) => set({ currentSession: session }),

  setCurrentKnowledgePoint: (point) => set({ currentKnowledgePoint: point }),

  setMode: (mode) => set({ mode }),

  setProgress: (progress) => set({ progress }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  appendStreamingContent: (content) =>
    set((state) => ({
      streamingContent: state.streamingContent + content,
    })),

  clearStreamingContent: () => set({ streamingContent: '' }),

  reset: () => set(initialState),
}));
