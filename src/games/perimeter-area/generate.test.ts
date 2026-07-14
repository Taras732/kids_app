import { describe, expect, it } from 'vitest';
import {
  BAND_CONFIG,
  areaOf,
  correctFor,
  generate,
  lShapeCells,
  perimeterOf,
  rectangleCells,
} from './generate';

describe('perimeter-area: perimeterOf/areaOf — коректність на відомих фігурах', () => {
  it('прямокутник 3×4: периметр 14, площа 12 (звірка із закритою формулою 2(w+h) і w*h)', () => {
    const cells = rectangleCells(3, 4);
    expect(areaOf(cells)).toBe(12);
    expect(perimeterOf(cells)).toBe(14);
  });

  it('квадрат 1×1: периметр 4, площа 1', () => {
    const cells = rectangleCells(1, 1);
    expect(areaOf(cells)).toBe(1);
    expect(perimeterOf(cells)).toBe(4);
  });

  it('прямокутники: генеричний алгоритм periметра завжди збігається із закритою формулою 2(w+h)', () => {
    for (let w = 1; w <= 10; w++) {
      for (let h = 1; h <= 10; h++) {
        const cells = rectangleCells(w, h);
        expect(perimeterOf(cells)).toBe(2 * (w + h));
        expect(areaOf(cells)).toBe(w * h);
      }
    }
  });

  it('L-тромінo (2×2 мінус кутова клітинка 1×1): площа 3, периметр 8 (відомий результат)', () => {
    const cells = lShapeCells(2, 2, 1, 1);
    expect(areaOf(cells)).toBe(3);
    expect(perimeterOf(cells)).toBe(8);
  });

  it('lShapeCells: площа завжди = bw*bh - nw*nh, фігура завжди зв\'язана (одна компонента)', () => {
    for (let i = 0; i < 50; i++) {
      const bw = 3 + (i % 6);
      const bh = 3 + ((i * 3) % 6);
      const nw = 1 + (i % (bw - 1));
      const nh = 1 + (i % (bh - 1));
      const cells = lShapeCells(bw, bh, nw, nh);
      expect(areaOf(cells)).toBe(bw * bh - nw * nh);
      expect(isConnected(cells)).toBe(true);
    }
  });
});

/** Перевірка зв'язності фігури (BFS по сусідніх клітинках) — незалежна від perimeterOf/areaOf. */
function isConnected(cells: string[]): boolean {
  if (cells.length === 0) return true;
  const set = new Set(cells);
  const seen = new Set<string>();
  const queue = [cells[0]];
  seen.add(cells[0]);
  while (queue.length > 0) {
    const [x, y] = queue.pop()!.split(',').map(Number);
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      const key = `${nx},${ny}`;
      if (set.has(key) && !seen.has(key)) {
        seen.add(key);
        queue.push(key);
      }
    }
  }
  return seen.size === cells.length;
}

describe('perimeter-area: BAND_CONFIG (D5 шкала L0-L4)', () => {
  it('зберігає узгоджені значення для реально задіяних рівнів (levels: [L3] → L2-L4)', () => {
    expect(BAND_CONFIG.L2.modes).toEqual(['perimeter']);
    expect(BAND_CONFIG.L2.shapeKind).toBe('rectangle');
    expect(BAND_CONFIG.L3.modes).toEqual(['area']);
    expect(BAND_CONFIG.L3.shapeKind).toBe('rectangle');
    expect(BAND_CONFIG.L4.modes).toEqual(['perimeter', 'area']);
    expect(BAND_CONFIG.L4.shapeKind).toBe('lshape');
  });

  it('максимальний вимір не перевищує 8 на жодному бенді (безпечно для екрана 320px)', () => {
    for (const band of ['L0', 'L1', 'L2', 'L3', 'L4'] as const) {
      expect(BAND_CONFIG[band].maxDim).toBeLessThanOrEqual(8);
      expect(BAND_CONFIG[band].minDim).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('perimeter-area: generate(difficulty, level)', () => {
  it('generate(difficulty, "L3") для 1/2/3 — 5 раундів, усі відповіді узгоджені з correctFor', () => {
    for (const difficulty of [1, 2, 3] as const) {
      for (let i = 0; i < 30; i++) {
        const { rounds } = generate(difficulty, 'L3');
        expect(rounds).toHaveLength(5);
        for (const r of rounds) {
          expect(correctFor(r.payload)).toBe(r.answer);
          expect(r.answer).toBeGreaterThan(0);
          expect(Number.isInteger(r.answer)).toBe(true);
        }
      }
    }
  });

  it('difficulty=1 (band L2): лише режим perimeter, прямокутники в межах [2,6]', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L3');
      for (const r of rounds) {
        expect(r.payload.mode).toBe('perimeter');
        expect(r.payload.shapeKind).toBe('rectangle');
        expect(r.payload.width).toBeGreaterThanOrEqual(2);
        expect(r.payload.width).toBeLessThanOrEqual(6);
        expect(r.payload.height).toBeGreaterThanOrEqual(2);
        expect(r.payload.height).toBeLessThanOrEqual(6);
      }
    }
  });

  it('difficulty=2 (band L3): лише режим area, прямокутники в межах [3,8]', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(2, 'L3');
      for (const r of rounds) {
        expect(r.payload.mode).toBe('area');
        expect(r.payload.shapeKind).toBe('rectangle');
        expect(r.payload.width).toBeGreaterThanOrEqual(3);
        expect(r.payload.width).toBeLessThanOrEqual(8);
      }
    }
  });

  it('difficulty=3 (band L4): L-подібні фігури, обидва режими зустрічаються, площа < w*h', () => {
    const seenModes = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const { rounds } = generate(3, 'L3');
      for (const r of rounds) {
        seenModes.add(r.payload.mode);
        expect(r.payload.shapeKind).toBe('lshape');
        expect(r.payload.cells.length).toBeLessThan(r.payload.width * r.payload.height);
        expect(r.payload.width).toBeLessThanOrEqual(8);
        expect(r.payload.height).toBeLessThanOrEqual(8);
      }
    }
    expect(seenModes.has('perimeter')).toBe(true);
    expect(seenModes.has('area')).toBe(true);
  });

  it('generate(difficulty) без другого аргумента (зворотна сумісність) працює як level="L3"', () => {
    const { rounds } = generate(1);
    expect(rounds).toHaveLength(5);
    expect(rounds.every((r) => correctFor(r.payload) === r.answer)).toBe(true);
  });
});
