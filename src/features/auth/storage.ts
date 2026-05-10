import type { User } from '@/types';

const AUTH_TOKEN_KEY = 'authToken';
const USER_ID_KEY = 'userId';
const USER_KEY = 'user';

function readStorageValue(key: string): string | null {
  const value = localStorage.getItem(key);
  if (!value || value === 'undefined' || value === 'null') {
    if (value === 'undefined' || value === 'null') {
      localStorage.removeItem(key);
    }
    return null;
  }
  return value;
}

function normalizeUser(raw: Partial<User> | null | undefined): User | null {
  if (!raw?.id || !raw.username) {
    return null;
  }

  return {
    ...raw,
    id: String(raw.id),
  } as User;
}

export interface AuthSession {
  token: string;
  expiresAt: string;
  user: User;
}

export function readAuthToken(): string | null {
  return readStorageValue(AUTH_TOKEN_KEY);
}

export function readStoredUserId(): string | null {
  return readStorageValue(USER_ID_KEY);
}

export function readStoredUser(): User | null {
  const raw = readStorageValue(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    const user = normalizeUser(JSON.parse(raw) as Partial<User>);
    if (!user) {
      localStorage.removeItem(USER_KEY);
    }
    return user;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function persistUser(user: User | null): void {
  if (!user) {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_KEY);
    return;
  }

  const normalizedUser = {
    ...user,
    id: String(user.id),
  };

  localStorage.setItem(USER_ID_KEY, normalizedUser.id);
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
}

export function persistSession(session: AuthSession): void {
  localStorage.setItem(AUTH_TOKEN_KEY, session.token);
  persistUser(session.user);
}

export function clearAuthStorage(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USER_KEY);
}
