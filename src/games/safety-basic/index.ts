import type { GameDefinition, LevelSpec, Task } from '../types';
import {
  Renderer,
  type SafetyId,
  type SafetyAnswer,
  type SafetyPayload,
} from './Renderer';

const TASKS_PER_LEVEL = 5;

interface ItemEntry {
  key: string;
  emoji: string;
  result: SafetyId;
}

const ITEM_POOL: ItemEntry[] = [
  { key: 'fire', emoji: '🔥', result: 'unsafe' },
  { key: 'knife', emoji: '🔪', result: 'unsafe' },
  { key: 'outlet', emoji: '⚡', result: 'unsafe' },
  { key: 'pills', emoji: '💊', result: 'unsafe' },
  { key: 'chem', emoji: '🧪', result: 'unsafe' },
  { key: 'glass', emoji: '🍾', result: 'unsafe' },

  { key: 'teddy', emoji: '🧸', result: 'safe' },
  { key: 'apple', emoji: '🍎', result: 'safe' },
  { key: 'book', emoji: '📚', result: 'safe' },
  { key: 'crayons', emoji: '🖍️', result: 'safe' },
  { key: 'juice', emoji: '🧃', result: 'safe' },
  { key: 'paint', emoji: '🎨', result: 'safe' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLevel(difficulty: number): LevelSpec<SafetyAnswer> {
  const picked = shuffle(ITEM_POOL).slice(0, TASKS_PER_LEVEL);
  const tasks: Task<SafetyAnswer>[] = picked.map((entry, index) => {
    const payload: SafetyPayload = {
      target: entry.result,
      emoji: entry.emoji,
      itemKey: entry.key,
    };
    return { id: `t${index}`, payload };
  });
  return {
    seed: `safety-basic-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const safetyBasic: GameDefinition<LevelSpec<SafetyAnswer>, SafetyAnswer> = {
  id: 'safety-basic',
  islandId: 'emotions',
  name: 'game.safety.name',
  icon: '💚',
  rulesKey: 'game.safety.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as SafetyPayload;
    return { correct: answer === p.target };
  },
  Renderer,
};

export default safetyBasic;
