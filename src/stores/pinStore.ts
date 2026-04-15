import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './middleware/mmkvPersist';

interface PinState {
  pinHash: string | null;
  failedAttempts: number;
  lockedUntil: number | null;
  unlocked: boolean;
  setPin: (pin: string) => void;
  clearPin: () => void;
  verifyPin: (pin: string) => boolean;
  registerFailure: () => void;
  resetFailures: () => void;
  isLocked: () => boolean;
  setUnlocked: (v: boolean) => void;
}

function hashPin(pin: string): string {
  let h = 5381;
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) + h) ^ pin.charCodeAt(i);
  }
  return `djb2:${(h >>> 0).toString(16)}`;
}

const LOCKOUT_MS = 60_000;
const LOCKOUT_AFTER = 5;

export const usePinStore = create<PinState>()(
  persist(
    (set, get) => ({
      pinHash: null,
      failedAttempts: 0,
      lockedUntil: null,
      unlocked: false,
      setPin: (pin) => set({ pinHash: hashPin(pin), failedAttempts: 0, lockedUntil: null, unlocked: true }),
      clearPin: () => set({ pinHash: null, failedAttempts: 0, lockedUntil: null, unlocked: false }),
      setUnlocked: (v) => set({ unlocked: v }),
      verifyPin: (pin) => {
        const { pinHash } = get();
        if (!pinHash) return false;
        return pinHash === hashPin(pin);
      },
      registerFailure: () =>
        set((state) => {
          const next = state.failedAttempts + 1;
          return {
            failedAttempts: next,
            lockedUntil: next >= LOCKOUT_AFTER ? Date.now() + LOCKOUT_MS : state.lockedUntil,
          };
        }),
      resetFailures: () => set({ failedAttempts: 0, lockedUntil: null }),
      isLocked: () => {
        const { lockedUntil } = get();
        return !!lockedUntil && lockedUntil > Date.now();
      },
    }),
    {
      name: 'parent-pin',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({ pinHash: s.pinHash }),
    },
  ),
);
