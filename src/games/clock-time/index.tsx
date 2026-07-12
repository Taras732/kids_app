import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt, shuffle, numberDecoys } from '../shared/ui';

type Mode = 'read' | 'elapsed' | 'convert';
type ConvertKind = 'h2m' | 'm2h';

interface ReadPayload {
  mode: 'read';
  h: number; // 1-12
  m: number; // 0-59
}

interface ElapsedPayload {
  mode: 'elapsed';
  h: number; // початкова година 1-12
  m: number; // початкова хвилина 0-59
  deltaMin: number;
  resultH: number;
  resultM: number;
}

interface ConvertPayload {
  mode: 'convert';
  kind: ConvertKind;
  value: number;
  result: number;
}

type Payload = ReadPayload | ElapsedPayload | ConvertPayload;

const ROUNDS = 5;

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

/** Easy: цілі години + півгодини. Medium: чверті/5-хвилинні поділки. Hard: будь-яка хвилина. */
function minuteStepsFor(difficulty: Difficulty): number[] {
  if (difficulty === 1) return [0, 30];
  if (difficulty === 2) return [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  return Array.from({ length: 60 }, (_, i) => i);
}

/** Easy/Medium — лише читання циферблата. Hard додає "через N хв" та співвідношення год/хв. */
function modeSequenceFor(d: Difficulty): Mode[] {
  if (d === 3) return shuffle<Mode>(['read', 'read', 'read', 'elapsed', 'convert']);
  return Array<Mode>(ROUNDS).fill('read');
}

function fmt(h: number, m: number): string {
  return `${h}:${m.toString().padStart(2, '0')}`;
}

/** Додати deltaMin хвилин до h:m (12-годинний циферблат, h у діапазоні 1-12). */
function addTime(h: number, m: number, deltaMin: number): { h: number; m: number } {
  const totalMin = (((h % 12) * 60 + m + deltaMin) % (12 * 60) + 12 * 60) % (12 * 60);
  let nh = Math.floor(totalMin / 60);
  const nm = totalMin % 60;
  if (nh === 0) nh = 12;
  return { h: nh, m: nm };
}

function genRead(steps: number[], used: Set<string>): ReadPayload {
  let h = randInt(1, 12);
  let m = pick(steps);
  let guard = 0;
  while (used.has(`${h}:${m}`) && guard < 20) {
    h = randInt(1, 12);
    m = pick(steps);
    guard++;
  }
  used.add(`${h}:${m}`);
  return { mode: 'read', h, m };
}

function genElapsed(): ElapsedPayload {
  const h = randInt(1, 12);
  const m = randInt(0, 59);
  const deltaMin = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
  const { h: resultH, m: resultM } = addTime(h, m, deltaMin);
  return { mode: 'elapsed', h, m, deltaMin, resultH, resultM };
}

function genConvert(): ConvertPayload {
  const kind: ConvertKind = Math.random() < 0.5 ? 'h2m' : 'm2h';
  if (kind === 'h2m') {
    const value = randInt(1, 6);
    return { mode: 'convert', kind, value, result: value * 60 };
  }
  const hours = randInt(1, 6);
  return { mode: 'convert', kind, value: hours * 60, result: hours };
}

function correctFor(payload: Payload): string {
  if (payload.mode === 'read') return fmt(payload.h, payload.m);
  if (payload.mode === 'elapsed') return fmt(payload.resultH, payload.resultM);
  return String(payload.result);
}

function generate(difficulty: Difficulty): LevelData<Payload, string> {
  const steps = minuteStepsFor(difficulty);
  const modes = modeSequenceFor(difficulty);
  const used = new Set<string>();
  const rounds: Round<Payload, string>[] = modes.map((mode, i) => {
    let payload: Payload;
    if (mode === 'elapsed') payload = genElapsed();
    else if (mode === 'convert') payload = genConvert();
    else payload = genRead(steps, used);
    return { id: `r${i}`, payload, answer: correctFor(payload) };
  });
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
  const { payload } = round;

  if (payload.mode === 'convert') {
    const questionText = payload.kind === 'h2m' ? `${payload.value} год = ? хв` : `${payload.value} хв = ? год`;
    const decoys = numberDecoys(payload.result, 4, Math.max(2, Math.round(payload.result * 0.4)), 0);
    const options = decoys.map((v) => ({ value: String(v) }));
    return (
      <>
        <PromptCard question="Скільки це?" answerState={answerState}>
          <div
            style={{
              textAlign: 'center',
              fontSize: 34,
              fontWeight: 900,
              color: 'var(--c-ink)',
              fontFamily: 'var(--font-round)',
            }}
          >
            {questionText}
          </div>
        </PromptCard>
        <ChoiceGrid options={options} correct={round.answer} disabled={disabled} answerState={answerState} onPick={onAnswer} columns={2} />
      </>
    );
  }

  if (payload.mode === 'elapsed') {
    const { h, m, deltaMin, resultH, resultM } = payload;
    const options = timeChoices(resultH, resultM, 3).map((value) => ({ value }));
    return (
      <>
        <PromptCard question={`Зараз ${fmt(h, m)}. Котра буде через ${deltaMin} хв?`} answerState={answerState}>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
            <ClockFace h={h} m={m} size={150} />
          </div>
        </PromptCard>
        <ChoiceGrid options={options} correct={round.answer} disabled={disabled} answerState={answerState} onPick={onAnswer} columns={2} />
      </>
    );
  }

  const { h, m } = payload;
  const options = timeChoices(h, m, 3).map((value) => ({ value }));
  return (
    <>
      <PromptCard question="Котра година?" answerState={answerState}>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0' }}>
          <ClockFace h={h} m={m} size={170} />
        </div>
      </PromptCard>
      <ChoiceGrid options={options} correct={round.answer} disabled={disabled} answerState={answerState} onPick={onAnswer} columns={2} />
    </>
  );
}

/** Dev-only self-check: N раундів на складність — відповідь узгоджена з payload, час у межах доби. */
function selfCheck(roundsPerDifficulty = 20): boolean {
  const difficulties: Difficulty[] = [1, 2, 3];
  let allOk = true;
  let checked = 0;
  for (const difficulty of difficulties) {
    for (let i = 0; i < roundsPerDifficulty; i++) {
      const { rounds } = generate(difficulty);
      for (const r of rounds) {
        checked++;
        const expect = correctFor(r.payload);
        if (expect !== r.answer) {
          allOk = false;
          console.error(`[clock-time] self-check FAIL: difficulty=${difficulty} answer=${r.answer} !== expect=${expect}`);
        }
        if (r.payload.mode === 'read' && (r.payload.h < 1 || r.payload.h > 12 || r.payload.m < 0 || r.payload.m > 59)) {
          allOk = false;
          console.error(`[clock-time] self-check FAIL: difficulty=${difficulty} read час поза межами`, r.payload);
        }
        if (r.payload.mode === 'elapsed' && (r.payload.resultH < 1 || r.payload.resultH > 12 || r.payload.resultM < 0 || r.payload.resultM > 59)) {
          allOk = false;
          console.error(`[clock-time] self-check FAIL: difficulty=${difficulty} elapsed результат поза межами`, r.payload);
        }
      }
    }
  }
  if (allOk) console.info(`[clock-time] self-check OK: ${checked} раундів, усі відповіді узгоджені.`);
  return allOk;
}

if (import.meta.env.DEV) {
  selfCheck();
}

const clockTime: GameDefinition<Payload, string> = {
  id: 'clock-time',
  title: 'Котра година?',
  subject: 'math',
  levels: ['L3'],
  icon: '🕐',
  description: 'Котра година?',
  accent: '#DBEAFE',
  // Єдиний seed-skill для читання годинника — складність тут лише деталізує
  // хвилини (рівно/пів/чверть), без окремого skill-id на кожен крок.
  skillIds: {
    1: ['math.measure.l2.time-units'],
    2: ['math.measure.l2.time-units'],
    3: ['math.measure.l2.time-units'],
  },
  generate,
  Component,
};

export default clockTime;
