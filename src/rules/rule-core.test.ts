import { describe, it, expect } from 'vitest';
import {
  startLesson,
  advance,
  buildOptions,
  explainFor,
  scaffoldFor,
  createRng,
  shuffleWith,
  totalTasks,
  tasksDone,
  summaryRules,
  validateLesson,
  type RuleBlock,
  type LessonState,
} from './rule-core';
import { MATH_RULE_LESSONS, lessonsForBand } from './rules-math';
import { GRADE_BANDS } from '@/games/types';

// --- невеликий фікстур-урок: 2 блоки, обманки з поясненнями ---
function fixtureBlocks(): RuleBlock[] {
  return [
    {
      statement: { text: 'Правило один.' },
      worked: { prompt: 'p', steps: ['крок'], answer: '2' },
      tasks: [
        {
          id: 't1',
          prompt: '1 + 1',
          correct: '2',
          correctSteps: ['1 + 1 = 2'],
          distractors: [{ value: '11', misconception: 'склеїв цифри', explain: { kind: 'rule-recall', text: 'Правило один.' } }],
        },
      ],
    },
    {
      changeNote: 'А тепер складніше.',
      statement: { text: 'Правило два.' },
      worked: { prompt: 'p2', steps: ['крок2'], answer: '4' },
      tasks: [
        {
          id: 't2',
          prompt: '2 + 2',
          correct: '4',
          correctSteps: ['2 + 2 = 4'],
          distractors: [{ value: '22', misconception: 'склеїв цифри', explain: { kind: 'rule-recall', text: 'Правило два.' } }],
        },
      ],
    },
  ];
}

/** Пройти від старту через правильні відповіді до summary, збираючи фази. */
function playThrough(state: LessonState): LessonState['phase'][] {
  const seen: LessonState['phase'][] = [state.phase];
  let s = state;
  let guard = 0;
  while (s.phase.kind !== 'summary' && guard++ < 50) {
    if (s.phase.kind === 'apply') {
      const task = s.blocks[s.phase.block].tasks[s.phase.task];
      s = advance(s, { type: 'ANSWER', value: task.correct });
    } else {
      s = advance(s, { type: 'NEXT' });
    }
    seen.push(s.phase);
  }
  return seen;
}

describe('EP2 — перша фаза завжди правило', () => {
  it('стартує з rule навіть при високому mastery', () => {
    expect(startLesson(fixtureBlocks(), 0).phase).toEqual({ kind: 'rule', block: 0 });
    expect(startLesson(fixtureBlocks(), 0.99).phase).toEqual({ kind: 'rule', block: 0 });
  });

  it('кожен новий блок починається з rule', () => {
    const phases = playThrough(startLesson(fixtureBlocks(), 0));
    expect(phases.filter((p) => p.kind === 'rule')).toEqual([
      { kind: 'rule', block: 0 },
      { kind: 'rule', block: 1 },
    ]);
  });

  it('порожній список блоків — помилка', () => {
    expect(() => startLesson([], 0)).toThrow();
  });
});

describe('PD3 — скаффолд за mastery, не за difficulty', () => {
  it('пороги full/short/none', () => {
    expect(scaffoldFor(0)).toBe('full');
    expect(scaffoldFor(0.39)).toBe('full');
    expect(scaffoldFor(0.4)).toBe('short');
    expect(scaffoldFor(0.74)).toBe('short');
    expect(scaffoldFor(0.75)).toBe('none');
    expect(scaffoldFor(1)).toBe('none');
  });

  it('mastery>=0.75 пропускає worked example, але НЕ правило', () => {
    const s = startLesson(fixtureBlocks(), 0.8);
    const next = advance(s, { type: 'NEXT' });
    expect(next.phase).toEqual({ kind: 'apply', block: 0, task: 0 });
  });

  it('низький mastery показує worked example між rule і apply', () => {
    const s = startLesson(fixtureBlocks(), 0.1);
    const next = advance(s, { type: 'NEXT' });
    expect(next.phase).toEqual({ kind: 'worked', block: 0 });
  });
});

