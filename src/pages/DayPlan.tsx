import { Fragment, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { getOrCreateTodayPlan } from '@/school/planner';
import { fetchOfflineTasks, updateDailyPlanStatus, updatePlanItemStatus } from '@/school/db';
import { getGame, profileClass, SUBJECT_META, SUBJECT_ORDER } from '@/games/registry';
import { classBand } from '@/games/types';
import { ruleOfDay } from '@/rules/rules-math';
import { scheduleForDay, isSchoolDay, weekdayName } from '@/school/schedule-core';
import OfflineTaskCard from '@/components/OfflineTask';
import type { DailyPlan, DailyPlanItem, OfflineTask } from '@/school/types';
import {
  countCompleted,
  findAutoCompletableGameItemIds,
  groupBySubject,
  partitionPlanItems,
  sortPlanItems,
} from './dayplan-core';

/** SD3 — пауза між предметами: у школі між уроками перерва. */
function PauseDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--c-mut)', fontWeight: 700, fontSize: 12.5, padding: '2px 0' }}>
      <span style={{ flex: 1, height: 1, background: 'var(--c-line)' }} />
      <span>☕ Пауза — відпочинь трохи</span>
      <span style={{ flex: 1, height: 1, background: 'var(--c-line)' }} />
    </div>
  );
}

/** Крок-гра/повторення в розкладі дня. */
function ScreenStepCard({ item, onPlay }: { item: DailyPlanItem; onPlay: (gameId: string) => void }) {
  const game = item.ref_id ? getGame(item.ref_id) : undefined;
  const isDone = item.status !== 'pending';
  return (
    <div className="panel">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 54, height: 54, flexShrink: 0, borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, overflow: 'hidden', background: game?.accent ?? 'var(--c-primary-soft)',
          }}
        >
          {game?.image ? <img src={game.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (game?.icon ?? '📘')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h4 className="g-title" style={{ fontSize: 15.5, margin: 0 }}>{game?.title ?? 'Завдання'}</h4>
            {item.kind === 'review' && <span className="g-diffbadge">🔁 Повторення</span>}
            {isDone && (
              <span style={{ background: 'var(--c-green)', color: '#fff', fontWeight: 800, fontSize: 12, borderRadius: 999, padding: '3px 9px' }}>
                Зроблено ✅
              </span>
            )}
          </div>
          {game?.description && (
            <div style={{ color: 'var(--c-mut)', fontWeight: 600, fontSize: 12.5, marginTop: 2 }}>{game.description}</div>
          )}
        </div>
        {game && (
          <button
            className={`g-btn ${isDone ? 'soft' : 'primary'}`}
            style={{ width: 'auto', flexShrink: 0, padding: '10px 18px' }}
            onClick={() => onPlay(game.id)}
          >
            {isDone ? 'Ще раз ▶' : '▶'}
          </button>
        )}
      </div>
    </div>
  );
}

/** Локальна сьогоднішня дата (часовий пояс дитини) — план «на сьогодні», не UTC-доба. */
function todayLocalDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 24,
        fontFamily: 'var(--font-round)',
        fontWeight: 800,
        color: 'var(--c-mut)',
        background: 'var(--c-bg)',
      }}
    >
      {children}
    </div>
  );
}

