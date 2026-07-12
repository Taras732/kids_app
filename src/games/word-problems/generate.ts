import type { Difficulty, LevelData, Round } from '../types';
import { randInt } from '../shared/ui';

/** Один крок CPA-схеми: група емодзі-об'єктів + операція, що передує їй (нема — для першого кроку). */
export interface HintStep {
  emoji: string;
  count: number;
  op?: '+' | '-';
}

export interface WordProblemPayload {
  text: string;
  emoji: string;
  /** null => підказки немає (Hard). */
  hint: HintStep[] | null;
}

type ProblemResult = { text: string; answer: number; emoji: string; hint: HintStep[] | null };

const ROUNDS_PER_LEVEL = 5;

/** Форми іменника: [1, 2-4, 5+] — стандартна українська числівниково-іменникова угода. */
type PluralForms = [string, string, string];

function plural(n: number, forms: PluralForms): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

/**
 * Число для тексту задачі: як randInt, але уникає "одиничної" форми (21, 31, ...),
 * бо в реченнях, де іменник — прямий додаток (напр. "дала ще 21 гривню"),
 * форма з plural() дає називний відмінок, а треба знахідний. Зсув на ±1
 * прибирає цю розбіжність, не чіпаючи форми 2-4 і 5+ (вони збігаються в обох відмінках).
 */
function safeCount(min: number, max: number): number {
  const n = randInt(min, max);
  if (n % 10 === 1 && n % 100 !== 11 && n > 1) {
    return n + 1 <= max ? n + 1 : Math.max(min, n - 1);
  }
  return n;
}

function hintTotal(hint: HintStep[]): number {
  return hint.reduce((acc, step, i) => (i === 0 ? step.count : step.op === '-' ? acc - step.count : acc + step.count), 0);
}

// ---------- Easy: одна дія, числа 10-20 ----------

function easyAppleAdd(): ProblemResult {
  const forms: PluralForms = ['яблуко', 'яблука', 'яблук'];
  const a = safeCount(3, 10);
  const b = safeCount(2, Math.min(8, 20 - a));
  const text = `У кошику лежало ${a} ${plural(a, forms)}. Мама поклала ще ${b} ${plural(b, forms)}. Скільки яблук стало в кошику?`;
  return { text, answer: a + b, emoji: '🍎', hint: [{ emoji: '🍎', count: a }, { emoji: '🍎', count: b, op: '+' }] };
}

function easyPencilSubtract(): ProblemResult {
  const forms: PluralForms = ['олівець', 'олівці', 'олівців'];
  const a = safeCount(9, 20);
  const b = safeCount(2, a - 3);
  const text = `У Тараса було ${a} ${plural(a, forms)}. Він віддав другові ${b} ${plural(b, forms)}. Скільки олівців залишилось у Тараса?`;
  return { text, answer: a - b, emoji: '✏️', hint: [{ emoji: '✏️', count: a }, { emoji: '✏️', count: b, op: '-' }] };
}

function easyBirdsAdd(): ProblemResult {
  const forms: PluralForms = ['пташка', 'пташки', 'пташок'];
  const a = safeCount(4, 12);
  const b = safeCount(2, Math.min(8, 20 - a));
  const text = `На гілці сиділо ${a} ${plural(a, forms)}. Прилетіло ще ${b} ${plural(b, forms)}. Скільки пташок стало на гілці?`;
  return { text, answer: a + b, emoji: '🐦', hint: [{ emoji: '🐦', count: a }, { emoji: '🐦', count: b, op: '+' }] };
}

function easyCandySubtract(): ProblemResult {
  const forms: PluralForms = ['цукерка', 'цукерки', 'цукерок'];
  const a = safeCount(10, 20);
  const b = safeCount(2, a - 2);
  const text = `У вазі було ${a} ${plural(a, forms)}. Діти з'їли ${b} ${plural(b, forms)}. Скільки цукерок залишилось у вазі?`;
  return { text, answer: a - b, emoji: '🍬', hint: [{ emoji: '🍬', count: a }, { emoji: '🍬', count: b, op: '-' }] };
}

function easyKopecksAdd(): ProblemResult {
  const forms: PluralForms = ['копійка', 'копійки', 'копійок'];
  const a = safeCount(3, 12);
  const b = safeCount(2, Math.min(8, 20 - a));
  const text = `У скарбничці лежало ${a} ${plural(a, forms)}. Тато поклав ще ${b} ${plural(b, forms)}. Скільки копійок стало у скарбничці?`;
  return { text, answer: a + b, emoji: '🪙', hint: [{ emoji: '🪙', count: a }, { emoji: '🪙', count: b, op: '+' }] };
}

const EASY_TEMPLATES = [easyAppleAdd, easyPencilSubtract, easyBirdsAdd, easyCandySubtract, easyKopecksAdd];

// ---------- Medium: до 100, дві дії або порівняння ----------

function mediumTwoStep(): ProblemResult {
  const forms: PluralForms = ['гривня', 'гривні', 'гривень'];
  const a = safeCount(15, 40);
  const b = safeCount(5, 25);
  const c = safeCount(3, Math.min(20, a + b - 5));
  const text = `У Софійки було ${a} ${plural(a, forms)}. Бабуся дала ще ${b} ${plural(b, forms)}. Софійка витратила ${c} ${plural(c, forms)} на морозиво. Скільки гривень залишилось у Софійки?`;
  return {
    text,
    answer: a + b - c,
    emoji: '💰',
    hint: [{ emoji: '🪙', count: a }, { emoji: '🪙', count: b, op: '+' }, { emoji: '🪙', count: c, op: '-' }],
  };
}

