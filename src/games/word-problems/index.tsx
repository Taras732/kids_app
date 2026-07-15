import { useEffect, useState } from 'react';
import type { GameDefinition, GameComponentProps } from '../types';
import { PromptCard } from '../shared/ui';
import Keypad from './Keypad';
import { generate, selfCheck, type WordProblemPayload, type HintStep } from './generate';

const MAX_INPUT_LEN = 4;
const MAX_HINT_ICONS = 10;

/** CPA-схема: смужки емодзі-об'єктів між знаками дії, що ілюструють задачу. */
function HintSchema({ hint }: { hint: HintStep[] }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 8,
        margin: '4px 0 10px',
      }}
    >
      {hint.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && (
            <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--c-primary)' }}>
              {step.op === '-' ? '−' : '+'}
            </span>
          )}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              maxWidth: 128,
              border: '1.5px solid var(--c-line)',
              borderRadius: 'var(--c-r-sm)',
              padding: '6px 8px',
              background: 'var(--c-primary-soft)',
            }}
          >
            {Array.from({ length: Math.min(step.count, MAX_HINT_ICONS) }).map((_, k) => (
              <span key={k} style={{ fontSize: 15 }}>
                {step.emoji}
              </span>
            ))}
            {step.count > MAX_HINT_ICONS && (
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-mut)', alignSelf: 'center' }}>
                +{step.count - MAX_HINT_ICONS}
              </span>
            )}
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--c-mut)' }}>{step.count}</span>
        </div>
      ))}
      <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--c-mut)' }}>= ?</span>
    </div>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<WordProblemPayload, number>) {
  const { text, emoji, hint } = round.payload;
  const [entered, setEntered] = useState('');
  const [showHint, setShowHint] = useState(false);

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

  // Підказка «Правильно: X» показується лише при помилці. Це допомога, а не докір,
  // тому зелена — як .reveal у ChoiceGrid. Червоним лишається тільки ввід дитини.
  const revealColor = '#15803D';

  return (
    <>
      <PromptCard question="Розв'яжи задачу" answerState={answerState}>
        <div style={{ fontSize: 38, textAlign: 'center', marginBottom: 6 }}>{emoji}</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-ink)', textAlign: 'center', lineHeight: 1.4 }}>
          {text}
        </div>
      </PromptCard>

      {hint && (
        <div style={{ textAlign: 'center' }}>
          {showHint ? (
            <HintSchema hint={hint} />
          ) : (
            <button
              type="button"
              className="g-btn soft"
              style={{ width: 'auto', padding: '8px 18px', fontSize: 13, marginBottom: 10 }}
              onClick={() => setShowHint(true)}
            >
              💡 Підказка
            </button>
          )}
        </div>
      )}

      <div
        style={{
          textAlign: 'center',
          fontSize: 36,
          fontWeight: 900,
          minHeight: 46,
          margin: '4px 0 14px',
          color: displayColor,
          fontFamily: 'var(--font-round)',
        }}
      >
        {entered || '—'}
      </div>

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
        {answerState === 'incorrect' ? `Правильно: ${round.answer}` : ' '}
      </div>

      <Keypad value={entered} disabled={disabled} onDigit={handleDigit} onBackspace={handleBackspace} onSubmit={handleSubmit} />
    </>
  );
}

// Перевірка генератора (dev-only): усі відповіді — натуральні числа, підказки узгоджені з відповіддю.
if (import.meta.env.DEV) {
  selfCheck();
}

const wordProblems: GameDefinition<WordProblemPayload, number> = {
  id: 'word-problems',
  title: 'Текстові задачі',
  subject: 'math',
  levels: ['L3'],
  icon: '📚',
  description: "Прочитай історію і розв'яжи задачу.",
  accent: '#FFE1EC',
  // skillIds по складності: легша → простіші текстові задачі (нижчий grade_band).
  skillIds: {
    1: ['math.ops.l1.word-problems-simple'],
    2: ['math.ops.l2.word-problems-100'],
    3: ['math.ops.l3.word-problems-1000'],
  },
  generate,
  Component,
};

export default wordProblems;
