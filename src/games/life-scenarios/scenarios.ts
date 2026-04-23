import type { AgeGroupId } from '../../constants/ageGroups';

export type EmotionTag =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'scared'
  | 'surprised'
  | 'embarrassed'
  | 'proud'
  | 'jealous'
  | 'guilty';

export const EMOTION_LABELS: Record<EmotionTag, { emoji: string; label: string }> = {
  happy: { emoji: '😀', label: 'Радість' },
  sad: { emoji: '😢', label: 'Сум' },
  angry: { emoji: '😠', label: 'Злість' },
  scared: { emoji: '😨', label: 'Страх' },
  surprised: { emoji: '😲', label: 'Подив' },
  embarrassed: { emoji: '😳', label: 'Зніяковілий' },
  proud: { emoji: '😌', label: 'Гордий' },
  jealous: { emoji: '😒', label: 'Заздрий' },
  guilty: { emoji: '😔', label: 'Винний' },
};

export interface ScenarioAction {
  key: string;
  label: string;
  consequence: string;
  isBest: boolean;
}

export interface Scenario {
  key: string;
  ageGroups: AgeGroupId[];
  situation: string;
  icon: string;
  suggestedEmotions: EmotionTag[];
  actions: ScenarioAction[];
}

export const SCENARIOS: Scenario[] = [
  // ---------- PRESCHOOL ----------
  {
    key: 'fallenToy',
    ageGroups: ['preschool'],
    situation: 'У друга в садочку впала іграшка. Він сидить і плаче.',
    icon: '😢',
    suggestedEmotions: ['sad'],
    actions: [
      {
        key: 'help',
        label: 'Підняти іграшку і віддати йому',
        consequence: 'Друг усміхнувся і подякував. Ви продовжили гратися разом.',
        isBest: true,
      },
      {
        key: 'ignore',
        label: 'Піти гратися в інше місце',
        consequence: 'Друг заплакав ще сильніше. Він думав, що нікому не потрібен.',
        isBest: false,
      },
      {
        key: 'laugh',
        label: 'Посміятися з нього',
        consequence: 'Друг образився. Тепер він не хоче з тобою гратися.',
        isBest: false,
      },
      {
        key: 'tellAdult',
        label: 'Сказати виховательці',
        consequence: 'Вихователька підійшла і допомогла. Це теж варіант, але ви самі теж могли.',
        isBest: false,
      },
    ],
  },
  {
    key: 'kittenAlone',
    ageGroups: ['preschool', 'grade1'],
    situation: 'На вулиці сидить маленьке кошеня. Воно мокре і виглядає зголоднілим.',
    icon: '🐱',
    suggestedEmotions: ['sad', 'surprised'],
    actions: [
      {
        key: 'tellParent',
        label: 'Сказати мамі чи татові',
        consequence: 'Дорослий подивився чи кошеня господарське. Якщо ні — допомогли йому знайти їжу і тепло.',
        isBest: true,
      },
      {
        key: 'takeHome',
        label: 'Взяти додому без дозволу',
        consequence: 'Мама переживала — раптом кошеня хворе. Треба було спочатку спитати.',
        isBest: false,
      },
      {
        key: 'touch',
        label: 'Погладити і піти',
        consequence: 'Кошеня так і залишилось голодним на холоді.',
        isBest: false,
      },
      {
        key: 'pass',
        label: 'Пройти мимо',
        consequence: 'Тобі ще довго було шкода. Наступного разу можна зупинитись і допомогти.',
        isBest: false,
      },
    ],
  },
  {
    key: 'brokeCup',
    ageGroups: ['preschool', 'grade1'],
    situation: 'Ти випадково розбив мамину улюблену чашку. Нікого поруч нема.',
    icon: '☕',
    suggestedEmotions: ['scared', 'guilty', 'sad'],
    actions: [
      {
        key: 'tell',
        label: 'Розповісти мамі і вибачитись',
        consequence: 'Мама трошки засмутилась, але похвалила за чесність. Разом прибрали скло.',
        isBest: true,
      },
      {
        key: 'hide',
        label: 'Сховати уламки',
        consequence: 'Пізніше мама порізалась об схований шматочок. Було соромно і їй боляче.',
        isBest: false,
      },
      {
        key: 'blame',
        label: 'Сказати, що це кіт',
        consequence: 'Коли мама дізналась правду, було ще більше шкоди. Краще б сказав одразу.',
        isBest: false,
      },
      {
        key: 'clean',
        label: 'Прибрати все сам і змовчати',
        consequence: 'Непогано, що прибрав. Але мамі все одно варто було сказати — вона б не сердилась.',
        isBest: false,
      },
    ],
  },

  // ---------- GRADE 1 ----------
  {
    key: 'newKidAlone',
    ageGroups: ['grade1', 'grade2'],
    situation: 'У класі новенька дитина. На перерві вона стоїть сама біля вікна.',
    icon: '👋',
    suggestedEmotions: ['sad', 'embarrassed'],
    actions: [
      {
        key: 'invite',
        label: 'Підійти і покликати гратися з вами',
        consequence: 'Новенька зраділа. Ти здобув нового друга, і йому більше не самотньо.',
        isBest: true,
      },
      {
        key: 'observe',
        label: 'Подивитися здалеку',
        consequence: 'Новенька так і простояла перерву сама. Вона почувалась невидимою.',
        isBest: false,
      },
      {
        key: 'tease',
        label: 'Сказати, що він дивний',
        consequence: 'Новенька заплакала. Це боляче, коли з тебе глузують у перший день.',
        isBest: false,
      },
      {
        key: 'askTeacher',
        label: 'Попросити вчителя його познайомити',
        consequence: 'Вчитель допомагає, але краще ти міг і сам підійти — це зовсім просто.',
        isBest: false,
      },
    ],
  },
  {
    key: 'wrongGrade',
    ageGroups: ['grade1', 'grade2'],
    situation: 'Вчителька помилилась і поставила тобі оцінку вищу, ніж ти заслуговуєш.',
    icon: '📝',
    suggestedEmotions: ['surprised', 'guilty', 'happy'],
    actions: [
      {
        key: 'tellTeacher',
        label: 'Сказати вчительці про помилку',
        consequence: 'Вчителька подякувала за чесність. Це значно важливіше за одну оцінку.',
        isBest: true,
      },
      {
        key: 'stay',
        label: 'Нічого не казати',
        consequence: 'Оцінка залишилась. Але ти весь день почувався негарно всередині.',
        isBest: false,
      },
      {
        key: 'boast',
        label: 'Похвалитися друзям',
        consequence: 'Друзі пізніше дізнались правду. Тобі стало соромно.',
        isBest: false,
      },
      {
        key: 'parentTell',
        label: 'Сказати мамі й вирішити вдома',
        consequence: 'Мама порадила сказати вчительці. Ти так і зробив наступного дня.',
        isBest: false,
      },
    ],
  },

  // ---------- GRADE 2 ----------
  {
    key: 'copyingNeighbor',
    ageGroups: ['grade2', 'grade3'],
    situation: 'Під час самостійної однокласник списує з твого зошита.',
    icon: '📖',
    suggestedEmotions: ['angry', 'embarrassed', 'surprised'],
    actions: [
      {
        key: 'coverQuiet',
        label: 'Тихо закрити зошит рукою',
        consequence: 'Однокласник зрозумів. Після уроку ти запропонував пояснити йому тему.',
        isBest: true,
      },
      {
        key: 'tellTeacher',
        label: 'Одразу сказати вчителю',
        consequence: 'Однокласник отримав зауваження. Він перестав з тобою розмовляти.',
        isBest: false,
      },
      {
        key: 'allow',
        label: 'Дати списати все',
        consequence: 'Однокласник не навчився темі. На контрольній отримав двійку.',
        isBest: false,
      },
      {
        key: 'yell',
        label: 'Голосно сказати: «Ти списуєш!»',
        consequence: 'Весь клас обернувся. Однокласник образився, вчителька робить вам зауваження.',
        isBest: false,
      },
    ],
  },
  {
    key: 'forgotHomework',
    ageGroups: ['grade2', 'grade3', 'grade4'],
    situation: 'Ти забув зробити домашню. Вчителька зараз перевіряє зошити.',
    icon: '📚',
    suggestedEmotions: ['scared', 'embarrassed', 'guilty'],
    actions: [
      {
        key: 'admit',
        label: 'Чесно сказати: «Я забув»',
        consequence: 'Вчителька зробила запис, але похвалила за чесність. Наступного дня ти доробив.',
        isBest: true,
      },
      {
        key: 'lie',
        label: 'Сказати, що забув зошит удома',
        consequence: 'Вчителька попросила принести завтра. Ти всю ніч переробляв, стресуючи.',
        isBest: false,
      },
      {
        key: 'copy',
        label: 'Швидко списати у сусіда',
        consequence: 'Учителька помітила однакові помилки у вас обох. Спіймали двох одразу.',
        isBest: false,
      },
      {
        key: 'hide',
        label: 'Сказати, що зошит "кудись подівся"',
        consequence: 'Вчителька не повірила. Розмова вийшла дуже незручна.',
        isBest: false,
      },
    ],
  },

  // ---------- GRADE 3 ----------
  {
    key: 'secretDilemma',
    ageGroups: ['grade3', 'grade4'],
    situation: 'Друг розповів тобі секрет і попросив нікому не казати. Інший однокласник дуже хоче знати.',
    icon: '🤐',
    suggestedEmotions: ['embarrassed', 'guilty', 'angry'],
    actions: [
      {
        key: 'keepSecret',
        label: 'Зберегти секрет і чесно сказати "Я не можу це розказати"',
        consequence: 'Однокласник трохи образився, але друг довіряє тобі ще більше.',
        isBest: true,
      },
      {
        key: 'tell',
        label: 'Поділитися — «нічого ж страшного»',
        consequence: 'Друг дізнався. Він тепер не розповідатиме тобі нічого особистого.',
        isBest: false,
      },
      {
        key: 'halfTell',
        label: 'Сказати шматочок, щоб не дуже',
        consequence: 'Шматочок потягнув за собою решту. Друг образився однаково.',
        isBest: false,
      },
      {
        key: 'avoid',
        label: 'Не відповідати і зникнути',
        consequence: 'Ти уникнув відповіді. Але однокласник почав тиснути ще сильніше.',
        isBest: false,
      },
    ],
  },
  {
    key: 'onlineStranger',
    ageGroups: ['grade3', 'grade4'],
    situation: 'Незнайомець у соцмережі написав тобі: «Привіт! Давай дружити. Де ти живеш?»',
    icon: '💬',
    suggestedEmotions: ['surprised', 'scared', 'embarrassed'],
    actions: [
      {
        key: 'tellParent',
        label: 'Показати повідомлення мамі чи татові',
        consequence: 'Батьки пояснили, що незнайомці онлайн — це ризик. Допомогли заблокувати.',
        isBest: true,
      },
      {
        key: 'answer',
        label: 'Відповісти і сказати, де живеш',
        consequence: 'Ніколи не знаєш, хто насправді за екраном. Це небезпечно.',
        isBest: false,
      },
      {
        key: 'ignore',
        label: 'Проігнорувати і нічого нікому не казати',
        consequence: 'Повідомлення залишилось. Варто було хоча б розповісти дорослому.',
        isBest: false,
      },
      {
        key: 'friendTell',
        label: 'Розповісти друзям, ніхто з дорослих не в курсі',
        consequence: 'Друзі не можуть захистити. Тільки дорослі можуть допомогти в таких ситуаціях.',
        isBest: false,
      },
    ],
  },

  // ---------- GRADE 4 ----------
  {
    key: 'classmateBullied',
    ageGroups: ['grade4'],
    situation: 'Однокласника дражнять кілька дітей. Він стоїть мовчки і дивиться вниз. Ніхто не допомагає.',
    icon: '😔',
    suggestedEmotions: ['sad', 'angry', 'scared', 'guilty'],
    actions: [
      {
        key: 'standUp',
        label: 'Підійти і стати поруч з ним',
        consequence: 'Інші діти розійшлись. Часто достатньо однієї людини, щоб булінг припинився.',
        isBest: true,
      },
      {
        key: 'watchSilent',
        label: 'Дивитись мовчки',
        consequence: 'Мовчання підтримує булінг. Однокласнику стає ще гірше.',
        isBest: false,
      },
      {
        key: 'joinLaugh',
        label: 'Посміятись разом з іншими',
        consequence: 'Ти став частиною булінгу. Це важкий вибір — подумай чи ти цим пишаєшся.',
        isBest: false,
      },
      {
        key: 'tellTeacher',
        label: 'Швидко піти до вчителя',
        consequence: 'Вчитель втрутився. Це правильно, але варто було і підтримати безпосередньо.',
        isBest: false,
      },
    ],
  },
  {
    key: 'foundWallet',
    ageGroups: ['grade3', 'grade4'],
    situation: 'Ти знайшов гаманець на лавці. Всередині — 500 гривень і документи.',
    icon: '👛',
    suggestedEmotions: ['surprised', 'happy', 'scared'],
    actions: [
      {
        key: 'returnOwner',
        label: 'Віддати дорослому, щоб знайти власника',
        consequence: 'Власник прийшов забрати гаманець. Він дуже подякував і пригостив тебе цукеркою.',
        isBest: true,
      },
      {
        key: 'keep',
        label: 'Залишити гроші собі',
        consequence: 'Ти купив собі що хотів. Але потім чув, як мама власника плакала — там були останні гроші.',
        isBest: false,
      },
      {
        key: 'leave',
        label: 'Залишити на місці',
        consequence: 'Гаманець міг забрати хтось інший. А міг пролежати тижнями.',
        isBest: false,
      },
      {
        key: 'halfKeep',
        label: 'Взяти половину, решту залишити',
        consequence: 'Це ж крадіжка, просто менша. Справжня допомога — віддати все.',
        isBest: false,
      },
    ],
  },
  {
    key: 'parentsArguing',
    ageGroups: ['grade3', 'grade4'],
    situation: 'Батьки сваряться у кімнаті. Ти це чуєш. Тобі страшно і сумно.',
    icon: '💔',
    suggestedEmotions: ['sad', 'scared', 'angry', 'guilty'],
    actions: [
      {
        key: 'tellAfter',
        label: 'Коли заспокояться — сказати їм, як тобі було',
        consequence: 'Батьки не знали, що ти чув. Вони вибачились. Ти зрозумів — це не через тебе.',
        isBest: true,
      },
      {
        key: 'interrupt',
        label: 'Увірватись і кричати, щоб перестали',
        consequence: 'Всі розхвилювались ще більше. Зараз не найкращий момент втручатись.',
        isBest: false,
      },
      {
        key: 'blameSelf',
        label: 'Думати, що це через тебе',
        consequence: 'Сварки батьків — це їхнє. Діти ніколи не винні в цьому.',
        isBest: false,
      },
      {
        key: 'hideSuffer',
        label: 'Сховатися під ковдру і мовчати',
        consequence: 'Тобі стало ще важче самому. Було б легше сказати потім батькам про свої почуття.',
        isBest: false,
      },
    ],
  },
];

export function scenariosFor(ageGroupId: AgeGroupId): Scenario[] {
  return SCENARIOS.filter((s) => s.ageGroups.includes(ageGroupId));
}
