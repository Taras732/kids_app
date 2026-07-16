import { describe, it, expect } from 'vitest';
import {
  flip,
  flipsDirection,
  directionAt,
  lastDirection,
  allDirections,
  wheelCount,
  generateChain,
  configFor,
  createRng,
  type Chain,
  type Band,
} from './core';

const BANDS: Band[] = ['L1', 'L2', 'L3', 'L4'];

describe('правило: зчеплені шестерні крутяться в різні боки', () => {
  it('зубчасте зчеплення перевертає напрямок, прямий пас — ні, перехрещений — так', () => {
    expect(flipsDirection('gear')).toBe(true);
    expect(flipsDirection('belt')).toBe(false);
    expect(flipsDirection('belt-crossed')).toBe(true);
  });

  it('flip взаємний: двічі перевернути = початковий напрямок', () => {
    expect(flip(flip('cw'))).toBe('cw');
    expect(flip(flip('ccw'))).toBe('ccw');
    expect(flip('cw')).toBe('ccw');
  });

  it('перше колесо крутиться так, як задано', () => {
    const chain: Chain = { start: 'cw', links: ['gear', 'gear'] };
    expect(directionAt(chain, 0)).toBe('cw');
  });

  it('у ланцюгу лише із зубців напрямок визначає ПАРНІСТЬ (звірка незалежною формулою)', () => {
    for (const start of ['cw', 'ccw'] as const) {
      for (let n = 1; n <= 6; n++) {
        const chain: Chain = { start, links: Array(n).fill('gear') };
        for (let i = 0; i <= n; i++) {
          // незалежна формула: парний індекс — як перше, непарний — навпаки
          const expected = i % 2 === 0 ? start : flip(start);
          expect(directionAt(chain, i), `${n} зубців, колесо ${i}`).toBe(expected);
        }
      }
    }
  });

  it('сусідні колеса на зубцях ЗАВЖДИ крутяться протилежно — це і є правило', () => {
    const chain: Chain = { start: 'cw', links: Array(5).fill('gear') };
    const dirs = allDirections(chain);
    for (let i = 1; i < dirs.length; i++) {
      expect(dirs[i], `колеса ${i - 1} і ${i} однакові`).toBe(flip(dirs[i - 1]));
    }
  });

  it('прямий пас передає напрямок без зміни; перехрещений — перевертає', () => {
    expect(lastDirection({ start: 'cw', links: ['belt'] })).toBe('cw');
    expect(lastDirection({ start: 'cw', links: ['belt-crossed'] })).toBe('ccw');
    // пас посеред ланцюга не перериває правило зубців
    expect(lastDirection({ start: 'cw', links: ['gear', 'belt', 'gear'] })).toBe('cw');
  });
});

describe('ланцюг', () => {
  it('коліс завжди на одне більше, ніж з’єднань', () => {
    for (const band of BANDS) {
      const chain = generateChain(band, createRng(1));
      expect(wheelCount(chain)).toBe(chain.links.length + 1);
      expect(wheelCount(chain)).toBe(configFor(band).wheels);
    }
  });

  it('складність = довжина ланцюга причин і не спадає від L1 до L4', () => {
    const counts = BANDS.map((b) => configFor(b).wheels);
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]);
    }
    // паси з'являються лише на найвищому рівні: спершу правило про зубці
    expect(configFor('L1').belts).toBe(false);
    expect(configFor('L3').belts).toBe(false);
    expect(configFor('L4').belts).toBe(true);
  });

  it('до L4 у ланцюгу лише зубці (пасів немає)', () => {
    for (const band of ['L1', 'L2', 'L3'] as const) {
      for (let seed = 1; seed <= 50; seed++) {
        const chain = generateChain(band, createRng(seed));
        expect(chain.links.every((l) => l === 'gear'), `${band} має пас`).toBe(true);
      }
    }
  });

  it('детермінований за seed (не стрибає між ре-рендерами — баг Q2)', () => {
    expect(generateChain('L4', createRng(42))).toEqual(generateChain('L4', createRng(42)));
  });

  it('обидва стартові напрямки трапляються (завдання не однобокі)', () => {
    const starts = new Set(Array.from({ length: 40 }, (_, i) => generateChain('L2', createRng(i + 1)).start));
    expect(starts.size).toBe(2);
  });

  it('allDirections дає напрямок для КОЖНОГО колеса (для показу розв’язку)', () => {
    for (const band of BANDS) {
      const chain = generateChain(band, createRng(5));
      expect(allDirections(chain)).toHaveLength(wheelCount(chain));
    }
  });
});
