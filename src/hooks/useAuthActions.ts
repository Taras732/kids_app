import { supabase, isSupabaseConfigured } from '../utils/supabase';

export interface AuthResult {
  ok: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
}

const NOT_CONFIGURED: AuthResult = {
  ok: false,
  error: 'Supabase не налаштовано. Додайте ключі в .env (див. SUPABASE_SETUP.md).',
};

export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: translateAuthError(error.message) };
  return { ok: true, needsEmailConfirmation: data.user?.email_confirmed_at === null };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: translateAuthError(error.message) };
  return { ok: true };
}

export async function signOut(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function requestPasswordReset(email: string, redirectTo?: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { ok: false, error: translateAuthError(error.message) };
  return { ok: true };
}

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: translateAuthError(error.message) };
  return { ok: true };
}

export async function resendConfirmation(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) return { ok: false, error: translateAuthError(error.message) };
  return { ok: true };
}

function translateAuthError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Невірний email або пароль';
  if (msg.includes('email not confirmed')) return 'Email не підтверджено. Перевірте пошту';
  if (msg.includes('user already registered')) return 'Користувач з таким email вже існує';
  if (msg.includes('password should be at least')) return 'Пароль має містити мінімум 8 символів';
  if (msg.includes('invalid email')) return 'Невірний формат email';
  if (msg.includes('for security purposes')) return 'Забагато спроб. Спробуйте через хвилину';
  return message;
}
