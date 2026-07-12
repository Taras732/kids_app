-- Migration: 0004_school_core.sql
-- Навчальне ядро: skill-graph + mastery + оркестрація дня + офлайн-завдання.
-- ADD-only: не чіпає profiles/progress. Усе через IF NOT EXISTS / DROP POLICY IF EXISTS.
-- RLS-модель власності — як у 0003: дитячі дані належать батьку через profiles.parent_id = auth.uid()
-- (анонімний користувач Supabase = власник своїх профілів). Довідники — публічне читання,
-- запис лише service_role (RLS увімкнено, політик на запис немає).

-- ============================================================
-- 1. skills — довідник навичок (skill-graph вузли). Публічне читання.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.skills (
  id                   TEXT PRIMARY KEY,
  subject              TEXT NOT NULL,
  strand               TEXT NOT NULL,
  topic                TEXT,
  title                TEXT NOT NULL,
  grade_band           TEXT NOT NULL CHECK (grade_band IN ('L0','L1','L2','L3','L4')),
  mastery_threshold    NUMERIC NOT NULL DEFAULT 0.8 CHECK (mastery_threshold > 0 AND mastery_threshold <= 1),
  review_interval_days INTEGER NOT NULL DEFAULT 14,
  sort                 INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "skills public read" ON public.skills;
CREATE POLICY "skills public read" ON public.skills FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_skills_subject    ON public.skills(subject);
CREATE INDEX IF NOT EXISTS idx_skills_strand     ON public.skills(strand);
CREATE INDEX IF NOT EXISTS idx_skills_grade_band ON public.skills(grade_band);

-- ============================================================
-- 2. skill_prerequisites — DAG залежностей навичок. Публічне читання.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.skill_prerequisites (
  skill_id        TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  prerequisite_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  PRIMARY KEY (skill_id, prerequisite_id),
  CHECK (skill_id <> prerequisite_id)
);
ALTER TABLE public.skill_prerequisites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "skill_prerequisites public read" ON public.skill_prerequisites;
CREATE POLICY "skill_prerequisites public read" ON public.skill_prerequisites FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_skill_prereq_skill  ON public.skill_prerequisites(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_prereq_prereq ON public.skill_prerequisites(prerequisite_id);

-- ============================================================
-- 3. attempts — сирі спроби (одна гра/сесія навички). Власність через profiles.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id     TEXT REFERENCES public.skills(id) ON DELETE SET NULL,
  game_id      TEXT,
  difficulty   TEXT,
  correct      INTEGER NOT NULL DEFAULT 0,
  total        INTEGER NOT NULL DEFAULT 0,
  duration_sec INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own attempts" ON public.attempts;
CREATE POLICY "own attempts" ON public.attempts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = attempts.profile_id AND p.parent_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = attempts.profile_id AND p.parent_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_attempts_profile         ON public.attempts(profile_id);
CREATE INDEX IF NOT EXISTS idx_attempts_skill           ON public.attempts(skill_id);
CREATE INDEX IF NOT EXISTS idx_attempts_profile_created ON public.attempts(profile_id, created_at DESC);

-- ============================================================
-- 4. skill_mastery — засвоєння навички дитиною (profile × skill). Власність через profiles.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.skill_mastery (
  profile_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id          TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  mastery           NUMERIC NOT NULL DEFAULT 0 CHECK (mastery >= 0 AND mastery <= 1),
  status            TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked','frontier','mastered')),
  last_practiced_at TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, skill_id)
);
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own skill_mastery" ON public.skill_mastery;
CREATE POLICY "own skill_mastery" ON public.skill_mastery FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = skill_mastery.profile_id AND p.parent_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = skill_mastery.profile_id AND p.parent_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_skill_mastery_skill ON public.skill_mastery(skill_id);
-- тригер updated_at. Функцію визначаємо тут само (самодостатньо; на remote її могло не бути).
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_set_skill_mastery_updated_at ON public.skill_mastery;
CREATE TRIGGER trigger_set_skill_mastery_updated_at
  BEFORE UPDATE ON public.skill_mastery
  FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ============================================================
-- 5. daily_plans + daily_plan_items — «Мій день». Власність через profiles.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  status     TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','skipped')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id, date)
);
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own daily_plans" ON public.daily_plans;
CREATE POLICY "own daily_plans" ON public.daily_plans FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = daily_plans.profile_id AND p.parent_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = daily_plans.profile_id AND p.parent_id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_daily_plans_profile_date ON public.daily_plans(profile_id, date DESC);

CREATE TABLE IF NOT EXISTS public.daily_plan_items (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id  UUID NOT NULL REFERENCES public.daily_plans(id) ON DELETE CASCADE,
  kind     TEXT NOT NULL CHECK (kind IN ('game','review','workbook','worksheet','activity')),
  ref_id   TEXT,
  skill_id TEXT REFERENCES public.skills(id) ON DELETE SET NULL,
  status   TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','skipped')),
  result   JSONB,
  sort     INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.daily_plan_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own daily_plan_items" ON public.daily_plan_items;
CREATE POLICY "own daily_plan_items" ON public.daily_plan_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.daily_plans dp
    JOIN public.profiles p ON p.id = dp.profile_id
    WHERE dp.id = daily_plan_items.plan_id AND p.parent_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.daily_plans dp
    JOIN public.profiles p ON p.id = dp.profile_id
    WHERE dp.id = daily_plan_items.plan_id AND p.parent_id = auth.uid()
  ));
CREATE INDEX IF NOT EXISTS idx_daily_plan_items_plan ON public.daily_plan_items(plan_id, sort);

-- ============================================================
-- 6. offline_tasks — довідник офлайн-завдань (workbook/worksheet/activity). Публічне читання.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.offline_tasks (
  id         TEXT PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('workbook','worksheet','activity')),
  title      TEXT NOT NULL,
  payload    JSONB NOT NULL DEFAULT '{}'::jsonb,
  grade_band TEXT CHECK (grade_band IN ('L0','L1','L2','L3','L4')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offline_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "offline_tasks public read" ON public.offline_tasks;
CREATE POLICY "offline_tasks public read" ON public.offline_tasks FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_offline_tasks_type ON public.offline_tasks(type);
