import type { ClassLevel, Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { randInt } from '../shared/ui';

export interface Payload {
  a: number;
  b: number;
}

const ROUNDS_PER_LEVEL = 5;
const MIN_FACTOR = 2;

/**
 * Максимальний множник за узгодженою шкалою L0-L4 (D5). Гра доступна лише
 * профілю 'L3' (школярі, `levels: ['L3']`), тож реально задіяні лише L2-L4
 * (Easy/Medium/Hard, значення точно як у попередній `maxFactorFor`); L0-L1 —
 * про запас на майбутнє розширення `levels` (менша таблиця множення).
 *
 * Fallback-шлях: використовується лише коли `classLevel` не задано (див.
 * `generate`). При заданому класі — `MAX_BY_CLASS` нижче (G2b-2).
 */
export const MAX_BY_BAND: Record<GradeBand, number> = {
  L0: 3,
  L1: 4,
  L2: 5,
  L3: 9,
  L4: 10,
};

/**
 * Максимальний множник за КЛАСОМ × difficulty (G2b-2, двовісна складність).
 * Перенесено зі старої `paramsFor` (гілка main, `ageGroupId`):
 *  - grade2: таблиця 0-10 (тут множники від 2, тож 2-10) на всіх difficulty
 *    (стара версія лише вмикала ділення на medium/hard — тут ділення нема,
 *    тож замість цього легкий рівень звужений до 7, щоб різниця Easy→Hard
 *    відчувалась).
 *  - grade3: стара версія тримала множники 2-9 фіксовано (різниця
 *    Easy→Hard йшла через "+ ділення" і таймер, яких немає в поточній
 *    моделі раунду) — тут hard піднято до 11, щоб клас залишався складнішим
 *    за grade2 (обрій зростає монотонно між класами) і давав власну
 *    прогресію.
 *  - grade4: точно як стара (diff1=9 як у grade3, diff2/3=12).
 * preschool/grade1 — лінійна екстраполяція вниз (гра поки доступна лише
 * `L3`, про запас на майбутнє розширення `levels`).
 */
export const MAX_BY_CLASS: Record<ClassLevel, Record<Difficulty, number>> = {
  preschool: { 1: 4, 2: 5, 3: 6 },
  grade1: { 1: 5, 2: 6, 3: 7 },
  grade2: { 1: 7, 2: 9, 3: 10 },
  grade3: { 1: 9, 2: 10, 3: 11 },
  grade4: { 1: 9, 2: 12, 3: 12 },
};

export function generate(
  difficulty: Difficulty,
  level: ProfileLevel = 'L3',
  classLevel?: ClassLevel,
): LevelData<Payload, number> {
  const max = classLevel ? MAX_BY_CLASS[classLevel][difficulty] : MAX_BY_BAND[gradeBandFor(level, difficulty)];
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    const a = randInt(MIN_FACTOR, max);
    const b = randInt(MIN_FACTOR, max);
    rounds.push({ id: `r${i}`, payload: { a, b }, answer: a * b });
  }
  return { difficulty, rounds };
}
