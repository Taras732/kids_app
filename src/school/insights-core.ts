// P1 — інсайт для батька: діагноз + що конкретно робити. Чиста логіка (без БД/React).
//
// Навіщо: кабінет показує «прогрес 60%» і стрік. Батько з цього не знає, ЩО
// робити — а саме за цим він і приходить. Інсайт відповідає на два питання:
// «де саме затик?» і «що зробити сьогодні?».
//
// Пріоритет діагнозів (від найкориснішого):
//  1. прогалина в передумові — дитина буксує, бо не має ФУНДАМЕНТУ (DAG, EP12);
//  2. навичка, яка не дається — багато спроб, низька успішність;
//  3. готовність рухатись далі — усе опановано, можна відкривати нове;
//  4. ще мало даних — чесно кажемо, що робити висновки рано.
//
// Порада — це завжди КОНКРЕТНА дія (гра, яку можна відкрити), а не «займайтесь більше».

import type { Attempt, Skill, SkillMastery, SkillPrerequisite } from './types';

export type InsightKind = 'prerequisite-gap' | 'struggling-skill' | 'ready-to-advance' | 'not-enough-data';

export interface InsightAction {
  /** Що робити — дитячою/батьківською мовою. */
  label: string;
  /** Гра, яку можна відкрити (якщо є). */
  gameId?: string;
}

export interface ParentInsight {
  kind: InsightKind;
  /** Заголовок — суть діагнозу одним рядком. */
  title: string;
  /** Пояснення «чому саме так» — на чому ґрунтується висновок. */
  why: string;
  /** Навичка, якої стосується діагноз. */
  skill?: Skill;
  /** До 3 конкретних дій. */
  actions: InsightAction[];
}

/** Замало спроб, щоб робити висновки — краще сказати чесно, ніж вигадати діагноз. */
export const MIN_ATTEMPTS_FOR_INSIGHT = 3;
/** Нижче цієї частки успіху навичка вважається такою, що не дається. */
export const STRUGGLING_ACCURACY = 0.6;
/** Скільки спроб по навичці треба, щоб назвати її проблемною (а не випадковою невдачею). */
export const MIN_ATTEMPTS_PER_SKILL = 2;

interface SkillStat {
  skillId: string;
  attempts: number;
  correct: number;
  total: number;
  accuracy: number;
}

/** Статистика успішності по навичках зі спроб. */
export function skillStats(attempts: Attempt[]): Map<string, SkillStat> {
  const acc = new Map<string, SkillStat>();
  for (const a of attempts) {
    if (!a.skill_id || a.total <= 0) continue;
    const cur = acc.get(a.skill_id) ?? { skillId: a.skill_id, attempts: 0, correct: 0, total: 0, accuracy: 0 };
    cur.attempts += 1;
    cur.correct += a.correct;
    cur.total += a.total;
    cur.accuracy = cur.total > 0 ? cur.correct / cur.total : 0;
    acc.set(a.skill_id, cur);
  }
  return acc;
}

/**
 * Непокрита передумова навички, яка не дається. На відміну від дитячої підказки
 * (hint-core, одне ребро), тут беремо ті самі ПРЯМІ передумови — батькові теж
 * потрібна найближча причина, а не корінь усього дерева.
 */
function findGap(
  skillId: string,
  skills: Skill[],
  prereqs: SkillPrerequisite[],
  masteryById: Map<string, SkillMastery>,
): Skill | null {
  const byId = new Map(skills.map((s) => [s.id, s]));
  const candidates = prereqs
    .filter((p) => p.skill_id === skillId)
    .map((p) => byId.get(p.prerequisite_id))
    .filter((s): s is Skill => !!s)
    .filter((s) => (masteryById.get(s.id)?.status ?? 'locked') !== 'mastered');

  if (candidates.length === 0) return null;
  // найфундаментальніша прогалина = найраніша в програмі
  candidates.sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));
  return candidates[0];
}

function actionsFor(skill: Skill, gamesBySkill: Map<string, string[]>): InsightAction[] {
  const games = gamesBySkill.get(skill.id) ?? [];
  const out: InsightAction[] = games.slice(0, 2).map((gameId) => ({
    label: `Пограти разом: «${skill.title}»`,
    gameId,
  }));
  // офлайн-дія доречна завжди: перенесення на папір — наш paper-transfer
  out.push({ label: `Спитати за вечерею одне завдання на «${skill.title}» — усно, без зошита` });
  return out.slice(0, 3);
}

