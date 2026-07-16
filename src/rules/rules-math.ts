// Банк правил математики — еталонний зріз під движок RL1 (повний банк — RL3).
//
// Обманки тут НЕ випадкові числа поруч із правильним: кожна — результат
// конкретної хибної стратегії, яку діти реально застосовують («порахував зліва
// направо», «доповнив до 10 і забув, що взяв двійку з п'ятірки»). Тільки так
// можливий consequence-replay: щоб програти хід дитини, треба заздалегідь
// знати, який хід привів до цієї відповіді.
//
// Прив'язка до реальних вузлів skill-graph (A2), не до вигаданих id.

import type { GradeBand } from '@/games/types';
import type { Distractor, RuleBlock, RuleLessonDef, RuleTask, Rng } from './rule-core';

const ri = (rng: Rng, min: number, max: number): number => min + Math.floor(rng() * (max - min + 1));

/** Скільки завдань на блок: найменшим — коротше. */
const taskCount = (band: GradeBand): number => (band === 'L0' || band === 'L1' ? 2 : 3);

// ============================================================
// Порядок дій (3–4 клас) — math.ops.l3.order-of-operations
// ============================================================

/** a + b × c: класична пастка «рахую зліва направо, як читаю». */
function orderTask(id: string, a: number, b: number, c: number): RuleTask {
  const correct = a + b * c;
  const leftToRight = (a + b) * c;

  const distractors: Distractor[] = [
    {
      value: String(leftToRight),
      misconception: 'порахував зліва направо, як читають текст',
      explain: {
        kind: 'consequence-replay',
        steps: [
          { text: `Ти почав з ${a} + ${b} = ${a + b}`, ok: false },
          { text: `Потім ${a + b} × ${c} = ${leftToRight}`, ok: false },
        ],
        correctTail: [
          `Але спочатку множення: ${b} × ${c} = ${b * c}`,
          `Аж тоді додавання: ${a} + ${b * c} = ${correct}`,
        ],
      },
    },
    {
      value: String(b * c),
      misconception: 'зробив множення і на цьому зупинився',
      explain: {
        kind: 'consequence-replay',
        steps: [
          { text: `Множення ти зробив правильно: ${b} × ${c} = ${b * c}`, ok: true },
          { text: 'А далі зупинився', ok: false },
        ],
        correctTail: [`Лишилось додати ${a}: ${a} + ${b * c} = ${correct}`],
      },
    },
  ];

  return {
    id,
    prompt: `${a} + ${b} × ${c}`,
    correct: String(correct),
    correctSteps: [`Спочатку множення: ${b} × ${c} = ${b * c}`, `Потім додавання: ${a} + ${b * c} = ${correct}`],
    distractors,
  };
}

/** a × b + c × d — два множення. Тут видно, де саме хід розійшовся з правилом. */
function twoMultTask(id: string, a: number, b: number, c: number, d: number): RuleTask {
  const correct = a * b + c * d;
  const leftToRight = (a * b + c) * d;

  return {
    id,
    prompt: `${a} × ${b} + ${c} × ${d}`,
    correct: String(correct),
    correctSteps: [
      `Обидва множення спочатку: ${a} × ${b} = ${a * b} і ${c} × ${d} = ${c * d}`,
      `Тоді додавання: ${a * b} + ${c * d} = ${correct}`,
    ],
    distractors: [
      {
        value: String(leftToRight),
        misconception: 'перше множення зробив, далі пішов зліва направо',
        explain: {
          kind: 'consequence-replay',
          steps: [
            { text: `Перше множення — правильно: ${a} × ${b} = ${a * b}`, ok: true },
            { text: `Але потім ${a * b} + ${c} = ${a * b + c}`, ok: false },
            { text: `І ${a * b + c} × ${d} = ${leftToRight}`, ok: false },
          ],
          correctTail: [
            `Друге множення теж іде спочатку: ${c} × ${d} = ${c * d}`,
            `Аж тоді ${a * b} + ${c * d} = ${correct}`,
          ],
        },
      },
      {
        value: String(a * b + c + d),
        misconception: 'друге множення прочитав як додавання',
        explain: {
          kind: 'visual-proof',
          note: 'Подивись на знак між останніми числами — там ×, а не +.',
          visual: { kind: 'steps', steps: [`${c} × ${d} = ${c * d}`, `${a * b} + ${c * d} = ${correct}`] },
        },
      },
    ],
  };
}

