import type { GameDefinition, GameComponentProps, Difficulty, ProfileLevel, LevelData, Round } from '../types';
import { PromptCard, ChoiceGrid, shuffle } from '../shared/ui';

interface ScenarioAction {
  label: string;
  isBest: boolean;
}

interface Scenario {
  level: ProfileLevel;
  situation: string;
  icon: string;
  actions: ScenarioAction[];
}

interface Payload {
  situation: string;
  icon: string;
  actions: string[];
}

const ROUNDS_PER_LEVEL = 5;

const SCENARIOS: Scenario[] = [
  {
    level: 'L0',
    situation: 'У друга в садочку впала іграшка. Він сидить і плаче.',
    icon: '😢',
    actions: [
      { label: 'Підняти іграшку і віддати йому', isBest: true },
      { label: 'Піти гратися в інше місце', isBest: false },
      { label: 'Посміятися з нього', isBest: false },
    ],
  },
  {
    level: 'L0',
    situation: 'Ти випадково розбив мамину улюблену чашку. Нікого поруч нема.',
    icon: '☕',
    actions: [
      { label: 'Розповісти мамі і вибачитись', isBest: true },
      { label: 'Сховати уламки', isBest: false },
      { label: 'Сказати, що це кіт', isBest: false },
    ],
  },
  {
    level: 'L0',
    situation: 'На вулиці сидить маленьке кошеня. Воно мокре і виглядає зголоднілим.',
    icon: '🐱',
    actions: [
      { label: 'Сказати мамі чи татові', isBest: true },
      { label: 'Взяти додому без дозволу', isBest: false },
      { label: 'Пройти мимо', isBest: false },
    ],
  },
  {
    level: 'L0',
    situation: 'У класі новенька дитина. На перерві вона стоїть сама біля вікна.',
    icon: '👋',
    actions: [
      { label: 'Підійти і покликати гратися з вами', isBest: true },
      { label: 'Подивитися здалеку', isBest: false },
      { label: 'Сказати, що він дивний', isBest: false },
    ],
  },
  {
    level: 'L3',
    situation: 'Ти забув зробити домашню. Вчителька зараз перевіряє зошити.',
    icon: '📚',
    actions: [
      { label: 'Чесно сказати: «Я забув»', isBest: true },
      { label: 'Сказати, що забув зошит удома', isBest: false },
      { label: 'Швидко списати у сусіда', isBest: false },
    ],
  },
  {
    level: 'L3',
    situation: 'Під час самостійної однокласник списує з твого зошита.',
    icon: '📖',
    actions: [
      { label: 'Тихо закрити зошит рукою', isBest: true },
      { label: 'Дати списати все', isBest: false },
      { label: 'Голосно сказати: «Ти списуєш!»', isBest: false },
    ],
  },
  {
    level: 'L3',
    situation: 'Ти знайшов гаманець на лавці. Всередині — гроші і документи.',
    icon: '👛',
    actions: [
      { label: 'Віддати дорослому, щоб знайти власника', isBest: true },
      { label: 'Залишити гроші собі', isBest: false },
      { label: 'Залишити на місці', isBest: false },
    ],
  },
  {
    level: 'L3',
    situation: 'Однокласника дражнять кілька дітей. Він стоїть мовчки і дивиться вниз.',
    icon: '😔',
    actions: [
      { label: 'Підійти і стати поруч з ним', isBest: true },
      { label: 'Дивитись мовчки', isBest: false },
      { label: 'Посміятись разом з іншими', isBest: false },
    ],
  },
];

function poolFor(level: ProfileLevel): Scenario[] {
  return SCENARIOS.filter((s) => s.level === level);
}

function pickScenarios(level: ProfileLevel, count: number): Scenario[] {
  const pool = poolFor(level);
  const picked = shuffle(pool).slice(0, count);
  while (picked.length < count && pool.length > 0) {
    picked.push(pool[picked.length % pool.length]);
  }
  return picked;
}

function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, string> {
  const scenarios = pickScenarios(level, ROUNDS_PER_LEVEL);
  const rounds: Round<Payload, string>[] = scenarios.map((s, i) => {
    const best = s.actions.find((a) => a.isBest)!;
    return {
      id: `r${i}`,
      payload: { situation: s.situation, icon: s.icon, actions: shuffle(s.actions.map((a) => a.label)) },
      answer: best.label,
    };
  });
  return { difficulty, rounds };
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { situation, icon, actions } = round.payload;
  const options = actions.map((label) => ({ value: label }));
  return (
    <>
      <PromptCard question={situation} answerState={answerState}>
        <div style={{ textAlign: 'center', margin: '8px auto' }}>
          <span style={{ fontSize: 56, lineHeight: 1 }}>{icon}</span>
        </div>
      </PromptCard>
      <ChoiceGrid
        options={options}
        correct={round.answer}
        disabled={disabled}
        answerState={answerState}
        onPick={onAnswer}
        columns={1}
      />
    </>
  );
}

const lifeScenarios: GameDefinition<Payload, string> = {
  id: 'life-scenarios',
  title: 'Життєві ситуації',
  subject: 'life',
  levels: ['L0', 'L3'],
  icon: '💡',
  description: 'Як правильно вчинити?',
  accent: '#FEF3C7',
  generate,
  Component,
};

export default lifeScenarios;
