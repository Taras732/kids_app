// RL1 — движок «Правило»: правило → розібраний зразок → застосуй до нових
// елементів → правило змінюється → підсумок.
//
// Чому саме так (Direct Instruction, d≈0.60, 328 досліджень, Project Follow Through):
// для підготовчого–3 класу правило називається ВГОЛОС ПЕРШИМ кроком. Це не
// компроміс і не «спрощення» — productive failure (спершу борсайся, потім
// правило) для цього віку протипоказаний. DragonBox провалив паперовий
// пост-тест (CMU, ACM TOCHI 2017) саме тому, що прибрав «чому»: діти віртуозно
// грали в його гру, але не переносили вміння на папір. Тому фаза 'rule' тут —
// інваріант (EP2), а не опція: скаффолд згасає на 'worked', ніколи на 'rule'.
//
// Шар `rules/` навмисно НЕ імпортує `school/` (БД) і `games/` (крім словника
// рівнів) — так само, як `games/` не залежить від `school/`. Правило — чиста
// дидактична структура; хто його показує і звідки бере mastery, вирішує UI.
//
// Без Math.random()/Date.now(): усе, що варіюється, іде через переданий Rng —
// інакше повторюється Q2 (варіанти стрибали, бо перемішувались у рендері).

import type { GradeBand, Subject } from '@/games/types';

// ---------- Візуальна опора ----------

/**
 * Декларативний опис візуалу (не ReactNode) — щоб ядро лишалось чистим,
 * серіалізовним і тестовним, а рендер жив у UI-шарі.
 */
export type RuleVisual =
  | { kind: 'emoji'; emoji: string; caption?: string }
  | { kind: 'steps'; steps: string[] };

// ---------- Модель правила ----------

export interface RuleStatement {
  /** Правило словами. Показується першим кроком — інваріант EP2. */
  text: string;
  visual?: RuleVisual;
}

/**
 * PD2 — розв'язаний зразок ПЕРЕД застосуванням. Це не те саме, що підказка
 * ПІД ЧАС: зразок знімає навантаження, поки дитина ще не має що згадувати.
 */
export interface WorkedExample {
  prompt: string;
  /** Кроки з «чому», не лише «що». */
  steps: string[];
  answer: string;
}

/** Крок реплею рішення дитини. `ok=false` — тут її хід розійшовся з правилом. */
export interface ReplayStep {
  text: string;
  ok: boolean;
}

/**
 * EP1 — «чому неправильно» у трьох формах, від найсильнішої до найслабшої.
 * consequence-replay програє САМЕ те, що зробила дитина, і показує, на якому
 * кроці воно розійшлося з правилом; rule-recall лише нагадує правило.
 */
export type Explain =
  | { kind: 'consequence-replay'; steps: ReplayStep[]; correctTail: string[] }
  | { kind: 'visual-proof'; note: string; visual: RuleVisual }
  | { kind: 'rule-recall'; text: string };

/**
 * Обманка = результат КОНКРЕТНОЇ хибної стратегії, а не випадкове число поруч.
 * Без цього consequence-replay неможливий: щоб програти хід дитини, треба
 * заздалегідь знати, який саме хід привів до цієї відповіді.
 */
export interface Distractor {
  value: string;
  /** Яку хибну стратегію відображає (для реплею й майбутньої аналітики помилок). */
  misconception: string;
  explain: Explain;
}

export interface RuleTask {
  id: string;
  prompt: string;
  correct: string;
  /** Правильний ланцюг міркування. */
  correctSteps: string[];
  distractors: Distractor[];
}

/**
 * Блок = одне правило + його зразок + завдання на НОВИХ елементах.
 * Наступний блок із `changeNote` — це і є «правило змінюється/доповнюється»
 * (парадигма SkyTest): перевіряє гнучкість, а не зубріння.
 */
export interface RuleBlock {
  statement: RuleStatement;
  worked: WorkedExample;
  tasks: RuleTask[];
  /** Підпис переходу, коли правило доповнюється. Порожньо для першого блоку. */
  changeNote?: string;
}

export interface RuleLessonDef {
  id: string;
  title: string;
  /** Предмет розкладу, до якого належить урок (math, language, …). */
  subject: Subject;
  /**
   * Вузли skill-graph, які урок тренує (для mastery/PD3 і підбору в план дня).
   * Порожньо — предмет ще не має seed skill-графа (напр. мова до L1).
   */
  skillIds: string[];
  /** Для яких рівнів урок доречний. */
  bands: GradeBand[];
  /** Правило те саме, елементи НОВІ — це і є трансфер. */
  build: (band: GradeBand, rng: Rng) => RuleBlock[];
}

// ---------- Детермінований PRNG ----------

export type Rng = () => number;

/**
 * mulberry32. Той самий seed → той самий урок (важливо для повтору й тестів).
 * Свій, а не імпорт із school/workbook-gen-core, щоб шар `rules/` лишався
 * автономним — той самий принцип, за яким games/ не залежить від school/.
 */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWith<T>(arr: T[], rng: Rng): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** FNV-1a хеш рядка → детермінований seed з id завдання. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---------- PD3: скаффолд згасає за mastery, не за difficulty ----------

