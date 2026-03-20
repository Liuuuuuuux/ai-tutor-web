import { create } from 'zustand';
import type { User } from '@/types';

interface UserState {
  user: User | null;
  userId: string | null;
  setUser: (user: User | null) => void;
  setUserId: (userId: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  userId: localStorage.getItem('userId'),

  setUser: (user) => {
    if (user) {
      localStorage.setItem('userId', user.id);
    } else {
      localStorage.removeItem('userId');
    }
    set({ user, userId: user?.id || null });
  },

  setUserId: (userId) => {
    localStorage.setItem('userId', userId);
    set({ userId });
  },

  logout: () => {
    localStorage.removeItem('userId');
    set({ user: null, userId: null });
  },
}));
