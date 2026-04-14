export type CharacterState = 'idle' | 'celebrate' | 'encourage' | 'think';

export interface Character {
  id: string;
  mascot: string;
  name: string;
  ageGroupId: string;
}

export const CHARACTERS: Character[] = [
  { id: 'koko', mascot: '🐣', name: 'Курчатко Коко', ageGroupId: 'koko' },
  { id: 'bambi', mascot: '🐼', name: 'Пандочка Бамбі', ageGroupId: 'bambi' },
  { id: 'lisa', mascot: '🦊', name: 'Лисичка Ліса', ageGroupId: 'lisa' },
  { id: 'sofi', mascot: '🦉', name: 'Совеня Софі', ageGroupId: 'sofi' },
];
