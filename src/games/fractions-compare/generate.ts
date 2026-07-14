import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { randInt } from '../shared/ui';

export interface Payload {
  n1: number;
  d1: number;
  n2: number;
  d2: number;
}

export type Sign = '<' | '=' | '>';

export interface LevelConfig {
  denominators: number[];
  unitOnly: boolean;
}

const ROUNDS_PER_LEVEL = 5;

/**
 * Набір знаменників/режим "лише одинична дробова частина" за узгодженою
 * шкалою L0-L4 (D5). Гра доступна лише профілю 'L3' (школярі, `levels:
 * ['L3']`), тож реально задіяні лише L2-L4 (Easy/Medium/Hard, значення точно
 * як у попередній `paramsFor`); L0-L1 — про запас на майбутнє розширення
 * `levels` (менше знаменників, лише одинична дробова частина).
 */
export const CONFIG_BY_BAND: Record<GradeBand, LevelConfig> = {
  L0: { denominators: [2], unitOnly: true },
  L1: { denominators: [2, 3], unitOnly: true },
  L2: { denominators: [2, 3, 4], unitOnly: true },
  L3: { denominators: [2, 3, 4, 5, 6], unitOnly: false },
  L4: { denominators: [2, 3, 4, 5, 6, 8, 10], unitOnly: false },
};

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

export function pickFraction(cfg: LevelConfig): { n: number; d: number } {
  const d = pick(cfg.denominators);
  const n = cfg.unitOnly ? 1 : randInt(1, d - 1);
  return { n, d };
}

export function sign(n1: number, d1: number, n2: number, d2: number): Sign {
  const left = n1 * d2;
  const right = n2 * d1;
  if (left === right) return '=';
  return left > right ? '>' : '<';
}

/** Спробувати підібрати еквівалентний дріб (той самий за значенням, інший вигляд). */
export function makeEquivalent(n: number, d: number, denominators: number[]): { n: number; d: number } | null {
  for (let mult = 2; mult <= 4; mult++) {
    const nd = d * mult;
    if (denominators.includes(nd)) return { n: n * mult, d: nd };
  }
  return null;
}

export function generate(difficulty: Difficulty, level: ProfileLevel = 'L3'): LevelData<Payload, Sign> {
  const cfg = CONFIG_BY_BAND[gradeBandFor(level, difficulty)];
  const rounds: Round<Payload, Sign>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    const f1 = pickFraction(cfg);
    let f2 = pickFraction(cfg);
    if (!cfg.unitOnly && Math.random() < 0.3) {
      const eq = makeEquivalent(f1.n, f1.d, cfg.denominators);
      if (eq) f2 = eq;
    }
    let guard = 0;
    while (f2.n === f1.n && f2.d === f1.d && guard < 20) {
      f2 = pickFraction(cfg);
      guard++;
    }
    rounds.push({
      id: `r${i}`,
      payload: { n1: f1.n, d1: f1.d, n2: f2.n, d2: f2.d },
      answer: sign(f1.n, f1.d, f2.n, f2.d),
    });
  }
  return { difficulty, rounds };
}
