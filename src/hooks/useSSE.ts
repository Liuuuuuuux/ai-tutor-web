import { useCallback, useRef, useState } from 'react';
import type { ChatMessage } from '@/types';

interface UseSSEOptions {
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

interface UseSSEReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  connect: (sessionId: string, content: string) => Promise<void>;
  disconnect: () => void;
  clearMessages: () => void;
}

export function useSSE(options: UseSSEOptions = {}): UseSSEReturn {
  const { onMessage, onError, onComplete } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedContentRef = useRef('');

  const connect = useCallback(
    async (sessionId: string, content: string) => {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsStreaming(true);
      setStreamingContent('');
      accumulatedContentRef.current = '';

      // 先添加用户消息
      const userMessage: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        sessionId,
        role: 'USER',
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const url = `${baseUrl}/learning-sessions/${sessionId}/chat`;

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': localStorage.getItem('userId') || '',
          },
          body: JSON.stringify({ content }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          // 处理 SSE 格式的数据
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一个不完整的行

          for (const line of lines) {
            if (line.startsWith('data:')) {
              const data = line.slice(5).trim();
              if (data) {
                accumulatedContentRef.current += data;
                setStreamingContent(accumulatedContentRef.current);
              }
            } else if (line.trim() && !line.startsWith(':')) {
              // 如果不是 SSE 格式，直接作为内容
              accumulatedContentRef.current += line;
              setStreamingContent(accumulatedContentRef.current);
            }
          }
        }

        // 流式完成，创建 AI 消息
        if (accumulatedContentRef.current) {
          const assistantMessage: ChatMessage = {
            id: `msg-assistant-${Date.now()}`,
            sessionId,
            role: 'ASSISTANT',
            content: accumulatedContentRef.current,
            createdAt: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
          onMessage?.(assistantMessage);
        }

        onComplete?.();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // 用户主动取消，不做处理
          return;
        }
        console.error('SSE Error:', error);
        onError?.(error instanceof Error ? error : new Error('SSE 连接错误'));
      } finally {
        setIsStreaming(false);
      }
    },
    [onMessage, onError, onComplete]
  );

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    accumulatedContentRef.current = '';
  }, []);

  return {
    messages,
    isStreaming,
    streamingContent,
    connect,
    disconnect,
    clearMessages,
  };
}
