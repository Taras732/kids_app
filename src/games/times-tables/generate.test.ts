import { describe, expect, it } from 'vitest';
import { generate, MAX_BY_BAND } from './generate';

describe('times-tables: MAX_BY_BAND (D5 шкала L0-L4)', () => {
  it('max монотонно не спадає від L0 (найлегше) до L4 (найважче)', () => {
    const bands = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
    for (let i = 1; i < bands.length; i++) {
      expect(MAX_BY_BAND[bands[i]]).toBeGreaterThanOrEqual(MAX_BY_BAND[bands[i - 1]]);
    }
  });

  it('зберігає попередні значення для реально задіяних рівнів (levels: [L3])', () => {
    expect(MAX_BY_BAND.L2).toBe(5);
    expect(MAX_BY_BAND.L3).toBe(9);
    expect(MAX_BY_BAND.L4).toBe(10);
  });
});

describe('times-tables: generate', () => {
  it('difficulty=1 (band L2) — множники в межах 2-5', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(1, 'L3');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.a).toBeGreaterThanOrEqual(2);
        expect(r.payload.a).toBeLessThanOrEqual(5);
        expect(r.payload.b).toBeGreaterThanOrEqual(2);
        expect(r.payload.b).toBeLessThanOrEqual(5);
        expect(r.answer).toBe(r.payload.a * r.payload.b);
      }
    }
  });

  it('difficulty=2 (band L3) — множники в межах 2-9', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(2, 'L3');
      for (const r of rounds) {
        expect(r.payload.a).toBeLessThanOrEqual(9);
        expect(r.payload.b).toBeLessThanOrEqual(9);
        expect(r.answer).toBe(r.payload.a * r.payload.b);
      }
    }
  });

  it('difficulty=3 (band L4) — множники в межах 2-10', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(3, 'L3');
      for (const r of rounds) {
        expect(r.payload.a).toBeLessThanOrEqual(10);
        expect(r.payload.b).toBeLessThanOrEqual(10);
        expect(r.answer).toBe(r.payload.a * r.payload.b);
      }
    }
  });

  it('band L0 (майбутній профіль) — множники в межах 2-3', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L0');
      for (const r of rounds) {
        expect(r.payload.a).toBeLessThanOrEqual(3);
        expect(r.payload.b).toBeLessThanOrEqual(3);
        expect(r.answer).toBe(r.payload.a * r.payload.b);
      }
    }
  });
});
