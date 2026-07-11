import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, shuffle } from '../shared/ui';

interface Payload {
  question: string;
  emoji: string;
  options: string[];
}

const CONTINENTS = ['Євразія', 'Африка', 'Північна Америка', 'Південна Америка', 'Австралія', 'Антарктида'];
const OCEANS = ['Тихий океан', 'Атлантичний океан', 'Індійський океан', 'Північний Льодовитий океан'];

interface Fact {
  question: string;
  emoji: string;
  answer: string;
  pool: string[];
  tier: Difficulty;
}

const FACTS: Fact[] = [
  { question: 'Скільки материків на Землі?', emoji: '🧮', answer: '6', pool: ['5', '6', '7', '4'], tier: 1 },
  { question: 'На якому материку живуть кенгуру?', emoji: '🦘', answer: 'Австралія', pool: CONTINENTS, tier: 1 },
  { question: 'На якому материку пустеля Сахара?', emoji: '🏜️', answer: 'Африка', pool: CONTINENTS, tier: 1 },
  { question: 'На якому материку живуть пінгвіни?', emoji: '🐧', answer: 'Антарктида', pool: CONTINENTS, tier: 1 },
  { question: 'На якому материку розташована Україна?', emoji: '🇺🇦', answer: 'Євразія', pool: CONTINENTS, tier: 1 },
  {
    question: 'На якому материку розташовані США і Канада?',
    emoji: '🗽',
    answer: 'Північна Америка',
    pool: CONTINENTS,
    tier: 1,
  },
  { question: 'На якому материку багато левів і жирафів?', emoji: '🦁', answer: 'Африка', pool: CONTINENTS, tier: 2 },
  {
    question: 'На якому материку тече річка Амазонка?',
    emoji: '🌴',
    answer: 'Південна Америка',
    pool: CONTINENTS,
    tier: 2,
  },
  { question: 'На якому материку найвища гора Еверест?', emoji: '🏔️', answer: 'Євразія', pool: CONTINENTS, tier: 2 },
  { question: 'Скільки океанів на Землі?', emoji: '🧮', answer: '4', pool: ['3', '4', '5', '6'], tier: 2 },
  { question: 'Який материк найбільший?', emoji: '🗺️', answer: 'Євразія', pool: CONTINENTS, tier: 2 },
  { question: 'Який материк найхолодніший?', emoji: '❄️', answer: 'Антарктида', pool: CONTINENTS, tier: 2 },
  { question: 'Який материк найменший?', emoji: '🏝️', answer: 'Австралія', pool: CONTINENTS, tier: 3 },
  { question: 'Який океан найбільший?', emoji: '🌊', answer: 'Тихий океан', pool: OCEANS, tier: 1 },
  {
    question: 'Який океан омиває Європу й Америку?',
    emoji: '⚓',
    answer: 'Атлантичний океан',
    pool: OCEANS,
    tier: 2,
  },
  {
    question: 'Який океан найхолодніший?',
    emoji: '🧊',
    answer: 'Північний Льодовитий океан',
    pool: OCEANS,
    tier: 2,
  },
  {
    question: 'Який океан між Африкою й Австралією?',
    emoji: '🐚',
    answer: 'Індійський океан',
    pool: OCEANS,
    tier: 3,
  },
  { question: 'Який океан найменший?', emoji: '🧊', answer: 'Північний Льодовитий океан', pool: OCEANS, tier: 3 },
];

function generate(difficulty: Difficulty): LevelData<Payload, string> {
  const optionsCount = difficulty === 3 ? 4 : 3;
  const pool = FACTS.filter((f) => f.tier <= difficulty);
  const picked = shuffle(pool.length >= 5 ? pool : FACTS).slice(0, 5);
  const rounds: Round<Payload, string>[] = picked.map((fact, i) => {
    const distractors = shuffle(fact.pool.filter((v) => v !== fact.answer)).slice(0, optionsCount - 1);
    const options = shuffle([fact.answer, ...distractors]);
    return { id: `r${i}`, payload: { question: fact.question, emoji: fact.emoji, options }, answer: fact.answer };
  });
  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { question, emoji, options } = round.payload;
  const choices = options.map((opt) => ({ value: opt }));
  return (
    <>
      <PromptCard question={question} answerState={answerState}>
        <div style={{ fontSize: 72, textAlign: 'center', margin: '8px auto', lineHeight: 1 }}>{emoji}</div>
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

const continentsOceans: GameDefinition<Payload, string> = {
  id: 'continents-oceans',
  title: 'Материки й океани',
  subject: 'world',
  levels: ['L3'],
  icon: '🌍',
  description: 'Материки й океани.',
  accent: '#CFFAFE',
  generate,
  Component,
};

export default continentsOceans;
