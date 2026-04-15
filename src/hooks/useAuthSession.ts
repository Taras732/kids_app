import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../utils/supabase';
import { useAuthStore } from '../stores/authStore';

export function useAuthSession(): void {
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        if (session?.user) {
          setSession(session.user.id, session.user.email ?? '');
        } else {
          clearSession();
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.warn('[auth] getSession failed', err);
        clearSession();
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setSession(session.user.id, session.user.email ?? '');
      } else {
        clearSession();
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [setSession, clearSession, setLoading]);
}
