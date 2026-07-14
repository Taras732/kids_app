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

import { pickOfflineTasks, offlineTasksToPlanItems } from './offline-core';
import type {
  Skill,
  SkillMastery,
  MasteryStatus,
  DailyPlanItemInsert,
  OfflineTask,
  GradeBand,
} from './types';

const MS_PER_DAY = 86_400_000;
const DEFAULT_TARGET_COUNT = 5;
const DEFAULT_OFFLINE_COUNT = 1;
/** Порядок рівнів для порівняння «вищий band». */
const GRADE_ORDER: readonly GradeBand[] = ['L0', 'L1', 'L2', 'L3', 'L4'];

export interface BuildDayPlanInput {
  /** Повний довідник навичок (skill-graph). */
  skills: Skill[];
  /** Матеріалізовані статуси навичок профілю (frontier/mastered). */
  mastery: SkillMastery[];
  /** Зворотний індекс skillId → gameId (гра, що тренує навичку). */
  gameBySkill: Map<string, string>;
  /** Дата плану 'YYYY-MM-DD' — база для review-інтервалів. */
  date: string;
  /** Максимум ЕКРАННИХ кроків (game/review) у плані (деф. 5). */
  targetCount?: number;
  /** Довідник офлайн-завдань (workbook/worksheet/activity). Порожньо/відсутньо → без офлайн. */
  offlineTasks?: OfflineTask[];
  /** Скільки офлайн-кроків домішати понад екранні (деф. 1). */
  offlineCount?: number;
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

/**
 * Оцінити поточний рівень дитини для добору офлайн-завдань: найвищий grade_band
 * серед frontier-навичок (поточний рубіж навчання); якщо frontier немає — серед
 * mastered; якщо взагалі порожньо — 'L0'. Детерміновано, без IO.
 */
export function inferChildBand(skills: Skill[], mastery: SkillMastery[]): GradeBand {
  const bandById = new Map(skills.map((s) => [s.id, s.grade_band]));
  const bandsFor = (status: MasteryStatus): GradeBand[] =>
    mastery
      .filter((m) => m.status === status)
      .map((m) => bandById.get(m.skill_id))
      .filter((b): b is GradeBand => b !== undefined);

  const bands = bandsFor('frontier').length ? bandsFor('frontier') : bandsFor('mastered');
  return bands.reduce<GradeBand>(
    (max, b) => (GRADE_ORDER.indexOf(b) > GRADE_ORDER.indexOf(max) ? b : max),
    'L0',
  );
}

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

  const screen = [...reviews, ...frontiers].slice(0, targetCount).map((c) => c.item);

  // Офлайн-доповнення (B4): домішати офлайн-кроки під рівень дитини, ПОНАД екранні.
  const offlineTasks = input.offlineTasks ?? [];
  const offlineCount = input.offlineCount ?? DEFAULT_OFFLINE_COUNT;
  const offlineItems =
    offlineTasks.length > 0 && offlineCount > 0
      ? offlineTasksToPlanItems(pickOfflineTasks(offlineTasks, inferChildBand(skills, mastery), offlineCount))
      : [];

  return [...screen, ...offlineItems].map((item, i) => ({ ...item, sort: i }));
}
