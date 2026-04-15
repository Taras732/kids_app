import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './middleware/mmkvPersist';
import type { AgeGroupId } from '../constants/ageGroups';

export interface ChildProfile {
  id: string;
  name: string;
  ageGroupId: AgeGroupId;
  avatarId: string;
  createdAt: number;
}

interface ChildProfilesState {
  profiles: ChildProfile[];
  activeProfileId: string | null;
  addProfile: (profile: Omit<ChildProfile, 'id' | 'createdAt'>) => string;
  updateProfile: (id: string, patch: Partial<Omit<ChildProfile, 'id' | 'createdAt'>>) => void;
  removeProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  getActiveProfile: () => ChildProfile | null;
}

const generateId = (): string =>
  `child_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useChildProfilesStore = create<ChildProfilesState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,
      addProfile: (input) => {
        const id = generateId();
        const profile: ChildProfile = { ...input, id, createdAt: Date.now() };
        set((state) => ({
          profiles: [...state.profiles, profile],
          activeProfileId: state.activeProfileId ?? id,
        }));
        return id;
      },
      updateProfile: (id, patch) =>
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      removeProfile: (id) =>
        set((state) => {
          const remaining = state.profiles.filter((p) => p.id !== id);
          let nextActive = state.activeProfileId;
          if (state.activeProfileId === id) {
            nextActive = remaining[0]?.id ?? null;
          }
          return { profiles: remaining, activeProfileId: nextActive };
        }),
      setActiveProfile: (id) => set({ activeProfileId: id }),
      getActiveProfile: () => {
        const { profiles, activeProfileId } = get();
        return profiles.find((p) => p.id === activeProfileId) ?? null;
      },
    }),
    {
      name: 'child-profiles',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
