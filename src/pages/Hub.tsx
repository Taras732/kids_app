import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { gamesForLevel, profileLevel, SUBJECT_META, SUBJECT_ORDER } from '@/games/registry';
import { DIFFICULTY_LABEL, type Difficulty } from '@/games/types';

const MASCOTS: Record<string, string> = {
  dragon: '/creatures/zodiac_dragon_fire.png',
  tiger: '/creatures/zodiac_tiger_metal.png',
  rabbit: '/creatures/zodiac_rabbit_wood.png',
  horse: '/creatures/zodiac_horse_water.png',
  ox: '/creatures/zodiac_ox_earth.png',
  monkey: '/creatures/zodiac_monkey_fire.png',
};

function StarsPill({ total }: { total: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#FFF7E6',
        border: '1px solid #FCEFC7',
        color: '#B07A00',
        padding: '8px 14px',
        borderRadius: 999,
        fontWeight: 800,
        fontSize: 14,
        whiteSpace: 'nowrap',
      }}
    >
      ⭐ {total}
    </div>
  );
}

function Avatar({ id, size = 46 }: { id: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        background: '#FFF1D6',
        border: '2px solid var(--c-line)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {MASCOTS[id] && <img src={MASCOTS[id]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
    </div>
  );
}

export default function Hub() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeProfile, progress, loadProfiles, createProfile } = useProfileStore();

  useEffect(() => {
    if (!activeProfile) {
      loadProfiles(user?.id).then(async () => {
        if (!useProfileStore.getState().activeProfile) {
          // TODO(auth): тимчасовий байпас входу/онбордингу — авто-створення демо-профілю,
          // щоб / одразу відкривав дашборд. Повернути онбординг, коли візьмемось за auth.
          // '5-6' = рівень L0 → показує всі 6 ігор.
          await createProfile('Демо', '5-6', 'rabbit', user?.id);
        }
      });
    }
  }, [activeProfile, user, loadProfiles, createProfile]);

  if (!activeProfile) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'var(--font-round)',
          fontWeight: 800,
          color: 'var(--c-mut)',
          background: 'var(--c-bg)',
        }}
      >
        Підготовка…
      </div>
    );
  }

  const level = profileLevel(activeProfile);
  const games = gamesForLevel(level);
  const subjects = SUBJECT_ORDER.filter((s) => games.some((g) => g.subject === s));
  const isPreschool = level === 'L0';

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const GameCard = ({ gameId }: { gameId: string }) => {
    const game = games.find((g) => g.id === gameId)!;
    const p = progress[activeProfile.id]?.[game.id];
    const unlocked = (p?.level === 2 || p?.level === 3 ? p.level : 1) as Difficulty;
    const stars = p?.stars ?? 0;
    return (
      <div className="subj-card" onClick={() => navigate(`/game/${game.id}`)}>
        <div
          style={{
            width: 54,
            height: 54,
            flexShrink: 0,
            borderRadius: 16,
            background: game.accent ?? 'var(--c-primary-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
          }}
        >
          {game.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 className="g-title" style={{ fontSize: 15.5, color: 'var(--c-ink)' }}>
            {game.title}
          </h4>
          <p style={{ fontSize: 12.5, color: 'var(--c-mut)', marginTop: 2, fontWeight: 600, lineHeight: 1.3 }}>
            {game.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--c-primary)',
                background: 'var(--c-primary-soft)',
                padding: '3px 9px',
                borderRadius: 999,
              }}
            >
              {DIFFICULTY_LABEL[unlocked]}
            </span>
            <div style={{ display: 'flex', gap: 1 }}>
              {[1, 2, 3].map((s) => (
                <span key={s} style={{ fontSize: 13, filter: s <= stars ? 'none' : 'grayscale(100%) opacity(25%)' }}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
        </div>
        <span style={{ color: 'var(--c-mut)', fontSize: 20, flexShrink: 0 }}>›</span>
      </div>
    );
  };

  return (
    <div className="hub">
      {/* Сайдбар (десктоп) */}
      <aside className="hub-side">
        <div className="hub-logo">
          <div className="mark">🐲</div>
          <b>Школярик</b>
        </div>
        <nav className="hub-nav">
          <button className="active">
            <span className="i">🏠</span> Головна
          </button>
          {subjects.map((s) => (
            <button key={s} onClick={() => scrollTo(`subj-${s}`)}>
              <span className="i">{SUBJECT_META[s].emoji}</span> {SUBJECT_META[s].title}
            </button>
          ))}
        </nav>
        <div className="hub-spacer" />
        <button className="hub-parent" onClick={() => navigate('/parent')}>
          ⚙ Кабінет батьків
        </button>
      </aside>

      {/* Основна колонка */}
      <main className="hub-main">
        <div className="hub-wrap">
          {/* Компактний топ для мобілки */}
          <div className="hub-mobtop" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar id={activeProfile.avatar_id} size={40} />
              <b className="g-title" style={{ fontSize: 16 }}>
                {activeProfile.nickname}
              </b>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StarsPill total={activeProfile.total_stars} />
              <button
                className="g-iconbtn"
                aria-label="Кабінет батьків"
                title="Кабінет батьків"
                onClick={() => navigate('/parent')}
              >
                ⚙
              </button>
            </div>
          </div>

          {/* Топ (десктоп): привітання + зірки/аватар */}
          <div className="hub-top">
            <div>
              <h1 className="g-title" style={{ fontSize: 26, color: 'var(--c-ink)' }}>
                Привіт, {activeProfile.nickname}! 👋
              </h1>
              <p style={{ color: 'var(--c-mut)', fontWeight: 600, marginTop: 3, fontSize: 15 }}>
                {isPreschool ? 'Обери гру й заробляй зірки' : 'Готовий продовжити навчання?'} ⭐
              </p>
            </div>
            <div className="hub-topright">
              <StarsPill total={activeProfile.total_stars} />
              <Avatar id={activeProfile.avatar_id} />
              <button
                onClick={() => navigate('/onboarding')}
                className="g-iconbtn"
                aria-label="Змінити профіль"
                title="Змінити профіль"
              >
                ⇄
              </button>
            </div>
          </div>

          {/* Секції за предметами */}
          {subjects.map((subject) => {
            const meta = SUBJECT_META[subject];
            const list = games.filter((g) => g.subject === subject);
            return (
              <section key={subject} id={`subj-${subject}`} style={{ marginTop: 26, scrollMarginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 2px 14px' }}>
                  <span style={{ fontSize: 19 }}>{meta.emoji}</span>
                  <h3 className="g-title" style={{ fontSize: 18, color: 'var(--c-ink)' }}>
                    {meta.title}
                  </h3>
                </div>
                <div className="hub-grid">
                  {list.map((g) => (
                    <GameCard key={g.id} gameId={g.id} />
                  ))}
                </div>
              </section>
            );
          })}

          <div style={{ height: 24 }} />
        </div>
      </main>
    </div>
  );
}
