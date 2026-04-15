import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './middleware/mmkvPersist';

interface OnboardingState {
  hasChosenLanguage: boolean;
  hasSeenWelcome: boolean;
  hydrated: boolean;
  markLanguageChosen: () => void;
  markWelcomeSeen: () => void;
  resetOnboarding: () => void;
  setHydrated: (v: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasChosenLanguage: false,
      hasSeenWelcome: false,
      hydrated: false,
      markLanguageChosen: () => set({ hasChosenLanguage: true }),
      markWelcomeSeen: () => set({ hasSeenWelcome: true }),
      resetOnboarding: () => set({ hasChosenLanguage: false, hasSeenWelcome: false }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'onboarding',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        hasChosenLanguage: state.hasChosenLanguage,
        hasSeenWelcome: state.hasSeenWelcome,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
