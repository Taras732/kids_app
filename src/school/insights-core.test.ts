import { describe, it, expect } from 'vitest';
import {
  buildParentInsight,
  skillStats,
  MIN_ATTEMPTS_FOR_INSIGHT,
  STRUGGLING_ACCURACY,
  type InsightsInput,
} from './insights-core';
import type { Attempt, Skill, SkillMastery, SkillPrerequisite } from './types';

function skill(id: string, sort: number, over: Partial<Skill> = {}): Skill {
  return {
    id,
    subject: 'math',
    strand: 'Дії з числами',
    topic: null,
    title: id,
    grade_band: 'L2',
    mastery_threshold: 0.8,
    review_interval_days: 3,
    sort,
    created_at: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

function mastery(skillId: string, status: SkillMastery['status'], over: Partial<SkillMastery> = {}): SkillMastery {
  return {
    profile_id: 'p1',
    skill_id: skillId,
    mastery: status === 'mastered' ? 0.9 : 0.4,
    status,
    last_practiced_at: null,
    updated_at: '2026-07-01T00:00:00.000Z',
    ...over,
  };
}

function attempt(skillId: string | null, correct: number, total: number): Attempt {
  return {
    id: `a-${Math.random()}`,
    profile_id: 'p1',
    skill_id: skillId,
    game_id: 'g1',
    difficulty: '1',
    correct,
    total,
    duration_sec: null,
    created_at: '2026-07-14T10:00:00.000Z',
  };
}

const base = (over: Partial<InsightsInput> = {}): InsightsInput => ({
  skills: [],
  mastery: [],
  prereqs: [],
  attempts: [],
  gamesBySkill: new Map(),
  ...over,
});

describe('skillStats', () => {
  it('рахує успішність по навичці; спроби без skill_id ігнорує', () => {
    const stats = skillStats([attempt('s1', 3, 10), attempt('s1', 5, 10), attempt(null, 10, 10)]);
    expect(stats.size).toBe(1);
    expect(stats.get('s1')!.attempts).toBe(2);
    expect(stats.get('s1')!.accuracy).toBeCloseTo(0.4);
  });

  it('total=0 не ділить на нуль', () => {
    expect(() => skillStats([attempt('s1', 0, 0)])).not.toThrow();
  });
});

describe('чесність: не вигадувати діагноз', () => {
  it('замало спроб → кажемо прямо, що висновки зарано (а не вигадуємо проблему)', () => {
    const insight = buildParentInsight(base({ attempts: [attempt('s1', 0, 10)] }));
    expect(insight.kind).toBe('not-enough-data');
    expect(insight.why).toContain('зіграла');
    expect(insight.actions.length).toBeGreaterThan(0);
  });

  it('поріг: рівно MIN_ATTEMPTS_FOR_INSIGHT спроб — уже можна робити висновок', () => {
    const attempts = Array.from({ length: MIN_ATTEMPTS_FOR_INSIGHT }, () => attempt('s1', 1, 10));
    const insight = buildParentInsight(
      base({ skills: [skill('s1', 10)], mastery: [mastery('s1', 'frontier')], attempts }),
    );
    expect(insight.kind).not.toBe('not-enough-data');
  });

  it('одна невдала спроба по навичці — ще не діагноз (потрібно ≥2)', () => {
    const insight = buildParentInsight(
      base({
        skills: [skill('s1', 10), skill('s2', 20)],
        mastery: [mastery('s1', 'mastered'), mastery('s2', 'mastered')],
        // одна погана спроба по s1 + дві добрі по s2
        attempts: [attempt('s1', 1, 10), attempt('s2', 9, 10), attempt('s2', 10, 10)],
      }),
    );
    expect(insight.kind).not.toBe('struggling-skill');
  });
});

describe('діагноз: прогалина в передумові — найцінніший', () => {
  const skills = [skill('base', 10, { title: 'Додавання до 20' }), skill('hard', 20, { title: 'Множення' })];
  const prereqs: SkillPrerequisite[] = [{ skill_id: 'hard', prerequisite_id: 'base' }];
  // ≥3 спроби загалом (щоб узагалі робити висновок) і ≥2 по навичці (щоб назвати її проблемною)
  const attempts = [attempt('hard', 2, 10), attempt('hard', 3, 10), attempt('hard', 2, 10)];

  it('якщо передумова не засвоєна — вказує НА НЕЇ, а не на саму тему', () => {
    const insight = buildParentInsight(
      base({ skills, prereqs, attempts, mastery: [mastery('base', 'frontier'), mastery('hard', 'frontier')] }),
    );
    expect(insight.kind).toBe('prerequisite-gap');
    expect(insight.skill?.id).toBe('base');
    expect(insight.title).toContain('Множення'); // «справа не в темі Множення»
    expect(insight.why).toContain('Додавання до 20');
  });

  it('якщо передумова ЗАСВОЄНА — це вже проблема самої теми, не фундаменту', () => {
    const insight = buildParentInsight(
      base({ skills, prereqs, attempts, mastery: [mastery('base', 'mastered'), mastery('hard', 'frontier')] }),
    );
    expect(insight.kind).toBe('struggling-skill');
    expect(insight.skill?.id).toBe('hard');
  });

  it('серед кількох прогалин обирає найранішу за програмою (найфундаментальнішу)', () => {
    const many = [skill('early', 5, { title: 'Лічба' }), skill('mid', 15, { title: 'Розряди' }), skill('hard', 20)];
    const edges: SkillPrerequisite[] = [
      { skill_id: 'hard', prerequisite_id: 'mid' },
      { skill_id: 'hard', prerequisite_id: 'early' },
    ];
    const insight = buildParentInsight(
      base({
        skills: many,
        prereqs: edges,
        attempts,
        mastery: [mastery('early', 'frontier'), mastery('mid', 'frontier'), mastery('hard', 'frontier')],
      }),
    );
    expect(insight.skill?.id).toBe('early');
  });
});

describe('порада — завжди конкретна дія', () => {
  it('дає до 3 дій, серед них гра, якщо вона є', () => {
    const insight = buildParentInsight(
      base({
        skills: [skill('s1', 10, { title: 'Множення' })],
        mastery: [mastery('s1', 'frontier')],
        attempts: [attempt('s1', 1, 10), attempt('s1', 2, 10), attempt('s1', 1, 10)],
        gamesBySkill: new Map([['s1', ['times-tables', 'math-examples']]]),
      }),
    );
    expect(insight.kind).toBe('struggling-skill'); // саме той шлях, а не «замало даних»
    expect(insight.actions.length).toBeLessThanOrEqual(3);
    expect(insight.actions.some((a) => a.gameId === 'times-tables')).toBe(true);
    // офлайн-дія є завжди — навіть без гри
    expect(insight.actions.some((a) => !a.gameId)).toBe(true);
  });

  it('немає гри для навички → порада все одно є (офлайн)', () => {
    const insight = buildParentInsight(
      base({
        skills: [skill('s1', 10)],
        mastery: [mastery('s1', 'frontier')],
        attempts: [attempt('s1', 1, 10), attempt('s1', 1, 10), attempt('s1', 2, 10)],
        gamesBySkill: new Map(),
      }),
    );
    expect(insight.kind).toBe('struggling-skill');
    expect(insight.actions.length).toBeGreaterThan(0);
  });
});

describe('усе добре → куди рухатись', () => {
  it('немає проблемних навичок → показує наступну тему за програмою', () => {
    const insight = buildParentInsight(
      base({
        skills: [skill('done', 10), skill('next', 20, { title: 'Наступна тема' })],
        mastery: [mastery('done', 'mastered'), mastery('next', 'frontier')],
        attempts: [attempt('done', 9, 10), attempt('done', 10, 10), attempt('done', 9, 10)],
      }),
    );
    expect(insight.kind).toBe('ready-to-advance');
    expect(insight.skill?.title).toBe('Наступна тема');
  });

  it('успішність рівно на порозі — ще не «не дається»', () => {
    const onThreshold = STRUGGLING_ACCURACY * 10;
    const insight = buildParentInsight(
      base({
        skills: [skill('s1', 10)],
        mastery: [mastery('s1', 'frontier')],
        // 3 спроби — тобто шлях «замало даних» виключено, перевіряємо саме поріг
        attempts: [attempt('s1', onThreshold, 10), attempt('s1', onThreshold, 10), attempt('s1', onThreshold, 10)],
      }),
    );
    expect(insight.kind).not.toBe('not-enough-data');
    expect(insight.kind).not.toBe('struggling-skill');
  });

  it('детермінованість: той самий вхід → той самий інсайт', () => {
    const input = base({
      skills: [skill('a', 10), skill('b', 20)],
      mastery: [mastery('a', 'frontier'), mastery('b', 'frontier')],
      attempts: [attempt('a', 1, 10), attempt('a', 2, 10), attempt('b', 1, 10), attempt('b', 2, 10)],
    });
    expect(buildParentInsight(input)).toEqual(buildParentInsight(input));
  });
});
