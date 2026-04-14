export type AgeGroupId = 'koko' | 'bambi' | 'lisa' | 'sofi';

export interface AgeGroup {
  id: AgeGroupId;
  mascot: string;
  name: string;
  ageRange: string;
  minAge: number;
  maxAge: number;
  focus: string;
  uiScale: number;
  fontScale: number;
}

export const AGE_GROUPS: AgeGroup[] = [
  {
    id: 'koko',
    mascot: '🐣',
    name: 'Курчатко Коко',
    ageRange: 'до 4 р.',
    minAge: 3,
    maxAge: 4,
    focus: 'Кольори, форми, рахунок 1-5, перші букви',
    uiScale: 1.3,
    fontScale: 1.3,
  },
  {
    id: 'bambi',
    mascot: '🐼',
    name: 'Пандочка Бамбі',
    ageRange: '5-6 р.',
    minAge: 5,
    maxAge: 6,
    focus: 'Рахунок до 10, склади, логіка, пам\'ять',
    uiScale: 1.15,
    fontScale: 1.15,
  },
  {
    id: 'lisa',
    mascot: '🦊',
    name: 'Лисичка Ліса',
    ageRange: '6-7 р.',
    minAge: 6,
    maxAge: 7,
    focus: 'Рахунок до 20, читання, задачі',
    uiScale: 1.0,
    fontScale: 1.0,
  },
  {
    id: 'sofi',
    mascot: '🦉',
    name: 'Совеня Софі',
    ageRange: '7-8 р.',
    minAge: 7,
    maxAge: 8,
    focus: 'Математика до 100, множення, судоку',
    uiScale: 0.95,
    fontScale: 0.95,
  },
];

export const getAgeGroupById = (id: AgeGroupId): AgeGroup | undefined =>
  AGE_GROUPS.find((g) => g.id === id);
