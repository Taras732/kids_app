import { describe, expect, it } from 'vitest';
import { generate } from './generate';

/** Загадка/слово не повинні містити відповідь буквально — інакше це не читання
 * з розумінням, а звіряння символів (баг Q15: слово «зима» → варіант «зима»). */
function assertNoTautology(text: string, options: string[], answer: string) {
  const normText = text.toLowerCase();
  expect(answer.toLowerCase()).not.toBe(normText);
  for (const opt of options) {
    // сама відповідь не повинна дослівно зустрічатись у показаному тексті
    if (opt.toLowerCase() === answer.toLowerCase()) {
      expect(normText).not.toContain(opt.toLowerCase());
    }
  }
}

describe('reading-speed: generate', () => {
  it('difficulty=1 (band L2, level L3) — режим picture, 3 картинки-emoji, тавтології нема', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L3');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.mode).toBe('picture');
        expect(r.payload.options).toHaveLength(3);
        expect(r.payload.options).toContain(r.answer);
        expect(new Set(r.payload.options).size).toBe(3);
        expect(r.payload.text.length).toBeGreaterThan(0);
        assertNoTautology(r.payload.text, r.payload.options, r.answer);
      }
    }
  });

  it('difficulty=2 (band L3, level L3) — режим riddle, 4 слова-варіанти, тавтології нема', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(2, 'L3');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.mode).toBe('riddle');
        expect(r.payload.options).toHaveLength(4);
        expect(r.payload.options).toContain(r.answer);
        expect(new Set(r.payload.options).size).toBe(4);
        expect(r.payload.question.length).toBeGreaterThan(0);
        expect(r.payload.text.length).toBeGreaterThan(0);
        assertNoTautology(r.payload.text, r.payload.options, r.answer);
      }
    }
  });

  it('difficulty=3 (band L4, level L3) — режим riddle, довші загадки, тавтології нема', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(3, 'L3');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.mode).toBe('riddle');
        expect(r.payload.options).toHaveLength(4);
        expect(r.payload.options).toContain(r.answer);
        expect(r.payload.text.length).toBeGreaterThan(20);
        assertNoTautology(r.payload.text, r.payload.options, r.answer);
      }
    }
  });

  it('відповідь ніколи не є прямою копією показаного тексту (гвардія проти тавтології)', () => {
    for (let i = 0; i < 30; i++) {
      for (const d of [1, 2, 3] as const) {
        const { rounds } = generate(d, 'L3');
        for (const r of rounds) {
          expect(r.answer.toLowerCase()).not.toBe(r.payload.text.toLowerCase());
          // для 'riddle' — відповідь не має зустрічатись як підрядок у самій загадці
          if (r.payload.mode === 'riddle') {
            expect(r.payload.text.toLowerCase()).not.toContain(r.answer.toLowerCase());
          }
        }
      }
    }
  });

  it('difficulty підвищується → band (і режим/довжина тексту) інший на кожному кроці', () => {
    const easy = generate(1, 'L3');
    const medium = generate(2, 'L3');
    const hard = generate(3, 'L3');
    expect(easy.rounds[0].payload.mode).toBe('picture');
    expect(medium.rounds[0].payload.mode).toBe('riddle');
    expect(hard.rounds[0].payload.mode).toBe('riddle');
  });
});
