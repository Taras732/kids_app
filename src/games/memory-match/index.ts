import type { GameDefinition, LevelSpec, Task } from '../types';
import { Renderer, type MemoryAnswer, type MemoryCard, type MemoryPayload } from './Renderer';

const TASKS_PER_LEVEL = 3;
const PAIRS_PER_BOARD = 3;
const MISTAKES_THRESHOLD = 2;

const EMOJI_POOL = [
  '🍎', '🍌', '🍐', '🍊', '🍇', '🍓',
  '🐶', '🐱', '🐰', '🐻', '🦁', '🐸',
  '🚗', '🚌', '🚲', '🚀', '🚂',
  '⭐', '🔺', '⚪', '🔶', '🔷',
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

function generateBoard(taskIndex: number): Task<MemoryAnswer> {
  const picked = shuffle(EMOJI_POOL).slice(0, PAIRS_PER_BOARD);
  const cards: MemoryCard[] = [];
  picked.forEach((emoji, pairIdx) => {
    const pairKey = `p${pairIdx}`;
    cards.push({ id: `t${taskIndex}-${pairKey}-a`, emoji, pairKey });
    cards.push({ id: `t${taskIndex}-${pairKey}-b`, emoji, pairKey });
  });
  const shuffled = shuffle(cards);
  const payload: MemoryPayload = { cards: shuffled };
  return { id: `t${taskIndex}`, payload };
}

function generateLevel(difficulty: number): LevelSpec<MemoryAnswer> {
  const tasks: Task<MemoryAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    tasks.push(generateBoard(i));
  }
  return {
    seed: `memory-match-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const memoryMatch: GameDefinition<LevelSpec<MemoryAnswer>, MemoryAnswer> = {
  id: 'memory-match',
  islandId: 'memory',
  name: 'game.memoryMatch.name',
  icon: '🧠',
  rulesKey: 'game.memoryMatch.rules',
  generateLevel,
  validateAnswer(_task, answer) {
    return { correct: answer <= MISTAKES_THRESHOLD };
  },
  Renderer,
};

export default memoryMatch;
