import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import { mmkvStorage } from './mmkv';

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const rawKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-anon-key';

const supabaseUrl = rawUrl.length > 0 ? rawUrl : PLACEHOLDER_URL;
const supabaseAnonKey = rawKey.length > 0 ? rawKey : PLACEHOLDER_KEY;

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
  rawUrl.length > 0 && rawKey.length > 0;
