import type { GameDefinition, ProfileLevel, Subject } from './types';
import type { ChildProfile } from '@/stores/useProfileStore';

// --- Математика ---
import counting from './counting';
import addition from './addition';
import compare from './compare';
import mathExamples from './math-examples';
import timesTables from './times-tables';
import mathCompare from './math-compare';
import columnArithmetic from './column-arithmetic';
import fractionsCompare from './fractions-compare';
import clockTime from './clock-time';
import moneyBasics from './money-basics';
import recognizeDigit from './recognize-digit';
import measures from './measures';
// --- Мова ---
import lettersFind from './letters-find';
import syllableBuild from './syllable-build';
// --- Англійська ---
import lettersFindEn from './letters-find-en';
import englishWordPicture from './english-word-picture';
// --- Наука ---
import colorsFind from './colors-find';
import shapes from './shapes';
import waterStates from './water-states';
import sinkFloat from './sink-float';
import animalsHabitat from './animals-habitat';
import plantGrow from './plant-grow';
// --- Логіка ---
import logicSequences from './logic-sequences';
import sortingGame from './sorting-game';
import sudoku from './sudoku';
import magicSquare from './magic-square';
// --- Пам'ять ---
import memoryPairs from './memory-pairs';
import whatsChanged from './whats-changed';
import digitSpan from './digit-span';
import reverseSequence from './reverse-sequence';
import memoryAssociations from './memory-associations';
// --- Світ ---
import worldFlags from './world-flags';
import continentsOceans from './continents-oceans';
import uaSymbols from './ua-symbols';
// --- Життя ---
import emotionsRecognize from './emotions-recognize';
import lifeScenarios from './life-scenarios';
import breathing from './breathing';
// --- Увага ---
import tapTheDot from './tap-the-dot';

export const GAMES: GameDefinition[] = [
  // Математика
  counting, addition, compare, mathExamples, timesTables, mathCompare,
  columnArithmetic, fractionsCompare, clockTime, moneyBasics, recognizeDigit, measures,
  // Мова
  lettersFind, syllableBuild,
  // Англійська
  lettersFindEn, englishWordPicture,
  // Наука
  colorsFind, shapes, waterStates, sinkFloat, animalsHabitat, plantGrow,
  // Логіка
  logicSequences, sortingGame, sudoku, magicSquare,
  // Пам'ять
  memoryPairs, whatsChanged, digitSpan, reverseSequence, memoryAssociations,
  // Світ
  worldFlags, continentsOceans, uaSymbols,
  // Життя
  emotionsRecognize, lifeScenarios, breathing,
  // Увага
  tapTheDot,
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
  english: { title: 'Англійська', emoji: '📗' },
  science: { title: 'Наука', emoji: '🔬' },
  logic: { title: 'Логіка', emoji: '🧩' },
  memory: { title: "Пам'ять", emoji: '🧠' },
  world: { title: 'Світ', emoji: '🌍' },
  life: { title: 'Життя', emoji: '💛' },
  attention: { title: 'Увага', emoji: '🎯' },
};

export const SUBJECT_ORDER: Subject[] = [
  'math', 'language', 'english', 'science', 'logic', 'memory', 'world', 'life', 'attention',
];
