import request from './client';
import type { Material, CreateMaterialRequest } from '@/types';
import type { PageResponse, PageParams } from '@/types/api';

// 获取资料列表
export function getMaterials(goalId: string, params?: PageParams): Promise<PageResponse<Material>> {
  return request.get(`/materials/${goalId}`, { params });
}

// 上传资料
export function createMaterial(data: CreateMaterialRequest): Promise<Material> {
  return request.post('/materials', data);
}

// 删除资料
export function deleteMaterial(id: string): Promise<void> {
  return request.delete(`/materials/${id}`);
}

// 获取上传 URL（用于 MinIO 直传）
export function getUploadUrl(filename: string): Promise<{ url: string; objectKey: string }> {
  return request.get('/materials/upload-url', { params: { filename } });
}
