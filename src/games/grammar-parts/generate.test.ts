import { describe, expect, it } from 'vitest';
import { generate } from './generate';

const POS_SET = new Set(['Іменник', 'Дієслово', 'Прикметник']);

describe('grammar-parts: generate', () => {
  for (const difficulty of [1, 2, 3] as const) {
    it(`difficulty=${difficulty} — 5 раундів, target є підрядком sentence, options = усі 3 частини мови`, () => {
      for (let i = 0; i < 20; i++) {
        const { rounds } = generate(difficulty, 'L3');
        expect(rounds).toHaveLength(5);
        for (const r of rounds) {
          expect(r.payload.sentence).toContain(r.payload.target);
          expect(r.payload.options).toHaveLength(3);
          expect(new Set(r.payload.options)).toEqual(POS_SET);
          expect(POS_SET.has(r.answer)).toBe(true);
          expect(r.payload.options).toContain(r.answer);
        }
      }
    });
  }

  it('band L4 (difficulty=3) містить довші речення, ніж band L2 (difficulty=1)', () => {
    const easy = generate(1, 'L3');
    const hard = generate(3, 'L3');
    const avgLen = (rounds: typeof easy.rounds) =>
      rounds.reduce((sum, r) => sum + r.payload.sentence.length, 0) / rounds.length;
    expect(avgLen(hard.rounds)).toBeGreaterThan(avgLen(easy.rounds));
  });
});
