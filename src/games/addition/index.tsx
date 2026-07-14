import type { GameDefinition, GameComponentProps } from '../types';
import { PromptCard, ChoiceGrid, numberDecoys } from '../shared/ui';
import { generate, type Payload } from './generate';

function group(n: number, e: string) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 110, justifyContent: 'center' }}>
      {Array.from({ length: n }).map((_, k) => (
        <span key={k} style={{ fontSize: 30 }}>
          {e}
        </span>
      ))}
    </div>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, number>) {
  const { a, b } = round.payload;
  const sum = a + b;
  const options = numberDecoys(sum, 4, 3, 1).map((v) => ({ value: v }));
  return (
    <>
      <PromptCard question="Скільки разом?" answerState={answerState}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap', margin: '4px 0' }}>
          {group(a, '🔵')}
          <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--c-primary)' }}>+</span>
          {group(b, '🟡')}
        </div>
      </PromptCard>
      <ChoiceGrid options={options} correct={sum} disabled={disabled} answerState={answerState} onPick={onAnswer} />
    </>
  );
}

const addition: GameDefinition<Payload, number> = {
  id: 'addition',
  title: 'Додавання',
  subject: 'math',
  levels: ['L0'],
  icon: '➕',
  description: 'Скільки разом? Додаємо маленькі числа.',
  accent: '#DCFCE7',
  skillIds: {
    1: ['math.count.l1.compose-10'],
    2: ['math.ops.l1.add-sub-objects-10'],
    3: ['math.ops.l1.add-sub-objects-10'],
  },
  generate,
  Component,
};

export default addition;
