import type { AgeGroupId } from './ageGroups';

export type CharacterState = 'idle' | 'celebrate' | 'encourage' | 'think';

export interface Character {
  id: string;
  mascot: string;
  name: string;
  ageGroupId: AgeGroupId;
}

export const CHARACTERS: Character[] = [];
