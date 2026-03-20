import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '@/types/api';

// API 基础配置
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 创建 Axios 实例
const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加用户ID头
client.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取用户信息
    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['X-User-Id'] = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理统一响应格式
client.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse;

    // 如果响应直接是数据（非标准格式）
    if (res.code === undefined) {
      return response.data;
    }

    // 处理统一响应格式
    if (res.code !== 0) {
      message.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }

    // 返回 data 部分
    return res.data;
  },
  (error) => {
    // 处理 HTTP 错误
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          message.error('未授权，请重新登录');
          break;
        case 403:
          message.error('没有权限访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(error.message || '网络错误');
      }
    } else {
      message.error('网络错误，请检查网络连接');
    }
    return Promise.reject(error);
  }
);

// 封装请求方法
export const request = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    client.get(url, config),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    client.post(url, data, config),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    client.put(url, data, config),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    client.delete(url, config),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    client.patch(url, data, config),
};

export { client };
export default request;
