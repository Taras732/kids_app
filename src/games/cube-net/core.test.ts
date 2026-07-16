import { describe, it, expect } from 'vitest';
import {
  FACE_IDS,
  STRIP_IDS,
  OPPOSITE,
  oppositeFace,
  areOpposite,
  generateNet,
  buildTask,
  createRng,
  optionsCountFor,
  askableFaces,
  FACE_MARKS,
} from './core';

describe('геометрія куба — протилежні грані', () => {
  it('кожна грань має рівно одну протилежну, і це взаємно', () => {
    for (const f of FACE_IDS) {
      const o = oppositeFace(f);
      expect(oppositeFace(o), `${f}→${o}, але назад не сходиться`).toBe(f);
    }
  });

  it('грань не може бути протилежною сама собі', () => {
    for (const f of FACE_IDS) {
      expect(oppositeFace(f)).not.toBe(f);
    }
  });

  it('6 граней утворюють рівно 3 пари', () => {
    const pairs = new Set(FACE_IDS.map((f) => [f, oppositeFace(f)].sort().join('-')));
    expect(pairs.size).toBe(3);
  });

  it('у смузі протилежні стоять ЧЕРЕЗ ОДНУ (a↔c, b↔d) — це і є правило уроку', () => {
    expect(OPPOSITE.a).toBe('c');
    expect(OPPOSITE.b).toBe('d');
    // сусіди в смузі НЕ протилежні
    expect(areOpposite('a', 'b')).toBe(false);
    expect(areOpposite('b', 'c')).toBe(false);
  });

  it('верх і низ протилежні одне одному', () => {
    expect(OPPOSITE.top).toBe('bottom');
    expect(OPPOSITE.bottom).toBe('top');
  });

  it('жодна грань смуги не протилежна верху чи низу', () => {
    for (const s of STRIP_IDS) {
      expect(areOpposite(s, 'top')).toBe(false);
      expect(areOpposite(s, 'bottom')).toBe(false);
    }
  });
});

describe('розгортка', () => {
  it('усі 6 граней мають РІЗНІ знаки (інакше відповідь неоднозначна)', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const net = generateNet(createRng(seed));
      const marks = FACE_IDS.map((f) => net[f]);
      expect(new Set(marks).size, `дублі знаків: ${marks}`).toBe(6);
      marks.forEach((m) => expect(FACE_MARKS).toContain(m));
    }
  });

  it('детермінована за seed (варіанти не стрибають — баг Q2)', () => {
    expect(generateNet(createRng(42))).toEqual(generateNet(createRng(42)));
  });
});

describe('завдання', () => {
  const bands = ['L3', 'L4'] as const;

  it('правильна відповідь — це справді знак протилежної грані', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const net = generateNet(createRng(seed));
      for (const ask of FACE_IDS) {
        const t = buildTask('t', net, ask, 4, createRng(seed));
        expect(t.correct).toBe(net[oppositeFace(ask)]);
      }
    }
  });

  it('серед варіантів є правильний, дублів немає', () => {
    for (const band of bands) {
      for (let seed = 1; seed <= 60; seed++) {
        const net = generateNet(createRng(seed));
        for (const ask of askableFaces(band)) {
          const t = buildTask('t', net, ask, optionsCountFor(band), createRng(seed));
          expect(t.options).toContain(t.correct);
          expect(new Set(t.options).size).toBe(t.options.length);
        }
      }
    }
  });

  it('дистрактори — знаки СУСІДНІХ граней, ніколи не сама питана грань', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const net = generateNet(createRng(seed));
      for (const ask of FACE_IDS) {
        const t = buildTask('t', net, ask, 4, createRng(seed));
        // знак питаної грані не може бути варіантом відповіді
        expect(t.options).not.toContain(net[ask]);
        // кожен неправильний варіант — знак грані, що НЕ протилежна питаній
        for (const opt of t.options.filter((o) => o !== t.correct)) {
          const face = FACE_IDS.find((f) => net[f] === opt)!;
          expect(areOpposite(ask, face), `${opt} насправді протилежний`).toBe(false);
        }
      }
    }
  });

  it('L3 питає лише про смугу; L4 — про всі грані', () => {
    expect(askableFaces('L3')).toEqual(STRIP_IDS);
    expect(askableFaces('L4')).toEqual(FACE_IDS);
    expect(optionsCountFor('L3')).toBe(3);
    expect(optionsCountFor('L4')).toBe(4);
  });
});
