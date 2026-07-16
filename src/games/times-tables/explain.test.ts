import { describe, it, expect } from 'vitest';
import { explainMultiplication } from './index';
import type { Round } from '../types';
import type { Payload } from './generate';

const round = (a: number, b: number): Round<Payload, number> => ({
  id: 'r',
  payload: { a, b },
  answer: a * b,
});

describe('EP1 — пояснення множення правдиве, а не просто «є»', () => {
  it('ланцюг додавання справді дає правильну відповідь (звірка арифметики)', () => {
    for (let a = 2; a <= 9; a++) {
      for (let b = 2; b <= 9; b++) {
        const e = explainMultiplication(round(a, b), 0)!;
        const chain = e.steps.find((s) => s.includes('+'));
        if (!chain) continue; // довгі ланцюги не розписуємо
        const sum = chain
          .split('=')[0]
          .split('+')
          .map((x) => Number(x.trim()))
          .reduce((s, x) => s + x, 0);
        expect(sum, `${a}×${b}: ланцюг не сходиться`).toBe(a * b);
      }
    }
  });

  it('множення показане як повторюване додавання, не як факт для зубріння', () => {
    const e = explainMultiplication(round(3, 8), 0)!;
    expect(e.steps[0]).toContain('3 рази по 8'); // менший множник = кількість доданків
    expect(e.steps.join(' ')).toContain('24');
  });

  it('розпізнає «додав замість помножити»', () => {
    const e = explainMultiplication(round(7, 8), 15)!; // 7+8
    expect(e.why).toContain('додавання');
    expect(e.why).toContain('15');
  });

  it('розпізнає промах на один множник (класика: 7×8=54 замість 56)', () => {
    const less = explainMultiplication(round(7, 8), 48)!; // 56 - 8
    expect(less.why).toContain('менше');
    const more = explainMultiplication(round(7, 8), 64)!; // 56 + 8
    expect(more.why).toContain('більше');
  });

  it('невідома помилка → пояснення без вигаданої причини (лише «як правильно»)', () => {
    const e = explainMultiplication(round(7, 8), 99)!;
    expect(e.steps.length).toBeGreaterThan(0);
    expect(e.why).toBeUndefined(); // не вигадуємо, чому саме 99
  });

  it('кроки завжди непорожні для всієї таблиці', () => {
    for (let a = 2; a <= 12; a++) {
      for (let b = 2; b <= 12; b++) {
        const e = explainMultiplication(round(a, b), 0)!;
        expect(e.steps.every((s) => s.trim().length > 0)).toBe(true);
      }
    }
  });
});
