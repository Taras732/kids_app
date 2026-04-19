import type { GameProgress } from '@/src/stores/progressStore';
import { ISLANDS } from './islands';
import { listGames } from '@/src/games/registry';

export interface BadgeContext {
  profileId: string;
  xp: number;
  level: number;
  games: Record<string, GameProgress>;
  playedIslandIds: Set<string>;
}

export interface BadgeDef {
  id: string;
  icon: string;
  islandId?: string;
  predicate: (ctx: BadgeContext) => boolean;
}

const TOTAL_ISLANDS = ISLANDS.length;

function gamesByIsland(ctx: BadgeContext, islandId: string): GameProgress[] {
  const gameIdsForIsland = new Set(
    listGames().filter((g) => g.islandId === islandId).map((g) => g.id),
  );
  return Object.values(ctx.games).filter((p) => gameIdsForIsland.has(p.gameId));
}

function countThreeStars(games: GameProgress[]): number {
  return games.filter((g) => g.bestScore >= 3).length;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first-game',
    icon: '🌟',
    predicate: (ctx) => Object.keys(ctx.games).length >= 1,
  },
  {
    id: 'first-stars-3',
    icon: '✨',
    predicate: (ctx) => Object.values(ctx.games).some((g) => g.bestScore >= 3),
  },
  {
    id: 'ten-games',
    icon: '🔟',
    predicate: (ctx) =>
      Object.values(ctx.games).reduce((sum, g) => sum + g.playCount, 0) >= 10,
  },
  {
    id: 'fifty-games',
    icon: '🏅',
    predicate: (ctx) =>
      Object.values(ctx.games).reduce((sum, g) => sum + g.playCount, 0) >= 50,
  },
  {
    id: 'all-islands',
    icon: '🗺️',
    predicate: (ctx) => ctx.playedIslandIds.size >= TOTAL_ISLANDS,
  },
  {
    id: 'math-master',
    icon: '🔢',
    islandId: 'math',
    predicate: (ctx) => countThreeStars(gamesByIsland(ctx, 'math')) >= 3,
  },
  {
    id: 'letters-first',
    icon: '📖',
    islandId: 'letters',
    predicate: (ctx) => gamesByIsland(ctx, 'letters').length >= 1,
  },
  {
    id: 'memory-master',
    icon: '🧠',
    islandId: 'memory',
    predicate: (ctx) => countThreeStars(gamesByIsland(ctx, 'memory')) >= 3,
  },
  {
    id: 'english-first',
    icon: '🇬🇧',
    islandId: 'english',
    predicate: (ctx) => gamesByIsland(ctx, 'english').length >= 1,
  },
  {
    id: 'emotions-first',
    icon: '💚',
    islandId: 'emotions',
    predicate: (ctx) => gamesByIsland(ctx, 'emotions').length >= 1,
  },
  {
    id: 'science-first',
    icon: '🔬',
    islandId: 'science',
    predicate: (ctx) => gamesByIsland(ctx, 'science').length >= 1,
  },
  {
    id: 'level-5',
    icon: '⭐',
    predicate: (ctx) => ctx.level >= 5,
  },
];

export const BADGE_IDS = BADGES.map((b) => b.id);

export function getBadge(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
