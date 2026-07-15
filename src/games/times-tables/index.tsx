import { useMemo } from 'react';
import type { GameDefinition, GameComponentProps } from '../types';
import { PromptCard, ChoiceGrid, numberDecoys } from '../shared/ui';
import { generate, type Payload } from './generate';

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
  Component,
};

export default timesTables;
