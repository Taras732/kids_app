// 3×3 magic square (Lo Shu) — every row/column/diagonal sums to 15.
// 8 symmetric variants via rotations + reflections.

export type MagicCell = number | null;

const LO_SHU: number[][] = [
  [2, 9, 4],
  [7, 5, 3],
  [6, 1, 8],
];

export const MAGIC_SUM = 15;

function rotateCW(grid: number[][]): number[][] {
  const n = grid.length;
  const result: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = grid[r][c];
    }
  }
  return result;
}

function flipHorizontal(grid: number[][]): number[][] {
  return grid.map((row) => row.slice().reverse());
}

export function generateMagicSquare(): number[][] {
  let grid = LO_SHU.map((row) => [...row]);
  const rotations = Math.floor(Math.random() * 4);
  for (let i = 0; i < rotations; i++) grid = rotateCW(grid);
  if (Math.random() < 0.5) grid = flipHorizontal(grid);
  return grid;
}

export function buildPuzzle(solved: number[][], emptyCount: number): MagicCell[][] {
  const puzzle: MagicCell[][] = solved.map((row) => [...row]);
  const positions: [number, number][] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) positions.push([r, c]);
  // shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  const toRemove = Math.max(0, Math.min(9, emptyCount));
  for (let i = 0; i < toRemove; i++) {
    const [r, c] = positions[i];
    puzzle[r][c] = null;
  }
  return puzzle;
}
