import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt, shuffle, numberDecoys } from '../shared/ui';
import { UNITS, OBJECTS, unitByKey, baseValue, type ObjectFact, type MeasureCategory } from './data';

interface ComparePayload {
  mode: 'compare';
  left: ObjectFact;
  right: ObjectFact;
}

interface UnitPayload {
  mode: 'unit';
  obj: ObjectFact;
  options: string[];
}

interface ConvertPayload {
  mode: 'convert';
  fromKey: string;
  toKey: string;
  value: number;
  result: number;
}

interface MultistepPayload {
  mode: 'multistep';
  category: 'length' | 'mass' | 'volume';
  smallKey: string;
  bigKey: string;
  a: number;
  b: number;
  result: number;
}

type Payload = ComparePayload | UnitPayload | ConvertPayload | MultistepPayload;
type RoundMode = Payload['mode'];

const BASE_CATEGORIES: MeasureCategory[] = ['length', 'mass', 'volume'];

/** Прості пари одиниць для перетворень (Medium): сусідні одиниці, множник ≤1000. */
const CONVERT_PAIRS_MEDIUM: { big: string; small: string }[] = [
  { big: 'm', small: 'cm' },
  { big: 'dm', small: 'cm' },
  { big: 'cm', small: 'mm' },
  { big: 'kg', small: 'g' },
  { big: 'l', small: 'ml' },
];

/** Hard додає км/т і дозволяє обидва напрямки перетворення. */
const CONVERT_PAIRS_HARD: { big: string; small: string }[] = [
  ...CONVERT_PAIRS_MEDIUM,
  { big: 'km', small: 'm' },
  { big: 't', small: 'kg' },
];

/** Пари для багатокрокових задач: сума двох величин + переведення в більшу одиницю. */
const MULTISTEP_PAIRS: { big: string; small: string; category: 'length' | 'mass' | 'volume' }[] = [
  { big: 'm', small: 'cm', category: 'length' },
  { big: 'kg', small: 'g', category: 'mass' },
  { big: 'l', small: 'ml', category: 'volume' },
];

const MULTISTEP_NOUNS: Record<'length' | 'mass' | 'volume', { noun: string; emoji: string }> = {
  length: { noun: 'мотузки', emoji: '🧵' },
  mass: { noun: 'борошна', emoji: '🌾' },
  volume: { noun: 'води', emoji: '🚰' },
};

/** Які одиниці "в грі" для обʼєктів на цій складності (важчі одиниці, включно з °C, — тільки на hard). */
function allowedUnitKeysFor(d: Difficulty): string[] {
  if (d === 1) return ['cm', 'm', 'g', 'kg', 'ml', 'l'];
  if (d === 2) return ['mm', 'cm', 'm', 'g', 'kg', 'ml', 'l'];
  return UNITS.map((u) => u.key);
}

/** Easy — лише порівняння/впізнавання. Medium додає перетворення. Hard — багатокрокові + температура. */
function modeSequenceFor(d: Difficulty): RoundMode[] {
  if (d === 1) return shuffle<RoundMode>(['unit', 'unit', 'unit', 'compare', 'compare']);
  if (d === 2) return shuffle<RoundMode>(['unit', 'unit', 'compare', 'convert', 'convert']);
  return shuffle<RoundMode>(['unit', 'compare', 'convert', 'multistep', 'multistep']);
}

function genCompare(pool: ObjectFact[], categories: MeasureCategory[]): ComparePayload {
  let cat = categories[randInt(0, categories.length - 1)];
  let inCat = pool.filter((o) => o.category === cat);
  let guard = 0;
  while (inCat.length < 2 && guard < 10) {
    cat = categories[randInt(0, categories.length - 1)];
    inCat = pool.filter((o) => o.category === cat);
    guard++;
  }
  if (inCat.length < 2) inCat = OBJECTS.filter((o) => o.category === cat);

  const shuffled = shuffle(inCat);
  const left = shuffled[0];
  let right = shuffled[1];
  guard = 0;
  while (baseValue(left) === baseValue(right) && guard < 10) {
    right = shuffled[randInt(0, shuffled.length - 1)];
    guard++;
  }
  return { mode: 'compare', left, right };
}

