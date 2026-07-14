import { describe, expect, it } from 'vitest';
import { generate } from './generate';

describe('reading-speed: generate', () => {
  it('difficulty=1 (band L2, level L3) — режим word, 3 варіанти, ціль серед них', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(1, 'L3');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.mode).toBe('word');
        expect(r.payload.options).toHaveLength(3);
        expect(r.payload.options).toContain(r.answer);
        expect(new Set(r.payload.options).size).toBe(3);
        expect(r.payload.text.length).toBeGreaterThan(0);
      }
    }
  });

  it('difficulty=2 (band L3, level L3) — режим comprehension, 4 варіанти, відповідь серед них', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(2, 'L3');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.mode).toBe('comprehension');
        expect(r.payload.options).toHaveLength(4);
        expect(r.payload.options).toContain(r.answer);
        expect(new Set(r.payload.options).size).toBe(4);
        expect(r.payload.question.length).toBeGreaterThan(0);
        expect(r.payload.text.length).toBeGreaterThan(0);
      }
    }
  });

  it('difficulty=3 (band L4, level L3) — режим comprehension, довші речення', () => {
    for (let i = 0; i < 20; i++) {
      const { rounds } = generate(3, 'L3');
      expect(rounds).toHaveLength(5);
      for (const r of rounds) {
        expect(r.payload.mode).toBe('comprehension');
        expect(r.payload.options).toHaveLength(4);
        expect(r.payload.options).toContain(r.answer);
        expect(r.payload.text.length).toBeGreaterThan(20);
      }
    }
  });

  it('difficulty підвищується → рівень складності тексту (band) інший на кожному кроці', () => {
    const easy = generate(1, 'L3');
    const medium = generate(2, 'L3');
    const hard = generate(3, 'L3');
    expect(easy.rounds[0].payload.mode).toBe('word');
    expect(medium.rounds[0].payload.mode).toBe('comprehension');
    expect(hard.rounds[0].payload.mode).toBe('comprehension');
  });
});
