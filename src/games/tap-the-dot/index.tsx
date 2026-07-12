import { useState } from 'react';
import type { GameDefinition, GameComponentProps, Difficulty, LevelData, Round } from '../types';
import { BOARD_DONE } from '../types';
import { randInt } from '../shared/ui';

type Answer = typeof BOARD_DONE;

interface Payload {
  dotSize: number;
  hitsNeeded: number;
}

function paramsFor(difficulty: Difficulty): { dotSize: number; hitsNeeded: number } {
  if (difficulty === 1) return { dotSize: 72, hitsNeeded: 6 };
  if (difficulty === 2) return { dotSize: 54, hitsNeeded: 8 };
  return { dotSize: 38, hitsNeeded: 10 };
}

function generate(difficulty: Difficulty): LevelData<Payload, Answer> {
  const { dotSize, hitsNeeded } = paramsFor(difficulty);
  const round: Round<Payload, Answer> = {
    id: `board-${difficulty}`,
    payload: { dotSize, hitsNeeded },
    answer: BOARD_DONE,
  };
  return { difficulty, rounds: [round] };
}

function randomPos() {
  return { xPct: randInt(6, 84), yPct: randInt(6, 74) };
}

function Component({ round, disabled, onAnswer, onMistake }: GameComponentProps<Payload, Answer>) {
  const { dotSize, hitsNeeded } = round.payload;
  const [pos, setPos] = useState(randomPos);
  const [hits, setHits] = useState(0);

  function handleHit() {
    if (disabled) return;
    const next = hits + 1;
    if (next >= hitsNeeded) {
      onAnswer(BOARD_DONE);
      return;
    }
    setHits(next);
    setPos(randomPos());
  }

  function handleMiss() {
    if (disabled) return;
    onMistake();
  }

  return (
    <div>
      <div
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-round)',
          fontWeight: 800,
          color: 'var(--c-mut)',
          marginBottom: 14,
        }}
      >
        Спіймано: {hits}/{hitsNeeded}
      </div>

      <div
        onClick={handleMiss}
        style={{
          position: 'relative',
          width: '100%',
          height: 320,
          borderRadius: 'var(--c-r-sm)',
          background: 'var(--c-primary-soft)',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleHit();
          }}
          disabled={disabled}
          aria-label="крапка"
          style={{
            position: 'absolute',
            left: `${pos.xPct}%`,
            top: `${pos.yPct}%`,
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            border: 'none',
            padding: 0,
            background: 'linear-gradient(135deg, var(--c-pink), var(--c-primary))',
            boxShadow: '0 4px 14px rgba(255,110,199,.45)',
            cursor: disabled ? 'default' : 'pointer',
          }}
        />
      </div>
    </div>
  );
}

const tapTheDot: GameDefinition<Payload, Answer> = {
  id: 'tap-the-dot',
  title: 'Спіймай крапку',
  subject: 'attention',
  levels: ['L0', 'L3'],
  icon: '🎯',
  description: 'Спіймай крапку.',
  accent: '#FEE2E2',
  generate,
  Component,
  // TODO(A2-увага): skills після seed skill-graph уваги
};

export default tapTheDot;