export type ScaffoldLevel = 'full' | 'short' | 'none';

/** Нижче цього mastery дитина ще новачок — потрібен повний зразок. */
export const SCAFFOLD_FULL_BELOW = 0.4;
/** Від цього mastery зразок починає ЗАВАЖАТИ (expertise reversal). */
export const SCAFFOLD_NONE_FROM = 0.75;

/**
 * PD3. Раніше скаффолд згасав за `difficulty` — тобто за складністю ЗАВДАННЯ,
 * хоч expertise reversal визначається компетентністю КОНКРЕТНОЇ дитини.
 * mastery (EMA з A4) — правильна змінна.
 *
 * Правило (фаза 'rule') не згасає ніколи — згасає лише розв'язаний зразок.
 */
export function scaffoldFor(mastery: number): ScaffoldLevel {
  if (mastery < SCAFFOLD_FULL_BELOW) return 'full';
  if (mastery < SCAFFOLD_NONE_FROM) return 'short';
  return 'none';
}

// ---------- Машина фаз уроку ----------

export type LessonPhase =
  | { kind: 'rule'; block: number }
  | { kind: 'worked'; block: number }
  | { kind: 'apply'; block: number; task: number }
  | { kind: 'summary' };

export interface LessonState {
  blocks: RuleBlock[];
  phase: LessonPhase;
  mistakes: number;
  /** Пояснення поточної помилки; null — можна відповідати. */
  explain: Explain | null;
  /** Причина помилки (misconception обраної обманки) — дрібним нейтральним підписом. */
  wrongMisconception: string | null;
  scaffold: ScaffoldLevel;
}

// Growth-mindset фрази живуть у games/shared/encouragement — вони потрібні і
// звичайним іграм (EP1), і цьому движку. Ре-експорт, щоб не було двох копій
// банку, які розійдуться (rules/ імпортує games/, не навпаки).
export { ENCOURAGEMENTS, encouragementFor } from '@/games/shared/encouragement';

export type LessonEvent =
  | { type: 'NEXT' }
  | { type: 'ANSWER'; value: string };

export function startLesson(blocks: RuleBlock[], mastery = 0): LessonState {
  if (blocks.length === 0) throw new Error('Урок-правило: потрібен щонайменше один блок');
  return {
    blocks,
    // EP2: перша фаза — завжди правило, за будь-якого скаффолду.
    phase: { kind: 'rule', block: 0 },
    mistakes: 0,
    explain: null,
    wrongMisconception: null,
    scaffold: scaffoldFor(mastery),
  };
}

/** Пояснення + причина для обраної відповіді. Невідома обманка → не вигадуємо реплей. */
export function explainFor(
  task: RuleTask,
  picked: string,
  statement: RuleStatement,
): { explain: Explain; misconception: string | null } {
  const d = task.distractors.find((x) => x.value === picked);
  return d
    ? { explain: d.explain, misconception: d.misconception }
    : { explain: { kind: 'rule-recall', text: statement.text }, misconception: null };
}

/**
 * Варіанти для ChoiceGrid: правильна + обманки, перемішані ДЕТЕРМІНОВАНО (Q2).
 * Приймає ЧИСЛОВИЙ seed, а не готовий Rng: rng будується всередині з seed ^ hash(id),
 * тож повторний виклик у тілі рендеру дає ТОЙ САМИЙ порядок. Раніше сюди
 * передавали спільний stateful-Rng, і кожен React-рендер мутував його стан →
 * варіанти стрибали між показом і кліком (та сама пастка, що Q2 у Фазі 0).
 */
export function buildOptions(task: RuleTask, seed: number): string[] {
  const rng = createRng((seed >>> 0) ^ hashString(task.id));
  return shuffleWith([task.correct, ...task.distractors.map((d) => d.value)], rng);
}

/**
 * Відсіяти обманки, що збігаються з правильною відповіддю або одна з одною.
 * Кандидатів дають із запасом (більше, ніж max) — тож при колізії беремо
 * наступну змістовну помилку, а не випадкове число. Так у варіантах ніколи
 * не буде двох однакових (баг `5×5+2×2` → «29, 29»).
 */
export function dedupeDistractors(correct: string, candidates: Distractor[], max = 2): Distractor[] {
  const seen = new Set<string>([correct]);
  const out: Distractor[] = [];
  for (const d of candidates) {
    if (seen.has(d.value)) continue;
    seen.add(d.value);
    out.push(d);
    if (out.length >= max) break;
  }
  return out;
}

/**
 * Набрати `count` завдань з унікальним prompt. `gen(i)` викликається доти, доки
 * не набереться потрібна кількість різних (щоб перше й третє завдання не вийшли
 * однакові). `seedPrompts` — вже зайняті формулювання (напр. перше завдання
 * блоку, зафіксоване окремо для дзеркала).
 */