export default function DayPlan() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeProfile, loadProfiles, progress } = useProfileStore();
  const pid = activeProfile?.id ?? '';
  const date = todayLocalDate();

  useEffect(() => {
    if (!activeProfile) loadProfiles(user?.id);
  }, [activeProfile, user, loadProfiles]);

  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [items, setItems] = useState<DailyPlanItem[]>([]);
  const [offlineTasks, setOfflineTasks] = useState<Map<string, OfflineTask>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const completedNotifiedRef = useRef(false);

  useEffect(() => {
    if (!pid) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.allSettled([getOrCreateTodayPlan(pid, date), fetchOfflineTasks()]).then(([planResult, offlineResult]) => {
      if (cancelled) return;

      if (planResult.status === 'rejected') {
        setError('Не вдалося завантажити план дня.');
        console.warn('[day] plan load failed:', planResult.reason);
      } else {
        setPlan(planResult.value.plan);
        setItems(sortPlanItems(planResult.value.items));
        completedNotifiedRef.current = planResult.value.plan.status === 'completed';
      }

      // Офлайн-довідник — допоміжний; його провал не має блокувати ігри/повторення.
      if (offlineResult.status === 'fulfilled') {
        setOfflineTasks(new Map(offlineResult.value.map((t) => [t.id, t])));
      } else {
        console.warn('[day] offline tasks fetch skipped:', offlineResult.reason);
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [pid, date]);

  // MVP-евристика: якщо дитина зіграла гру й повернулась на «Мій день» — позначаємо
  // крок done, звіряючи прогрес профілю по грі з датою плану (без хаків у GameShell).
  const profileProgress = progress[pid] ?? {};
  useEffect(() => {
    if (items.length === 0) return;
    const autoIds = findAutoCompletableGameItemIds(items, profileProgress, date);
    if (autoIds.length === 0) return;
    setItems((prev) => prev.map((it) => (autoIds.includes(it.id) ? { ...it, status: 'done' } : it)));
    autoIds.forEach((id) => {
      updatePlanItemStatus(id, 'done').catch((e) => console.warn('[day] auto-complete failed:', e));
    });
  }, [items, profileProgress, date]);

  const doneCount = countCompleted(items);
  const total = items.length;
  const allDone = total > 0 && doneCount === total;

  useEffect(() => {
    if (!allDone || !plan || completedNotifiedRef.current) return;
    completedNotifiedRef.current = true;
    confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 }, disableForReducedMotion: true });
    updateDailyPlanStatus(plan.id, 'completed').catch((e) => console.warn('[day] complete plan skipped:', e));
  }, [allDone, plan]);

  const markOfflineDone = (item: DailyPlanItem) => {
    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: 'done' } : it)));
    updatePlanItemStatus(item.id, 'done').catch((e) => {
      console.warn('[day] mark done failed:', e);
      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: 'pending' } : it)));
      setError('Не вдалося зберегти прогрес. Спробуй ще раз.');
    });
  };

  if (!activeProfile) return <Centered>Завантаження…</Centered>;

  const goalPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const weekdayIdx = new Date().getDay();
  const weekday = weekdayName(weekdayIdx);
  const classLevel = profileClass(activeProfile);
  const schedule = scheduleForDay(classLevel, weekdayIdx); // SD2 — предмети дня
  const schoolDay = isSchoolDay(weekdayIdx);
  // «Правило дня» — перший крок розкладу (клієнтський RL1, під рівень дитини).
  const band = classBand(classLevel, 2);
  const dayRule = ruleOfDay(band, date);
  // SD1 — екранні кроки за предметом, офлайн окремо в кінець.
  const { screen: screenItems, offline: offlineItems } = partitionPlanItems(items);
  const subjectGroups = groupBySubject(
    screenItems,
    (it) => (it.ref_id ? getGame(it.ref_id)?.subject ?? null : null),
    SUBJECT_ORDER,
  );

  return (
    <div className="hub">
      <main className="hub-main">
        <div className="hub-wrap" style={{ maxWidth: 720 }}>
          <div className="hub-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <button className="g-iconbtn" aria-label="Назад у Хаб" onClick={() => navigate('/hub')}>
                ←
              </button>
              <div style={{ minWidth: 0 }}>
                <h1>Мій день · {weekday} 🗓️</h1>
                <p className="sub">{total > 0 ? `${doneCount}/${total} виконано` : 'Сьогоднішній розклад'}</p>
              </div>
            </div>
            {total > 0 && (
              <div className="ring" style={{ background: `conic-gradient(var(--c-green) ${goalPct}%, #EEF0F7 ${goalPct}%)` }}>
                <b>
                  {doneCount}/{total}
                </b>
              </div>
            )}
          </div>

          {error && (
            <div className="panel" style={{ background: '#FFF7E6', border: '1px solid #FCEFC7', color: '#8A5A00', marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          {/* SD2 — розклад дня: предмети сьогодні (рамка школи). Вихідний = відпочинок без боргу. */}
          {schoolDay ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {schedule.map((s) => (
                <span
                  key={s}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--c-card)', border: '1px solid var(--c-line)', borderRadius: 999,
                    padding: '7px 13px', fontSize: 13, fontWeight: 800, color: 'var(--c-ink)', boxShadow: 'var(--c-shadow)',
                  }}
                >
                  <span>{SUBJECT_META[s].emoji}</span>
                  {SUBJECT_META[s].title}
                </span>
              ))}
            </div>
          ) : (
            <div className="panel" style={{ marginBottom: 16, textAlign: 'center', background: 'var(--c-primary-soft)' }}>
              <div style={{ fontSize: 32, marginBottom: 4 }}>🌤️</div>
              <p style={{ color: 'var(--c-primary)', fontWeight: 800, margin: 0 }}>Сьогодні вихідний — можна відпочити або погратися вільно.</p>
              <p style={{ color: 'var(--c-mut)', fontWeight: 600, fontSize: 13, margin: '4px 0 0' }}>Пропущений день — це нормально, борг не накопичується.</p>
            </div>
          )}

          {/* Правило дня — перший крок розкладу: спершу урок, потім закріплення (RL1). */}
          {!loading && dayRule && (
            <button
              onClick={() => navigate(`/rule/${dayRule.id}`)}
              style={{
                width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 14,
                background: 'linear-gradient(120deg, #6C5CE7, #A29BFE)', color: '#fff',
                border: 'none', borderRadius: 'var(--c-r)', padding: '16px 18px',
                boxShadow: 'var(--c-shadow)', display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ fontSize: 30, flexShrink: 0 }}>📏</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  Математика · Правило дня
                </div>
                <div style={{ fontSize: 16.5, fontWeight: 900, margin: '2px 0' }}>{dayRule.title}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.9 }}>Спершу вивчи правило — потім закріпи у грі</div>
              </div>
              <div style={{ fontSize: 22, flexShrink: 0 }}>▶</div>
            </button>
          )}

          {loading ? (
            <Centered>Готуємо план…</Centered>
          ) : allDone ? (
            <div className="panel" style={{ textAlign: 'center', background: 'var(--c-primary-soft)' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
              <h3 style={{ color: 'var(--c-primary)' }}>Усе на сьогодні виконано!</h3>
              <p style={{ color: 'var(--c-mut)', fontWeight: 600 }}>Чудова робота. Повертайся завтра за новим планом.</p>
              <button className="g-btn primary" style={{ marginTop: 14 }} onClick={() => navigate('/hub')}>
                До ігор 🏠
              </button>
            </div>
          ) : total === 0 ? (
            <div className="panel" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🌱</div>
              <p style={{ color: 'var(--c-mut)', fontWeight: 600 }}>Поки що немає нових завдань — зіграй кілька ігор у Хабі, і зʼявиться план.</p>
              <button className="g-btn soft" style={{ marginTop: 14 }} onClick={() => navigate('/hub')}>
                До ігор 🏠
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* SD1 — кроки згруповані за предметом: день читається як школа, не список ігор.
                  SD3 — між предметами пауза (нагадування відпочити). */}
              {subjectGroups.map((group, gi) => {
                const meta = group.subject ? SUBJECT_META[group.subject] : null;
                return (
                  <Fragment key={group.subject ?? 'other'}>
                    {gi > 0 && <PauseDivider />}
                    <div className="section-h" style={{ marginTop: gi > 0 ? 0 : 4 }}>
                      <span className="emo">{meta?.emoji ?? '📘'}</span>
                      <h3>{meta?.title ?? 'Інше'}</h3>
                    </div>
                    {group.items.map((item) => (
                      <ScreenStepCard key={item.id} item={item} onPlay={(id) => navigate(`/game/${id}`)} />
                    ))}
                  </Fragment>
                );
              })}

              {offlineItems.length > 0 && (
                <>
                  {subjectGroups.length > 0 && <PauseDivider />}
                  <div className="section-h">
                    <span className="emo">🏠</span>
                    <h3>Без екрана</h3>
                  </div>
                  {offlineItems.map((item) => {
                    const task = item.ref_id ? offlineTasks.get(item.ref_id) : undefined;
                    if (!task) {
                      return (
                        <div key={item.id} className="panel">
                          <p style={{ color: 'var(--c-mut)', fontWeight: 600, margin: 0 }}>Завдання тимчасово недоступне.</p>
                        </div>
                      );
                    }
                    return <OfflineTaskCard key={item.id} task={task} status={item.status} onDone={() => markOfflineDone(item)} />;
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
