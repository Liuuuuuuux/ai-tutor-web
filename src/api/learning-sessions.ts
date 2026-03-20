import request from './client';
import type { LearningSession, ChatMessage } from '@/types';

// 获取学习会话详情
export function getLearningSession(id: string): Promise<LearningSession> {
  return request.get(`/learning-sessions/${id}`);
}

// 创建学习会话
export function createLearningSession(data: {
  goalId: string;
  knowledgePointId: string;
  mode: 'TEACHING' | 'COACH';
}): Promise<LearningSession> {
  return request.post('/learning-sessions', data);
}

// 结束学习会话
export function endLearningSession(id: string): Promise<LearningSession> {
  return request.post(`/learning-sessions/${id}/end`);
}

// 获取会话历史消息
export function getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
  return request.get(`/learning-sessions/${sessionId}/messages`);
}

// 发送消息（非流式）
export function sendMessage(sessionId: string, content: string): Promise<ChatMessage> {
  return request.post(`/learning-sessions/${sessionId}/chat`, { content });
}

// 获取 SSE 流式聊天 URL
export function getSSEChatUrl(sessionId: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  const userId = localStorage.getItem('userId') || '';
  return `${baseUrl}/learning-sessions/${sessionId}/chat/stream?userId=${userId}`;
}
