import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Empty, Input, Spin } from 'antd';
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
  title?: string;
  subtitle?: string;
  placeholder?: string;
}

const quickPrompts = ['帮我讲清这个知识点', '给我出 3 个练习题', '总结成一页复习提纲'];

export function ChatBox({
  sessionId,
  initialMessages = [],
  onMessageSent,
  className = '',
  title = 'AI 学习对话',
  subtitle = '像 ChatGPT 一样连续追问、讲解和练习',
  placeholder = '输入你的问题，或者直接说“帮我把这个知识点讲透”',
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
            isUser ? 'bg-teal-600' : 'bg-slate-900'
          }`}
        >
          {isUser ? <UserOutlined /> : <RobotOutlined />}
        </div>
        <div
          className={`max-w-[min(760px,calc(100%-56px))] rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm ${
            isUser ? 'bg-teal-600 text-white' : 'border border-slate-200 bg-white text-slate-800'
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
        <div className="max-w-[min(760px,calc(100%-56px))] rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-800 shadow-sm">
          <MarkdownRenderer content={streamingContent} />
          <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-full bg-teal-500 align-middle" />
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex h-full min-h-[680px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-5 py-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ThunderboltOutlined className="text-teal-600" />
            {title}
          </div>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
          {isStreaming ? '正在生成中' : '可随时追问'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-5 py-6">
        {!sessionId ? (
          <Empty
            description="请选择一个知识点开始学习"
            className="flex h-full flex-col items-center justify-center py-16"
          />
        ) : displayMessages.length === 0 && !isStreaming ? (
          <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 py-20 text-center">
            <div className="rounded-3xl bg-teal-50 p-4 text-3xl text-teal-700 shadow-sm">
              <RobotOutlined />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-900">开始一段学习对话</h3>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                你可以让 AI 讲解、提问、总结，或者直接让它围绕当前知识点带你一步一步学。
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {quickPrompts.map((prompt) => (
                <Button key={prompt} onClick={() => setInputValue(prompt)} className="rounded-full">
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl flex-col gap-4">
            {displayMessages.map((msg, index) => renderBubble(msg, index))}
            {renderStreamingContent()}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200 bg-white/95 px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-[26px] border border-slate-200 bg-slate-50 p-3 shadow-sm focus-within:border-teal-400">
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
            className="h-11 px-5"
          >
            发送
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-4xl text-xs text-slate-400">
          Enter 发送，Shift + Enter 换行
        </p>
      </div>
    </div>
  );
}
