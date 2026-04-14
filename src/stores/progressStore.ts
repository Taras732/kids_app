import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './middleware/mmkvPersist';

export interface GameProgress {
  gameId: string;
  playCount: number;
  bestScore: number;
  lastDifficulty: number;
  lastPlayedAt: number;
}

interface ProgressState {
  xpByProfile: Record<string, number>;
  badgesByProfile: Record<string, string[]>;
  gameProgressByProfile: Record<string, Record<string, GameProgress>>;
  addXp: (profileId: string, amount: number) => void;
  awardBadge: (profileId: string, badgeId: string) => void;
  recordGameSession: (profileId: string, gameId: string, score: number, difficulty: number) => void;
  getXp: (profileId: string) => number;
  getLevel: (profileId: string) => number;
}

const XP_PER_LEVEL = 100;

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      xpByProfile: {},
      badgesByProfile: {},
      gameProgressByProfile: {},
      addXp: (profileId, amount) =>
        set((state) => ({
          xpByProfile: {
            ...state.xpByProfile,
            [profileId]: (state.xpByProfile[profileId] ?? 0) + amount,
          },
        })),
      awardBadge: (profileId, badgeId) =>
        set((state) => {
          const current = state.badgesByProfile[profileId] ?? [];
          if (current.includes(badgeId)) return state;
          return {
            badgesByProfile: { ...state.badgesByProfile, [profileId]: [...current, badgeId] },
          };
        }),
      recordGameSession: (profileId, gameId, score, difficulty) =>
        set((state) => {
          const profileGames = state.gameProgressByProfile[profileId] ?? {};
          const existing = profileGames[gameId];
          const updated: GameProgress = {
            gameId,
            playCount: (existing?.playCount ?? 0) + 1,
            bestScore: Math.max(existing?.bestScore ?? 0, score),
            lastDifficulty: difficulty,
            lastPlayedAt: Date.now(),
          };
          return {
            gameProgressByProfile: {
              ...state.gameProgressByProfile,
              [profileId]: { ...profileGames, [gameId]: updated },
            },
          };
        }),
      getXp: (profileId) => get().xpByProfile[profileId] ?? 0,
      getLevel: (profileId) => Math.floor((get().xpByProfile[profileId] ?? 0) / XP_PER_LEVEL) + 1,
    }),
    {
      name: 'progress',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
