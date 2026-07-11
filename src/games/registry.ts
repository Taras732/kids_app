import type { GameDefinition, ProfileLevel, Subject } from './types';
import type { ChildProfile } from '@/stores/useProfileStore';

// --- Ігри (кожна нова гра = 1 import + 1 рядок у GAMES) ---
import counting from './counting';
import addition from './addition';
import compare from './compare';
import mathExamples from './math-examples';
import timesTables from './times-tables';
import mathCompare from './math-compare';
import columnArithmetic from './column-arithmetic';
import fractionsCompare from './fractions-compare';
import clockTime from './clock-time';
import memoryPairs from './memory-pairs';
import whatsChanged from './whats-changed';
import digitSpan from './digit-span';
import logicSequences from './logic-sequences';
import sortingGame from './sorting-game';
import sudoku from './sudoku';
import lettersFind from './letters-find';
import syllableBuild from './syllable-build';
import colorsFind from './colors-find';
import shapes from './shapes';

export const GAMES: GameDefinition[] = [
  // Математика
  counting,
  addition,
  compare,
  mathExamples,
  timesTables,
  mathCompare,
  columnArithmetic,
  fractionsCompare,
  clockTime,
  // Пам'ять
  memoryPairs,
  whatsChanged,
  digitSpan,
  // Логіка
  logicSequences,
  sortingGame,
  sudoku,
  // Мова
  lettersFind,
  syllableBuild,
  // Наука
  colorsFind,
  shapes,
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
  language: { title: 'Мова', emoji: '📖' },
  english: { title: 'Англійська', emoji: '🇬🇧' },
  science: { title: 'Наука', emoji: '🔬' },
  logic: { title: 'Логіка', emoji: '🧩' },
  memory: { title: "Пам'ять", emoji: '🧠' },
  world: { title: 'Світ', emoji: '🌍' },
  life: { title: 'Життя', emoji: '💛' },
  attention: { title: 'Увага', emoji: '🎯' },
};

export const SUBJECT_ORDER: Subject[] = [
  'math',
  'language',
  'english',
  'science',
  'logic',
  'memory',
  'world',
  'life',
  'attention',
];
