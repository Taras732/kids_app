import { beforeEach, describe, expect, it } from 'vitest';
import { generate, __resetDecksForTests, POOL_BY_BAND, type Entry } from './generate';
import { GRADE_BANDS } from '../types';

const POS_SET = new Set(['Іменник', 'Дієслово', 'Прикметник']);

beforeEach(() => {
  __resetDecksForTests();
});

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

describe('grammar-parts: унікальність раундів у межах однієї спроби', () => {
  for (const difficulty of [1, 2, 3] as const) {
    it(`difficulty=${difficulty} — жодного дубля (sentence+target) серед 5 раундів, у 50 прогонах`, () => {
      for (let i = 0; i < 50; i++) {
        const { rounds } = generate(difficulty, 'L3');
        const keys = rounds.map((r) => `${r.payload.sentence}|${r.payload.target}`);
        expect(new Set(keys).size).toBe(keys.length);
      }
    });
  }
});

describe('grammar-parts: без повторів між послідовними спробами в межах сесії (баг 16.07)', () => {
  it('generate() викликаний поспіль (як "Зіграти ще раз"/"Далі складніше") не показує те саме речення, доки не пройдено весь банк band', () => {
    for (const difficulty of [1, 2, 3] as const) {
      __resetDecksForTests();
      const bandSize = POOL_BY_BAND[difficulty === 1 ? 'L2' : difficulty === 2 ? 'L3' : 'L4'].length;
      const attemptsPerBag = Math.floor(bandSize / 5); // скільки повних спроб влазить у мішок без повтору

      const seenInBag = new Set<string>();
      for (let attempt = 0; attempt < attemptsPerBag; attempt++) {
        const { rounds } = generate(difficulty, 'L3');
        for (const r of rounds) {
          const key = `${r.payload.sentence}|${r.payload.target}`;
          // Той самий ключ не повинен зустрітись двічі, доки мішок (bandSize записів) не вичерпано.
          expect(seenInBag.has(key)).toBe(false);
          seenInBag.add(key);
        }
      }
    }
  });

  it('після вичерпання мішка колода тасується наново і продовжує видавати повні 5-раундові спроби', () => {
    const bandSize = POOL_BY_BAND.L3.length;
    const totalAttempts = Math.ceil((bandSize * 2.5) / 5); // прогнати кілька повних циклів мішка
    for (let i = 0; i < totalAttempts; i++) {
      const { rounds } = generate(2, 'L3');
      expect(rounds).toHaveLength(5);
      expect(new Set(rounds.map((r) => r.payload.target)).size).toBe(5);
    }
  });
});

describe('grammar-parts: структурна коректність банку слів', () => {
  const bands = ['L0', 'L1', 'L2', 'L3', 'L4'] as const;

  for (const band of bands) {
    it(`band ${band} — кожен запис: target є підрядком sentence, pos ∈ {Іменник, Дієслово, Прикметник}`, () => {
      for (const e of POOL_BY_BAND[band]) {
        expect(e.sentence).toContain(e.target);
        expect(POS_SET.has(e.pos)).toBe(true);
      }
    });
  }

  it('пул кожного унікального band-масиву не містить дублів (sentence+target)', () => {
    // L0/L1/L2 різні GradeBand-ключі, але фізично той самий масив — де-дуп рахуємо по унікальних масивах.
    const uniqueArrays = new Set<Entry[]>(GRADE_BANDS.map((b) => POOL_BY_BAND[b]));
    for (const pool of uniqueArrays) {
      const keys = pool.map((e) => `${e.sentence}|${e.target}`);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it('розмір банку по band (документація чисел для звіту)', () => {
    expect(POOL_BY_BAND.L2).toHaveLength(18);
    expect(POOL_BY_BAND.L3).toHaveLength(18);
    expect(POOL_BY_BAND.L4).toHaveLength(18);
  });
});
