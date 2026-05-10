import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Button, Input, Spin } from 'antd';
import { RobotOutlined, SendOutlined, ThunderboltOutlined, UserOutlined } from '@ant-design/icons';
import { useSSE } from '@/hooks';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import type { ChatMessage } from '@/types';

const { TextArea } = Input;

interface ChatBoxProps {
  sessionId: string;
  initialMessages?: ChatMessage[];
  onMessageSent?: () => void;
  className?: string;
  header?: ReactNode;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  emptyPrompt?: string;
}

export function ChatBox({
  sessionId,
  initialMessages = [],
  onMessageSent,
  className = '',
  header,
  title = 'AI 学习对话',
  subtitle = '围绕当前知识点持续追问、讲解和练习',
  placeholder = '直接输入你想问的问题，或者让 AI 带你一步一步学。',
  emptyPrompt,
}: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages: newMessages,
    isStreaming,
    streamingContent,
    connect,
    clearMessages,
  } = useSSE({
    onComplete: () => {
      clearMessages();
      onMessageSent?.();
    },
    onError: (error) => {
      console.error('SSE Error:', error);
    },
  });

  const displayMessages = useMemo(() => {
    const messageMap = new Map<string, ChatMessage>();

    for (const msg of Array.isArray(initialMessages) ? initialMessages : []) {
      const key = `${msg.role?.toUpperCase()}:${msg.content}`;
      messageMap.set(key, msg);
    }

    for (const msg of newMessages) {
      const key = `${msg.role?.toUpperCase()}:${msg.content}`;
      if (!messageMap.has(key)) {
        messageMap.set(key, msg);
      }
    }

    return Array.from(messageMap.values());
  }, [initialMessages, newMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, streamingContent]);

  const handleSend = (content = inputValue.trim()) => {
    if (!content || isStreaming || !sessionId) return;

    connect(sessionId, content);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderBubble = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'USER' || message.role?.toUpperCase() === 'USER';

    return (
      <div key={message.id || index} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
            isUser ? 'bg-[#2563eb]' : 'bg-slate-900'
          }`}
        >
          {isUser ? <UserOutlined /> : <RobotOutlined />}
        </div>
        <div
          className={`max-w-[min(760px,calc(100%-56px))] rounded-[26px] px-4 py-3 text-sm leading-7 shadow-sm ${
            isUser
              ? 'bg-[#2563eb] text-white'
              : 'border border-stone-200 bg-white/95 text-slate-800'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
      </div>
    );
  };

  const renderStreamingContent = () => {
    if (!isStreaming || !streamingContent) return null;

    return (
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
          <RobotOutlined />
        </div>
        <div className="max-w-[min(760px,calc(100%-56px))] rounded-[26px] border border-stone-200 bg-white/95 px-4 py-3 text-sm leading-7 text-slate-800 shadow-sm">
          <MarkdownRenderer content={streamingContent} />
          <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-full bg-[#2563eb] align-middle" />
        </div>
      </div>
    );
  };

  const renderDefaultHeader = () => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <ThunderboltOutlined className="text-[#2563eb]" />
          {title}
        </div>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
        {isStreaming ? '正在生成' : '可随时追问'}
      </div>
    </div>
  );

  const hasConversation = displayMessages.length > 0 || isStreaming || Boolean(streamingContent);

  const renderComposer = () => (
    <div className="w-full">
      <div className="flex items-end gap-3 rounded-[28px] border border-stone-200 bg-white/95 p-3 shadow-sm focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/10">
        <TextArea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoSize={{ minRows: 1, maxRows: 5 }}
          className="flex-1 border-none bg-transparent p-0 shadow-none"
          disabled={isStreaming || !sessionId}
        />
        <Button
          type="primary"
          icon={isStreaming ? <Spin size="small" /> : <SendOutlined />}
          onClick={() => handleSend()}
          disabled={!inputValue.trim() || isStreaming || !sessionId}
          className="h-11 rounded-full px-5"
        >
          发送
        </Button>
      </div>
      <p className="mt-2 text-xs text-slate-400">Enter 发送，Shift + Enter 换行</p>
    </div>
  );

  return (
    <div
      className={`flex h-full w-full min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] ${className}`}
    >
      <div className="border-b border-slate-200/80 bg-white/75 px-5 py-4 backdrop-blur">
        {header ?? renderDefaultHeader()}
      </div>

      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.05),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-4 py-6 md:px-6">
        {!sessionId ? (
          <div className="mx-auto flex h-full max-w-2xl items-center justify-center py-20 text-center">
            <div className="text-sm text-slate-500">当前会话未就绪</div>
          </div>
        ) : !hasConversation ? (
          <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center gap-5 py-20 text-center">
            {emptyPrompt ? (
              <p className="max-w-2xl text-base leading-8 text-slate-600">{emptyPrompt}</p>
            ) : null}
            <div className="w-full max-w-4xl">{renderComposer()}</div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {displayMessages.map((msg, index) => renderBubble(msg, index))}
            {renderStreamingContent()}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {hasConversation && sessionId ? (
        <div className="border-t border-stone-200/80 bg-white/80 px-4 py-4 backdrop-blur">
          <div className="mx-auto w-full max-w-4xl">{renderComposer()}</div>
        </div>
      ) : null}
    </div>
  );
}
