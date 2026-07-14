import type { Attempt, SkillMastery, Skill } from './types';

/** Звіт про прогрес за тиждень. */
export interface WeeklyReport {
  /** Кількість днів з активністю (0..7). */
  activeDays: number;
  /** Загальна кількість спроб за тиждень. */
  totalGames: number;
  /** Точність відповідей як відсоток (0..100), або 0 якщо немає спроб. */
  accuracyPct: number;
  /** Кількість навичок, засвоєних за тиждень. */
  newlyMastered: number;
  /** Топ предмет за кількістю спроб, або null якщо немає спроб. */
  topSubject: string | null;
  /** Активність за кожен день (останні 7 днів, YYYY-MM-DD). */
  perDay: Array<{ date: string; count: number }>;
}

/**
 * Будує звіт про прогрес за тиждень.
 *
 * @param input.attempts — спроби (будь-яка хронологія, фільтруватимуться локально)
 * @param input.mastery — поточна мастерство по навичкам
 * @param input.skills — довідник навичок
 * @param input.weekEndISO — дата кінця тижня (YYYY-MM-DD), рахує 7 днів назад
 */
export function buildWeeklyReport(input: {
  attempts: Attempt[];
  mastery: SkillMastery[];
  skills: Skill[];
  weekEndISO: string;
}): WeeklyReport {
  const { attempts, mastery, skills, weekEndISO } = input;

  // Конвертуємо weekEndISO на Date (початок дня)
  const weekEnd = new Date(weekEndISO + 'T00:00:00Z');
  const weekStart = new Date(weekEnd);
  weekStart.setUTCDate(weekEnd.getUTCDate() - 6); // 7 днів = від D-6 до D

  // Фільтруємо спроби за вікном
  const weekAttempts = attempts.filter((a) => {
    const attemptDate = new Date(a.created_at);
    return attemptDate >= weekStart && attemptDate <= weekEnd;
  });

  // 1. Активні дні (унікальні дати)
  const activeDaysSet = new Set<string>();
  weekAttempts.forEach((a) => {
    const date = a.created_at.split('T')[0]; // YYYY-MM-DD
    activeDaysSet.add(date);
  });
  const activeDays = activeDaysSet.size;

  // 2. Всього ігор
  const totalGames = weekAttempts.length;

  // 3. Точність
  let correctSum = 0;
  let totalSum = 0;
  weekAttempts.forEach((a) => {
    correctSum += a.correct;
    totalSum += a.total;
  });
  const accuracyPct = totalSum === 0 ? 0 : Math.round((correctSum / totalSum) * 100);

  // 4. Новий мастерій (засвоєні за тиждень)
  const newlyMastered = mastery.filter((m) => {
    if (m.status !== 'mastered' || !m.last_practiced_at) return false;
    const practiceDate = new Date(m.last_practiced_at);
    return practiceDate >= weekStart && practiceDate <= weekEnd;
  }).length;

  // 5. Топ предмет
  const subjectCounts: Record<string, number> = {};
  weekAttempts.forEach((a) => {
    if (!a.skill_id) return;
    const skill = skills.find((s) => s.id === a.skill_id);
    if (skill) {
      subjectCounts[skill.subject] = (subjectCounts[skill.subject] || 0) + 1;
    }
  });
  const topSubject =
    Object.keys(subjectCounts).length === 0
      ? null
      : Object.entries(subjectCounts).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

  // 6. Per-day разбивка (за останні 7 днів, включаючи дні без активності)
  const perDay: Array<{ date: string; count: number }> = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setUTCDate(weekStart.getUTCDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const count = weekAttempts.filter((a) => a.created_at.split('T')[0] === dateStr).length;
    perDay.push({ date: dateStr, count });
  }

  return {
    activeDays,
    totalGames,
    accuracyPct,
    newlyMastered,
    topSubject,
    perDay,
  };
}