function genUnit(pool: ObjectFact[]): UnitPayload {
  const obj = pool[randInt(0, pool.length - 1)];
  const correctUnit = unitByKey(obj.unitKey);
  const sameCategory = shuffle(UNITS.filter((u) => u.category === correctUnit.category && u.key !== correctUnit.key));
  const otherCategory = shuffle(UNITS.filter((u) => u.category !== correctUnit.category));
  const decoys = [...sameCategory, ...otherCategory].slice(0, 2);
  const options = shuffle([correctUnit.label, ...decoys.map((u) => u.label)]);
  return { mode: 'unit', obj, options };
}

function genConvert(pairs: { big: string; small: string }[], allowReverse: boolean): ConvertPayload {
  const pair = pairs[randInt(0, pairs.length - 1)];
  const bigUnit = unitByKey(pair.big);
  const smallUnit = unitByKey(pair.small);
  const ratio = bigUnit.inBase / smallUnit.inBase;
  const reverse = allowReverse && Math.random() < 0.5;
  if (!reverse) {
    const value = randInt(1, 9);
    return { mode: 'convert', fromKey: pair.big, toKey: pair.small, value, result: value * ratio };
  }
  const mult = randInt(1, 9);
  const value = mult * ratio;
  return { mode: 'convert', fromKey: pair.small, toKey: pair.big, value, result: mult };
}

function genMultistep(): MultistepPayload {
  const pick = MULTISTEP_PAIRS[randInt(0, MULTISTEP_PAIRS.length - 1)];
  const bigUnit = unitByKey(pick.big);
  const smallUnit = unitByKey(pick.small);
  const ratio = bigUnit.inBase / smallUnit.inBase;
  const mult = randInt(2, 6);
  const total = mult * ratio;
  const a = randInt(1, total - 1);
  const b = total - a;
  return { mode: 'multistep', category: pick.category, smallKey: pick.small, bigKey: pick.big, a, b, result: mult };
}

function correctFor(payload: Payload): string {
  if (payload.mode === 'unit') return unitByKey(payload.obj.unitKey).label;
  if (payload.mode === 'compare') return baseValue(payload.left) >= baseValue(payload.right) ? payload.left.name : payload.right.name;
  return String(payload.result);
}

function generate(difficulty: Difficulty): LevelData<Payload, string> {
  const allowedUnitKeys = allowedUnitKeysFor(difficulty);
  const filtered = OBJECTS.filter((o) => allowedUnitKeys.includes(o.unitKey));
  const pool = filtered.length > 0 ? filtered : OBJECTS;
  const categories: MeasureCategory[] = difficulty === 3 ? [...BASE_CATEGORIES, 'temp'] : BASE_CATEGORIES;
  const convertPairs = difficulty === 3 ? CONVERT_PAIRS_HARD : CONVERT_PAIRS_MEDIUM;
  const modes = modeSequenceFor(difficulty);

  const rounds: Round<Payload, string>[] = modes.map((mode, i) => {
    let payload: Payload;
    if (mode === 'unit') payload = genUnit(pool);
    else if (mode === 'compare') payload = genCompare(pool, categories);
    else if (mode === 'convert') payload = genConvert(convertPairs, difficulty === 3);
    else payload = genMultistep();
    return { id: `r${i}`, payload, answer: correctFor(payload) };
  });
  return { difficulty, rounds };
}

const CATEGORY_QUESTION: Record<MeasureCategory, string> = {
  length: 'Що довше?',
  mass: 'Що важче?',
  volume: 'Де більше?',
  temp: 'Що тепліше?',
};

