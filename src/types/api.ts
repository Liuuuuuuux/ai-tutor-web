// API 统一响应格式
export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

// 分页响应
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 分页请求参数
export interface PageParams {
  current?: number;
  size?: number;
}
