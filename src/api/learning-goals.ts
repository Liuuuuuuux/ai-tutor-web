import request from './client';
import type { LearningGoal, CreateLearningGoalRequest } from '@/types';
import type { PageResponse, PageParams } from '@/types/api';

// 获取学习目标列表
export function getLearningGoals(params?: PageParams): Promise<PageResponse<LearningGoal>> {
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

// 更新学习进度
export function updateLearningProgress(id: string, progress: number): Promise<LearningGoal> {
  return request.patch(`/learning-goals/${id}/progress`, { progress });
}
