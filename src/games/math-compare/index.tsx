import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round, ProfileLevel } from '../types';
import { PromptCard, ChoiceGrid, randInt } from '../shared/ui';

interface Payload {
  left: number;
  right: number;
}

type Sign = '<' | '=' | '>';

const ROUNDS_PER_LEVEL = 5;
/** Шанс, що left і right навмисно зроблять рівними (щоб трапився знак '='). */
const EQUAL_PROBABILITY = 0.28;

function maxFor(level: ProfileLevel, difficulty: Difficulty): number {
  if (level === 'L0') return 10;
  // L3: diff1 — до 100, diff2-3 — до 1000
  return difficulty === 1 ? 100 : 1000;
}

function compareSign(left: number, right: number): Sign {
  if (left < right) return '<';
  if (left > right) return '>';
  return '=';
}

function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, Sign> {
  const max = maxFor(level, difficulty);
  const rounds: Round<Payload, Sign>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    const left = randInt(1, max);
    const right = Math.random() < EQUAL_PROBABILITY ? left : randInt(1, max);
    rounds.push({ id: `r${i}`, payload: { left, right }, answer: compareSign(left, right) });
  }
  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, Sign>) {
  const { left, right } = round.payload;
  const options = (['<', '=', '>'] as Sign[]).map((s) => ({
    value: s,
    node: <span style={{ fontSize: 36 }}>{s}</span>,
  }));

  return (
    <>
      <PromptCard question="Який знак?" answerState={answerState}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            margin: '10px 0',
          }}
        >
          <span style={{ fontSize: 56, fontWeight: 900, color: 'var(--c-ink)', fontFamily: 'var(--font-round)' }}>
            {left}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 60,
              height: 60,
              borderRadius: 14,
              border: '2px dashed var(--c-primary)',
              color: 'var(--c-primary)',
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            ?
          </span>
          <span style={{ fontSize: 56, fontWeight: 900, color: 'var(--c-ink)', fontFamily: 'var(--font-round)' }}>
            {right}
          </span>
        </div>
      </PromptCard>
      <ChoiceGrid
        options={options}
        correct={round.answer}
        disabled={disabled}
        answerState={answerState}
        onPick={onAnswer}
        columns={3}
      />
    </>
  );
}

const mathCompare: GameDefinition<Payload, Sign> = {
  id: 'math-compare',
  title: 'Порівняй числа',
  subject: 'math',
  levels: ['L0', 'L3'],
  icon: '⚖️',
  description: 'Постав знак: <, = чи >.',
  accent: '#E0F2FE',
  // Гра спільна для L0 (межа завжди 10, без масштабування складністю) і L3
  // (diff1 → до 100, diff2-3 → до 1000); skillIds відображає L3-масштаб.
  skillIds: {
    1: ['math.count.l2.compare-100'],
    2: ['math.count.l3.compare-1000'],
    3: ['math.count.l3.compare-1000'],
  },
  generate,
  Component,
};

export default mathCompare;
