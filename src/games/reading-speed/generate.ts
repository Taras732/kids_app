import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { shuffle } from '../shared/ui';

/**
 * Читання з розумінням (D6, перероблено після Q15): два режими залежно від
 * GradeBand (D5 шкала). Головний інваріант обох режимів — правильну відповідь
 * НЕ можна отримати простим звірянням символів із показаним текстом (стара
 * версія показувала слово «зима» і серед варіантів саме слово «зима» —
 * тавтологія, дитина нічого не читала, лише порівнювала форму).
 *  - 'picture' (band L2, ~2 клас): дитина читає слово і серед emoji-картинок
 *    обирає ту, що відповідає ЗНАЧЕННЮ слова (інша модальність відповіді —
 *    картинка, а не копія слова).
 *  - 'riddle' (band L3-L4, ~3-4 клас): дитина читає короткий опис-загадку
 *    («Він падає взимку і білий») і обирає слово, яке підходить за ЗМІСТОМ;
 *    саме слово-відповідь ніколи не зустрічається у тексті загадки.
 */
export type Mode = 'picture' | 'riddle';

export interface Payload {
  mode: Mode;
  /** Слово для читання (picture) або текст загадки-опису (riddle). */
  text: string;
  /** Інструкція під текстом. */
  question: string;
  /** Варіанти відповіді: emoji (picture) або слова (riddle). */
  options: string[];
}

const ROUNDS_PER_LEVEL = 5;

interface WordEntry {
  word: string;
  emoji: string;
}

interface RiddleEntry {
  riddle: string;
  answer: string;
  distractors: string[];
}

// Band L2 (~2 клас): слово → картинка, що йому відповідає. Відповідь
// (emoji) не збігається символьно зі словом — потрібно зрозуміти значення.
const L2_WORDS: WordEntry[] = [
  { word: 'кіт', emoji: '🐱' },
  { word: 'собака', emoji: '🐶' },
  { word: 'сонце', emoji: '☀️' },
  { word: 'книга', emoji: '📖' },
  { word: 'риба', emoji: '🐟' },
  { word: 'яблуко', emoji: '🍎' },
  { word: 'квітка', emoji: '🌸' },
  { word: 'дерево', emoji: '🌳' },
  { word: 'зірка', emoji: '⭐' },
  { word: 'будинок', emoji: '🏠' },
  { word: 'машина', emoji: '🚗' },
  { word: 'пташка', emoji: '🐦' },
  { word: 'гриб', emoji: '🍄' },
  { word: 'зайчик', emoji: '🐰' },
];

// Band L3 (~3 клас): короткі загадки-описи. Слово-відповідь навмисно
// відсутнє в тексті загадки — дитина мусить зрозуміти зміст, а не звірити літери.
const L3_RIDDLES: RiddleEntry[] = [
  { riddle: 'Він падає взимку і білий.', answer: 'Сніг', distractors: ['Дощ', 'Пісок', 'Листок'] },
  // без займенника: «Вона» вказувало на жіночий рід (Зірка/Свічка), хоч відповідь — Сонце (воно)
  { riddle: 'Світить удень і зігріває всю землю.', answer: 'Сонце', distractors: ['Місяць', 'Зірка', 'Свічка'] },
  { riddle: 'Цей звір нявкає і ловить мишей.', answer: 'Кіт', distractors: ['Собака', 'Кінь', 'Корова'] },
  {
    riddle: "У цій будівлі діти вчаться читати й рахувати.",
    answer: 'Школа',
    distractors: ['Лікарня', 'Магазин', 'Бібліотека'],
  },
  {
    riddle: "Ця пташка живе на подвір'ї і будить усіх вранці.",
    answer: 'Півень',
    distractors: ['Горобець', 'Ворона', 'Голуб'],
  },
  // без займенника: «У ній» вказувало на жіночий рід (Нора), хоч відповідь — Вулик (він)
  { riddle: 'Тут живуть бджоли і зберігають мед.', answer: 'Вулик', distractors: ['Нора', 'Гніздо', 'Дупло'] },
  {
    // без слова «фрукт»: воно одразу відсікало овочі-дистрактори → завдання ставало тривіальним
    riddle: 'Росте на дереві, буває червоне або зелене, дуже хрумке.',
    answer: 'Яблуко',
    distractors: ['Огірок', 'Морква', 'Картопля'],
  },
  {
    riddle: 'Ця пора року, коли на деревах жовте й червоне листя.',
    answer: 'Осінь',
    distractors: ['Весна', 'Літо', 'Зима'],
  },
];

