// 9x9 sudoku generator via base pattern + permutations.

const BASE: number[][] = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  [4, 5, 6, 7, 8, 9, 1, 2, 3],
  [7, 8, 9, 1, 2, 3, 4, 5, 6],
  [2, 3, 1, 5, 6, 4, 8, 9, 7],
  [5, 6, 4, 8, 9, 7, 2, 3, 1],
  [8, 9, 7, 2, 3, 1, 5, 6, 4],
  [3, 1, 2, 6, 4, 5, 9, 7, 8],
  [6, 4, 5, 9, 7, 8, 3, 1, 2],
  [9, 7, 8, 3, 1, 2, 6, 4, 5],
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function permuteDigits(grid: number[][]): number[][] {
  const perm = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const mapping: Record<number, number> = {};
  for (let i = 0; i < 9; i++) mapping[i + 1] = perm[i];
  return grid.map((row) => row.map((v) => mapping[v]));
}

function shuffleRowsInBands(grid: number[][]): number[][] {
  const result: number[][] = [];
  for (let band = 0; band < 3; band++) {
    const rows = [grid[band * 3], grid[band * 3 + 1], grid[band * 3 + 2]];
    const shuffled = shuffle(rows);
    for (const r of shuffled) result.push([...r]);
  }
  return result;
}

function shuffleColumnsInStacks(grid: number[][]): number[][] {
  const result = grid.map((row) => [...row]);
  for (let stack = 0; stack < 3; stack++) {
    const colIndices = shuffle([0, 1, 2]);
    for (let r = 0; r < 9; r++) {
      const original = [
        grid[r][stack * 3],
        grid[r][stack * 3 + 1],
        grid[r][stack * 3 + 2],
      ];
      for (let i = 0; i < 3; i++) {
        result[r][stack * 3 + i] = original[colIndices[i]];
      }
    }
  }
  return result;
}

function shuffleBands(grid: number[][]): number[][] {
  const bands = [
    [grid[0], grid[1], grid[2]],
    [grid[3], grid[4], grid[5]],
    [grid[6], grid[7], grid[8]],
  ];
  const shuffled = shuffle(bands);
  const result: number[][] = [];
  for (const band of shuffled) for (const row of band) result.push([...row]);
  return result;
}

function shuffleStacks(grid: number[][]): number[][] {
  const result = grid.map((row) => [...row]);
  const stackOrder = shuffle([0, 1, 2]);
  for (let r = 0; r < 9; r++) {
    const newRow: number[] = [];
    for (const s of stackOrder) {
      newRow.push(grid[r][s * 3], grid[r][s * 3 + 1], grid[r][s * 3 + 2]);
    }
    result[r] = newRow;
  }
  return result;
}

export function generateSolvedSudoku(): number[][] {
  let grid = BASE.map((row) => [...row]);
  grid = permuteDigits(grid);
  grid = shuffleRowsInBands(grid);
  grid = shuffleColumnsInStacks(grid);
  grid = shuffleBands(grid);
  grid = shuffleStacks(grid);
  return grid;
}

export type SudokuCell = number | null;

export function buildPuzzle(solved: number[][], givenCount: number): SudokuCell[][] {
  const puzzle: SudokuCell[][] = solved.map((row) => [...row]);
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) positions.push([r, c]);
  const shuffled = shuffle(positions);
  const toRemove = 81 - givenCount;
  for (let i = 0; i < toRemove; i++) {
    const [r, c] = shuffled[i];
    puzzle[r][c] = null;
  }
  return puzzle;
}
