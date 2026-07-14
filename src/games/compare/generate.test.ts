import { describe, expect, it } from 'vitest';
import { generate, MAX_BY_BAND } from './generate';

describe('compare: MAX_BY_BAND (D5 шкала L0-L4)', () => {
  it('монотонно зростає від L0 (найлегше) до L4 (найважче)', () => {
    expect(MAX_BY_BAND.L0).toBeLessThan(MAX_BY_BAND.L1);
    expect(MAX_BY_BAND.L1).toBeLessThan(MAX_BY_BAND.L2);
    expect(MAX_BY_BAND.L2).toBeLessThan(MAX_BY_BAND.L3);
    expect(MAX_BY_BAND.L3).toBeLessThan(MAX_BY_BAND.L4);
  });

  it('зберігає попередні значення для реально задіяних рівнів (levels: [L0])', () => {
    expect(MAX_BY_BAND.L0).toBe(6);
    expect(MAX_BY_BAND.L1).toBe(9);
    expect(MAX_BY_BAND.L2).toBe(12);
  });
});

describe('compare: generate', () => {
  it('difficulty=1 (band L0) — обидва числа в межах 1..6, різні', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(1, 'L0');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.l).not.toBe(r.payload.r);
        expect(Math.max(r.payload.l, r.payload.r)).toBeLessThanOrEqual(MAX_BY_BAND.L0);
        expect(r.answer).toBe(Math.max(r.payload.l, r.payload.r));
      }
    }
  });

  it('difficulty=3 (band L2) — числа можуть сягати 12', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(3, 'L0');
      for (const r of rounds) {
        expect(Math.max(r.payload.l, r.payload.r)).toBeLessThanOrEqual(MAX_BY_BAND.L2);
      }
    }
  });
});
