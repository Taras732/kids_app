import type { GameDefinition, LevelSpec, Task } from '../types';
import { Renderer, type ExprAnswer, type ExprPayload, type ExprOp } from './Renderer';

const TASKS_PER_LEVEL = 5;
const VALUE_MAX = 10;
const DISTRACTOR_RANGE = 3;
const CHOICES_COUNT = 4;

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateAddition(): { a: number; b: number } {
  const a = randInt(0, VALUE_MAX);
  const b = randInt(0, VALUE_MAX - a);
  return { a, b };
}

function generateSubtraction(): { a: number; b: number } {
  const a = randInt(1, VALUE_MAX);
  const b = randInt(0, a);
  return { a, b };
}

function generateChoices(correct: number): number[] {
  const pool = new Set<number>([correct]);
  const min = Math.max(0, correct - DISTRACTOR_RANGE);
  const max = correct + DISTRACTOR_RANGE;
  let attempts = 0;

  while (pool.size < CHOICES_COUNT && attempts < 50) {
    const candidate = randInt(min, max);
    pool.add(candidate);
    attempts++;
  }

  let filler = 0;
  while (pool.size < CHOICES_COUNT && filler <= VALUE_MAX + DISTRACTOR_RANGE) {
    pool.add(filler);
    filler++;
  }

  return shuffle(Array.from(pool).slice(0, CHOICES_COUNT));
}

function generateTask(index: number): Task<ExprAnswer> {
  const op: ExprOp = Math.random() < 0.5 ? '+' : '−';
  const { a, b } = op === '+' ? generateAddition() : generateSubtraction();
  const correct = op === '+' ? a + b : a - b;
  const payload: ExprPayload = {
    a,
    b,
    op,
    correct,
    choices: generateChoices(correct),
  };
  return { id: `t${index}`, payload };
}

function generateLevel(difficulty: number): LevelSpec<ExprAnswer> {
  const tasks: Task<ExprAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    tasks.push(generateTask(i));
  }
  return {
    seed: `math-expressions-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const mathExpressions: GameDefinition<LevelSpec<ExprAnswer>, ExprAnswer> = {
  id: 'math-expressions',
  islandId: 'math',
  name: 'game.mathExpressions.name',
  icon: '➕',
  rulesKey: 'game.mathExpressions.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as ExprPayload;
    return { correct: answer === p.correct };
  },
  Renderer,
};

export default mathExpressions;
