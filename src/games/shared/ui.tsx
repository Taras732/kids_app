import { useEffect, useState, type ReactNode } from 'react';
import type { AnswerState } from '../types';

/** Картка-завдання (canon): питання зверху + візуальний вміст. */
export function PromptCard({
  question,
  answerState,
  children,
}: {
  question: string;
  answerState: AnswerState;
  children: ReactNode;
}) {
  return (
    <div className={`g-card${answerState === 'incorrect' ? ' shake' : ''}`} style={{ marginBottom: 18 }}>
      <div className="g-question">{question}</div>
      {children}
    </div>
  );
}

export interface Choice<T extends string | number = string | number> {
  value: T;
  /** Що показати на кнопці (за замовчуванням — value). */
  node?: ReactNode;
}

/**
 * Сітка варіантів відповіді. Сама підсвічує правильний/неправильний вибір
 * за answerState та correct. Скидає вибір, коли answerState повертається в idle.
 */
export function ChoiceGrid<T extends string | number>({
  options,
  correct,
  disabled,
  answerState,
  onPick,
  columns,
}: {
  options: Choice<T>[];
  correct: T;
  disabled: boolean;
  answerState: AnswerState;
  onPick: (value: T) => void;
  columns?: number;
}) {
  const [selected, setSelected] = useState<T | null>(null);

  useEffect(() => {
    if (answerState === 'idle') setSelected(null);
  }, [answerState]);

  const cols = columns ?? (options.length === 3 ? 3 : 2);

  return (
    <div className="g-choices" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {options.map((opt, i) => {
        let cls = 'g-choice';
        const isSel = selected === opt.value;
        if (isSel && answerState === 'correct') cls += ' correct';
        else if (isSel && answerState === 'incorrect') cls += ' wrong';
        // підсвітити правильний, якщо дитина обрала неправильний
        else if (answerState === 'incorrect' && opt.value === correct) cls += ' correct';
        return (
          <button
            key={i}
            className={cls}
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              setSelected(opt.value);
              onPick(opt.value);
            }}
          >
            {opt.node ?? opt.value}
          </button>
        );
      })}
    </div>
  );
}

// --- дрібні утиліти генерації, спільні для ігор ---
export function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Побудувати варіанти-обманки навколо правильної числової відповіді. */
export function numberDecoys(correct: number, count: number, spread: number, min = 0): number[] {
  const pool = new Set<number>([correct]);
  let guard = 0;
  while (pool.size < count && guard < 200) {
    const off = (Math.random() > 0.5 ? 1 : -1) * randInt(1, spread);
    const d = correct + off;
    if (d >= min && d !== correct) pool.add(d);
    guard++;
  }
  // добити послідовними, якщо не вистачило
  let f = Math.max(min, correct - spread);
  while (pool.size < count) {
    if (f !== correct && f >= min) pool.add(f);
    f++;
  }
  return shuffle(Array.from(pool));
}
