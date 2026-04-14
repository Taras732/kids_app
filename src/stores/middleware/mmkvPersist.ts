import type { StateStorage } from 'zustand/middleware';
import { mmkvStorage } from '../../utils/mmkv';

export const zustandMmkvStorage: StateStorage = {
  getItem: (key) => mmkvStorage.getString(key) ?? null,
  setItem: (key, value) => mmkvStorage.set(key, value),
  removeItem: (key) => mmkvStorage.delete(key),
};

export { zustandMmkvStorage as mmkvStorage };
