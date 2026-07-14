import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
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

function poolFor(unit: Unit, config: BandConfig): number[] {
  if (unit === 'kop') return [1, 2, 5, 10];
  return config.hrnPool;
}

/** Easy-бенди інколи працюють у копійках — окремий контекст від гривень. */
function pickUnit(config: BandConfig): Unit {
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

function genCount(config: BandConfig): CountPayload {
  const unit = pickUnit(config);
  const pool = poolFor(unit, config);
  const [minCount, maxCount] = config.countRange;
  return { mode: 'count', unit, items: randomItems(pool, minCount, maxCount) };
}

function genCompose(config: BandConfig): ComposePayload {
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

export function generate(difficulty: Difficulty, level: ProfileLevel = 'L3'): LevelData<Payload, string> {
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
