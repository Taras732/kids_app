import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { shuffle } from '../shared/ui';

/** Частина мови (D6: іменник/дієслово/прикметник — базовий набір для 2-4 класу). */
export type Pos = 'Іменник' | 'Дієслово' | 'Прикметник';

export interface Payload {
  sentence: string;
  /** Виділене слово (точний підрядок sentence), для якого визначаємо частину мови. */
  target: string;
  /** Завжди всі 3 категорії, у перемішаному порядку. */
  options: Pos[];
}

const ROUNDS_PER_LEVEL = 5;
const POS_OPTIONS: Pos[] = ['Іменник', 'Дієслово', 'Прикметник'];

interface Entry {
  sentence: string;
  target: string;
  pos: Pos;
}

// Band L2 (~2 клас): короткі прості речення, очевидне слово.
const L2_SENTENCES: Entry[] = [
  { sentence: 'Кіт спить на килимку.', target: 'Кіт', pos: 'Іменник' },
  { sentence: 'Собака біжить швидко.', target: 'біжить', pos: 'Дієслово' },
  { sentence: "Великий м'яч лежить у кутку.", target: 'Великий', pos: 'Прикметник' },
  { sentence: 'Мама готує вечерю.', target: 'Мама', pos: 'Іменник' },
  { sentence: 'Пташка співає в лісі.', target: 'співає', pos: 'Дієслово' },
  { sentence: 'Червоне яблуко впало з дерева.', target: 'Червоне', pos: 'Прикметник' },
  { sentence: 'Хлопчик малює будинок.', target: 'Хлопчик', pos: 'Іменник' },
  { sentence: 'Діти граються у дворі.', target: 'граються', pos: 'Дієслово' },
  { sentence: 'Пухнастий кролик стрибає по траві.', target: 'Пухнастий', pos: 'Прикметник' },
  { sentence: 'Вчителька пише на дошці.', target: 'Вчителька', pos: 'Іменник' },
];

// Band L3 (~3 клас): довші речення, більше контексту навколо цільового слова.
const L3_SENTENCES: Entry[] = [
  { sentence: 'Маленький хлопчик швидко біг до школи.', target: 'хлопчик', pos: 'Іменник' },
  { sentence: 'Діти весело співали пісню на святі.', target: 'співали', pos: 'Дієслово' },
  { sentence: 'Смачний пиріг стояв на столі.', target: 'Смачний', pos: 'Прикметник' },
  { sentence: 'Учитель пояснював новий урок дітям.', target: 'Учитель', pos: 'Іменник' },
  { sentence: 'Собака голосно гавкав на кота.', target: 'гавкав', pos: 'Дієслово' },
  { sentence: 'Веселий клоун розсмішив усіх глядачів.', target: 'Веселий', pos: 'Прикметник' },
  { sentence: 'Річка тихо текла через ліс.', target: 'Річка', pos: 'Іменник' },
  { sentence: 'Зайчик швидко втік у кущі.', target: 'втік', pos: 'Дієслово' },
  { sentence: 'Синій метелик сів на квітку.', target: 'Синій', pos: 'Прикметник' },
  { sentence: 'Бабуся зварила смачний борщ.', target: 'Бабуся', pos: 'Іменник' },
];

// Band L4 (~4 клас): менш очевидна лексика, довші речення.
const L4_SENTENCES: Entry[] = [
  { sentence: 'Досвідчений капітан впевнено керував великим кораблем.', target: 'капітан', pos: 'Іменник' },
  { sentence: 'Спортсмени наполегливо тренувалися перед важливими змаганнями.', target: 'тренувалися', pos: 'Дієслово' },
  { sentence: 'Стародавній замок височів на крутому пагорбі.', target: 'Стародавній', pos: 'Прикметник' },
  { sentence: 'Науковець уважно досліджував рідкісну рослину.', target: 'Науковець', pos: 'Іменник' },
  { sentence: 'Мандрівники подолали складний гірський перевал.', target: 'подолали', pos: 'Дієслово' },
  { sentence: "Загадковий острів з'явився серед океану.", target: 'Загадковий', pos: 'Прикметник' },
  { sentence: 'Архітектор спроєктував незвичайну будівлю музею.', target: 'Архітектор', pos: 'Іменник' },
  { sentence: 'Вправна майстриня вишила барвистий рушник.', target: 'вишила', pos: 'Дієслово' },
  { sentence: "Кмітливий учень швидко розв'язав важку задачу.", target: 'Кмітливий', pos: 'Прикметник' },
];

const POOL_BY_BAND: Record<GradeBand, Entry[]> = {
  L0: L2_SENTENCES,
  L1: L2_SENTENCES,
  L2: L2_SENTENCES,
  L3: L3_SENTENCES,
  L4: L4_SENTENCES,
};

export function generate(difficulty: Difficulty, level: ProfileLevel = 'L3'): LevelData<Payload, Pos> {
  const band = gradeBandFor(level, difficulty);
  const pool = POOL_BY_BAND[band];
  const chosen = shuffle(pool).slice(0, ROUNDS_PER_LEVEL);
  const rounds: Round<Payload, Pos>[] = chosen.map((entry, i) => ({
    id: `r${i}`,
    payload: { sentence: entry.sentence, target: entry.target, options: shuffle(POS_OPTIONS) },
    answer: entry.pos,
  }));
  return { difficulty, rounds };
}
