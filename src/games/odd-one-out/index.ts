import type { GameDefinition, LevelSpec, Task } from '../types';
import { Renderer, type OddAnswer, type OddPayload } from './Renderer';

const TASKS_PER_LEVEL = 5;
const ITEMS_PER_TASK = 4;
const ODD_COUNT = 1;

const CATEGORIES: Record<string, string[]> = {
  fruits: ['🍎', '🍌', '🍐', '🍊', '🍇', '🍓'],
  vehicles: ['🚗', '🚌', '🚲', '🚀', '🚂'],
  animals: ['🐶', '🐱', '🐰', '🐻', '🦁', '🐸'],
  shapes: ['⭐', '🔺', '⚪', '🔶', '🔷'],
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

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

function pickPair(): { main: string; odd: string } {
  const main = CATEGORY_KEYS[randInt(0, CATEGORY_KEYS.length - 1)];
  let odd = CATEGORY_KEYS[randInt(0, CATEGORY_KEYS.length - 1)];
  while (odd === main) {
    odd = CATEGORY_KEYS[randInt(0, CATEGORY_KEYS.length - 1)];
  }
  return { main, odd };
}

function generateTask(index: number): Task<OddAnswer> {
  const { main, odd } = pickPair();
  const mainItems = shuffle(CATEGORIES[main]).slice(0, ITEMS_PER_TASK - ODD_COUNT);
  const oddItem = CATEGORIES[odd][randInt(0, CATEGORIES[odd].length - 1)];

  const items = mainItems.slice();
  const oddIndex = randInt(0, ITEMS_PER_TASK - 1);
  items.splice(oddIndex, 0, oddItem);

  const payload: OddPayload = { items, oddIndex };
  return { id: `t${index}`, payload };
}

function generateLevel(difficulty: number): LevelSpec<OddAnswer> {
  const tasks: Task<OddAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    tasks.push(generateTask(i));
  }
  return {
    seed: `odd-one-out-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const oddOneOut: GameDefinition<LevelSpec<OddAnswer>, OddAnswer> = {
  id: 'odd-one-out',
  islandId: 'logic',
  name: 'game.oddOneOut.name',
  icon: '🧩',
  rulesKey: 'game.oddOneOut.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as OddPayload;
    return { correct: answer === p.oddIndex };
  },
  Renderer,
};

export default oddOneOut;
