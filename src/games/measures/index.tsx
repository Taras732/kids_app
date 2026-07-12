import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt, shuffle } from '../shared/ui';
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

type Payload = ComparePayload | UnitPayload;

const ROUNDS = 5;
const CATEGORIES: MeasureCategory[] = ['length', 'mass', 'volume'];

/** Які одиниці "в грі" для обʼєктів на цій складності (важчі одиниці — тільки на hard). */
function allowedUnitKeysFor(d: Difficulty): string[] {
  if (d === 1) return ['cm', 'm', 'g', 'kg', 'ml', 'l'];
  if (d === 2) return ['mm', 'cm', 'm', 'g', 'kg', 'ml', 'l'];
  return UNITS.map((u) => u.key);
}

/** Послідовність режимів раунду: більше "unit" на easy, більше "compare" на hard. */
function modeSequenceFor(d: Difficulty): Array<'unit' | 'compare'> {
  const unitCount = d === 1 ? 3 : d === 2 ? 2 : 1;
  const seq: Array<'unit' | 'compare'> = Array.from({ length: ROUNDS }, (_, i) => (i < unitCount ? 'unit' : 'compare'));
  return shuffle(seq);
}

function genCompare(pool: ObjectFact[]): ComparePayload {
  let cat = CATEGORIES[randInt(0, CATEGORIES.length - 1)];
  let inCat = pool.filter((o) => o.category === cat);
  let guard = 0;
  while (inCat.length < 2 && guard < 10) {
    cat = CATEGORIES[randInt(0, CATEGORIES.length - 1)];
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

function correctFor(payload: Payload): string {
  if (payload.mode === 'unit') return unitByKey(payload.obj.unitKey).label;
  return baseValue(payload.left) >= baseValue(payload.right) ? payload.left.name : payload.right.name;
}

function generate(difficulty: Difficulty): LevelData<Payload, string> {
  const allowedUnitKeys = allowedUnitKeysFor(difficulty);
  const filtered = OBJECTS.filter((o) => allowedUnitKeys.includes(o.unitKey));
  const pool = filtered.length > 0 ? filtered : OBJECTS;
  const modes = modeSequenceFor(difficulty);

  const rounds: Round<Payload, string>[] = modes.map((mode, i) => {
    const payload = mode === 'unit' ? genUnit(pool) : genCompare(pool);
    return { id: `r${i}`, payload, answer: correctFor(payload) };
  });
  return { difficulty, rounds };
}

const CATEGORY_QUESTION: Record<MeasureCategory, string> = {
  length: 'Що довше?',
  mass: 'Що важче?',
  volume: 'Де більше?',
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

const measures: GameDefinition<Payload, string> = {
  id: 'measures',
  title: 'Виміри',
  subject: 'math',
  levels: ['L3'],
  icon: '📏',
  description: 'Виміри та величини.',
  accent: '#E0F2FE',
  // Гра тренує довжину/масу/ОБ'ЄМ (ml/l), але в seed skill-graph нема жодного
  // skill для об'єму — раунди category='volume' лишаються непокритими.
  skillIds: {
    1: ['math.measure.l2.length-units', 'math.measure.l2.mass-units'],
    2: ['math.measure.l2.length-units', 'math.measure.l2.mass-units', 'math.measure.l3.named-numbers-convert'],
    3: ['math.measure.l3.named-numbers-convert'],
  },
  generate,
  Component,
};

export default measures;
