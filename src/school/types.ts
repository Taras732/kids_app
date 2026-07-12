// Навчальне ядро — TS-типи рівно під схему supabase/migrations/0004_school_core.sql.
// Тут лише форма даних; бізнес-логіки немає (mastery-рушій — задача A4).

export type GradeBand = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';
export type MasteryStatus = 'locked' | 'frontier' | 'mastered';
export type DailyPlanStatus = 'active' | 'completed' | 'skipped';
export type DailyPlanItemKind = 'game' | 'review' | 'workbook' | 'worksheet' | 'activity';
export type DailyPlanItemStatus = 'pending' | 'done' | 'skipped';
export type OfflineTaskType = 'workbook' | 'worksheet' | 'activity';

/** Вузол skill-graph. Довідник (публічне читання). */
export interface Skill {
  id: string;
  subject: string;
  strand: string;
  topic: string | null;
  title: string;
  grade_band: GradeBand;
  mastery_threshold: number;
  review_interval_days: number;
  sort: number;
  created_at: string;
}

/** Ребро DAG: skill_id залежить від prerequisite_id. */
export interface SkillPrerequisite {
  skill_id: string;
  prerequisite_id: string;
}

/** Сира спроба (одна гра/сесія навички). */
export interface Attempt {
  id: string;
  profile_id: string;
  skill_id: string | null;
  game_id: string | null;
  difficulty: string | null;
  correct: number;
  total: number;
  duration_sec: number | null;
  created_at: string;
}

/** Пейлоад для вставки спроби (id/created_at генерує БД). */
export type AttemptInsert = Omit<Attempt, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

/** Засвоєння навички дитиною (profile × skill). */
export interface SkillMastery {
  profile_id: string;
  skill_id: string;
  mastery: number;
  status: MasteryStatus;
  last_practiced_at: string | null;
  updated_at: string;
}

/** План дня «Мій день». */
export interface DailyPlan {
  id: string;
  profile_id: string;
  date: string; // YYYY-MM-DD
  status: DailyPlanStatus;
  created_at: string;
}

/** Крок плану дня. */
export interface DailyPlanItem {
  id: string;
  plan_id: string;
  kind: DailyPlanItemKind;
  ref_id: string | null;
  skill_id: string | null;
  status: DailyPlanItemStatus;
  result: Record<string, unknown> | null;
  sort: number;
}

/** Пейлоад для вставки кроку плану (id/plan_id проставляються при створенні плану). */
export type DailyPlanItemInsert = Omit<DailyPlanItem, 'id' | 'plan_id'>;

/** Довідник офлайн-завдань (workbook/worksheet/activity). */
export interface OfflineTask {
  id: string;
  type: OfflineTaskType;
  title: string;
  payload: Record<string, unknown>;
  grade_band: GradeBand | null;
  created_at: string;
}
