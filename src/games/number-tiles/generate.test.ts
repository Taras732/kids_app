import { describe, expect, it } from 'vitest';
import { CLASS_LEVELS } from '../types';
import {
  CONFIG_BY_BAND,
  CONFIG_BY_CLASS,
  configFor,
  generateBoard,
  isValidPair,
  canConnect,
  hasValidMove,
  reshuffleStuck,
  buildDominoTiling,
  fillGrid,
  fuzzCheck,
  fuzzCheckConfigs,
  type BoardConfig,
  type BoardGrid,
  type Cell,
} from './generate';

function cellCount(config: { rows: number; cols: number }): number {
  return config.rows * config.cols;
}

function occupiedCount(grid: BoardGrid): number {
  return grid.reduce((n, row) => n + row.filter((v) => v !== null).length, 0);
}

/** Усі валідні ходи на полі — для БУДЬ-ЯКОЇ пари зайнятих клітинок, не лише
 *  "задуманої" генератором пари (реальний гравець вільний обирати будь-яку). */
function findAllValidMoves(grid: BoardGrid): [Cell, Cell][] {
  const rows = grid.length, cols = grid[0].length;
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (grid[r][c] !== null) cells.push([r, c]);
  const moves: [Cell, Cell][] = [];
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const a = cells[i], b = cells[j];
      const v1 = grid[a[0]][a[1]], v2 = grid[b[0]][b[1]];
      if (v1 !== null && v2 !== null && isValidPair(v1, v2) && canConnect(grid, a, b)) moves.push([a, b]);
    }
  }
  return moves;
}

/**
 * Симулює гравця, що обирає ДОВІЛЬНИЙ (не задуманий генератором) валідний
 * хід — так само, як реальна дитина може забрати "чужу" пару замість
 * офіційної. Коли ходів не лишається — застосовує РЕАЛЬНИЙ reshuffleStuck
 * (точно як робить GameComponent), щоб перевірити, що гра завжди
 * доводиться до кінця, а не зависає.
 */
