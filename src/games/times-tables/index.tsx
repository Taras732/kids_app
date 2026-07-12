import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt, numberDecoys } from '../shared/ui';

interface Payload {
  a: number;
  b: number;
}

function maxFactorFor(d: Difficulty): number {
  return d === 1 ? 5 : d === 2 ? 9 : 10;
}

function generate(difficulty: Difficulty): LevelData<Payload, number> {
  const max = maxFactorFor(difficulty);
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < 5; i++) {
    const a = randInt(2, max);
    const b = randInt(2, max);
    rounds.push({
      id: `r${i}`,
      payload: { a, b },
      answer: a * b,
    });
  }
  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, number>) {
  const { a, b } = round.payload;
  const answer = round.answer;
  const spread = Math.max(4, answer > 50 ? 12 : 6);
  const options = numberDecoys(answer, 4, spread, 0).map((v) => ({ value: v }));

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
