import type { ComponentType } from 'react';

export type Phase =
  | 'intro'
  | 'playing'
  | 'feedback-correct'
  | 'feedback-wrong'
  | 'finished';

export interface Task<TAnswer = unknown> {
  id: string;
  payload: unknown;
  expected?: TAnswer;
}

export interface LevelSpec<TAnswer = unknown> {
  seed: string;
  difficulty: number;
  tasks: Task<TAnswer>[];
}

export interface ValidationResult {
  correct: boolean;
}

export interface RendererProps<TAnswer = unknown> {
  task: Task<TAnswer>;
  onAnswer: (answer: TAnswer) => void;
  disabled?: boolean;
}

export interface GameDefinition<TLevelSpec extends LevelSpec<any> = LevelSpec<any>, TAnswer = any> {
  id: string;
  islandId: string;
  name: string;
  icon?: string;
  rulesKey?: string;
  generateLevel: (difficulty: number) => TLevelSpec;
  validateAnswer: (task: Task<TAnswer>, answer: TAnswer) => ValidationResult;
  Renderer: ComponentType<RendererProps<TAnswer>>;
}

export interface SessionState<TAnswer = unknown> {
  sessionId: string;
  gameId: string;
  phase: Phase;
  levelSpec: LevelSpec<TAnswer>;
  taskIndex: number;
  mistakes: number;
  stars: 0 | 1 | 2 | 3;
  xpEarned: number;
}

export function computeStars(mistakes: number): 1 | 2 | 3 {
  if (mistakes === 0) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}

export function computeXp(stars: 1 | 2 | 3): number {
  if (stars === 3) return 12;
  if (stars === 2) return 8;
  return 5;
}
