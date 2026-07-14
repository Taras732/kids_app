import { describe, expect, it } from 'vitest';
import { generate, maxFor, MAX_BY_TRACK } from './generate';

describe('math-compare: maxFor (D5 шкала L0-L4, два треки)', () => {
  it('L0-профіль: межа завжди 10 у реально задіяних L0-L2 (без масштабування складністю)', () => {
    expect(maxFor('L0', 1)).toBe(10);
    expect(maxFor('L0', 2)).toBe(10);
    expect(maxFor('L0', 3)).toBe(10);
  });

  it('L3-профіль: зберігає попередню відповідність difficulty→max (100 → 1000 → 1000)', () => {
    expect(maxFor('L3', 1)).toBe(100);
    expect(maxFor('L3', 2)).toBe(1000);
    expect(maxFor('L3', 3)).toBe(1000);
  });

  it('обидва треки монотонно не спадають від L0 до L4', () => {
    const bands = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
    for (const level of ['L0', 'L3'] as const) {
      for (let i = 1; i < bands.length; i++) {
        expect(MAX_BY_TRACK[level][bands[i]]).toBeGreaterThanOrEqual(MAX_BY_TRACK[level][bands[i - 1]]);
      }
    }
  });
});

describe('math-compare: generate', () => {
  it('L0-профіль — обидва числа в межах 1..10 незалежно від difficulty', () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let i = 0; i < 15; i++) {
        const { rounds } = generate(difficulty, 'L0');
        for (const r of rounds) {
          expect(r.payload.left).toBeGreaterThanOrEqual(1);
          expect(r.payload.left).toBeLessThanOrEqual(10);
          expect(r.payload.right).toBeGreaterThanOrEqual(1);
          expect(r.payload.right).toBeLessThanOrEqual(10);
        }
      }
    }
  });

  it('L3-профіль difficulty=1 — числа не перевищують 100', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L3');
      for (const r of rounds) {
        expect(r.payload.left).toBeLessThanOrEqual(100);
        expect(r.payload.right).toBeLessThanOrEqual(100);
      }
    }
  });

  it('відповідь відповідає знаку порівняння', () => {
    const { rounds } = generate(2, 'L3');
    for (const r of rounds) {
      const expected = r.payload.left < r.payload.right ? '<' : r.payload.left > r.payload.right ? '>' : '=';
      expect(r.answer).toBe(expected);
    }
  });
});
