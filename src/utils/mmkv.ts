import { Platform } from 'react-native';

export interface MmkvStorage {
  getString(key: string): string | undefined;
  set(key: string, value: string | number | boolean): void;
  delete(key: string): void;
  clearAll(): void;
  getAllKeys(): string[];
}

let mmkvStorage: MmkvStorage;

if (Platform.OS === 'web') {
  mmkvStorage = {
    getString: (key) => {
      if (typeof window === 'undefined') return undefined;
      const v = window.localStorage.getItem(key);
      return v === null ? undefined : v;
    },
    set: (key, value) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(key, String(value));
    },
    delete: (key) => {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(key);
    },
    clearAll: () => {
      if (typeof window === 'undefined') return;
      window.localStorage.clear();
    },
    getAllKeys: () => {
      if (typeof window === 'undefined') return [];
      return Object.keys(window.localStorage);
    },
  };
} else {
  const { MMKV } = require('react-native-mmkv');
  const instance = new MMKV({
    id: 'shkolyaryk-storage',
    encryptionKey: process.env.EXPO_PUBLIC_MMKV_ENCRYPTION_KEY ?? 'shkolyaryk-enc-key',
  });
  mmkvStorage = {
    getString: (key) => instance.getString(key),
    set: (key, value) => instance.set(key, value),
    delete: (key) => instance.delete(key),
    clearAll: () => instance.clearAll(),
    getAllKeys: () => instance.getAllKeys(),
  };
}

export { mmkvStorage };

export const storage = mmkvStorage;
