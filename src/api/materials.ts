import request from './client';
import type { Material } from '@/types';
import type { PageResponse } from '@/types/api';

// 获取资料列表（分页）
export function getMaterials(params: {
  goalId: string;
  pointId?: string;
  pageNum?: number;
  pageSize?: number;
}): Promise<PageResponse<Material>> {
  return request.get('/materials', { params });
}

// 获取资料详情
export function getMaterialDetail(id: string): Promise<Material> {
  return request.get(`/materials/${id}`);
}

// 上传学习资料
export function uploadMaterial(data: {
  goalId: string;
  pointIds?: string[];
  file: File;
}): Promise<Material> {
  const formData = new FormData();
  formData.append('goalId', data.goalId);
  if (data.pointIds) {
    data.pointIds.forEach((id) => formData.append('pointIds', id));
  }
  formData.append('file', data.file);

  return request.post('/materials/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// 删除资料
export function deleteMaterial(id: string): Promise<boolean> {
  return request.delete(`/materials/${id}`);
}

// 批量删除资料
export function batchDeleteMaterials(ids: string[]): Promise<number> {
  return request.post('/materials/batch-delete', ids);
}

// 更新资料关联的知识点
export function updateMaterialPoints(id: string, pointIds: string[]): Promise<boolean> {
  return request.put(`/materials/${id}/points`, { pointIds });
}

// 资料统计
export interface MaterialStats {
  totalCount: number;
  uploadCount: number;
  searchCount: number;
  totalSize: number;
}

export function getMaterialStats(goalId: string): Promise<MaterialStats> {
  return request.get('/materials/stats', { params: { goalId } });
}

// ==================== AI 搜索相关 ====================

// 搜索结果
export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

// AI 联网搜索资料
export function searchMaterials(params: {
  goalId: string;
  pointId?: string;
  keyword: string;
  limit?: number;
}): Promise<SearchResult[]> {
  return request.post('/materials/search', params);
}

// 保存搜索结果为资料
export function saveSearchResult(data: {
  goalId: string;
  pointId?: string;
  title: string;
  url: string;
  snippet?: string;
  relevanceScore?: number;
}): Promise<Material> {
  return request.post('/materials/search/save', data);
}
