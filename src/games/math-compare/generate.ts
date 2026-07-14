import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { randInt } from '../shared/ui';

export interface Payload {
  left: number;
  right: number;
}

export type Sign = '<' | '=' | '>';

const ROUNDS_PER_LEVEL = 5;
/** Шанс, що left і right навмисно зроблять рівними (щоб трапився знак '='). */
const EQUAL_PROBABILITY = 0.28;

/**
 * Гра спільна для профілю 'L0' (дошкільнята) і 'L3' (школярі), тож L0-L4
 * покриває ОБИДВА треки (D5): 'L0'-профіль → GradeBand L0-L2 (межа завжди 10,
 * без масштабування складністю — так само як у попередній версії), 'L3'-профіль
 * → GradeBand L2-L4 (100 → 1000 → 1000, стик на L2=100 як і раніше). Записи
 * поза власним треком гри — про запас на майбутнє розширення `levels`.
 */
export const MAX_BY_TRACK: Record<ProfileLevel, Record<GradeBand, number>> = {
  L0: { L0: 10, L1: 10, L2: 10, L3: 20, L4: 50 },
  L3: { L0: 10, L1: 20, L2: 100, L3: 1000, L4: 1000 },
};

export function maxFor(level: ProfileLevel, difficulty: Difficulty): number {
  return MAX_BY_TRACK[level][gradeBandFor(level, difficulty)];
}

function compareSign(left: number, right: number): Sign {
  if (left < right) return '<';
  if (left > right) return '>';
  return '=';
}

export function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, Sign> {
  const max = maxFor(level, difficulty);
  const rounds: Round<Payload, Sign>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    const left = randInt(1, max);
    const right = Math.random() < EQUAL_PROBABILITY ? left : randInt(1, max);
    rounds.push({ id: `r${i}`, payload: { left, right }, answer: compareSign(left, right) });
  }
  return { difficulty, rounds };
}
