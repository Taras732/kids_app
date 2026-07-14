import { describe, expect, it } from 'vitest';
import { generate, LIMITS_BY_BAND } from './generate';

describe('column-arithmetic: LIMITS_BY_BAND (D5 шкала L0-L4)', () => {
  it('max монотонно не спадає від L0 (найлегше) до L4 (найважче)', () => {
    const bands = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
    for (let i = 1; i < bands.length; i++) {
      expect(LIMITS_BY_BAND[bands[i]].max).toBeGreaterThanOrEqual(LIMITS_BY_BAND[bands[i - 1]].max);
      expect(LIMITS_BY_BAND[bands[i]].min).toBeGreaterThanOrEqual(LIMITS_BY_BAND[bands[i - 1]].min);
    }
  });

  it('зберігає попередні значення для реально задіяних рівнів (levels: [L3])', () => {
    expect(LIMITS_BY_BAND.L2).toEqual({ min: 100, max: 300, allowSub: false });
    expect(LIMITS_BY_BAND.L3).toEqual({ min: 100, max: 600, allowSub: true });
    expect(LIMITS_BY_BAND.L4).toEqual({ min: 300, max: 999, allowSub: true });
  });
});

describe('column-arithmetic: generate', () => {
  it('difficulty=1 (band L2) — без віднімання, a/b в межах 100-300', () => {
    for (let i = 0; i < 25; i++) {
      const { rounds } = generate(1, 'L3');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.op).toBe('+');
        expect(r.payload.a).toBeGreaterThanOrEqual(100);
        expect(r.payload.a).toBeLessThanOrEqual(300);
        expect(r.payload.b).toBeGreaterThanOrEqual(100);
        expect(r.payload.b).toBeLessThanOrEqual(300);
        expect(r.answer).toBe(r.payload.a + r.payload.b);
      }
    }
  });

  it('difficulty=2 (band L3) — допускає віднімання, a/b в межах 100-600', () => {
    for (let i = 0; i < 25; i++) {
      const { rounds } = generate(2, 'L3');
      for (const r of rounds) {
        expect(['+', '−']).toContain(r.payload.op);
        expect(r.payload.a).toBeGreaterThanOrEqual(100);
        expect(r.payload.a).toBeLessThanOrEqual(600);
        if (r.payload.op === '+') {
          expect(r.answer).toBe(r.payload.a + r.payload.b);
        } else {
          expect(r.payload.b).toBeLessThanOrEqual(r.payload.a);
          expect(r.answer).toBe(r.payload.a - r.payload.b);
        }
      }
    }
  });

  it('difficulty=3 (band L4) — a/b в межах 300-999, результат узгоджений з payload', () => {
    for (let i = 0; i < 25; i++) {
      const { rounds } = generate(3, 'L3');
      for (const r of rounds) {
        expect(r.payload.a).toBeGreaterThanOrEqual(300);
        expect(r.payload.a).toBeLessThanOrEqual(999);
        expect(r.answer).toBe(r.payload.op === '+' ? r.payload.a + r.payload.b : r.payload.a - r.payload.b);
        expect(r.answer).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('difficulty=1 (band L0 через рідкісний майбутній профіль) — без переносу, 2-значні', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L0');
      for (const r of rounds) {
        expect(r.payload.op).toBe('+');
        expect(r.payload.a).toBeLessThanOrEqual(30);
        expect(r.payload.b).toBeLessThanOrEqual(30);
      }
    }
  });
});
