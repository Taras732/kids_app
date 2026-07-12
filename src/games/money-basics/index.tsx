import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt, numberDecoys } from '../shared/ui';

interface Payload {
  items: number[];
}

const ROUNDS = 5;

/** Стиль монети/купюри: колір + чи це монета (кружечок) чи купюра (прямокутник). */
const MONEY_STYLE: Record<number, { bg: string; coin: boolean }> = {
  1: { bg: '#E8D17E', coin: true },
  2: { bg: '#B79A4C', coin: true },
  5: { bg: '#6EA4BF', coin: true },
  10: { bg: '#C06E6E', coin: true },
  20: { bg: '#8FBF7A', coin: false },
  50: { bg: '#A98363', coin: false },
  100: { bg: '#9F7FBF', coin: false },
};

function poolFor(d: Difficulty): number[] {
  if (d === 1) return [1, 2, 5];
  if (d === 2) return [1, 2, 5, 10, 20];
  return [5, 10, 20, 50, 100];
}

function countRangeFor(d: Difficulty): [number, number] {
  return d === 1 ? [2, 3] : d === 2 ? [3, 4] : [4, 5];
}

function generate(difficulty: Difficulty): LevelData<Payload, number> {
  const pool = poolFor(difficulty);
  const [minCount, maxCount] = countRangeFor(difficulty);
  const rounds: Round<Payload, number>[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    const n = randInt(minCount, maxCount);
    const items: number[] = [];
    for (let k = 0; k < n; k++) items.push(pool[randInt(0, pool.length - 1)]);
    const sum = items.reduce((a, b) => a + b, 0);
    rounds.push({ id: `r${i}`, payload: { items }, answer: sum });
  }
  return { difficulty, rounds };
}

function MoneyChip({ value }: { value: number }) {
  const s = MONEY_STYLE[value] ?? { bg: '#D9D9D9', coin: true };
  if (s.coin) {
    return (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: s.bg,
          border: '2px solid rgba(0,0,0,.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-round)',
          color: '#2A1E08',
          boxShadow: 'var(--c-shadow)',
        }}
      >
        <span style={{ fontSize: 22, lineHeight: 1, fontWeight: 900 }}>{value}</span>
        <span style={{ fontSize: 10, fontWeight: 800 }}>грн</span>
      </div>
    );
  }
  return (
    <div
      style={{
        width: 92,
        height: 52,
        borderRadius: 8,
        background: s.bg,
        border: '2px solid rgba(0,0,0,.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        fontFamily: 'var(--font-round)',
        color: '#241608',
        boxShadow: 'var(--c-shadow)',
      }}
    >
      <span style={{ fontSize: 24, fontWeight: 900 }}>{value}</span>
      <span style={{ fontSize: 11, fontWeight: 800 }}>грн</span>
    </div>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, number>) {
  const { items } = round.payload;
  const sum = items.reduce((a, b) => a + b, 0);
  const spread = Math.max(3, Math.round(sum * 0.25));
  const options = numberDecoys(sum, 4, spread, 1).map((v) => ({ value: v }));
  return (
    <>
      <PromptCard question="Порахуй, скільки тут грошей" answerState={answerState}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
            margin: '8px auto',
            maxWidth: 300,
          }}
        >
          {items.map((v, i) => (
            <MoneyChip key={i} value={v} />
          ))}
        </div>
      </PromptCard>
      <ChoiceGrid options={options} correct={sum} disabled={disabled} answerState={answerState} onPick={onAnswer} />
    </>
  );
}

const moneyBasics: GameDefinition<Payload, number> = {
  id: 'money-basics',
  title: 'Гроші',
  subject: 'math',
  levels: ['L3'],
  icon: '🪙',
  description: 'Полічи гроші.',
  accent: '#FEF3C7',
  skillIds: {
    1: ['math.measure.l3.money'],
    2: ['math.measure.l3.money'],
    3: ['math.measure.l3.money'],
  },
  generate,
  Component,
};

export default moneyBasics;
