import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, shuffle } from '../shared/ui';

interface Payload {
  emoji: string;
  word: string;
  options: string[];
}

interface VocabEntry {
  emoji: string;
  word: string;
}

const VOCAB: VocabEntry[] = [
  { emoji: '🐱', word: 'cat' },
  { emoji: '🐶', word: 'dog' },
  { emoji: '☀️', word: 'sun' },
  { emoji: '🍎', word: 'apple' },
  { emoji: '🏠', word: 'house' },
  { emoji: '🐟', word: 'fish' },
  { emoji: '⭐', word: 'star' },
  { emoji: '🌳', word: 'tree' },
  { emoji: '🚗', word: 'car' },
  { emoji: '📖', word: 'book' },
  { emoji: '🌸', word: 'flower' },
  { emoji: '🐦', word: 'bird' },
];

function optionsCountFor(d: Difficulty): number {
  return d === 1 ? 3 : 4;
}

function generate(difficulty: Difficulty): LevelData<Payload, string> {
  const total = optionsCountFor(difficulty);
  const targets = shuffle(VOCAB).slice(0, 5);
  const rounds: Round<Payload, string>[] = targets.map((target, i) => {
    const distractors = shuffle(VOCAB.filter((v) => v.word !== target.word))
      .slice(0, total - 1)
      .map((v) => v.word);
    const options = shuffle([target.word, ...distractors]);
    return { id: `r${i}`, payload: { emoji: target.emoji, word: target.word, options }, answer: target.word };
  });
  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { emoji, word, options } = round.payload;
  const choices = options.map((w) => ({ value: w }));
  return (
    <>
      <PromptCard question="What is this?" answerState={answerState}>
        <div style={{ fontSize: 72, textAlign: 'center', margin: '8px auto' }}>{emoji}</div>
      </PromptCard>
      <ChoiceGrid options={choices} correct={word} disabled={disabled} answerState={answerState} onPick={onAnswer} />
    </>
  );
}

const englishWordPicture: GameDefinition<Payload, string> = {
  id: 'english-word-picture',
  title: 'Word & Picture',
  subject: 'english',
  levels: ['L0'],
  icon: '🇬🇧',
  description: 'Слово та картинка.',
  accent: '#E0F2FE',
  generate,
  Component,
};

export default englishWordPicture;
