import type { ClassLevel, Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
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
 *
 * FALLBACK-шлях (G2b): використовується, коли `classLevel` не передано.
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

interface ClassBandConfig extends BandConfig {
  /** Верхня межа таблиці множення/ділення (за замовч. 10, як в оригінальній грі). */
  tableMax: number;
}

/**
 * Клас-параметри (G2b, двовісна складність): «математичний обрій» додавання/
 * віднімання перенесено з попередньої Expo-версії (`git show
 * main:src/games/math-expressions/index.ts`, `paramsFor`: grade1→20,
 * grade2→100, grade3→1000, grade4→1000). Стара гра мала лише +/−; у поточній
 * math-examples вже є ×/÷ (успадковано з D5 TRACK_BY_LEVEL) — набір дій за
 * класом підібраний за програмою НУШ (множення з'являється в 2 класі),
 * difficulty в межах класу вводить дії поступово (мікропрогресія).
 *
 * grade4 «складніші» (той самий max=1000, що й grade3, орієнтир з ТЗ):
 * з першої ж складності всі 4 дії одразу (grade3 стартує без ÷), і ширша
 * таблиця множення/ділення (до 12, а не до 10) — власне рішення поверх
 * старих даних, щоб 4 клас відчутно відрізнявся від 3-го при однаковому max.
 */
const CLASS_BAND: Record<ClassLevel, Record<Difficulty, ClassBandConfig>> = {
  preschool: {
    1: { ops: ['+'], max: 10, tableMax: 10 },
    2: { ops: ['+', '−'], max: 10, tableMax: 10 },
    3: { ops: ['+', '−'], max: 10, tableMax: 10 },
  },
  grade1: {
    1: { ops: ['+'], max: 20, tableMax: 10 },
    2: { ops: ['+', '−'], max: 20, tableMax: 10 },
    3: { ops: ['+', '−'], max: 20, tableMax: 10 },
  },
  grade2: {
    1: { ops: ['+', '−'], max: 100, tableMax: 10 },
    2: { ops: ['×', '+', '−'], max: 100, tableMax: 10 },
    3: { ops: ['×', '÷', '+', '−'], max: 100, tableMax: 10 },
  },
  grade3: {
    1: { ops: ['×', '+', '−'], max: 1000, tableMax: 10 },
    2: { ops: ['×', '÷', '+', '−'], max: 1000, tableMax: 10 },
    3: { ops: ['×', '÷', '+', '−'], max: 1000, tableMax: 10 },
  },
  grade4: {
    1: { ops: ['×', '÷', '+', '−'], max: 1000, tableMax: 12 },
    2: { ops: ['×', '÷', '+', '−'], max: 1000, tableMax: 12 },
    3: { ops: ['×', '÷', '+', '−'], max: 1000, tableMax: 12 },
  },
};

export function classBandConfigFor(classLevel: ClassLevel, difficulty: Difficulty): ClassBandConfig {
  return CLASS_BAND[classLevel][difficulty];
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

/** Таблиця множення 1..tableMax × 1..tableMax. */
function genMultiplication(tableMax: number): { a: number; b: number } {
  const a = randInt(1, tableMax);
  const b = randInt(1, tableMax);
  return { a, b };
}

/** Ділення націло: дільник 2..tableMax, частка 1..tableMax. */
function genDivision(tableMax: number): { a: number; b: number } {
  const divisor = randInt(2, tableMax);
  const quotient = randInt(1, tableMax);
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

function genPair(op: Op, max: number, tableMax: number): { a: number; b: number; correct: number } {
  if (op === '×') {
    const { a, b } = genMultiplication(tableMax);
    return { a, b, correct: a * b };
  }
  if (op === '÷') {
    const { a, b } = genDivision(tableMax);
    return { a, b, correct: a / b };
  }
  if (op === '+') {
    const { a, b } = genAddition(max);
    return { a, b, correct: a + b };
  }
  const { a, b } = genSubtraction(max);
  return { a, b, correct: a - b };
}

export function generate(
  difficulty: Difficulty,
  level: ProfileLevel,
  classLevel?: ClassLevel,
): LevelData<Payload, number> {
  const { ops: pool, max, tableMax } = classLevel
    ? classBandConfigFor(classLevel, difficulty)
    : { ...bandConfigFor(level, difficulty), tableMax: 10 };
  const sequence = buildOpSequence(pool);
  const rounds: Round<Payload, number>[] = sequence.map((op, i) => {
    const { a, b, correct } = genPair(op, max, tableMax);
    return { id: `r${i}`, payload: { a, b, op, correct }, answer: correct };
  });
  return { difficulty, rounds };
}
