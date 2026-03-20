import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, SSEMessage } from '@/types';

interface UseSSEOptions {
  onMessage?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

interface UseSSEReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  connect: (sessionId: string, content: string) => void;
  disconnect: () => void;
  clearMessages: () => void;
}

export function useSSE(options: UseSSEOptions = {}): UseSSEReturn {
  const { onMessage, onError, onComplete } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const eventSourceRef = useRef<EventSource | null>(null);
  const accumulatedContentRef = useRef('');

  const connect = useCallback(
    (sessionId: string, content: string) => {
      // 关闭之前的连接
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      setIsStreaming(true);
      setStreamingContent('');
      accumulatedContentRef.current = '';

      // 构建带参数的 URL（使用 POST 方式需要用 fetch，这里用 GET + query params）
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const userId = localStorage.getItem('userId') || '';
      const url = `${baseUrl}/learning-sessions/${sessionId}/chat/stream?userId=${encodeURIComponent(userId)}&content=${encodeURIComponent(content)}`;

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const data: SSEMessage = JSON.parse(event.data);

          if (data.type === 'content' && data.content) {
            accumulatedContentRef.current += data.content;
            setStreamingContent(accumulatedContentRef.current);
          } else if (data.type === 'done') {
            // 流式完成，创建完整消息
            const assistantMessage: ChatMessage = {
              id: `msg-${Date.now()}`,
              sessionId,
              role: 'ASSISTANT',
              content: accumulatedContentRef.current,
              createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            onMessage?.(assistantMessage);
            onComplete?.();

            setIsStreaming(false);
            eventSource.close();
          } else if (data.type === 'error') {
            onError?.(new Error(data.message || '未知错误'));
            setIsStreaming(false);
            eventSource.close();
          }
        } catch {
          // 如果不是 JSON，可能是纯文本
          accumulatedContentRef.current += event.data;
          setStreamingContent(accumulatedContentRef.current);
        }
      };

      eventSource.onerror = () => {
        onError?.(new Error('SSE 连接错误'));
        setIsStreaming(false);
        eventSource.close();
      };
    },
    [onMessage, onError, onComplete]
  );

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
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
