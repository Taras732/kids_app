import type { ClassLevel, Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
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
 *
 * FALLBACK-шлях (G2b): використовується, коли `classLevel` не передано —
 * зберігає поведінку, що була до впровадження класового масштабу.
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

interface ClassCfg {
  digitCountA: number;
  digitCountB: number;
  maxValue: number;
  withCarry: boolean;
  allowSubtraction: boolean;
}

/**
 * Клас-параметри (G2b, двовісна складність): перенесено з попередньої
 * Expo-версії (`git show main:src/games/column-arithmetic/index.ts`,
 * `paramsFor`). Клас задає розрядність і межу значень (обрій), difficulty в
 * межах класу вмикає перенос через розряд і віднімання — мікропрогресія
 * всередині горизонту класу, а не окрема шкала.
 *
 * 'preschool' не мала стовпчикового рахунку в старій версії (гра була
 * `availableFor: ['grade1'..'grade4']`, без дошкілля) — тож для неї
 * використовуємо найлегший шкільний обрій (grade1) як безпечний дефолт.
 */
function classParamsFor(classLevel: ClassLevel, difficulty: Difficulty): ClassCfg {
  const group = classLevel === 'preschool' ? 'grade1' : classLevel;

  if (group === 'grade1') {
    if (difficulty <= 1)
      return { digitCountA: 2, digitCountB: 1, maxValue: 50, withCarry: false, allowSubtraction: false };
    if (difficulty === 2)
      return { digitCountA: 2, digitCountB: 2, maxValue: 50, withCarry: false, allowSubtraction: false };
    return { digitCountA: 2, digitCountB: 2, maxValue: 50, withCarry: true, allowSubtraction: true };
  }

  if (group === 'grade2') {
    if (difficulty <= 1)
      return { digitCountA: 2, digitCountB: 2, maxValue: 99, withCarry: false, allowSubtraction: true };
    return { digitCountA: 2, digitCountB: 2, maxValue: 99, withCarry: true, allowSubtraction: true };
  }

  if (group === 'grade3') {
    if (difficulty <= 1)
      return { digitCountA: 3, digitCountB: 3, maxValue: 999, withCarry: false, allowSubtraction: true };
    return { digitCountA: 3, digitCountB: 3, maxValue: 999, withCarry: true, allowSubtraction: true };
  }

  // grade4
  if (difficulty <= 1)
    return { digitCountA: 3, digitCountB: 3, maxValue: 999, withCarry: true, allowSubtraction: true };
  return { digitCountA: 4, digitCountB: 4, maxValue: 9999, withCarry: true, allowSubtraction: true };
}

function hasCarry(a: number, b: number, op: Op, digitCount: number): boolean {
  const aStr = String(a).padStart(digitCount, '0');
  const bStr = String(b).padStart(digitCount, '0');
  if (op === '+') {
    for (let i = digitCount - 1; i >= 0; i--) {
      const sum = parseInt(aStr[i], 10) + parseInt(bStr[i], 10);
      if (sum >= 10) return true;
    }
    return false;
  }
  for (let i = digitCount - 1; i >= 0; i--) {
    const ad = parseInt(aStr[i], 10);
    const bd = parseInt(bStr[i], 10);
    if (ad < bd) return true;
  }
  return false;
}

function minForDigits(digitCount: number): number {
  return digitCount === 1 ? 1 : Math.pow(10, digitCount - 1);
}

/** Генерує пару за класовим обрієм, намагаючись потрапити в потрібний режим переносу (до 100 спроб, як у старій версії). */
function genClassPair(classLevel: ClassLevel, difficulty: Difficulty): { a: number; b: number; op: Op } {
  const cfg = classParamsFor(classLevel, difficulty);
  const op: Op = cfg.allowSubtraction && Math.random() < 0.5 ? '−' : '+';
  const minA = minForDigits(cfg.digitCountA);
  const maxA = cfg.maxValue;
  const minB = minForDigits(cfg.digitCountB);
  const maxBUpper = Math.min(cfg.maxValue, Math.pow(10, cfg.digitCountB) - 1);

  let a = 0;
  let b = 0;
  for (let attempt = 0; attempt < 100; attempt++) {
    a = randInt(minA, maxA);
    b = op === '+' ? randInt(minB, maxBUpper) : randInt(minB, Math.min(a, maxBUpper));
    const digitCount = Math.max(String(a).length, String(b).length);
    const carryCheck = hasCarry(a, b, op, digitCount);
    if (cfg.withCarry ? carryCheck : !carryCheck) break;
  }
  return { a, b, op };
}

export function generate(
  difficulty: Difficulty,
  level: ProfileLevel = 'L3',
  classLevel?: ClassLevel,
): LevelData<Payload, number> {
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    let a: number;
    let b: number;
    let op: Op;
    if (classLevel) {
      ({ a, b, op } = genClassPair(classLevel, difficulty));
    } else {
      const cfg = LIMITS_BY_BAND[gradeBandFor(level, difficulty)];
      op = cfg.allowSub && Math.random() < 0.5 ? '−' : '+';
      ({ a, b } = genPair(op, cfg));
    }
    const answer = op === '+' ? a + b : a - b;
    rounds.push({ id: `r${i}`, payload: { a, b, op }, answer });
  }
  return { difficulty, rounds };
}