/** (a + b) × c — дужки б'ють множення. */
function bracketTask(id: string, a: number, b: number, c: number): RuleTask {
  const correct = (a + b) * c;
  const ignoredBrackets = a + b * c;

  return {
    id,
    prompt: `(${a} + ${b}) × ${c}`,
    correct: String(correct),
    correctSteps: [`Спочатку дужки: ${a} + ${b} = ${a + b}`, `Потім множення: ${a + b} × ${c} = ${correct}`],
    distractors: [
      {
        value: String(ignoredBrackets),
        misconception: 'не побачив дужок, помножив за старим правилом',
        explain: {
          kind: 'consequence-replay',
          steps: [
            { text: `Ти помножив спершу: ${b} × ${c} = ${b * c}`, ok: false },
            { text: `Потім ${a} + ${b * c} = ${ignoredBrackets}`, ok: false },
          ],
          correctTail: [
            `Але дужки — найперші: ${a} + ${b} = ${a + b}`,
            `Аж тоді ${a + b} × ${c} = ${correct}`,
          ],
        },
      },
      {
        value: String(a + b + c),
        misconception: 'усе додав, множення не помітив',
        explain: {
          kind: 'visual-proof',
          note: 'Дужки порахували правильно — але за ними стоїть ×.',
          visual: { kind: 'steps', steps: [`(${a} + ${b}) = ${a + b}`, `${a + b} × ${c} = ${correct}`] },
        },
      },
    ],
  };
}

const ORDER_OF_OPERATIONS: RuleLessonDef = {
  id: 'math.order-of-operations',
  title: 'Порядок дій',
  skillIds: ['math.ops.l3.order-of-operations'],
  bands: ['L3', 'L4'],
  build: (band, rng) => {
    const n = taskCount(band);
    const top = band === 'L4' ? 9 : 6;

    // Числа першого завдання переживають блок — щоб у блоці 2 дужки стали
    // на ТІ САМІ числа. Дитина бачить: 2 + 5 × 3 = 17, але (2 + 5) × 3 = 21.
    const a = ri(rng, 2, top);
    const b = ri(rng, 2, top);
    const c = ri(rng, 2, 5);

    const first: RuleBlock = {
      statement: {
        text: 'Спочатку множимо і ділимо. Аж потім додаємо і віднімаємо.',
        visual: { kind: 'steps', steps: ['× ÷ — спочатку', '+ − — потім'] },
      },
      worked: {
        prompt: '3 × 4 + 2',
        steps: ['Дивимось на знаки: тут є × і +.', 'Правило: спочатку множення → 3 × 4 = 12', 'Тепер додаємо: 12 + 2 = 14'],
        answer: '14',
      },
      tasks: [
        orderTask('ord-1', a, b, c),
        ...(n > 2 ? [twoMultTask('ord-2', ri(rng, 2, 5), ri(rng, 2, 5), ri(rng, 2, 5), ri(rng, 2, 5))] : []),
        orderTask('ord-3', ri(rng, 2, top), ri(rng, 2, top), ri(rng, 2, 5)),
      ],
    };

    const second: RuleBlock = {
      changeNote: 'А тепер правило доповнюється.',
      statement: {
        text: 'Те, що в дужках, рахуємо найперше — навіть раніше за множення.',
        visual: {
          kind: 'steps',
          steps: [
            `${a} + ${b} × ${c} = ${a + b * c}`,
            `(${a} + ${b}) × ${c} = ${(a + b) * c}`,
            'Ті самі числа — а дужки все міняють!',
          ],
        },
      },
      worked: {
        prompt: '(2 + 5) × 3',
        steps: ['Спочатку дужки: 2 + 5 = 7', 'Тепер множення: 7 × 3 = 21'],
        answer: '21',
      },
      tasks: [
        // навмисно ті самі a, b, c, що й у першому завданні блоку 1
        bracketTask('brk-1', a, b, c),
        ...(n > 2 ? [bracketTask('brk-2', ri(rng, 2, top), ri(rng, 2, top), ri(rng, 2, 5))] : []),
      ],
    };

    return [first, second];
  },
};

// ============================================================
// Через десяток (1–2 клас) — math.ops.l1.add-sub-carry-20
// ============================================================

/** a + b через десяток. Пастка: доповнив до 10 і забув, що частину вже витратив. */
function carryAddTask(id: string, a: number, b: number): RuleTask {
  const correct = a + b;
  const toTen = 10 - a;
  const rest = b - toTen;

  return {
    id,
    prompt: `${a} + ${b}`,
    correct: String(correct),
    correctSteps: [
      `${a} доповнюємо до 10 — треба ще ${toTen}`,
      `${b} — це ${toTen} і ще ${rest}`,
      `10 + ${rest} = ${correct}`,
    ],
    distractors: [
      {
        value: String(10 + b),
        misconception: `доповнив ${a} до 10, але потім додав усі ${b}, хоч ${toTen} уже витратив`,
        explain: {
          kind: 'consequence-replay',
          steps: [
            { text: `До 10 ти дійшов правильно: ${a} + ${toTen} = 10`, ok: true },
            { text: `Але далі додав усі ${b}: 10 + ${b} = ${10 + b}`, ok: false },
          ],
          correctTail: [
            `${toTen} з ${b} вже пішло на десяток`,
            `Лишилось тільки ${rest}: 10 + ${rest} = ${correct}`,
          ],
        },
      },
      {
        value: String(correct - 1),
        misconception: 'лічив по одному і збився на одиницю',
        explain: {
          kind: 'visual-proof',
          note: 'Порахуймо разом, десятком:',
          visual: { kind: 'steps', steps: [`${a} + ${toTen} = 10`, `10 + ${rest} = ${correct}`] },
        },
      },
    ],
  };
}

