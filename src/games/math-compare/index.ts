import type { GameDefinition, LevelSpec, Task } from '../types';
import { Renderer, type CompareAnswer, type ComparePayload } from './Renderer';

const TASKS_PER_LEVEL = 5;
const VALUE_MIN = 1;
const VALUE_MAX = 20;
const EQUALITY_PROBABILITY = 0.15;

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function symbolFromDiff(diff: number): CompareAnswer {
  if (diff > 0) return '>';
  if (diff < 0) return '<';
  return '=';
}

function generatePair(): { a: number; b: number; correct: CompareAnswer } {
  if (Math.random() < EQUALITY_PROBABILITY) {
    const value = randInt(VALUE_MIN, VALUE_MAX);
    return { a: value, b: value, correct: '=' };
  }

  let a = randInt(VALUE_MIN, VALUE_MAX);
  let b = randInt(VALUE_MIN, VALUE_MAX);
  while (a === b) {
    b = randInt(VALUE_MIN, VALUE_MAX);
  }
  return { a, b, correct: symbolFromDiff(a - b) };
}

function generateTask(index: number): Task<CompareAnswer> {
  const pair = generatePair();
  const payload: ComparePayload = pair;
  return { id: `t${index}`, payload };
}

function generateLevel(difficulty: number): LevelSpec<CompareAnswer> {
  const tasks: Task<CompareAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    tasks.push(generateTask(i));
  }
  return {
    seed: `math-compare-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const mathCompare: GameDefinition<LevelSpec<CompareAnswer>, CompareAnswer> = {
  id: 'math-compare',
  islandId: 'math',
  name: 'game.mathCompare.name',
  icon: '⚖️',
  rulesKey: 'game.mathCompare.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as ComparePayload;
    return { correct: answer === p.correct };
  },
  Renderer,
};

export default mathCompare;
