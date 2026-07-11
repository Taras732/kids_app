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
    // На localhost лишаємо поточний origin (dev), у проді — завжди канонічний
    // домен, щоб вхід зі старих/будь-яких URL не падав на 404 після OAuth.
    const origin = window.location.origin;
    const isLocalDev = origin.includes('localhost') || origin.includes('127.0.0.1');
    const redirectTo = isLocalDev
      ? origin + '/onboarding'
      : 'https://shkolyaryk.kuznya.studio/onboarding';
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

    // 2. Розв'язати початковий стан: наявна сесія АБО анонімний вхід.
    //    loading:false лише коли це реально завершилось.
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ session, user: session.user, loading: false });
        return;
      }
      // TODO(auth): поки вхід/реєстрація відкладені — анонімний вхід Supabase,
      // щоб дані писались у реальну БД без екрана входу. Якщо anonymous sign-ins
      // вимкнено — тихо лишаємось у guest-режимі (localStorage).
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn('[auth] анонімний вхід недоступний, guest-режим:', error.message);
        set({ session: null, user: null, loading: false });
      } else {
        set({ session: data.session, user: data.user, loading: false });
      }
    })();

    return () => {
      subscription.unsubscribe();
    };
  }
}));
