// SD2 — розклад по днях тижня. Чиста детермінована логіка (без БД, без Date):
// «сьогодні понеділок — у нас математика, читання, наука». Розклад = РАМКА й
// ритуал школи; движок (mastery/planner) лишається наповненням.
//
// Правила (School_Day_Concept, рішення Тараса):
//   • Пн–Пт — навчальні; Сб–Нд — вільні (пропущений день = просто пропущений,
//     БЕЗ боргу, без переносу).
//   • Ядро щодня: математика + мова (читання). Решта предметів ротуються по днях.
//   • Скільки предметів на день — за класом: дошкілля 2, 1–2 клас 3, 3–4 клас 4.

import type { Subject } from '@/games/types';
import type { ClassLevel } from '@/games/types';

/** Ядро — щодня. */
const CORE: readonly Subject[] = ['math', 'language'];
/** Вторинні предмети, що ротуються по днях тижня. */
const ROTATION: readonly Subject[] = ['science', 'english', 'world', 'logic'];

/** Скільки предметів на навчальний день за класом. */
export function subjectsPerDay(cl: ClassLevel): number {
  if (cl === 'preschool') return 2;
  if (cl === 'grade1' || cl === 'grade2') return 3;
  return 4; // grade3/grade4
}

/** Навчальний день — Пн(1)…Пт(5). Нд(0)/Сб(6) — вільні. */
export function isSchoolDay(weekday: number): boolean {
  return weekday >= 1 && weekday <= 5;
}

/**
 * Предмети на конкретний день тижня для класу. Ядро завжди попереду; вторинні
 * добираються з ротації зі зсувом за днем тижня (щоб дні відрізнялись). Вихідні —
 * порожній список. Детерміновано: той самий (клас, день) → той самий набір.
 */
export function scheduleForDay(cl: ClassLevel, weekday: number): Subject[] {
  if (!isSchoolDay(weekday)) return [];
  const count = subjectsPerDay(cl);
  const out: Subject[] = [...CORE].slice(0, count);
  // зсув ротації за днем тижня — Пн і Ср дають різні вторинні предмети
  let r = (weekday - 1) % ROTATION.length;
  let guard = 0;
  while (out.length < count && guard < ROTATION.length * 2) {
    const s = ROTATION[r % ROTATION.length];
    if (!out.includes(s)) out.push(s);
    r++;
    guard++;
  }
  return out;
}

export const WEEKDAY_NAMES: readonly string[] = [
  'неділя', 'понеділок', 'вівторок', 'середа', 'четвер', "п'ятниця", 'субота',
];

/** Локальна назва дня тижня (0=нд…6=сб). */
export function weekdayName(weekday: number): string {
  return WEEKDAY_NAMES[weekday] ?? '';
}
