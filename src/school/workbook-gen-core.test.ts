import { describe, expect, it } from 'vitest';
import { generateWorkbook, type WorkbookProblem } from './workbook-gen-core';
import type { GradeBand } from './types';

const BANDS: GradeBand[] = ['L0', 'L1', 'L2', 'L3', 'L4'];

/** Розпарсити prompt назад у операнди/операцію — для перевірки, що answer коректна. */
function assertCorrect(p: WorkbookProblem) {
  switch (p.kind) {
    case 'count': {
      const [glyphs] = p.prompt.split(' — скільки?');
      expect(Array.from(glyphs).length).toBe(p.answer);
      break;
    }
    case 'compare': {
      const m = p.prompt.match(/^(\d+) ○ (\d+)$/);
      expect(m).not.toBeNull();
      const a = Number(m![1]);
      const b = Number(m![2]);
      const expected = a > b ? '>' : a < b ? '<' : '=';
      expect(p.answer).toBe(expected);
      break;
    }
    case 'arithmetic': {
      const m = p.prompt.match(/^(\d+) ([+-]) (\d+) =$/);
      expect(m).not.toBeNull();
      const a = Number(m![1]);
      const op = m![2];
      const b = Number(m![3]);
      expect(p.answer).toBe(op === '+' ? a + b : a - b);
      expect(Number(p.answer)).toBeGreaterThanOrEqual(0);
      break;
    }
    case 'multiply': {
      const m = p.prompt.match(/^(\d+) × (\d+) =$/);
      expect(m).not.toBeNull();
      const a = Number(m![1]);
      const b = Number(m![2]);
      expect(p.answer).toBe(a * b);
      break;
    }
    case 'divide': {
      const m = p.prompt.match(/^(\d+) : (\d+) =$/);
      expect(m).not.toBeNull();
      const a = Number(m![1]);
      const b = Number(m![2]);
      expect(a % b).toBe(0);
      expect(p.answer).toBe(a / b);
      break;
    }
  }
}

describe('generateWorkbook — детермінізм', () => {
  it('той самий seed + вхід → побайтово ідентичний вихід', () => {
    const input = { gradeBand: 'L2' as GradeBand, count: 15, seed: 42 };
    const a = generateWorkbook(input);
    const b = generateWorkbook(input);
    expect(a).toEqual(b);
  });

  it('різний seed → різний набір задач', () => {
    const a = generateWorkbook({ gradeBand: 'L2', count: 15, seed: 1 });
    const b = generateWorkbook({ gradeBand: 'L2', count: 15, seed: 2 });
    expect(a).not.toEqual(b);
  });

  it('однаковий seed на різних gradeBand дає різний вихід (band впливає на діапазони)', () => {
    const a = generateWorkbook({ gradeBand: 'L0', count: 10, seed: 7 });
    const b = generateWorkbook({ gradeBand: 'L4', count: 10, seed: 7 });
    expect(a).not.toEqual(b);
  });
});

describe('generateWorkbook — count дотримано', () => {
  it('повертає рівно count задач', () => {
    expect(generateWorkbook({ gradeBand: 'L1', count: 7, seed: 1 })).toHaveLength(7);
    expect(generateWorkbook({ gradeBand: 'L1', count: 0, seed: 1 })).toHaveLength(0);
  });

  it("від'ємний/дробовий count нормалізується до 0/floor", () => {
    expect(generateWorkbook({ gradeBand: 'L1', count: -5, seed: 1 })).toEqual([]);
    expect(generateWorkbook({ gradeBand: 'L1', count: 3.9, seed: 1 })).toHaveLength(3);
  });
});

describe('generateWorkbook — коректність відповідей і діапазони за gradeBand', () => {
  for (const band of BANDS) {
    it(`${band}: усі задачі мають коректну відповідь (дефолтний kinds-мікс)`, () => {
      const problems = generateWorkbook({ gradeBand: band, count: 40, seed: 123 });
      expect(problems).toHaveLength(40);
      for (const p of problems) assertCorrect(p);
    });
  }

  it('L0 не виходить за межу 5 (count/compare)', () => {
    const problems = generateWorkbook({ gradeBand: 'L0', count: 30, seed: 5 });
    for (const p of problems) {
      if (p.kind === 'count') expect(p.answer as number).toBeLessThanOrEqual(5);
      if (p.kind === 'compare') {
        const [a, b] = p.prompt.split(' ○ ').map(Number);
        expect(a).toBeLessThanOrEqual(5);
        expect(b).toBeLessThanOrEqual(5);
      }
    }
  });

  it('L4 arithmetic лишається в межі 10000, multiply — двоцифрове × двоцифрове', () => {
    const problems = generateWorkbook({ gradeBand: 'L4', count: 40, seed: 9 });
    for (const p of problems) {
      if (p.kind === 'arithmetic') {
        const nums = p.prompt.match(/\d+/g)!.map(Number);
        for (const n of nums) expect(n).toBeLessThanOrEqual(10000);
      }
      if (p.kind === 'multiply') {
        const [a, b] = p.prompt.replace(' =', '').split(' × ').map(Number);
        expect(a).toBeGreaterThanOrEqual(2);
        expect(a).toBeLessThanOrEqual(99);
        expect(b).toBeGreaterThanOrEqual(2);
        expect(b).toBeLessThanOrEqual(99);
      }
    }
  });
});

describe('generateWorkbook — явний kinds override', () => {
  it('kinds=[multiply] → усі задачі одного типу (round-robin по 1 елементу)', () => {
    const problems = generateWorkbook({ gradeBand: 'L2', count: 10, seed: 3, kinds: ['multiply'] });
    expect(problems.every((p) => p.kind === 'multiply')).toBe(true);
  });

  it('kinds з кількома типами розподіляє round-robin у заданому порядку', () => {
    const problems = generateWorkbook({
      gradeBand: 'L2',
      count: 6,
      seed: 3,
      kinds: ['count', 'divide'],
    });
    expect(problems.map((p) => p.kind)).toEqual(['count', 'divide', 'count', 'divide', 'count', 'divide']);
  });
});
