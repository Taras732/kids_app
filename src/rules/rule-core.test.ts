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
  encouragementFor,
  ENCOURAGEMENTS,
  type RuleBlock,
  type LessonState,
} from './rule-core';
import { MATH_RULE_LESSONS } from './rules-math';
import { ALL_RULE_LESSONS, lessonsFor, ruleOfDay, getRuleLesson } from './registry';
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

describe('джерело істини — приклади живуть у стані машини (не розходяться з UI)', () => {
  it('startLesson зберігає САМ масив blocks; state.blocks === переданий', () => {
    const blocks = fixtureBlocks();
    const s = startLesson(blocks, 0);
    // машина тримає той самий масив, який далі читає й UI (через state.blocks) —
    // тож перевірка correctness у reducer і показ у рендері завжди про один приклад
    expect(s.blocks).toBe(blocks);
  });

  it('advance не мутує blocks (probe безпечний для UI-перевірки)', () => {
    const blocks = fixtureBlocks();
    const s0 = startLesson(blocks, 0.9);
    const s1 = advance(s0, { type: 'NEXT' }); // rule -> apply
    const probe = advance(s1, { type: 'ANSWER', value: '999' }); // навмисно хибна
    expect(s1.blocks).toBe(blocks); // probe не змінив стан-джерело
    expect(probe.blocks).toBe(blocks);
  });
});

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
  it('обманка → її пояснення + причина; невідоме → rule-recall без причини', () => {
    const task = fixtureBlocks()[0].tasks[0];
    const st = fixtureBlocks()[0].statement;
    const known = explainFor(task, '11', st);
    expect(known.explain.kind).toBe('rule-recall');
    expect(known.misconception).toBe('склеїв цифри');
    const unknown = explainFor(task, '999', st);
    expect(unknown.explain).toEqual({ kind: 'rule-recall', text: 'Правило один.' });
    expect(unknown.misconception).toBeNull();
  });
});

describe('growth mindset + причина помилки в стані', () => {
  it('encouragementFor детермінований і в межах банку', () => {
    for (let m = 1; m <= 12; m++) {
      expect(ENCOURAGEMENTS).toContain(encouragementFor(m));
    }
    expect(encouragementFor(1)).toBe(encouragementFor(1));
  });

  it('помилка зберігає wrongMisconception, правильна/NEXT скидають', () => {
    let s = startLesson(fixtureBlocks(), 0.9);
    s = advance(s, { type: 'NEXT' }); // apply
    const wrong = advance(s, { type: 'ANSWER', value: '11' });
    expect(wrong.wrongMisconception).toBe('склеїв цифри');
    const cleared = advance(wrong, { type: 'NEXT' });
    expect(cleared.wrongMisconception).toBeNull();
    const correct = advance(s, { type: 'ANSWER', value: '2' });
    expect(correct.wrongMisconception).toBeNull();
  });
});

describe('детермінізм (Q2 — варіанти не стрибають між ре-рендерами)', () => {
  it('той самий seed → той самий порядок варіантів (повторний виклик стабільний)', () => {
    const task = fixtureBlocks()[0].tasks[0];
    // саме цей інваріант ламався: повторний виклик у тілі рендеру давав інший порядок
    expect(buildOptions(task, 42)).toEqual(buildOptions(task, 42));
    expect(buildOptions(task, 42)).toEqual(buildOptions(task, 42));
  });

  it('містить рівно правильну + усі обманки, без втрат', () => {
    const task = fixtureBlocks()[0].tasks[0];
    const opts = buildOptions(task, 42);
    expect([...opts].sort()).toEqual([task.correct, ...task.distractors.map((d) => d.value)].sort());
  });

  it('shuffleWith детермінований за seed і не втрачає елементів', () => {
    const src = [1, 2, 3, 4, 5];
    expect(shuffleWith(src, createRng(7))).toEqual(shuffleWith(src, createRng(7)));
    expect([...shuffleWith(src, createRng(7))].sort()).toEqual(src);
  });
});

