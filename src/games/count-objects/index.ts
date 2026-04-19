import type { GameDefinition, LevelSpec, Task } from '../types';
import { Renderer, type CountAnswer, type CountPayload } from './Renderer';

const TASKS_PER_LEVEL = 5;
const RANGE_MIN = 1;
const RANGE_MAX = 20;
const MIN_DIST_FRAC = 0.14;
const SPRITE_MARGIN = 0.08;

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randFloat(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function generatePositions(count: number): { xFrac: number; yFrac: number }[] {
  const positions: { xFrac: number; yFrac: number }[] = [];
  const maxAttempts = count * 50;
  let attempts = 0;

  while (positions.length < count && attempts < maxAttempts) {
    const x = randFloat(SPRITE_MARGIN, 1 - SPRITE_MARGIN);
    const y = randFloat(SPRITE_MARGIN, 1 - SPRITE_MARGIN);
    const tooClose = positions.some(
      (p) => Math.hypot(p.xFrac - x, p.yFrac - y) < MIN_DIST_FRAC
    );
    if (!tooClose) positions.push({ xFrac: x, yFrac: y });
    attempts++;
  }

  if (positions.length < count) {
    positions.length = 0;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const stepX = (1 - SPRITE_MARGIN * 2) / Math.max(cols - 1, 1);
    const stepY = (1 - SPRITE_MARGIN * 2) / Math.max(rows - 1, 1);
    for (let i = 0; i < count; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      positions.push({
        xFrac: SPRITE_MARGIN + c * stepX,
        yFrac: SPRITE_MARGIN + r * stepY,
      });
    }
  }

  return positions;
}

function generateLevel(difficulty: number): LevelSpec<CountAnswer> {
  const tasks: Task<CountAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    const correctCount = randInt(RANGE_MIN, RANGE_MAX);
    const payload: CountPayload = {
      itemKey: 'apple',
      correctCount,
      positions: generatePositions(correctCount),
    };
    tasks.push({ id: `t${i}`, payload });
  }
  return {
    seed: `count-objects-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const countObjects: GameDefinition<LevelSpec<CountAnswer>, CountAnswer> = {
  id: 'count-objects',
  islandId: 'math',
  name: 'game.countObjects.name',
  icon: '🍎',
  rulesKey: 'game.countObjects.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as CountPayload;
    return { correct: answer === p.correctCount };
  },
  Renderer,
};

export default countObjects;
