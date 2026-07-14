-- 0005: НУШ-compliance колонки (N1) + навчальний клас профілю (G1).
-- Additive, nullable / з DEFAULT — не ламає наявні рядки (69 skills, наявні profiles).
-- ⚠️ Prod-запис. Застосовувати ЛИШЕ з явної згоди Тараса, зі станом ДО/ПІСЛЯ.

-- ── skills: атрибути НУШ-відповідності (прихований compliance-шар) ──
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS galuzey  TEXT CHECK (galuzey IN ('МОВ','ІНО','МАО','ПРО','ТЕО','ІФО','СЗО','ГІО','МИО','ФІО')),
  ADD COLUMN IF NOT EXISTS orn_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cycle    SMALLINT CHECK (cycle IN (1, 2));

CREATE INDEX IF NOT EXISTS idx_skills_galuzey ON public.skills(galuzey);

-- ── profiles: навчальний клас (5-рівнева вісь). Nullable — виводиться з age_group, поки не задано онбордингом (G5) ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS class_level TEXT
    CHECK (class_level IN ('preschool', 'grade1', 'grade2', 'grade3', 'grade4'));
