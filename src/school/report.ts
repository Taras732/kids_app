import { fetchAttempts, fetchMastery, fetchSkills } from './db';
import { buildWeeklyReport, type WeeklyReport } from './report-core';

/**
 * Завантажує та будує тижневий звіт для профілю.
 * @param profileId — ID профілю дитини
 * @param weekEndISO — дата кінця тижня (YYYY-MM-DD)
 * @throws помилки БД при завантаженні даних
 */
export async function getWeeklyReport(profileId: string, weekEndISO: string): Promise<WeeklyReport> {
  const [attempts, mastery, skills] = await Promise.all([
    fetchAttempts(profileId),
    fetchMastery(profileId),
    fetchSkills(),
  ]);

  return buildWeeklyReport({
    attempts,
    mastery,
    skills,
    weekEndISO,
  });
}