describe('фаза apply — відповіді, помилки, пояснення', () => {
  it('правильна відповідь веде далі', () => {
    let s = startLesson(fixtureBlocks(), 0.9); // одразу apply
    s = advance(s, { type: 'NEXT' });
    s = advance(s, { type: 'ANSWER', value: '2' });
    expect(s.phase).toEqual({ kind: 'rule', block: 1 });
    expect(s.mistakes).toBe(0);
  });

  it('неправильна відповідь → explain, лічильник помилок, та сама фаза', () => {
    let s = startLesson(fixtureBlocks(), 0.9);
    s = advance(s, { type: 'NEXT' });
    const applyPhase = s.phase;
    s = advance(s, { type: 'ANSWER', value: '11' });
    expect(s.explain).not.toBeNull();
    expect(s.mistakes).toBe(1);
    expect(s.phase).toEqual(applyPhase);
  });

  it('поки показане explain — відповіді заблоковані', () => {
    let s = startLesson(fixtureBlocks(), 0.9);
    s = advance(s, { type: 'NEXT' });
    s = advance(s, { type: 'ANSWER', value: '11' }); // explain
    const blocked = advance(s, { type: 'ANSWER', value: '2' });
    expect(blocked).toBe(s); // ігнор
  });

  it('NEXT прибирає explain і дозволяє повторну спробу', () => {
    let s = startLesson(fixtureBlocks(), 0.9);
    s = advance(s, { type: 'NEXT' });
    s = advance(s, { type: 'ANSWER', value: '11' });
    s = advance(s, { type: 'NEXT' }); // «Зрозуміло»
    expect(s.explain).toBeNull();
    s = advance(s, { type: 'ANSWER', value: '2' });
    expect(s.phase).toEqual({ kind: 'rule', block: 1 });
  });
});

describe('explainFor', () => {
  it('обманка → її пояснення; невідоме → rule-recall', () => {
    const task = fixtureBlocks()[0].tasks[0];
    const st = fixtureBlocks()[0].statement;
    expect(explainFor(task, '11', st).kind).toBe('rule-recall');
    const unknown = explainFor(task, '999', st);
    expect(unknown).toEqual({ kind: 'rule-recall', text: 'Правило один.' });
  });
});

describe('детермінізм (Q2 — варіанти не стрибають)', () => {
  it('той самий seed → той самий порядок варіантів', () => {
    const task = fixtureBlocks()[0].tasks[0];
    expect(buildOptions(task, createRng(42))).toEqual(buildOptions(task, createRng(42)));
  });

  it('shuffleWith детермінований за seed і не втрачає елементів', () => {
    const src = [1, 2, 3, 4, 5];
    expect(shuffleWith(src, createRng(7))).toEqual(shuffleWith(src, createRng(7)));
    expect([...shuffleWith(src, createRng(7))].sort()).toEqual(src);
  });
});

describe('прогрес і підсумок', () => {
  it('tasksDone росте від 0 до totalTasks', () => {
    const blocks = fixtureBlocks();
    const s = startLesson(blocks, 0.9);
    expect(tasksDone(s)).toBe(0);
    const phases = playThrough(s);
    expect(phases[phases.length - 1]).toEqual({ kind: 'summary' });
    // у summary tasksDone === total
    let end = s;
    let guard = 0;
    while (end.phase.kind !== 'summary' && guard++ < 50) {
      end = end.phase.kind === 'apply'
        ? advance(end, { type: 'ANSWER', value: end.blocks[end.phase.block].tasks[end.phase.task].correct })
        : advance(end, { type: 'NEXT' });
    }
    expect(tasksDone(end)).toBe(totalTasks(blocks));
  });

  it('summaryRules — усі правила по порядку (фікс #4)', () => {
    expect(summaryRules(fixtureBlocks())).toEqual(['Правило один.', 'Правило два.']);
  });
});

