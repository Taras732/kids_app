import { describe, expect, it } from 'vitest';
import { CONFIG_BY_BAND, generate, correctFor } from './generate';

describe('measures: CONFIG_BY_BAND (D5 шкала L0-L4)', () => {
  it('кількість дозволених одиниць монотонно не спадає від L0 (найлегше) до L4 (найважче)', () => {
    const bands = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
    for (let i = 1; i < bands.length; i++) {
      expect(CONFIG_BY_BAND[bands[i]].unitKeys.length).toBeGreaterThanOrEqual(CONFIG_BY_BAND[bands[i - 1]].unitKeys.length);
    }
  });

  it('кількість категорій монотонно не спадає від L0 до L4', () => {
    const bands = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
    for (let i = 1; i < bands.length; i++) {
      expect(CONFIG_BY_BAND[bands[i]].categories.length).toBeGreaterThanOrEqual(CONFIG_BY_BAND[bands[i - 1]].categories.length);
    }
  });

  it('зберігає попередні значення для реально задіяних рівнів (levels: [L3] → L2-L4)', () => {
    expect(CONFIG_BY_BAND.L2.unitKeys).toEqual(['cm', 'm', 'g', 'kg', 'ml', 'l']);
    expect(CONFIG_BY_BAND.L2.categories).toEqual(['length', 'mass', 'volume']);
    expect(CONFIG_BY_BAND.L2.allowReverseConvert).toBe(false);
    expect(CONFIG_BY_BAND.L2.modes).toEqual(['unit', 'unit', 'unit', 'compare', 'compare']);

    expect(CONFIG_BY_BAND.L3.unitKeys).toEqual(['mm', 'cm', 'm', 'g', 'kg', 'ml', 'l']);
    expect(CONFIG_BY_BAND.L3.categories).toEqual(['length', 'mass', 'volume']);
    expect(CONFIG_BY_BAND.L3.allowReverseConvert).toBe(false);
    expect(CONFIG_BY_BAND.L3.modes).toEqual(['unit', 'unit', 'compare', 'convert', 'convert']);

    expect(CONFIG_BY_BAND.L4.categories).toEqual(['length', 'mass', 'volume', 'temp']);
    expect(CONFIG_BY_BAND.L4.allowReverseConvert).toBe(true);
    expect(CONFIG_BY_BAND.L4.modes).toEqual(['unit', 'compare', 'convert', 'multistep', 'multistep']);
  });

  it('L0/L1 не регресують нижче L2 і не вводять convert/multistep/temp', () => {
    expect(CONFIG_BY_BAND.L0.unitKeys.length).toBeLessThanOrEqual(CONFIG_BY_BAND.L2.unitKeys.length);
    expect(CONFIG_BY_BAND.L1.unitKeys.length).toBeLessThanOrEqual(CONFIG_BY_BAND.L2.unitKeys.length);
    expect(CONFIG_BY_BAND.L0.categories.includes('temp')).toBe(false);
    expect(CONFIG_BY_BAND.L1.categories.includes('temp')).toBe(false);
    expect(CONFIG_BY_BAND.L0.modes.some((m) => m === 'convert' || m === 'multistep')).toBe(false);
    expect(CONFIG_BY_BAND.L1.modes.some((m) => m === 'convert' || m === 'multistep')).toBe(false);
  });
});

describe('measures: generate(difficulty, level)', () => {
  it('generate(difficulty, "L3") для 1/2/3 — усі відповіді узгоджені з correctFor', () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let i = 0; i < 30; i++) {
        const { rounds } = generate(difficulty, 'L3');
        expect(rounds).toHaveLength(5);
        for (const r of rounds) {
          expect(correctFor(r.payload)).toBe(r.answer);
          if (r.payload.mode === 'convert' || r.payload.mode === 'multistep') {
            expect(Number.isInteger(r.payload.result)).toBe(true);
            expect(r.payload.result).toBeGreaterThanOrEqual(1);
          }
          if (r.payload.mode === 'compare' && difficulty < 3) {
            expect(r.payload.left.category).not.toBe('temp');
            expect(r.payload.right.category).not.toBe('temp');
          }
        }
      }
    }
  });

  it('difficulty=1 (band L2) ніколи не генерує convert/multistep', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L3');
      for (const r of rounds) expect(['unit', 'compare']).toContain(r.payload.mode);
    }
  });

  it('difficulty=3 (band L4) допускає температуру у compare', () => {
    let sawTemp = false;
    for (let i = 0; i < 40; i++) {
      const { rounds } = generate(3, 'L3');
      for (const r of rounds) {
        if (r.payload.mode === 'compare' && (r.payload.left.category === 'temp' || r.payload.right.category === 'temp')) {
          sawTemp = true;
        }
      }
    }
    expect(sawTemp).toBe(true);
  });

  it('generate(difficulty) без другого аргумента (зворотна сумісність) працює як level="L3"', () => {
    const { rounds } = generate(1);
    expect(rounds).toHaveLength(5);
    expect(rounds.every((r) => correctFor(r.payload) === r.answer)).toBe(true);
  });
});
