import type { Difficulty, GradeBand, LevelData, ProfileLevel, Round } from '../types';
import { gradeBandFor } from '../types';
import { randInt, shuffle } from '../shared/ui';

export type SeasonId = 'winter' | 'spring' | 'summer' | 'autumn';
export type WeatherId = 'sunny' | 'rain' | 'snow' | 'windy';

export const SEASON_LABEL: Record<SeasonId, string> = {
  winter: 'Зима',
  spring: 'Весна',
  summer: 'Літо',
  autumn: 'Осінь',
};

export const WEATHER_LABEL: Record<WeatherId, string> = {
  sunny: 'Сонячно',
  rain: 'Дощ',
  snow: 'Сніг',
  windy: 'Вітряно',
};

/** Порядок для варіантів відповіді — усі 4 пори року завжди можливі як варіант. */
export const SEASON_ORDER: SeasonId[] = ['winter', 'spring', 'summer', 'autumn'];
/** Порядок для варіантів відповіді — усі 4 типи погоди завжди можливі як варіант. */
export const WEATHER_ORDER: WeatherId[] = ['sunny', 'rain', 'snow', 'windy'];

interface SeasonEntry {
  emoji: string;
  season: SeasonId;
  /** Найпростіша, найбільш впізнавана ознака (для L0). */
  basic: boolean;
}

interface WeatherEntry {
  emoji: string;
  weather: WeatherId;
  basic: boolean;
}

// Ознаки/одяг/явища, коректні для клімату України.
const SEASON_ITEMS: SeasonEntry[] = [
  { emoji: '⛄', season: 'winter', basic: true },
  { emoji: '🧤', season: 'winter', basic: false },
  { emoji: '🎄', season: 'winter', basic: false },

  { emoji: '🌷', season: 'spring', basic: true },
  { emoji: '🌸', season: 'spring', basic: false },
  { emoji: '🐣', season: 'spring', basic: false },

  { emoji: '🍦', season: 'summer', basic: true },
  { emoji: '🍉', season: 'summer', basic: false },
  { emoji: '🌻', season: 'summer', basic: false },

  { emoji: '🍂', season: 'autumn', basic: true },
  { emoji: '🍄', season: 'autumn', basic: false },
  { emoji: '🎒', season: 'autumn', basic: false },
];

const WEATHER_ITEMS: WeatherEntry[] = [
  { emoji: '☀️', weather: 'sunny', basic: true },
  { emoji: '😎', weather: 'sunny', basic: false },

  { emoji: '🌧️', weather: 'rain', basic: true },
  { emoji: '☔', weather: 'rain', basic: false },

  { emoji: '❄️', weather: 'snow', basic: true },
  { emoji: '🌨️', weather: 'snow', basic: false },

  { emoji: '🌬️', weather: 'windy', basic: true },
  { emoji: '🍃', weather: 'windy', basic: false },
];

const ROUNDS_PER_LEVEL = 5;

/**
 * Кількість варіантів відповіді за узгодженою шкалою L0-L4 (D5).
 * Гра доступна лише профілю 'L0' (дошкільнята, `levels: ['L0']`), тож реально
 * задіяні лише L0-L2 (Easy/Medium/Hard); значення для L3-L4 — про запас на
 * майбутнє розширення `levels` (не викликаються сьогодні). Максимум = 4, бо
 * стільки всього категорій (пір року/типів погоди).
 */
export const CHOICES_BY_BAND: Record<GradeBand, number> = {
  L0: 2,
  L1: 3,
  L2: 4,
  L3: 4,
  L4: 4,
};

export interface Payload {
  emoji: string;
  kind: 'season' | 'weather';
  /** Варіанти відповіді (мітки), вже перемішані, включно з правильною. */
  options: string[];
}

function pickSeasonOptions(target: SeasonId, count: number): string[] {
  const distractors = shuffle(SEASON_ORDER.filter((s) => s !== target)).slice(0, Math.max(0, count - 1));
  return shuffle([SEASON_LABEL[target], ...distractors.map((s) => SEASON_LABEL[s])]);
}

function pickWeatherOptions(target: WeatherId, count: number): string[] {
  const distractors = shuffle(WEATHER_ORDER.filter((w) => w !== target)).slice(0, Math.max(0, count - 1));
  return shuffle([WEATHER_LABEL[target], ...distractors.map((w) => WEATHER_LABEL[w])]);
}

export function generate(difficulty: Difficulty, level: ProfileLevel): LevelData<Payload, string> {
  const band = gradeBandFor(level, difficulty);
  const basicOnly = band === 'L0';
  const choices = CHOICES_BY_BAND[band];

  const seasonPool = basicOnly ? SEASON_ITEMS.filter((s) => s.basic) : SEASON_ITEMS;
  const weatherPool = basicOnly ? WEATHER_ITEMS.filter((w) => w.basic) : WEATHER_ITEMS;

  const rounds: Round<Payload, string>[] = [];
  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    const kind: 'season' | 'weather' = Math.random() < 0.5 ? 'season' : 'weather';
    if (kind === 'season') {
      const item = seasonPool[randInt(0, seasonPool.length - 1)];
      rounds.push({
        id: `r${i}`,
        payload: { emoji: item.emoji, kind, options: pickSeasonOptions(item.season, choices) },
        answer: SEASON_LABEL[item.season],
      });
    } else {
      const item = weatherPool[randInt(0, weatherPool.length - 1)];
      rounds.push({
        id: `r${i}`,
        payload: { emoji: item.emoji, kind, options: pickWeatherOptions(item.weather, choices) },
        answer: WEATHER_LABEL[item.weather],
      });
    }
  }
  return { difficulty, rounds };
}
