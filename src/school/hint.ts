// Підказка про непокриту передумову (EP12), IO-шар. Чиста логіка — у hint-core.ts.
// Дзеркалить стиль mastery.ts/offline.ts: тонка async-обгортка над db.ts.
//
// Гейт «лише для синхронізованих профілів» — на боці викликача (GameShell, як і
// для recordGameResult): цей модуль не знає про auth-стан, лише про profileId.

import { fetchSkills, fetchSkillPrerequisites, fetchMastery } from './db';
import { findUncoveredPrerequisite } from './hint-core';
import type { PrereqHint } from './hint-core';

export type { PrereqHint };

/**
 * Підказка про найдоречнішу непокриту передумову зіграних навичок для профілю.
 * Кидає при помилках БД — викликати fire-and-forget з .catch (не блокувати
 * екран результату, як recordGameResult).
 */
export async function fetchPrereqHint(profileId: string, gameSkillIds: string[]): Promise<PrereqHint | null> {
  if (gameSkillIds.length === 0) return null;

  const [skills, prereqs, mastery] = await Promise.all([
    fetchSkills(),
    fetchSkillPrerequisites(),
    fetchMastery(profileId),
  ]);

  const statusById = new Map(mastery.map((m) => [m.skill_id, m.status]));
  return findUncoveredPrerequisite(gameSkillIds, skills, prereqs, statusById);
}
