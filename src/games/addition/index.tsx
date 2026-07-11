import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt, numberDecoys } from '../shared/ui';

interface Payload {
  a: number;
  b: number;
}

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

function limitsFor(d: Difficulty): { maxA: number; maxB: number; maxSum: number } {
  if (d === 1) return { maxA: 3, maxB: 3, maxSum: 6 };
  if (d === 2) return { maxA: 5, maxB: 4, maxSum: 10 };
  return { maxA: 6, maxB: 5, maxSum: 10 };
}

function generate(difficulty: Difficulty): LevelData<Payload, number> {
  const { maxA, maxB, maxSum } = limitsFor(difficulty);
  const used = new Set<string>();
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < 5; i++) {
    let a = 1;
    let b = 1;
    let guard = 0;
    do {
      a = randInt(1, maxA);
      b = randInt(1, maxB);
      guard++;
    } while ((a + b > maxSum || used.has(`${a}+${b}`)) && guard < 40);
    used.add(`${a}+${b}`);
    rounds.push({ id: `r${i}`, payload: { a, b }, answer: a + b });
  }
  return { difficulty, rounds };
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
  generate,
  Component,
};

export default addition;
