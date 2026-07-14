import { describe, expect, it } from 'vitest';
import { CLASS_LEVELS } from '../types';
import {
  CONFIG_BY_BAND,
  CONFIG_BY_CLASS,
  configFor,
  generateBoard,
  isValidPair,
  canConnect,
  fuzzCheck,
  fuzzCheckConfigs,
  type BoardGrid,
  type Cell,
} from './generate';

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

describe('number-tiles: CONFIG_BY_CLASS (G2b-2 двовісна складність, нова гра)', () => {
  it('в межах кожного класу площа поля не спадає Easy→Medium→Hard', () => {
    for (const cl of CLASS_LEVELS) {
      const easy = cellCount(CONFIG_BY_CLASS[cl][1]);
      const medium = cellCount(CONFIG_BY_CLASS[cl][2]);
      const hard = cellCount(CONFIG_BY_CLASS[cl][3]);
      expect(medium).toBeGreaterThanOrEqual(easy);
      expect(hard).toBeGreaterThanOrEqual(medium);
    }
  });

  it('обрій (Hard) монотонно зростає між класами: grade2 < grade3 < grade4', () => {
    expect(cellCount(CONFIG_BY_CLASS.grade2[3])).toBeLessThan(cellCount(CONFIG_BY_CLASS.grade3[3]));
    expect(cellCount(CONFIG_BY_CLASS.grade3[3])).toBeLessThan(cellCount(CONFIG_BY_CLASS.grade4[3]));
  });

  it('шви узгоджені з фолбек-шкалою CONFIG_BY_BAND: grade2/Easy=L2, grade2/Hard=L3, grade3/Hard=L4', () => {
    expect(CONFIG_BY_CLASS.grade2[1]).toEqual(CONFIG_BY_BAND.L2);
    expect(CONFIG_BY_CLASS.grade2[3]).toEqual(CONFIG_BY_BAND.L3);
    expect(CONFIG_BY_CLASS.grade3[3]).toEqual(CONFIG_BY_BAND.L4);
  });

  it('sumOnly/hints вимикаються від grade2/Hard і далі (як і в старій L3+ шкалі)', () => {
    expect(CONFIG_BY_CLASS.grade2[2].sumOnly).toBe(true);
    expect(CONFIG_BY_CLASS.grade2[3].sumOnly).toBe(false);
    expect(CONFIG_BY_CLASS.grade3[1].sumOnly).toBe(false);
    expect(CONFIG_BY_CLASS.grade4[3].sumOnly).toBe(false);
  });
});

describe('number-tiles: configFor/generateBoard з classLevel', () => {
  it('configFor(difficulty, level, classLevel) повертає саме клас-конфіг', () => {
    for (const cl of CLASS_LEVELS) {
      for (const difficulty of [1, 2, 3] as const) {
        expect(configFor(difficulty, 'L3', cl)).toEqual(CONFIG_BY_CLASS[cl][difficulty]);
      }
    }
  });

  it('generateBoard з classLevel — розмір грід відповідає конфігу класу', () => {
    for (const cl of ['grade2', 'grade3', 'grade4'] as const) {
      for (const difficulty of [1, 2, 3] as const) {
        const { config, grid } = generateBoard(difficulty, 'L3', cl);
        expect(grid).toHaveLength(config.rows);
        expect(grid[0]).toHaveLength(config.cols);
        expect(config).toEqual(CONFIG_BY_CLASS[cl][difficulty]);
      }
    }
  });

  it('без classLevel (undefined) — поведінка не змінюється (fallback на CONFIG_BY_BAND)', () => {
    expect(configFor(1, 'L3')).toEqual(CONFIG_BY_BAND.L2);
    expect(configFor(2, 'L3')).toEqual(CONFIG_BY_BAND.L3);
    expect(configFor(3, 'L3')).toEqual(CONFIG_BY_BAND.L4);
  });

  it('усі нові розміри поля (клас-таблиця) гарантовано розбираються (фаззер)', () => {
    const configs = CLASS_LEVELS.flatMap((cl) => ([1, 2, 3] as const).map((d) => CONFIG_BY_CLASS[cl][d]));
    expect(configs.length).toBe(CLASS_LEVELS.length * 3);
    expect(fuzzCheckConfigs(configs, 15)).toBe(true);
  });
});
