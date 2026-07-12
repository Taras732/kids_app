import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round, ProfileLevel } from '../types';
import { PromptCard, ChoiceGrid, shuffle, randInt } from '../shared/ui';

interface Payload {
  question: string;
  emoji?: string;
  options: string[];
}

interface EmojiItem {
  key: string;
  emoji: string;
  name: string;
  tier: Difficulty;
}

const EMOJI_ITEMS: EmojiItem[] = [
  { key: 'sunflower', emoji: '🌻', name: 'Соняшник', tier: 1 },
  { key: 'pysanka', emoji: '🥚', name: 'Писанка', tier: 1 },
  { key: 'vyshyvanka', emoji: '👕', name: 'Вишиванка', tier: 1 },
  { key: 'trident', emoji: '🔱', name: 'Тризуб', tier: 2 },
  { key: 'viburnum', emoji: '🍒', name: 'Калина', tier: 2 },
  { key: 'nightingale', emoji: '🐦', name: 'Соловей', tier: 2 },
  { key: 'map', emoji: '🗺️', name: 'Карта України', tier: 2 },
  { key: 'anthem', emoji: '🎵', name: 'Гімн України', tier: 3 },
];

interface FactItem {
  key: string;
  question: string;
  answer: string;
  options: string[];
  tier: Difficulty;
}

const FACT_ITEMS: FactItem[] = [
  {
    key: 'colors-count',
    question: 'Скільки кольорів на прапорі України?',
    answer: '2',
    options: ['1', '2', '3'],
    tier: 1,
  },
  {
    key: 'flower',
    question: 'Яка квітка — символ України?',
    answer: 'Соняшник',
    options: ['Соняшник', 'Тюльпан', 'Троянда', 'Ромашка'],
    tier: 1,
  },
  {
    key: 'top-color',
    question: 'Який колір зверху на прапорі України?',
    answer: 'Синій',
    options: ['Синій', 'Жовтий', 'Білий', 'Зелений'],
    tier: 2,
  },
  {
    key: 'bottom-color',
    question: 'Який колір знизу на прапорі України?',
    answer: 'Жовтий',
    options: ['Жовтий', 'Синій', 'Червоний', 'Чорний'],
    tier: 2,
  },
  {
    key: 'herb',
    question: 'Що зображено на гербі України?',
    answer: 'Тризуб',
    options: ['Тризуб', 'Лев', 'Орел', 'Зірка'],
    tier: 2,
  },
  {
    key: 'bird',
    question: 'Який птах символізує Україну в піснях?',
    answer: 'Соловей',
    options: ['Соловей', 'Орел', 'Голуб', 'Лелека'],
    tier: 3,
  },
];

function configFor(
  difficulty: Difficulty,
  level: ProfileLevel,
): { optionsCount: number; maxTier: Difficulty; factRatio: number } {
  if (level === 'L0') {
    const optionsCount = difficulty === 1 ? 3 : difficulty === 2 ? 3 : 4;
    return { optionsCount, maxTier: difficulty, factRatio: 0 };
  }
  const optionsCount = difficulty === 3 ? 4 : 3;
  const factRatio = difficulty === 1 ? 0.2 : difficulty === 2 ? 0.5 : 0.8;
  return { optionsCount, maxTier: difficulty, factRatio };
}

function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, string> {
  const cfg = configFor(difficulty, level);
  const rounds: Round<Payload, string>[] = [];

  for (let i = 0; i < 5; i++) {
    if (Math.random() < cfg.factRatio) {
      const pool = FACT_ITEMS.filter((f) => f.tier <= cfg.maxTier);
      const fact = pool.length > 0 ? pool[randInt(0, pool.length - 1)] : FACT_ITEMS[0];
      const distractors = shuffle(fact.options.filter((o) => o !== fact.answer)).slice(0, cfg.optionsCount - 1);
      const options = shuffle([fact.answer, ...distractors]);
      rounds.push({ id: `r${i}`, payload: { question: fact.question, options }, answer: fact.answer });
    } else {
      const pool = EMOJI_ITEMS.filter((e) => e.tier <= cfg.maxTier);
      const target = pool[randInt(0, pool.length - 1)];
      const distractors = shuffle(EMOJI_ITEMS.filter((e) => e.key !== target.key).map((e) => e.name)).slice(
        0,
        cfg.optionsCount - 1,
      );
      const options = shuffle([target.name, ...distractors]);
      rounds.push({
        id: `r${i}`,
        payload: { question: 'Що це за символ?', emoji: target.emoji, options },
        answer: target.name,
      });
    }
  }
  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { question, emoji, options } = round.payload;
  const choices = options.map((opt) => ({ value: opt }));
  return (
    <>
      <PromptCard question={question} answerState={answerState}>
        {emoji ? <div style={{ fontSize: 88, textAlign: 'center', margin: '8px auto', lineHeight: 1 }}>{emoji}</div> : null}
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

const uaSymbols: GameDefinition<Payload, string> = {
  id: 'ua-symbols',
  title: 'Символи України',
  subject: 'world',
  levels: ['L0', 'L3'],
  icon: '🌻',
  description: 'Символи України.',
  accent: '#FEF9C3',
  generate,
  Component,
  // TODO(A2-світ): skills після seed skill-graph світу
};

export default uaSymbols;
