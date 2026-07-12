import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, shuffle, randInt } from '../shared/ui';

interface Payload {
  emoji: string;
  emotion: string;
}

const EMOTIONS: { emoji: string; label: string }[] = [
  { emoji: '😊', label: 'Радість' },
  { emoji: '😢', label: 'Сум' },
  { emoji: '😠', label: 'Злість' },
  { emoji: '😨', label: 'Страх' },
  { emoji: '😲', label: 'Подив' },
  { emoji: '😴', label: 'Втома' },
];

const ROUNDS_PER_LEVEL = 5;
const CANDIDATES = 3;

function pickCandidates(correct: string): string[] {
  const distractors = EMOTIONS.map((e) => e.label).filter((l) => l !== correct);
  const picked = shuffle(distractors).slice(0, CANDIDATES - 1);
  return shuffle([correct, ...picked]);
}

function generate(difficulty: Difficulty): LevelData<Payload, string> {
  const rounds: Round<Payload, string>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    const source = EMOTIONS[randInt(0, EMOTIONS.length - 1)];
    rounds.push({
      id: `r${i}`,
      payload: { emoji: source.emoji, emotion: source.label },
      answer: source.label,
    });
  }
  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { emoji, emotion } = round.payload;
  const options = pickCandidates(emotion).map((label) => ({ value: label }));
  return (
    <>
      <PromptCard question="Яка це емоція?" answerState={answerState}>
        <div style={{ textAlign: 'center', margin: '12px auto' }}>
          <span style={{ fontSize: 96, lineHeight: 1 }}>{emoji}</span>
        </div>
      </PromptCard>
      <ChoiceGrid options={options} correct={emotion} disabled={disabled} answerState={answerState} onPick={onAnswer} />
    </>
  );
}

const emotionsRecognize: GameDefinition<Payload, string> = {
  id: 'emotions-recognize',
  title: 'Емоції',
  subject: 'life',
  levels: ['L0'],
  icon: '😊',
  description: 'Яка це емоція?',
  accent: '#FCE7F3',
  generate,
  Component,
  // TODO(A2-життя): skills після seed skill-graph життя
};

export default emotionsRecognize;
