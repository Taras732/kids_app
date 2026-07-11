import type { GameDefinition, ProfileLevel, Subject } from './types';
import type { ChildProfile } from '@/stores/useProfileStore';

// --- Ігри (кожна нова гра = 1 import + 1 рядок у GAMES) ---
import counting from './counting';
import addition from './addition';
import compare from './compare';
import mathExamples from './math-examples';
import timesTables from './times-tables';
import mathCompare from './math-compare';
import memoryPairs from './memory-pairs';
import whatsChanged from './whats-changed';
import digitSpan from './digit-span';
import logicSequences from './logic-sequences';
import sortingGame from './sorting-game';
import lettersFind from './letters-find';

export const GAMES: GameDefinition[] = [
  // Математика
  counting,
  addition,
  compare,
  mathExamples,
  timesTables,
  mathCompare,
  // Пам'ять
  memoryPairs,
  whatsChanged,
  digitSpan,
  // Логіка
  logicSequences,
  sortingGame,
  // Мова
  lettersFind,
];

const byId = new Map<string, GameDefinition>(GAMES.map((g) => [g.id, g]));

export function getGame(id: string): GameDefinition | undefined {
  return byId.get(id);
}

/** Мапінг вікової групи профілю → рівень контенту. */
export function profileLevel(profile: Pick<ChildProfile, 'age_group'>): ProfileLevel {
  return profile.age_group === 'under_4' || profile.age_group === '5-6' ? 'L0' : 'L3';
}

/** Ігри, доступні для рівня профілю. */
export function gamesForLevel(level: ProfileLevel): GameDefinition[] {
  return GAMES.filter((g) => g.levels.includes(level));
}

export const SUBJECT_META: Record<Subject, { title: string; emoji: string }> = {
  math: { title: 'Математика', emoji: '🔢' },
  memory: { title: "Пам'ять", emoji: '🧠' },
  logic: { title: 'Логіка', emoji: '🧩' },
  language: { title: 'Мова', emoji: '📖' },
};

export const SUBJECT_ORDER: Subject[] = ['math', 'memory', 'logic', 'language'];
