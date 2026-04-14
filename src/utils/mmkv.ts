import { Platform } from 'react-native';

interface KVStore {
  getString(key: string): string | undefined;
  set(key: string, value: string | number | boolean): void;
  delete(key: string): void;
  clearAll(): void;
  getAllKeys(): string[];
}

let storage: KVStore;

if (Platform.OS === 'web') {
  storage = {
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
  const mmkv = new MMKV({ id: 'shkolyaryk' });
  storage = {
    getString: (key) => mmkv.getString(key),
    set: (key, value) => mmkv.set(key, value),
    delete: (key) => mmkv.delete(key),
    clearAll: () => mmkv.clearAll(),
    getAllKeys: () => mmkv.getAllKeys(),
  };
}

export { storage };
