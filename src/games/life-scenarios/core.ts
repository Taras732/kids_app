// EP4 — «Що буде далі?»: наслідок замість оцінки. Чиста логіка без React/IO.
//
// Було: дитина обирала дію і бачила лише червоне/зелене. Це фідбек типу KR —
// «правильно/ні» без пояснення, ефект d≈0.05, статистичний нуль. А в соціальній
// ситуації «неправильно» взагалі не існує: існують НАСЛІДКИ. Червона рамка тут
// ще й читається як докір, який дитина запам'ятає замість самого уроку.
//
// Стало (Breathe-Think-Do, Sesame Workshop): вдихни → подумай → зроби, і побач,
// ЩО СТАЛОСЬ саме від твого вибору. Це та сама consequence-replay, що в движку
// «Правило» — найсильніша форма пояснення, лише для вчинків, а не для прикладів.
//
// Наслідки написані як події, а не як мораль: «друг лишився сам» замість
// «так робити не можна».

import type { ProfileLevel } from '../types';

export interface ScenarioAction {
  label: string;
  isBest: boolean;
  /** Що станеться саме від цього вибору. Подія, не оцінка й не мораль. */
  consequence: string;
  /** Емодзі-настрій наслідку (не оцінка «правильно/ні»). */
  mood: string;
}