export interface InsightsInput {
  skills: Skill[];
  mastery: SkillMastery[];
  prereqs: SkillPrerequisite[];
  attempts: Attempt[];
  /** skillId → ігри, що її тренують. */
  gamesBySkill: Map<string, string[]>;
}

/**
 * Головний інсайт для батька. Повертає рівно один — найкорисніший: батько не
 * читатиме список із п'яти порад, він хоче знати, що робити СЬОГОДНІ.
 */
export function buildParentInsight(input: InsightsInput): ParentInsight {
  const { skills, mastery, prereqs, attempts, gamesBySkill } = input;
  const masteryById = new Map(mastery.map((m) => [m.skill_id, m]));
  const skillById = new Map(skills.map((s) => [s.id, s]));
  const stats = skillStats(attempts);

  // 4. Замало даних — чесно, без вигаданого діагнозу.
  if (attempts.length < MIN_ATTEMPTS_FOR_INSIGHT) {
    return {
      kind: 'not-enough-data',
      title: 'Ще трохи зарано робити висновки',
      why: `Дитина зіграла ${attempts.length} ${attempts.length === 1 ? 'раз' : 'рази'}. Порада зʼявиться, коли назбирається трохи більше — щоб вона була про справжній затик, а не про випадкову помилку.`,
      actions: [{ label: 'Просто дайте погратись кілька днів — далі підкажемо, на що звернути увагу' }],
    };
  }

  // Навички, які не даються: достатньо спроб і низька успішність.
  const struggling = [...stats.values()]
    .filter((s) => s.attempts >= MIN_ATTEMPTS_PER_SKILL && s.accuracy < STRUGGLING_ACCURACY)
    .filter((s) => skillById.has(s.skillId))
    .sort((a, b) => a.accuracy - b.accuracy || a.skillId.localeCompare(b.skillId));

  if (struggling.length > 0) {
    const worst = struggling[0];
    const skill = skillById.get(worst.skillId)!;
    const pct = Math.round(worst.accuracy * 100);

    // 1. Прогалина в передумові — найцінніший діагноз: причина не в темі, а нижче.
    const gap = findGap(skill.id, skills, prereqs, masteryById);
    if (gap) {
      return {
        kind: 'prerequisite-gap',
        title: `Схоже, справа не в темі «${skill.title}»`,
        why: `Тут виходить ${pct}% правильних. Але нижче за програмою є «${gap.title}» — вона ще не засвоєна. Найчастіше буксує саме через це: тема стоїть на фундаменті, якого поки немає.`,
        skill: gap,
        actions: actionsFor(gap, gamesBySkill),
      };
    }

    // 2. Навичка просто не дається — фундамент є, треба практика.
    return {
      kind: 'struggling-skill',
      title: `Варто підтягнути: «${skill.title}»`,
      why: `Тут виходить ${pct}% правильних — помітно нижче, ніж деінде. Усе, що потрібно нижче за програмою, дитина вже вміє, тож справа саме в практиці цієї теми.`,
      skill,
      actions: actionsFor(skill, gamesBySkill),
    };
  }

  // 3. Усе йде добре — кажемо, куди рухатись далі.
  const frontier = mastery
    .filter((m) => m.status === 'frontier')
    .map((m) => skillById.get(m.skill_id))
    .filter((s): s is Skill => !!s)
    .sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));

  if (frontier.length > 0) {
    const next = frontier[0];
    return {
      kind: 'ready-to-advance',
      title: 'Труднощів немає — можна рухатись далі',
      why: `Те, що дитина проходила, дається добре. Наступна тема за програмою — «${next.title}».`,
      skill: next,
      actions: actionsFor(next, gamesBySkill),
    };
  }

  return {
    kind: 'ready-to-advance',
    title: 'Труднощів немає',
    why: 'Усе, що дитина проходила останнім часом, дається добре.',
    actions: [{ label: 'Можна спокійно продовжувати за планом дня' }],
  };
}
