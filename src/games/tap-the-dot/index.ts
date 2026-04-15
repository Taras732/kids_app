import type { GameDefinition, LevelSpec, Task } from '../types';
import { Renderer, type DotAnswer, type DotPayload } from './Renderer';

const TASKS_PER_LEVEL = 5;
const DOT_RADIUS = 40;
const HIT_TOLERANCE = 20;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function generateLevel(difficulty: number): LevelSpec<DotAnswer> {
  const tasks: Task<DotAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    const payload: DotPayload = {
      xFrac: rand(0.1, 0.9),
      yFrac: rand(0.15, 0.85),
      radius: Math.max(28, DOT_RADIUS - Math.round(difficulty * 4)),
    };
    tasks.push({
      id: `t${i}`,
      payload,
    });
  }
  return {
    seed: `tap-the-dot-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const tapTheDot: GameDefinition<LevelSpec<DotAnswer>, DotAnswer> = {
  id: 'tap-the-dot',
  islandId: 'logic',
  name: 'game.tapTheDot.name',
  icon: '🎯',
  rulesKey: 'game.tapTheDot.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as DotPayload;
    const a = answer;
    const fieldW = a.fieldW;
    const fieldH = a.fieldH;
    const dotX = p.xFrac * fieldW;
    const dotY = p.yFrac * fieldH;
    const dist = Math.hypot(a.x - dotX, a.y - dotY);
    return { correct: dist <= p.radius + HIT_TOLERANCE };
  },
  Renderer,
};

export default tapTheDot;
