import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt } from '../shared/ui';

interface Payload {
  n1: number;
  d1: number;
  n2: number;
  d2: number;
}

type Sign = '<' | '=' | '>';

interface LevelConfig {
  denominators: number[];
  unitOnly: boolean;
}

function paramsFor(difficulty: Difficulty): LevelConfig {
  if (difficulty === 1) return { denominators: [2, 3, 4], unitOnly: true };
  if (difficulty === 2) return { denominators: [2, 3, 4, 5, 6], unitOnly: false };
  return { denominators: [2, 3, 4, 5, 6, 8, 10], unitOnly: false };
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function pickFraction(cfg: LevelConfig): { n: number; d: number } {
  const d = pick(cfg.denominators);
  const n = cfg.unitOnly ? 1 : randInt(1, d - 1);
  return { n, d };
}

function sign(n1: number, d1: number, n2: number, d2: number): Sign {
  const left = n1 * d2;
  const right = n2 * d1;
  if (left === right) return '=';
  return left > right ? '>' : '<';
}

/** Спробувати підібрати еквівалентний дріб (той самий за значенням, інший вигляд). */
function makeEquivalent(n: number, d: number, denominators: number[]): { n: number; d: number } | null {
  for (let mult = 2; mult <= 4; mult++) {
    const nd = d * mult;
    if (denominators.includes(nd)) return { n: n * mult, d: nd };
  }
  return null;
}

function generate(difficulty: Difficulty): LevelData<Payload, Sign> {
  const cfg = paramsFor(difficulty);
  const rounds: Round<Payload, Sign>[] = [];
  for (let i = 0; i < 5; i++) {
    const f1 = pickFraction(cfg);
    let f2 = pickFraction(cfg);
    if (!cfg.unitOnly && Math.random() < 0.3) {
      const eq = makeEquivalent(f1.n, f1.d, cfg.denominators);
      if (eq) f2 = eq;
    }
    let guard = 0;
    while (f2.n === f1.n && f2.d === f1.d && guard < 20) {
      f2 = pickFraction(cfg);
      guard++;
    }
    rounds.push({
      id: `r${i}`,
      payload: { n1: f1.n, d1: f1.d, n2: f2.n, d2: f2.d },
      answer: sign(f1.n, f1.d, f2.n, f2.d),
    });
  }
  return { difficulty, rounds };
}

/** Кругова діаграма дробу: `d` секторів, `n` зафарбовано. */
function FractionPie({ n, d, size, color }: { n: number; d: number; size: number; color: string }) {
  const r = size / 2 - 3;
  const cx = size / 2;
  const cy = size / 2;

  if (d === 1) {
    return (
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} style={{ fill: n >= 1 ? color : '#fff', stroke: 'var(--c-ink)', strokeWidth: 2 }} />
      </svg>
    );
  }

  const slices = Array.from({ length: d }).map((_, i) => {
    const startAngle = (i / d) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const path = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    const filled = i < n;
    return <path key={i} d={path} style={{ fill: filled ? color : '#fff', stroke: 'var(--c-ink)', strokeWidth: 1.5 }} />;
  });

  return <svg width={size} height={size}>{slices}</svg>;
}

function FractionBlock({ n, d, color }: { n: number; d: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <FractionPie n={n} d={d} size={92} color={color} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-ink)', lineHeight: 1.1 }}>{n}</span>
        <span style={{ width: 32, height: 3, background: 'var(--c-ink)', borderRadius: 2, margin: '3px 0' }} />
        <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-ink)', lineHeight: 1.1 }}>{d}</span>
      </div>
    </div>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, Sign>) {
  const { n1, d1, n2, d2 } = round.payload;
  const options = (['<', '=', '>'] as Sign[]).map((value) => ({ value }));
  return (
    <>
      <PromptCard question="Порівняй дроби" answerState={answerState}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, margin: '8px 0' }}>
          <FractionBlock n={n1} d={d1} color="var(--c-pink)" />
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--c-mut)' }}>?</div>
          <FractionBlock n={n2} d={d2} color="var(--c-blue)" />
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

const fractionsCompare: GameDefinition<Payload, Sign> = {
  id: 'fractions-compare',
  title: 'Порівняння дробів',
  subject: 'math',
  levels: ['L3'],
  icon: '🍕',
  description: 'Порівняй дроби.',
  accent: '#F3E8FF',
  skillIds: {
    1: ['math.ops.l3.fractions-part-whole'],
    2: ['math.ops.l4.fractions-operations'],
    3: ['math.ops.l4.fractions-operations'],
  },
  generate,
  Component,
};

export default fractionsCompare;
