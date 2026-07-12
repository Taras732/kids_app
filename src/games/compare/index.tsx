import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt } from '../shared/ui';

interface Payload {
  l: number;
  r: number;
  emoji: string;
}

const EMOJI = ['🍎', '⭐', '🎈', '🐤', '🍓'];

function maxFor(d: Difficulty): number {
  return d === 1 ? 6 : d === 2 ? 9 : 12;
}

function generate(difficulty: Difficulty): LevelData<Payload, number> {
  const max = maxFor(difficulty);
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < 5; i++) {
    let l = randInt(1, max);
    let r = randInt(1, max);
    let guard = 0;
    while (l === r && guard < 20) {
      r = randInt(1, max);
      guard++;
    }
    rounds.push({
      id: `r${i}`,
      payload: { l, r, emoji: EMOJI[randInt(0, EMOJI.length - 1)] },
      answer: Math.max(l, r),
    });
  }
  return { difficulty, rounds };
}

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
