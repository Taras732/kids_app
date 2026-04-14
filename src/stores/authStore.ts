import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './middleware/mmkvPersist';

interface AuthState {
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setSession: (userId: string, email: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      isAuthenticated: false,
      setSession: (userId, email) => set({ userId, email, isAuthenticated: true }),
      clearSession: () => set({ userId: null, email: null, isAuthenticated: false }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
