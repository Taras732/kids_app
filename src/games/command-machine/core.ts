// RL6 «Машина команд» — алгоритми БЕЗ коду. Чиста логіка без React/IO.
//
// Парадигма Diagramming зі SkyTest: є початковий стан і список команд — виведи
// результат. Це послідовне виконання інструкцій у чистому вигляді, тобто саме
// те, що робить програма: кожна команда працює з тим, що лишила попередня.
//
// Чому це сильніше за «рух по клітинках», яким зазвичай вчать алгоритмів:
// тут не треба уявляти простір і напрямки — лише простежити, як міняється стан.
// Абстрактніше й масштабується на будь-який зміст.
//
// Дистрактори — не випадкові ряди, а результати РЕАЛЬНИХ помилок виконання:
// зробив команди у зворотному порядку · зупинився на першій · проґавив останню.

export type Cell = string;
export type State = Cell[];

export type Command =
  | { kind: 'swap-ends' }
  | { kind: 'remove'; cell: Cell }
  | { kind: 'append'; cell: Cell }
  | { kind: 'reverse' }
  | { kind: 'rotate-left' };

/** Опис команди дитячою мовою — те, що вона прочитає на екрані. */
export function commandLabel(c: Command): string {
  switch (c.kind) {
    case 'swap-ends':
      return 'Поміняй місцями перше й останнє';
    case 'remove':
      return `Прибери ${c.cell}`;
    case 'append':
      return `Додай ${c.cell} в кінець`;
    case 'reverse':
      return 'Переверни весь ряд';
    case 'rotate-left':
      return 'Перше перенеси в кінець';
  }
}

/** Виконати одну команду. Не мутує вхід — кожен крок дає новий стан. */
export function applyCommand(state: State, c: Command): State {
  const s = state.slice();
  switch (c.kind) {
    case 'swap-ends': {
      if (s.length < 2) return s;
      [s[0], s[s.length - 1]] = [s[s.length - 1], s[0]];
      return s;
    }
    case 'remove':
      return s.filter((x) => x !== c.cell);
    case 'append':
      return [...s, c.cell];
    case 'reverse':
      return s.reverse();
    case 'rotate-left':
      return s.length < 2 ? s : [...s.slice(1), s[0]];
  }
}

/** Виконати всі команди по черзі — зверху вниз. */
export function applyAll(state: State, commands: Command[]): State {
  return commands.reduce(applyCommand, state);
}

/** Стан після кожного кроку (для показу розв'язку). */
export function trace(state: State, commands: Command[]): State[] {
  const out: State[] = [state];
  let cur = state;
  for (const c of commands) {
    cur = applyCommand(cur, c);
    out.push(cur);
  }
  return out;
}

export const eq = (a: State, b: State): boolean => a.length === b.length && a.every((x, i) => x === b[i]);
export const key = (s: State): string => s.join('');

// ---------- детермінований PRNG (Math.random у рендері = баг Q2) ----------

export type Rng = () => number;

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWith<T>(arr: readonly T[], rng: Rng): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Кольорові кружечки: не треба читати й не читаються неоднозначно (урок ua-symbols). */
export const CELLS: readonly Cell[] = ['🔴', '🔵', '🟢', '🟡', '🟣'];

export type Band = 'L1' | 'L2' | 'L3' | 'L4';

export interface Config {
  /** Скільки клітинок у початковому ряду. */
  size: number;
  /** Скільки команд треба виконати — це і є довжина алгоритму. */
  steps: number;
  /** Які команди дозволені на цьому рівні. */
  kinds: Command['kind'][];
}

/**
 * Складність = ДОВЖИНА алгоритму й набір команд, а не «більші числа».
 * Спершу дві прості команди, далі — більше кроків і складніші перетворення.
 */
export function configFor(band: Band): Config {
  if (band === 'L1') return { size: 3, steps: 2, kinds: ['remove', 'append'] };
  if (band === 'L2') return { size: 3, steps: 2, kinds: ['remove', 'append', 'swap-ends'] };
  if (band === 'L3') return { size: 4, steps: 3, kinds: ['remove', 'append', 'swap-ends', 'reverse'] };
  return { size: 4, steps: 3, kinds: ['remove', 'append', 'swap-ends', 'reverse', 'rotate-left'] };
}

export interface MachineTask {
  start: State;
  commands: Command[];
  correct: State;
  /** Варіанти-стани (включно з правильним), перемішані. */
  options: State[];
}

function randomCommand(state: State, kinds: Command['kind'][], rng: Rng): Command {
  const present = [...new Set(state)];
  // «Прибери X» дозволена лише коли в ряду ≥2 РІЗНИХ кольори: інакше вона або
  // прибирає те, чого нема (на порожньому ряду виходила команда «Прибери
  // undefined»), або спорожнює ряд повністю — і дитина дивиться в порожнечу.
  const usable = present.length >= 2 ? kinds : kinds.filter((k) => k !== 'remove');
  const pool = usable.length > 0 ? usable : (['append'] as Command['kind'][]);
  const kind = pool[Math.floor(rng() * pool.length)];

  if (kind === 'remove') {
    return { kind: 'remove', cell: present[Math.floor(rng() * present.length)] };
  }
  if (kind === 'append') {
    return { kind: 'append', cell: CELLS[Math.floor(rng() * CELLS.length)] };
  }
  return { kind } as Command;
}

/**
 * Завдання. Дистрактори — результати помилок виконання, а не випадкові ряди:
 *  • команди у зворотному порядку (найпоширеніша помилка — читати знизу вгору);
 *  • виконав лише першу й зупинився;
 *  • проґавив останню команду.
 * Ті, що збіглись із правильним або між собою, відсіюються.
 */
export function buildTask(band: Band, rng: Rng): MachineTask {
  const cfg = configFor(band);
  const start = Array.from({ length: cfg.size }, () => CELLS[Math.floor(rng() * CELLS.length)]);

  const commands: Command[] = [];
  let cur = start;
  for (let i = 0; i < cfg.steps; i++) {
    const c = randomCommand(cur, cfg.kinds, rng);
    commands.push(c);
    cur = applyCommand(cur, c);
  }
  const correct = cur;

  const wrongCandidates: State[] = [
    applyAll(start, [...commands].reverse()),
    applyAll(start, commands.slice(0, 1)),
    applyAll(start, commands.slice(0, -1)),
  ];

  const seen = new Set<string>([key(correct)]);
  const distractors: State[] = [];
  for (const w of wrongCandidates) {
    if (seen.has(key(w))) continue;
    seen.add(key(w));
    distractors.push(w);
  }

  return { start, commands, correct, options: shuffleWith([correct, ...distractors], rng) };
}

/**
 * Завдання, у якого достатньо різних варіантів. Якщо помилкові виконання дали
 * той самий результат, що й правильне (буває: команди бувають взаємознищувані) —
 * пробуємо ще, а не показуємо завдання з однією відповіддю.
 */
export function buildUsableTask(band: Band, rng: Rng, minOptions = 3): MachineTask {
  let last = buildTask(band, rng);
  for (let i = 0; i < 40 && last.options.length < minOptions; i++) {
    last = buildTask(band, rng);
  }
  return last;
}
