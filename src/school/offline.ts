// Офлайн-флоу (C1), IO-шар. Чиста логіка (вибір/мапінг/валідація payload) — у offline-core.ts.
// Дзеркалить стиль mastery.ts: тонкі async-функції над db.ts, кидають при помилках БД
// (викликати з .catch там, де не можна блокувати UI).

import { fetchOfflineTasks, updatePlanItemStatus } from './db';
import { offlineTasksToPlanItems, selectOfflineTasksForBand } from './offline-core';
import type { DailyPlanItemInsert, GradeBand, OfflineTask } from './types';

/** Офлайн-завдання (workbook/worksheet/activity), доступні для рівня дитини. */
export async function fetchOfflineTasksForBand(band: GradeBand): Promise<OfflineTask[]> {
  const tasks = await fetchOfflineTasks();
  return selectOfflineTasksForBand(tasks, band);
}

/**
 * Підібрати офлайн-завдання для профілю й одразу перетворити на кроки плану дня
 * (готові для createDailyPlan). `startSort` — з якого sort продовжити список кроків.
 */
export async function pickOfflineTasksForProfile(
  band: GradeBand,
  count: number,
  startSort = 0,
): Promise<DailyPlanItemInsert[]> {
  const tasks = await fetchOfflineTasksForBand(band);
  return offlineTasksToPlanItems(tasks.slice(0, Math.max(0, count)), startSort);
}

/** Позначити крок плану (offline-завдання) виконаним. */
export async function completeOfflineTask(itemId: string, result?: Record<string, unknown>): Promise<void> {
  await updatePlanItemStatus(itemId, 'done', result);
}
