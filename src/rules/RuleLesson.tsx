import { useMemo, useReducer } from 'react';
import { ChoiceGrid } from '@/games/shared/ui';
import type { GradeBand } from '@/games/types';
import {
  advance,
  startLesson,
  buildOptions,
  tasksDone,
  totalTasks,
  summaryRules,
  createRng,
  type Explain,
  type LessonState,
  type RuleLessonDef,
  type RuleVisual,
} from './rule-core';

// UI движка «Правило». Уся логіка фаз — у rule-core (чисте, тестоване);
// тут лише рендер поточної фази + канон-стилі (світла тема, --c-primary).

function VisualView({ visual }: { visual: RuleVisual }) {
  if (visual.kind === 'emoji') {
    return (
      <div style={{ textAlign: 'center', margin: '14px 0' }}>
        <div style={{ fontSize: 56, lineHeight: 1 }}>{visual.emoji}</div>
        {visual.caption && (
          <div style={{ color: 'var(--c-mut)', fontWeight: 800, fontSize: 13, marginTop: 6 }}>{visual.caption}</div>
        )}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '14px 0' }}>
      {visual.steps.map((s, i) => (
        <div
          key={i}
          style={{
            background: 'var(--c-primary-soft)',
            color: 'var(--c-primary)',
            fontWeight: 800,
            fontSize: 18,
            padding: '10px 14px',
            borderRadius: 'var(--c-r-sm)',
            textAlign: 'center',
          }}
        >
          {s}
        </div>
      ))}
    </div>
  );
}

function ExplainView({ explain }: { explain: Explain }) {
  if (explain.kind === 'consequence-replay') {
    return (
      <div style={panel('#FFF6F6', '#FFD9D9')}>
        <div style={panelTitle('#C0392B')}>Ось що вийшло:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {explain.steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontWeight: 700, fontSize: 15 }}>
              <span style={{ flexShrink: 0 }}>{s.ok ? '✅' : '❌'}</span>
              <span style={{ color: s.ok ? '#15803D' : '#C0392B' }}>{s.text}</span>
            </div>
          ))}
        </div>
        <div style={{ ...panelTitle('#15803D'), marginTop: 12 }}>Як правильно:</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {explain.correctTail.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontWeight: 800, fontSize: 15, color: '#15803D' }}>
              <span style={{ flexShrink: 0 }}>→</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (explain.kind === 'visual-proof') {
    return (
      <div style={panel('var(--c-primary-soft)', '#DAD3FF')}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--c-ink)' }}>{explain.note}</div>
        <VisualView visual={explain.visual} />
      </div>
    );
  }
  return (
    <div style={panel('var(--c-primary-soft)', '#DAD3FF')}>
      <div style={panelTitle('var(--c-primary)')}>Пригадай правило:</div>
      <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--c-ink)' }}>{explain.text}</div>
    </div>
  );
}

