import { useState } from 'react';
import type {
  GameDefinition,
  GameComponentProps,
  Difficulty,
  LevelData,
  Round,
  ProfileLevel,
  ClassLevel,
} from '../types';
import { classBand, gradeBandFor } from '../types';
import { PromptCard, ChoiceGrid } from '../shared/ui';
import {
  generateNet,
  buildTask,
  createRng,
  optionsCountFor,
  askableFaces,
  shuffleWith,
  type CubeNet,
  type FaceId,
} from './core';

const ROUNDS_PER_LEVEL = 5;

interface Payload {
  net: CubeNet;
  askFace: FaceId;
  options: string[];
}

/** Band гри: розгортки — тема 3–4 класу, тож нижче L3 не опускаємось. */
function bandFor(level: ProfileLevel, difficulty: Difficulty, classLevel?: ClassLevel): 'L3' | 'L4' {
  const b = classLevel ? classBand(classLevel, difficulty) : gradeBandFor(level, difficulty);
  return b === 'L4' ? 'L4' : 'L3';
}

function generate(difficulty: Difficulty, level: ProfileLevel, classLevel?: ClassLevel): LevelData<Payload, string> {
  const band = bandFor(level, difficulty, classLevel);
  // seed з рівня+складності: детерміновано в межах спроби, без Math.random у рендері
  const rng = createRng(0x9e37 ^ (difficulty * 7919) ^ (band === 'L4' ? 104729 : 15485863));
  const faces = shuffleWith(askableFaces(band), rng);

  const rounds: Round<Payload, string>[] = Array.from({ length: ROUNDS_PER_LEVEL }, (_, i) => {
    const net = generateNet(rng);
    // питані грані не повторюються, доки не вичерпано список
    const askFace = faces[i % faces.length];
    const task = buildTask(`r${i}`, net, askFace, optionsCountFor(band), rng);
    return {
      id: `r${i}`,
      payload: { net: task.net, askFace: task.askFace, options: task.options },
      answer: task.correct,
    };
  });

  return { difficulty, rounds };
}

/** Клітинка розгортки. Питана грань підсвічена, решта — звичайні. */
function Cell({ mark, asked = false, dim = false }: { mark?: string; asked?: boolean; dim?: boolean }) {
  if (!mark) return <span style={{ width: 46, height: 46 }} />;
  return (
    <span
      style={{
        width: 46,
        height: 46,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        borderRadius: 8,
        border: asked ? '3px solid var(--c-primary)' : '2px solid var(--c-line)',
        background: asked ? 'var(--c-primary-soft)' : 'var(--c-card)',
        opacity: dim ? 0.45 : 1,
      }}
    >
      {mark}
    </span>
  );
}

/** Хрестоподібна розгортка: смуга a-b-c-d, top над b, bottom під b. */
function NetView({ net, askFace }: { net: CubeNet; askFace?: FaceId }) {
  const row = (cells: (FaceId | null)[]) => (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
      {cells.map((id, i) => (
        <Cell key={i} mark={id ? net[id] : undefined} asked={!!id && id === askFace} />
      ))}
    </div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: '10px auto' }}>
      {row([null, 'top', null, null])}
      {row(['a', 'b', 'c', 'd'])}
      {row([null, 'bottom', null, null])}
    </div>
  );
}

/**
 * Правило перед грою (той самий принцип, що в движку «Правило» і в number-tiles):
 * дитина спершу дізнається ЧОМУ, а вже потім застосовує. Без цього гра була б
 * тестом просторової здібності — а ми вчимо.
 */
function RulesIntro({ onStart }: { onStart: () => void }) {
  const demo: CubeNet = { a: '🔴', b: '🔵', c: '🟢', d: '🟡', top: '🟣', bottom: '🟠' };
  return (
    <div className="g-card" style={{ maxWidth: 360, margin: '0 auto' }}>
      <div style={{ fontSize: 36, marginBottom: 4 }}>🎲</div>
      <h2 className="g-title" style={{ fontSize: 19, margin: '0 0 8px' }}>Склади куб подумки</h2>
      <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--c-ink)', lineHeight: 1.5, margin: '0 0 4px' }}>
        Це розгортка куба. Якщо її скласти — вийде кубик, і кожна грань стане навпроти якоїсь іншої.
      </p>

      <NetView net={demo} />

      <div
        style={{
          background: 'var(--c-primary-soft)',
          borderRadius: 'var(--c-r-sm)',
          padding: '12px 14px',
          margin: '10px 0',
          textAlign: 'left',
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--c-primary)', marginBottom: 6 }}>
          Правило
        </div>
        <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--c-ink)', lineHeight: 1.45 }}>
          У довгому рядку грані стоять навпроти <b>через одну</b>: 🔴 навпроти 🟢, а 🔵 навпроти 🟡.
          <br />
          А верхня 🟣 — навпроти нижньої 🟠.
        </div>
      </div>

      <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--c-mut)', margin: '0 0 14px' }}>
        Сусідні грані навпроти не бувають — вони торкаються боками 🎯
      </p>

      <button type="button" className="g-btn primary" onClick={onStart}>
        Спробувати 🎲
      </button>
    </div>
  );
}

function Component({ round, disabled, answerState, onAnswer }: GameComponentProps<Payload, string>) {
  const { net, askFace, options } = round.payload;
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) return <RulesIntro onStart={() => setShowIntro(false)} />;

  return (
    <>
      <PromptCard question={`Що буде навпроти ${net[askFace]}, якщо скласти куб?`} answerState={answerState}>
        <NetView net={net} askFace={askFace} />
      </PromptCard>
      <ChoiceGrid
        options={options.map((o) => ({ value: o, node: <span style={{ fontSize: 30 }}>{o}</span> }))}
        correct={round.answer}
        disabled={disabled}
        answerState={answerState}
        onPick={onAnswer}
        columns={options.length}
      />
    </>
  );
}

const cubeNet: GameDefinition<Payload, string> = {
  id: 'cube-net',
  title: 'Розгортка куба',
  subject: 'math',
  levels: ['L3'],
  icon: '🎲',
  description: 'Склади куб подумки: яка грань опиниться навпроти?',
  accent: '#E3F1FE',
  // тренує просторові фігури (куб) — поглиблення теми 3–4 класу
  skillIds: {
    1: ['math.geom.l1.spatial-shapes'],
    2: ['math.geom.l1.spatial-shapes'],
    3: ['math.geom.l1.spatial-shapes'],
  },
  generate,
  Component,
};

export default cubeNet;
