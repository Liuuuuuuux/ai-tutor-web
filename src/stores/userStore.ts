import { create } from 'zustand';
import type { User } from '@/types';
import {
  clearAuthStorage,
  persistSession,
  persistUser,
  readAuthToken,
  readStoredUser,
  readStoredUserId,
  type AuthSession,
} from '@/features/auth/storage';

interface UserState {
  user: User | null;
  userId: string | null;
  token: string | null;
  setSession: (session: AuthSession) => void;
  setUser: (user: User | null) => void;
  setUserId: (userId: string) => void;
  logout: () => void;
}

const storedUser = readStoredUser();

export const useUserStore = create<UserState>((set) => ({
  user: storedUser,
  userId: storedUser?.id ?? readStoredUserId(),
  token: readAuthToken(),

  setSession: (session) => {
    persistSession(session);
    set({
      user: session.user,
      userId: String(session.user.id),
      token: session.token,
    });
  },

  setUser: (user) => {
    persistUser(user);
    set({ user, userId: user ? String(user.id) : null });
  },

  setUserId: (userId) => {
    localStorage.setItem('userId', userId);
    set({ userId });
  },

  logout: () => {
    clearAuthStorage();
    set({ user: null, userId: null, token: null });
  },
}));
