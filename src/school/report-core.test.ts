import { describe, it, expect } from 'vitest';
import { buildWeeklyReport } from './report-core';
import type { Attempt, SkillMastery, Skill } from './types';

const mockSkills: Skill[] = [
  {
    id: 'skill-ua-1',
    subject: 'Українська мова',
    strand: 'Фонетика',
    topic: 'Голосні звуки',
    title: 'Визначення голосних звуків',
    grade_band: 'L1',
    mastery_threshold: 0.8,
    review_interval_days: 7,
    sort: 1,
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'skill-math-1',
    subject: 'Математика',
    strand: 'Арифметика',
    topic: 'Додавання',
    title: 'Додавання в межах 10',
    grade_band: 'L1',
    mastery_threshold: 0.8,
    review_interval_days: 7,
    sort: 2,
    created_at: '2026-01-01T00:00:00Z',
  },
];

describe('buildWeeklyReport', () => {
  it('empty week returns zeros', () => {
    const report = buildWeeklyReport({
      attempts: [],
      mastery: [],
      skills: mockSkills,
      weekEndISO: '2026-07-14',
    });

    expect(report.activeDays).toBe(0);
    expect(report.totalGames).toBe(0);
    expect(report.accuracyPct).toBe(0);
    expect(report.newlyMastered).toBe(0);
    expect(report.topSubject).toBeNull();
    expect(report.perDay).toHaveLength(7);
    expect(report.perDay.every((d) => d.count === 0)).toBe(true);
  });

  it('calculates accuracy correctly', () => {
    const attempts: Attempt[] = [
      {
        id: '1',
        profile_id: 'prof-1',
        skill_id: 'skill-ua-1',
        game_id: 'game-1',
        difficulty: null,
        correct: 8,
        total: 10,
        duration_sec: 120,
        created_at: '2026-07-10T10:00:00Z',
      },
      {
        id: '2',
        profile_id: 'prof-1',
        skill_id: 'skill-math-1',
        game_id: 'game-2',
        difficulty: null,
        correct: 7,
        total: 10,
        duration_sec: 130,
        created_at: '2026-07-11T10:00:00Z',
      },
    ];

    const report = buildWeeklyReport({
      attempts,
      mastery: [],
      skills: mockSkills,
      weekEndISO: '2026-07-14',
    });

    // (8 + 7) / (10 + 10) = 15/20 = 0.75 = 75%
    expect(report.accuracyPct).toBe(75);
    expect(report.totalGames).toBe(2);
  });

  it('accuracy is 0 when no attempts', () => {
    const report = buildWeeklyReport({
      attempts: [],
      mastery: [],
      skills: mockSkills,
      weekEndISO: '2026-07-14',
    });

    expect(report.accuracyPct).toBe(0);
  });

  it('counts active days correctly', () => {
    const attempts: Attempt[] = [
      {
        id: '1',
        profile_id: 'prof-1',
        skill_id: 'skill-ua-1',
        game_id: 'game-1',
        difficulty: null,
        correct: 10,
        total: 10,
        duration_sec: 120,
        created_at: '2026-07-10T10:00:00Z',
      },
      {
        id: '2',
        profile_id: 'prof-1',
        skill_id: 'skill-math-1',
        game_id: 'game-2',
        difficulty: null,
        correct: 10,
        total: 10,
        duration_sec: 130,
        created_at: '2026-07-10T15:00:00Z', // same day
      },
      {
        id: '3',
        profile_id: 'prof-1',
        skill_id: 'skill-ua-1',
        game_id: 'game-1',
        difficulty: null,
        correct: 10,
        total: 10,
        duration_sec: 120,
        created_at: '2026-07-12T10:00:00Z',
      },
    ];

    const report = buildWeeklyReport({
      attempts,
      mastery: [],
      skills: mockSkills,
      weekEndISO: '2026-07-14',
    });

    expect(report.activeDays).toBe(2); // 2 унікальні дні
    expect(report.totalGames).toBe(3);
  });

  it('calculates topSubject correctly', () => {
    const attempts: Attempt[] = [
      {
        id: '1',
        profile_id: 'prof-1',
        skill_id: 'skill-ua-1',
        game_id: 'game-1',
        difficulty: null,
        correct: 10,
        total: 10,
        duration_sec: 120,
        created_at: '2026-07-10T10:00:00Z',
      },
      {
        id: '2',
        profile_id: 'prof-1',
        skill_id: 'skill-ua-1',
        game_id: 'game-1',
        difficulty: null,
        correct: 10,
        total: 10,
        duration_sec: 120,
        created_at: '2026-07-11T10:00:00Z',
      },
      {
        id: '3',
        profile_id: 'prof-1',
        skill_id: 'skill-math-1',
        game_id: 'game-2',
        difficulty: null,
        correct: 10,
        total: 10,
        duration_sec: 130,
        created_at: '2026-07-12T10:00:00Z',
      },
    ];

    const report = buildWeeklyReport({
      attempts,
      mastery: [],
      skills: mockSkills,
      weekEndISO: '2026-07-14',
    });

    expect(report.topSubject).toBe('Українська мова'); // 2 спроби
  });

  it('topSubject is null when no attempts', () => {
    const report = buildWeeklyReport({
      attempts: [],
      mastery: [],
      skills: mockSkills,
      weekEndISO: '2026-07-14',
    });

    expect(report.topSubject).toBeNull();
  });

  it('counts newlyMastered within week window', () => {
    const mastery: SkillMastery[] = [
      {
        profile_id: 'prof-1',
        skill_id: 'skill-ua-1',
        mastery: 0.9,
        status: 'mastered',
        last_practiced_at: '2026-07-12T10:00:00Z', // в межах вікна
        updated_at: '2026-07-12T10:00:00Z',
      },
      {
        profile_id: 'prof-1',
        skill_id: 'skill-math-1',
        mastery: 0.85,
        status: 'mastered',
        last_practiced_at: '2026-07-06T10:00:00Z', // поза вікном (раніше за weekStart)
        updated_at: '2026-07-06T10:00:00Z',
      },
      {
        profile_id: 'prof-1',
        skill_id: 'skill-ua-1',
        mastery: 0.7,
        status: 'frontier', // не mastered
        last_practiced_at: '2026-07-13T10:00:00Z',
        updated_at: '2026-07-13T10:00:00Z',
      },
    ];

    const report = buildWeeklyReport({
      attempts: [],
      mastery,
      skills: mockSkills,
      weekEndISO: '2026-07-14',
    });

    expect(report.newlyMastered).toBe(1); // тільки skill-ua-1 з mastered статусом
  });

  it('excludes attempts outside 7-day window', () => {
    const attempts: Attempt[] = [
      {
        id: '1',
        profile_id: 'prof-1',
        skill_id: 'skill-ua-1',
        game_id: 'game-1',
        difficulty: null,
        correct: 10,
        total: 10,
        duration_sec: 120,
        created_at: '2026-07-06T10:00:00Z', // поза вікном (8 днів тому)
      },
      {
        id: '2',
        profile_id: 'prof-1',
        skill_id: 'skill-ua-1',
        game_id: 'game-1',
        difficulty: null,
        correct: 10,
        total: 10,
        duration_sec: 120,
        created_at: '2026-07-10T10:00:00Z', // в межах вікна
      },
    ];

    const report = buildWeeklyReport({
      attempts,
      mastery: [],
      skills: mockSkills,
      weekEndISO: '2026-07-14',
    });

    expect(report.totalGames).toBe(1);
  });

  it('perDay has exactly 7 days', () => {
    const report = buildWeeklyReport({
      attempts: [],
      mastery: [],
      skills: mockSkills,
      weekEndISO: '2026-07-14',
    });

    expect(report.perDay).toHaveLength(7);
    expect(report.perDay[0].date).toBe('2026-07-08'); // weekStart
    expect(report.perDay[6].date).toBe('2026-07-14'); // weekEnd
  });

  it('perDay counts attempts by date', () => {
    const attempts: Attempt[] = [
      {
        id: '1',
        profile_id: 'prof-1',
        skill_id: 'skill-ua-1',
        game_id: 'game-1',
        difficulty: null,
        correct: 10,
        total: 10,
        duration_sec: 120,
        created_at: '2026-07-10T10:00:00Z',
      },
      {
        id: '2',
        profile_id: 'prof-1',
        skill_id: 'skill-ua-1',
        game_id: 'game-1',
        difficulty: null,
        correct: 10,
        total: 10,
        duration_sec: 120,
        created_at: '2026-07-10T15:00:00Z',
      },
      {
        id: '3',
        profile_id: 'prof-1',
        skill_id: 'skill-math-1',
        game_id: 'game-2',
        difficulty: null,
        correct: 10,
        total: 10,
        duration_sec: 130,
        created_at: '2026-07-12T10:00:00Z',
      },
    ];

    const report = buildWeeklyReport({
      attempts,
      mastery: [],
      skills: mockSkills,
      weekEndISO: '2026-07-14',
    });

    expect(report.perDay.find((d) => d.date === '2026-07-10')?.count).toBe(2);
    expect(report.perDay.find((d) => d.date === '2026-07-12')?.count).toBe(1);
    expect(report.perDay.find((d) => d.date === '2026-07-08')?.count).toBe(0);
  });
});
