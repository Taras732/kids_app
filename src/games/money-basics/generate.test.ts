import { describe, expect, it } from 'vitest';
import { CONFIG_BY_BAND, CLASS_MONEY_CONFIG, generate, correctFor } from './generate';

describe('money-basics: CONFIG_BY_BAND (D5 шкала L0-L4)', () => {
  it('розмір hrnPool монотонно не спадає від L0 (найлегше) до L4 (найважче)', () => {
    const bands = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
    for (let i = 1; i < bands.length; i++) {
      expect(CONFIG_BY_BAND[bands[i]].hrnPool.length).toBeGreaterThanOrEqual(CONFIG_BY_BAND[bands[i - 1]].hrnPool.length);
    }
  });

  it('countRange монотонно не спадає від L0 до L4', () => {
    const bands = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
    for (let i = 1; i < bands.length; i++) {
      expect(CONFIG_BY_BAND[bands[i]].countRange[1]).toBeGreaterThanOrEqual(CONFIG_BY_BAND[bands[i - 1]].countRange[1]);
    }
  });

  it('зберігає попередні значення для реально задіяних рівнів (levels: [L3] → L2-L4)', () => {
    expect(CONFIG_BY_BAND.L2).toMatchObject({ hrnPool: [1, 2, 5], kopChance: 0.5, countRange: [2, 3], compareMax: 20 });
    expect(CONFIG_BY_BAND.L2.modes).toEqual(['count', 'count', 'count', 'compose', 'compose']);
    expect(CONFIG_BY_BAND.L3).toMatchObject({ hrnPool: [1, 2, 5, 10, 20], kopChance: 0, countRange: [3, 4], compareMax: 100 });
    expect(CONFIG_BY_BAND.L3.modes).toEqual(['count', 'count', 'compose', 'compose', 'compare']);
    expect(CONFIG_BY_BAND.L4).toMatchObject({
      hrnPool: [5, 10, 20, 50, 100, 200, 500],
      kopChance: 0,
      countRange: [4, 5],
      compareMax: 500,
    });
    expect(CONFIG_BY_BAND.L4.modes).toEqual(['change', 'change', 'change', 'compose', 'compare']);
  });

  it('L0/L1 не регресують нижче L2 і не вводять change', () => {
    expect(CONFIG_BY_BAND.L0.hrnPool.length).toBeLessThanOrEqual(CONFIG_BY_BAND.L2.hrnPool.length);
    expect(CONFIG_BY_BAND.L1.hrnPool.length).toBeLessThanOrEqual(CONFIG_BY_BAND.L2.hrnPool.length);
    expect(CONFIG_BY_BAND.L0.modes.includes('change')).toBe(false);
    expect(CONFIG_BY_BAND.L1.modes.includes('change')).toBe(false);
  });
});

describe('money-basics: generate(difficulty, level)', () => {
  it('generate(difficulty, "L3") для 1/2/3 — усі відповіді узгоджені з correctFor', () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let i = 0; i < 30; i++) {
        const { rounds } = generate(difficulty, 'L3');
        expect(rounds).toHaveLength(5);
        for (const r of rounds) {
          expect(correctFor(r.payload)).toBe(r.answer);
          if (r.payload.mode === 'compose') {
            const composePayload = r.payload;
            const matchCount = composePayload.options.filter((o) => o.sum === composePayload.target).length;
            expect(matchCount).toBeGreaterThanOrEqual(1);
            expect(composePayload.options).toHaveLength(4);
          }
          if (r.payload.mode === 'change') {
            expect(r.payload.paid - r.payload.cost).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('difficulty=1 (band L2) ніколи не генерує режим change', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L3');
      for (const r of rounds) expect(r.payload.mode).not.toBe('change');
    }
  });

  it('difficulty=2 (band L3) не використовує копійки (kopChance=0)', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(2, 'L3');
      for (const r of rounds) {
        if (r.payload.mode === 'count' || r.payload.mode === 'compose') {
          expect(r.payload.unit).toBe('hrn');
        }
      }
    }
  });

  it('generate(difficulty) без другого аргумента (зворотна сумісність) працює як level="L3"', () => {
    const { rounds } = generate(1);
    expect(rounds).toHaveLength(5);
    expect(rounds.every((r) => correctFor(r.payload) === r.answer)).toBe(true);
  });
});

describe('money-basics: CLASS_MONEY_CONFIG (G2b, клас-вісь)', () => {
  it('розмір hrnPool монотонно не спадає від grade1 до grade4', () => {
    const classes = ['grade1', 'grade2', 'grade3', 'grade4'] as const;
    for (let i = 1; i < classes.length; i++) {
      expect(CLASS_MONEY_CONFIG[classes[i]].hrnPool.length).toBeGreaterThanOrEqual(CLASS_MONEY_CONFIG[classes[i - 1]].hrnPool.length);
    }
  });

  it('grade1 — номінали до 20 грн без копійок; grade4 — повний ряд до 1000 грн (перенесено зі старого denominationsForClass)', () => {
    expect(CLASS_MONEY_CONFIG.grade1).toMatchObject({ hrnPool: [1, 2, 5, 10, 20], kopChance: 0 });
    expect(CLASS_MONEY_CONFIG.grade4.hrnPool).toEqual([1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]);
  });

  it('копійки з\'являються лише з grade3 (як у старому коді: includeKop = grade3||grade4)', () => {
    expect(CLASS_MONEY_CONFIG.grade1.kopChance).toBe(0);
    expect(CLASS_MONEY_CONFIG.grade2.kopChance).toBe(0);
    expect(CLASS_MONEY_CONFIG.grade3.kopChance).toBeGreaterThan(0);
    expect(CLASS_MONEY_CONFIG.grade4.kopChance).toBeGreaterThan(0);
  });
});

describe('money-basics: generate(difficulty, level, classLevel) — клас-вісь (G2b)', () => {
  it('відповіді узгоджені з correctFor і номінали належать клас-набору для всіх класів × difficulty', () => {
    const classes = ['grade1', 'grade2', 'grade3', 'grade4'] as const;
    for (const classLevel of classes) {
      for (const difficulty of [1, 2, 3] as const) {
        for (let i = 0; i < 15; i++) {
          const { rounds } = generate(difficulty, 'L3', classLevel);
          expect(rounds).toHaveLength(5);
          for (const r of rounds) {
            expect(correctFor(r.payload)).toBe(r.answer);
            if (r.payload.mode === 'count' && r.payload.unit === 'hrn') {
              for (const v of r.payload.items) expect(CLASS_MONEY_CONFIG[classLevel].hrnPool).toContain(v);
            }
            if (r.payload.mode === 'change') {
              expect(r.payload.paid - r.payload.cost).toBeGreaterThan(0);
            }
          }
        }
      }
    }
  });

  it('difficulty=1 → лише mode="count" (порахувати), difficulty=2 → лише mode="compose" (заплатити), difficulty=3 → лише mode="change" (решта)', () => {
    for (let i = 0; i < 15; i++) {
      expect(generate(1, 'L3', 'grade2').rounds.every((r) => r.payload.mode === 'count')).toBe(true);
      expect(generate(2, 'L3', 'grade2').rounds.every((r) => r.payload.mode === 'compose')).toBe(true);
      expect(generate(3, 'L3', 'grade2').rounds.every((r) => r.payload.mode === 'change')).toBe(true);
    }
  });

  it('grade1 (difficulty=1) не використовує копійки (kopChance=0)', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L3', 'grade1');
      for (const r of rounds) if (r.payload.mode === 'count') expect(r.payload.unit).toBe('hrn');
    }
  });
});
