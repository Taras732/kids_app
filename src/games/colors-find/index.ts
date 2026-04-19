import type { GameDefinition, LevelSpec, Task } from '../types';
import {
  Renderer,
  type ColorAnswer,
  type ColorId,
  type ColorPayload,
} from './Renderer';

const TASKS_PER_LEVEL = 5;
const CANDIDATES_PER_TASK = 4;

const COLOR_IDS: ColorId[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

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

function pickCandidates(target: ColorId): ColorId[] {
  const distractors = COLOR_IDS.filter((c) => c !== target);
  const picked = shuffle(distractors).slice(0, CANDIDATES_PER_TASK - 1);
  return shuffle([target, ...picked]);
}

function generateTask(index: number): Task<ColorAnswer> {
  const target = COLOR_IDS[randInt(0, COLOR_IDS.length - 1)];
  const candidates = pickCandidates(target);
  const payload: ColorPayload = { target, candidates };
  return { id: `t${index}`, payload };
}

function generateLevel(difficulty: number): LevelSpec<ColorAnswer> {
  const tasks: Task<ColorAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    tasks.push(generateTask(i));
  }
  return {
    seed: `colors-find-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const colorsFind: GameDefinition<LevelSpec<ColorAnswer>, ColorAnswer> = {
  id: 'colors-find',
  islandId: 'creativity',
  name: 'game.colors.name',
  icon: '🎨',
  rulesKey: 'game.colors.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as ColorPayload;
    return { correct: answer === p.target };
  },
  Renderer,
};

export default colorsFind;
