import { describe, it, expect } from 'vitest';
import {
  applyCommand,
  applyAll,
  trace,
  buildTask,
  buildUsableTask,
  configFor,
  createRng,
  commandLabel,
  key,
  eq,
  CELLS,
  type Band,
  type State,
} from './core';

const BANDS: Band[] = ['L1', 'L2', 'L3', 'L4'];

describe('команди — кожна робить рівно те, що обіцяє напис', () => {
  it('поміняти місцями перше й останнє', () => {
    expect(applyCommand(['🔴', '🔵', '🟢'], { kind: 'swap-ends' })).toEqual(['🟢', '🔵', '🔴']);
  });

  it('прибрати колір — прибирає ВСІ його входження', () => {
    expect(applyCommand(['🔴', '🔵', '🔴'], { kind: 'remove', cell: '🔴' })).toEqual(['🔵']);
  });

  it('додати в кінець', () => {
    expect(applyCommand(['🔴'], { kind: 'append', cell: '🟢' })).toEqual(['🔴', '🟢']);
  });

  it('перевернути ряд', () => {
    expect(applyCommand(['🔴', '🔵', '🟢'], { kind: 'reverse' })).toEqual(['🟢', '🔵', '🔴']);
  });

  it('перше — в кінець', () => {
    expect(applyCommand(['🔴', '🔵', '🟢'], { kind: 'rotate-left' })).toEqual(['🔵', '🟢', '🔴']);
  });

  it('не мутує вхідний стан (кожен крок дає новий)', () => {
    const start: State = ['🔴', '🔵'];
    applyCommand(start, { kind: 'reverse' });
    applyCommand(start, { kind: 'swap-ends' });
    expect(start).toEqual(['🔴', '🔵']);
  });

  it('порожній/короткий ряд не ламає команди', () => {
    expect(applyCommand([], { kind: 'swap-ends' })).toEqual([]);
    expect(applyCommand(['🔴'], { kind: 'rotate-left' })).toEqual(['🔴']);
    expect(applyCommand([], { kind: 'reverse' })).toEqual([]);
  });

  it('кожна команда має людський напис', () => {
    expect(commandLabel({ kind: 'swap-ends' })).toContain('Поміняй');
    expect(commandLabel({ kind: 'remove', cell: '🔴' })).toContain('🔴');
    expect(commandLabel({ kind: 'append', cell: '🟢' })).toContain('🟢');
  });
});

describe('виконання по черзі', () => {
  it('applyAll = послідовне застосування (звірка вручну, крок за кроком)', () => {
    const start: State = ['🔴', '🔵', '🟢'];
    const cmds = [{ kind: 'swap-ends' } as const, { kind: 'remove', cell: '🔵' } as const];
    // руками: 🔴🔵🟢 → swap → 🟢🔵🔴 → remove 🔵 → 🟢🔴
    expect(applyAll(start, cmds)).toEqual(['🟢', '🔴']);
  });

  it('порядок команд ВАЖИТЬ — це суть алгоритму', () => {
    // ⚠️ перший варіант цього тесту був хибний: remove+swap дають однаковий
    // результат у будь-якому порядку, тож він нічого не доводив.
    const start: State = ['🔴', '🔵', '🟢'];
    // append→swap: 🔴🔵🟢🟡 → 🟡🔵🟢🔴
    const a = applyAll(start, [{ kind: 'append', cell: '🟡' }, { kind: 'swap-ends' }]);
    // swap→append: 🟢🔵🔴 → 🟢🔵🔴🟡
    const b = applyAll(start, [{ kind: 'swap-ends' }, { kind: 'append', cell: '🟡' }]);
    expect(a).toEqual(['🟡', '🔵', '🟢', '🔴']);
    expect(b).toEqual(['🟢', '🔵', '🔴', '🟡']);
    expect(eq(a, b)).toBe(false);
  });

  it('ряд ніколи не порожніє під час виконання (дитина не дивиться в порожнечу)', () => {
    for (const band of BANDS) {
      for (let seed = 1; seed <= 80; seed++) {
        const t = buildTask(band, createRng(seed));
        for (const s of trace(t.start, t.commands)) {
          expect(s.length, `${band}/${seed}: порожній ряд`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('trace дає стан після КОЖНОГО кроку (для показу розв’язку)', () => {
    const t = trace(['🔴', '🔵'], [{ kind: 'reverse' }, { kind: 'append', cell: '🟢' }]);
    expect(t).toHaveLength(3); // початок + 2 кроки
    expect(t[0]).toEqual(['🔴', '🔵']);
    expect(t[2]).toEqual(['🔵', '🔴', '🟢']);
  });
});

describe('завдання', () => {
  it('правильна відповідь = чесне виконання команд (звірено незалежно від buildTask)', () => {
    for (const band of BANDS) {
      for (let seed = 1; seed <= 60; seed++) {
        const t = buildTask(band, createRng(seed));
        expect(t.correct).toEqual(applyAll(t.start, t.commands));
      }
    }
  });

  it('правильна серед варіантів; дублів немає', () => {
    for (const band of BANDS) {
      for (let seed = 1; seed <= 60; seed++) {
        const t = buildUsableTask(band, createRng(seed));
        expect(t.options.map(key)).toContain(key(t.correct));
        const keys = t.options.map(key);
        expect(new Set(keys).size, `дублі: ${keys}`).toBe(keys.length);
      }
    }
  });

  it('довжина алгоритму й набір команд зростають від L1 до L4', () => {
    const steps = BANDS.map((b) => configFor(b).steps);
    const kinds = BANDS.map((b) => configFor(b).kinds.length);
    for (let i = 1; i < BANDS.length; i++) {
      expect(steps[i]).toBeGreaterThanOrEqual(steps[i - 1]);
      expect(kinds[i]).toBeGreaterThanOrEqual(kinds[i - 1]);
    }
  });

  it('«прибери X» завжди прибирає те, що справді є в ряду (команда не порожня)', () => {
    for (const band of BANDS) {
      for (let seed = 1; seed <= 60; seed++) {
        const t = buildTask(band, createRng(seed));
        let cur = t.start;
        for (const c of t.commands) {
          if (c.kind === 'remove') {
            expect(cur, `${band}/${seed}: прибирає те, чого нема`).toContain(c.cell);
          }
          cur = applyCommand(cur, c);
        }
      }
    }
  });

  it('усі клітинки — з дозволеного набору', () => {
    for (const band of BANDS) {
      const t = buildTask(band, createRng(3));
      for (const c of [...t.start, ...t.correct]) expect(CELLS).toContain(c);
    }
  });

  it('buildUsableTask дає щонайменше 3 варіанти (не завдання з однією відповіддю)', () => {
    for (const band of BANDS) {
      for (let seed = 1; seed <= 60; seed++) {
        expect(buildUsableTask(band, createRng(seed)).options.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('детермінований за seed (не стрибає між ре-рендерами — баг Q2)', () => {
    const a = buildTask('L3', createRng(11));
    const b = buildTask('L3', createRng(11));
    expect(a.options.map(key)).toEqual(b.options.map(key));
  });
});
