import { useMemo } from 'react';
import type { GameDefinition, GameComponentProps, GameExplain, Round } from '../types';
import { PromptCard, ChoiceGrid, numberDecoys } from '../shared/ui';
import { generate, type Payload } from './generate';

/**
 * EP1 — чому саме так. Показ правильної відповіді = KCR (d≈0.32); пояснення «чому»
 * → elaborated feedback (d≈0.49).
 *
 * Множення показуємо як ПОВТОРЮВАНЕ ДОДАВАННЯ — це і є його зміст, а не факт,
 * який треба зазубрити. Розпізнаємо конкретні помилки: додав замість помножити,
 * промахнувся на один множник (класика: 7×8=54 замість 56).
 */
export function explainMultiplication(round: Round<Payload, number>, answer: number): GameExplain | null {
  const { a, b } = round.payload;
  const correct = a * b;
  // менший множник — як кількість доданків: 8×3 читаємо як 8+8+8, а не 3 по 8
  const [times, value] = a <= b ? [a, b] : [b, a];
  const chain = times <= 6 ? `${Array(times).fill(value).join(' + ')} = ${correct}` : `${correct}`;

  const steps = [
    `${a} × ${b} — це ${times} рази по ${value}`,
    times <= 6 ? chain : `${value} узяти ${times} разів = ${correct}`,
  ];

  if (answer === a + b) {
    return { steps, why: `${a} + ${b} = ${a + b} — це додавання. А тут знак ×: треба взяти ${value} кілька разів` };
  }
  if (answer === correct - value || answer === correct + value) {
    const off = answer < correct ? 'на один раз менше' : 'на один раз більше';
    return { steps, why: `Схоже, ${value} узято ${off}, ніж треба` };
  }
  return { steps };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, number>) {
  const { a, b } = round.payload;
  const answer = round.answer;
  // numberDecoys() кличе Math.random() — рахуємо один раз на round.id, інакше варіанти
  // тасуються заново при кожному ре-рендері (напр. після невірної відповіді).
  const options = useMemo(() => {
    const spread = Math.max(4, answer > 50 ? 12 : 6);
    return numberDecoys(answer, 4, spread, 0).map((v) => ({ value: v }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round.id]);

  return (
    <>
      <PromptCard question="Скільки буде?" answerState={answerState}>
        <div style={{ fontSize: 44, fontWeight: 800, fontFamily: 'var(--font-round)', color: 'var(--c-ink)', textAlign: 'center', margin: '8px auto' }}>
          {a} × {b} = ?
        </div>
      </PromptCard>
      <ChoiceGrid options={options} correct={answer} disabled={disabled} answerState={answerState} onPick={onAnswer} />
    </>
  );
}

const timesTables: GameDefinition<Payload, number> = {
  id: 'times-tables',
  title: 'Таблиця множення',
  subject: 'math',
  levels: ['L3'],
  icon: '✖️',
  description: 'Таблиця множення на швидкість.',
  accent: '#FFEDD5',
  skillIds: {
    1: ['math.ops.l2.mult-table-2-5'],
    2: ['math.ops.l2.mult-table-2-5', 'math.ops.l2.mult-table-6-9'],
    3: ['math.ops.l2.mult-table-6-9'],
  },
  generate,
  explain: explainMultiplication,
  Component,
};

export default timesTables;
