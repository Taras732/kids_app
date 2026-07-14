import { describe, it, expect } from 'vitest';
import { buildDayPlan, type BuildDayPlanInput } from './planner-core';
import type { Skill, SkillMastery, MasteryStatus } from './types';

const DATE = '2026-07-14';

function skill(id: string, sort: number, over: Partial<Skill> = {}): Skill {
  return {
    id,
    subject: 'math',
    strand: 'Числа й лічба',
    topic: null,
    title: id,
    grade_band: 'L1',
    mastery_threshold: 0.8,
    review_interval_days: 3,
    sort,
    created_at: '2026-01-01T00:00:00.000Z',
    ...over,
  };
}

function mastery(skillId: string, status: MasteryStatus, over: Partial<SkillMastery> = {}): SkillMastery {
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

function run(over: Partial<BuildDayPlanInput>): ReturnType<typeof buildDayPlan> {
  return buildDayPlan({
    skills: [],
    mastery: [],
    gameBySkill: new Map(),
    date: DATE,
    ...over,
  });
}

describe('buildDayPlan', () => {
  it('порожній стан → []', () => {
    expect(run({})).toEqual([]);
    // skills є, mastery нема → теж порожньо
    expect(run({ skills: [skill('s1', 10)] })).toEqual([]);
  });

  it('лише frontier: тільки навички з наявною грою, sort=0..n', () => {
    const skills = [skill('s1', 10), skill('s2', 20), skill('s3', 30)];
    const gameBySkill = new Map([
      ['s1', 'gA'],
      ['s2', 'gB'],
      // s3 без гри
    ]);
    const items = run({
      skills,
      mastery: [mastery('s1', 'frontier'), mastery('s2', 'frontier'), mastery('s3', 'frontier')],
      gameBySkill,
    });

    expect(items.map((i) => i.skill_id)).toEqual(['s1', 's2']); // s3 пропущено (нема гри)
    expect(items.every((i) => i.kind === 'game')).toBe(true);
    expect(items.every((i) => i.status === 'pending')).toBe(true);
    expect(items.map((i) => i.ref_id)).toEqual(['gA', 'gB']);
    expect(items.map((i) => i.sort)).toEqual([0, 1]);
  });

  it('мікс review+frontier: review спершу, потім frontier, обидва за skill.sort', () => {
    // review: r1(sort5), r2(sort15) — mastered і due (практиковані 4 дні тому, interval 3)
    // frontier: f1(sort10), f2(sort20) — з іграми
    const practiced = '2026-07-10T09:00:00.000Z'; // 4 дні тому відносно 07-14
    const skills = [
      skill('r1', 5),
      skill('f1', 10),
      skill('r2', 15),
      skill('f2', 20),
    ];
    const gameBySkill = new Map([
      ['r1', 'gR1'],
      ['f1', 'gF1'],
      ['f2', 'gF2'],
      // r2 без гри → review з ref_id=null
    ]);
    const items = run({
      skills,
      mastery: [
        mastery('r1', 'mastered', { last_practiced_at: practiced }),
        mastery('r2', 'mastered', { last_practiced_at: practiced }),
        mastery('f1', 'frontier'),
        mastery('f2', 'frontier'),
      ],
      gameBySkill,
    });

    expect(items.map((i) => i.skill_id)).toEqual(['r1', 'r2', 'f1', 'f2']);
    expect(items.map((i) => i.kind)).toEqual(['review', 'review', 'game', 'game']);
    expect(items.map((i) => i.ref_id)).toEqual(['gR1', null, 'gF1', 'gF2']);
    expect(items.map((i) => i.sort)).toEqual([0, 1, 2, 3]);
  });

  it('review-due по інтервалу (межа дати): >= interval → due, < interval → ні; null → ні', () => {
    const skills = [
      skill('due', 10, { review_interval_days: 3 }),
      skill('notdue', 20, { review_interval_days: 3 }),
      skill('nulldate', 30, { review_interval_days: 3 }),
    ];
    const items = run({
      skills,
      mastery: [
        // 07-11 → 07-14 = 3 календарні дні = interval → DUE
        mastery('due', 'mastered', { last_practiced_at: '2026-07-11T23:00:00.000Z' }),
        // 07-12 → 07-14 = 2 дні < interval → НЕ due
        mastery('notdue', 'mastered', { last_practiced_at: '2026-07-12T01:00:00.000Z' }),
        // немає відмітки практики → НЕ due
        mastery('nulldate', 'mastered', { last_practiced_at: null }),
      ],
      gameBySkill: new Map(),
    });

    expect(items.map((i) => i.skill_id)).toEqual(['due']);
    expect(items[0].kind).toBe('review');
  });

  it('ліміт targetCount: обрізає до N, лишаючи найменші skill.sort', () => {
    const skills = Array.from({ length: 7 }, (_, k) => skill(`s${k}`, (k + 1) * 10));
    const gameBySkill = new Map(skills.map((s) => [s.id, `game-${s.id}`]));
    const items = run({
      skills,
      mastery: skills.map((s) => mastery(s.id, 'frontier')),
      gameBySkill,
      targetCount: 3,
    });

    expect(items).toHaveLength(3);
    expect(items.map((i) => i.skill_id)).toEqual(['s0', 's1', 's2']);
    expect(items.map((i) => i.sort)).toEqual([0, 1, 2]);
  });
});
