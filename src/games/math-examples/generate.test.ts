import { describe, expect, it } from 'vitest';
import { bandConfigFor, generate } from './generate';

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
