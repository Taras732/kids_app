// Чисте ядро офлайн-флоу (C1): без БД/React — лише вибір/валідація/мапінг.
// Тестується юнітами напряму (vitest, без supabase). IO-обгортка — у offline.ts.
//
// ⚠️ Реальний seed поки є лише для type='activity' (BRIEF SHK-C3, src/content/activities.ts).
// Для 'workbook'/'worksheet' контенту ще немає — payload-схема нижче спроєктована з
// урахуванням форми ActivityPayload (icon/summary/materials/steps/estimatedMinutes/
// adultHelp/tip/safetyNote), але не підтверджена реальними даними. Читачі тому
// повністю захисні (typeof-перевірки, безпечні fallback), а не «довіряють» формі.

import type { DailyPlanItemInsert, GradeBand, OfflineTask, OfflineTaskType } from './types';

// ---------- Уніфіковане представлення payload для UI ----------

export type OfflineAdultHelp = 'none' | 'light' | 'required';

export interface OfflineTaskView {
  icon: string;
  summary: string;
  /** Головний текст-інструкція (workbook/worksheet). null, якщо немає. */
  instruction: string | null;
  materials: string[];
  steps: string[];
  estimatedMinutes: number | null;
  adultHelp: OfflineAdultHelp | null;
  tip: string | null;
  safetyNote: string | null;
  /** Посилання на друковану версію (worksheet), якщо є. */
  printUrl: string | null;
}

const DEFAULT_ICON: Record<OfflineTaskType, string> = {
  workbook: '📘',
  worksheet: '📄',
  activity: '🧩',
};

// ---------- Захисні читачі примітивів з Record<string, unknown> ----------

function readStr(v: unknown): string | null {
  return typeof v === 'string' && v.trim().length > 0 ? v : null;
}

function readNum(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

function readStrArr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0) : [];
}

function readAdultHelp(v: unknown): OfflineAdultHelp | null {
  return v === 'none' || v === 'light' || v === 'required' ? v : null;
}

function baseView(icon: string): OfflineTaskView {
  return {
    icon,
    summary: '',
    instruction: null,
    materials: [],
    steps: [],
    estimatedMinutes: null,
    adultHelp: null,
    tip: null,
    safetyNote: null,
    printUrl: null,
  };
}

/** payload type='activity' (реальна форма — src/content/activities.ts ActivityPayload). */
export function readActivityPayload(payload: Record<string, unknown>): OfflineTaskView {
  return {
    ...baseView(readStr(payload.icon) ?? DEFAULT_ICON.activity),
    summary: readStr(payload.summary) ?? '',
    materials: readStrArr(payload.materials),
    steps: readStrArr(payload.steps),
    estimatedMinutes: readNum(payload.estimatedMinutes),
    adultHelp: readAdultHelp(payload.adultHelp),
    tip: readStr(payload.tip),
    safetyNote: readStr(payload.safetyNote),
  };
}

/** payload type='workbook' (робочий зошит: сторінки/розділ + інструкція). Схема не підтверджена реальним seed. */
export function readWorkbookPayload(payload: Record<string, unknown>): OfflineTaskView {
  const pageFrom = readNum(payload.pageFrom);
  const pageTo = readNum(payload.pageTo);
  const pagesHint =
    pageFrom != null && pageTo != null
      ? `Сторінки ${pageFrom}–${pageTo}`
      : pageFrom != null
        ? `Сторінка ${pageFrom}`
        : null;

  return {
    ...baseView(readStr(payload.icon) ?? DEFAULT_ICON.workbook),
    summary: readStr(payload.summary) ?? '',
    instruction: readStr(payload.instruction) ?? pagesHint,
    materials: readStrArr(payload.materials),
    steps: readStrArr(payload.steps),
    estimatedMinutes: readNum(payload.estimatedMinutes),
    adultHelp: readAdultHelp(payload.adultHelp),
    tip: readStr(payload.tip),
    safetyNote: readStr(payload.safetyNote),
  };
}

/** payload type='worksheet' (одна друкована сторінка). Схема не підтверджена реальним seed. */
export function readWorksheetPayload(payload: Record<string, unknown>): OfflineTaskView {
  return {
    ...baseView(readStr(payload.icon) ?? DEFAULT_ICON.worksheet),
    summary: readStr(payload.summary) ?? '',
    instruction: readStr(payload.instruction),
    materials: readStrArr(payload.materials),
    steps: readStrArr(payload.steps),
    estimatedMinutes: readNum(payload.estimatedMinutes),
    adultHelp: readAdultHelp(payload.adultHelp),
    tip: readStr(payload.tip),
    safetyNote: readStr(payload.safetyNote),
    printUrl: readStr(payload.printUrl),
  };
}

/** Нормалізувати OfflineTask.payload у типобезпечне представлення для UI, за type. */
export function describeOfflineTask(task: OfflineTask): OfflineTaskView {
  switch (task.type) {
    case 'activity':
      return readActivityPayload(task.payload);
    case 'workbook':
      return readWorkbookPayload(task.payload);
    case 'worksheet':
      return readWorksheetPayload(task.payload);
    default:
      // захист від майбутнього розширення OfflineTaskType без оновлення цього файлу
      return baseView('❓');
  }
}

// ---------- Вибір завдань під рівень дитини ----------

/** Порядок типів у списку (workbook → worksheet → activity), далі — за назвою (uk). */
const TYPE_ORDER: Record<OfflineTaskType, number> = { workbook: 0, worksheet: 1, activity: 2 };

/**
 * Офлайн-завдання під grade_band дитини: точний збіг рівня АБО універсальні
 * (grade_band === null). Відсортовано детерміновано (тип → назва), щоб порядок
 * не «стрибав» між рендерами. Порожній вхід → порожній вихід.
 */
export function selectOfflineTasksForBand(tasks: OfflineTask[], band: GradeBand): OfflineTask[] {
  return tasks
    .filter((t) => t.grade_band === band || t.grade_band === null)
    .sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type] || a.title.localeCompare(b.title, 'uk'));
}

/** Перші `count` офлайн-завдань під рівень дитини (детермінований відбір, без рандому). */
export function pickOfflineTasks(tasks: OfflineTask[], band: GradeBand, count: number): OfflineTask[] {
  return selectOfflineTasksForBand(tasks, band).slice(0, Math.max(0, count));
}

// ---------- Мапінг у крок плану дня ----------

/** OfflineTask → крок плану дня (kind = task.type, ref_id = task.id, статус 'pending'). */
export function offlineTaskToPlanItem(task: OfflineTask, sort: number): DailyPlanItemInsert {
  return {
    kind: task.type,
    ref_id: task.id,
    skill_id: null,
    status: 'pending',
    result: null,
    sort,
  };
}

/** Пакетний мапінг зі зростаючим sort, починаючи з `startSort`. */
export function offlineTasksToPlanItems(tasks: OfflineTask[], startSort = 0): DailyPlanItemInsert[] {
  return tasks.map((t, i) => offlineTaskToPlanItem(t, startSort + i));
}
