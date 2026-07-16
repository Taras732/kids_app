// «Розгортка куба» — чиста логіка (без React/IO).
//
// Парадигма зі SkyTest (Spatial Reasoning / Cube Folding), адаптована для дітей:
// у дорослому тесті це вимір здібності «на відсів», у нас — урок із правилом
// вголос перед застосуванням (той самий принцип, що в движку «Правило»).
//
// Модель — класична хрестоподібна розгортка:
//
//         [top]
//   [a] [b] [c] [d]        ← смуга з 4 граней (бічні)
//         [bottom]
//
// Коли розгортку складають, смуга a→b→c→d обгортає куб по колу, тож протилежні
// грані в ній стоять ЧЕРЕЗ ОДНУ: a↔c, b↔d. Верх і низ — протилежні між собою.
// Це і є правило, яке дитина спершу читає, а потім застосовує.

export type FaceId = 'a' | 'b' | 'c' | 'd' | 'top' | 'bottom';

export const FACE_IDS: readonly FaceId[] = ['a', 'b', 'c', 'd', 'top', 'bottom'];

/** Грані смуги (обгортають куб по колу) — протилежні через одну. */
export const STRIP_IDS: readonly FaceId[] = ['a', 'b', 'c', 'd'];

/**
 * Протилежні грані. Смуга: через одну (a↔c, b↔d). Верх↔низ.
 * Пари симетричні — це властивість куба, а не домовленість.
 */
export const OPPOSITE: Record<FaceId, FaceId> = {
  a: 'c',
  c: 'a',
  b: 'd',
  d: 'b',
  top: 'bottom',
  bottom: 'top',
};

export function oppositeFace(id: FaceId): FaceId {
  return OPPOSITE[id];
}

/** Чи є грані протилежними (для перевірки дистракторів). */
export function areOpposite(x: FaceId, y: FaceId): boolean {
  return OPPOSITE[x] === y;
}

/** Розгортка: кожній грані призначено свій знак. */
export type CubeNet = Record<FaceId, string>;

/** Детермінований PRNG (mulberry32) — без Math.random у рендері (баг Q2). */
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

/**
 * Знаки для граней. Кольорові кружечки: впізнавані для дитини, не потребують
 * читання і не несуть культурного змісту (на відміну від емодзі-предметів,
 * які легко читаються неоднозначно — див. урок ua-symbols).
 */
export const FACE_MARKS: readonly string[] = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];

/** Розгортка з унікальним знаком на кожній грані. */
export function generateNet(rng: Rng): CubeNet {
  const marks = shuffleWith(FACE_MARKS, rng);
  const net = {} as CubeNet;
  FACE_IDS.forEach((id, i) => {
    net[id] = marks[i];
  });
  return net;
}

export interface CubeTask {
  id: string;
  net: CubeNet;
  /** Грань, про яку питаємо. */
  askFace: FaceId;
  /** Знак правильної відповіді (протилежна грань). */
  correct: string;
  /** Варіанти-знаки (включно з правильним), уже перемішані. */
  options: string[];
}

/**
 * Завдання: «який знак буде навпроти askFace?».
 * Дистрактори — знаки СУСІДНІХ граней (не протилежних): це правдоподібні помилки
 * дитини, яка думає «навпроти = поряд у розгортці», а не випадкові знаки.
 */
export function buildTask(id: string, net: CubeNet, askFace: FaceId, optionsCount: number, rng: Rng): CubeTask {
  const correct = net[oppositeFace(askFace)];
  const neighbours = FACE_IDS.filter((f) => f !== askFace && !areOpposite(askFace, f)).map((f) => net[f]);
  const distractors = shuffleWith(neighbours, rng).slice(0, Math.max(1, optionsCount - 1));
  return { id, net, askFace, correct, options: shuffleWith([correct, ...distractors], rng) };
}

/** Скільки варіантів показувати — старшим більше. */
export function optionsCountFor(band: 'L3' | 'L4'): number {
  return band === 'L4' ? 4 : 3;
}

/**
 * Які грані можна питати. L3 — лише смуга (правило «через одну» в чистому
 * вигляді). L4 — ще й верх/низ, де треба тримати в голові другу частину правила.
 */
export function askableFaces(band: 'L3' | 'L4'): readonly FaceId[] {
  return band === 'L4' ? FACE_IDS : STRIP_IDS;
}
