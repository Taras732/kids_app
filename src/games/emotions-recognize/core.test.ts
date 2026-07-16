import { describe, it, expect } from 'vitest';
import {
  EMOTIONS,
  QUADRANTS,
  QUADRANT_IDS,
  kindFor,
  buildTask,
  buildRounds,
  createRng,
  type TaskKind,
} from './core';

const KINDS: TaskKind[] = ['energy', 'quadrant', 'word'];

describe('карта настрою — дві осі, а не ярлик (EP3)', () => {
  it('чотири квадранти покривають усі комбінації осей, без повторів', () => {
    const combos = QUADRANT_IDS.map((id) => `${QUADRANTS[id].energy}-${QUADRANTS[id].pleasant}`);
    expect(new Set(combos).size).toBe(4);
    expect(combos).toContain('high-yes');
    expect(combos).toContain('high-no');
    expect(combos).toContain('low-yes');
    expect(combos).toContain('low-no');
  });

  it('кожна емоція має місце на карті; у кожному квадранті ≥2 слова (щоб уточнення мало сенс)', () => {
    for (const e of EMOTIONS) {
      expect(QUADRANT_IDS, `${e.label}: невідомий квадрант`).toContain(e.quadrant);
    }
    for (const id of QUADRANT_IDS) {
      const inQ = EMOTIONS.filter((e) => e.quadrant === id);
      expect(inQ.length, `квадрант ${id}: замало слів`).toBeGreaterThanOrEqual(2);
    }
  });

  it('складність веде від осі до слова (а не ігнорується, як раніше)', () => {
    expect(kindFor(1)).toBe('energy');
    expect(kindFor(2)).toBe('quadrant');
    expect(kindFor(3)).toBe('word');
  });
});

describe('завдання', () => {
  it('правильна відповідь завжди серед варіантів; дублів немає', () => {
    for (const kind of KINDS) {
      for (const e of EMOTIONS) {
        for (let seed = 1; seed <= 30; seed++) {
          const t = buildTask('t', kind, e, createRng(seed));
          expect(t.options).toContain(t.correct);
          expect(new Set(t.options).size, `дублі: ${t.options}`).toBe(t.options.length);
        }
      }
    }
  });

  it('енергія: відповідь збігається з віссю квадранта емоції', () => {
    for (const e of EMOTIONS) {
      const t = buildTask('t', 'energy', e, createRng(1));
      const expected = QUADRANTS[e.quadrant].energy === 'high' ? 'Багато сили' : 'Мало сили';
      expect(t.correct).toBe(expected);
    }
  });

  it('квадрант: відповідь — опис саме того квадранта, де живе емоція', () => {
    for (const e of EMOTIONS) {
      const t = buildTask('t', 'quadrant', e, createRng(1));
      expect(t.correct).toBe(QUADRANTS[e.quadrant].label);
      expect(t.options).toHaveLength(4); // усі чотири місця карти
    }
  });

  it('слово: серед варіантів Є сусід із ТОГО САМОГО квадранта (там помилка змістовна)', () => {
    for (const e of EMOTIONS) {
      const t = buildTask('t', 'word', e, createRng(1));
      const sameQ = EMOTIONS.filter((x) => x.quadrant === e.quadrant && x.label !== e.label).map((x) => x.label);
      expect(sameQ.some((s) => t.options.includes(s)), `${e.label}: нема сусіда по квадранту`).toBe(true);
    }
  });
});

describe('раунди спроби', () => {
  it('емоції НЕ повторюються (раніше та сама могла випасти всі 5 разів)', () => {
    for (const kind of KINDS) {
      for (let seed = 1; seed <= 50; seed++) {
        const rounds = buildRounds(kind, 5, createRng(seed));
        const labels = rounds.map((r) => r.emotion.label);
        expect(new Set(labels).size, `повтори: ${labels}`).toBe(labels.length);
      }
    }
  });

  it('детерміновано за seed (варіанти не стрибають — баг Q2)', () => {
    const a = buildRounds('word', 5, createRng(7));
    const b = buildRounds('word', 5, createRng(7));
    expect(a.map((r) => r.options)).toEqual(b.map((r) => r.options));
  });

  it('просити більше раундів, ніж є емоцій, — не дублює', () => {
    const rounds = buildRounds('energy', 99, createRng(1));
    expect(rounds.length).toBeLessThanOrEqual(EMOTIONS.length);
    expect(new Set(rounds.map((r) => r.emotion.label)).size).toBe(rounds.length);
  });
});
