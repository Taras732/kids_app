// Чиста логіка «Мій день» (B2): сортування кроків плану + евристика автопозначення
// ігор/повторень «зроблено». Без IO/React — юніт-тестується напряму (vitest).

import type { DailyPlanItem, DailyPlanItemStatus, DailyPlanItemKind } from '@/school/types';

/**
 * Захисне сортування кроків плану за sort. Для щойно створеного плану
 * createDailyPlan (school/db.ts) робить insert+select без .order(), тож порядок
 * повернутих рядків не гарантований — сортуємо на клієнті перед рендером.
 */
export function sortPlanItems<T extends { sort: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort - b.sort);
}

/** Кількість кроків плану, які вже не 'pending' (done або skipped). */
export function countCompleted(items: Array<{ status: DailyPlanItemStatus }>): number {
  return items.filter((i) => i.status !== 'pending').length;
}

interface ProgressEntry {
  updated_at: string;
}

/**
 * MVP-евристика автопозначення ігрових/review-кроків «Мій день» (BRIEF SHK-B2):
 * якщо крок kind='game'|'review' ще 'pending', але прогрес дитини по цій грі
 * (item.ref_id → useProfileStore.progress[gameId]) оновлювався сьогодні (у день
 * плану) — вважаємо, що дитина зіграла й повернулась на «Мій день», і повертаємо
 * id таких кроків для позначення 'done'. Не патчить GameShell/GamePlayer.
 *
 * Задокументовані обмеження (не хак, а свідомий компроміс MVP):
 *  - порівняння за календарною датою з updated_at, який завжди пишеться в UTC
 *    (GameShell/useProfileStore) — на межі доби можлива розбіжність із
 *    локальним часом дитини;
 *  - якщо та сама гра трапляється в плані двічі (напр. і як 'game', і як
 *    'review' для різних навичок) — обидва кроки позначаться зі спільного
 *    updated_at, навіть якщо зіграно лише один раз.
 */
export function findAutoCompletableGameItemIds(
  items: Array<Pick<DailyPlanItem, 'id' | 'kind' | 'ref_id' | 'status'>>,
  progress: Record<string, ProgressEntry | undefined>,
  date: string,
): string[] {
  return items
    .filter((i) => (i.kind === 'game' || i.kind === 'review') && i.status === 'pending' && i.ref_id)
    .filter((i) => (progress[i.ref_id as string]?.updated_at ?? '').slice(0, 10) === date)
    .map((i) => i.id);
}

/** Офлайн-кроки плану — виконуються поза екраном (workbook/worksheet/activity). */
const OFFLINE_KINDS: readonly DailyPlanItemKind[] = ['workbook', 'worksheet', 'activity'];

export function isOfflinePlanItem(kind: DailyPlanItemKind): boolean {
  return OFFLINE_KINDS.includes(kind);
}

/**
 * Розділити кроки плану на екранні (game/review — грає дитина) та офлайн
 * (workbook/worksheet/activity — виконуються на папері, підтверджує батько у
 * кабінеті, E2). Порядок усередині кожної групи зберігається.
 */
export function partitionPlanItems<T extends { kind: DailyPlanItemKind }>(
  items: T[],
): { screen: T[]; offline: T[] } {
  const screen: T[] = [];
  const offline: T[] = [];
  for (const it of items) (isOfflinePlanItem(it.kind) ? offline : screen).push(it);
  return { screen, offline };
}