function simulateWithRecovery(
  grid: BoardGrid,
  sumOnly: boolean,
  maxReshuffles = 10,
): { cleared: boolean; reshuffles: number } {
  let g = grid.map((row) => [...row]);
  let reshuffles = 0;
  for (let guard = 0; guard < 10_000; guard++) {
    if (occupiedCount(g) === 0) return { cleared: true, reshuffles };
    const moves = findAllValidMoves(g);
    if (moves.length === 0) {
      if (reshuffles >= maxReshuffles) return { cleared: false, reshuffles };
      reshuffles++;
      g = reshuffleStuck(g, sumOnly);
      continue;
    }
    const [a, b] = moves[Math.floor(Math.random() * moves.length)];
    g[a[0]][a[1]] = null;
    g[b[0]][b[1]] = null;
  }
  return { cleared: false, reshuffles };
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

describe('number-tiles: hasValidMove (виявлення "глухого кута")', () => {
  it('порожнє поле — жодного ходу', () => {
    const empty: BoardGrid = [[null, null]];
    expect(hasValidMove(empty)).toBe(false);
  });

  it('дві сусідні клітинки без валідної пари (3 і 4) — ходу немає', () => {
    const grid: BoardGrid = [[3, 4]];
    expect(hasValidMove(grid)).toBe(false);
  });

  it('дві сусідні клітинки з сумою 10 — хід є', () => {
    const grid: BoardGrid = [[4, 6]];
    expect(hasValidMove(grid)).toBe(true);
  });

  it('дві однакові клітинки — хід є', () => {
    const grid: BoardGrid = [[5, 5]];
    expect(hasValidMove(grid)).toBe(true);
  });

  it('валідна пара є, але заблокована іншою плиткою між ними — ходу немає', () => {
    // 4 і 6 дають 10, але 7 між ними блокує з'єднання по рядку.
    const grid: BoardGrid = [[4, 7, 6]];
    expect(hasValidMove(grid)).toBe(false);
  });

  it('валідна пара по стовпчику, порожньо між ними — хід є', () => {
    const grid: BoardGrid = [[4], [null], [6]];
    expect(hasValidMove(grid)).toBe(true);
  });
});

describe('number-tiles: reshuffleStuck (анти-глухий-кут рятувальний реміс)', () => {
  it('порожнє поле лишається порожнім', () => {
    const empty: BoardGrid = [[null, null]];
    const result = reshuffleStuck(empty, false);
    expect(occupiedCount(result)).toBe(0);
  });

  it('зберігає розмір поля і КІЛЬКІСТЬ зайнятих клітинок, і після реміксу є хід', () => {
    // Штучний "глухий кут" на 1x4: жодна сусідня пара не валідна (3-4, 4-1, 1-8),
    // а несусідні заблоковані — типовий випадок, який живий фаззер відтворив насправді.
    const stuck: BoardGrid = [[3, 4, 1, 8]];
    expect(hasValidMove(stuck)).toBe(false);

    const rescued = reshuffleStuck(stuck, false);
    expect(rescued).toHaveLength(1);
    expect(rescued[0]).toHaveLength(4);
    expect(occupiedCount(rescued)).toBe(occupiedCount(stuck));
    expect(hasValidMove(rescued)).toBe(true);
  });

  it('рятує навіть "діагональний" глухий кут (2 плитки не в одному рядку/стовпці)', () => {
    // 4 і 6 самі по собі ВАЛІДНА пара (сума 10) — але вони по діагоналі, не в
    // одному рядку чи стовпці, тож жодна перестановка ЗНАЧЕНЬ на цих самих
    // позиціях не допоможе. Потрібна нова геометрія (переїзд плиток).
    const stuck: BoardGrid = [
      [null, 4],
      [6, null],
    ];
    expect(hasValidMove(stuck)).toBe(false);
    const rescued = reshuffleStuck(stuck, false);
    expect(occupiedCount(rescued)).toBe(2);
    expect(hasValidMove(rescued)).toBe(true);
  });

  it('фундаментально непарний набір значень (1,2,4,7 — жодні два не однакові й не дають 10) теж рятується', () => {
    const stuck: BoardGrid = [[1, 2, 4, 7]];
    expect(hasValidMove(stuck)).toBe(false);
    const rescued = reshuffleStuck(stuck, false);
    expect(occupiedCount(rescued)).toBe(4);
    expect(hasValidMove(rescued)).toBe(true);
  });
});

describe('number-tiles: живий фаззер — гравець з ДОВІЛЬНИМ порядком ходів ніколи не застрягає назавжди', () => {
  // Живий тест підтвердив: якщо просто грати "офіційними" парами генератора —
  // усе ок (verifyBoard/fuzzCheck), але РЕАЛЬНА дитина натомість може забрати
  // будь-яку валідну-і-з'єднану пару, не ту, що задумав генератор — і це іноді
  // (у 2-45% партій залежно від розміру поля) доводить до 2-6 плиток без
  // жодного ходу. reshuffleStuck має завжди рятувати цю ситуацію.
  const allConfigs: [string, BoardConfig][] = [
    ...Object.entries(CONFIG_BY_BAND),
    ...CLASS_LEVELS.flatMap((cl) => ([1, 2, 3] as const).map((d) => [`${cl}/${d}`, CONFIG_BY_CLASS[cl][d]] as [string, BoardConfig])),
  ];

  it.each(allConfigs)('%s: 60 партій з довільним порядком ходів завжди доходять до кінця', (_name, config) => {
    for (let i = 0; i < 60; i++) {
      const { pairs } = buildDominoTiling(config.rows, config.cols);
      const grid = fillGrid(config.rows, config.cols, pairs, config.sumOnly);
      const result = simulateWithRecovery(grid, config.sumOnly);
      expect(result.cleared).toBe(true);
    }
  });
});
