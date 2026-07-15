import { useEffect, useState } from 'react';
import type { GameDefinition, GameComponentProps } from '../types';
import { PromptCard } from '../shared/ui';
import Keypad from './Keypad';
import { generate, type Payload } from './generate';

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

  // Підказка «Правильно: X» показується лише при помилці. Це допомога, а не докір,
  // тому зелена — як .reveal у ChoiceGrid. Червоним лишається тільки ввід дитини.
  const revealColor = '#15803D';

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
          color: revealColor,
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
  skillIds: {
    1: ['math.ops.l3.add-sub-1000'],
    2: ['math.ops.l3.add-sub-1000'],
    3: ['math.ops.l3.add-sub-1000'],
  },
  generate,
  Component,
};

export default columnArithmetic;
