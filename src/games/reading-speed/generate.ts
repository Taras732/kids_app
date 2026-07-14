import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { shuffle } from '../shared/ui';

/**
 * Техніка читання (D6): два режими залежно від GradeBand (D5 шкала).
 *  - 'word' (band L2, ~2 клас): дитина читає одне слово і серед схожих
 *    за виглядом/довжиною слів обирає те, яке щойно прочитала.
 *  - 'comprehension' (band L3-L4, ~3-4 клас): дитина читає фразу/речення і
 *    відповідає на просте питання щодо прочитаного (перевірка розуміння).
 */
export type Mode = 'word' | 'comprehension';

export interface Payload {
  mode: Mode;
  /** Слово (word) або речення (comprehension) для читання. */
  text: string;
  /** Питання під текстом (для word — інструкція "яке слово ти прочитав"). */
  question: string;
  options: string[];
}

const ROUNDS_PER_LEVEL = 5;

interface WordEntry {
  target: string;
  distractors: string[];
}

interface CompEntry {
  text: string;
  question: string;
  answer: string;
  distractors: string[];
}

// Band L2 (~2 клас): слова, схожі за довжиною/закінченням — тренування
// уважного читання (не вгадування за формою слова).
const L2_WORDS: WordEntry[] = [
  { target: 'кіт', distractors: ['лев', 'віл', 'жук'] },
  { target: 'сонце', distractors: ['серце', 'кільце', 'озеро'] },
  { target: 'книга', distractors: ['ріка', 'нога', 'рука'] },
  { target: 'зима', distractors: ['весна', 'літо', 'осінь'] },
  { target: 'ліс', distractors: ['лист', 'лис', 'лід'] },
  { target: 'риба', distractors: ['жаба', 'липа', 'лапа'] },
  { target: 'мама', distractors: ['тато', 'баба', 'няня'] },
  { target: 'квітка', distractors: ['клітка', 'плівка', 'нитка'] },
  { target: 'школа', distractors: ['парта', 'дошка', 'сумка'] },
  { target: 'сонях', distractors: ['гриб', 'дуб', 'кущ'] },
];

// Band L3 (~3 клас): короткі фрази + просте питання на розуміння.
const L3_PHRASES: CompEntry[] = [
  { text: "Кіт п'є молоко.", question: 'Що п\'є кіт?', answer: 'Молоко', distractors: ['Воду', 'Сік', 'Чай'] },
  { text: 'Дівчинка малює сонце.', question: 'Що малює дівчинка?', answer: 'Сонце', distractors: ['Квітку', 'Будинок', 'Машину'] },
  { text: 'Хлопчик читає книжку.', question: 'Що читає хлопчик?', answer: 'Книжку', distractors: ['Газету', 'Листа', 'Журнал'] },
  { text: 'Пес біжить у двір.', question: 'Куди біжить пес?', answer: 'У двір', distractors: ['У ліс', 'У школу', 'У парк'] },
  { text: 'Бабуся пече пиріг.', question: 'Що пече бабуся?', answer: 'Пиріг', distractors: ['Хліб', 'Торт', 'Млинці'] },
  { text: 'Учень пише вправу.', question: 'Що пише учень?', answer: 'Вправу', distractors: ['Лист', 'Диктант', 'Твір'] },
  { text: 'Пташка сидить на гілці.', question: 'Де сидить пташка?', answer: 'На гілці', distractors: ['На даху', 'На землі', 'На паркані'] },
  { text: 'Мама варить суп.', question: 'Що варить мама?', answer: 'Суп', distractors: ['Кашу', 'Компот', 'Борщ'] },
];

// Band L4 (~4 клас): довші речення + питання на розуміння деталей.
const L4_SENTENCES: CompEntry[] = [
  {
    text: 'Маленька дівчинка читала цікаву книжку у бібліотеці.',
    question: 'Де дівчинка читала книжку?',
    answer: 'У бібліотеці',
    distractors: ['Вдома', 'У школі', 'У парку'],
  },
  {
    text: 'Хлопці грали у футбол на шкільному стадіоні.',
    question: 'У що грали хлопці?',
    answer: 'У футбол',
    distractors: ['У баскетбол', 'У теніс', 'У волейбол'],
  },
  {
    text: 'Восени листя на деревах стає жовтим і червоним.',
    question: 'Якого кольору стає листя восени?',
    answer: 'Жовтим і червоним',
    distractors: ['Зеленим і синім', 'Білим і чорним', 'Фіолетовим і рожевим'],
  },
  {
    text: 'Тато відремонтував старий велосипед у гаражі.',
    question: 'Що відремонтував тато?',
    answer: 'Велосипед',
    distractors: ['Машину', 'Драбину', 'Стілець'],
  },
  {
    text: 'Учні писали контрольну роботу з математики.',
    question: 'З якого предмету була контрольна робота?',
    answer: 'З математики',
    distractors: ['З мови', 'З природознавства', 'З малювання'],
  },
  {
    text: 'Бабуся розповіла онукам казку про хороброго лицаря.',
    question: 'Про кого була казка?',
    answer: 'Про лицаря',
    distractors: ['Про принцесу', 'Про дракона', 'Про короля'],
  },
  {
    text: 'Родина поїхала на відпочинок до моря влітку.',
    question: 'Куди поїхала родина?',
    answer: 'До моря',
    distractors: ['У гори', 'До лісу', 'У село'],
  },
  {
    text: 'Вчителька похвалила учня за акуратний почерк.',
    question: 'За що вчителька похвалила учня?',
    answer: 'За почерк',
    distractors: ['За малюнок', 'За відповідь', 'За поведінку'],
  },
];

function optionsCountFor(d: Difficulty): number {
  return d === 1 ? 3 : 4;
}

function buildWordRounds(optCount: number): Round<Payload, string>[] {
  const chosen = shuffle(L2_WORDS).slice(0, ROUNDS_PER_LEVEL);
  return chosen.map((entry, i) => {
    const distractors = shuffle(entry.distractors).slice(0, optCount - 1);
    const options = shuffle([entry.target, ...distractors]);
    return {
      id: `r${i}`,
      payload: { mode: 'word', text: entry.target, question: 'Яке слово ти прочитав?', options },
      answer: entry.target,
    };
  });
}

function buildCompRounds(pool: CompEntry[], optCount: number): Round<Payload, string>[] {
  const chosen = shuffle(pool).slice(0, ROUNDS_PER_LEVEL);
  return chosen.map((entry, i) => {
    const distractors = shuffle(entry.distractors).slice(0, optCount - 1);
    const options = shuffle([entry.answer, ...distractors]);
    return {
      id: `r${i}`,
      payload: { mode: 'comprehension', text: entry.text, question: entry.question, options },
      answer: entry.answer,
    };
  });
}

const POOL_BY_BAND: Partial<Record<GradeBand, CompEntry[]>> = {
  L3: L3_PHRASES,
  L4: L4_SENTENCES,
};

export function generate(difficulty: Difficulty, level: ProfileLevel = 'L3'): LevelData<Payload, string> {
  const band = gradeBandFor(level, difficulty);
  const optCount = optionsCountFor(difficulty);
  const rounds = band === 'L2' ? buildWordRounds(optCount) : buildCompRounds(POOL_BY_BAND[band] ?? L4_SENTENCES, optCount);
  return { difficulty, rounds };
}
