import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { gamesForLevel, getGame, profileLevel, SUBJECT_META, SUBJECT_ORDER } from '@/games/registry';
import { DIFFICULTY_LABEL, type Difficulty, type GameDefinition } from '@/games/types';
import { getActivitySummary } from '@/utils/activity';

const MASCOTS: Record<string, string> = {
  dragon: '/creatures/zodiac_dragon_fire.png',
  tiger: '/creatures/zodiac_tiger_metal.png',
  rabbit: '/creatures/zodiac_rabbit_wood.png',
  horse: '/creatures/zodiac_horse_water.png',
  ox: '/creatures/zodiac_ox_earth.png',
  monkey: '/creatures/zodiac_monkey_fire.png',
};
const HERO_IMG = '/creatures/hero_dragon.png';
const DAILY_GOAL = 5;
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

export default function Hub() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthStore();
  const { activeProfile, progress, loadProfiles, createProfile } = useProfileStore();
  const [view, setView] = useState<'home' | 'awards'>('home');

  useEffect(() => {
    if (authLoading) return;
    if (!activeProfile) {
      loadProfiles(user?.id).then(async () => {
        if (!useProfileStore.getState().activeProfile) {
          await createProfile('Демо', '5-6', 'rabbit', user?.id);
        }
      });
    }
  }, [authLoading, activeProfile, user, loadProfiles, createProfile]);

  const pid = activeProfile?.id ?? '';
  const activity = useMemo(() => (pid ? getActivitySummary(pid) : null), [pid, view]);

  if (!activeProfile || !activity) {
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'var(--font-round)', fontWeight: 800, color: 'var(--c-mut)', background: 'var(--c-bg)' }}>
        Підготовка…
      </div>
    );
  }

  const level = profileLevel(activeProfile);
  const games = gamesForLevel(level);
  const subjects = SUBJECT_ORDER.filter((s) => games.some((g) => g.subject === s));
  const prog = progress[activeProfile.id] ?? {};
  const avatarImg = MASCOTS[activeProfile.avatar_id];

  // остання/наступна гра для hero
  const lastGame: GameDefinition | undefined = (() => {
    let bestId: string | null = null;
    let bestAt = '';
    for (const [gid, p] of Object.entries(prog)) {
      if ((p.updated_at ?? '') > bestAt) { bestAt = p.updated_at ?? ''; bestId = gid; }
    }
    return (bestId && getGame(bestId)) || games[0];
  })();

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const goHome = () => { setView('home'); };

  const StarsPill = () => (<div className="pill gold">⭐ {activeProfile.total_stars}</div>);
  const FirePill = () => (<div className="pill fire">🔥 {activity.streak}</div>);
  const Avatar = ({ size = 46 }: { size?: number }) => (
    <div className="hub-avatar" style={{ width: size, height: size }}>
      {avatarImg && <img src={avatarImg} alt="" />}
    </div>
  );

  // ---- нагороди ----
  const distinctPlayed = Object.keys(prog).length;
  const perfectGames = Object.values(prog).filter((p) => p.stars >= 3).length;
  const badges = [
    { emo: '⭐', label: 'Перша зірка', ok: activeProfile.total_stars >= 1 },
    { emo: '🌟', label: '10 зірок', ok: activeProfile.total_stars >= 10 },
    { emo: '🏅', label: '50 зірок', ok: activeProfile.total_stars >= 50 },
    { emo: '🔥', label: 'Серія 3 дні', ok: activity.streak >= 3 },
    { emo: '🎯', label: '5 за день', ok: activity.todayCount >= DAILY_GOAL },
    { emo: '🧠', label: '5 ігор', ok: distinctPlayed >= 5 },
    { emo: '🏆', label: 'Три зірки', ok: perfectGames >= 1 },
    { emo: '🚀', label: '10 ігор', ok: distinctPlayed >= 10 },
  ];

  const GameCard = ({ game }: { game: GameDefinition }) => {
    const p = prog[game.id];
    const unlocked = (p?.level === 2 || p?.level === 3 ? p.level : 1) as Difficulty;
    const stars = p?.stars ?? 0;
    const pct = Math.round((stars / 3) * 100);
    return (
      <div className="subj-card" onClick={() => navigate(`/game/${game.id}`)}>
        <div className="row">
          <div className="ico" style={{ background: game.accent ?? 'var(--c-primary-soft)' }}>
            {game.image ? <img src={game.image} alt="" /> : game.icon}
          </div>
          <div style={{ minWidth: 0 }}>
            <h4>{game.title}</h4>
            <div className="desc">{game.description}</div>
          </div>
        </div>
        <div className="bar"><span style={{ width: `${Math.max(6, pct)}%`, background: 'var(--c-primary)' }} /></div>
        <div className="prog">
          <span>{DIFFICULTY_LABEL[unlocked]}</span>
          <span>{stars}/3 ⭐</span>
        </div>
      </div>
    );
  };

  const goalPct = Math.min(1, activity.todayCount / DAILY_GOAL) * 100;

  return (
    <div className="hub">
      {/* Сайдбар */}
      <aside className="hub-side">
        <div className="hub-logo"><div className="mark">🐲</div><b>Школярик</b></div>
        <nav className="hub-nav">
          <button className={view === 'home' ? 'active' : ''} onClick={goHome}><span className="i">🏠</span> Головна</button>
          {view === 'home' && subjects.map((s) => (
            <button key={s} onClick={() => scrollTo(`subj-${s}`)}><span className="i">{SUBJECT_META[s].emoji}</span> {SUBJECT_META[s].title}</button>
          ))}
          <button className={view === 'awards' ? 'active' : ''} onClick={() => setView('awards')}><span className="i">🏆</span> Нагороди</button>
        </nav>
        <div className="hub-spacer" />
        <button className="hub-parent" onClick={() => navigate('/parent')}>⚙ Кабінет батьків</button>
      </aside>

      {/* Основна колонка */}
      <main className="hub-main">
        <div className="hub-wrap">
          {/* мобільний топ */}
          <div className="hub-mobtop" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar size={40} />
              <b className="g-title" style={{ fontSize: 16 }}>{activeProfile.nickname}</b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FirePill /><StarsPill />
            </div>
          </div>

          {/* привітання */}
          <div className="hub-top">
            <div>
              <h1>Привіт, {activeProfile.nickname}! 👋</h1>
              <p className="sub">{view === 'awards' ? 'Твої нагороди' : 'Готовий продовжити навчання сьогодні?'}</p>
            </div>
            <div className="hub-topright">
              <FirePill /><StarsPill /><Avatar />
              <button onClick={() => navigate('/onboarding')} className="g-iconbtn" title="Змінити профіль" aria-label="Змінити профіль">⇄</button>
            </div>
          </div>

          {view === 'awards' ? (
            <section>
              <div className="panel" style={{ maxWidth: 640 }}>
                <h3>Нагороди</h3>
                <div className="badges">
                  {badges.map((b) => (
                    <div key={b.label} className={`badge${b.ok ? '' : ' lock'}`}>
                      <span>{b.ok ? b.emo : '🔒'}</span>
                      <small>{b.label}</small>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <>
              {/* HERO */}
              {lastGame && (
                <div className="hero">
                  <div className="glow" />
                  <div className="txt">
                    <div className="tag">Продовжити навчання</div>
                    <h2>{lastGame.title}</h2>
                    <p>{lastGame.description}</p>
                    <button className="btn" onClick={() => navigate(`/game/${lastGame.id}`)}>▶ Продовжити</button>
                  </div>
                  <div className="heroimg"><img src={avatarImg || HERO_IMG} alt="" /></div>
                </div>
              )}

              <div className="hub-cols">
                {/* ліва: предмети */}
                <div>
                  {subjects.map((subject) => {
                    const meta = SUBJECT_META[subject];
                    const list = games.filter((g) => g.subject === subject);
                    return (
                      <section key={subject} id={`subj-${subject}`} style={{ scrollMarginTop: 12 }}>
                        <div className="section-h"><span className="emo">{meta.emoji}</span><h3>{meta.title}</h3></div>
                        <div className="hub-grid">{list.map((g) => <GameCard key={g.id} game={g} />)}</div>
                      </section>
                    );
                  })}
                </div>

                {/* права колонка */}
                <div className="rcol">
                  <div className="panel">
                    <h3>Ціль на сьогодні</h3>
                    <div className="goal">
                      <div className="ring" style={{ background: `conic-gradient(var(--c-green) ${goalPct}%, #EEF0F7 ${goalPct}%)` }}>
                        <b>{activity.todayCount}/{DAILY_GOAL}</b>
                      </div>
                      <div className="gt">
                        <b>{activity.todayCount >= DAILY_GOAL ? 'Ціль виконана! 🎉' : 'Уперед!'}</b>
                        <p>{activity.todayCount >= DAILY_GOAL ? 'Чудова робота сьогодні' : `Ще ${DAILY_GOAL - activity.todayCount} завдань — і денна зірка`}</p>
                      </div>
                    </div>
                  </div>

                  <div className="panel">
                    <h3>Цей тиждень</h3>
                    <div className="week">
                      {WEEKDAYS.map((wd, i) => (
                        <div key={wd} className={`day${activity.week[i] ? ' on' : ''}${i === activity.todayIndex ? ' today' : ''}`}>
                          <div className="d">{activity.week[i] ? '✓' : i + 1}</div>
                          <small>{wd}</small>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="panel">
                    <h3>Нагороди</h3>
                    <div className="badges">
                      {badges.slice(0, 4).map((b) => (
                        <div key={b.label} className={`badge${b.ok ? '' : ' lock'}`}>
                          <span>{b.ok ? b.emo : '🔒'}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setView('awards')} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--c-primary)', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-round)' }}>
                      Усі нагороди →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
