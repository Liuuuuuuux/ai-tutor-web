import request from './client';
import type { KnowledgePoint } from '@/types';

// 获取知识点树（按学习目标）
export function getKnowledgeTree(goalId: string): Promise<KnowledgePoint[]> {
  return request.get(`/knowledge-points/tree/${goalId}`);
}

// 获取知识点详情
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

// AI 拆解知识点
export function decomposeKnowledgePoint(id: string): Promise<KnowledgePoint[]> {
  return request.post(`/knowledge-points/${id}/decompose`);
}