describe('банк правил математики — структурна гвардія (EP2/PD2) по всіх bands', () => {
  it('кожен урок валідний на кожному своєму band, при кількох seed', () => {
    for (const def of MATH_RULE_LESSONS) {
      for (const band of def.bands) {
        for (const seed of [1, 2, 99, 12345]) {
          const errs = validateLesson(def, band, createRng(seed));
          expect(errs, `${def.id}/${band}/seed${seed}: ${errs.join('; ')}`).toEqual([]);
        }
      }
    }
  });

  it('усі skillIds уроків існують у графі математики', async () => {
    const { MATH_SKILLS } = await import('@/school/skills-math');
    const ids = new Set(MATH_SKILLS.map((s) => s.id));
    for (const def of MATH_RULE_LESSONS) {
      for (const sid of def.skillIds) {
        expect(ids.has(sid), `${def.id}: невідомий skill ${sid}`).toBe(true);
      }
    }
  });

  it('другий блок кожного уроку має changeNote (правило змінюється)', () => {
    for (const def of MATH_RULE_LESSONS) {
      const blocks = def.build(def.bands[0], createRng(1));
      expect(blocks.length).toBeGreaterThanOrEqual(2);
      expect(blocks[1].changeNote?.trim()).toBeTruthy();
    }
  });

  it('порядок дій: у блоці дужок обманка «зліва направо» = правильна відповідь блоку без дужок (правило змінюється на ТИХ САМИХ числах)', () => {
    const def = MATH_RULE_LESSONS.find((l) => l.id === 'math.order-of-operations')!;
    const [first, second] = def.build('L3', createRng(3));
    const ordTask = first.tasks[0]; // a + b × c
    const brkTask = second.tasks[0]; // (a + b) × c на тих самих a,b,c
    // «зліва направо» в першому = (a+b)*c = правильна відповідь у другому
    const leftToRight = ordTask.distractors[0].value;
    expect(brkTask.correct).toBe(leftToRight);
  });

  it('lessonsForBand фільтрує коректно', () => {
    expect(lessonsForBand('L1').every((l) => l.bands.includes('L1'))).toBe(true);
    expect(lessonsForBand('L3').some((l) => l.id === 'math.order-of-operations')).toBe(true);
    // на band поза діапазоном усіх уроків — порожньо або лише відповідні
    for (const band of GRADE_BANDS) {
      lessonsForBand(band).forEach((l) => expect(l.bands).toContain(band));
    }
  });
});

describe('через десяток — приклади реально через десяток', () => {
  it('додавання: одиниці доданків у сумі > 10 (є перехід)', () => {
    const def = MATH_RULE_LESSONS.find((l) => l.id === 'math.through-ten')!;
    for (const seed of [1, 5, 50, 777]) {
      const [addBlock] = def.build('L1', createRng(seed));
      for (const t of addBlock.tasks) {
        const [a, b] = t.prompt.split('+').map((x) => Number(x.trim()));
        expect(a % 10 + b % 10, `${t.prompt} не через десяток`).toBeGreaterThan(10);
        expect(Number(t.correct)).toBe(a + b);
      }
    }
  });

  it('віднімання: зменшуване 11–18, різниця однозначна (є перехід)', () => {
    const def = MATH_RULE_LESSONS.find((l) => l.id === 'math.through-ten')!;
    for (const seed of [2, 8, 60, 888]) {
      const blocks = def.build('L2', createRng(seed));
      const subBlock = blocks[1];
      for (const t of subBlock.tasks) {
        const [m, n] = t.prompt.split('−').map((x) => Number(x.trim()));
        expect(m).toBeGreaterThanOrEqual(11);
        expect(m - n).toBeLessThan(10);
        expect(m - n).toBeGreaterThanOrEqual(0);
        expect(Number(t.correct)).toBe(m - n);
      }
    }
  });
});
