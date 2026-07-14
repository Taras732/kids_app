import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { randInt } from '../shared/ui';

export interface Payload {
  l: number;
  r: number;
  emoji: string;
}

const EMOJI = ['🍎', '⭐', '🎈', '🐤', '🍓'];
const ROUNDS_PER_LEVEL = 5;

/**
 * Верхня межа кількості об'єктів у групі за узгодженою шкалою L0-L4 (D5).
 * Гра доступна лише профілю 'L0' (дошкільнята, `levels: ['L0']`), тож реально
 * задіяні лише L0-L2 (Easy/Medium/Hard); L3-L4 — про запас на майбутнє
 * розширення `levels`.
 */
export const MAX_BY_BAND: Record<GradeBand, number> = {
  L0: 6,
  L1: 9,
  L2: 12,
  L3: 16,
  L4: 20,
};

export function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, number> {
  const max = MAX_BY_BAND[gradeBandFor(level, difficulty)];
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    let l = randInt(1, max);
    let r = randInt(1, max);
    let guard = 0;
    while (l === r && guard < 20) {
      r = randInt(1, max);
      guard++;
    }
    rounds.push({
      id: `r${i}`,
      payload: { l, r, emoji: EMOJI[randInt(0, EMOJI.length - 1)] },
      answer: Math.max(l, r),
    });
  }
  return { difficulty, rounds };
}
