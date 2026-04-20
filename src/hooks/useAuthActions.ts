import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase, isSupabaseConfigured } from '../utils/supabase';

export type AuthErrorCode =
  | 'not_configured'
  | 'user_exists'
  | 'signup_disabled'
  | 'rate_limit'
  | 'network'
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'password_weak'
  | 'invalid_email'
  | 'unknown';

export interface AuthResult {
  ok: boolean;
  error?: string;
  errorCode?: AuthErrorCode;
}

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  error: 'Supabase не налаштовано. Додайте ключі в .env (див. SUPABASE_SETUP.md).',
  errorCode: 'not_configured',
};

interface SupabaseErrorLike {
  message?: string;
  status?: number;
  code?: string;
  name?: string;
}

function classifyError(raw: SupabaseErrorLike): AuthErrorCode {
  const msg = (raw.message ?? '').toLowerCase();
  const status = raw.status;
  const code = (raw.code ?? '').toLowerCase();

  if (code === 'signup_disabled' || status === 422) return 'signup_disabled';
  if (code === 'rate_limit_exceeded' || status === 429 || msg.includes('for security purposes') || msg.includes('rate limit')) return 'rate_limit';
  if (msg.includes('user already registered')) return 'user_exists';
  if (msg.includes('invalid login credentials')) return 'invalid_credentials';
  if (msg.includes('email not confirmed')) return 'email_not_confirmed';
  if (msg.includes('password should be at least')) return 'password_weak';
  if (msg.includes('invalid email')) return 'invalid_email';
  if (raw.name === 'TypeError' || msg.includes('network') || msg.includes('failed to fetch') || msg.includes('timeout')) return 'network';
  if (status && status >= 500) return 'unknown';
  return 'unknown';
}

function errorToResult(raw: SupabaseErrorLike): AuthResult {
  const errorCode = classifyError(raw);
  return { ok: false, error: raw.message ?? 'Error', errorCode };
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  try {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return errorToResult(error);
    return { ok: true };
  } catch (e) {
    return errorToResult(e as SupabaseErrorLike);
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return errorToResult(error);
    return { ok: true };
  } catch (e) {
    return errorToResult(e as SupabaseErrorLike);
  }
}

export async function signOut(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const { error } = await supabase.auth.signOut();
  if (error) return errorToResult(error);
  return { ok: true };
}

export async function deleteAccount(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  try {
    const { error } = await supabase.rpc('delete_user_account');
    if (error) return errorToResult(error);
    await supabase.auth.signOut({ scope: 'local' });
    return { ok: true };
  } catch (e) {
    return errorToResult(e as SupabaseErrorLike);
  }
}

export async function requestPasswordReset(email: string, redirectTo?: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return errorToResult(error);
    return { ok: true };
  } catch (e) {
    return errorToResult(e as SupabaseErrorLike);
  }
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return errorToResult(error);
    return { ok: true };
  } catch (e) {
    return errorToResult(e as SupabaseErrorLike);
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  try {
    if (Platform.OS === 'web') {
      const base = process.env.EXPO_BASE_URL ?? '';
      const redirectTo =
        typeof window !== 'undefined' ? `${window.location.origin}${base}/` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) return errorToResult(error);
      return { ok: true };
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { skipBrowserRedirect: true },
    });
    if (error) return errorToResult(error);
    if (!data?.url) return { ok: false, error: 'No OAuth URL', errorCode: 'unknown' };

    const result = await WebBrowser.openAuthSessionAsync(data.url);
    if (result.type !== 'success') {
      return { ok: false, error: 'OAuth cancelled', errorCode: 'unknown' };
    }
    return { ok: true };
  } catch (e) {
    return errorToResult(e as SupabaseErrorLike);
  }
}

export async function resendConfirmation(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  try {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) return errorToResult(error);
    return { ok: true };
  } catch (e) {
    return errorToResult(e as SupabaseErrorLike);
  }
}
