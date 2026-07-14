import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { randInt } from '../shared/ui';

export interface Payload {
  a: number;
  b: number;
}

const ROUNDS_PER_LEVEL = 5;

/**
 * Максимальний множник за узгодженою шкалою L0-L4 (D5). Гра доступна лише
 * профілю 'L3' (школярі, `levels: ['L3']`), тож реально задіяні лише L2-L4
 * (Easy/Medium/Hard, значення точно як у попередній `maxFactorFor`); L0-L1 —
 * про запас на майбутнє розширення `levels` (менша таблиця множення).
 */
export const MAX_BY_BAND: Record<GradeBand, number> = {
  L0: 3,
  L1: 4,
  L2: 5,
  L3: 9,
  L4: 10,
};

export function generate(difficulty: Difficulty, level: ProfileLevel = 'L3'): LevelData<Payload, number> {
  const max = MAX_BY_BAND[gradeBandFor(level, difficulty)];
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    const a = randInt(2, max);
    const b = randInt(2, max);
    rounds.push({ id: `r${i}`, payload: { a, b }, answer: a * b });
  }
  return { difficulty, rounds };
}
