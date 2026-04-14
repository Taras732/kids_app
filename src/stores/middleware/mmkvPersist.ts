import type { StateStorage } from 'zustand/middleware';
import { storage } from '../../utils/mmkv';

export const mmkvStorage: StateStorage = {
  getItem: (key) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  setItem: (key, value) => {
    storage.set(key, value);
  },
  removeItem: (key) => {
    storage.delete(key);
  },
};
