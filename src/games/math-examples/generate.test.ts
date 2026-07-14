import { describe, expect, it } from 'vitest';
import { bandConfigFor, classBandConfigFor, generate } from './generate';

describe('math-examples: bandConfigFor (D5 шкала L0-L4, два треки)', () => {
  it('L0-профіль: L0 найлегше (лише +), L4 найважче (max та кількість дій не спадають)', () => {
    expect(bandConfigFor('L0', 1)).toEqual({ ops: ['+'], max: 10 });
    expect(bandConfigFor('L0', 1).ops).toHaveLength(1);
    expect(bandConfigFor('L0', 2).ops.length).toBeGreaterThanOrEqual(bandConfigFor('L0', 1).ops.length);
    expect(bandConfigFor('L0', 3).max).toBeGreaterThanOrEqual(bandConfigFor('L0', 1).max);
  });

  it('L3-профіль: зберігає попередню відповідність difficulty→ops/max', () => {
    expect(bandConfigFor('L3', 1)).toEqual({ ops: ['×', '+', '−'], max: 100 });
    expect(bandConfigFor('L3', 2)).toEqual({ ops: ['×', '÷', '+', '−'], max: 100 });
    expect(bandConfigFor('L3', 3)).toEqual({ ops: ['+', '−', '×'], max: 100 });
  });

  it('стик L2: найскладніший L0-профіль і найлегший L3-профіль — різний зміст, той самий band', () => {
    const l0Top = bandConfigFor('L0', 3);
    const l3Bottom = bandConfigFor('L3', 1);
    expect(l0Top).not.toEqual(l3Bottom);
    expect(l3Bottom.max).toBeGreaterThanOrEqual(l0Top.max);
  });
});

describe('math-examples: generate', () => {
  it('L0-профіль difficulty=1 — лише додавання, сума не перевищує max=10', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L0');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.op).toBe('+');
        expect(r.payload.correct).toBe(r.payload.a + r.payload.b);
        expect(r.payload.correct).toBeLessThanOrEqual(10);
      }
    }
  });

  it('L3-профіль difficulty=2 — може містити ×/÷ у межах таблиці 1..10', () => {
    let sawMultiplyOrDivide = false;
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(2, 'L3');
      for (const r of rounds) {
        expect(['×', '÷', '+', '−']).toContain(r.payload.op);
        if (r.payload.op === '×' || r.payload.op === '÷') sawMultiplyOrDivide = true;
        if (r.payload.op === '×') expect(r.payload.correct).toBe(r.payload.a * r.payload.b);
        if (r.payload.op === '÷') expect(r.payload.correct).toBe(r.payload.a / r.payload.b);
      }
    }
    expect(sawMultiplyOrDivide).toBe(true);
  });
});

describe('math-examples: classBandConfigFor (G2b, обрій за класом)', () => {
  it('обрій зростає grade1 < grade2 < grade3 == grade4 за max, ops не спадають', () => {
    expect(classBandConfigFor('grade1', 3).max).toBe(20);
    expect(classBandConfigFor('grade2', 3).max).toBe(100);
    expect(classBandConfigFor('grade3', 3).max).toBe(1000);
    expect(classBandConfigFor('grade4', 3).max).toBe(1000);

    const order = ['grade1', 'grade2', 'grade3', 'grade4'] as const;
    for (let i = 1; i < order.length; i++) {
      expect(classBandConfigFor(order[i], 3).max).toBeGreaterThanOrEqual(classBandConfigFor(order[i - 1], 3).max);
    }
  });

  it('grade1 — лише додавання на всіх difficulty (не як для малят, але без ×÷ у 1 класі)', () => {
    expect(classBandConfigFor('grade1', 1).ops).toEqual(['+']);
    expect(classBandConfigFor('grade1', 3).ops.every((o) => o === '+' || o === '−')).toBe(true);
  });

  it('grade3 difficulty=1 не має ÷, а grade4 difficulty=1 вже має повний набір дій (складніше при тому самому max)', () => {
    expect(classBandConfigFor('grade3', 1).ops).not.toContain('÷');
    expect(classBandConfigFor('grade4', 1).ops).toEqual(expect.arrayContaining(['+', '−', '×', '÷']));
  });

  it('grade4 має ширшу таблицю множення/ділення (tableMax=12) за grade2/grade3 (tableMax=10)', () => {
    expect(classBandConfigFor('grade2', 2).tableMax).toBe(10);
    expect(classBandConfigFor('grade3', 2).tableMax).toBe(10);
    expect(classBandConfigFor('grade4', 2).tableMax).toBe(12);
  });
});

describe('math-examples: generate — класовий масштаб (G2b, classLevel)', () => {
  it('grade1 — сума/різниця не перевищує 20, лише +/-', () => {
    for (let i = 0; i < 25; i++) {
      const { rounds } = generate(3, 'L3', 'grade1');
      for (const r of rounds) {
        expect(['+', '−']).toContain(r.payload.op);
        expect(r.payload.correct).toBeLessThanOrEqual(20);
        expect(r.payload.correct).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('grade3 — числа в межах 1000, коректна відповідь для кожної дії', () => {
    for (let i = 0; i < 25; i++) {
      const { rounds } = generate(2, 'L3', 'grade3');
      for (const r of rounds) {
        if (r.payload.op === '+') expect(r.payload.correct).toBe(r.payload.a + r.payload.b);
        if (r.payload.op === '−') expect(r.payload.correct).toBe(r.payload.a - r.payload.b);
        if (r.payload.op === '×') expect(r.payload.correct).toBe(r.payload.a * r.payload.b);
        if (r.payload.op === '÷') expect(r.payload.correct).toBe(r.payload.a / r.payload.b);
        if (r.payload.op === '+' || r.payload.op === '−') expect(r.payload.correct).toBeLessThanOrEqual(1000);
      }
    }
  });

  it('grade4 — множники таблиці іноді перевищують 10 (до 12), на відміну від grade3', () => {
    let sawAbove10 = false;
    for (let i = 0; i < 60; i++) {
      const { rounds } = generate(1, 'L3', 'grade4');
      for (const r of rounds) {
        if (r.payload.op === '×' || r.payload.op === '÷') {
          if (r.payload.a > 10 || r.payload.b > 10) sawAbove10 = true;
          expect(r.payload.a).toBeLessThanOrEqual(144); // 12*12
          expect(r.payload.b).toBeLessThanOrEqual(12);
        }
      }
    }
    expect(sawAbove10).toBe(true);
  });

  it('classLevel не задано — поведінка ідентична попередній (fallback через bandConfigFor)', () => {
    const withUndefined = generate(2, 'L3', undefined);
    const withoutParam = generate(2, 'L3');
    for (const r of [...withUndefined.rounds, ...withoutParam.rounds]) {
      expect(['×', '÷', '+', '−']).toContain(r.payload.op);
    }
  });
});
