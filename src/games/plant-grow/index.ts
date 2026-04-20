import type { GameDefinition, LevelSpec, Task } from '../types';
import {
  Renderer,
  type StageId,
  type PlantGrowAnswer,
  type PlantGrowPayload,
} from './Renderer';

const TASKS_PER_LEVEL = 4;
const CANDIDATES_PER_TASK = 3;

const STAGES: { id: StageId; emoji: string }[] = [
  { id: 'seed', emoji: '🌰' },
  { id: 'sprout', emoji: '🌱' },
  { id: 'leafy', emoji: '🌿' },
  { id: 'bloom', emoji: '🌷' },
  { id: 'fruit', emoji: '🍎' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickCandidates(target: StageId): { id: StageId; emoji: string }[] {
  const distractors = STAGES.filter((s) => s.id !== target);
  const picked = shuffle(distractors).slice(0, CANDIDATES_PER_TASK - 1);
  const targetStage = STAGES.find((s) => s.id === target)!;
  return shuffle([targetStage, ...picked]);
}

function generateLevel(difficulty: number): LevelSpec<PlantGrowAnswer> {
  const tasks: Task<PlantGrowAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    const current = STAGES[i];
    const target = STAGES[i + 1];
    const payload: PlantGrowPayload = {
      current: current.id,
      currentEmoji: current.emoji,
      target: target.id,
      candidates: pickCandidates(target.id),
    };
    tasks.push({ id: `t${i}`, payload });
  }
  return {
    seed: `plant-grow-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const plantGrow: GameDefinition<LevelSpec<PlantGrowAnswer>, PlantGrowAnswer> = {
  id: 'plant-grow',
  islandId: 'science',
  name: 'game.plantGrow.name',
  icon: '🌱',
  rulesKey: 'game.plantGrow.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as PlantGrowPayload;
    return { correct: answer === p.target };
  },
  Renderer,
};

export default plantGrow;
