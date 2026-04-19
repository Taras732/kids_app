import type { GameDefinition, LevelSpec, Task } from '../types';
import { Renderer, type PatternAnswer, type PatternPayload } from './Renderer';

const TASKS_PER_LEVEL = 5;
const OPTIONS_COUNT = 3;

const POOL = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickPair(): [string, string] {
  const shuffled = shuffle(POOL);
  return [shuffled[0], shuffled[1]];
}

function pickDistractors(exclude: string[]): string[] {
  const rest = POOL.filter((c) => !exclude.includes(c));
  return shuffle(rest).slice(0, OPTIONS_COUNT - 1);
}

function generateTask(index: number): Task<PatternAnswer> {
  const [a, b] = pickPair();
  const sequence = [a, b, a, b];
  const target = a;
  const distractors = pickDistractors([a, b]);
  const options = shuffle([target, ...distractors]);
  const payload: PatternPayload = { sequence, target, options };
  return { id: `t${index}`, payload };
}

function generateLevel(difficulty: number): LevelSpec<PatternAnswer> {
  const tasks: Task<PatternAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    tasks.push(generateTask(i));
  }
  return {
    seed: `pattern-next-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const patternNext: GameDefinition<LevelSpec<PatternAnswer>, PatternAnswer> = {
  id: 'pattern-next',
  islandId: 'logic',
  name: 'game.patternNext.name',
  icon: '🔢',
  rulesKey: 'game.patternNext.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as PatternPayload;
    return { correct: answer === p.target };
  },
  Renderer,
};

export default patternNext;
