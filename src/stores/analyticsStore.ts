import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from './middleware/mmkvPersist';

export interface AnalyticsEvent {
  id: string;
  name: string;
  metadata: Record<string, unknown>;
  profileId: string | null;
  createdAt: number;
  syncedAt: number | null;
}

interface AnalyticsState {
  events: AnalyticsEvent[];
  track: (name: string, metadata?: Record<string, unknown>, profileId?: string | null) => void;
  markSynced: (ids: string[]) => void;
  clearSynced: () => void;
}

const generateId = (): string =>
  `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      events: [],
      track: (name, metadata = {}, profileId = null) =>
        set((state) => ({
          events: [
            ...state.events,
            {
              id: generateId(),
              name,
              metadata,
              profileId,
              createdAt: Date.now(),
              syncedAt: null,
            },
          ],
        })),
      markSynced: (ids) =>
        set((state) => ({
          events: state.events.map((e) =>
            ids.includes(e.id) ? { ...e, syncedAt: Date.now() } : e,
          ),
        })),
      clearSynced: () =>
        set((state) => ({ events: state.events.filter((e) => e.syncedAt === null) })),
    }),
    {
      name: 'analytics',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