/** m − n через десяток. Пастка: дійшов до 10 і відняв усі одиниці ще раз. */
function carrySubTask(id: string, m: number, n: number): RuleTask {
  const correct = m - n;
  const toTen = m - 10;
  const rest = n - toTen;

  return {
    id,
    prompt: `${m} − ${n}`,
    correct: String(correct),
    correctSteps: [
      `${m} зменшуємо до 10 — це ${toTen}`,
      `${n} — це ${toTen} і ще ${rest}`,
      `10 − ${rest} = ${correct}`,
    ],
    distractors: [
      {
        value: String(10 - n),
        misconception: `дійшов до 10, а тоді відняв усі ${n} ще раз`,
        explain: {
          kind: 'consequence-replay',
          steps: [
            { text: `До 10 ти дійшов правильно: ${m} − ${toTen} = 10`, ok: true },
            { text: `Але далі відняв усі ${n}: 10 − ${n} = ${10 - n}`, ok: false },
          ],
          correctTail: [
            `${toTen} з ${n} вже відняли`,
            `Лишилось тільки ${rest}: 10 − ${rest} = ${correct}`,
          ],
        },
      },
      {
        value: String(correct + 1),
        misconception: 'лічив назад по одному і збився на одиницю',
        explain: {
          kind: 'visual-proof',
          note: 'Порахуймо разом, від десятка:',
          visual: { kind: 'steps', steps: [`${m} − ${toTen} = 10`, `10 − ${rest} = ${correct}`] },
        },
      },
    ],
  };
}

const THROUGH_TEN: RuleLessonDef = {
  id: 'math.through-ten',
  title: 'Через десяток',
  skillIds: ['math.ops.l1.add-sub-carry-20'],
  bands: ['L1', 'L2'],
  build: (band, rng) => {
    const n = taskCount(band);

    /** a+b обов'язково через десяток: a 6–9, сума 11–18. */
    const addPair = (): [number, number] => {
      const a = ri(rng, 6, 9);
      return [a, ri(rng, 11 - a, Math.min(9, 18 - a))];
    };
    /** m−n обов'язково через десяток: m 11–18, різниця < 10. */
    const subPair = (): [number, number] => {
      const m = ri(rng, 11, 18);
      return [m, ri(rng, m - 9, 9)];
    };

    const first: RuleBlock = {
      statement: {
        text: 'Щоб додати через десяток — спочатку доповни до 10, а решту додай зверху.',
        visual: { kind: 'emoji', emoji: '🔟', caption: 'Десяток — наш друг' },
      },
      worked: {
        prompt: '8 + 5',
        steps: ['8 треба доповнити до 10 — це ще 2', '5 — це 2 і ще 3', '8 + 2 = 10, а 10 + 3 = 13'],
        answer: '13',
      },
      tasks: Array.from({ length: n }, (_, i) => carryAddTask(`add-${i + 1}`, ...addPair())),
    };

    const second: RuleBlock = {
      changeNote: 'А тепер те саме правило — тільки навпаки.',
      statement: {
        text: 'Щоб відняти через десяток — спочатку дійди до 10, а решту відніми від нього.',
        visual: { kind: 'emoji', emoji: '🔟', caption: 'Знову через десяток' },
      },
      worked: {
        prompt: '13 − 5',
        steps: ['13 зменшуємо до 10 — це 3', '5 — це 3 і ще 2', '13 − 3 = 10, а 10 − 2 = 8'],
        answer: '8',
      },
      tasks: Array.from({ length: n }, (_, i) => carrySubTask(`sub-${i + 1}`, ...subPair())),
    };

    return [first, second];
  },
};

// ============================================================

export const MATH_RULE_LESSONS: RuleLessonDef[] = [THROUGH_TEN, ORDER_OF_OPERATIONS];

/** Уроки, доречні для рівня дитини. */
export function lessonsForBand(band: GradeBand): RuleLessonDef[] {
  return MATH_RULE_LESSONS.filter((l) => l.bands.includes(band));
}

export function getRuleLesson(id: string): RuleLessonDef | undefined {
  return MATH_RULE_LESSONS.find((l) => l.id === id);
}
