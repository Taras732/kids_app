import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt, shuffle, numberDecoys } from '../shared/ui';

type Unit = 'kop' | 'hrn';
type Mode = 'count' | 'compose' | 'change' | 'compare';

interface CountPayload {
  mode: 'count';
  unit: Unit;
  items: number[];
}

interface ComposeOption {
  id: string;
  items: number[];
  sum: number;
}

interface ComposePayload {
  mode: 'compose';
  unit: Unit;
  target: number;
  options: ComposeOption[];
}

interface ChangePayload {
  mode: 'change';
  cost: number;
  paid: number;
}

interface Product {
  emoji: string;
  name: string;
}

interface ComparePayload {
  mode: 'compare';
  left: Product & { price: number };
  right: Product & { price: number };
  askCheaper: boolean;
}

type Payload = CountPayload | ComposePayload | ChangePayload | ComparePayload;

/** Стиль монети/купюри: колір + чи це монета (кружечок) чи купюра (прямокутник). */
const MONEY_STYLE: Record<number, { bg: string; coin: boolean }> = {
  1: { bg: '#E8D17E', coin: true },
  2: { bg: '#B79A4C', coin: true },
  5: { bg: '#6EA4BF', coin: true },
  10: { bg: '#C06E6E', coin: true },
  20: { bg: '#8FBF7A', coin: false },
  50: { bg: '#A98363', coin: false },
  100: { bg: '#9F7FBF', coin: false },
  200: { bg: '#7A9BBF', coin: false },
  500: { bg: '#BF8FA9', coin: false },
};

const PRODUCTS: Product[] = [
  { emoji: '🍎', name: 'Яблуко' },
  { emoji: '🍌', name: 'Банан' },
  { emoji: '🥐', name: 'Круасан' },
  { emoji: '🧃', name: 'Сік' },
  { emoji: '🍫', name: 'Шоколадка' },
  { emoji: '⚽', name: "М'яч" },
  { emoji: '📕', name: 'Книга' },
  { emoji: '🎈', name: 'Кулька' },
  { emoji: '🧸', name: 'Іграшка' },
];

function poolFor(unit: Unit, d: Difficulty): number[] {
  if (unit === 'kop') return [1, 2, 5, 10];
  if (d === 1) return [1, 2, 5];
  if (d === 2) return [1, 2, 5, 10, 20];
  return [5, 10, 20, 50, 100, 200, 500];
}

function countRangeFor(d: Difficulty): [number, number] {
  return d === 1 ? [2, 3] : d === 2 ? [3, 4] : [4, 5];
}

function randomItems(pool: number[], minCount: number, maxCount: number): number[] {
  const n = randInt(minCount, maxCount);
  const items: number[] = [];
  for (let k = 0; k < n; k++) items.push(pool[randInt(0, pool.length - 1)]);
  return items;
}

/** Easy інколи працює в копійках (1,2,5,10 коп) — окремий контекст від гривень. */
function pickUnit(d: Difficulty): Unit {
  return d === 1 && Math.random() < 0.5 ? 'kop' : 'hrn';
}

function genCount(d: Difficulty): CountPayload {
  const unit = pickUnit(d);
  const pool = poolFor(unit, d);
  const [minCount, maxCount] = countRangeFor(d);
  return { mode: 'count', unit, items: randomItems(pool, minCount, maxCount) };
}

function genCompose(d: Difficulty): ComposePayload {
  const unit = pickUnit(d);
  const pool = poolFor(unit, d);
  const [minCount, maxCount] = countRangeFor(d);
  const correctItems = randomItems(pool, minCount, maxCount);
  const target = correctItems.reduce((a, b) => a + b, 0);

  const options: ComposeOption[] = [{ id: 'opt0', items: correctItems, sum: target }];
  const usedSums = new Set<number>([target]);
  let guard = 0;
  while (options.length < 4 && guard < 60) {
    const items = randomItems(pool, minCount, maxCount);
    const sum = items.reduce((a, b) => a + b, 0);
    if (!usedSums.has(sum)) {
      usedSums.add(sum);
      options.push({ id: `opt${options.length}`, items, sum });
    }
    guard++;
  }
  // добити, якщо забракло унікальних сум (малий пул)
  while (options.length < 4) {
    const items = randomItems(pool, minCount, maxCount);
    options.push({ id: `opt${options.length}`, items, sum: items.reduce((a, b) => a + b, 0) });
  }

  return { mode: 'compose', unit, target, options: shuffle(options) };
}

