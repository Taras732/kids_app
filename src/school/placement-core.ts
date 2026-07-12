// Чисте ядро placement-діагностики (A5): без БД/React — лише дані й обчислення.
// Тестується юнітами напряму (node через esbuild-бандл, без supabase).
// IO-обгортка — у placement.ts.
//
// Ідея: короткий адаптивний тест виставляє СТАРТОВИЙ рівень дитини по кожному
// math-strand. Бінарний пошук по grade_band (L0–L4) знаходить найнижчий рівень,
// який дитина ЩЕ НЕ опанувала → це її frontier. Нижчі рівні вважаємо засвоєними.

import type { GradeBand, Skill } from './types';

/** Впорядковані grade_band; індекс = «висота» рівня (0 = L0 … 4 = L4). */
export const BANDS: GradeBand[] = ['L0', 'L1', 'L2', 'L3', 'L4'];
const MAX_BAND = BANDS.length - 1;

export function bandIndex(b: GradeBand): number {
  const i = BANDS.indexOf(b);
  return i < 0 ? 0 : i;
}

/** Strands математики, які покриває діагностика (мають точно збігатися зі skills-math.ts). */
export const PLACEMENT_STRANDS = [
  'Числа й лічба',
  'Дії з числами',
  'Величини',
  'Геометрія',
] as const;
export type PlacementStrand = (typeof PLACEMENT_STRANDS)[number];

/** Калібрувальне завдання: самодостатнє (не залежить від ігрових генераторів). */
export interface PlacementItem {
  strand: PlacementStrand;
  gradeBand: GradeBand;
  prompt: string;
  choices: string[];
  correctIndex: number;
}

/**
 * Банк завдань: 1 на кожен (strand × grade_band) → 20 завдань. Бінарний пошук
 * probe-ить лише 1 рівень за крок, тож 1 завдання на клітинку достатньо. Прості,
 * рівневі: L0=дошкілля … L4=4 клас.
 */
export const PLACEMENT_ITEMS: PlacementItem[] = [
  // ---- Числа й лічба ----
  { strand: 'Числа й лічба', gradeBand: 'L0', prompt: 'Порахуй зірочки: ⭐⭐⭐', choices: ['2', '3', '4'], correctIndex: 1 },
  { strand: 'Числа й лічба', gradeBand: 'L1', prompt: 'Що більше: 7 чи 4?', choices: ['7', '4'], correctIndex: 0 },
  { strand: 'Числа й лічба', gradeBand: 'L2', prompt: 'Що більше: 63 чи 36?', choices: ['63', '36'], correctIndex: 0 },
  { strand: 'Числа й лічба', gradeBand: 'L3', prompt: 'Що більше: 408 чи 480?', choices: ['408', '480'], correctIndex: 1 },
  { strand: 'Числа й лічба', gradeBand: 'L4', prompt: 'Що більше: 25 400 чи 25 040?', choices: ['25 400', '25 040'], correctIndex: 0 },

  // ---- Дії з числами ----
  { strand: 'Дії з числами', gradeBand: 'L0', prompt: 'Скільки буде разом: 🍎 і 🍎?', choices: ['1', '2', '3'], correctIndex: 1 },
  { strand: 'Дії з числами', gradeBand: 'L1', prompt: '5 + 3 = ?', choices: ['7', '8', '9'], correctIndex: 1 },
  { strand: 'Дії з числами', gradeBand: 'L2', prompt: '7 × 4 = ?', choices: ['24', '28', '32'], correctIndex: 1 },
  { strand: 'Дії з числами', gradeBand: 'L3', prompt: '256 + 137 = ?', choices: ['383', '393', '373'], correctIndex: 1 },
  { strand: 'Дії з числами', gradeBand: 'L4', prompt: '18 × 12 = ?', choices: ['206', '216', '226'], correctIndex: 1 },

  // ---- Величини ----
  { strand: 'Величини', gradeBand: 'L0', prompt: 'Хто більший?', choices: ['🐘 Слон', '🐭 Мишка'], correctIndex: 0 },
  { strand: 'Величини', gradeBand: 'L1', prompt: 'Що триває довше?', choices: ['Рік', 'День'], correctIndex: 0 },
  { strand: 'Величини', gradeBand: 'L2', prompt: 'Скільки хвилин у 1 годині?', choices: ['30', '60', '100'], correctIndex: 1 },
  { strand: 'Величини', gradeBand: 'L3', prompt: 'Скільки сантиметрів у 1 метрі?', choices: ['10', '100', '1000'], correctIndex: 1 },
  { strand: 'Величини', gradeBand: 'L4', prompt: 'Потяг їде 3 години по 40 км/год. Скільки км проїхав?', choices: ['80', '120', '160'], correctIndex: 1 },

  // ---- Геометрія ----
  { strand: 'Геометрія', gradeBand: 'L0', prompt: 'Яка фігура кругла?', choices: ['Круг ⚪', 'Квадрат ⬛'], correctIndex: 0 },
  { strand: 'Геометрія', gradeBand: 'L1', prompt: 'Скільки сторін у трикутника?', choices: ['3', '4', '5'], correctIndex: 0 },
  { strand: 'Геометрія', gradeBand: 'L2', prompt: 'Скільки кутів у прямокутника?', choices: ['3', '4', '6'], correctIndex: 1 },
  { strand: 'Геометрія', gradeBand: 'L3', prompt: 'Скільки градусів у прямому куті?', choices: ['45°', '90°', '180°'], correctIndex: 1 },
  { strand: 'Геометрія', gradeBand: 'L4', prompt: 'Точка має координати (4; 7). Яке перше число (x)?', choices: ['4', '7', '11'], correctIndex: 0 },
];

