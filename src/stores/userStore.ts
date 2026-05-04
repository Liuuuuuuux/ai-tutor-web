import { create } from 'zustand';
import type { User } from '@/types';

interface UserState {
  user: User | null;
  userId: string | null;
  setUser: (user: User | null) => void;
  setUserId: (userId: string) => void;
  logout: () => void;
}

function readStoredUser(): User | null {
  const raw = localStorage.getItem('user');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

const storedUser = readStoredUser();

export const useUserStore = create<UserState>((set) => ({
  user: storedUser,
  userId: storedUser?.id ?? localStorage.getItem('userId'),

  setUser: (user) => {
    if (user) {
      localStorage.setItem('userId', user.id);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('userId');
      localStorage.removeItem('user');
    }
    set({ user, userId: user?.id || null });
  },

  setUserId: (userId) => {
    localStorage.setItem('userId', userId);
    set({ userId });
  },

  logout: () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    set({ user: null, userId: null });
  },
}));
