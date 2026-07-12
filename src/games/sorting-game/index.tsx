import { useEffect, useRef, useState } from 'react';
import type { GameDefinition, GameComponentProps, Difficulty, ProfileLevel, LevelData, Round } from '../types';
import { PromptCard, shuffle } from '../shared/ui';

/** Сентінел-відповідь раунду: саму перевірку виконує Component при завершенні ряду. */
const SORTED = 'sorted' as const;
type SortAnswer = typeof SORTED;

interface SortItem {
  id: string;
  label: string;
}

interface Payload {
  prompt: string;
  /** Елементи у перемішаному порядку — те, що бачить дитина. */
  items: SortItem[];
  /** ID елементів у ПРАВИЛЬНІЙ послідовності (перший → останній тап). */
  correctOrder: string[];
}

/**
 * Набори впорядковані ЗА СТАДІЄЮ РОСТУ/ЦИКЛУ (а не за "розміром" числа) —
 * саме так сортує оригінальна гра (main:src/games/sorting-game): паросток→квітка→плід,
 * яйце→гусінь→метелик, ранок→день→вечір→ніч тощо. Порт зберігає ту саму механіку
 * (тап-по-порядку) і той самий пул наборів, лише без i18n-шару (тут прямий укр. текст)
 * і з L0/L3 замість вікових груп grade1-4.
 */
interface SortableSet {
  key: string;
  prompt: string;
  items: string[];
}

const SETS: SortableSet[] = [
  { key: 'plant', prompt: 'Як росте рослина?', items: ['🌱', '🌿', '🌸', '🍎'] },
  { key: 'butterfly', prompt: 'Як росте метелик?', items: ['🥚', '🐛', '🦋'] },
  { key: 'chicken', prompt: 'Як росте курча?', items: ['🥚', '🐣', '🐤', '🐓'] },
  { key: 'age', prompt: 'Від малого до великого', items: ['👶', '🧒', '👩', '👵'] },
  { key: 'day', prompt: 'Як минає день?', items: ['🌅', '☀️', '🌆', '🌙'] },
  { key: 'seasons', prompt: 'Пори року за порядком', items: ['🌷', '☀️', '🍂', '❄️'] },
  { key: 'moon', prompt: 'Як росте місяць?', items: ['🌑', '🌒', '🌓', '🌔', '🌕'] },
  { key: 'numbers', prompt: 'Від меншого до більшого', items: ['1', '2', '3', '4', '5'] },
];

function itemCountFor(difficulty: Difficulty, level: ProfileLevel): number {
  if (level === 'L0') return difficulty === 3 ? 4 : 3;
  return difficulty === 3 ? 5 : 4;
}

/** Перемішана черга наборів з достатньою к-стю елементів (щоб не повторювались одразу). */
function buildQueue(minItems: number): SortableSet[] {
  const eligible = SETS.filter((s) => s.items.length >= minItems);
  return shuffle(eligible.length > 0 ? eligible : SETS);
}

function buildRound(index: number, count: number, queue: SortableSet[]): Round<Payload, SortAnswer> {
  const set = queue[index % queue.length];
  const correct = set.items.slice(0, Math.min(count, set.items.length));
  const correctOrder = correct.map((_, i) => `${set.key}-${i}`);
  const items = shuffle(correct.map((label, i) => ({ id: `${set.key}-${i}`, label })));
  return {
    id: `r${index}`,
    payload: { prompt: set.prompt, items, correctOrder },
    answer: SORTED,
  };
}

function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, SortAnswer> {
  const count = itemCountFor(difficulty, level);
  const queue = buildQueue(count);
  const rounds: Round<Payload, SortAnswer>[] = [];
  for (let i = 0; i < 5; i++) rounds.push(buildRound(i, count, queue));
  return { difficulty, rounds };
}

const WRONG_FEEDBACK_MS = 450;

function Component({ round, disabled, answerState, onAnswer, onMistake }: GameComponentProps<Payload, SortAnswer>) {
  const { prompt, items, correctOrder } = round.payload;
  const [taken, setTaken] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    setTaken([]);
    setWrongId(null);
    doneRef.current = false;
  }, [round.id]);

  function handleTap(id: string) {
    if (disabled || doneRef.current || wrongId !== null || taken.includes(id)) return;
    if (id === correctOrder[taken.length]) {
      const next = [...taken, id];
      setTaken(next);
      if (next.length === correctOrder.length) {
        doneRef.current = true;
        onAnswer(SORTED);
      }
    } else {
      onMistake();
      setWrongId(id);
      window.setTimeout(() => setWrongId(null), WRONG_FEEDBACK_MS);
    }
  }

  const itemSize = items.length <= 3 ? 52 : items.length === 4 ? 44 : 38;

  return (
    <PromptCard question={prompt} answerState={answerState}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 10,
          margin: '8px auto',
          maxWidth: 340,
        }}
      >
        {items.map((item) => {
          const orderIdx = taken.indexOf(item.id);
          const isTaken = orderIdx !== -1;
          const isWrong = wrongId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTap(item.id)}
              disabled={disabled || isTaken}
              style={{
                position: 'relative',
                minWidth: 64,
                minHeight: 76,
                padding: '10px 8px',
                border: `2px solid ${isWrong ? '#FF6B6B' : isTaken ? 'var(--c-green)' : 'var(--c-line)'}`,
                borderRadius: 'var(--c-r-sm)',
                background: isWrong ? '#FFE2E2' : 'var(--c-card)',
                fontFamily: 'var(--font-round)',
                cursor: disabled || isTaken ? 'default' : 'pointer',
                animation: isWrong ? 'shake 0.45s ease' : 'none',
                opacity: isTaken ? 0.65 : 1,
              }}
            >
              <span style={{ fontSize: itemSize, lineHeight: `${itemSize + 6}px` }}>{item.label}</span>
              {isTaken && (
                <span
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'var(--c-green)',
                    color: '#fff',
                    fontWeight: 800,
                    fontFamily: 'var(--font-round)',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {orderIdx + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </PromptCard>
  );
}

const sortingGame: GameDefinition<Payload, SortAnswer> = {
  id: 'sorting-game',
  title: 'Сортування',
  subject: 'logic',
  levels: ['L0', 'L3'],
  icon: '🗂️',
  description: 'Розстав по порядку.',
  accent: '#DCFCE7',
  generate,
  isCorrect: () => true,
  Component,
  // TODO(A2-логіка): skills після seed skill-graph логіки
};

export default sortingGame;
