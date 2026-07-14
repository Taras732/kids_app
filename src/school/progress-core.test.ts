import { describe, expect, it } from 'vitest';
import { computeStreakDays, groupProgressBySubject, recentActivities } from './progress-core';
import type { Attempt, Skill, SkillMastery } from './types';

// ---------- Хелпери фікстур (мінімальні, лише потрібні поля типізовано повно) ----------

function skill(id: string, subject: string, strand: string, sort = 0): Skill {
  return {
    id,
    subject,
    strand,
    topic: null,
    title: id,
    grade_band: 'L1',
    mastery_threshold: 0.8,
    review_interval_days: 7,
    sort,
    created_at: '2026-01-01T00:00:00.000Z',
  };
}

function mastery(skill_id: string, status: SkillMastery['status'], m = 0): SkillMastery {
  return { profile_id: 'p1', skill_id, mastery: m, status, last_practiced_at: null, updated_at: '2026-01-01T00:00:00.000Z' };
}

function attempt(created_at: string, overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: `a-${created_at}`,
    profile_id: 'p1',
    skill_id: 's1',
    game_id: 'game1',
    difficulty: null,
    correct: 3,
    total: 5,
    duration_sec: 60,
    created_at,
    ...overrides,
  };
}

describe('groupProgressBySubject', () => {
  it('групує skills по subject→strand і рахує mastered/frontier/locked', () => {
    const skills = [
      skill('m1', 'Математика', 'Числа й лічба'),
      skill('m2', 'Математика', 'Числа й лічба'),
      skill('m3', 'Математика', 'Дії з числами'),
      skill('u1', 'Українська', 'Читання'),
    ];
    const masteryRows = [
      mastery('m1', 'mastered'),
      mastery('m2', 'frontier'),
      mastery('m3', 'locked'),
      // u1 без рядка mastery взагалі
    ];

    const result = groupProgressBySubject(skills, masteryRows);

    expect(result).toHaveLength(2);
    const mathSubj = result.find((r) => r.subject === 'Математика')!;
    expect(mathSubj.strands).toHaveLength(2);

    const chysla = mathSubj.strands.find((s) => s.strand === 'Числа й лічба')!;
    expect(chysla).toMatchObject({ total: 2, mastered: 1, frontier: 1, locked: 0, masteryPct: 50 });

    const dii = mathSubj.strands.find((s) => s.strand === 'Дії з числами')!;
    expect(dii).toMatchObject({ total: 1, mastered: 0, frontier: 0, locked: 1, masteryPct: 0 });

    // subject rollup: 3 skills, 1 mastered → 33% (округлення)
    expect(mathSubj).toMatchObject({ total: 3, mastered: 1, frontier: 1, locked: 1, masteryPct: 33 });

    const ukr = result.find((r) => r.subject === 'Українська')!;
    // без mastery-рядка → locked за замовчуванням
    expect(ukr).toMatchObject({ total: 1, mastered: 0, frontier: 0, locked: 1, masteryPct: 0 });
  });

  it('% опанування = 100 коли всі навички mastered', () => {
    const skills = [skill('a', 'Математика', 'X'), skill('b', 'Математика', 'X')];
    const masteryRows = [mastery('a', 'mastered'), mastery('b', 'mastered')];
    const result = groupProgressBySubject(skills, masteryRows);
    expect(result[0].masteryPct).toBe(100);
    expect(result[0].strands[0].masteryPct).toBe(100);
  });

  it('порожній стан: без skills повертає порожній масив', () => {
    expect(groupProgressBySubject([], [])).toEqual([]);
  });
});

describe('recentActivities', () => {
  it('повертає останні N спроб, найновіші першими, незалежно від порядку на вході', () => {
    const attempts = [
      attempt('2026-07-10T10:00:00.000Z', { game_id: 'g1' }),
      attempt('2026-07-12T10:00:00.000Z', { game_id: 'g3' }),
      attempt('2026-07-11T10:00:00.000Z', { game_id: 'g2' }),
    ];
    const result = recentActivities(attempts, 2);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.game_id)).toEqual(['g3', 'g2']);
  });

  it('порожній стан: без спроб повертає порожній масив', () => {
    expect(recentActivities([], 5)).toEqual([]);
  });

  it('limit <= 0 повертає порожній масив, не кидає помилку', () => {
    expect(recentActivities([attempt('2026-07-10T10:00:00.000Z')], 0)).toEqual([]);
  });
});

describe('computeStreakDays', () => {
  it('суміжні дні (включно з сьогодні) дають стрік = кількість днів', () => {
    const attempts = [
      attempt('2026-07-14T09:00:00.000Z'),
      attempt('2026-07-13T20:00:00.000Z'),
      attempt('2026-07-12T08:00:00.000Z'),
    ];
    expect(computeStreakDays(attempts, '2026-07-14')).toBe(3);
  });

  it('розрив днів зупиняє підрахунок на межі розриву', () => {
    // сьогодні + вчора активні, позавчора — розрив (немає), 3 дні тому — активний, але вже не рахується
    const attempts = [
      attempt('2026-07-14T09:00:00.000Z'),
      attempt('2026-07-13T09:00:00.000Z'),
      attempt('2026-07-11T09:00:00.000Z'),
    ];
    expect(computeStreakDays(attempts, '2026-07-14')).toBe(2);
  });

  it('без активності сьогодні стрік = 0, навіть якщо вчора була активність', () => {
    const attempts = [attempt('2026-07-13T09:00:00.000Z')];
    expect(computeStreakDays(attempts, '2026-07-14')).toBe(0);
  });

  it('порожній стан: без спроб стрік = 0', () => {
    expect(computeStreakDays([], '2026-07-14')).toBe(0);
  });

  it('кілька спроб в один день рахуються як один день стріку', () => {
    const attempts = [
      attempt('2026-07-14T08:00:00.000Z'),
      attempt('2026-07-14T09:00:00.000Z'),
      attempt('2026-07-14T20:00:00.000Z'),
    ];
    expect(computeStreakDays(attempts, '2026-07-14')).toBe(1);
  });
});
