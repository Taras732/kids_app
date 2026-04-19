import type { GameDefinition, LevelSpec, Task } from '../types';
import { Renderer, type ShapeAnswer, type ShapePayload, type ShapeCandidate } from './Renderer';
import type { ShapeId } from './shapes';

const TASKS_PER_LEVEL = 5;
const CANDIDATES_PER_TASK = 4;
const SHAPE_POOL: ShapeId[] = ['circle', 'square', 'triangle', 'rectangle'];
const COLOR_POOL = ['#FF6B35', '#4ECDC4', '#FFD93D', '#845EC2', '#22C55E'];

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

function pickShapes(target: ShapeId): ShapeId[] {
  const distractors = SHAPE_POOL.filter((s) => s !== target);
  return shuffle([target, ...distractors]).slice(0, CANDIDATES_PER_TASK);
}

function pickColors(count: number): string[] {
  return shuffle(COLOR_POOL).slice(0, count);
}

function generateTask(index: number): Task<ShapeAnswer> {
  const target = SHAPE_POOL[randInt(0, SHAPE_POOL.length - 1)];
  const shapeIds = pickShapes(target);
  const colors = pickColors(shapeIds.length);
  const candidates: ShapeCandidate[] = shapeIds.map((id, i) => ({ id, color: colors[i] }));
  const payload: ShapePayload = { target, candidates };
  return { id: `t${index}`, payload };
}

function generateLevel(difficulty: number): LevelSpec<ShapeAnswer> {
  const tasks: Task<ShapeAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    tasks.push(generateTask(i));
  }
  return {
    seed: `shapes-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const shapes: GameDefinition<LevelSpec<ShapeAnswer>, ShapeAnswer> = {
  id: 'shapes',
  islandId: 'math',
  name: 'game.shapes.name',
  icon: '🔺',
  rulesKey: 'game.shapes.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as ShapePayload;
    return { correct: answer === p.target };
  },
  Renderer,
};

export default shapes;