function mediumCompare(): ProblemResult {
  const forms: PluralForms = ['цукерка', 'цукерки', 'цукерок'];
  const a = safeCount(20, 90);
  const diff = safeCount(5, Math.min(30, a - 5));
  const b = a - diff;
  const text = `У вазі Марійки лежало ${a} ${plural(a, forms)}, а у вазі Олега — ${b} ${plural(b, forms)}. На скільки цукерок більше у Марійки?`;
  return { text, answer: diff, emoji: '🍬', hint: [{ emoji: '🍬', count: a }, { emoji: '🍬', count: b, op: '-' }] };
}

function mediumBoxesAdd(): ProblemResult {
  const forms: PluralForms = ['кролик', 'кролики', 'кроликів'];
  const babyForms: PluralForms = ['кроленя', 'кроленята', 'кроленят'];
  const a = safeCount(12, 45);
  const b = safeCount(10, 40);
  const text = `На фермі було ${a} ${plural(a, forms)}. Народилось ще ${b} ${plural(b, babyForms)}. Скільки кроликів стало на фермі?`;
  return { text, answer: a + b, emoji: '🐇', hint: [{ emoji: '🐇', count: a }, { emoji: '🐇', count: b, op: '+' }] };
}

const MEDIUM_TEMPLATES = [mediumTwoStep, mediumCompare, mediumBoxesAdd];

// ---------- Hard: багатокрокові / різниця / кратне, без підказки ----------

function hardThreeStep(): ProblemResult {
  const forms: PluralForms = ['цукерка', 'цукерки', 'цукерок'];
  const a = safeCount(30, 80);
  const b = safeCount(10, 40);
  const c = safeCount(5, 25);
  const text = `У магазині було ${a} ${plural(a, forms)}. Привезли ще ${b} ${plural(b, forms)}, а потім продали ${c} ${plural(c, forms)}. Скільки цукерок залишилось у магазині?`;
  return { text, answer: a + b - c, emoji: '🍬', hint: null };
}

function hardMultiples(): ProblemResult {
  const boxForms: PluralForms = ['олівець', 'олівці', 'олівців'];
  const perBox = safeCount(6, 12);
  const boxes = safeCount(4, 9);
  const text = `У кожній коробці лежить по ${perBox} ${plural(perBox, boxForms)}. Скільки всього олівців у ${boxes} коробках?`;
  return { text, answer: perBox * boxes, emoji: '📦', hint: null };
}

function hardDifferenceMultiStep(): ProblemResult {
  const forms: PluralForms = ['гривня', 'гривні', 'гривень'];
  const a = safeCount(40, 95);
  const b = safeCount(10, a - 20);
  const c = safeCount(5, 15);
  const ivan = a - b;
  const text = `У Максима було ${a} ${plural(a, forms)}, а в Івана — на ${b} ${plural(b, forms)} менше. Скільки гривень стане в Івана, якщо тато додасть йому ще ${c} ${plural(c, forms)}?`;
  return { text, answer: ivan + c, emoji: '💰', hint: null };
}

const HARD_TEMPLATES = [hardThreeStep, hardMultiples, hardDifferenceMultiStep];

function poolFor(difficulty: Difficulty): (() => ProblemResult)[] {
  if (difficulty === 1) return EASY_TEMPLATES;
  if (difficulty === 2) return MEDIUM_TEMPLATES;
  return HARD_TEMPLATES;
}

export function generate(difficulty: Difficulty): LevelData<WordProblemPayload, number> {
  const pool = poolFor(difficulty);
  const rounds: Round<WordProblemPayload, number>[] = [];
  let lastIdx = -1;
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    let idx = randInt(0, pool.length - 1);
    if (pool.length > 1 && idx === lastIdx) idx = (idx + 1) % pool.length;
    lastIdx = idx;
    const { text, answer, emoji, hint } = pool[idx]();
    rounds.push({ id: `r${i}`, payload: { text, emoji, hint }, answer });
  }
  return { difficulty, rounds };
}

/** Dev-only self-check: N задач на складність мають давати натуральну відповідь, узгоджену зі схемою підказки. */
export function selfCheck(roundsPerDifficulty = 40): boolean {
  const difficulties: Difficulty[] = [1, 2, 3];
  let allOk = true;
  let checked = 0;
  for (const difficulty of difficulties) {
    const pool = poolFor(difficulty);
    for (let i = 0; i < roundsPerDifficulty; i++) {
      for (const tmpl of pool) {
        const { answer, hint } = tmpl();
        checked++;
        if (!Number.isInteger(answer) || answer < 1) {
          allOk = false;
          // eslint-disable-next-line no-console
          console.error(`[word-problems] self-check FAIL: difficulty=${difficulty} answer=${answer} (не натуральне число)`);
        }
        if (hint && hintTotal(hint) !== answer) {
          allOk = false;
          // eslint-disable-next-line no-console
          console.error(`[word-problems] self-check FAIL: difficulty=${difficulty} hint не збігається з answer=${answer}`);
        }
      }
    }
  }
  // eslint-disable-next-line no-console
  if (allOk) console.info(`[word-problems] self-check OK: ${checked} задач, усі відповіді — натуральні числа, підказки узгоджені.`);
  return allOk;
}
