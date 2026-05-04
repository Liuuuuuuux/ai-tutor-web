import request from './client';
import type { LearningSession, SessionCompleteResult } from '@/types';

// 获取学习会话详情（包含消息列表）
export function getLearningSession(id: string): Promise<LearningSession> {
  return request.get(`/learning-sessions/${id}`);
}

// 获取当前进行中的会话（用于恢复）
export function getCurrentSession(pointId: string): Promise<LearningSession | null> {
  return request.get('/learning-sessions/current', { params: { pointId } });
}

// 创建学习会话
export function createLearningSession(data: {
  pointId: string;
  mode: string;
}): Promise<LearningSession> {
  return request.post('/learning-sessions', data);
}

// 结束学习会话（AI 总结评估）
export function completeSession(id: string): Promise<SessionCompleteResult> {
  return request.post(`/learning-sessions/${id}/complete`);
}

// 设置资料检索范围
export function setSearchScope(sessionId: string, scope: string): Promise<boolean> {
  return request.post(`/learning-sessions/${sessionId}/search-config`, { searchScope: scope });
}

// 获取历史会话列表
export function getHistorySessions(pointId: string): Promise<LearningSession[]> {
  return request.get('/learning-sessions/history', { params: { pointId } });
}