describe('коректність відповідей — правильна НЕ помилка, кожна обманка → пояснення', () => {
  it('для КОЖНОГО завдання КОЖНОГО уроку × усі bands × кілька seed', () => {
    for (const def of MATH_RULE_LESSONS) {
      for (const band of def.bands) {
        for (const seed of [1, 42, 12345, 999]) {
          const blocks = def.build(band, createRng(seed));
          blocks.forEach((blk, bi) => {
            blk.tasks.forEach((t) => {
              // правильна відповідь має бути серед варіантів і НЕ давати помилку
              const opts = buildOptions(t, seed);
              expect(opts, `${def.id}/${band}/${t.id}: correct поза варіантами`).toContain(t.correct);

              // проганяємо машину до цього завдання і тиснемо правильну
              let s = startLesson(blocks, 0.9); // scaffold none → одразу apply
              // дійти до блоку bi
              let guard = 0;
              while (!(s.phase.kind === 'apply' && s.phase.block === bi && s.phase.task === blk.tasks.indexOf(t)) && guard++ < 100) {
                if (s.phase.kind === 'apply') {
                  const cur = s.blocks[s.phase.block].tasks[s.phase.task];
                  s = advance(s, { type: 'ANSWER', value: cur.correct });
                } else if (s.phase.kind === 'summary') {
                  break;
                } else {
                  s = advance(s, { type: 'NEXT' });
                }
              }
              if (s.phase.kind !== 'apply') return;
              const afterCorrect = advance(s, { type: 'ANSWER', value: t.correct });
              expect(afterCorrect.explain, `${def.id}/${t.id}: правильна ${t.correct} дала explain`).toBeNull();
              expect(afterCorrect.mistakes).toBe(s.mistakes);

              // кожна обманка → помилка + пояснення саме її типу
              for (const d of t.distractors) {
                const afterWrong = advance(s, { type: 'ANSWER', value: d.value });
                expect(afterWrong.explain, `${def.id}/${t.id}: обманка ${d.value} без explain`).not.toBeNull();
                expect(afterWrong.explain).toEqual(d.explain);
              }
            });
          });
        }
      }
    }
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

  it('усі skillIds уроків (ОБОХ предметів) існують у своєму skill-графі', async () => {
    const { MATH_SKILLS } = await import('@/school/skills-math');
    const { LANGUAGE_SKILLS } = await import('@/school/skills-language');
    const ids = new Set([...MATH_SKILLS.map((s) => s.id), ...LANGUAGE_SKILLS.map((s) => s.id)]);
    // гвардія проти висячих посилань: урок не може тренувати неіснуючу навичку
    for (const def of ALL_RULE_LESSONS) {
      for (const sid of def.skillIds) {
        expect(ids.has(sid), `${def.id}: невідомий skill ${sid}`).toBe(true);
      }
    }
  });

  it('skillIds уроку належать ЙОГО предмету (мовний урок не тренує math-навичку)', async () => {
    const { MATH_SKILLS } = await import('@/school/skills-math');
    const { LANGUAGE_SKILLS } = await import('@/school/skills-language');
    const subjectById = new Map<string, string>([
      ...MATH_SKILLS.map((s) => [s.id, 'math'] as const),
      ...LANGUAGE_SKILLS.map((s) => [s.id, 'language'] as const),
    ]);
    for (const def of ALL_RULE_LESSONS) {
      for (const sid of def.skillIds) {
        expect(subjectById.get(sid), `${def.id} (${def.subject}) тренує чужий предмет: ${sid}`).toBe(def.subject);
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

  it('ruleOfDay: детермінований у межах доби, під рівень, null де уроків нема', () => {
    // стабільний у межах дати
    expect(ruleOfDay('L3', '2026-07-16')).toBe(ruleOfDay('L3', '2026-07-16'));
    // повертає урок, доречний для band
    const r = ruleOfDay('L3', '2026-07-16');
    expect(r && r.bands.includes('L3')).toBe(true);
    const r1 = ruleOfDay('L1', '2026-07-16');
    expect(r1 && r1.bands.includes('L1')).toBe(true);
    // для L0 уроків-правил ще нема
    expect(ruleOfDay('L0', '2026-07-16')).toBeNull();
  });

  it('lessonsFor фільтрує за рівнем і предметом', () => {
    expect(lessonsFor('L1').every((l) => l.bands.includes('L1'))).toBe(true);
    expect(lessonsFor('L3').some((l) => l.id === 'math.order-of-operations')).toBe(true);
    for (const band of GRADE_BANDS) {
      lessonsFor(band).forEach((l) => expect(l.bands).toContain(band));
    }
    // фільтр за предметом
    expect(lessonsFor('L1', 'math').every((l) => l.subject === 'math')).toBe(true);
    expect(lessonsFor('L1', 'language').every((l) => l.subject === 'language')).toBe(true);
  });

  it('ruleOfDay для предмета: правило дня є і для мови (розклад має math+language щодня)', () => {
    const lang = ruleOfDay('L1', '2026-07-16', 'language');
    expect(lang?.subject).toBe('language');
    const math = ruleOfDay('L1', '2026-07-16', 'math');
    expect(math?.subject).toBe('math');
    // предмет без уроків-правил → null (не падає)
    expect(ruleOfDay('L1', '2026-07-16', 'memory')).toBeNull();
  });

  it('getRuleLesson знаходить уроки обох предметів; id унікальні в реєстрі', () => {
    expect(getRuleLesson('math.through-ten')?.subject).toBe('math');
    expect(getRuleLesson('language.capital-letter')?.subject).toBe('language');
    expect(getRuleLesson('немає-такого')).toBeUndefined();
    const ids = ALL_RULE_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('банк УКРАЇНСЬКОЇ — та сама структурна гвардія (EP2/PD2)', () => {
  it('кожен урок мови валідний на кожному band × кілька seed', () => {
    const langLessons = ALL_RULE_LESSONS.filter((l) => l.subject === 'language');
    expect(langLessons.length).toBeGreaterThan(0);
    for (const def of langLessons) {
      for (const band of def.bands) {
        for (const seed of [1, 7, 42, 999]) {
          expect(validateLesson(def, band, createRng(seed)), `${def.id}/${band}/seed${seed}`).toEqual([]);
        }
      }
    }
  });

  it('варіанти мовних завдань унікальні, 200 seed', () => {
    const langLessons = ALL_RULE_LESSONS.filter((l) => l.subject === 'language');
    for (const def of langLessons) {
      for (const band of def.bands) {
        for (let seed = 1; seed <= 200; seed++) {
          for (const blk of def.build(band, createRng(seed))) {
            for (const t of blk.tasks) {
              const values = [t.correct, ...t.distractors.map((d) => d.value)];
              expect(new Set(values).size, `${def.id}/${t.prompt}: дублі ${values}`).toBe(values.length);
            }
          }
        }
      }
    }
  });
});

describe('унікальність (баги «29,29» і «перше=третє»)', () => {
  it('варіанти кожного завдання унікальні (правильна + обманки, без дублів), 300 seed', () => {
    for (const def of MATH_RULE_LESSONS) {
      for (const band of def.bands) {
        for (let seed = 1; seed <= 300; seed++) {
          for (const blk of def.build(band, createRng(seed))) {
            for (const t of blk.tasks) {
              const values = [t.correct, ...t.distractors.map((d) => d.value)];
              expect(new Set(values).size, `${def.id}/${band}/seed${seed}/${t.prompt}: дублі варіантів ${values}`).toBe(values.length);
              expect(t.distractors.length, `${def.id}/${t.prompt}: замало обманок`).toBeGreaterThanOrEqual(2);
            }
          }
        }
      }
    }
  });

  it('завдання в блоці мають різні формулювання, 300 seed', () => {
    for (const def of MATH_RULE_LESSONS) {
      for (const band of def.bands) {
        for (let seed = 1; seed <= 300; seed++) {
          for (const blk of def.build(band, createRng(seed))) {
            const prompts = blk.tasks.map((t) => t.prompt);
            expect(new Set(prompts).size, `${def.id}/${band}/seed${seed}: дублі завдань ${prompts}`).toBe(prompts.length);
          }
        }
      }
    }
  });
});

describe('прикидка — оцінка НЕ бреше (округлення = найближча сотня до точної відповіді)', () => {
  const def = () => MATH_RULE_LESSONS.find((l) => l.id === 'math.estimation')!;

  it('додавання: правильна відповідь = найближча сотня до ТОЧНОЇ суми, 200 seed', () => {
    for (const band of ['L3', 'L4'] as const) {
      for (let seed = 1; seed <= 200; seed++) {
        const [addBlock] = def().build(band, createRng(seed));
        for (const t of addBlock.tasks) {
          const [a, b] = t.prompt.split('+').map((x) => Number(x.trim()));
          const exact = a + b;
          const nearestHundred = Math.round(exact / 100) * 100;
          // якби доданки були далеко від сотень (напр. 249+249), оцінка розійшлася б
          // з найближчою сотнею — і урок учив би хибного
          expect(Number(t.correct), `${t.prompt}: оцінка ${t.correct}, а найближча сотня до ${exact} = ${nearestHundred}`).toBe(nearestHundred);
        }
      }
    }
  });

  it('множення: оцінка близька до точного добутку (похибка < 15%), 200 seed', () => {
    for (const band of ['L3', 'L4'] as const) {
      for (let seed = 1; seed <= 200; seed++) {
        const blocks = def().build(band, createRng(seed));
        for (const t of blocks[1].tasks) {
          const [a, b] = t.prompt.split('×').map((x) => Number(x.trim()));
          const exact = a * b;
          const est = Number(t.correct);
          expect(Math.abs(est - exact) / exact, `${t.prompt}: оцінка ${est} проти точного ${exact}`).toBeLessThan(0.15);
        }
      }
    }
  });

  it('обманки — сусідні оцінки, ніколи не збігаються з правильною', () => {
    for (const band of ['L3', 'L4'] as const) {
      for (let seed = 1; seed <= 100; seed++) {
        for (const blk of def().build(band, createRng(seed))) {
          for (const t of blk.tasks) {
            const values = [t.correct, ...t.distractors.map((d) => d.value)];
            expect(new Set(values).size).toBe(values.length);
            expect(t.distractors.length).toBeGreaterThanOrEqual(1);
          }
        }
      }
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
