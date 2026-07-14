// Чисте ядро агрегації прогресу для батьківського дашборду (E1): без БД/React,
// лише обчислення. Дати завжди параметром (детермінізм, тестованість) — жодного
// Date.now()/new Date() без аргументу всередині цього файлу.
// IO (fetchSkills/fetchMastery/fetchAttempts) — у db.ts; React-рендер — у ParentDashboard.tsx.

import type { Attempt, Skill, SkillMastery } from './types';

// ---------- Прогрес по subject → strand ----------

export interface StrandProgress {
  subject: string;
  strand: string;
  total: number;
  mastered: number;
  frontier: number;
  locked: number;
  /** % опанованих навичок у strand (mastered/total), округлено. */
  masteryPct: number;
}

export interface SubjectProgress {
  subject: string;
  strands: StrandProgress[];
  total: number;
  mastered: number;
  frontier: number;
  locked: number;
  /** % опанованих навичок у предметі (mastered/total), округлено. */
  masteryPct: number;
}

/**
 * Групування skills за subject→strand + підрахунок mastered/frontier/locked
 * по зіставленню зі skill_mastery. Навичка без рядка mastery вважається 'locked'.
 * Порядок subject/strand у результаті = порядок першої появи у вхідному масиві skills.
 */
export function groupProgressBySubject(skills: Skill[], masteryRows: SkillMastery[]): SubjectProgress[] {
  const statusBySkill = new Map(masteryRows.map((m) => [m.skill_id, m.status]));

  const bySubject = new Map<string, Map<string, Skill[]>>();
  for (const skill of skills) {
    let strands = bySubject.get(skill.subject);
    if (!strands) {
      strands = new Map();
      bySubject.set(skill.subject, strands);
    }
    const list = strands.get(skill.strand);
    if (list) list.push(skill);
    else strands.set(skill.strand, [skill]);
  }

  const result: SubjectProgress[] = [];
  for (const [subject, strandsMap] of bySubject) {
    const strands: StrandProgress[] = [];
    let subjTotal = 0;
    let subjMastered = 0;
    let subjFrontier = 0;
    let subjLocked = 0;

    for (const [strand, strandSkills] of strandsMap) {
      let mastered = 0;
      let frontier = 0;
      let locked = 0;
      for (const s of strandSkills) {
        const status = statusBySkill.get(s.id) ?? 'locked';
        if (status === 'mastered') mastered++;
        else if (status === 'frontier') frontier++;
        else locked++;
      }
      const total = strandSkills.length;
      strands.push({
        subject,
        strand,
        total,
        mastered,
        frontier,
        locked,
        masteryPct: total > 0 ? Math.round((mastered / total) * 100) : 0,
      });
      subjTotal += total;
      subjMastered += mastered;
      subjFrontier += frontier;
      subjLocked += locked;
    }

    result.push({
      subject,
      strands,
      total: subjTotal,
      mastered: subjMastered,
      frontier: subjFrontier,
      locked: subjLocked,
      masteryPct: subjTotal > 0 ? Math.round((subjMastered / subjTotal) * 100) : 0,
    });
  }

  return result;
}

// ---------- Останні активності ----------

export interface RecentActivity {
  skill_id: string | null;
  game_id: string | null;
  correct: number;
  total: number;
  duration_sec: number | null;
  created_at: string;
}

/** Останні `limit` спроб, найновіші першими (сортує сама — не покладається на порядок IO). */
export function recentActivities(attempts: Attempt[], limit: number): RecentActivity[] {
  return [...attempts]
    .sort((a, b) => (a.created_at > b.created_at ? -1 : a.created_at < b.created_at ? 1 : 0))
    .slice(0, Math.max(0, limit))
    .map(({ skill_id, game_id, correct, total, duration_sec, created_at }) => ({
      skill_id,
      game_id,
      correct,
      total,
      duration_sec,
      created_at,
    }));
}

// ---------- Стрік днів активності ----------

const dayKey = (iso: string): string => iso.slice(0, 10);

/**
 * Серія днів поспіль з активністю, рахуючи назад від `todayISO` (формат YYYY-MM-DD).
 * Якщо сьогодні активності немає — стрік 0 (стрік не "тримається" на майбутнє).
 * Розрив (пропущений день) зупиняє підрахунок. UTC-арифметика — без залежності від
 * локального часового поясу середовища виконання.
 */
export function computeStreakDays(attempts: Pick<Attempt, 'created_at'>[], todayISO: string): number {
  const days = new Set(attempts.map((a) => dayKey(a.created_at)));
  let streak = 0;
  const cur = new Date(`${todayISO}T00:00:00.000Z`);
  while (days.has(cur.toISOString().slice(0, 10))) {
    streak++;
    cur.setUTCDate(cur.getUTCDate() - 1);
  }
  return streak;
}
