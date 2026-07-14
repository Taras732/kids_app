import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { randInt, shuffle } from '../shared/ui';

type Op = '+' | '−' | '×' | '÷';

export interface Payload {
  a: number;
  b: number;
  op: Op;
  correct: number;
}

const ROUNDS_PER_LEVEL = 5;

interface BandConfig {
  ops: Op[];
  /** Верхня межа операндів (для + / −; × і ÷ завжди в межах таблиці 1-10). */
  max: number;
}

/**
 * Гра спільна для профілю 'L0' (дошкільнята) і 'L3' (школярі), тож L0-L4
 * покриває ОБИДВА треки (D5): 'L0'-профіль → GradeBand L0-L2, 'L3'-профіль →
 * GradeBand L2-L4 (стик на L2 — найскладніший дошкільний рівень і найлегший
 * шкільний). Значення точно відтворюють попередню (level, difficulty)-логіку;
 * записи поза власним треком гри (L3-L4 у L0-треку, L0-L1 у L3-треку) — про
 * запас на майбутнє розширення `levels`, зараз не викликаються.
 */
const TRACK_BY_LEVEL: Record<ProfileLevel, Record<GradeBand, BandConfig>> = {
  L0: {
    L0: { ops: ['+'], max: 10 },
    L1: { ops: ['+', '−'], max: 10 },
    L2: { ops: ['+', '−'], max: 10 },
    L3: { ops: ['+', '−'], max: 15 },
    L4: { ops: ['+', '−', '×'], max: 20 },
  },
  L3: {
    L0: { ops: ['+'], max: 10 },
    L1: { ops: ['+', '−'], max: 10 },
    L2: { ops: ['×', '+', '−'], max: 100 },
    L3: { ops: ['×', '÷', '+', '−'], max: 100 },
    L4: { ops: ['+', '−', '×'], max: 100 },
  },
};

export function bandConfigFor(level: ProfileLevel, difficulty: Difficulty): BandConfig {
  return TRACK_BY_LEVEL[level][gradeBandFor(level, difficulty)];
}

// --- генерація пар операндів для кожної дії ---

/** Додавання в межах max, обидва операнди >= 1 (без тривіальних "0 + x"). */
function genAddition(max: number): { a: number; b: number } {
  const a = randInt(1, max - 1);
  const b = randInt(1, max - a);
  return { a, b };
}

/** Віднімання в межах max, результат завжди >= 1 (без "x - 0" / "x - x"). */
function genSubtraction(max: number): { a: number; b: number } {
  const a = randInt(2, max);
  const b = randInt(1, a - 1);
  return { a, b };
}

/** Таблиця множення 1..10 × 1..10. */
function genMultiplication(): { a: number; b: number } {
  const a = randInt(1, 10);
  const b = randInt(1, 10);
  return { a, b };
}

/** Ділення націло: дільник 2..10, частка 1..10. */
function genDivision(): { a: number; b: number } {
  const divisor = randInt(2, 10);
  const quotient = randInt(1, 10);
  return { a: divisor * quotient, b: divisor };
}

/** Побудувати послідовність операцій на раунд, уникаючи "усі однакові", коли варіантів > 1. */
function buildOpSequence(pool: Op[]): Op[] {
  if (pool.length === 1) return Array(ROUNDS_PER_LEVEL).fill(pool[0]);
  const seq: Op[] = Array.from({ length: ROUNDS_PER_LEVEL }, () => pool[randInt(0, pool.length - 1)]);
  if (new Set(seq).size === 1) {
    const alt = pool.find((o) => o !== seq[0])!;
    seq[randInt(0, seq.length - 1)] = alt;
  }
  return shuffle(seq);
}

function genPair(op: Op, max: number): { a: number; b: number; correct: number } {
  if (op === '×') {
    const { a, b } = genMultiplication();
    return { a, b, correct: a * b };
  }
  if (op === '÷') {
    const { a, b } = genDivision();
    return { a, b, correct: a / b };
  }
  if (op === '+') {
    const { a, b } = genAddition(max);
    return { a, b, correct: a + b };
  }
  const { a, b } = genSubtraction(max);
  return { a, b, correct: a - b };
}

export function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, number> {
  const { ops: pool, max } = bandConfigFor(level, difficulty);
  const sequence = buildOpSequence(pool);
  const rounds: Round<Payload, number>[] = sequence.map((op, i) => {
    const { a, b, correct } = genPair(op, max);
    return { id: `r${i}`, payload: { a, b, op, correct }, answer: correct };
  });
  return { difficulty, rounds };
}
