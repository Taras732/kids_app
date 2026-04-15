import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './middleware/mmkvPersist';

interface AuthState {
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (userId: string, email: string) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      isAuthenticated: false,
      isLoading: true,
      setSession: (userId, email) =>
        set({ userId, email, isAuthenticated: true, isLoading: false }),
      clearSession: () =>
        set({
          userId: null,
          email: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        userId: state.userId,
        email: state.email,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
