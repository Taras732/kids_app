import type { GameDefinition, LevelSpec, Task } from '../types';
import {
  Renderer,
  type StateId,
  type WaterStateAnswer,
  type WaterStatePayload,
} from './Renderer';

const TASKS_PER_LEVEL = 5;

interface ItemEntry {
  key: string;
  emoji: string;
  state: StateId;
}

const ITEM_POOL: ItemEntry[] = [
  { key: 'ice', emoji: '🧊', state: 'solid' },
  { key: 'snow', emoji: '❄️', state: 'solid' },
  { key: 'iceberg', emoji: '🏔️', state: 'solid' },

  { key: 'water', emoji: '💧', state: 'liquid' },
  { key: 'sea', emoji: '🌊', state: 'liquid' },
  { key: 'rain', emoji: '☔', state: 'liquid' },

  { key: 'cloud', emoji: '☁️', state: 'gas' },
  { key: 'steam', emoji: '💨', state: 'gas' },
  { key: 'fog', emoji: '🌫️', state: 'gas' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLevel(difficulty: number): LevelSpec<WaterStateAnswer> {
  const picked = shuffle(ITEM_POOL).slice(0, TASKS_PER_LEVEL);
  const tasks: Task<WaterStateAnswer>[] = picked.map((entry, index) => {
    const payload: WaterStatePayload = {
      target: entry.state,
      emoji: entry.emoji,
      itemKey: entry.key,
    };
    return { id: `t${index}`, payload };
  });
  return {
    seed: `water-states-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const waterStates: GameDefinition<LevelSpec<WaterStateAnswer>, WaterStateAnswer> = {
  id: 'water-states',
  islandId: 'science',
  name: 'game.waterStates.name',
  icon: '🔬',
  rulesKey: 'game.waterStates.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as WaterStatePayload;
    return { correct: answer === p.target };
  },
  Renderer,
};

export default waterStates;
