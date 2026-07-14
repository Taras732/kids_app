import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { randInt } from '../shared/ui';

export type Op = '+' | '−';

export interface Payload {
  a: number;
  b: number;
  op: Op;
}

export interface Cfg {
  min: number;
  max: number;
  allowSub: boolean;
}

const ROUNDS_PER_LEVEL = 5;

/**
 * Діапазон доданків/зменшуваного за узгодженою шкалою L0-L4 (D5). Гра доступна
 * лише профілю 'L3' (школярі, `levels: ['L3']`), тож реально задіяні лише
 * L2-L4 (Easy/Medium/Hard, значення точно як у попередній difficulty-таблиці);
 * L0-L1 — про запас на майбутнє розширення `levels` (легші 2-значні приклади
 * без віднімання, менший діапазон).
 */
export const LIMITS_BY_BAND: Record<GradeBand, Cfg> = {
  L0: { min: 10, max: 30, allowSub: false },
  L1: { min: 20, max: 60, allowSub: false },
  L2: { min: 100, max: 300, allowSub: false },
  L3: { min: 100, max: 600, allowSub: true },
  L4: { min: 300, max: 999, allowSub: true },
};

function genPair(op: Op, cfg: Cfg): { a: number; b: number } {
  const a = randInt(cfg.min, cfg.max);
  if (op === '+') {
    const bMax = Math.max(cfg.min, Math.min(cfg.max, 999 - a));
    const b = randInt(cfg.min, bMax);
    return { a, b };
  }
  // віднімання: b <= a, щоб результат був невід'ємний
  const b = randInt(cfg.min, a);
  return { a, b };
}

export function generate(difficulty: Difficulty, level: ProfileLevel = 'L3'): LevelData<Payload, number> {
  const cfg = LIMITS_BY_BAND[gradeBandFor(level, difficulty)];
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    const op: Op = cfg.allowSub && Math.random() < 0.5 ? '−' : '+';
    const { a, b } = genPair(op, cfg);
    const answer = op === '+' ? a + b : a - b;
    rounds.push({ id: `r${i}`, payload: { a, b, op }, answer });
  }
  return { difficulty, rounds };
}