// Band L4 (~4 клас): довші загадки, складніший словниковий запас.
const L4_RIDDLES: RiddleEntry[] = [
  {
    riddle: 'Ця планета обертається навколо Сонця, і на ній живуть люди.',
    answer: 'Земля',
    distractors: ['Місяць', 'Марс', 'Зірка'],
  },
  {
    riddle: 'У цій країні є Карпати, Дніпро і столиця Київ.',
    answer: 'Україна',
    distractors: ['Польща', 'Франція', 'Німеччина'],
  },
  {
    riddle: 'Це дерево прикрашають іграшками та вогниками взимку на свято.',
    answer: 'Ялинка',
    distractors: ['Дуб', 'Береза', 'Тополя'],
  },
  {
    riddle: 'Цей орган у людини перекачує кров по тілу.',
    answer: 'Серце',
    distractors: ['Мозок', 'Шлунок', 'Легені'],
  },
  {
    riddle: 'Цей письмовий прилад використовують, щоб стирати олівець.',
    answer: 'Гумка',
    distractors: ['Лінійка', 'Циркуль', 'Транспортир'],
  },
  {
    riddle: 'У цій установі можна взяти книжки додому безкоштовно.',
    answer: 'Бібліотека',
    distractors: ['Школа', 'Магазин', 'Пошта'],
  },
  {
    riddle: "Цей яскравий спалах світла з'являється в небі під час грози.",
    answer: 'Блискавка',
    distractors: ['Веселка', 'Хмара', 'Туман'],
  },
  {
    riddle: 'Ця пора року найтепліша, і діти відпочивають від школи.',
    answer: 'Літо',
    distractors: ['Осінь', 'Зима', 'Весна'],
  },
];

function optionsCountFor(d: Difficulty): number {
  return d === 1 ? 3 : 4;
}

function buildPictureRounds(optCount: number): Round<Payload, string>[] {
  const chosen = shuffle(L2_WORDS).slice(0, ROUNDS_PER_LEVEL);
  return chosen.map((entry, i) => {
    const distractors = shuffle(L2_WORDS.filter((w) => w.word !== entry.word))
      .slice(0, optCount - 1)
      .map((w) => w.emoji);
    const options = shuffle([entry.emoji, ...distractors]);
    return {
      id: `r${i}`,
      payload: { mode: 'picture', text: entry.word, question: 'Прочитай слово і обери картинку', options },
      answer: entry.emoji,
    };
  });
}

function buildRiddleRounds(pool: RiddleEntry[], optCount: number): Round<Payload, string>[] {
  const chosen = shuffle(pool).slice(0, ROUNDS_PER_LEVEL);
  return chosen.map((entry, i) => {
    const distractors = shuffle(entry.distractors).slice(0, optCount - 1);
    const options = shuffle([entry.answer, ...distractors]);
    return {
      id: `r${i}`,
      payload: { mode: 'riddle', text: entry.riddle, question: 'Про що йдеться? Обери слово', options },
      answer: entry.answer,
    };
  });
}

const POOL_BY_BAND: Partial<Record<GradeBand, RiddleEntry[]>> = {
  L3: L3_RIDDLES,
  L4: L4_RIDDLES,
};

export function generate(difficulty: Difficulty, level: ProfileLevel = 'L3'): LevelData<Payload, string> {
  const band = gradeBandFor(level, difficulty);
  const optCount = optionsCountFor(difficulty);
  const rounds =
    band === 'L2' ? buildPictureRounds(optCount) : buildRiddleRounds(POOL_BY_BAND[band] ?? L4_RIDDLES, optCount);
  return { difficulty, rounds };
}
