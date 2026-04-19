import { BADGES, type BadgeContext } from '@/src/constants/badges';
import { listGames } from '@/src/games/registry';

interface ProgressSnapshot {
  xpByProfile: Record<string, number>;
  badgesByProfile: Record<string, string[]>;
  gameProgressByProfile: Record<string, Record<string, import('@/src/stores/progressStore').GameProgress>>;
}

const XP_PER_LEVEL = 100;

export function buildBadgeContext(state: ProgressSnapshot, profileId: string): BadgeContext {
  const games = state.gameProgressByProfile[profileId] ?? {};
  const xp = state.xpByProfile[profileId] ?? 0;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;

  const playedGameIds = new Set(Object.keys(games));
  const playedIslandIds = new Set<string>();
  for (const g of listGames()) {
    if (playedGameIds.has(g.id) && g.islandId) {
      playedIslandIds.add(g.islandId);
    }
  }

  return { profileId, xp, level, games, playedIslandIds };
}

export function evaluateBadges(state: ProgressSnapshot, profileId: string): string[] {
  const ctx = buildBadgeContext(state, profileId);
  const earned = new Set(state.badgesByProfile[profileId] ?? []);
  const newly: string[] = [];
  for (const badge of BADGES) {
    if (earned.has(badge.id)) continue;
    if (badge.predicate(ctx)) newly.push(badge.id);
  }
  return newly;
}
