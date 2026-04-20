import type { GameDefinition, LevelSpec, Task } from '../types';
import type { EmotionId } from '../emotions-recognize/Renderer';
import {
  Renderer,
  type HeroEmotionAnswer,
  type HeroEmotionPayload,
} from './Renderer';

const TASKS_PER_LEVEL = 5;
const CANDIDATES_PER_TASK = 3;

const EMOTION_IDS: EmotionId[] = ['happy', 'sad', 'angry', 'scared', 'surprised', 'sleepy'];

interface SituationEntry {
  key: string;
  sceneEmoji: string;
  emotion: EmotionId;
}

const SITUATION_POOL: SituationEntry[] = [
  { key: 'birthday', sceneEmoji: '🎂', emotion: 'happy' },
  { key: 'gift', sceneEmoji: '🎁', emotion: 'happy' },
  { key: 'friendHug', sceneEmoji: '🤗', emotion: 'happy' },

  { key: 'brokenToy', sceneEmoji: '🧸', emotion: 'sad' },
  { key: 'rainyDay', sceneEmoji: '🌧️', emotion: 'sad' },
  { key: 'lostBalloon', sceneEmoji: '🎈', emotion: 'sad' },

  { key: 'takenToy', sceneEmoji: '🚫', emotion: 'angry' },
  { key: 'noise', sceneEmoji: '📢', emotion: 'angry' },

  { key: 'darkRoom', sceneEmoji: '🌑', emotion: 'scared' },
  { key: 'bigDog', sceneEmoji: '🐕', emotion: 'scared' },

  { key: 'unexpectedGift', sceneEmoji: '🎉', emotion: 'surprised' },
  { key: 'rainbow', sceneEmoji: '🌈', emotion: 'surprised' },

  { key: 'longDay', sceneEmoji: '🌙', emotion: 'sleepy' },
  { key: 'warmBed', sceneEmoji: '🛏️', emotion: 'sleepy' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickCandidates(target: EmotionId): EmotionId[] {
  const distractors = EMOTION_IDS.filter((id) => id !== target);
  const picked = shuffle(distractors).slice(0, CANDIDATES_PER_TASK - 1);
  return shuffle([target, ...picked]);
}

function generateLevel(difficulty: number): LevelSpec<HeroEmotionAnswer> {
  const picked = shuffle(SITUATION_POOL).slice(0, TASKS_PER_LEVEL);
  const tasks: Task<HeroEmotionAnswer>[] = picked.map((entry, index) => {
    const payload: HeroEmotionPayload = {
      target: entry.emotion,
      sceneEmoji: entry.sceneEmoji,
      situationKey: entry.key,
      candidates: pickCandidates(entry.emotion),
    };
    return { id: `t${index}`, payload };
  });
  return {
    seed: `hero-emotion-${Date.now()}`,
    difficulty,
    tasks,
  };
}

const heroEmotion: GameDefinition<LevelSpec<HeroEmotionAnswer>, HeroEmotionAnswer> = {
  id: 'hero-emotion',
  islandId: 'emotions',
  name: 'game.heroEmotion.name',
  icon: '💭',
  rulesKey: 'game.heroEmotion.rules',
  generateLevel,
  validateAnswer(task, answer) {
    const p = task.payload as HeroEmotionPayload;
    return { correct: answer === p.target };
  },
  Renderer,
};

export default heroEmotion;
