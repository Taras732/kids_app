import type { GameDefinition, LevelSpec, Task } from '../types';
import { Renderer, type ChangedAnswer, type ChangedPayload } from './Renderer';

const TASKS_PER_LEVEL = 5;
const GRID_SIZE = 4;

const EMOJI_POOL = [
  '🍎', '🍌', '🍐', '🍊', '🍇', '🍓',
  '🐶', '🐱', '🐰', '🐻', '🦁', '🐸',
  '🚗', '🚌', '🚲', '🚀', '🚂',
  '⭐', '🔺', '⚪', '🔶', '🔷',
  '🌳', '🌸', '🌞', '🌙',
];

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

function generateTask(index: number): Task<ChangedAnswer> {
  const picked = shuffle(EMOJI_POOL).slice(0, GRID_SIZE);
  const before = picked.slice();
  const after = picked.slice();
  const changedIndex = randInt(0, GRID_SIZE - 1);
  const leftovers = EMOJI_POOL.filter((e) => !picked.includes(e));
  const replacement = leftovers[randInt(0, leftovers.length - 1)];
  after[changedIndex] = replacement;
  const payload: ChangedPayload = { before, after, changedIndex };
  return { id: `t${index}`, payload };
}

function generateLevel(difficulty: number): LevelSpec<ChangedAnswer> {
  const tasks: Task<ChangedAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    tasks.push(generateTask(i));
  }
  return {
    seed: `whats-changed-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const whatsChanged: GameDefinition<LevelSpec<ChangedAnswer>, ChangedAnswer> = {
  id: 'whats-changed',
  islandId: 'memory',
  name: 'game.whatsChanged.name',
  icon: '👁️',
  rulesKey: 'game.whatsChanged.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as ChangedPayload;
    return { correct: answer === p.changedIndex };
  },
  Renderer,
};

export default whatsChanged;
