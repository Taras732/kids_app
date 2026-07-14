// Генератор плану дня «Мій день» (B1) — чиста детермінована логіка.
// Без IO, без supabase, без Date.now(): дата приходить параметром, жодного random —
// результат повністю відтворюваний за входом.
//
// Правила добору (BRIEF SHK-B1):
//   • review  — навички status==='mastered', у яких від last_practiced_at минуло
//                щонайменше review_interval_days календарних днів відносно date
//                (spaced repetition). kind='review', ref_id=gameId якщо гра є, інакше null.
//   • frontier — навички status==='frontier', що МАЮТЬ гру в gameBySkill → kind='game',
//                ref_id=gameId. Frontier без гри пропускаємо (нема чим тренувати).
//   • порядок  — спершу review (за skill.sort), потім frontier (за skill.sort);
//                стабільний тай-брейк по skill_id; обрізати до targetCount; sort=0..n-1.

import type { Skill, SkillMastery, DailyPlanItemInsert } from './types';

const MS_PER_DAY = 86_400_000;
const DEFAULT_TARGET_COUNT = 5;

export interface BuildDayPlanInput {
  /** Повний довідник навичок (skill-graph). */
  skills: Skill[];
  /** Матеріалізовані статуси навичок профілю (frontier/mastered). */
  mastery: SkillMastery[];
  /** Зворотний індекс skillId → gameId (гра, що тренує навичку). */
  gameBySkill: Map<string, string>;
  /** Дата плану 'YYYY-MM-DD' — база для review-інтервалів. */
  date: string;
  /** Максимум кроків у плані (деф. 5). */
  targetCount?: number;
}

/** Ціла кількість календарних днів (UTC) від дати last_practiced_at до date. */
function daysElapsed(lastPracticedAt: string, date: string): number {
  const last = Date.parse(lastPracticedAt);
  const plan = Date.parse(`${date}T00:00:00.000Z`);
  if (Number.isNaN(last) || Number.isNaN(plan)) return 0;
  // нормалізуємо обидві мітки до початку їхньої UTC-доби → порівнюємо календарні дні,
  // незалежно від часу доби last_practiced_at.
  const lastDay = Math.floor(last / MS_PER_DAY);
  const planDay = Math.floor(plan / MS_PER_DAY);
  return planDay - lastDay;
}

/**
 * Review настав, якщо навичка mastered, має відмітку last_practiced_at і від неї
 * минуло >= review_interval_days календарних днів відносно date.
 * last_practiced_at === null → НЕ due (немає сигналу практики; напр. mastered з placement) —
 * щоб не заливати план ревʼю замість нового навчання (frontier).
 */
function isReviewDue(skill: Skill, m: SkillMastery, date: string): boolean {
  if (m.last_practiced_at === null) return false;
  return daysElapsed(m.last_practiced_at, date) >= skill.review_interval_days;
}

interface Candidate {
  item: DailyPlanItemInsert;
  sort: number;
  id: string;
}

const bySortThenId = (a: Candidate, b: Candidate): number =>
  a.sort - b.sort || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

export function buildDayPlan(input: BuildDayPlanInput): DailyPlanItemInsert[] {
  const { skills, mastery, gameBySkill, date } = input;
  const targetCount = input.targetCount ?? DEFAULT_TARGET_COUNT;
  if (targetCount <= 0) return [];

  const skillById = new Map(skills.map((s) => [s.id, s]));

  const reviews: Candidate[] = [];
  const frontiers: Candidate[] = [];

  for (const m of mastery) {
    const skill = skillById.get(m.skill_id);
    if (!skill) continue;

    if (m.status === 'mastered') {
      if (!isReviewDue(skill, m, date)) continue;
      reviews.push({
        id: skill.id,
        sort: skill.sort,
        item: {
          kind: 'review',
          ref_id: gameBySkill.get(skill.id) ?? null,
          skill_id: skill.id,
          status: 'pending',
          result: null,
          sort: 0,
        },
      });
    } else if (m.status === 'frontier') {
      const gameId = gameBySkill.get(skill.id);
      if (!gameId) continue; // frontier без гри — нема чим тренувати
      frontiers.push({
        id: skill.id,
        sort: skill.sort,
        item: {
          kind: 'game',
          ref_id: gameId,
          skill_id: skill.id,
          status: 'pending',
          result: null,
          sort: 0,
        },
      });
    }
  }

  reviews.sort(bySortThenId);
  frontiers.sort(bySortThenId);

  return [...reviews, ...frontiers]
    .slice(0, targetCount)
    .map((c, i) => ({ ...c.item, sort: i }));
}
