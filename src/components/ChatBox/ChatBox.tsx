import { useState, useRef, useEffect, useMemo } from 'react';
import { Input, Button, Spin, Empty, Avatar, Card } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { useSSE } from '@/hooks';
import type { ChatMessage } from '@/types';

const { TextArea } = Input;

interface ChatBoxProps {
  sessionId: string;
  initialMessages?: ChatMessage[];
  onMessageSent?: () => void;
}

export function ChatBox({ sessionId, initialMessages = [], onMessageSent }: ChatBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages: newMessages,
    isStreaming,
    streamingContent,
    connect,
  } = useSSE({
    onComplete: () => {
      // 流式完成后，通知父组件重新获取消息
      onMessageSent?.();
    },
    onError: (error) => {
      console.error('SSE Error:', error);
    },
  });

  // 合并历史消息和新消息
  const displayMessages = useMemo(() => {
    // 过滤掉已经在 initialMessages 中的新消息（通过 id 去重）
    const existingIds = new Set(initialMessages.map((m) => m.id));
    const uniqueNewMessages = newMessages.filter((m) => !existingIds.has(m.id));
    return [...initialMessages, ...uniqueNewMessages];
  }, [initialMessages, newMessages]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, streamingContent]);

  // 发送消息
  const handleSend = () => {
    const content = inputValue.trim();
    if (!content || isStreaming) return;

    // 连接 SSE，发送消息
    connect(sessionId, content);

    setInputValue('');
    inputRef.current?.focus();
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 渲染消息
  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'USER';

    return (
      <div
        key={message.id || index}
        className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}
      >
        <Avatar
          className="flex-shrink-0"
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          style={{ backgroundColor: isUser ? '#1890ff' : '#52c41a' }}
        />
        <div
          className={`max-w-[70%] px-4 py-2 rounded-lg ${
            isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  };

  // 渲染流式内容
  const renderStreamingContent = () => {
    if (!isStreaming || !streamingContent) return null;

    return (
      <div className="flex gap-3 mb-4">
        <Avatar
          className="flex-shrink-0"
          icon={<RobotOutlined />}
          style={{ backgroundColor: '#52c41a' }}
        />
        <div className="max-w-[70%] px-4 py-2 rounded-lg bg-gray-100 text-gray-800">
          <p className="whitespace-pre-wrap">{streamingContent}</p>
          <span className="inline-block w-2 h-4 bg-green-500 animate-pulse ml-1" />
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto mb-4" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {displayMessages.length === 0 && !isStreaming ? (
          <Empty description="开始对话吧" className="mt-20" />
        ) : (
          <>
            {displayMessages.map((msg, index) => renderMessage(msg, index))}
            {renderStreamingContent()}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t pt-4">
        <div className="flex gap-2">
          <TextArea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="flex-1"
            disabled={isStreaming}
          />
          <Button
            type="primary"
            icon={isStreaming ? <Spin size="small" /> : <SendOutlined />}
            onClick={handleSend}
            disabled={!inputValue.trim() || isStreaming}
            className="h-auto"
          >
            发送
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">按 Enter 发送，Shift + Enter 换行</p>
      </div>
    </Card>
  );
}
