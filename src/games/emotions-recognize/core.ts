// EP3 — «Карта настрою» (RULER Mood Meter), чиста логіка без React/IO.
//
// Було: 😊 → «Радість». Це ЯРЛИК — дитина зіставляє картинку зі словом і нічого
// не вчиться розрізняти. Аудит позначив соц-емоційні ігри 🔴 саме за це.
//
// Стало (RULER, Yale Center for Emotional Intelligence): емоція — це не ярлик,
// а точка на ДВОХ осях:
//   • енергія: багато сили / мало сили
//   • приємність: приємно / неприємно
// Дві осі дають чотири квадранти. Спершу дитина визначає квадрант (це вже
// відповідь «яка це емоція» грубо), і лише потім уточнює СЛОВО всередині нього.
// Так вона отримує спосіб думати про будь-яку емоцію, а не список пар «смайл→слово».

export type Energy = 'high' | 'low';
export type Pleasant = 'yes' | 'no';
export type QuadrantId = 'yellow' | 'red' | 'green' | 'blue';

export interface Quadrant {
  id: QuadrantId;
  energy: Energy;
  pleasant: Pleasant;
  /** Колір-підказка (як у Mood Meter). */
  mark: string;
  /** Опис осями — дитячою мовою, без термінів. */
  label: string;
}

export const QUADRANTS: Record<QuadrantId, Quadrant> = {
  yellow: { id: 'yellow', energy: 'high', pleasant: 'yes', mark: '🟡', label: 'Багато сили, і приємно' },
  red: { id: 'red', energy: 'high', pleasant: 'no', mark: '🔴', label: 'Багато сили, але неприємно' },
  green: { id: 'green', energy: 'low', pleasant: 'yes', mark: '🟢', label: 'Мало сили, і приємно' },
  blue: { id: 'blue', energy: 'low', pleasant: 'no', mark: '🔵', label: 'Мало сили, і неприємно' },
};

export const QUADRANT_IDS: readonly QuadrantId[] = ['yellow', 'red', 'green', 'blue'];

export interface Emotion {
  emoji: string;
  label: string;
  quadrant: QuadrantId;
}

/**
 * Емоції з їхнім місцем на карті. Тут емодзі доречні — вони справді зображають
 * вираз обличчя (на відміну від 👕 як «вишиванки», див. урок ua-symbols).
 * По дві на квадрант: це мінімум, щоб уточнення слова всередині квадранта мало сенс.
 */
export const EMOTIONS: readonly Emotion[] = [
  { emoji: '😊', label: 'Радість', quadrant: 'yellow' },
  { emoji: '🤩', label: 'Захоплення', quadrant: 'yellow' },
  { emoji: '😠', label: 'Злість', quadrant: 'red' },
  { emoji: '😨', label: 'Страх', quadrant: 'red' },
  { emoji: '😌', label: 'Спокій', quadrant: 'green' },
  { emoji: '🙂', label: 'Задоволення', quadrant: 'green' },
  { emoji: '😢', label: 'Сум', quadrant: 'blue' },
  { emoji: '😴', label: 'Втома', quadrant: 'blue' },
];

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

// ---------- завдання ----------

/**
 * Три види питання — по одному на складність, від осі до слова:
 *  energy   — «багато чи мало сили?» (одна вісь)
 *  quadrant — «яке це місце на карті?» (обидві осі разом)
 *  word     — «яке слово точніше?» (уточнення ВСЕРЕДИНІ квадранта)
 */
export type TaskKind = 'energy' | 'quadrant' | 'word';

export function kindFor(difficulty: 1 | 2 | 3): TaskKind {
  if (difficulty === 1) return 'energy';
  if (difficulty === 2) return 'quadrant';
  return 'word';
}

export interface MoodTask {
  id: string;
  kind: TaskKind;
  emotion: Emotion;
  question: string;
  correct: string;
  options: string[];
}

export function buildTask(id: string, kind: TaskKind, emotion: Emotion, rng: Rng): MoodTask {
  const q = QUADRANTS[emotion.quadrant];

  if (kind === 'energy') {
    return {
      id,
      kind,
      emotion,
      question: 'Скільки тут сили?',
      correct: q.energy === 'high' ? 'Багато сили' : 'Мало сили',
      options: ['Багато сили', 'Мало сили'],
    };
  }

  if (kind === 'quadrant') {
    return {
      id,
      kind,
      emotion,
      question: 'Яке це місце на карті настрою?',
      correct: q.label,
      options: shuffleWith(QUADRANT_IDS.map((k) => QUADRANTS[k].label), rng),
    };
  }

  // word — уточнення всередині квадранта: дистрактори з ТОГО САМОГО квадранта,
  // бо саме там помилка змістовна («сум» чи «втома» — обидва сині).
  const sameQuadrant = EMOTIONS.filter((e) => e.quadrant === emotion.quadrant && e.label !== emotion.label);
  const others = EMOTIONS.filter((e) => e.quadrant !== emotion.quadrant);
  const near = sameQuadrant.map((e) => e.label);
  const far = shuffleWith(others, rng).slice(0, Math.max(0, 3 - 1 - near.length)).map((e) => e.label);
  return {
    id,
    kind,
    emotion,
    question: 'Яке слово тут точніше?',
    correct: emotion.label,
    options: shuffleWith([emotion.label, ...near, ...far], rng),
  };
}

/**
 * Раунди спроби. Емоції НЕ повторюються, доки не вичерпано список — раніше
 * `EMOTIONS[randInt(...)]` міг видати ту саму емоцію всі 5 разів поспіль.
 */
export function buildRounds(kind: TaskKind, count: number, rng: Rng): MoodTask[] {
  const pool = shuffleWith(EMOTIONS, rng);
  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => buildTask(`r${i}`, kind, pool[i], rng));
}
