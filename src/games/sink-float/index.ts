import type { GameDefinition, LevelSpec, Task } from '../types';
import {
  Renderer,
  type SinkFloatId,
  type SinkFloatAnswer,
  type SinkFloatPayload,
} from './Renderer';

const TASKS_PER_LEVEL = 5;

interface ItemEntry {
  key: string;
  emoji: string;
  result: SinkFloatId;
}

const ITEM_POOL: ItemEntry[] = [
  { key: 'stone', emoji: '🪨', result: 'sink' },
  { key: 'coin', emoji: '🪙', result: 'sink' },
  { key: 'key', emoji: '🔑', result: 'sink' },
  { key: 'anchor', emoji: '⚓', result: 'sink' },
  { key: 'hammer', emoji: '🔨', result: 'sink' },
  { key: 'scissors', emoji: '✂️', result: 'sink' },

  { key: 'leaf', emoji: '🍃', result: 'float' },
  { key: 'duck', emoji: '🦆', result: 'float' },
  { key: 'boat', emoji: '⛵', result: 'float' },
  { key: 'apple', emoji: '🍎', result: 'float' },
  { key: 'balloon', emoji: '🎈', result: 'float' },
  { key: 'feather', emoji: '🪶', result: 'float' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLevel(difficulty: number): LevelSpec<SinkFloatAnswer> {
  const picked = shuffle(ITEM_POOL).slice(0, TASKS_PER_LEVEL);
  const tasks: Task<SinkFloatAnswer>[] = picked.map((entry, index) => {
    const payload: SinkFloatPayload = {
      target: entry.result,
      emoji: entry.emoji,
      itemKey: entry.key,
    };
    return { id: `t${index}`, payload };
  });
  return {
    seed: `sink-float-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const sinkFloat: GameDefinition<LevelSpec<SinkFloatAnswer>, SinkFloatAnswer> = {
  id: 'sink-float',
  islandId: 'science',
  name: 'game.sinkFloat.name',
  icon: '⚖️',
  rulesKey: 'game.sinkFloat.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as SinkFloatPayload;
    return { correct: answer === p.target };
  },
  Renderer,
};

export default sinkFloat;
