import type { GameDefinition, GameComponentProps } from '../types';
import { PromptCard, ChoiceGrid } from '../shared/ui';
import { generate, type Payload } from './generate';

function Bunch({ n, emoji }: { n: number; emoji: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        justifyContent: 'center',
        maxWidth: 120,
        padding: 12,
        border: '1.5px solid var(--c-line)',
        borderRadius: 16,
        background: '#F6F7FB',
      }}
    >
      {Array.from({ length: n }).map((_, k) => (
        <span key={k} style={{ fontSize: 24 }}>
          {emoji}
        </span>
      ))}
    </div>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, number>) {
  const { l, r, emoji } = round.payload;
  const correct = Math.max(l, r);
  // Варіанти = дві кількості (обери більше число).
  const options = (l < r ? [l, r] : [r, l]).map((v) => ({ value: v }));
  return (
    <>
      <PromptCard question="Де більше? Обери більше число" answerState={answerState}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', margin: '4px 0' }}>
          <Bunch n={l} emoji={emoji} />
          <Bunch n={r} emoji={emoji} />
        </div>
      </PromptCard>
      <ChoiceGrid options={options} correct={correct} disabled={disabled} answerState={answerState} onPick={onAnswer} columns={2} />
    </>
  );
}

const compare: GameDefinition<Payload, number> = {
  id: 'compare',
  title: 'Більше-менше',
  subject: 'math',
  levels: ['L0'],
  icon: '⚖️',
  description: 'Де більше предметів? Порівнюємо кількість.',
  accent: '#FFEDD5',
  skillIds: {
    1: ['math.count.l0.compare-qty'],
    2: ['math.count.l1.compare-numbers-20'],
    3: ['math.count.l1.compare-numbers-20'],
  },
  generate,
  Component,
};

export default compare;
