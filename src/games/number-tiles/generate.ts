import type { ClassLevel, Difficulty, GradeBand, ProfileLevel } from '../types';
import { gradeBandFor, GRADE_BANDS } from '../types';

export type Cell = [number, number];
export type BoardGrid = (number | null)[][];

export interface BoardConfig {
  rows: number;
  cols: number;
  /** Easy: лише пари з сумою 10 (без однакових, крім випадкового 5+5). */
  sumOnly: boolean;
  /** Показувати підказку-підсвітку сумісних плиток після вибору першої. */
  hints: boolean;
}

/**
 * Розмір/правила поля за узгодженою шкалою L0-L4 (D5). Гра доступна лише
 * профілю 'L3' (школярі, `levels: ['L3']`), тож реально задіяні лише L2-L4
 * (Easy/Medium/Hard, значення точно як у попередній difficulty-таблиці); L0-L1
 * — про запас на майбутнє розширення `levels` (менші поля, ще простіші за L2).
 *
 * Fallback-шлях: використовується лише коли `classLevel` не задано (див.
 * `configFor`). При заданому класі — `CONFIG_BY_CLASS` нижче (G2b-2).
 */
export const CONFIG_BY_BAND: Record<GradeBand, BoardConfig> = {
  L0: { rows: 2, cols: 4, sumOnly: true, hints: true },
  L1: { rows: 3, cols: 4, sumOnly: true, hints: true },
  L2: { rows: 4, cols: 4, sumOnly: true, hints: true },
  L3: { rows: 5, cols: 5, sumOnly: false, hints: false },
  L4: { rows: 6, cols: 6, sumOnly: false, hints: false },
};

/**
 * Розмір поля за КЛАСОМ × difficulty (G2b-2, двовісна складність). Гра НОВА
 * (немає прямого аналога у старій версії, гілка main) — масштаб підібраний
 * логічно: поле зростає і всередині класу (difficulty: Easy→Hard), і між
 * класами (preschool→grade4). Шви навмисно узгоджені з `CONFIG_BY_BAND`:
 * grade2/Easy = L2, grade2/Hard = L3, grade3/Hard = L4 — щоб клас-шкала була
 * продовженням старої фолбек-шкали, а не паралельною системою координат.
 * `sumOnly`/`hints` вимикаються від тієї ж точки (grade2/Hard), де раніше
 * вимикались на L3.
 */
export const CONFIG_BY_CLASS: Record<ClassLevel, Record<Difficulty, BoardConfig>> = {
  preschool: {
    1: { rows: 2, cols: 3, sumOnly: true, hints: true },
    2: { rows: 2, cols: 4, sumOnly: true, hints: true },
    3: { rows: 3, cols: 4, sumOnly: true, hints: true },
  },
  grade1: {
    1: { rows: 3, cols: 4, sumOnly: true, hints: true },
    2: { rows: 3, cols: 5, sumOnly: true, hints: true },
    3: { rows: 4, cols: 4, sumOnly: true, hints: true },
  },
  grade2: {
    1: { rows: 4, cols: 4, sumOnly: true, hints: true },
    2: { rows: 4, cols: 5, sumOnly: true, hints: true },
    3: { rows: 5, cols: 5, sumOnly: false, hints: false },
  },
  grade3: {
    1: { rows: 5, cols: 5, sumOnly: false, hints: false },
    2: { rows: 5, cols: 6, sumOnly: false, hints: false },
    3: { rows: 6, cols: 6, sumOnly: false, hints: false },
  },
  grade4: {
    1: { rows: 6, cols: 6, sumOnly: false, hints: false },
    2: { rows: 6, cols: 7, sumOnly: false, hints: false },
    3: { rows: 7, cols: 7, sumOnly: false, hints: false },
  },
};

export function configFor(difficulty: Difficulty, level: ProfileLevel = 'L3', classLevel?: ClassLevel): BoardConfig {
  if (classLevel) return CONFIG_BY_CLASS[classLevel][difficulty];
  return CONFIG_BY_BAND[gradeBandFor(level, difficulty)];
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Жадібне доміно-замощення сітки: кожна пара — дві СУСІДНІ клітинки (право,
 * інакше низ). Між сусідніми клітинками нема проміжних клітинок, тому таку
 * пару завжди можна прибрати незалежно від порядку й стану решти поля —
 * це і гарантує, що будь-яке зібране з таких пар поле повністю розбирається.
 * При непарній площі рівно одна клітинка (остання за обходом) лишається
 * порожньою з самого початку.
 */
export function buildDominoTiling(rows: number, cols: number): { pairs: [Cell, Cell][]; holdOut: Cell | null } {
  const transpose = Math.random() < 0.5;
  const R = transpose ? cols : rows;
  const C = transpose ? rows : cols;
  const filled: boolean[][] = Array.from({ length: R }, () => Array(C).fill(false));
  let holdOutT: Cell | null = null;
  if ((R * C) % 2 === 1) {
    holdOutT = [R - 1, C - 1];
    filled[R - 1][C - 1] = true;
  }
  const pairsT: [Cell, Cell][] = [];
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (filled[r][c]) continue;
      if (c + 1 < C && !filled[r][c + 1]) {
        pairsT.push([[r, c], [r, c + 1]]);
        filled[r][c] = filled[r][c + 1] = true;
      } else if (r + 1 < R && !filled[r + 1][c]) {
        pairsT.push([[r, c], [r + 1, c]]);
        filled[r][c] = filled[r + 1][c] = true;
      } else {
        // Безпечний фолбек (не мав би траплятись для наших розмірів — підтверджено фаззер-чеком).
        filled[r][c] = true;
      }
    }
  }
  const detranspose = (cell: Cell): Cell => (transpose ? [cell[1], cell[0]] : cell);
  return {
    pairs: pairsT.map(([a, b]): [Cell, Cell] => [detranspose(a), detranspose(b)]),
    holdOut: holdOutT ? detranspose(holdOutT) : null,
  };
}