function ObjectCard({ obj }: { obj: ObjectFact }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: '14px 16px',
        borderRadius: 16,
        border: '1.5px solid var(--c-line)',
        background: 'var(--c-card)',
        minWidth: 110,
      }}
    >
      <span style={{ fontSize: 40 }}>{obj.emoji}</span>
      <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--c-ink)', textAlign: 'center' }}>{obj.name}</span>
      <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--c-primary)', fontFamily: 'var(--font-round)' }}>
        {obj.value} {unitByKey(obj.unitKey).label}
      </span>
    </div>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { payload } = round;

  if (payload.mode === 'unit') {
    const { obj, options } = payload;
    const choices = options.map((label) => ({ value: label }));
    return (
      <>
        <PromptCard question="Чим це виміряти?" answerState={answerState}>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '8px auto' }}>
            <ObjectCard obj={obj} />
          </div>
        </PromptCard>
        <ChoiceGrid
          options={choices}
          correct={round.answer}
          disabled={disabled}
          answerState={answerState}
          onPick={onAnswer}
          columns={choices.length === 3 ? 3 : 2}
        />
      </>
    );
  }

  if (payload.mode === 'convert') {
    const fromUnit = unitByKey(payload.fromKey);
    const toUnit = unitByKey(payload.toKey);
    const decoys = numberDecoys(payload.result, 4, Math.max(2, Math.round(payload.result * 0.4)), 0);
    const options = decoys.map((v) => ({ value: String(v) }));
    return (
      <>
        <PromptCard question="Скільки це?" answerState={answerState}>
          <div style={{ textAlign: 'center', fontSize: 32, fontWeight: 900, color: 'var(--c-ink)', fontFamily: 'var(--font-round)' }}>
            {payload.value} {fromUnit.label} = ? {toUnit.label}
          </div>
        </PromptCard>
        <ChoiceGrid options={options} correct={round.answer} disabled={disabled} answerState={answerState} onPick={onAnswer} columns={2} />
      </>
    );
  }

  if (payload.mode === 'multistep') {
    const { category, smallKey, bigKey, a, b } = payload;
    const noun = MULTISTEP_NOUNS[category];
    const smallUnit = unitByKey(smallKey);
    const bigUnit = unitByKey(bigKey);
    const decoys = numberDecoys(payload.result, 4, Math.max(2, Math.round(payload.result * 0.4)), 0);
    const options = decoys.map((v) => ({ value: String(v) }));
    return (
      <>
        <PromptCard question={`Скільки всього ${bigUnit.label} ${noun.noun}?`} answerState={answerState}>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', margin: '4px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 34 }}>{noun.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--c-primary)', fontFamily: 'var(--font-round)' }}>
                {a} {smallUnit.label}
              </div>
            </div>
            <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--c-mut)' }}>+</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 34 }}>{noun.emoji}</div>
              <div style={{ fontWeight: 900, fontSize: 18, color: 'var(--c-primary)', fontFamily: 'var(--font-round)' }}>
                {b} {smallUnit.label}
              </div>
            </div>
          </div>
        </PromptCard>
        <ChoiceGrid options={options} correct={round.answer} disabled={disabled} answerState={answerState} onPick={onAnswer} columns={2} />
      </>
    );
  }

  const { left, right } = payload;
  const choices = [{ value: left.name }, { value: right.name }];
  return (
    <>
      <PromptCard question={CATEGORY_QUESTION[left.category]} answerState={answerState}>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', margin: '4px 0' }}>
          <ObjectCard obj={left} />
          <ObjectCard obj={right} />
        </div>
      </PromptCard>
      <ChoiceGrid
        options={choices}
        correct={round.answer}
        disabled={disabled}
        answerState={answerState}
        onPick={onAnswer}
        columns={2}
      />
    </>
  );
}

/** Dev-only self-check: N раундів на складність — відповідь узгоджена з payload, значення коректні. */
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
          console.error(`[measures] self-check FAIL: difficulty=${difficulty} mode=${r.payload.mode} answer=${r.answer} !== expect=${expect}`);
        }
        if (r.payload.mode === 'compare' && difficulty < 3 && r.payload.left.category === 'temp') {
          allOk = false;
          console.error(`[measures] self-check FAIL: температура поза Hard`, r.payload);
        }
        if ((r.payload.mode === 'convert' || r.payload.mode === 'multistep') && (!Number.isInteger(r.payload.result) || r.payload.result < 1)) {
          allOk = false;
          console.error(`[measures] self-check FAIL: результат не натуральне число`, r.payload);
        }
      }
    }
  }
  if (allOk) console.info(`[measures] self-check OK: ${checked} раундів, усі відповіді узгоджені.`);
  return allOk;
}

if (import.meta.env.DEV) {
  selfCheck();
}

const measures: GameDefinition<Payload, string> = {
  id: 'measures',
  title: 'Виміри',
  subject: 'math',
  levels: ['L3'],
  icon: '📏',
  description: 'Виміри та величини.',
  accent: '#E0F2FE',
  // Гра тренує довжину/масу/об'єм (ml/l) + перетворення одиниць та температуру (Hard);
  // seed skill-graph нема окремого skill для об'єму/температури — ці раунди лишаються
  // непокритими в skillIds (успадковано з A3, не розширюємо тут).
  skillIds: {
    1: ['math.measure.l2.length-units', 'math.measure.l2.mass-units'],
    2: ['math.measure.l2.length-units', 'math.measure.l2.mass-units', 'math.measure.l3.named-numbers-convert'],
    3: ['math.measure.l3.named-numbers-convert'],
  },
  generate,
  Component,
};

export default measures;
