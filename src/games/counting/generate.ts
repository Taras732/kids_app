import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { randInt } from '../shared/ui';

export interface Payload {
  n: number;
  emoji: string;
}

const EMOJI = ['🍎', '🐤', '⭐', '🎈', '🌸', '🐞', '🍓', '🐢', '🚗', '🌻'];
const ROUNDS_PER_LEVEL = 5;

/**
 * Верхня межа кількості об'єктів на екрані за узгодженою шкалою L0-L4 (D5).
 * Гра доступна лише профілю 'L0' (дошкільнята, `levels: ['L0']`), тож реально
 * задіяні лише L0-L2 (Easy/Medium/Hard); значення для L3-L4 — про запас на
 * майбутнє розширення `levels` (не викликаються сьогодні).
 */
export const MAX_BY_BAND: Record<GradeBand, number> = {
  L0: 5,
  L1: 8,
  L2: 10,
  L3: 15,
  L4: 20,
};

export function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, number> {
  const max = MAX_BY_BAND[gradeBandFor(level, difficulty)];
  const used = new Set<number>();
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    let n = randInt(1, max);
    let guard = 0;
    while (used.has(n) && guard < 20) {
      n = randInt(1, max);
      guard++;
    }
    used.add(n);
    rounds.push({
      id: `r${i}`,
      payload: { n, emoji: EMOJI[randInt(0, EMOJI.length - 1)] },
      answer: n,
    });
  }
  return { difficulty, rounds };
}
