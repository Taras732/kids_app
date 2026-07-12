import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, shuffle } from '../shared/ui';

type HabitatId = 'savanna' | 'water' | 'forest' | 'arctic' | 'desert' | 'jungle';

interface Payload {
  emoji: string;
  habitat: HabitatId;
}

const HABITAT_LABEL: Record<HabitatId, string> = {
  savanna: 'Савана',
  water: 'Вода',
  forest: 'Ліс',
  arctic: 'Арктика',
  desert: 'Пустеля',
  jungle: 'Джунглі',
};

/** Порядок для ChoiceGrid — усі 6 середовищ завжди присутні як варіанти. */
const HABITAT_ORDER: HabitatId[] = ['savanna', 'water', 'forest', 'arctic', 'desert', 'jungle'];

interface AnimalEntry {
  emoji: string;
  habitat: HabitatId;
  basic: boolean;
}

const ANIMALS: AnimalEntry[] = [
  { emoji: '🦁', habitat: 'savanna', basic: true },
  { emoji: '🦒', habitat: 'savanna', basic: false },
  { emoji: '🐘', habitat: 'savanna', basic: false },

  { emoji: '🐟', habitat: 'water', basic: true },
  { emoji: '🐬', habitat: 'water', basic: false },
  { emoji: '🦀', habitat: 'water', basic: false },

  { emoji: '🐻', habitat: 'forest', basic: true },
  { emoji: '🦊', habitat: 'forest', basic: false },
  { emoji: '🦉', habitat: 'forest', basic: false },

  { emoji: '🐧', habitat: 'arctic', basic: true },
  { emoji: '🦭', habitat: 'arctic', basic: false },

  { emoji: '🐪', habitat: 'desert', basic: true },
  { emoji: '🦎', habitat: 'desert', basic: false },

  { emoji: '🐒', habitat: 'jungle', basic: true },
  { emoji: '🦜', habitat: 'jungle', basic: false },
];

function poolFor(difficulty: Difficulty): AnimalEntry[] {
  return difficulty === 1 ? ANIMALS.filter((a) => a.basic) : ANIMALS;
}

function generate(difficulty: Difficulty): LevelData<Payload, string> {
  const pool = shuffle(poolFor(difficulty));
  const rounds: Round<Payload, string>[] = [];
  for (let i = 0; i < 5; i++) {
    const item = pool[i % pool.length];
    rounds.push({
      id: `r${i}`,
      payload: { emoji: item.emoji, habitat: item.habitat },
      answer: HABITAT_LABEL[item.habitat],
    });
  }
  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { emoji, habitat } = round.payload;
  const options = shuffle(HABITAT_ORDER.map((h) => ({ value: HABITAT_LABEL[h] })));
  return (
    <>
      <PromptCard question="Де живе ця тварина?" answerState={answerState}>
        <div style={{ fontSize: 96, textAlign: 'center', margin: '8px auto' }}>{emoji}</div>
      </PromptCard>
      <ChoiceGrid
        options={options}
        correct={HABITAT_LABEL[habitat]}
        disabled={disabled}
        answerState={answerState}
        onPick={onAnswer}
        columns={3}
      />
    </>
  );
}

const animalsHabitat: GameDefinition<Payload, string> = {
  id: 'animals-habitat',
  title: 'Де живе тварина?',
  subject: 'science',
  levels: ['L0'],
  icon: '🦁',
  description: 'Де живе тварина?',
  accent: '#DCFCE7',
  generate,
  Component,
  // TODO(A2-наука): skills після seed skill-graph науки
};

export default animalsHabitat;
