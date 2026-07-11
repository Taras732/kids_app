import { useEffect, useState } from 'react';
import type {
  GameDefinition,
  GameComponentProps,
  Difficulty,
  LevelData,
  Round,
  ProfileLevel,
} from '../types';
import { PromptCard, randInt, shuffle } from '../shared/ui';
import Keypad from './Keypad';

type Op = '+' | '−' | '×' | '÷';

interface Payload {
  a: number;
  b: number;
  op: Op;
  correct: number;
}

const ROUNDS_PER_LEVEL = 5;
const MAX_INPUT_LEN = 4;

// --- генерація пар операндів для кожної дії ---

/** Додавання в межах max, обидва операнди >= 1 (без тривіальних "0 + x"). */
function genAddition(max: number): { a: number; b: number } {
  const a = randInt(1, max - 1);
  const b = randInt(1, max - a);
  return { a, b };
}

/** Віднімання в межах max, результат завжди >= 1 (без "x - 0" / "x - x"). */
function genSubtraction(max: number): { a: number; b: number } {
  const a = randInt(2, max);
  const b = randInt(1, a - 1);
  return { a, b };
}

/** Таблиця множення 1..10 × 1..10. */
function genMultiplication(): { a: number; b: number } {
  const a = randInt(1, 10);
  const b = randInt(1, 10);
  return { a, b };
}

/** Ділення націло: дільник 2..10, частка 1..10. */
function genDivision(): { a: number; b: number } {
  const divisor = randInt(2, 10);
  const quotient = randInt(1, 10);
  return { a: divisor * quotient, b: divisor };
}

function opsPoolFor(level: ProfileLevel, difficulty: Difficulty): Op[] {
  if (level === 'L0') {
    return difficulty === 1 ? ['+'] : ['+', '−'];
  }
  // L3
  if (difficulty === 1) return ['×', '+', '−'];
  if (difficulty === 2) return ['×', '÷', '+', '−'];
  return ['+', '−', '×'];
}

/** Побудувати послідовність операцій на раунд, уникаючи "усі однакові", коли варіантів > 1. */
function buildOpSequence(pool: Op[]): Op[] {
  if (pool.length === 1) return Array(ROUNDS_PER_LEVEL).fill(pool[0]);
  const seq: Op[] = Array.from({ length: ROUNDS_PER_LEVEL }, () => pool[randInt(0, pool.length - 1)]);
  if (new Set(seq).size === 1) {
    const alt = pool.find((o) => o !== seq[0])!;
    seq[randInt(0, seq.length - 1)] = alt;
  }
  return shuffle(seq);
}

function genPair(op: Op, level: ProfileLevel): { a: number; b: number; correct: number } {
  if (op === '×') {
    const { a, b } = genMultiplication();
    return { a, b, correct: a * b };
  }
  if (op === '÷') {
    const { a, b } = genDivision();
    return { a, b, correct: a / b };
  }
  const max = level === 'L0' ? 10 : 100;
  if (op === '+') {
    const { a, b } = genAddition(max);
    return { a, b, correct: a + b };
  }
  const { a, b } = genSubtraction(max);
  return { a, b, correct: a - b };
}

function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, number> {
  const pool = opsPoolFor(level, difficulty);
  const ops = buildOpSequence(pool);
  const rounds: Round<Payload, number>[] = ops.map((op, i) => {
    const { a, b, correct } = genPair(op, level);
    return { id: `r${i}`, payload: { a, b, op, correct }, answer: correct };
  });
  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, number>) {
  const { a, b, op } = round.payload;
  const [entered, setEntered] = useState('');

  // Скидаємо ввід, коли фідбек повертається в idle (новий раунд або повтор після помилки).
  useEffect(() => {
    if (answerState === 'idle') setEntered('');
  }, [answerState]);

  const handleDigit = (digit: string) => {
    if (disabled) return;
    setEntered((prev) => (prev.length >= MAX_INPUT_LEN ? prev : prev + digit));
  };

  const handleBackspace = () => {
    if (disabled) return;
    setEntered((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (disabled || entered === '') return;
    onAnswer(Number(entered));
  };

  const displayColor =
    answerState === 'correct'
      ? 'var(--c-green)'
      : answerState === 'incorrect'
        ? '#C0392B'
        : entered
          ? 'var(--c-primary)'
          : 'var(--c-mut)';

  return (
    <>
      <PromptCard question="Розв'яжи приклад" answerState={answerState}>
        <div style={{ fontSize: 44, fontWeight: 900, color: 'var(--c-ink)', fontFamily: 'var(--font-round)' }}>
          {a} {op} {b} = ?
        </div>
      </PromptCard>

      <div
        style={{
          textAlign: 'center',
          fontSize: 40,
          fontWeight: 900,
          minHeight: 52,
          margin: '4px 0 18px',
          color: displayColor,
          fontFamily: 'var(--font-round)',
        }}
      >
        {entered || '—'}
      </div>

      <Keypad
        value={entered}
        disabled={disabled}
        onDigit={handleDigit}
        onBackspace={handleBackspace}
        onSubmit={handleSubmit}
      />
    </>
  );
}

const mathExamples: GameDefinition<Payload, number> = {
  id: 'math-examples',
  title: 'Приклади',
  subject: 'math',
  levels: ['L0', 'L3'],
  icon: '➕',
  description: "Розв'яжи приклад — введи відповідь.",
  accent: '#EEEBFF',
  generate,
  Component,
};

export default mathExamples;
