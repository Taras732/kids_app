import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, randInt, shuffle } from '../shared/ui';

interface WordEntry {
  word: string;
  syllables: string[];
  hint: string;
}

// Прості укр. слова. Односкладові (syllables.length === 1) → відповідь = ціле слово.
const WORDS: WordEntry[] = [
  { word: 'МАМА', syllables: ['МА', 'МА'], hint: '👩' },
  { word: 'ВОДА', syllables: ['ВО', 'ДА'], hint: '💧' },
  { word: 'РИБА', syllables: ['РИ', 'БА'], hint: '🐟' },
  { word: 'СОНЦЕ', syllables: ['СОН', 'ЦЕ'], hint: '☀️' },
  { word: 'ЖАБА', syllables: ['ЖА', 'БА'], hint: '🐸' },
  { word: 'КАША', syllables: ['КА', 'ША'], hint: '🥣' },
  { word: 'РУКА', syllables: ['РУ', 'КА'], hint: '✋' },
  { word: 'НОГА', syllables: ['НО', 'ГА'], hint: '🦶' },
  { word: 'КОТ', syllables: ['КОТ'], hint: '🐈' },
  { word: 'СИР', syllables: ['СИР'], hint: '🧀' },
  { word: 'ДІМ', syllables: ['ДІМ'], hint: '🏠' },
  { word: 'ЛИСТ', syllables: ['ЛИСТ'], hint: '🍂' },
];

// Пул складів-відволікачів для слів з кількома складами.
const SYLLABLE_POOL = [
  'МА', 'ВО', 'ДА', 'РИ', 'БА', 'СОН', 'ЦЕ', 'ЖА', 'КА', 'ША',
  'РУ', 'НО', 'ГА', 'ТА', 'НА', 'ЛА', 'РА', 'СА', 'ВА', 'ЗА', 'ПА', 'ФА',
];

function optionsCountFor(d: Difficulty): number {
  return d === 1 ? 3 : 4;
}

/** Два рядки "близькі", якщо збігається перша або остання літера (плутанина на слух). */
function isClose(a: string, b: string): boolean {
  return a[0] === b[0] || a[a.length - 1] === b[b.length - 1];
}

/** Відволікачі: близькі за звучанням (diff3) або свідомо несхожі (diff1/2). */
function pickDistractors(target: string, pool: string[], count: number, useSimilar: boolean): string[] {
  const rest = pool.filter((s) => s !== target);
  const primary = useSimilar ? rest.filter((s) => isClose(s, target)) : rest.filter((s) => !isClose(s, target));
  const secondary = useSimilar ? rest.filter((s) => !isClose(s, target)) : rest.filter((s) => isClose(s, target));
  const combined = shuffle(primary).concat(shuffle(secondary));
  return combined.slice(0, count);
}

interface Payload {
  word: string;
  display: string;
  hint: string;
  options: string[];
}

function generate(difficulty: Difficulty): LevelData<Payload, string> {
  const total = optionsCountFor(difficulty);
  const useSimilar = difficulty === 3;
  const chosen = shuffle(WORDS).slice(0, 5);

  const rounds: Round<Payload, string>[] = chosen.map((entry, i) => {
    const isMono = entry.syllables.length === 1;
    const blankIdx = isMono ? 0 : randInt(0, entry.syllables.length - 1);
    const target = entry.syllables[blankIdx];

    const pool = isMono
      ? WORDS.filter((w) => w.syllables.length === 1 && w.word !== entry.word).map((w) => w.word)
      : SYLLABLE_POOL.filter((s) => s !== target && !entry.syllables.includes(s));

    const distractors = pickDistractors(target, pool, total - 1, useSimilar);
    const options = shuffle([target, ...distractors]);
    const display = entry.syllables.map((s, idx) => (idx === blankIdx ? '_'.repeat(s.length) : s)).join('');

    return {
      id: `r${i}`,
      payload: { word: entry.word, display, hint: entry.hint, options },
      answer: target,
    };
  });

  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { display, hint, options } = round.payload;
  const choices = options.map((s) => ({
    value: s,
    node: <span style={{ fontSize: 26, fontWeight: 800 }}>{s}</span>,
  }));
  return (
    <>
      <PromptCard question="Склади слово" answerState={answerState}>
        <div style={{ fontSize: 48, margin: '4px auto 10px' }}>{hint}</div>
        <div
          style={{
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: 4,
            color: 'var(--c-primary)',
            textAlign: 'center',
          }}
        >
          {display}
        </div>
      </PromptCard>
      <ChoiceGrid options={choices} correct={round.answer} disabled={disabled} answerState={answerState} onPick={onAnswer} />
    </>
  );
}

const syllableBuild: GameDefinition<Payload, string> = {
  id: 'syllable-build',
  title: 'Склади слово',
  subject: 'language',
  levels: ['L0'],
  icon: '🔡',
  description: 'Склади склад/слово.',
  accent: '#EEEBFF',
  generate,
  Component,
  // TODO(A2-мова): skills після seed skill-graph мови
};

export default syllableBuild;
