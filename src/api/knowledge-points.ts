import request from './client';
import type { KnowledgePoint } from '@/types';

// 获取知识点列表（按学习目标）
export function getKnowledgePoints(goalId: string): Promise<KnowledgePoint[]> {
  return request.get(`/knowledge-points/goal/${goalId}`);
}

// 获取知识点详情（含概览）
export function getKnowledgePoint(id: string): Promise<KnowledgePoint> {
  return request.get(`/knowledge-points/${id}`);
}

// 创建知识点
export function createKnowledgePoint(data: Partial<KnowledgePoint>): Promise<KnowledgePoint> {
  return request.post('/knowledge-points', data);
}

// 更新知识点
export function updateKnowledgePoint(
  id: string,
  data: Partial<KnowledgePoint>
): Promise<KnowledgePoint> {
  return request.put(`/knowledge-points/${id}`, data);
}

// 删除知识点
export function deleteKnowledgePoint(id: string): Promise<void> {
  return request.delete(`/knowledge-points/${id}`);
}

// 调整知识点排序
export function updateSortOrder(goalId: string, pointIds: string[]): Promise<void> {
  return request.put(`/knowledge-points/goal/${goalId}/sort`, pointIds);
}

// 更新知识点掌握程度
export function updateMasteryLevel(id: string, masteryLevel: number): Promise<void> {
  return request.put(`/knowledge-points/${id}/mastery`, null, {
    params: { masteryLevel },
  });
}

// ==================== AI 知识点生成相关 ====================

// AI 生成的知识点项
export interface GeneratedKnowledgePoint {
  title: string;
  description: string;
  difficulty?: string;
  estimatedTime?: string;
}

// AI 知识点生成参数
export interface KnowledgePointGenerationParams {
  goalId: string;
  topic: string;
  userBackground?: string;
  expectedCount?: number;
  difficultyLevel?: string;
}

// AI 自动拆解知识点（预览，不保存）
export function generateKnowledgePoints(params: KnowledgePointGenerationParams): Promise<{
  goalId: string;
  topic: string;
  points: GeneratedKnowledgePoint[];
  generatedAt: string;
}> {
  return request.post('/knowledge-points/generate', params);
}

// 确认保存生成的知识点
export function confirmKnowledgePoints(
  goalId: string,
  points: GeneratedKnowledgePoint[]
): Promise<KnowledgePoint[]> {
  return request.post('/knowledge-points/generate/confirm', { goalId, points });
}

// 重新生成知识点（先清空旧的，再生成新的）
export function regenerateKnowledgePoints(
  params: KnowledgePointGenerationParams
): Promise<KnowledgePoint[]> {
  return request.post('/knowledge-points/regenerate', params);
}
