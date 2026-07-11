import { useEffect, useState } from 'react';
import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, randInt } from '../shared/ui';
import Keypad from './Keypad';

type Op = '+' | '−';

interface Payload {
  a: number;
  b: number;
  op: Op;
}

const ROUNDS_PER_LEVEL = 5;

interface Cfg {
  min: number;
  max: number;
  allowSub: boolean;
}

/** Дії стовпчиком у межах 100-1000; складність масштабує розрядність/діапазон. */
function paramsFor(d: Difficulty): Cfg {
  if (d === 1) return { min: 100, max: 300, allowSub: false };
  if (d === 2) return { min: 100, max: 600, allowSub: true };
  return { min: 300, max: 999, allowSub: true };
}

function genPair(op: Op, cfg: Cfg): { a: number; b: number } {
  const a = randInt(cfg.min, cfg.max);
  if (op === '+') {
    const bMax = Math.max(cfg.min, Math.min(cfg.max, 999 - a));
    const b = randInt(cfg.min, bMax);
    return { a, b };
  }
  // віднімання: b <= a, щоб результат був невід'ємний
  const b = randInt(cfg.min, a);
  return { a, b };
}

function generate(difficulty: Difficulty): LevelData<Payload, number> {
  const cfg = paramsFor(difficulty);
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    const op: Op = cfg.allowSub && Math.random() < 0.5 ? '−' : '+';
    const { a, b } = genPair(op, cfg);
    const answer = op === '+' ? a + b : a - b;
    rounds.push({ id: `r${i}`, payload: { a, b, op }, answer });
  }
  return { difficulty, rounds };
}

/** Один рядок стовпчика: опційний знак дії зліва + вирівняні праворуч розряди. */
function DigitRow({ text, digitCount, prefix = ' ' }: { text: string; digitCount: number; prefix?: string }) {
  const padded = text.padStart(digitCount, ' ');
  const cells = [prefix, ...padded.split('')];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
      {cells.map((ch, i) => (
        <span
          key={i}
          style={{
            width: 28,
            textAlign: 'center',
            fontSize: 28,
            fontWeight: 900,
            fontFamily: 'var(--font-round)',
            color: 'var(--c-ink)',
          }}
        >
          {ch === ' ' ? '' : ch}
        </span>
      ))}
    </div>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, number>) {
  const { a, b, op } = round.payload;
  const [entered, setEntered] = useState('');

  useEffect(() => {
    if (answerState === 'idle') setEntered('');
  }, [answerState]);

  const digitCount = Math.max(String(a).length, String(b).length, String(round.answer).length);

  const handleDigit = (d: string) => {
    if (disabled) return;
    setEntered((prev) => (prev.length >= digitCount ? prev : prev + d));
  };

  const handleBackspace = () => {
    if (disabled) return;
    setEntered((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (disabled || entered === '') return;
    onAnswer(Number(entered));
  };

  const feedbackColor = answerState === 'correct' ? 'var(--c-green)' : '#C0392B';

  return (
    <>
      <PromptCard question="Порахуй стовпчиком" answerState={answerState}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, margin: '8px auto' }}>
          <DigitRow text={String(a)} digitCount={digitCount} />
          <DigitRow text={String(b)} digitCount={digitCount} prefix={op} />
          <div style={{ width: (digitCount + 1) * 32, height: 3, background: 'var(--c-ink)', margin: '2px 0' }} />
          <DigitRow text={entered} digitCount={digitCount} />
        </div>
      </PromptCard>

      <div
        style={{
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 700,
          minHeight: 20,
          margin: '2px 0 12px',
          color: feedbackColor,
        }}
      >
        {answerState === 'incorrect' ? `Правильно: ${round.answer}` : ' '}
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

const columnArithmetic: GameDefinition<Payload, number> = {
  id: 'column-arithmetic',
  title: 'Стовпчик',
  subject: 'math',
  levels: ['L3'],
  icon: '🧮',
  description: 'Додавання та віднімання стовпчиком.',
  accent: '#E0F2FE',
  generate,
  Component,
};

export default columnArithmetic;
