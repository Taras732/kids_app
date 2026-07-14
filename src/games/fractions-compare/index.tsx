import type { GameDefinition, GameComponentProps } from '../types';
import { PromptCard, ChoiceGrid } from '../shared/ui';
import { generate, type Payload, type Sign } from './generate';

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

function FractionBlock({ n, d, color, showVisual }: { n: number; d: number; color: string; showVisual: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {showVisual && <FractionPie n={n} d={d} size={92} color={color} />}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-ink)', lineHeight: 1.1 }}>{n}</span>
        <span style={{ width: 32, height: 3, background: 'var(--c-ink)', borderRadius: 2, margin: '3px 0' }} />
        <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-ink)', lineHeight: 1.1 }}>{d}</span>
      </div>
    </div>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, Sign>) {
  const { n1, d1, n2, d2, showVisual } = round.payload;
  const options = (['<', '=', '>'] as Sign[]).map((value) => ({ value }));
  return (
    <>
      <PromptCard question="Порівняй дроби" answerState={answerState}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, margin: '8px 0' }}>
          <FractionBlock n={n1} d={d1} color="var(--c-pink)" showVisual={showVisual} />
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--c-mut)' }}>?</div>
          <FractionBlock n={n2} d={d2} color="var(--c-blue)" showVisual={showVisual} />
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
