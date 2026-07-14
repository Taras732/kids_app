// Генератор друкованих математичних задач «у зошит» (C2) — чисте детерміноване ядро.
// Без Date.now()/Math.random(): детермінізм гарантує PRNG (mulberry32), сідований
// параметром `seed`. Той самий {gradeBand, count, seed, kinds} → побайтово ідентичний
// вихід; інший seed → інший набір задач.
//
// Діапазони чисел і мікс типів задач масштабуються за GradeBand (L0 найлегший … L4
// найскладніший), узгоджено з strand-ами skill-graph (skills-math.ts): L0/L1 —
// лічба/порівняння кількості, L1+ — додавання/віднімання, L2+ — таблиця множення/ділення.

import type { GradeBand } from './types';

export type WorkbookProblemKind = 'count' | 'compare' | 'arithmetic' | 'multiply' | 'divide';

export interface WorkbookProblem {
  /** Текст задачі, напр. '7 + 5 =' або '🍎🍎🍎 — скільки?'. */
  prompt: string;
  answer: string | number;
  kind: WorkbookProblemKind;
}

export interface GenerateWorkbookInput {
  gradeBand: GradeBand;
  /** Скільки задач згенерувати (від'ємне/дробове нормалізується до 0). */
  count: number;
  /** Сід детермінізму — той самий seed+input завжди дає той самий результат. */
  seed: number;
  /** Типи задач для міксу (round-robin). За замовчуванням — набір під gradeBand. */
  kinds?: WorkbookProblemKind[];
}

// ---------- Детермінований PRNG (mulberry32) — без Math.random()/Date.now() ----------

type Rng = () => number;

function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ціле число в [min, max] включно. */
function randInt(rng: Rng, min: number, max: number): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return lo + Math.floor(rng() * (hi - lo + 1));
}

// ---------- Масштабування діапазонів за gradeBand ----------

const DEFAULT_KINDS: Record<GradeBand, WorkbookProblemKind[]> = {
  L0: ['count', 'compare'],
  L1: ['count', 'compare', 'arithmetic'],
  L2: ['arithmetic', 'multiply', 'divide'],
  L3: ['arithmetic', 'multiply', 'divide'],
  L4: ['arithmetic', 'multiply', 'divide'],
};

/** Максимум предметів для лічби (kind='count'). */
const COUNT_MAX: Record<GradeBand, number> = { L0: 5, L1: 10, L2: 20, L3: 20, L4: 20 };
/** Верхня межа чисел для порівняння (kind='compare'). */
const COMPARE_MAX: Record<GradeBand, number> = { L0: 5, L1: 20, L2: 100, L3: 1000, L4: 10000 };
/** Верхня межа чисел для додавання/віднімання (kind='arithmetic'); сума/різниця лишається в межі. */
const ARITH_MAX: Record<GradeBand, number> = { L0: 5, L1: 20, L2: 100, L3: 1000, L4: 10000 };
/** Множник (менший операнд) для kind='multiply'. */
const MULT_FACTOR_MAX: Record<GradeBand, number> = { L0: 3, L1: 5, L2: 9, L3: 9, L4: 99 };
/** Множене (більший операнд) для kind='multiply'. */
const MULT_MULTIPLICAND_MAX: Record<GradeBand, number> = { L0: 3, L1: 5, L2: 9, L3: 999, L4: 99 };
/** Дільник для kind='divide'. */
const DIV_DIVISOR_MAX: Record<GradeBand, number> = { L0: 3, L1: 5, L2: 9, L3: 9, L4: 99 };
/** Частка для kind='divide' (ділене = дільник × частка — завжди ціле без остачі). */
const DIV_QUOTIENT_MAX: Record<GradeBand, number> = { L0: 3, L1: 5, L2: 9, L3: 100, L4: 50 };

const COUNT_EMOJI = ['🍎', '⭐', '🚗', '🐝', '🎈', '🐟', '🌸', '🍪'];

// ---------- Генератори за kind (кожен — один WorkbookProblem) ----------

function genCount(rng: Rng, band: GradeBand): WorkbookProblem {
  const n = randInt(rng, 1, Math.max(1, COUNT_MAX[band]));
  const emoji = COUNT_EMOJI[randInt(rng, 0, COUNT_EMOJI.length - 1)];
  return { prompt: `${emoji.repeat(n)} — скільки?`, answer: n, kind: 'count' };
}

function genCompare(rng: Rng, band: GradeBand): WorkbookProblem {
  const max = Math.max(1, COMPARE_MAX[band]);
  const a = randInt(rng, 0, max);
  const b = randInt(rng, 0, max);
  const sign = a > b ? '>' : a < b ? '<' : '=';
  return { prompt: `${a} ○ ${b}`, answer: sign, kind: 'compare' };
}

function genArithmetic(rng: Rng, band: GradeBand): WorkbookProblem {
  const max = Math.max(1, ARITH_MAX[band]);
  const useAdd = rng() < 0.5;
  const a = randInt(rng, 0, max);
  if (useAdd) {
    const b = randInt(rng, 0, max - a);
    return { prompt: `${a} + ${b} =`, answer: a + b, kind: 'arithmetic' };
  }
  const b = randInt(rng, 0, a);
  return { prompt: `${a} - ${b} =`, answer: a - b, kind: 'arithmetic' };
}

function genMultiply(rng: Rng, band: GradeBand): WorkbookProblem {
  const a = randInt(rng, 2, Math.max(2, MULT_MULTIPLICAND_MAX[band]));
  const b = randInt(rng, 2, Math.max(2, MULT_FACTOR_MAX[band]));
  return { prompt: `${a} × ${b} =`, answer: a * b, kind: 'multiply' };
}

function genDivide(rng: Rng, band: GradeBand): WorkbookProblem {
  const divisor = randInt(rng, 2, Math.max(2, DIV_DIVISOR_MAX[band]));
  const quotient = randInt(rng, 1, Math.max(1, DIV_QUOTIENT_MAX[band]));
  return { prompt: `${divisor * quotient} : ${divisor} =`, answer: quotient, kind: 'divide' };
}

const GENERATORS: Record<WorkbookProblemKind, (rng: Rng, band: GradeBand) => WorkbookProblem> = {
  count: genCount,
  compare: genCompare,
  arithmetic: genArithmetic,
  multiply: genMultiply,
  divide: genDivide,
};

/**
 * Згенерувати `count` детермінованих задач під gradeBand. Мікс типів — round-robin
 * по `kinds` (або дефолтному набору band), тому склад задач передбачуваний і рівномірний.
 * Порожній/від'ємний count → [].
 */
export function generateWorkbook(input: GenerateWorkbookInput): WorkbookProblem[] {
  const { gradeBand, seed } = input;
  const kinds = input.kinds && input.kinds.length > 0 ? input.kinds : DEFAULT_KINDS[gradeBand];
  const total = Math.max(0, Math.floor(input.count));
  const rng = createRng(seed);

  const problems: WorkbookProblem[] = [];
  for (let i = 0; i < total; i++) {
    const kind = kinds[i % kinds.length];
    problems.push(GENERATORS[kind](rng, gradeBand));
  }
  return problems;
}
