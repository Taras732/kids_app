import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt, shuffle } from '../shared/ui';

interface Payload {
  h: number; // 1-12
  m: number; // 0-59
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

/** difficulty: круглі години → півгодини → чверті. */
function minuteStepsFor(difficulty: Difficulty): number[] {
  if (difficulty === 1) return [0];
  if (difficulty === 2) return [0, 30];
  return [0, 15, 30, 45];
}

function fmt(h: number, m: number): string {
  return `${h}:${m.toString().padStart(2, '0')}`;
}

function generate(difficulty: Difficulty): LevelData<Payload, string> {
  const steps = minuteStepsFor(difficulty);
  const used = new Set<string>();
  const rounds: Round<Payload, string>[] = [];
  for (let i = 0; i < 5; i++) {
    let h = randInt(1, 12);
    let m = pick(steps);
    let guard = 0;
    while (used.has(`${h}:${m}`) && guard < 20) {
      h = randInt(1, 12);
      m = pick(steps);
      guard++;
    }
    used.add(`${h}:${m}`);
    rounds.push({ id: `r${i}`, payload: { h, m }, answer: fmt(h, m) });
  }
  return { difficulty, rounds };
}

/** Правдоподібні обманки: та ж хвилина з іншою годиною, або та ж година з іншою хвилиною. */
function timeChoices(h: number, m: number, count: number): string[] {
  const correct = fmt(h, m);
  const hourDeltas = [1, 2, 3, -1, -2, -3, 4, 5];
  const minuteDeltas = [15, 30, 45, -15, -30, -45, 5, 10, 20, 25, 35, 40, 50, 55];
  const pool = new Set<string>();
  for (const dh of hourDeltas) {
    const nh = ((h - 1 + dh) % 12 + 12) % 12 + 1;
    pool.add(fmt(nh, m));
  }
  for (const dm of minuteDeltas) {
    const nm = ((m + dm) % 60 + 60) % 60;
    pool.add(fmt(h, nm));
  }
  pool.delete(correct);
  const decoys = shuffle(Array.from(pool)).slice(0, count);
  return shuffle([correct, ...decoys]);
}

/** Аналоговий циферблат: inline-SVG, стрілки за годиною/хвилиною. */
function ClockFace({ h, m, size }: { h: number; m: number; size: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 4;
  const displayHour = h % 12;

  const hourAngle = (displayHour * 30 + m * 0.5 - 90) * (Math.PI / 180);
  const minuteAngle = (m * 6 - 90) * (Math.PI / 180);
  const hourLen = r * 0.5;
  const minLen = r * 0.75;
  const hx = cx + hourLen * Math.cos(hourAngle);
  const hy = cy + hourLen * Math.sin(hourAngle);
  const mx = cx + minLen * Math.cos(minuteAngle);
  const my = cy + minLen * Math.sin(minuteAngle);

  const ticks = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + (r - size * 0.08) * Math.cos(angle);
    const y2 = cy + (r - size * 0.08) * Math.sin(angle);
    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        style={{ stroke: 'var(--c-ink)', strokeWidth: size * 0.02 }}
        strokeLinecap="round"
      />
    );
  });

  const numbers = [12, 3, 6, 9].map((num) => {
    const idx = num === 12 ? 0 : num;
    const angle = (idx * 30 - 90) * (Math.PI / 180);
    const tx = cx + (r - size * 0.18) * Math.cos(angle);
    const ty = cy + (r - size * 0.18) * Math.sin(angle);
    return (
      <text
        key={num}
        x={tx}
        y={ty + size * 0.05}
        style={{ fontSize: size * 0.13, fontWeight: 800, fill: 'var(--c-ink)' }}
        textAnchor="middle"
      >
        {num}
      </text>
    );
  });

  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} style={{ fill: '#fff', stroke: 'var(--c-ink)', strokeWidth: size * 0.025 }} />
      {ticks}
      {numbers}
      <line x1={cx} y1={cy} x2={hx} y2={hy} style={{ stroke: 'var(--c-ink)', strokeWidth: size * 0.05 }} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={mx} y2={my} style={{ stroke: 'var(--c-primary)', strokeWidth: size * 0.035 }} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={size * 0.04} style={{ fill: 'var(--c-primary)' }} />
    </svg>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { h, m } = round.payload;
  const options = timeChoices(h, m, 3).map((value) => ({ value }));
  return (
    <>
      <PromptCard question="Котра година?" answerState={answerState}>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
          <ClockFace h={h} m={m} size={170} />
        </div>
      </PromptCard>
      <ChoiceGrid
        options={options}
        correct={round.answer}
        disabled={disabled}
        answerState={answerState}
        onPick={onAnswer}
        columns={2}
      />
    </>
  );
}

const clockTime: GameDefinition<Payload, string> = {
  id: 'clock-time',
  title: 'Котра година?',
  subject: 'math',
  levels: ['L3'],
  icon: '🕐',
  description: 'Котра година?',
  accent: '#DBEAFE',
  generate,
  Component,
};

export default clockTime;
