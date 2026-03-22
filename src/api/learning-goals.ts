import request from './client';
import type { LearningGoal, CreateLearningGoalRequest } from '@/types';
import type { PageResponse } from '@/types/api';

// 获取学习目标列表
export function getLearningGoals(params?: {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  status?: number;
}): Promise<PageResponse<LearningGoal>> {
  return request.get('/learning-goals', { params });
}

// 获取学习目标详情
export function getLearningGoal(id: string): Promise<LearningGoal> {
  return request.get(`/learning-goals/${id}`);
}

// 创建学习目标
export function createLearningGoal(data: CreateLearningGoalRequest): Promise<LearningGoal> {
  return request.post('/learning-goals', data);
}

// 更新学习目标
export function updateLearningGoal(
  id: string,
  data: Partial<CreateLearningGoalRequest>
): Promise<LearningGoal> {
  return request.put(`/learning-goals/${id}`, data);
}

// 删除学习目标
export function deleteLearningGoal(id: string): Promise<void> {
  return request.delete(`/learning-goals/${id}`);
}
