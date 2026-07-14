import { describe, expect, it } from 'vitest';
import { CLASS_LEVELS } from '../types';
import { generate, CONFIG_BY_BAND, CONFIG_BY_CLASS, sign } from './generate';

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

describe('fractions-compare: CONFIG_BY_CLASS (G2b-2 двовісна складність)', () => {
  it('кількість знаменників не спадає між класами (preschool..grade4) на кожному difficulty', () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let i = 1; i < CLASS_LEVELS.length; i++) {
        expect(CONFIG_BY_CLASS[CLASS_LEVELS[i]][difficulty].denominators.length).toBeGreaterThanOrEqual(
          CONFIG_BY_CLASS[CLASS_LEVELS[i - 1]][difficulty].denominators.length,
        );
      }
    }
  });

  it('переніс зі старої (main): grade2 — одиничні дроби (unitOnly), grade3 — звичайні', () => {
    expect(CONFIG_BY_CLASS.grade2[1].unitOnly).toBe(true);
    expect(CONFIG_BY_CLASS.grade2[3].unitOnly).toBe(true);
    expect(CONFIG_BY_CLASS.grade3[1].unitOnly).toBe(false);
    expect(CONFIG_BY_CLASS.grade3[3].unitOnly).toBe(false);
  });

  it('переніс зі старої (main): grade4 medium/hard — без візуалу, hard — неправильні дроби', () => {
    expect(CONFIG_BY_CLASS.grade4[1].showVisual).toBe(true);
    expect(CONFIG_BY_CLASS.grade4[2].showVisual).toBe(false);
    expect(CONFIG_BY_CLASS.grade4[3].showVisual).toBe(false);
    expect(CONFIG_BY_CLASS.grade4[3].allowImproper).toBe(true);
    expect(CONFIG_BY_CLASS.grade3[3].allowImproper).toBeFalsy();
  });
});

describe('fractions-compare: generate з classLevel', () => {
  it('classLevel=grade2 — завжди одиничні дроби (n=1), showVisual=true', () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let i = 0; i < 15; i++) {
        const { rounds } = generate(difficulty, 'L3', 'grade2');
        for (const r of rounds) {
          expect(r.payload.n1).toBe(1);
          expect(r.payload.n2).toBe(1);
          expect(r.payload.showVisual).toBe(true);
        }
      }
    }
  });

  it('classLevel=grade3 — звичайні дроби (n може бути >1, але завжди < d, без visual off)', () => {
    for (let i = 0; i < 25; i++) {
      const { rounds } = generate(3, 'L3', 'grade3');
      for (const r of rounds) {
        expect(r.payload.n1).toBeGreaterThanOrEqual(1);
        expect(r.payload.n1).toBeLessThan(r.payload.d1);
        expect(r.payload.showVisual).toBe(true);
      }
    }
  });

  it('classLevel=grade4, difficulty=2 — showVisual=false, дроби ще правильні', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(2, 'L3', 'grade4');
      for (const r of rounds) {
        expect(r.payload.showVisual).toBe(false);
        expect(r.payload.n1).toBeLessThan(r.payload.d1);
      }
    }
  });

  it('classLevel=grade4, difficulty=3 — неправильні дроби (n може перевищувати d), showVisual=false', () => {
    let sawImproper = false;
    for (let i = 0; i < 60; i++) {
      const { rounds } = generate(3, 'L3', 'grade4');
      for (const r of rounds) {
        expect(r.payload.showVisual).toBe(false);
        if (r.payload.n1 >= r.payload.d1 || r.payload.n2 >= r.payload.d2) sawImproper = true;
      }
    }
    expect(sawImproper).toBe(true);
  });

  it('без classLevel (undefined) — поведінка не змінюється (fallback на CONFIG_BY_BAND, showVisual=true)', () => {
    for (let i = 0; i < 15; i++) {
      const { rounds } = generate(1, 'L3');
      for (const r of rounds) {
        expect(r.payload.n1).toBe(1);
        expect(r.payload.showVisual).toBe(true);
      }
    }
  });
});
