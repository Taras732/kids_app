import { describe, expect, it } from 'vitest';
import {
  generate,
  CHOICES_BY_BAND,
  SEASON_LABEL,
  WEATHER_LABEL,
} from './generate';

const SEASON_LABELS = new Set(Object.values(SEASON_LABEL));
const WEATHER_LABELS = new Set(Object.values(WEATHER_LABEL));

describe('seasons-weather: CHOICES_BY_BAND (D5 шкала L0-L4)', () => {
  it('не спадає від L0 (найлегше) до L4 (найважче)', () => {
    expect(CHOICES_BY_BAND.L0).toBeLessThanOrEqual(CHOICES_BY_BAND.L1);
    expect(CHOICES_BY_BAND.L1).toBeLessThanOrEqual(CHOICES_BY_BAND.L2);
    expect(CHOICES_BY_BAND.L2).toBeLessThanOrEqual(CHOICES_BY_BAND.L3);
    expect(CHOICES_BY_BAND.L3).toBeLessThanOrEqual(CHOICES_BY_BAND.L4);
  });

  it('L0 має найменше варіантів (акцент на малят), максимум — усі 4 категорії', () => {
    expect(CHOICES_BY_BAND.L0).toBe(2);
    expect(CHOICES_BY_BAND.L2).toBe(4);
    expect(CHOICES_BY_BAND.L4).toBe(4);
  });
});

describe('seasons-weather: generate', () => {
  it('завжди повертає 5 раундів', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L0');
      expect(rounds).toHaveLength(5);
    }
  });

  it('difficulty=1 (band L0): по 2 варіанти відповіді, правильна відповідь серед них', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(1, 'L0');
      for (const r of rounds) {
        expect(r.payload.options).toHaveLength(CHOICES_BY_BAND.L0);
        expect(r.payload.options).toContain(r.answer);
        // без дублікатів варіантів
        expect(new Set(r.payload.options).size).toBe(r.payload.options.length);
      }
    }
  });

  it('difficulty=3 (band L2): по 4 варіанти відповіді (усі категорії), правильна серед них', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(3, 'L0');
      for (const r of rounds) {
        expect(r.payload.options).toHaveLength(CHOICES_BY_BAND.L2);
        expect(r.payload.options).toContain(r.answer);
        expect(new Set(r.payload.options).size).toBe(r.payload.options.length);
      }
    }
  });

  it('kind узгоджений з відповіддю: season → мітка пори року, weather → мітка погоди', () => {
    for (let i = 0; i < 30; i++) {
      const { rounds } = generate(2, 'L0');
      for (const r of rounds) {
        if (r.payload.kind === 'season') {
          expect(SEASON_LABELS.has(r.answer)).toBe(true);
          for (const opt of r.payload.options) expect(SEASON_LABELS.has(opt)).toBe(true);
        } else {
          expect(WEATHER_LABELS.has(r.answer)).toBe(true);
          for (const opt of r.payload.options) expect(WEATHER_LABELS.has(opt)).toBe(true);
        }
        expect(r.payload.emoji.length).toBeGreaterThan(0);
      }
    }
  });

  it('difficulty=1 (band L0) генерує обидва типи раундів (season і weather) за багато спроб', () => {
    const kinds = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const { rounds } = generate(1, 'L0');
      for (const r of rounds) kinds.add(r.payload.kind);
    }
    expect(kinds.has('season')).toBe(true);
    expect(kinds.has('weather')).toBe(true);
  });
});