export interface Scenario {
  id: string;
  level: ProfileLevel;
  situation: string;
  icon: string;
  actions: ScenarioAction[];
}

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'toy',
    level: 'L0',
    situation: 'У друга в садочку впала іграшка. Він сидить і плаче.',
    icon: '😢',
    actions: [
      {
        label: 'Підняти іграшку і віддати йому',
        isBest: true,
        consequence: 'Друг усміхнувся і сказав «дякую». Далі ви гралися разом.',
        mood: '😊',
      },
      {
        label: 'Піти гратися в інше місце',
        isBest: false,
        consequence: 'Друг лишився сидіти сам. Іграшка так і лежала на підлозі.',
        mood: '😔',
      },
      {
        label: 'Посміятися з нього',
        isBest: false,
        consequence: 'Друг заплакав ще дужче і відсунувся далі від тебе.',
        mood: '😢',
      },
    ],
  },
  {
    id: 'cup',
    level: 'L0',
    situation: 'Ти випадково розбив мамину улюблену чашку. Нікого поруч нема.',
    icon: '☕',
    actions: [
      {
        label: 'Розповісти мамі і вибачитись',
        isBest: true,
        consequence: 'Мама трохи засмутилась через чашку — але обняла тебе. Разом прибрали уламки.',
        mood: '🤗',
      },
      {
        label: 'Сховати уламки',
        isBest: false,
        consequence: 'Мама знайшла уламки ввечері. Найбільше її засмутило не чашка, а що ти мовчав.',
        mood: '😔',
      },
      {
        label: 'Сказати, що це кіт',
        isBest: false,
        consequence: 'Кота насварили ні за що. Ти цілий день думав про це і не міг гратися.',
        mood: '😿',
      },
    ],
  },
  {
    id: 'kitten',
    level: 'L0',
    situation: 'На вулиці сидить маленьке кошеня. Воно мокре і виглядає зголоднілим.',
    icon: '🐱',
    actions: [
      {
        label: 'Сказати мамі чи татові',
        isBest: true,
        consequence: 'Дорослі знайшли кошеняті їжу і сухе місце. Воно зігрілось і замуркотіло.',
        mood: '😻',
      },
      {
        label: 'Взяти додому без дозволу',
        isBest: false,
        consequence: 'Удома виявилось, що кошеня хворе — і ти не знав, чим йому допомогти.',
        mood: '😿',
      },
      {
        label: 'Пройти мимо',
        isBest: false,
        consequence: 'Кошеня лишилось мокнути під дощем.',
        mood: '🌧️',
      },
    ],
  },
  {
    id: 'newcomer',
    level: 'L0',
    situation: 'У класі новенька дитина. На перерві вона стоїть сама біля вікна.',
    icon: '👋',
    actions: [
      {
        label: 'Підійти і покликати гратися з вами',
        isBest: true,
        consequence: 'Новенька дитина зраділа. Наступного дня вона першою привіталась із тобою.',
        mood: '😃',
      },
      {
        label: 'Подивитися здалеку',
        isBest: false,
        consequence: 'Перерва скінчилась. Дитина так і простояла біля вікна сама.',
        mood: '😔',
      },
      {
        label: 'Сказати, що він дивний',
        isBest: false,
        consequence: 'Дитина відвернулась до вікна. Тепер вона боїться підходити до вашого класу.',
        mood: '😞',
      },
    ],
  },
  {
    id: 'homework',
    level: 'L3',
    situation: 'Ти забув зробити домашню. Вчителька зараз перевіряє зошити.',
    icon: '📚',
    actions: [
      {
        label: 'Чесно сказати: «Я забув»',
        isBest: true,
        consequence: 'Вчителька попросила зробити вдома. Неприємно — але все скінчилось за хвилину.',
        mood: '😌',
      },
      {
        label: 'Сказати, що забув зошит удома',
        isBest: false,
        consequence: 'Вчителька попросила принести зошит завтра. Тепер треба вигадувати ще щось.',
        mood: '😬',
      },
      {
        label: 'Швидко списати у сусіда',
        isBest: false,
        consequence: 'У зошиті з’явились відповіді — але ти й далі не знаєш, як їх отримали.',
        mood: '😕',
      },
    ],
  },
  {
    id: 'copying',
    level: 'L3',
    situation: 'Під час самостійної однокласник списує з твого зошита.',
    icon: '📖',
    actions: [
      {
        label: 'Тихо закрити зошит рукою',
        isBest: true,
        consequence: 'Однокласник зрозумів і став писати сам. Ніхто нікого не соромив.',
        mood: '🙂',
      },
      {
        label: 'Дати списати все',
        isBest: false,
        consequence: 'Оцінки однакові. Але на контрольній він знову не знав, що робити.',
        mood: '😕',
      },
      {
        label: 'Голосно сказати: «Ти списуєш!»',
        isBest: false,
        consequence: 'Увесь клас обернувся. Однокласник образився, а вчителька зупинила роботу.',
        mood: '😬',
      },
    ],
  },
  {
    id: 'wallet',
    level: 'L3',
    situation: 'Ти знайшов гаманець на лавці. Всередині — гроші і документи.',
    icon: '👛',
    actions: [
      {
        label: 'Віддати дорослому, щоб знайти власника',
        isBest: true,
        consequence: 'Господар знайшовся швидко — там були його документи. Він дуже дякував.',
        mood: '🤝',
      },
      {
        label: 'Залишити гроші собі',
        isBest: false,
        consequence: 'Гроші є — але хтось лишився без документів, які довго відновлювати.',
        mood: '😔',
      },
      {
        label: 'Залишити на місці',
        isBest: false,
        consequence: 'Гаманець пролежав до вечора. Господар повернувся, але вже не знайшов його.',
        mood: '😞',
      },
    ],
  },
  {
    id: 'teasing',
    level: 'L3',
    situation: 'Однокласника дражнять кілька дітей. Він стоїть мовчки і дивиться вниз.',
    icon: '😔',
    actions: [
      {
        label: 'Підійти і стати поруч з ним',
        isBest: true,
        consequence: 'Дражнити одразу стало нецікаво — він уже був не сам.',
        mood: '💪',
      },
      {
        label: 'Дивитись мовчки',
        isBest: false,
        consequence: 'Дражніння тривало. Він і далі думав, що ніхто не на його боці.',
        mood: '😔',
      },
      {
        label: 'Посміятись разом з іншими',
        isBest: false,
        consequence: 'Сміху побільшало. Він пішов з перерви й наступного дня не хотів іти до школи.',
        mood: '😞',
      },
    ],
  },
];

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

export function shuffleWith<T>(arr: readonly T[], rng: Rng): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function scenariosFor(level: ProfileLevel): Scenario[] {
  return SCENARIOS.filter((s) => s.level === level);
}

/**
 * Сценарії спроби. Раніше банк доповнювався ПОВТОРАМИ, якщо його бракувало
 * (`pool[picked.length % pool.length]`) — а сценаріїв на рівень рівно 4 при 5
 * раундах, тож один дублювався ЗАВЖДИ. Краще менше раундів, ніж та сама
 * історія двічі поспіль.
 */
export function pickScenarios(level: ProfileLevel, count: number, rng: Rng): Scenario[] {
  return shuffleWith(scenariosFor(level), rng).slice(0, count);
}

export function bestAction(s: Scenario): ScenarioAction {
  return s.actions.find((a) => a.isBest)!;
}
