import { describe, expect, it } from 'vitest';
import { generate, CONFIG_BY_BAND, sign } from './generate';

describe('fractions-compare: CONFIG_BY_BAND (D5 шкала L0-L4)', () => {
  it('кількість знаменників монотонно не спадає від L0 до L4', () => {
    const bands = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
    for (let i = 1; i < bands.length; i++) {
      expect(CONFIG_BY_BAND[bands[i]].denominators.length).toBeGreaterThanOrEqual(
        CONFIG_BY_BAND[bands[i - 1]].denominators.length,
      );
    }
  });

  it('зберігає попередні значення для реально задіяних рівнів (levels: [L3])', () => {
    expect(CONFIG_BY_BAND.L2).toEqual({ denominators: [2, 3, 4], unitOnly: true });
    expect(CONFIG_BY_BAND.L3).toEqual({ denominators: [2, 3, 4, 5, 6], unitOnly: false });
    expect(CONFIG_BY_BAND.L4).toEqual({ denominators: [2, 3, 4, 5, 6, 8, 10], unitOnly: false });
  });
});

describe('fractions-compare: generate', () => {
  it('difficulty=1 (band L2) — знаменники з {2,3,4}, чисельник завжди 1 (unitOnly)', () => {
    for (let i = 0; i < 25; i++) {
      const { rounds } = generate(1, 'L3');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.n1).toBe(1);
        expect(r.payload.n2).toBe(1);
        expect([2, 3, 4]).toContain(r.payload.d1);
        expect([2, 3, 4]).toContain(r.payload.d2);
        expect(r.answer).toBe(sign(r.payload.n1, r.payload.d1, r.payload.n2, r.payload.d2));
      }
    }
  });

  it('difficulty=2 (band L3) — знаменники з {2..6}, чисельник довільний', () => {
    for (let i = 0; i < 25; i++) {
      const { rounds } = generate(2, 'L3');
      for (const r of rounds) {
        expect([2, 3, 4, 5, 6]).toContain(r.payload.d1);
        expect([2, 3, 4, 5, 6]).toContain(r.payload.d2);
        expect(r.payload.n1).toBeGreaterThanOrEqual(1);
        expect(r.payload.n1).toBeLessThan(r.payload.d1);
        expect(r.answer).toBe(sign(r.payload.n1, r.payload.d1, r.payload.n2, r.payload.d2));
      }
    }
  });

  it('difficulty=3 (band L4) — знаменники з {2,3,4,5,6,8,10}, відповідь узгоджена', () => {
    for (let i = 0; i < 25; i++) {
      const { rounds } = generate(3, 'L3');
      for (const r of rounds) {
        expect([2, 3, 4, 5, 6, 8, 10]).toContain(r.payload.d1);
        expect([2, 3, 4, 5, 6, 8, 10]).toContain(r.payload.d2);
        expect(r.answer).toBe(sign(r.payload.n1, r.payload.d1, r.payload.n2, r.payload.d2));
      }
    }
  });

  it('band L0 (майбутній профіль) — лише знаменник 2, чисельник 1', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L0');
      for (const r of rounds) {
        expect(r.payload.d1).toBe(2);
        expect(r.payload.d2).toBe(2);
        expect(r.payload.n1).toBe(1);
        expect(r.payload.n2).toBe(1);
        expect(r.answer).toBe('=');
      }
    }
  });
});
