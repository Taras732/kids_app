// RL7 «Куди крутиться?» — чиста причинність. Логіка без React/IO.
//
// Парадигма Gears зі SkyTest. Чому саме вона важлива для нас: аудит показав, що
// науково-природничі ігри 🔴 — вони питають «яка це тварина» (ярлик), тобто
// перевіряють памʼять. Шестерні неможливо запам'ятати: щоб відповісти, треба
// ПРОСТЕЖИТИ ланцюг причин. Це шаблон, за яким лікувати решту science-ігор:
// замість «що це?» → «що станеться, якщо?».
//
// Правило: зчеплені шестерні крутяться в РІЗНІ боки. Тож напрямок кожної
// наступної перевертається, і все зводиться до парності: шестерня через одну
// крутиться так само, як перша.
//
// Пас (ремінь) додає другий випадок: прямий передає напрямок БЕЗ зміни,
// перехрещений — перевертає.

export type Direction = 'cw' | 'ccw'; // за годинниковою / проти

export const OPPOSITE: Record<Direction, Direction> = { cw: 'ccw', ccw: 'cw' };

export function flip(d: Direction): Direction {
  return OPPOSITE[d];
}

/** Як з'єднані сусідні колеса. */
export type LinkKind = 'gear' | 'belt' | 'belt-crossed';

/**
 * Чи перевертає з'єднання напрямок.
 * gear — так (зубці штовхають сусіда в інший бік);
 * belt — ні (прямий ремінь тягне так само);
 * belt-crossed — так (перехрещений ремінь розвертає).
 */
export function flipsDirection(link: LinkKind): boolean {
  return link !== 'belt';
}

export interface Chain {
  /** Напрямок ПЕРШОГО колеса — він заданий. */
  start: Direction;
  /** З'єднання між колесами: links[i] — між колесом i та i+1. */
  links: LinkKind[];
}

/** Скільки коліс у ланцюгу (з'єднань завжди на одне менше). */
export function wheelCount(chain: Chain): number {
  return chain.links.length + 1;
}

/**
 * Напрямок колеса з індексом i (0 — перше). Проходимо ланцюг і перевертаємо
 * там, де з'єднання це робить. Саме це дитина має простежити подумки.
 */
export function directionAt(chain: Chain, i: number): Direction {
  let d = chain.start;
  for (let k = 0; k < i; k++) {
    if (flipsDirection(chain.links[k])) d = flip(d);
  }
  return d;
}

/** Напрямок останнього колеса. */
export function lastDirection(chain: Chain): Direction {
  return directionAt(chain, wheelCount(chain) - 1);
}

/** Напрямки всіх коліс — для показу розв'язку після відповіді. */
export function allDirections(chain: Chain): Direction[] {
  return Array.from({ length: wheelCount(chain) }, (_, i) => directionAt(chain, i));
}

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

export type Band = 'L1' | 'L2' | 'L3' | 'L4';

export interface ChainConfig {
  /** Скільки коліс у ланцюгу. */
  wheels: number;
  /** Чи можуть траплятись паси (не лише зубчасті зчеплення). */
  belts: boolean;
}

/**
 * Складність = довжина ланцюга причин, а не «важчі числа». Паси додаються
 * пізніше: спершу правило про зубці має закріпитись у чистому вигляді.
 */
export function configFor(band: Band): ChainConfig {
  if (band === 'L1') return { wheels: 2, belts: false };
  if (band === 'L2') return { wheels: 3, belts: false };
  if (band === 'L3') return { wheels: 4, belts: false };
  return { wheels: 4, belts: true };
}

export function generateChain(band: Band, rng: Rng): Chain {
  const cfg = configFor(band);
  const start: Direction = rng() < 0.5 ? 'cw' : 'ccw';
  const links: LinkKind[] = Array.from({ length: cfg.wheels - 1 }, () => {
    if (!cfg.belts) return 'gear';
    const r = rng();
    // паси рідші за зубці: правило про зубці лишається основним
    if (r < 0.6) return 'gear';
    return r < 0.8 ? 'belt' : 'belt-crossed';
  });
  return { start, links };
}

export const DIRECTION_LABEL: Record<Direction, string> = {
  cw: 'За годинниковою',
  ccw: 'Проти годинникової',
};

export const DIRECTION_ARROW: Record<Direction, string> = {
  cw: '↻',
  ccw: '↺',
};