/** Знайти завдання для (strand × grade_band). Перше збіжне (детерміновано). */
export function itemFor(strand: PlacementStrand, gradeBand: GradeBand): PlacementItem | undefined {
  return PLACEMENT_ITEMS.find((it) => it.strand === strand && it.gradeBand === gradeBand);
}

// ---------- Адаптивний бінарний пошук по grade_band ----------

export interface PlacementState {
  low: number; // нижня межа кандидатів (індекс BANDS), включно
  high: number; // верхня межа кандидатів, включно
  current: number; // рівень, який перевіряємо зараз
  answeredCorrect: boolean[]; // історія відповідей у цьому strand
}

export interface StepResult {
  done: boolean;
  state: PlacementState; // оновлений стан (передати в наступний nextStep)
  nextGradeBand?: GradeBand; // рівень наступного завдання (коли !done)
  resultLevel?: GradeBand; // знайдений стартовий рівень (коли done)
}

function mid(low: number, high: number): number {
  return (low + high) >> 1;
}

/** Початок пошуку для одного strand: стартуємо із середини діапазону (L2). */
export function startStrand(): PlacementState {
  const low = 0;
  const high = MAX_BAND;
  return { low, high, current: mid(low, high), answeredCorrect: [] };
}

/**
 * Крок пошуку. Правильно на рівні → шукати вище; помилка → нижче.
 * lower_bound: збігається до найнижчого «провального» рівня (frontier дитини)
 * за ≤3 кроки (⌈log2 5⌉). low після звуження = індекс першого провалу.
 */
export function nextStep(state: PlacementState, wasCorrect: boolean): StepResult {
  const answeredCorrect = [...state.answeredCorrect, wasCorrect];
  let { low, high } = state;
  if (wasCorrect) low = state.current + 1;
  else high = state.current - 1;

  if (low > high) {
    // Усе правильно → low вийде за стелю (обмежуємо до L4); усе неправильно → low=0.
    const resultLevel = BANDS[Math.min(low, MAX_BAND)];
    return { done: true, state: { low, high, current: state.current, answeredCorrect }, resultLevel };
  }
  const current = mid(low, high);
  return { done: false, state: { low, high, current, answeredCorrect }, nextGradeBand: BANDS[current] };
}

// ---------- Перетворення результатів у mastery-рядки ----------

/** Часткова mastery-рядок без статусу (статус дасть recomputeFrontier). */
export interface PlacementMasteryRow {
  skill_id: string;
  mastery: number;
}

/** mastery для рівнів НИЖЧЕ знайденого — вважаємо засвоєними (≥ порога 0.8). */
export const PLACEMENT_MASTERED = 0.9;

/**
 * Для кожного strand: навички з grade_band НИЖЧЕ resultLevel → mastery 0.9
 * (стануть mastered), на самому resultLevel → mastery 0 (стануть frontier після
 * recomputeFrontier). Навички ВИЩЕ resultLevel не чіпаємо (лишаються locked).
 * Чиста: skills приходять параметром. Статус не проставляємо — його дасть recompute.
 */
export function placementToMasteryRows(
  resultsByStrand: Partial<Record<PlacementStrand, GradeBand>>,
  skills: Skill[],
): PlacementMasteryRow[] {
  const rows: PlacementMasteryRow[] = [];
  for (const skill of skills) {
    const result = resultsByStrand[skill.strand as PlacementStrand];
    if (!result) continue; // strand не діагностували
    const skillIdx = bandIndex(skill.grade_band);
    const resultIdx = bandIndex(result);
    if (skillIdx < resultIdx) rows.push({ skill_id: skill.id, mastery: PLACEMENT_MASTERED });
    else if (skillIdx === resultIdx) rows.push({ skill_id: skill.id, mastery: 0 });
  }
  return rows;
}
