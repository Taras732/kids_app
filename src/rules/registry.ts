// Реєстр уроків-правил усіх предметів. Додати предмет = новий rules-<subject>.ts
// + рядок тут (той самий патерн, що games/registry.ts).

import type { GradeBand, Subject } from '@/games/types';
import { hashString } from './rule-core';
import type { RuleLessonDef } from './rule-core';
import { MATH_RULE_LESSONS } from './rules-math';
import { LANGUAGE_RULE_LESSONS } from './rules-language';

export const ALL_RULE_LESSONS: RuleLessonDef[] = [...MATH_RULE_LESSONS, ...LANGUAGE_RULE_LESSONS];

export function getRuleLesson(id: string): RuleLessonDef | undefined {
  return ALL_RULE_LESSONS.find((l) => l.id === id);
}

/** Уроки, доречні для рівня дитини (за потреби — в межах предмета). */
export function lessonsFor(band: GradeBand, subject?: Subject): RuleLessonDef[] {
  return ALL_RULE_LESSONS.filter((l) => l.bands.includes(band) && (!subject || l.subject === subject));
}

/**
 * «Правило дня» предмета: детермінований урок під рівень дитини, стабільний у
 * межах доби (не міняється при кожному відкритті /day), різний по днях.
 * null — для цього рівня/предмета уроків-правил ще немає.
 */
export function ruleOfDay(band: GradeBand, dateStr: string, subject?: Subject): RuleLessonDef | null {
  const lessons = lessonsFor(band, subject);
  if (lessons.length === 0) return null;
  return lessons[hashString(`${dateStr}:${subject ?? 'any'}`) % lessons.length];
}
