import type { GameDefinition, LevelSpec, Task } from '../types';
import { Renderer, type SequenceAnswer, type SequencePayload } from './Renderer';

const TASKS_PER_LEVEL = 3;
const SEQUENCE_LENGTH = 3;
const BUTTONS_COUNT = 4;

function randInt(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function generateTask(index: number): Task<SequenceAnswer> {
  const sequence: number[] = [];
  for (let i = 0; i < SEQUENCE_LENGTH; i++) {
    sequence.push(randInt(0, BUTTONS_COUNT - 1));
  }
  const payload: SequencePayload = { sequence };
  return { id: `t${index}`, payload };
}

function generateLevel(difficulty: number): LevelSpec<SequenceAnswer> {
  const tasks: Task<SequenceAnswer>[] = [];
  for (let i = 0; i < TASKS_PER_LEVEL; i++) {
    tasks.push(generateTask(i));
  }
  return {
    seed: `sequence-repeat-${Date.now()}`,
    difficulty,
    tasks,
  };
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const sequenceRepeat: GameDefinition<LevelSpec<SequenceAnswer>, SequenceAnswer> = {
  id: 'sequence-repeat',
  islandId: 'memory',
  name: 'game.sequenceRepeat.name',
  icon: '🔢',
  rulesKey: 'game.sequenceRepeat.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as SequencePayload;
    return { correct: arraysEqual(answer, p.sequence) };
  },
  Renderer,
};

export default sequenceRepeat;
