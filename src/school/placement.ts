// IO-обгортка placement-діагностики (A5). Чиста логіка — у placement-core.ts.
// Повторно використовує mastery-движок (A4): upsertMasteryMany + recomputeFrontier,
// НЕ дублюючи логіку статусів. Тонко.

import { fetchSkills, upsertMasteryMany } from './db';
import { recomputeFrontier } from './mastery';
import { placementToMasteryRows, type PlacementStrand } from './placement-core';
import type { GradeBand } from './types';

/**
 * Застосувати результати діагностики: виставити стартові mastery по strands і
 * перерахувати frontier. Викликати лише для синхронізованих профілів (є user.id) —
 * гість не має рядка profiles у БД (upsert впав би на FK). Кидає при помилках БД.
 *
 * Пишемо флор status='locked' на всі рядки; recomputeFrontier авторитетно підніме
 * їх до frontier/mastered за поточними mastery (нижче resultLevel → mastered,
 * на рівні з опанованими prereqs → frontier).
 */
export async function applyPlacement(
  profileId: string,
  resultsByStrand: Partial<Record<PlacementStrand, GradeBand>>,
): Promise<void> {
  const skills = await fetchSkills();
  const rows = placementToMasteryRows(resultsByStrand, skills);
  if (rows.length > 0) {
    await upsertMasteryMany(
      rows.map((r) => ({
        profile_id: profileId,
        skill_id: r.skill_id,
        mastery: r.mastery,
        status: 'locked' as const,
        last_practiced_at: null,
      })),
    );
  }
  await recomputeFrontier(profileId);
}
