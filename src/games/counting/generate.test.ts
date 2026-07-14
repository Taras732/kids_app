import { describe, expect, it } from 'vitest';
import { generate, MAX_BY_BAND } from './generate';

describe('counting: MAX_BY_BAND (D5 шкала L0-L4)', () => {
  it('монотонно зростає від L0 (найлегше) до L4 (найважче)', () => {
    expect(MAX_BY_BAND.L0).toBeLessThan(MAX_BY_BAND.L1);
    expect(MAX_BY_BAND.L1).toBeLessThan(MAX_BY_BAND.L2);
    expect(MAX_BY_BAND.L2).toBeLessThan(MAX_BY_BAND.L3);
    expect(MAX_BY_BAND.L3).toBeLessThan(MAX_BY_BAND.L4);
  });

  it('зберігає попередні значення для реально задіяних рівнів (levels: [L0])', () => {
    expect(MAX_BY_BAND.L0).toBe(5);
    expect(MAX_BY_BAND.L1).toBe(8);
    expect(MAX_BY_BAND.L2).toBe(10);
  });
});

describe('counting: generate', () => {
  it('difficulty=1 (band L0) — числа в межах 1..5', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(1, 'L0');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.answer).toBeGreaterThanOrEqual(1);
        expect(r.answer).toBeLessThanOrEqual(MAX_BY_BAND.L0);
      }
    }
  });

  it('difficulty=3 (band L2) — числа можуть перевищувати межу L0, аж до 10', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(3, 'L0');
      for (const r of rounds) {
        expect(r.answer).toBeGreaterThanOrEqual(1);
        expect(r.answer).toBeLessThanOrEqual(MAX_BY_BAND.L2);
      }
    }
  });
});
