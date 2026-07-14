import { describe, expect, it } from 'vitest';
import { CLASS_LEVELS } from '../types';
import { generate, MAX_BY_BAND, MAX_BY_CLASS } from './generate';

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

describe('times-tables: MAX_BY_CLASS (G2b-2 двовісна складність)', () => {
  it('в межах кожного класу max не спадає Easy→Medium→Hard', () => {
    for (const cl of CLASS_LEVELS) {
      expect(MAX_BY_CLASS[cl][2]).toBeGreaterThanOrEqual(MAX_BY_CLASS[cl][1]);
      expect(MAX_BY_CLASS[cl][3]).toBeGreaterThanOrEqual(MAX_BY_CLASS[cl][2]);
    }
  });

  it('обрій (Hard) монотонно зростає між класами: grade2 < grade3 < grade4', () => {
    expect(MAX_BY_CLASS.grade2[3]).toBeLessThan(MAX_BY_CLASS.grade3[3]);
    expect(MAX_BY_CLASS.grade3[3]).toBeLessThan(MAX_BY_CLASS.grade4[3]);
  });

  it('переніс зі старої (main): grade2 Hard=10, grade4 Hard=12', () => {
    expect(MAX_BY_CLASS.grade2[3]).toBe(10);
    expect(MAX_BY_CLASS.grade4[3]).toBe(12);
  });
});

describe('times-tables: generate з classLevel', () => {
  it('classLevel=grade2 — множники в межах 2..MAX_BY_CLASS.grade2', () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let i = 0; i < 20; i++) {
        const { rounds } = generate(difficulty, 'L3', 'grade2');
        const max = MAX_BY_CLASS.grade2[difficulty];
        for (const r of rounds) {
          expect(r.payload.a).toBeGreaterThanOrEqual(2);
          expect(r.payload.a).toBeLessThanOrEqual(max);
          expect(r.payload.b).toBeLessThanOrEqual(max);
          expect(r.answer).toBe(r.payload.a * r.payload.b);
        }
      }
    }
  });

  it('classLevel=grade4, difficulty=3 — може досягати 12 (вище за grade2)', () => {
    let sawAbove10 = false;
    for (let i = 0; i < 60; i++) {
      const { rounds } = generate(3, 'L3', 'grade4');
      for (const r of rounds) {
        expect(r.payload.a).toBeLessThanOrEqual(12);
        expect(r.payload.b).toBeLessThanOrEqual(12);
        if (r.payload.a > 10 || r.payload.b > 10) sawAbove10 = true;
      }
    }
    expect(sawAbove10).toBe(true);
  });

  it('без classLevel (undefined) — поведінка не змінюється (fallback на MAX_BY_BAND)', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(2, 'L3');
      for (const r of rounds) {
        expect(r.payload.a).toBeLessThanOrEqual(MAX_BY_BAND.L3);
        expect(r.payload.b).toBeLessThanOrEqual(MAX_BY_BAND.L3);
      }
    }
  });
});