function genChange(): ChangePayload {
  const paid = pick([10, 20, 50, 100, 200, 500]);
  let cost = Math.round(randInt(1, paid - 1) / 5) * 5;
  if (cost <= 0) cost = 5;
  if (cost >= paid) cost = paid - 5;
  return { mode: 'change', cost, paid };
}

function genCompare(d: Difficulty): ComparePayload {
  const maxPrice = d === 1 ? 20 : d === 2 ? 100 : 500;
  const [a, b] = shuffle(PRODUCTS).slice(0, 2);
  let leftPrice = randInt(1, maxPrice);
  let rightPrice = randInt(1, maxPrice);
  let guard = 0;
  while (leftPrice === rightPrice && guard < 10) {
    rightPrice = randInt(1, maxPrice);
    guard++;
  }
  return {
    mode: 'compare',
    left: { ...a, price: leftPrice },
    right: { ...b, price: rightPrice },
    askCheaper: Math.random() < 0.5,
  };
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function modeSequenceFor(d: Difficulty): Mode[] {
  if (d === 1) return shuffle<Mode>(['count', 'count', 'count', 'compose', 'compose']);
  if (d === 2) return shuffle<Mode>(['count', 'count', 'compose', 'compose', 'compare']);
  return shuffle<Mode>(['change', 'change', 'change', 'compose', 'compare']);
}

function correctFor(payload: Payload): string {
  if (payload.mode === 'count') return String(payload.items.reduce((a, b) => a + b, 0));
  if (payload.mode === 'compose') {
    const match = payload.options.find((o) => o.sum === payload.target);
    return match ? match.id : payload.options[0].id;
  }
  if (payload.mode === 'change') return String(payload.paid - payload.cost);
  const lower = payload.left.price < payload.right.price ? payload.left : payload.right;
  const higher = payload.left.price > payload.right.price ? payload.left : payload.right;
  return payload.askCheaper ? lower.name : higher.name;
}

function generate(difficulty: Difficulty): LevelData<Payload, string> {
  const modes = modeSequenceFor(difficulty);
  const rounds: Round<Payload, string>[] = modes.map((mode, i) => {
    let payload: Payload;
    if (mode === 'count') payload = genCount(difficulty);
    else if (mode === 'compose') payload = genCompose(difficulty);
    else if (mode === 'change') payload = genChange();
    else payload = genCompare(difficulty);
    return { id: `r${i}`, payload, answer: correctFor(payload) };
  });
  return { difficulty, rounds };
}

function MoneyChip({ value, unit, size = 64 }: { value: number; unit: Unit; size?: number }) {
  const label = unit === 'kop' ? 'коп' : 'грн';
  const s = MONEY_STYLE[value] ?? { bg: '#D9D9D9', coin: true };
  if (s.coin) {
    return (
      <div
        style={{
          width: size,
          height: size,
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
        <span style={{ fontSize: size * 0.34, lineHeight: 1, fontWeight: 900 }}>{value}</span>
        <span style={{ fontSize: size * 0.16, fontWeight: 800 }}>{label}</span>
      </div>
    );
  }
  return (
    <div
      style={{
        width: size * 1.44,
        height: size * 0.8,
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
      <span style={{ fontSize: size * 0.36, fontWeight: 900 }}>{value}</span>
      <span style={{ fontSize: size * 0.17, fontWeight: 800 }}>{label}</span>
    </div>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { payload } = round;

  if (payload.mode === 'count') {
    const { items, unit } = payload;
    const sum = items.reduce((a, b) => a + b, 0);
    const spread = Math.max(3, Math.round(sum * 0.25));
    const decoys = numberDecoys(sum, 4, spread, 1);
    const options = decoys.map((v) => ({ value: String(v) }));
    return (
      <>
        <PromptCard question="Порахуй, скільки тут грошей" answerState={answerState}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', margin: '8px auto', maxWidth: 300 }}>
            {items.map((v, i) => (
              <MoneyChip key={i} value={v} unit={unit} />
            ))}
          </div>
        </PromptCard>
        <ChoiceGrid options={options} correct={round.answer} disabled={disabled} answerState={answerState} onPick={onAnswer} />
      </>
    );
  }

  if (payload.mode === 'compose') {
    const { target, unit, options } = payload;
    const label = unit === 'kop' ? 'коп' : 'грн';
    const choices = options.map((o) => ({
      value: o.id,
      node: (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {o.items.map((v, i) => (
            <MoneyChip key={i} value={v} unit={unit} size={38} />
          ))}
        </div>
      ),
    }));
    return (
      <>
        <PromptCard question={`Обери набір, що дає ${target} ${label}`} answerState={answerState}>
          <div style={{ textAlign: 'center', fontSize: 30, fontWeight: 900, color: 'var(--c-primary)', fontFamily: 'var(--font-round)' }}>
            {target} {label}
          </div>
        </PromptCard>
        <ChoiceGrid options={choices} correct={round.answer} disabled={disabled} answerState={answerState} onPick={onAnswer} columns={2} />
      </>
    );
  }

  if (payload.mode === 'change') {
    const { cost, paid } = payload;
    const change = paid - cost;
    const spread = Math.max(3, Math.round(change * 0.3));
    const decoys = numberDecoys(change, 4, spread, 0);
    const options = decoys.map((v) => ({ value: String(v) }));
    return (
      <>
        <PromptCard question="Скільки решти дати?" answerState={answerState}>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', margin: '4px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-mut)' }}>Товар коштує</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--c-ink)', fontFamily: 'var(--font-round)' }}>{cost} грн</div>
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--c-mut)' }}>→</span>
            <MoneyChip value={paid} unit="hrn" size={72} />
          </div>
        </PromptCard>
        <ChoiceGrid options={options} correct={round.answer} disabled={disabled} answerState={answerState} onPick={onAnswer} />
      </>
    );
  }

  const { left, right, askCheaper } = payload;
  const choices = [{ value: left.name }, { value: right.name }];
  return (
    <>
      <PromptCard question={askCheaper ? 'Що дешевше?' : 'Що дорожче?'} answerState={answerState}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', margin: '4px 0' }}>
          {[left, right].map((p) => (
            <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 40 }}>{p.emoji}</span>
              <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--c-ink)' }}>{p.name}</span>
              <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--c-primary)', fontFamily: 'var(--font-round)' }}>{p.price} грн</span>
            </div>
          ))}
        </div>
      </PromptCard>
      <ChoiceGrid options={choices} correct={round.answer} disabled={disabled} answerState={answerState} onPick={onAnswer} columns={2} />
    </>
  );
}

/** Dev-only self-check: N раундів на складність — відповідь узгоджена з payload. */
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
          console.error(`[money-basics] self-check FAIL: difficulty=${difficulty} mode=${r.payload.mode} answer=${r.answer} !== expect=${expect}`);
        }
        if (r.payload.mode === 'compose') {
          const composePayload = r.payload;
          const matchCount = composePayload.options.filter((o) => o.sum === composePayload.target).length;
          if (matchCount < 1) {
            allOk = false;
            console.error(`[money-basics] self-check FAIL: compose без правильного варіанту`, composePayload);
          }
        }
        if (r.payload.mode === 'change' && r.payload.paid - r.payload.cost <= 0) {
          allOk = false;
          console.error(`[money-basics] self-check FAIL: change недодатна решта`, r.payload);
        }
      }
    }
  }
  if (allOk) console.info(`[money-basics] self-check OK: ${checked} раундів, усі відповіді узгоджені.`);
  return allOk;
}

if (import.meta.env.DEV) {
  selfCheck();
}

const moneyBasics: GameDefinition<Payload, string> = {
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
