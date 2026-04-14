import { Platform } from 'react-native';
import { createClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import { mmkvStorage } from './mmkv';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const mmkvAdapter = {
  getItem: (key: string): string | null => mmkvStorage.getString(key) ?? null,
  setItem: (key: string, value: string): void => mmkvStorage.set(key, value),
  removeItem: (key: string): void => mmkvStorage.delete(key),
};

const options: SupabaseClientOptions<'public'> = {
  auth: {
    storage: mmkvAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);

export const isSupabaseConfigured = (): boolean =>
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
