import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './middleware/mmkvPersist';
import type { Locale } from '../i18n';
import { setLocale } from '../i18n';

interface SettingsState {
  locale: Locale;
  soundEnabled: boolean;
  musicEnabled: boolean;
  parentPin: string | null;
  dailyTimeLimitMinutes: number | null;
  setLocale: (locale: Locale) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setParentPin: (pin: string | null) => void;
  setDailyTimeLimit: (minutes: number | null) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: 'uk',
      soundEnabled: true,
      musicEnabled: true,
      parentPin: null,
      dailyTimeLimitMinutes: null,
      setLocale: (locale) => {
        setLocale(locale);
        set({ locale });
      },
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      setParentPin: (pin) => set({ parentPin: pin }),
      setDailyTimeLimit: (minutes) => set({ dailyTimeLimitMinutes: minutes }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => mmkvStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.locale) setLocale(state.locale);
      },
    },
  ),
);
