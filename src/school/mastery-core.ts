// Чисте ядро mastery-движка (A4): без БД/мережі — лише обчислення.
// Тестується юнітами напряму (node через esbuild-бандл, без supabase).
// IO-обгортки — у mastery.ts.

import type { MasteryStatus } from './types';

export const DEFAULT_MASTERY_THRESHOLD = 0.8;
/** Коефіцієнт згладжування EMA: наскільки нова спроба зсуває mastery. */
export const MASTERY_ALPHA = 0.4;

export function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

/** Частка правильних у спробі (0..1). total<=0 → 0. */
export function attemptRate(correct: number, total: number): number {
  if (total <= 0) return 0;
  return clamp01(correct / total);
}

/**
 * Нове значення mastery після спроби (EMA).
 * Перша спроба (prev == null) → рівне rate; далі — плавний зсув до rate.
 */
export function nextMastery(prev: number | null, rate: number, alpha: number = MASTERY_ALPHA): number {
  const r = clamp01(rate);
  if (prev == null) return r;
  return clamp01(prev + alpha * (r - clamp01(prev)));
}

/**
 * Статус навички:
 *  - mastered — mastery досягла порога;
 *  - frontier — ще не засвоєна, але всі prerequisites засвоєні (доступна для практики);
 *  - locked — є незасвоєні prerequisites.
 */
export function deriveStatus(mastery: number, threshold: number, allPrereqsMastered: boolean): MasteryStatus {
  if (mastery >= threshold) return 'mastered';
  return allPrereqsMastered ? 'frontier' : 'locked';
}

export interface SkillNode {
  id: string;
  mastery_threshold: number;
}
export interface PrereqEdge {
  skill_id: string;
  prerequisite_id: string;
}
export interface StatusResult {
  skillId: string;
  status: MasteryStatus;
}

/**
 * Перерахунок статусів усіх навичок по DAG за поточними mastery-значеннями.
 * Один прохід: skill 'mastered' коли mastery≥поріг; 'frontier' коли всі його
 * prerequisites 'mastered'; інакше 'locked'. Кореневі (без prerequisites) —
 * одразу 'frontier'. Повертає статус для КОЖНОЇ навички (IO-шар вирішує, що писати).
 */
export function computeStatuses(
  skills: SkillNode[],
  prereqs: PrereqEdge[],
  masteryById: Map<string, number>,
): StatusResult[] {
  const masteredSet = new Set<string>();
  for (const s of skills) {
    if ((masteryById.get(s.id) ?? 0) >= s.mastery_threshold) masteredSet.add(s.id);
  }
  const reqBy = new Map<string, string[]>();
  for (const p of prereqs) {
    const arr = reqBy.get(p.skill_id);
    if (arr) arr.push(p.prerequisite_id);
    else reqBy.set(p.skill_id, [p.prerequisite_id]);
  }
  const out: StatusResult[] = [];
  for (const s of skills) {
    const reqs = reqBy.get(s.id) ?? [];
    const allMastered = reqs.every((r) => masteredSet.has(r));
    out.push({ skillId: s.id, status: deriveStatus(masteryById.get(s.id) ?? 0, s.mastery_threshold, allMastered) });
  }
  return out;
}
