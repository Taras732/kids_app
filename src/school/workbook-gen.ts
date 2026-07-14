// Glue-шар (C2): збирає WorkbookProblem[] у payload, сумісний з тим, як
// offline-core.readWorkbookPayload() читає OfflineTask (type='workbook').
// Чиста функція збірки — без IO/БД (немає обов'язкового запису; це MVP).
//
// Форма payload узгоджена з readWorkbookPayload:
//   icon/summary/instruction/estimatedMinutes/steps — читає й показує OfflineTaskCard
//   вже сьогодні (steps → нумерований список prompt-ів у картці «Мій день»).
//   problems/seed/gradeBand/count — нові поля понад базову схему; readWorkbookPayload
//   ігнорує невідомі ключі (Record<string, unknown>), тож сумісність не ламається.
//   `problems` — канонічне джерело даних (prompt+answer+kind) для C4 PrintSheet
//   (друк із бланком відповідей); C4 сюди НЕ входить.

import { generateWorkbook, type GenerateWorkbookInput, type WorkbookProblem } from './workbook-gen-core';
import type { GradeBand } from './types';

/** Тіло OfflineTask.payload для type='workbook', згенероване C2. */
export interface WorkbookGenPayload extends Record<string, unknown> {
  icon: string;
  summary: string;
  instruction: string;
  estimatedMinutes: number;
  steps: string[];
  /** Канонічні задачі (prompt/answer/kind) — джерело для C4 PrintSheet. */
  problems: WorkbookProblem[];
  /** Метадані генерації — для відтворюваності/діагностики (той самий seed → той самий зошит). */
  seed: number;
  gradeBand: GradeBand;
  count: number;
}

/** ~секунд на одну задачу для оцінки часу виконання (estimatedMinutes), округлено вгору до хвилини. */
const SECONDS_PER_PROBLEM = 25;

/** Згенерувати задачі (workbook-gen-core) і зібрати їх у OfflineTask-сумісний payload. */
export function buildWorkbookPayload(input: GenerateWorkbookInput): WorkbookGenPayload {
  const problems = generateWorkbook(input);
  const count = problems.length;

  return {
    icon: '📘',
    summary: `${count} ${pluralizeTasks(count)} · рівень ${input.gradeBand}`,
    instruction: 'Розв’яжи приклади нижче та запиши відповіді.',
    estimatedMinutes: Math.max(1, Math.ceil((count * SECONDS_PER_PROBLEM) / 60)),
    steps: problems.map((p) => p.prompt),
    problems,
    seed: input.seed,
    gradeBand: input.gradeBand,
    count,
  };
}

/** Українська плюралізація "задача/задачі/задач" за кількістю. */
function pluralizeTasks(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'задача';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'задачі';
  return 'задач';
}
