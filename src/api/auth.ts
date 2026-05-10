import { request } from './client';
import type { User } from '@/types';
import type { AuthSession } from '@/features/auth/storage';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  nickname: string;
  password: string;
}

export async function login(data: LoginRequest): Promise<AuthSession> {
  return request.post<AuthSession>('/auth/login', data);
}

export async function register(data: RegisterRequest): Promise<AuthSession> {
  return request.post<AuthSession>('/auth/register', data);
}

export async function getCurrentUser(): Promise<User> {
  return request.get<User>('/auth/current');
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  return request.get<boolean>(`/auth/check-username?username=${encodeURIComponent(username)}`);
}

export async function logout(): Promise<boolean> {
  return request.post<boolean>('/auth/logout');
}
