import { request } from './client';
import type { User } from '@/types';

/**
 * 登录请求参数
 */
export interface LoginRequest {
  username: string;
  password?: string;
}

/**
 * 注册请求参数
 */
export interface RegisterRequest {
  username: string;
  nickname: string;
  password?: string;
}

/**
 * 登录或注册响应
 */
export interface AuthResponse {
  user: User;
  isNewUser: boolean;
}

/**
 * 用户登录
 * 后端会验证用户是否存在，如不存在会自动创建新用户
 * @param data 登录请求参数
 * @returns 用户信息和是否为新用户
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  return request.post<AuthResponse>('/auth/login', data);
}

/**
 * 用户注册
 * @param data 注册请求参数
 * @returns 新创建的用户信息
 */
export async function register(data: RegisterRequest): Promise<User> {
  return request.post<User>('/auth/register', data);
}

/**
 * 获取当前登录用户信息
 * @returns 用户信息
 */
export async function getCurrentUser(): Promise<User> {
  return request.get<User>('/auth/current');
}

/**
 * 检查用户名是否可用
 * @param username 用户名
 * @returns 是否可用
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  return request.get<boolean>(`/auth/check-username?username=${encodeURIComponent(username)}`);
}
