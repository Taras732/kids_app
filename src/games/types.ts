import type { ComponentType } from 'react';

/** Предметна категорія гри (для групування в Hub). */
export type Subject = 'math' | 'memory' | 'logic' | 'language';

/**
 * Рівень профілю дитини:
 *  - 'L0' — дошкільнята (under_4, 5-6): прості візуальні завдання
 *  - 'L3' — школярі (6-7, 7-8): таблиця множення, дії до 100/1000 тощо
 */
export type ProfileLevel = 'L0' | 'L3';

/** Складність усередині гри. 1=Easy, 2=Medium, 3=Hard. */
export type Difficulty = 1 | 2 | 3;

/** Один раунд гри: довільний payload + правильна відповідь. */
export interface Round<TPayload = unknown, TAnswer = unknown> {
  id: string;
  payload: TPayload;
  /** Еталонна відповідь (для isCorrect за замовчуванням). */
  answer: TAnswer;
}

/** Набір раундів на одну спробу гри (одна складність). */
export interface LevelData<TPayload = unknown, TAnswer = unknown> {
  difficulty: Difficulty;
  rounds: Round<TPayload, TAnswer>[];
}

/** Стан фідбеку поточного раунду (для стилізації в компоненті гри). */
export type AnswerState = 'idle' | 'correct' | 'incorrect';

/**
 * Пропси, які GameShell передає у Component конкретної гри.
 *
 * Дві моделі взаємодії:
 *  1. Раунд-based (лічба, приклади, послідовності): компонент показує 1 раунд,
 *     викликає onAnswer(answer); GameShell перевіряє через isCorrect, рахує зірки,
 *     веде до наступного раунду.
 *  2. Board-based (пам'ять): весь ігровий стан — усередині компонента; на кожній
 *     помилці кличе onMistake(); коли поле пройдено — кличе onAnswer(DONE), і
 *     GameShell завершує гру.
 */
export interface GameComponentProps<TPayload = unknown, TAnswer = unknown> {
  round: Round<TPayload, TAnswer>;
  /** Порядковий номер раунду (0-based) і всього раундів. */
  roundIndex: number;
  totalRounds: number;
  /** Заблоковано під час показу фідбеку. */
  disabled: boolean;
  answerState: AnswerState;
  /** Відповідь дитини на поточний раунд (для раунд-based ігор). */
  onAnswer: (answer: TAnswer) => void;
  /** Зареєструвати помилку без переходу раунду (для board-based ігор). */
  onMistake: () => void;
}

/** Контракт гри-плагіна. Додати гру = папка src/games/<id>/ + рядок у registry. */
export interface GameDefinition<TPayload = any, TAnswer = any> {
  id: string;
  title: string;
  subject: Subject;
  /** Для яких рівнів профілю гра доступна. */
  levels: ProfileLevel[];
  /** Emoji-іконка картки. */
  icon: string;
  /** Короткий опис під назвою в Hub. */
  description: string;
  /** Пастельний фон іконки в Hub (canon). */
  accent?: string;
  /** Згенерувати набір раундів для складності + рівня профілю. */
  generate: (difficulty: Difficulty, level: ProfileLevel) => LevelData<TPayload, TAnswer>;
  /** Перевірити відповідь. Якщо не задано — порівняння з round.answer. */
  isCorrect?: (round: Round<TPayload, TAnswer>, answer: TAnswer) => boolean;
  Component: ComponentType<GameComponentProps<TPayload, TAnswer>>;
}

/** Сентінел-відповідь, яку board-based ігри шлють у onAnswer при завершенні поля. */
export const BOARD_DONE = '__board_done__' as const;

/**
 * Зірки за точність (0–3).
 * 3⭐ — без помилок; 2⭐ — до ~третини раундів з помилкою; інакше 1⭐.
 */
export function computeStars(mistakes: number, rounds: number): 0 | 1 | 2 | 3 {
  if (mistakes <= 0) return 3;
  if (mistakes <= Math.max(1, Math.ceil(rounds * 0.34))) return 2;
  return 1;
}

/**
 * Level gate: скільки складностей відкрито після спроби.
 * Easy(1)→Medium(2) відкривається за 2⭐; Medium(2)→Hard(3) — за 3⭐.
 * Повертає нову максимальну відкриту складність (не регресує).
 */
export function unlockedAfter(
  difficulty: Difficulty,
  stars: 0 | 1 | 2 | 3,
  prevUnlocked: Difficulty,
): Difficulty {
  let unlocked: Difficulty = difficulty;
  if (difficulty === 1 && stars >= 2) unlocked = 2;
  if (difficulty === 2 && stars >= 3) unlocked = 3;
  return Math.max(prevUnlocked, unlocked) as Difficulty;
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: 'Легко',
  2: 'Середньо',
  3: 'Складно',
};
