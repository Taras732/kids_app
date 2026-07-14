import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { fetchAttempts, fetchDailyPlan, fetchMastery, fetchOfflineTasks, fetchSkills } from '@/school/db';
import { computeStreakDays, groupProgressBySubject, recentActivities } from '@/school/progress-core';
import { getWeeklyReport } from '@/school/report';
import { getOrCreateTodayPlan } from '@/school/planner';
import { completeOfflineTask } from '@/school/offline';
import { describeOfflineTask } from '@/school/offline-core';
import { countCompleted, partitionPlanItems, sortPlanItems } from '@/pages/dayplan-core';
import { getGame } from '@/games/registry';
import type { WeeklyReport as WeeklyReportData } from '@/school/report-core';
import WeeklyReportCard from '@/components/WeeklyReport';
import type { Attempt, DailyPlan, DailyPlanItem, OfflineTask, Skill, SkillMastery } from '@/school/types';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user, deleteAccount, loading: authLoading } = useAuthStore();
  const { profiles, activeProfile, deleteProfile } = useProfileStore();

  const [confirmDeleteType, setConfirmDeleteType] = useState<'none' | 'account' | 'profile'>('none');
  const [targetProfileId, setTargetProfileId] = useState<string | null>(null);

  // ---- Прогрес навчання (E1) ----
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [masteryRows, setMasteryRows] = useState<SkillMastery[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [weekly, setWeekly] = useState<WeeklyReportData | null>(null);
  const [todayPlan, setTodayPlan] = useState<{ plan: DailyPlan; items: DailyPlanItem[] } | null>(null);
  const [offlineById, setOfflineById] = useState<Record<string, OfflineTask>>({});
  const [planBusy, setPlanBusy] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProfileId) return;
    const fallback = activeProfile?.id ?? profiles[0]?.id ?? null;
    if (fallback) setSelectedProfileId(fallback);
  }, [activeProfile, profiles, selectedProfileId]);

  useEffect(() => {
    if (!selectedProfileId) return;
    let cancelled = false;
    setProgressLoading(true);
    setProgressError(null);
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      fetchSkills(),
      fetchMastery(selectedProfileId),
      fetchAttempts(selectedProfileId),
      getWeeklyReport(selectedProfileId, today),
      fetchDailyPlan(selectedProfileId, today),
      fetchOfflineTasks(),
    ])
      .then(([skillsRes, masteryRes, attemptsRes, weeklyRes, planRes, offlineRes]) => {
        if (cancelled) return;
        setSkills(skillsRes);
        setMasteryRows(masteryRes);
        setAttempts(attemptsRes);
        setWeekly(weeklyRes);
        setTodayPlan(planRes);
        setOfflineById(Object.fromEntries(offlineRes.map((t) => [t.id, t])));
      })
      .catch(() => {
        if (!cancelled) setProgressError('Не вдалося завантажити прогрес.');
      })
      .finally(() => {
        if (!cancelled) setProgressLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedProfileId]);

  const subjectsProgress = useMemo(() => groupProgressBySubject(skills, masteryRows), [skills, masteryRows]);
  const recent = useMemo(() => recentActivities(attempts, 5), [attempts]);
  const streak = useMemo(() => computeStreakDays(attempts, new Date().toISOString().slice(0, 10)), [attempts]);
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) ?? null;

  const formatGameLabel = (gameId: string | null) => {
    if (!gameId) return 'Гра';
    return gameId.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
  };

  const formatDay = (iso: string) => new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'short' }).format(new Date(iso));

  const handleDeleteAccount = async () => {
    await deleteAccount();
    navigate('/');
  };

  const handleDeleteProfile = async () => {
    if (targetProfileId) {
      await deleteProfile(targetProfileId, user?.id);
      setConfirmDeleteType('none');
      setTargetProfileId(null);
    }
  };

  // ---- Керування планом дня (E2) ----
  const handleCreatePlan = async () => {
    if (!selectedProfileId) return;
    const today = new Date().toISOString().slice(0, 10);
    setPlanBusy(true);
    try {
      setTodayPlan(await getOrCreateTodayPlan(selectedProfileId, today));
    } catch {
      setProgressError('Не вдалося створити план дня.');
    } finally {
      setPlanBusy(false);
    }
  };

  const handleVerifyOffline = async (itemId: string) => {
    setPlanBusy(true);
    try {
      await completeOfflineTask(itemId);
      setTodayPlan((prev) =>
        prev
          ? { ...prev, items: prev.items.map((it) => (it.id === itemId ? { ...it, status: 'done' } : it)) }
          : prev,
      );
    } catch {
      setProgressError('Не вдалося підтвердити виконання.');
    } finally {
      setPlanBusy(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 30%, #F5F1FF 0%, #E8E2FF 100%)',
      overflowY: 'auto'
    }}>
      <div>
        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/onboarding')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-dark)'
            }}
          >
            ←
          </button>
          <span className="font-display" style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)' }}>
            КАБІНЕТ БАТЬКІВ 📊
          </span>
          <div style={{ width: '24px' }}></div>
        </div>

        {/* Parent Details Card */}
        <div className="card-clay" style={{ marginTop: '24px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
            ОБЛІКОВИЙ ЗАПИС
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-dark)', marginTop: '6px', wordBreak: 'break-all' }}>
            {user ? user.email : 'Гість (Офлайн-режим)'}
          </div>
        </div>

        {/* Progress section (E1) */}
        {profiles.length > 0 && (
          <div style={{ marginTop: '28px' }}>
            <div className="font-display" style={{ fontSize: '11px', color: 'var(--text-dark)', marginBottom: '12px' }}>
              ПРОГРЕС НАВЧАННЯ
            </div>

            {profiles.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '14px' }}>
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProfileId(p.id)}
                    style={{
                      flexShrink: 0,
                      padding: '8px 14px',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '2px solid var(--border-color)',
                      background: p.id === selectedProfileId ? 'var(--primary)' : 'var(--surface-soft)',
                      color: p.id === selectedProfileId ? 'var(--text-light)' : 'var(--text-dark)',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {p.nickname}
                  </button>
                ))}
              </div>
            )}

            {progressLoading && (
              <div className="card-clay" style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                Завантаження прогресу…
              </div>
            )}

            {progressError && (
              <div className="card-clay" style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--secondary-dark)', fontWeight: 700 }}>
                {progressError}
              </div>
            )}

            {!progressLoading && !progressError && selectedProfile && (
              <>
                <div
                  className="card-clay"
                  style={{ padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)' }}>🔥 Серія днів поспіль</div>
                  <div className="font-display" style={{ fontSize: '18px', color: 'var(--primary)' }}>
                    {streak}
                  </div>
                </div>

                {weekly && (
                  <div style={{ marginBottom: '12px' }}>
                    <WeeklyReportCard report={weekly} />
                  </div>
                )}

                {subjectsProgress.length === 0 && (
                  <div className="card-clay" style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Ще немає даних про навички.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {subjectsProgress.map((subj) => (
                    <div key={subj.subject} className="card-clay" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-dark)' }}>{subj.subject}</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>{subj.masteryPct}%</div>
                      </div>
                      <div
                        style={{
                          height: '10px',
                          borderRadius: '6px',
                          background: 'var(--surface-soft)',
                          overflow: 'hidden',
                          marginBottom: '10px',
                        }}
                      >
                        <div style={{ width: `${subj.masteryPct}%`, height: '100%', background: 'var(--success)' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {subj.strands.map((s) => (
                          <div
                            key={s.strand}
                            style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}
                          >
                            <span>{s.strand}</span>
                            <span>
                              {s.mastered}/{s.total} засвоєно · {s.frontier} у роботі
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="font-display" style={{ fontSize: '11px', color: 'var(--text-dark)', margin: '16px 0 10px' }}>
                  ОСТАННІ ЗАНЯТТЯ
                </div>
                {recent.length === 0 ? (
                  <div className="card-clay" style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Ще не було жодної спроби.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {recent.map((a, i) => (
                      <div
                        key={i}
                        className="card-clay"
                        style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)' }}>{formatGameLabel(a.game_id)}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{formatDay(a.created_at)}</div>
                        </div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 800,
                            color: a.correct === a.total ? 'var(--success-dark)' : 'var(--text-dark)',
                          }}
                        >
                          {a.correct}/{a.total}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* План на сьогодні (E2) */}
        {selectedProfile && (
          <div style={{ marginTop: '28px' }}>
            <div className="font-display" style={{ fontSize: '11px', color: 'var(--text-dark)', marginBottom: '12px' }}>
              ПЛАН НА СЬОГОДНІ 🗓️
            </div>

            {!todayPlan ? (
              <div className="card-clay" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '12px' }}>
                  Дитина ще не починала «Мій день» сьогодні.
                </div>
                <button
                  className="btn-clay"
                  onClick={handleCreatePlan}
                  disabled={planBusy}
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  {planBusy ? 'Створення…' : 'Створити план дня'}
                </button>
              </div>
            ) : (
              (() => {
                const items = sortPlanItems(todayPlan.items);
                const { screen, offline } = partitionPlanItems(items);
                return (
                  <>
                    <div
                      className="card-clay"
                      style={{ padding: '14px 16px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dark)' }}>Виконано</div>
                      <div className="font-display" style={{ fontSize: '16px', color: 'var(--primary)' }}>
                        {countCompleted(items)}/{items.length}
                      </div>
                    </div>

                    {items.length === 0 && (
                      <div className="card-clay" style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                        План порожній.
                      </div>
                    )}

                    {screen.map((it) => {
                      const game = it.ref_id ? getGame(it.ref_id) : undefined;
                      const done = it.status !== 'pending';
                      return (
                        <div
                          key={it.id}
                          className="card-clay"
                          style={{ padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                        >
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', minWidth: 0 }}>
                            {it.kind === 'review' ? '🔁 ' : '🎮 '}
                            {game?.title ?? 'Гра'}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 800, flexShrink: 0, color: done ? 'var(--success-dark)' : 'var(--text-muted)' }}>
                            {done ? '✅ зроблено' : 'очікує'}
                          </div>
                        </div>
                      );
                    })}

                    {offline.map((it) => {
                      const task = it.ref_id ? offlineById[it.ref_id] : undefined;
                      const view = task ? describeOfflineTask(task) : null;
                      const done = it.status !== 'pending';
                      return (
                        <div
                          key={it.id}
                          className="card-clay"
                          style={{ padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>
                              {view?.icon ?? '📝'} {task?.title ?? 'Офлайн-завдання'}
                            </div>
                            {view?.summary && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                                {view.summary}
                              </div>
                            )}
                          </div>
                          {done ? (
                            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--success-dark)', flexShrink: 0 }}>✅ зроблено</div>
                          ) : (
                            <button
                              className="btn-clay"
                              onClick={() => handleVerifyOffline(it.id)}
                              disabled={planBusy}
                              style={{ padding: '6px 12px', fontSize: '11px', flexShrink: 0 }}
                            >
                              Підтвердити
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </>
                );
              })()
            )}
          </div>
        )}

        {/* Child Profiles Manager */}
        <div style={{ marginTop: '28px' }}>
          <div className="font-display" style={{ fontSize: '11px', color: 'var(--text-dark)', marginBottom: '12px' }}>
            УЧНІ ({profiles.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {profiles.map(p => (
              <div 
                key={p.id}
                className="card-clay"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-dark)' }}>
                    {p.nickname}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '600' }}>
                    3-й Клас · ⭐ {p.total_stars} зірочок
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setTargetProfileId(p.id);
                    setConfirmDeleteType('profile');
                  }}
                  style={{
                    background: 'var(--secondary-light)',
                    border: '2px solid var(--border-color)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    boxShadow: '0 2px 0 var(--border-color)'
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}

            {profiles.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
                padding: '24px',
                border: '3px dashed var(--text-muted)',
                borderRadius: 'var(--border-radius-md)'
              }}>
                Немає зареєстрованих учнів.
              </div>
            )}
          </div>
        </div>

        {/* GDPR settings */}
        {user && (
          <div style={{
            marginTop: '32px',
            background: 'rgba(255, 107, 107, 0.08)',
            border: '3px solid var(--secondary)',
            borderRadius: 'var(--border-radius-md)',
            padding: '18px',
            boxShadow: '0 4px 0 var(--border-color)'
          }}>
            <h4 className="font-display" style={{
              fontSize: '12px',
              color: 'var(--secondary-dark)'
            }}>
              Конфіденційність (GDPR)
            </h4>
            <p style={{
              fontSize: '11px',
              color: 'var(--text-dark)',
              lineHeight: '1.5',
              marginTop: '8px',
              fontWeight: '600'
            }}>
              Ви маєте право безповоротно видалити свій обліковий запис. При видаленні акаунта всі профілі дітей та результати навчання будуть автоматично видалені з наших серверів.
            </p>

            <button 
              onClick={() => setConfirmDeleteType('account')}
              className="btn-clay secondary"
              style={{
                marginTop: '14px',
                padding: '8px 16px',
                fontSize: '11px',
                borderRadius: 'var(--border-radius-sm)'
              }}
            >
              Видалити мій акаунт
            </button>
          </div>
        )}
      </div>

      {/* Back button */}
      <button 
        onClick={() => navigate('/onboarding')}
        className="btn-clay"
        style={{ width: '100%', marginTop: '32px' }}
      >
        Повернутися до гравців
      </button>

      {/* Confirmation Dialogs */}
      {confirmDeleteType !== 'none' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(31, 27, 58, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
          padding: '24px'
        }}>
          <div className="card-clay" style={{
            background: '#fff',
            padding: '24px 20px',
            width: '100%',
            maxWidth: '320px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '36px' }}>⚠️</span>
            
            <h3 className="font-display" style={{
              fontSize: '15px',
              color: 'var(--text-dark)',
              marginTop: '8px'
            }}>
              {confirmDeleteType === 'account' ? 'ВИДАЛИТИ АКАУНТ?' : 'ВИДАЛИТИ ПРОФІЛЬ?'}
            </h3>
            
            <p style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '8px',
              lineHeight: '1.5',
              fontWeight: '600'
            }}>
              {confirmDeleteType === 'account' 
                ? 'Ця дія є остаточною. Усі накопичені зірочки та профілі ваших дітей будуть безповоротно видалені!'
                : 'Прогрес та ігрова статистика учня будуть назавжди стерті.'
              }
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  setConfirmDeleteType('none');
                  setTargetProfileId(null);
                }}
                className="btn-clay"
                style={{
                  flex: 1,
                  background: 'var(--surface-soft)',
                  color: 'var(--text-dark)',
                  padding: '10px'
                }}
              >
                Ні
              </button>
              
              <button 
                onClick={confirmDeleteType === 'account' ? handleDeleteAccount : handleDeleteProfile}
                disabled={authLoading}
                className="btn-clay secondary"
                style={{
                  flex: 1,
                  padding: '10px'
                }}
              >
                {authLoading ? 'Видалення...' : 'Так, видалити'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
