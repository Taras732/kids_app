import type { ClassLevel, Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { randInt, shuffle } from '../shared/ui';

export type Unit = 'kop' | 'hrn';
export type Mode = 'count' | 'compose' | 'change' | 'compare';

export interface CountPayload {
  mode: 'count';
  unit: Unit;
  items: number[];
}

export interface ComposeOption {
  id: string;
  items: number[];
  sum: number;
}

export interface ComposePayload {
  mode: 'compose';
  unit: Unit;
  target: number;
  options: ComposeOption[];
}

export interface ChangePayload {
  mode: 'change';
  cost: number;
  paid: number;
}

export interface Product {
  emoji: string;
  name: string;
}

export interface ComparePayload {
  mode: 'compare';
  left: Product & { price: number };
  right: Product & { price: number };
  askCheaper: boolean;
}

export type Payload = CountPayload | ComposePayload | ChangePayload | ComparePayload;

export const PRODUCTS: Product[] = [
  { emoji: '🍎', name: 'Яблуко' },
  { emoji: '🍌', name: 'Банан' },
  { emoji: '🥐', name: 'Круасан' },
  { emoji: '🧃', name: 'Сік' },
  { emoji: '🍫', name: 'Шоколадка' },
  { emoji: '⚽', name: "М'яч" },
  { emoji: '📕', name: 'Книга' },
  { emoji: '🎈', name: 'Кулька' },
  { emoji: '🧸', name: 'Іграшка' },
];

export interface BandConfig {
  /** Номінали гривень (окрім копійок, які завжди [1,2,5,10] незалежно від band). */
  hrnPool: number[];
  /** Ймовірність, що раунд рахує у копійках замість гривень. */
  kopChance: number;
  /** Діапазон кількості предметів (монет/купюр) у раунді. */
  countRange: [number, number];
  /** Верхня межа ціни товару в режимі 'compare'. */
  compareMax: number;
  /** Пул режимів раунду (5 елементів = ROUNDS); generate() перемішує його заново щоразу. */
  modes: Mode[];
}

/**
 * Номінали/ймовірність копійок/діапазон кількості/режими за узгодженою
 * шкалою L0-L4 (D5). Гра доступна лише профілю 'L3' (школярі, `levels:
 * ['L3']`), тож реально задіяні лише L2-L4 (Easy/Medium/Hard, значення точно
 * як у попередній difficulty-таблиці); L0-L1 — про запас на майбутнє
 * розширення `levels` (менший пул номіналів, менше предметів, лише
 * count/compose — без change/compare).
 */
export const CONFIG_BY_BAND: Record<GradeBand, BandConfig> = {
  L0: { hrnPool: [1, 2], kopChance: 0.7, countRange: [2, 2], compareMax: 10, modes: ['count', 'count', 'count', 'count', 'count'] },
  L1: { hrnPool: [1, 2, 5], kopChance: 0.5, countRange: [2, 3], compareMax: 20, modes: ['count', 'count', 'count', 'count', 'compose'] },
  L2: { hrnPool: [1, 2, 5], kopChance: 0.5, countRange: [2, 3], compareMax: 20, modes: ['count', 'count', 'count', 'compose', 'compose'] },
  L3: {
    hrnPool: [1, 2, 5, 10, 20],
    kopChance: 0,
    countRange: [3, 4],
    compareMax: 100,
    modes: ['count', 'count', 'compose', 'compose', 'compare'],
  },
  L4: {
    hrnPool: [5, 10, 20, 50, 100, 200, 500],
    kopChance: 0,
    countRange: [4, 5],
    compareMax: 500,
    modes: ['change', 'change', 'change', 'compose', 'compare'],
  },
};

/** Підмножина полів BandConfig, потрібна для count/compose — спільна для band- і клас-осі. */
export type MoneyScale = Pick<BandConfig, 'hrnPool' | 'kopChance' | 'countRange'>;

/**
 * Клас → номінали/ймовірність копійок/діапазон кількості (G2b, перенесено
 * зі старого `denominationsForClass`/`paramsFor` у main). На відміну від
 * `CONFIG_BY_BAND` (band-вісь), ця вісь масштабує суми/номінали за НАВЧАЛЬНИМ
 * КЛАСОМ: 1 клас — монети+банкноти до 20 грн (без копійок), 2 клас — до 100 грн,
 * 3 клас — до 500 грн + копійки (як у старому коді, копійки з'являлись з 3
 * класу), 4 клас — повний номінальний ряд до 1000 грн.
 */
export const CLASS_MONEY_CONFIG: Record<ClassLevel, MoneyScale> = {
  preschool: { hrnPool: [1, 2, 5], kopChance: 0, countRange: [2, 3] },
  grade1: { hrnPool: [1, 2, 5, 10, 20], kopChance: 0, countRange: [2, 4] },
  grade2: { hrnPool: [1, 2, 5, 10, 20, 50, 100], kopChance: 0, countRange: [3, 5] },
  grade3: { hrnPool: [1, 2, 5, 10, 20, 50, 100, 200, 500], kopChance: 0.3, countRange: [3, 6] },
  grade4: { hrnPool: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000], kopChance: 0.3, countRange: [4, 7] },
};

function poolFor(unit: Unit, config: MoneyScale): number[] {
  if (unit === 'kop') return [1, 2, 5, 10];
  return config.hrnPool;
}

