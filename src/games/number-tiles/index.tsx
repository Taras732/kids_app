import { useEffect, useMemo, useRef, useState } from 'react';
import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { BOARD_DONE } from '../types';
import { type Cell, type BoardGrid, generateBoard, isValidPair, canConnect, fuzzCheck } from './generate';

interface Payload {
  rows: number;
  cols: number;
  grid: BoardGrid;
  hints: boolean;
}

type Answer = typeof BOARD_DONE;

function generate(difficulty: Difficulty): LevelData<Payload, Answer> {
  const { config, grid } = generateBoard(difficulty);
  const round: Round<Payload, Answer> = {
    id: `board-${difficulty}`,
    payload: { rows: config.rows, cols: config.cols, grid, hints: config.hints },
    answer: BOARD_DONE,
  };
  return { difficulty, rounds: [round] };
}

const MISTAKE_DELAY_MS = 550;

function Component({ round, disabled, onAnswer, onMistake }: GameComponentProps<Payload, Answer>) {
  const { rows, cols, hints } = round.payload;
  const [grid, setGrid] = useState<BoardGrid>(() => round.payload.grid.map((row) => [...row]));
  const [selected, setSelected] = useState<Cell | null>(null);
  const [wrongPair, setWrongPair] = useState<[Cell, Cell] | null>(null);
  const [busy, setBusy] = useState(false);
  const doneRef = useRef(false);

  const total = useMemo(
    () => round.payload.grid.reduce((n, row) => n + row.filter((v) => v !== null).length, 0),
    [round.payload.grid],
  );
  const remaining = useMemo(() => grid.reduce((n, row) => n + row.filter((v) => v !== null).length, 0), [grid]);

  // Поле чисте — гру пройдено.
  useEffect(() => {
    if (doneRef.current || remaining > 0) return;
    doneRef.current = true;
    onAnswer(BOARD_DONE);
  }, [remaining, onAnswer]);

  // Підказка (лише Easy): плитки, що склали б валідну пару з обраною зараз.
  const hintCells = useMemo(() => {
    const set = new Set<string>();
    if (!hints || !selected) return set;
    const v1 = grid[selected[0]][selected[1]];
    if (v1 === null) return set;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === selected[0] && c === selected[1]) continue;
        const v2 = grid[r][c];
        if (v2 === null) continue;
        if (isValidPair(v1, v2) && canConnect(grid, selected, [r, c])) set.add(`${r},${c}`);
      }
    }
    return set;
  }, [grid, selected, hints, rows, cols]);

  function handleClick(r: number, c: number) {
    if (disabled || busy || grid[r][c] === null) return;

    if (!selected) {
      setSelected([r, c]);
      return;
    }
    const [sr, sc] = selected;
    if (sr === r && sc === c) {
      setSelected(null);
      return;
    }

    const v1 = grid[sr][sc];
    const v2 = grid[r][c];
    if (v1 !== null && v2 !== null && isValidPair(v1, v2) && canConnect(grid, selected, [r, c])) {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[sr][sc] = null;
        next[r][c] = null;
        return next;
      });
      setSelected(null);
      return;
    }

    onMistake();
    setWrongPair([selected, [r, c]]);
    setBusy(true);
    window.setTimeout(() => {
      setWrongPair(null);
      setSelected(null);
      setBusy(false);
    }, MISTAKE_DELAY_MS);
  }

  const cellPx = cols <= 4 ? 66 : cols === 5 ? 56 : 46;
  const fontPx = cols <= 4 ? 24 : cols === 5 ? 21 : 18;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-round)', fontWeight: 800, color: 'var(--c-mut)' }}>
        Залишилось плиток: {remaining} / {total}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellPx}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellPx}px)`,
          gap: 6,
          animation: wrongPair ? 'shake 0.45s' : 'none',
        }}
      >
        {grid.map((row, r) =>
          row.map((v, c) => {
            const isEmpty = v === null;
            const isSelected = selected?.[0] === r && selected?.[1] === c;
            const isHint = hintCells.has(`${r},${c}`);
            const isWrong = !!wrongPair && wrongPair.some(([wr, wc]) => wr === r && wc === c);
            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => handleClick(r, c)}
                disabled={disabled || isEmpty}
                aria-label={isEmpty ? 'порожня клітинка' : `плитка ${v}`}
                style={{
                  width: cellPx,
                  height: cellPx,
                  padding: 0,
                  border: `2px solid ${
                    isWrong ? '#E74C3C' : isSelected ? 'var(--c-primary)' : isHint ? '#F2B705' : 'var(--c-line)'
                  }`,
                  borderRadius: 'var(--c-r-sm)',
                  background: isWrong ? '#FFE2E2' : isSelected ? 'var(--c-primary-soft)' : 'var(--c-card)',
                  color: isWrong ? '#C0392B' : 'var(--c-ink)',
                  fontFamily: 'var(--font-round)',
                  fontWeight: 800,
                  fontSize: fontPx,
                  boxShadow: isEmpty ? 'none' : 'var(--c-shadow)',
                  cursor: disabled || isEmpty ? 'default' : 'pointer',
                  transform: isEmpty ? 'scale(0)' : 'scale(1)',
                  opacity: isEmpty ? 0 : 1,
                  transition: 'transform .25s ease, opacity .25s ease, background .15s ease, border-color .15s ease',
                }}
              >
                {isEmpty ? '' : v}
              </button>
            );
          }),
        )}
      </div>

      {hints && (
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-mut)' }}>
          💡 Золота рамка — плитка, що складе пару з обраною
        </div>
      )}
    </div>
  );
}

// Перевірка, що генерація полів гарантовано розв'язна (виконується раз при завантаженні в dev).
if (import.meta.env.DEV) {
  fuzzCheck();
}

const numberTiles: GameDefinition<Payload, Answer> = {
  id: 'number-tiles',
  title: 'Числові плитки',
  subject: 'math',
  levels: ['L3'],
  icon: '🔟',
  description: 'Прибирай пари: однакові числа або сума 10.',
  accent: '#FFF4D6',
  generate,
  Component,
};

export default numberTiles;
