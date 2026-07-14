import { create } from 'zustand';
import { supabase } from '@/utils/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ loading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    // Redirect на ПОТОЧНИЙ origin — щоб вхід працював на будь-якому домені
    // (localhost, dev, prod), а не лише на одному захардкодженому.
    // ⚠️ Кожен домен має бути доданий у Supabase → Auth → URL Configuration →
    // Redirect URLs, інакше OAuth поверне 404 після входу.
    const redirectTo = window.location.origin + '/onboarding';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    });
    if (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Гостьовий вхід — анонімна сесія Supabase, щоб прогрес дитини писався в
  // реальну БД без реєстрації. Викликається явно з екрана Auth (кнопка «гість»).
  // Якщо anonymous вимкнено — лишаємось без user (guest-режим на localStorage),
  // флоу все одно проходить.
  signInGuest: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn('[auth] анонімний вхід недоступний, guest-режим:', error.message);
      set({ session: null, user: null, loading: false });
    } else {
      set({ session: data.session, user: data.user, loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signOut();
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ user: null, session: null, loading: false });
    }
  },

  deleteAccount: async () => {
    set({ loading: true, error: null });
    // Call the database RPC to delete user account securely
    const { error } = await supabase.rpc('delete_user_account');
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      // Success: signOut locally
      await supabase.auth.signOut();
      set({ user: null, session: null, loading: false });
    }
  },

  clearError: () => set({ error: null }),

  initialize: () => {
    // 1. Підписка на зміни: оновлюємо user/session, але НЕ чіпаємо loading тут —
    //    onAuthStateChange одразу віддає початкову подію (INITIAL_SESSION=null),
    //    і якщо тут ставити loading:false, гейт спаде ДО завершення анонімного
    //    входу → профіль створиться в guest замість Supabase.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });

    // 2. Розв'язати початковий стан із наявної сесії. БЕЗ авто-входу — вхід і
    //    гостьовий режим тепер ЯВНІ (через екран Auth). Так екран входу/реєстрації
    //    реально показується, а не скіпається авто-анонімним user.
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, loading: false });
    })();

    return () => {
      subscription.unsubscribe();
    };
  }
}));
