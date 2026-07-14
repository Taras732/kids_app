import { describe, expect, it } from 'vitest';
import { generate, LIMITS_BY_BAND } from './generate';

describe('addition: LIMITS_BY_BAND (D5 шкала L0-L4)', () => {
  it('maxSum монотонно не спадає від L0 (найлегше) до L4 (найважче)', () => {
    const bands = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
    for (let i = 1; i < bands.length; i++) {
      expect(LIMITS_BY_BAND[bands[i]].maxSum).toBeGreaterThanOrEqual(LIMITS_BY_BAND[bands[i - 1]].maxSum);
    }
  });

  it('зберігає попередні значення для реально задіяних рівнів (levels: [L0])', () => {
    expect(LIMITS_BY_BAND.L0).toEqual({ maxA: 3, maxB: 3, maxSum: 6 });
    expect(LIMITS_BY_BAND.L1).toEqual({ maxA: 5, maxB: 4, maxSum: 10 });
    expect(LIMITS_BY_BAND.L2).toEqual({ maxA: 6, maxB: 5, maxSum: 10 });
  });
});

describe('addition: generate', () => {
  it('difficulty=1 (band L0) — сума не перевищує 6', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(1, 'L0');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.a + r.payload.b).toBe(r.answer);
        expect(r.answer).toBeLessThanOrEqual(LIMITS_BY_BAND.L0.maxSum);
      }
    }
  });

  it('difficulty=3 (band L2) — сума не перевищує 10, доданки в межах maxA/maxB', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(3, 'L0');
      for (const r of rounds) {
        expect(r.payload.a).toBeLessThanOrEqual(LIMITS_BY_BAND.L2.maxA);
        expect(r.payload.b).toBeLessThanOrEqual(LIMITS_BY_BAND.L2.maxB);
        expect(r.answer).toBeLessThanOrEqual(LIMITS_BY_BAND.L2.maxSum);
      }
    }
  });
});
