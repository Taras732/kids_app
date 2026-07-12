import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { storage } from '@/utils/storage';
import { applyPlacement } from '@/school/placement';
import {
  BANDS,
  PLACEMENT_STRANDS,
  itemFor,
  nextStep,
  startStrand,
  type PlacementState,
  type PlacementStrand,
} from '@/school/placement-core';
import type { GradeBand } from '@/school/types';

/** Дружні підписи рівнів для екрана результату. */
const BAND_LABEL: Record<GradeBand, string> = {
  L0: 'Дошкільний',
  L1: '1 клас',
  L2: '2 клас',
  L3: '3 клас',
  L4: '4 клас',
};

const STRAND_EMOJI: Record<PlacementStrand, string> = {
  'Числа й лічба': '🔢',
  'Дії з числами': '➕',
  'Величини': '📏',
  'Геометрія': '🔺',
};

/** localStorage-прапорець «діагностику пройдено» (Hub ховає підказку). */
export const placementDoneKey = (profileId: string) => `shk_placement_done_${profileId}`;

type Phase = 'intro' | 'test' | 'done';

export default function Placement() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeProfile } = useProfileStore();
  const profileId = activeProfile?.id ?? '';

  const [phase, setPhase] = useState<Phase>('intro');
  const [strandIdx, setStrandIdx] = useState(0);
  const [state, setState] = useState<PlacementState>(() => startStrand());
  const [questionNo, setQuestionNo] = useState(0);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  // Акумулятор результатів у ref — уникаємо stale-closure між strand-ами.
  const resultsRef = useRef<Partial<Record<PlacementStrand, GradeBand>>>({});
  const [results, setResults] = useState<Partial<Record<PlacementStrand, GradeBand>>>({});

  const strand = PLACEMENT_STRANDS[strandIdx];
  const isSynced = Boolean(user?.id && profileId);

  const goHub = () => navigate('/hub');

  const begin = () => {
    resultsRef.current = {};
    setStrandIdx(0);
    setState(startStrand());
    setQuestionNo(0);
    setPhase('test');
  };

  const finish = (final: Partial<Record<PlacementStrand, GradeBand>>) => {
    setResults(final);
    if (profileId) storage.set(placementDoneKey(profileId), '1');
    setPhase('done');
    // Синхронізовані профілі — записати стартові mastery. Гість пропускає
    // (немає рядка profiles у БД). Fire-and-forget: не блокує екран результату.
    if (isSynced) {
      setSaving(true);
      applyPlacement(profileId, final)
        .catch((e) => console.warn('[placement] apply skipped:', e))
        .finally(() => setSaving(false));
    }
  };

  const answer = (choiceIdx: number) => {
    if (busy) return;
    const item = itemFor(strand, BANDS[state.current]);
    if (!item) return;
    setBusy(true);
    const res = nextStep(state, choiceIdx === item.correctIndex);
    setQuestionNo((n) => n + 1);

    // Коротка пауза для тактильного відгуку натискання (без показу правильності —
    // це діагностика, не навчання).
    window.setTimeout(() => {
      if (res.done) {
        resultsRef.current = { ...resultsRef.current, [strand]: res.resultLevel! };
        if (strandIdx < PLACEMENT_STRANDS.length - 1) {
          setStrandIdx((i) => i + 1);
          setState(startStrand());
        } else {
          finish(resultsRef.current);
        }
      } else {
        setState(res.state);
      }
      setBusy(false);
    }, 240);
  };

  // Немає активного профілю — направити на онбординг.
  if (!activeProfile) {
    return (
      <div className="g-screen">
        <div className="play-col" style={{ justifyContent: 'center', alignItems: 'center', gap: 18, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 56 }}>🧭</div>
          <h2 className="g-title" style={{ fontSize: 20 }}>Спочатку оберіть учня</h2>
          <button className="g-btn primary" style={{ maxWidth: 280 }} onClick={() => navigate('/onboarding')}>
            До профілів
          </button>
        </div>
      </div>
    );
  }

  // ---- Інтро ----
  if (phase === 'intro') {
    return (
      <div className="g-screen">
        <div className="play-col" style={{ justifyContent: 'center', alignItems: 'center', gap: 20, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 64, animation: 'starPop .5s ease both' }}>🎯</div>
          <h2 className="g-title" style={{ fontSize: 24 }}>Визначимо твій рівень!</h2>
          <p style={{ color: 'var(--c-mut)', fontWeight: 700, fontSize: 15, maxWidth: 380, lineHeight: 1.5 }}>
            Кілька коротких запитань з математики (5–8 хвилин), щоб одразу підібрати
            завдання саме для тебе. Тут немає оцінок — просто відповідай як можеш.
          </p>
          {!isSynced && (
            <div style={{ background: 'var(--c-primary-soft)', color: 'var(--c-primary)', fontWeight: 800, fontSize: 12.5, padding: '10px 16px', borderRadius: 14, maxWidth: 380 }}>
              Гостьовий режим: результат не збережеться. Увійдіть, щоб зафіксувати рівень.
            </div>
          )}
          <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
            <button className="g-btn primary" onClick={begin}>Почати 🚀</button>
            <button className="g-btn ghost" onClick={goHub}>Пропустити</button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Результат ----
  if (phase === 'done') {
    return (
      <div className="g-screen">
        <div className="play-col" style={{ justifyContent: 'center', gap: 18, padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 60, animation: 'starPop .5s ease both' }}>🌟</div>
            <h2 className="g-title" style={{ fontSize: 23, marginTop: 8 }}>Готово!</h2>
            <p style={{ color: 'var(--c-mut)', fontWeight: 700, fontSize: 14, marginTop: 4 }}>
              Ось твій стартовий рівень по темах
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PLACEMENT_STRANDS.map((s) => (
              <div key={s} className="g-card" style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: '14px 16px' }}>
                <span style={{ fontSize: 26 }}>{STRAND_EMOJI[s]}</span>
                <span style={{ flex: 1, fontWeight: 800, fontSize: 15 }}>{s}</span>
                <span style={{ fontWeight: 900, color: 'var(--c-primary)', background: 'var(--c-primary-soft)', padding: '5px 12px', borderRadius: 999, fontSize: 13 }}>
                  {results[s] ? BAND_LABEL[results[s]!] : '—'}
                </span>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', color: 'var(--c-mut)', fontWeight: 700, fontSize: 12.5 }}>
            {saving ? 'Зберігаємо…' : isSynced ? 'Рівень збережено ✓' : 'Гостьовий режим — рівень не збережено'}
          </p>

          <button className="g-btn primary" style={{ maxWidth: 320, margin: '0 auto', width: '100%' }} onClick={goHub}>
            До навчання 🚀
          </button>
        </div>
      </div>
    );
  }

  // ---- Тест ----
  const item = itemFor(strand, BANDS[state.current]);
  const strandProgress = ((strandIdx) / PLACEMENT_STRANDS.length) * 100;

  return (
    <div className="g-screen">
      <div className="play-col">
        <div className="g-topbar">
          <button className="g-iconbtn" aria-label="Пропустити діагностику" onClick={goHub}>✕</button>
          <div className="g-progress">
            <span style={{ width: `${strandProgress}%` }} />
          </div>
          <div className="g-count">{strandIdx + 1}/{PLACEMENT_STRANDS.length}</div>
          <div className="g-diffbadge">{STRAND_EMOJI[strand]} {strand}</div>
        </div>

        <div className="g-scroll" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: 'var(--c-mut)', fontWeight: 800, fontSize: 12.5, marginBottom: 14 }}>
            Запитання {questionNo + 1}
          </div>
          <div className="g-card">
            <div className="g-question">Обери правильну відповідь</div>
            <div className="g-title" style={{ fontSize: 26, margin: '6px 0 4px' }}>{item?.prompt}</div>
            <div className="g-choices" style={{ gridTemplateColumns: (item?.choices.length ?? 0) > 2 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)' }}>
              {item?.choices.map((c, i) => (
                <button key={i} className="g-choice" disabled={busy} onClick={() => answer(i)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
