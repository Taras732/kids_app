import { describe, expect, it } from 'vitest';
import { CONFIG_BY_BAND, configFor, generateBoard, isValidPair, canConnect, fuzzCheck, type BoardGrid, type Cell } from './generate';

function cellCount(config: { rows: number; cols: number }): number {
  return config.rows * config.cols;
}

describe('number-tiles: CONFIG_BY_BAND (D5 шкала L0-L4)', () => {
  it('розмір поля монотонно зростає від L0 (найлегше) до L4 (найважче)', () => {
    const bands = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;
    for (let i = 1; i < bands.length; i++) {
      expect(cellCount(CONFIG_BY_BAND[bands[i]])).toBeGreaterThan(cellCount(CONFIG_BY_BAND[bands[i - 1]]));
    }
  });

  it('зберігає попередні значення для реально задіяних рівнів (levels: [L3] → L2-L4)', () => {
    expect(CONFIG_BY_BAND.L2).toEqual({ rows: 4, cols: 4, sumOnly: true, hints: true });
    expect(CONFIG_BY_BAND.L3).toEqual({ rows: 5, cols: 5, sumOnly: false, hints: false });
    expect(CONFIG_BY_BAND.L4).toEqual({ rows: 6, cols: 6, sumOnly: false, hints: false });
  });

  it('configFor(difficulty, L3) відтворює band L2/L3/L4 для difficulty 1/2/3', () => {
    expect(configFor(1, 'L3')).toEqual(CONFIG_BY_BAND.L2);
    expect(configFor(2, 'L3')).toEqual(CONFIG_BY_BAND.L3);
    expect(configFor(3, 'L3')).toEqual(CONFIG_BY_BAND.L4);
  });
});

describe('number-tiles: generateBoard', () => {
  it('генерує поле правильного розміру, повністю розв\'язне валідними парами', () => {
    for (const difficulty of [1, 2, 3] as const) {
      const { config, grid } = generateBoard(difficulty, 'L3');
      expect(grid).toHaveLength(config.rows);
      expect(grid[0]).toHaveLength(config.cols);
    }
  });
});

describe('number-tiles: fuzzCheck (усі 5 бендів L0-L4)', () => {
  it('усі згенеровані поля гарантовано розбираються', () => {
    expect(fuzzCheck(15)).toBe(true);
  });
});

describe('number-tiles: isValidPair / canConnect (sanity)', () => {
  it('сума 10 і однакові числа — валідні пари', () => {
    expect(isValidPair(4, 6)).toBe(true);
    expect(isValidPair(5, 5)).toBe(true);
    expect(isValidPair(3, 4)).toBe(false);
  });

  it('сусідні по горизонталі клітинки без перешкод — з\'єднані', () => {
    const grid: BoardGrid = [[1, 2, null]];
    const a: Cell = [0, 0];
    const b: Cell = [0, 1];
    expect(canConnect(grid, a, b)).toBe(true);
  });
});