export function uniqueTasks(
  count: number,
  gen: (i: number) => RuleTask,
  seedPrompts: string[] = [],
): RuleTask[] {
  const seen = new Set(seedPrompts);
  const out: RuleTask[] = [];
  for (let i = 0, guard = 0; out.length < count && guard < count * 30 + 30; i++, guard++) {
    const t = gen(i);
    if (seen.has(t.prompt)) continue;
    seen.add(t.prompt);
    out.push(t);
  }
  return out;
}

/** Наступна фаза після завершення завдання `task` у блоці `block`. */
function afterTask(blocks: RuleBlock[], block: number, task: number): LessonPhase {
  if (task + 1 < blocks[block].tasks.length) return { kind: 'apply', block, task: task + 1 };
  if (block + 1 < blocks.length) return { kind: 'rule', block: block + 1 };
  return { kind: 'summary' };
}

export function advance(state: LessonState, ev: LessonEvent): LessonState {
  const { phase, blocks } = state;

  if (phase.kind === 'summary') return state;

  if (phase.kind === 'rule') {
    if (ev.type !== 'NEXT') return state;
    // Скаффолд згасає тут: досвідчена дитина йде від правила одразу до застосування.
    const next: LessonPhase =
      state.scaffold === 'none'
        ? { kind: 'apply', block: phase.block, task: 0 }
        : { kind: 'worked', block: phase.block };
    return { ...state, phase: next };
  }

  if (phase.kind === 'worked') {
    if (ev.type !== 'NEXT') return state;
    return { ...state, phase: { kind: 'apply', block: phase.block, task: 0 } };
  }

  // phase.kind === 'apply'
  const task = blocks[phase.block].tasks[phase.task];

  if (ev.type === 'NEXT') {
    // «Зрозуміло» після пояснення → та сама задача, ще спроба.
    return state.explain ? { ...state, explain: null, wrongMisconception: null } : state;
  }

  // Поки показане пояснення — відповіді заблоковані (дитина має його прочитати).
  if (state.explain) return state;

  if (ev.value === task.correct) {
    return { ...state, phase: afterTask(blocks, phase.block, phase.task), explain: null, wrongMisconception: null };
  }

  const { explain, misconception } = explainFor(task, ev.value, blocks[phase.block].statement);
  return {
    ...state,
    mistakes: state.mistakes + 1,
    explain,
    wrongMisconception: misconception,
  };
}

// ---------- Прогрес і підсумок ----------

export function totalTasks(blocks: RuleBlock[]): number {
  return blocks.reduce((n, b) => n + b.tasks.length, 0);
}

/** Скільки завдань уже позаду (для смужки прогресу). */
export function tasksDone(state: LessonState): number {
  const { phase, blocks } = state;
  if (phase.kind === 'summary') return totalTasks(blocks);
  const blockIndex = phase.kind === 'apply' ? phase.block : phase.block;
  const before = blocks.slice(0, blockIndex).reduce((n, b) => n + b.tasks.length, 0);
  return phase.kind === 'apply' ? before + phase.task : before;
}

/** Фікс #4 — мікро-підсумок «що ти вивчив». Усі правила уроку, по порядку. */
export function summaryRules(blocks: RuleBlock[]): string[] {
  return blocks.map((b) => b.statement.text);
}

// ---------- Гвардія банку правил ----------

/**
 * Структурна перевірка уроку. Ганяється тестом по ВСЬОМУ банку × усі bands —
 * так інваріант EP2 («правило назване вголос») стає механічною перевіркою,
 * а не домовленістю, про яку забудуть на десятому правилі.
 */
export function validateLesson(def: RuleLessonDef, band: GradeBand, rng: Rng): string[] {
  const errs: string[] = [];
  const where = `${def.id}/${band}`;
  const blocks = def.build(band, rng);

  if (blocks.length === 0) errs.push(`${where}: жодного блоку`);

  blocks.forEach((b, bi) => {
    if (!b.statement.text.trim()) errs.push(`${where}: блок ${bi} — порожнє правило (EP2)`);
    if (!b.worked.steps.length) errs.push(`${where}: блок ${bi} — зразок без кроків (PD2)`);
    if (!b.worked.answer.trim()) errs.push(`${where}: блок ${bi} — зразок без відповіді`);
    if (bi > 0 && !b.changeNote?.trim()) errs.push(`${where}: блок ${bi} — зміна правила без підпису`);
    if (!b.tasks.length) errs.push(`${where}: блок ${bi} — жодного завдання`);

    b.tasks.forEach((t) => {
      const at = `${where}: завдання ${t.id}`;
      if (!t.prompt.trim()) errs.push(`${at} — порожнє формулювання`);
      if (!t.correctSteps.length) errs.push(`${at} — нема правильного ланцюга`);
      if (!t.distractors.length) errs.push(`${at} — жодної обманки`);
      if (t.distractors.some((d) => d.value === t.correct))
        errs.push(`${at} — обманка збігається з правильною відповіддю`);
      if (new Set(t.distractors.map((d) => d.value)).size !== t.distractors.length)
        errs.push(`${at} — обманки повторюються`);
      t.distractors.forEach((d) => {
        if (!d.misconception.trim())
          errs.push(`${at} — обманка «${d.value}» без опису хибної стратегії`);
      });
    });
  });

  return errs;
}