function panel(bg: string, border: string) {
  return {
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 'var(--c-r-sm)',
    padding: '14px 16px',
    marginTop: 16,
    animation: 'fadeInUp .3s ease both',
  } as const;
}
function panelTitle(color: string) {
  return { fontWeight: 900, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.04em', color, marginBottom: 8 } as const;
}

interface Props {
  def: RuleLessonDef;
  band: GradeBand;
  mastery?: number;
  seed: number;
  onExit: () => void;
  onDone: (result: { mistakes: number }) => void;
  onReplay: () => void;
}

export default function RuleLesson({ def, band, mastery = 0, seed, onExit, onDone, onReplay }: Props) {
  const blocks = useMemo(() => def.build(band, createRng(seed)), [def, band, seed]);
  const optRng = useMemo(() => createRng(seed ^ 0x9e3779b9), [seed]);

  const [state, dispatch] = useReducer(
    (s: LessonState, ev: Parameters<typeof advance>[1]) => advance(s, ev),
    undefined,
    () => startLesson(blocks, mastery),
  );

  const { phase } = state;
  const total = totalTasks(blocks);
  const done = tasksDone(state);

  const topbar = (
    <div className="g-topbar">
      <button
        className="g-iconbtn"
        aria-label="Вийти"
        onClick={() => {
          if (window.confirm('Вийти з уроку? Прогрес не збережеться.')) onExit();
        }}
      >
        ✕
      </button>
      <div className="g-progress">
        <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>
      <div className="g-count">{Math.min(done + 1, total)}/{total}</div>
      <div className="g-diffbadge">Правило</div>
    </div>
  );

  // ---- Summary ----
  if (phase.kind === 'summary') {
    return (
      <div className="g-screen">
        <div className="play-col">
          <div className="g-scroll" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 18 }}>
            <div style={{ fontSize: 64, animation: 'starPop .5s ease both' }}>🎓</div>
            <h2 className="g-title" style={{ fontSize: 22, textAlign: 'center' }}>Урок пройдено!</h2>
            <div style={{ width: '100%', maxWidth: 340 }}>
              <div style={panelTitle('var(--c-primary)')}>Ти вивчив правило:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {summaryRules(blocks).map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      background: 'var(--c-primary-soft)', color: 'var(--c-ink)',
                      fontWeight: 800, fontSize: 15, padding: '12px 14px', borderRadius: 'var(--c-r-sm)',
                    }}
                  >
                    <span style={{ flexShrink: 0 }}>📌</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              <button className="g-btn primary" onClick={() => onDone({ mistakes: state.mistakes })}>Готово 🎉</button>
              <button className="g-btn soft" onClick={onReplay}>Пройти ще раз 🔁</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const block = blocks[phase.block];
  const changeBadge =
    phase.kind === 'rule' && phase.block > 0 && block.changeNote ? (
      <div
        style={{
          alignSelf: 'center', background: 'var(--c-gold)', color: '#7a5b00',
          fontWeight: 900, fontSize: 12, padding: '6px 14px', borderRadius: 999,
          textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8,
        }}
      >
        ✨ {block.changeNote}
      </div>
    ) : null;

  // ---- Rule ----
  if (phase.kind === 'rule') {
    return (
      <Screen topbar={topbar}>
        {changeBadge}
        <div className="g-card">
          <div className="g-question">📏 Правило</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--c-ink)', lineHeight: 1.3 }}>{block.statement.text}</div>
          {block.statement.visual && <VisualView visual={block.statement.visual} />}
        </div>
        <button className="g-btn primary" style={{ marginTop: 18 }} onClick={() => dispatch({ type: 'NEXT' })}>Далі →</button>
      </Screen>
    );
  }

  // ---- Worked example (PD2) ----
  if (phase.kind === 'worked') {
    const w = block.worked;
    return (
      <Screen topbar={topbar}>
        <div className="g-card">
          <div className="g-question">Розберемо разом</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--c-primary)', textAlign: 'center', margin: '6px 0 14px' }}>{w.prompt}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {w.steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontWeight: 700, fontSize: 15, color: 'var(--c-ink)' }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: 999, background: 'var(--c-primary)',
                  color: '#fff', fontSize: 12, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#15803D' }}>= {w.answer}</div>
        </div>
        <button className="g-btn primary" style={{ marginTop: 18 }} onClick={() => dispatch({ type: 'NEXT' })}>Зрозуміло, спробую →</button>
      </Screen>
    );
  }

  // ---- Apply ----
  const task = block.tasks[phase.task];
  const options = buildOptions(task, optRng).map((v) => ({ value: v }));
  const showingExplain = state.explain !== null;

  return (
    <Screen topbar={topbar}>
      <div className={`g-card${showingExplain ? '' : ''}`}>
        <div className="g-question">Застосуй правило</div>
        <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--c-ink)', textAlign: 'center', margin: '8px 0' }}>{task.prompt}</div>
      </div>
      <ChoiceGrid
        key={`${phase.block}-${phase.task}`}
        options={options}
        correct={task.correct}
        disabled={showingExplain}
        answerState={showingExplain ? 'incorrect' : 'idle'}
        onPick={(v) => dispatch({ type: 'ANSWER', value: String(v) })}
      />
      {state.explain && (
        <>
          <ExplainView explain={state.explain} />
          <button className="g-btn primary" style={{ marginTop: 14 }} onClick={() => dispatch({ type: 'NEXT' })}>Зрозуміло 👍</button>
        </>
      )}
    </Screen>
  );
}

function Screen({ topbar, children }: { topbar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="g-screen">
      <div className="play-col">
        {topbar}
        <div className="g-scroll" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