/** Easy-бенди інколи працюють у копійках — окремий контекст від гривень. */
function pickUnit(config: MoneyScale): Unit {
  return Math.random() < config.kopChance ? 'kop' : 'hrn';
}

function randomItems(pool: number[], minCount: number, maxCount: number): number[] {
  const n = randInt(minCount, maxCount);
  const items: number[] = [];
  for (let k = 0; k < n; k++) items.push(pool[randInt(0, pool.length - 1)]);
  return items;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function genCount(config: MoneyScale): CountPayload {
  const unit = pickUnit(config);
  const pool = poolFor(unit, config);
  const [minCount, maxCount] = config.countRange;
  return { mode: 'count', unit, items: randomItems(pool, minCount, maxCount) };
}

/** 'change' для клас-осі: більший номінал з пулу класу як "заплачено", менший — "ціна". */
function genChangeForClass(hrnPool: number[]): ChangePayload {
  const usable = hrnPool.filter((v) => v > 1);
  const sorted = (usable.length > 0 ? usable : hrnPool).slice().sort((a, b) => a - b);
  const topStart = Math.max(0, sorted.length - 3);
  let paid = sorted[randInt(topStart, sorted.length - 1)];
  if (paid <= 1) paid = 2;
  const cost = randInt(1, paid - 1);
  return { mode: 'change', cost, paid };
}

function genCompose(config: MoneyScale): ComposePayload {
  const unit = pickUnit(config);
  const pool = poolFor(unit, config);
  const [minCount, maxCount] = config.countRange;
  const correctItems = randomItems(pool, minCount, maxCount);
  const target = correctItems.reduce((a, b) => a + b, 0);

  const options: ComposeOption[] = [{ id: 'opt0', items: correctItems, sum: target }];
  const usedSums = new Set<number>([target]);
  let guard = 0;
  while (options.length < 4 && guard < 60) {
    const items = randomItems(pool, minCount, maxCount);
    const sum = items.reduce((a, b) => a + b, 0);
    if (!usedSums.has(sum)) {
      usedSums.add(sum);
      options.push({ id: `opt${options.length}`, items, sum });
    }
    guard++;
  }
  // добити, якщо забракло унікальних сум (малий пул)
  while (options.length < 4) {
    const items = randomItems(pool, minCount, maxCount);
    options.push({ id: `opt${options.length}`, items, sum: items.reduce((a, b) => a + b, 0) });
  }

  return { mode: 'compose', unit, target, options: shuffle(options) };
}

function genChange(): ChangePayload {
  const paid = pick([10, 20, 50, 100, 200, 500]);
  let cost = Math.round(randInt(1, paid - 1) / 5) * 5;
  if (cost <= 0) cost = 5;
  if (cost >= paid) cost = paid - 5;
  return { mode: 'change', cost, paid };
}

function genCompare(config: BandConfig): ComparePayload {
  const maxPrice = config.compareMax;
  const [a, b] = shuffle(PRODUCTS).slice(0, 2);
  let leftPrice = randInt(1, maxPrice);
  let rightPrice = randInt(1, maxPrice);
  let guard = 0;
  while (leftPrice === rightPrice && guard < 10) {
    rightPrice = randInt(1, maxPrice);
    guard++;
  }
  return {
    mode: 'compare',
    left: { ...a, price: leftPrice },
    right: { ...b, price: rightPrice },
    askCheaper: Math.random() < 0.5,
  };
}

export function correctFor(payload: Payload): string {
  if (payload.mode === 'count') return String(payload.items.reduce((a, b) => a + b, 0));
  if (payload.mode === 'compose') {
    const match = payload.options.find((o) => o.sum === payload.target);
    return match ? match.id : payload.options[0].id;
  }
  if (payload.mode === 'change') return String(payload.paid - payload.cost);
  const lower = payload.left.price < payload.right.price ? payload.left : payload.right;
  const higher = payload.left.price > payload.right.price ? payload.left : payload.right;
  return payload.askCheaper ? lower.name : higher.name;
}

export function generate(
  difficulty: Difficulty,
  level: ProfileLevel = 'L3',
  classLevel?: ClassLevel,
): LevelData<Payload, string> {
  if (classLevel) {
    const scale = CLASS_MONEY_CONFIG[classLevel];
    // Перенесено зі старого paramsFor: <=1→count (порахувати), ===2→pay (compose: заплатити), ===3→change (дати решту).
    const mode: Mode = difficulty <= 1 ? 'count' : difficulty === 2 ? 'compose' : 'change';
    const rounds: Round<Payload, string>[] = Array.from({ length: 5 }, (_, i) => {
      const payload: Payload =
        mode === 'count' ? genCount(scale) : mode === 'compose' ? genCompose(scale) : genChangeForClass(scale.hrnPool);
      return { id: `r${i}`, payload, answer: correctFor(payload) };
    });
    return { difficulty, rounds };
  }

  const config = CONFIG_BY_BAND[gradeBandFor(level, difficulty)];
  const modes = shuffle(config.modes);
  const rounds: Round<Payload, string>[] = modes.map((mode, i) => {
    let payload: Payload;
    if (mode === 'count') payload = genCount(config);
    else if (mode === 'compose') payload = genCompose(config);
    else if (mode === 'change') payload = genChange();
    else payload = genCompare(config);
    return { id: `r${i}`, payload, answer: correctFor(payload) };
  });
  return { difficulty, rounds };
}
