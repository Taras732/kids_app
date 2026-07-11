import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt, numberDecoys } from '../shared/ui';

interface Payload {
  a: number;
  b: number;
}

const ROUNDS_PER_LEVEL = 5;

/** Множники масштабуються зі складністю: 2..5 / 2..9 / 2..10. */
function maxFactorFor(d: Difficulty): number {
  return d === 1 ? 5 : d === 2 ? 9 : 10;
}

function generate(difficulty: Difficulty): LevelData<Payload, number> {
  const max = maxFactorFor(difficulty);
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
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
  const spread = Math.max(4, b + 2);
  const options = numberDecoys(answer, 4, spread, 0).map((v) => ({ value: v }));

  return (
    <>
      <PromptCard question="Швидко! Скільки буде?" answerState={answerState}>
        <div
          style={{
            fontSize: 44,
            fontWeight: 900,
            fontFamily: 'var(--font-round)',
            color: 'var(--c-ink)',
            textAlign: 'center',
            margin: '8px auto',
          }}
        >
          {a} × {b} = ?
        </div>
      </PromptCard>
      <ChoiceGrid options={options} correct={answer} disabled={disabled} answerState={answerState} onPick={onAnswer} />
    </>
  );
}

const timesFlashcards: GameDefinition<Payload, number> = {
  id: 'times-flashcards',
  title: 'Картки множення',
  subject: 'math',
  levels: ['L3'],
  icon: '⚡',
  description: 'Швидкі картки множення.',
  accent: '#FFE4E6',
  generate,
  Component,
};

export default timesFlashcards;