export function fillGrid(rows: number, cols: number, pairs: [Cell, Cell][], sumOnly: boolean): BoardGrid {
  const grid: BoardGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (const [a, b] of pairs) {
    const useEqual = !sumOnly && Math.random() < 0.5;
    const d = randInt(1, 9);
    grid[a[0]][a[1]] = d;
    grid[b[0]][b[1]] = useEqual ? d : 10 - d;
  }
  return grid;
}

export function isValidPair(v1: number, v2: number): boolean {
  return v1 === v2 || v1 + v2 === 10;
}

/** Дві плитки з'єднані, якщо вони в одному рядку/стовпці і всі клітинки між ними порожні. */
export function canConnect(grid: BoardGrid, a: Cell, b: Cell): boolean {
  const [r1, c1] = a;
  const [r2, c2] = b;
  if (r1 === r2) {
    const lo = Math.min(c1, c2), hi = Math.max(c1, c2);
    for (let c = lo + 1; c < hi; c++) if (grid[r1][c] !== null) return false;
    return true;
  }
  if (c1 === c2) {
    const lo = Math.min(r1, r2), hi = Math.max(r1, r2);
    for (let r = lo + 1; r < hi; r++) if (grid[r][c1] !== null) return false;
    return true;
  }
  return false;
}

export function generateBoard(
  difficulty: Difficulty,
  level: ProfileLevel = 'L3',
  classLevel?: ClassLevel,
): { config: BoardConfig; grid: BoardGrid } {
  const config = configFor(difficulty, level, classLevel);
  const { pairs } = buildDominoTiling(config.rows, config.cols);
  const grid = fillGrid(config.rows, config.cols, pairs, config.sumOnly);
  return { config, grid };
}

/** Перевірити, що поле повністю розбирається відомим розв'язком (pairs) у випадковому порядку. */
function verifyBoard(grid: BoardGrid, pairs: [Cell, Cell][]): boolean {
  const g = grid.map((row) => [...row]);
  for (const [a, b] of shuffle(pairs)) {
    const v1 = g[a[0]][a[1]];
    const v2 = g[b[0]][b[1]];
    if (v1 === null || v2 === null) return false;
    if (!isValidPair(v1, v2)) return false;
    if (!canConnect(g, a, b)) return false;
    g[a[0]][a[1]] = null;
    g[b[0]][b[1]] = null;
  }
  return g.every((row) => row.every((v) => v === null));
}

/** Фаззер-чек довільного набору конфігів поля (dev/test): усі мають гарантовано розбиратись. */
export function fuzzCheckConfigs(configs: BoardConfig[], roundsPerConfig = 60): boolean {
  let allOk = true;
  for (const config of configs) {
    for (let i = 0; i < roundsPerConfig; i++) {
      const { pairs } = buildDominoTiling(config.rows, config.cols);
      const grid = fillGrid(config.rows, config.cols, pairs, config.sumOnly);
      if (!verifyBoard(grid, pairs)) {
        allOk = false;
        // eslint-disable-next-line no-console
        console.error(`[number-tiles] fuzz FAIL: rows=${config.rows} cols=${config.cols} sumOnly=${config.sumOnly}`);
      }
    }
  }
  return allOk;
}

/** Швидкий фаззер-чек (dev-only): N полів на кожен GradeBand (D5: L0-L4, увесь
 *  спектр про запас, не лише сьогодні задіяні L2-L4) мають гарантовано розбиратись. */
export function fuzzCheck(roundsPerBand = 60): boolean {
  const allOk = fuzzCheckConfigs(GRADE_BANDS.map((band) => CONFIG_BY_BAND[band]), roundsPerBand);
  // eslint-disable-next-line no-console
  if (allOk) console.info(`[number-tiles] fuzz-check OK: ${roundsPerBand * GRADE_BANDS.length} полів розбираються.`);
  return allOk;
}
