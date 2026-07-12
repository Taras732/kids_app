import { useEffect, useMemo, useReducer, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { recordActivity } from '@/utils/activity';
import { recordGameResult } from '@/school/mastery';
import {
  type GameDefinition,
  type ProfileLevel,
  type Difficulty,
  type AnswerState,
  type LevelData,
  BOARD_DONE,
  computeStars,
  unlockedAfter,
  DIFFICULTY_LABEL,
} from './types';

const FEEDBACK_CORRECT_MS = 850;
const FEEDBACK_WRONG_MS = 1100;

interface ShellState {
  levelData: LevelData;
  difficulty: Difficulty;
  roundIndex: number;
  mistakes: number;
  answerState: AnswerState;
  finished: boolean;
  stars: 0 | 1 | 2 | 3;
}

type Action =
  | { type: 'CORRECT' }
  | { type: 'WRONG' }
  | { type: 'CLEAR_FEEDBACK' }
  | { type: 'MISTAKE' }
  | { type: 'ADVANCE' }
  | { type: 'FINISH' }
  | { type: 'RESET'; levelData: LevelData; difficulty: Difficulty };

function reducer(state: ShellState, action: Action): ShellState {
  switch (action.type) {
    case 'CORRECT':
      if (state.answerState !== 'idle') return state;
      return { ...state, answerState: 'correct' };
    case 'WRONG':
      if (state.answerState !== 'idle') return state;
      return { ...state, answerState: 'incorrect', mistakes: state.mistakes + 1 };
    case 'CLEAR_FEEDBACK':
      if (state.answerState !== 'incorrect') return state;
      return { ...state, answerState: 'idle' };
    case 'MISTAKE':
      return { ...state, mistakes: state.mistakes + 1 };
    case 'ADVANCE': {
      const next = state.roundIndex + 1;
      if (next >= state.levelData.rounds.length) {
        const stars = computeStars(state.mistakes, state.levelData.rounds.length);
        return { ...state, finished: true, stars, answerState: 'idle' };
      }
      return { ...state, roundIndex: next, answerState: 'idle' };
    }
    case 'FINISH': {
      const stars = computeStars(state.mistakes, state.levelData.rounds.length);
      return { ...state, finished: true, stars, answerState: 'idle' };
    }
    case 'RESET':
      return {
        levelData: action.levelData,
        difficulty: action.difficulty,
        roundIndex: 0,
        mistakes: 0,
        answerState: 'idle',
        finished: false,
        stars: 0,
      };
    default:
      return state;
  }
}

interface GameShellProps {
  game: GameDefinition;
  level: ProfileLevel;
  profileId: string;
  onExit: () => void;
}

export default function GameShell({ game, level, profileId, onExit }: GameShellProps) {
  const { user } = useAuthStore();
  const { progress, updateProgress } = useProfileStore();

  // Найвища відкрита складність для цієї гри в цього профілю (з level gate).
  const prevUnlocked = useMemo<Difficulty>(() => {
    const saved = progress[profileId]?.[game.id]?.level;
    return (saved === 2 || saved === 3 ? saved : 1) as Difficulty;
    // навмисно тільки при монтуванні — не рестартувати гру при апдейті прогресу
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [state, dispatch] = useReducer(reducer, undefined, (): ShellState => {
    const levelData = game.generate(prevUnlocked, level);
    return {
      levelData,
      difficulty: prevUnlocked,
      roundIndex: 0,
      mistakes: 0,
      answerState: 'idle',
      finished: false,
      stars: 0,
    };
  });

  const round = state.levelData.rounds[Math.min(state.roundIndex, state.levelData.rounds.length - 1)];
  const total = state.levelData.rounds.length;

  const checkCorrect = useCallback(
    (answer: unknown) =>
      game.isCorrect ? game.isCorrect(round, answer) : answer === round.answer,
    [game, round],
  );

  const handleAnswer = useCallback(
    (answer: unknown) => {
      if (state.answerState !== 'idle' || state.finished) return;

      // Board-based ігри шлють сентінел завершення поля.
      if (answer === BOARD_DONE) {
        dispatch({ type: 'FINISH' });
        return;
      }

      if (checkCorrect(answer)) {
        dispatch({ type: 'CORRECT' });
        confetti({ particleCount: 45, spread: 42, origin: { y: 0.65 }, disableForReducedMotion: true });
        window.setTimeout(() => dispatch({ type: 'ADVANCE' }), FEEDBACK_CORRECT_MS);
      } else {
        // Неправильно: показати фідбек, тоді повернути до idle (повтор того ж раунду).
        dispatch({ type: 'WRONG' });
        window.setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), FEEDBACK_WRONG_MS);
      }
    },
    [state.answerState, state.finished, checkCorrect],
  );

  const handleMistake = useCallback(() => dispatch({ type: 'MISTAKE' }), []);

  // Зберегти прогрес при завершенні.
  useEffect(() => {
    if (!state.finished) return;
    const newUnlocked = unlockedAfter(state.difficulty, state.stars, prevUnlocked);
    confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 }, disableForReducedMotion: true });
    recordActivity(profileId);
    updateProgress(
      profileId,
      game.id,
      newUnlocked,
      state.stars,
      { at: new Date().toISOString(), difficulty: state.difficulty, mistakes: state.mistakes },
      user?.id,
    );

    // A4: mastery-движок. Пишемо attempt + перераховуємо frontier лише для
    // ігор зі skillIds на цій складності і для синхронізованих профілів
    // (гість не має рядка profiles у БД → attempt впав би на FK). Fire-and-forget:
    // не блокує екран результату й не ламає гру, якщо офлайн.
    const skillIds = game.skillIds?.[state.difficulty];
    if (user?.id && skillIds && skillIds.length > 0) {
      recordGameResult({
        profileId,
        skillIds,
        gameId: game.id,
        difficulty: state.difficulty,
        correct: Math.max(0, total - state.mistakes),
        total,
      }).catch((e) => console.warn('[mastery] update skipped:', e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.finished]);

  const GameComponent = game.Component;

  if (!state.finished) {
    return (
      <div className="g-screen">
       <div className="play-col">
        <div className="g-topbar">
          <button
            className="g-iconbtn"
            aria-label="Вийти"
            onClick={() => {
              if (window.confirm('Вийти з гри? Прогрес цієї спроби не збережеться.')) onExit();
            }}
          >
            ✕
          </button>
          <div className="g-progress">
            <span style={{ width: `${(state.roundIndex / total) * 100}%` }} />
          </div>
          <div className="g-count">
            {state.roundIndex + 1}/{total}
          </div>
          <div className="g-diffbadge">{DIFFICULTY_LABEL[state.difficulty]}</div>
        </div>

        <div className="g-scroll" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <GameComponent
            key={round.id}
            round={round}
            roundIndex={state.roundIndex}
            totalRounds={total}
            disabled={state.answerState !== 'idle'}
            answerState={state.answerState}
            onAnswer={handleAnswer}
            onMistake={handleMistake}
          />
        </div>
       </div>
      </div>
    );
  }

  // ---- Екран результату ----
  const newUnlocked = unlockedAfter(state.difficulty, state.stars, prevUnlocked);
  const unlockedNext = newUnlocked > state.difficulty;
  const canPlayHarder = state.difficulty < 3 && newUnlocked > state.difficulty;

  const message =
    state.mistakes === 0
      ? 'Ідеально! Жодної помилки 🎯'
      : state.stars === 2
        ? 'Чудова робота! 👏'
        : 'Молодець, що не здаєшся! 💪';

  return (
    <div className="g-screen">
     <div className="play-col">
      <div className="g-scroll" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 22 }}>
        <div style={{ fontSize: 72, animation: 'starPop .5s ease both' }}>🏆</div>
        <h2 className="g-title" style={{ fontSize: 24 }}>{message}</h2>

        <div style={{ display: 'flex', gap: 14 }}>
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              style={{
                fontSize: 46,
                animation: s <= state.stars ? `starPop .5s ease both ${s * 0.12}s` : 'none',
                filter: s <= state.stars ? 'none' : 'grayscale(100%) opacity(22%)',
              }}
            >
              ⭐
            </span>
          ))}
        </div>

        <div style={{ color: 'var(--c-mut)', fontWeight: 700, fontSize: 14 }}>
          Гра: {game.title} · {DIFFICULTY_LABEL[state.difficulty]}
        </div>

        {unlockedNext && (
          <div
            style={{
              background: 'var(--c-primary-soft)',
              color: 'var(--c-primary)',
              fontWeight: 800,
              padding: '10px 18px',
              borderRadius: 999,
              fontSize: 13,
              animation: 'fadeInUp .4s ease both',
            }}
          >
            🔓 Відкрито складність: {DIFFICULTY_LABEL[newUnlocked]}!
          </div>
        )}

        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
          {canPlayHarder && (
            <button
              className="g-btn primary"
              onClick={() => {
                const nextDiff = (state.difficulty + 1) as Difficulty;
                dispatch({ type: 'RESET', levelData: game.generate(nextDiff, level), difficulty: nextDiff });
              }}
            >
              Далі складніше ⬆️
            </button>
          )}
          <button
            className="g-btn soft"
            onClick={() =>
              dispatch({ type: 'RESET', levelData: game.generate(state.difficulty, level), difficulty: state.difficulty })
            }
          >
            Зіграти ще раз 🔁
          </button>
          <button className="g-btn ghost" onClick={onExit}>
            До ігор 🏠
          </button>
        </div>
      </div>
     </div>
    </div>
  );
}
