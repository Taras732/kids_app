import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round, ProfileLevel } from '../types';
import { PromptCard, ChoiceGrid, shuffle } from '../shared/ui';
import { Flag } from './flags';

interface Payload {
  code: string;
  options: string[];
}

interface Country {
  code: string;
  name: string;
  /** 1 = найвідоміші, 3 = менш відомі. */
  tier: 1 | 2 | 3;
}

const COUNTRIES: Country[] = [
  { code: 'UA', name: 'Україна', tier: 1 },
  { code: 'PL', name: 'Польща', tier: 1 },
  { code: 'DE', name: 'Німеччина', tier: 1 },
  { code: 'FR', name: 'Франція', tier: 1 },
  { code: 'IT', name: 'Італія', tier: 1 },
  { code: 'GB', name: 'Британія', tier: 1 },
  { code: 'ES', name: 'Іспанія', tier: 2 },
  { code: 'US', name: 'США', tier: 2 },
  { code: 'JP', name: 'Японія', tier: 2 },
  { code: 'CA', name: 'Канада', tier: 3 },
  { code: 'BR', name: 'Бразилія', tier: 3 },
  { code: 'SE', name: 'Швеція', tier: 3 },
];

function configFor(difficulty: Difficulty, level: ProfileLevel): { maxTier: 1 | 2 | 3; optionsCount: number } {
  const maxTier = level === 'L0' ? (Math.min(difficulty, 2) as 1 | 2) : difficulty;
  const optionsCount = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 5;
  return { maxTier, optionsCount };
}

function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, string> {
  const { maxTier, optionsCount } = configFor(difficulty, level);
  const pool = COUNTRIES.filter((c) => c.tier <= maxTier);
  const targets = shuffle(pool).slice(0, 5);
  const rounds: Round<Payload, string>[] = targets.map((target, i) => {
    const distractors = shuffle(pool.filter((c) => c.name !== target.name))
      .slice(0, optionsCount - 1)
      .map((c) => c.name);
    const options = shuffle([target.name, ...distractors]);
    return { id: `r${i}`, payload: { code: target.code, options }, answer: target.name };
  });
  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { code, options } = round.payload;
  const choices = options.map((name) => ({ value: name }));
  return (
    <>
      <PromptCard question="Прапор якої країни?" answerState={answerState}>
        <div style={{ width: 168, height: 112, margin: '8px auto', filter: 'drop-shadow(0 4px 10px rgba(31,33,56,.12))' }}>
          <Flag code={code} />
        </div>
      </PromptCard>
      <ChoiceGrid
        options={choices}
        correct={round.answer}
        disabled={disabled}
        answerState={answerState}
        onPick={onAnswer}
      />
    </>
  );
}

const worldFlags: GameDefinition<Payload, string> = {
  id: 'world-flags',
  title: 'Прапори світу',
  subject: 'world',
  levels: ['L0', 'L3'],
  icon: '🏳️',
  description: 'Прапор якої країни?',
  accent: '#DBEAFE',
  generate,
  Component,
};

export default worldFlags;
