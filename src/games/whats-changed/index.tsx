import { useEffect, useState } from 'react';
import type { GameDefinition, GameComponentProps, Difficulty, ProfileLevel, LevelData, Round } from '../types';
import { shuffle } from '../shared/ui';

interface Cell {
  id: string;
  emoji: string;
}

interface Payload {
  initial: Cell[];
  changed: Cell[];
}

const EMOJI_POOL = [
  '🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🍉', '🥝',
  '🐶', '🐱', '🐰', '🦊', '🐼', '🐨', '🐸', '🐵',
  '🚗', '🚌', '🚀', '✈️', '⭐', '🌸', '🌈', '🎈',
];

const MEMORIZE_MS = 2500;
const DOT_TICK_MS = 400;
const ROUNDS_PER_LEVEL = 5;

/** Розмір сітки (к-сть клітинок) за рівнем профілю і складністю. */
function gridSizeFor(level: ProfileLevel, difficulty: Difficulty): number {
  if (level === 'L0') {
    return difficulty === 1 ? 4 : 6; // diff1=4, diff2=6, diff3=6
  }
  return difficulty === 1 ? 6 : difficulty === 2 ? 9 : 12; // diff1=6, diff2=9, diff3=12
}

function columnsFor(size: number): number {
  if (size <= 4) return 2;
  if (size <= 9) return 3;
  return 4;
}

/** Один раунд: сітка з size емодзі, одна клітинка замінена в "changed". */
function buildRound(index: number, size: number): Round<Payload, string> {
  const picked = shuffle(EMOJI_POOL).slice(0, size);
  const initial: Cell[] = picked.map((emoji, i) => ({ id: `c${i}`, emoji }));
  const changedIndex = Math.floor(Math.random() * size);

  const used = new Set(picked);
  const replacementPool = EMOJI_POOL.filter((e) => !used.has(e));
  const replacement = replacementPool[Math.floor(Math.random() * replacementPool.length)];

  const changed: Cell[] = initial.map((cell, i) =>
    i === changedIndex ? { ...cell, emoji: replacement } : cell,
  );

  return {
    id: `r${index}`,
    payload: { initial, changed },
    answer: initial[changedIndex].id,
  };
}

function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, string> {
  const size = gridSizeFor(level, difficulty);
  const rounds: Round<Payload, string>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) rounds.push(buildRound(i, size));
  return { difficulty, rounds };
}

type Phase = 'memorize' | 'answer';

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { initial, changed } = round.payload;
  const [phase, setPhase] = useState<Phase>('memorize');
  const [activeDot, setActiveDot] = useState(0);

  // Показати початкову сітку MEMORIZE_MS, тоді перейти до фази відповіді.
  // Фаза скидається на 'memorize' автоматично: round.id змінюється -> GameShell
  // перемонтовує Component через key={round.id} -> useState ініціалізується заново.
  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('answer'), MEMORIZE_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Крапки-таймер під час запам'ятовування.
  useEffect(() => {
    if (phase !== 'memorize') return;
    const interval = window.setInterval(() => setActiveDot((d) => (d + 1) % 3), DOT_TICK_MS);
    return () => window.clearInterval(interval);
  }, [phase]);

  const isAnswerPhase = phase === 'answer';
  const cells = isAnswerPhase ? changed : initial;
  const cols = columnsFor(cells.length);

  return (
    <div className={`g-card${answerState === 'incorrect' ? ' shake' : ''}`}>
      <div
        style={{
          fontFamily: 'var(--font-round)',
          fontWeight: 800,
          fontSize: 16,
          color: isAnswerPhase ? 'var(--c-ink)' : 'var(--c-primary)',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <span>{isAnswerPhase ? 'Що змінилось? Тапни клітинку' : "Запам'ятай!"}</span>
        {!isAnswerPhase && (
          <span style={{ display: 'inline-flex', gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--c-primary)',
                  opacity: i === activeDot ? 1 : 0.25,
                  transition: 'opacity .2s',
                }}
              />
            ))}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 8,
          margin: '0 auto',
          maxWidth: 320,
        }}
      >
        {cells.map((cell) => {
          // На фідбеку (правильно/неправильно) підсвічуємо клітинку зі зміною зеленим;
          // решта лишаються нейтральними (без сентінела "яку саме клітинку клікнула дитина").
          const cls = isAnswerPhase && answerState !== 'idle' && cell.id === round.answer
            ? 'g-choice correct'
            : 'g-choice';
          return (
            <button
              key={cell.id}
              type="button"
              className={cls}
              disabled={disabled || !isAnswerPhase}
              onClick={() => isAnswerPhase && onAnswer(cell.id)}
              style={{ aspectRatio: '1', fontSize: 32, padding: 4 }}
            >
              {cell.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const whatsChanged: GameDefinition<Payload, string> = {
  id: 'whats-changed',
  title: 'Що змінилось',
  subject: 'memory',
  levels: ['L0', 'L3'],
  icon: '🔎',
  description: "Запам'ятай і знайди, що змінилось.",
  accent: '#FCE7F3',
  generate,
  Component,
  // TODO(A2-память): skills після seed skill-graph пам'яті
};

export default whatsChanged;
