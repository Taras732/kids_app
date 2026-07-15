import { useMemo } from 'react';
import type { GameDefinition, GameComponentProps } from '../types';
import { PromptCard, ChoiceGrid, numberDecoys } from '../shared/ui';
import { generate, type Payload } from './generate';

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, number>) {
  const { n, emoji } = round.payload;
  // numberDecoys() кличе Math.random() — рахуємо один раз на round.id, щоб варіанти
  // не тасувались заново при кожному ре-рендері (напр. після невірної відповіді).
  const options = useMemo(() => numberDecoys(n, 4, 3, 1).map((v) => ({ value: v })), [round.id]);
  return (
    <>
      <PromptCard question="Скільки тут?" answerState={answerState}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 8,
            margin: '8px auto',
            maxWidth: 280,
          }}
        >
          {Array.from({ length: n }).map((_, k) => (
            <span key={k} style={{ fontSize: 40 }}>
              {emoji}
            </span>
          ))}
        </div>
      </PromptCard>
      <ChoiceGrid options={options} correct={n} disabled={disabled} answerState={answerState} onPick={onAnswer} />
    </>
  );
}

const counting: GameDefinition<Payload, number> = {
  id: 'counting',
  title: 'Лічба',
  subject: 'math',
  levels: ['L0'],
  icon: '🔢',
  description: 'Рахуємо предмети від 1 до 10.',
  accent: '#E0F2FE',
  skillIds: {
    1: ['math.count.l0.forward-1-5'],
    2: ['math.count.l1.forward-back-1-10'],
    3: ['math.count.l1.forward-back-1-10'],
  },
  generate,
  Component,
};

export default counting;
