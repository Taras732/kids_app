import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt, numberDecoys } from '../shared/ui';

interface Payload {
  n: number;
  emoji: string;
}

const EMOJI = ['🍎', '🐤', '⭐', '🎈', '🌸', '🐞', '🍓', '🐢', '🚗', '🌻'];

function maxFor(d: Difficulty): number {
  return d === 1 ? 5 : d === 2 ? 8 : 10;
}

function generate(difficulty: Difficulty): LevelData<Payload, number> {
  const max = maxFor(difficulty);
  const used = new Set<number>();
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < 5; i++) {
    let n = randInt(1, max);
    let guard = 0;
    while (used.has(n) && guard < 20) {
      n = randInt(1, max);
      guard++;
    }
    used.add(n);
    rounds.push({
      id: `r${i}`,
      payload: { n, emoji: EMOJI[randInt(0, EMOJI.length - 1)] },
      answer: n,
    });
  }
  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, number>) {
  const { n, emoji } = round.payload;
  const options = numberDecoys(n, 4, 3, 1).map((v) => ({ value: v }));
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
  generate,
  Component,
};

export default counting;
