// Чисте ядро підказки про непокриту передумову (EP12): без БД/React — лише
// вибір найдоречнішої непройденої передумови серед навичок, які тренувала гра.
// Джерело фічі: skill-graph (A2) + mastery-движок (A4) уже є в проді — тут ми
// вперше використовуємо DAG передумов для дитячого фідбеку, не лише для frontier.
// IO (fetch skills/prereqs/mastery) — у hint.ts. Дзеркалить стиль mastery-core.ts.

import type { MasteryStatus, Skill, SkillPrerequisite } from './types';

export interface PrereqHint {
  skillId: string;
  title: string;
}

/**
 * Поріг «слабкого» результату гри (у зірках). computeStars (games/types.ts)
 * ніколи не повертає 0 — мінімум 1⭐, тож поріг «≤1» і означає «найгірший
 * можливий результат», а не довільне число.
 */
export const WEAK_RESULT_STARS_THRESHOLD = 1;

/** Чи достатньо слабкий результат, щоб доречно було показати підказку про передумову. */
export function isWeakResult(stars: 0 | 1 | 2 | 3): boolean {
  return stars <= WEAK_RESULT_STARS_THRESHOLD;
}

/**
 * Найдоречніша непокрита передумова навичок, які тренувала гра на зіграній складності.
 *
 * Розглядає лише ПРЯМІ (одне ребро DAG) prerequisites зіграних skillIds — навмисно
 * не йде транзитивно вглиб дерева, щоб підказка лишалась «найближчою» причиною
 * труднощів, а не показувала корінь усього дерева передумов.
 *
 * Серед кількох непокритих кандидатів обирає з найменшим `sort` (раніше в
 * навчальній програмі → найбільш фундаментальна прогалина); тай-брейк — за `id`
 * для детермінізму. Немає кандидатів (усі покриті, або зіграні навички —
 * коренева навичка без prerequisites) → null (дитина просто помилилась, не
 * має структурної прогалини).
 */
export function findUncoveredPrerequisite(
  gameSkillIds: string[],
  skills: Pick<Skill, 'id' | 'title' | 'sort'>[],
  prereqs: SkillPrerequisite[],
  statusById: Map<string, MasteryStatus>,
): PrereqHint | null {
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const playedSet = new Set(gameSkillIds);
  const seen = new Set<string>();
  const candidates: Pick<Skill, 'id' | 'title' | 'sort'>[] = [];

  for (const p of prereqs) {
    if (!playedSet.has(p.skill_id)) continue;
    const preId = p.prerequisite_id;
    if (seen.has(preId)) continue;
    seen.add(preId);

    const status = statusById.get(preId) ?? 'locked'; // немає рядка mastery = ще не опановано
    if (status === 'mastered') continue;

    const skill = skillById.get(preId);
    if (!skill) continue; // захист від неузгоджених даних (edge без відповідного skill)
    candidates.push(skill);
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));
  const best = candidates[0];
  return { skillId: best.id, title: best.title };
}

/** Дружній до дитини (4–10) текст підказки — підтримка, а не докір. */
export function buildPrereqHintMessage(title: string): string {
  return `Щоб це давалось легше, спершу потренуй: «${title}»`;
}
