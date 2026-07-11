import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { getGame, profileLevel } from '@/games/registry';
import GameShell from '@/games/GameShell';

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

export default function GamePlayer() {
  const navigate = useNavigate();
  const { id: gameId } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { activeProfile, loadProfiles } = useProfileStore();

  useEffect(() => {
    if (!activeProfile) loadProfiles(user?.id);
  }, [activeProfile, user, loadProfiles]);

  const game = gameId ? getGame(gameId) : undefined;

  if (!activeProfile) return <Centered>Завантаження…</Centered>;
  if (!game) {
    return (
      <Centered>
        <div>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🤔</div>
          Такої гри немає.
          <br />
          <button className="g-btn soft" style={{ marginTop: 16 }} onClick={() => navigate('/hub')}>
            До ігор
          </button>
        </div>
      </Centered>
    );
  }

  return (
    <GameShell
      key={game.id}
      game={game}
      level={profileLevel(activeProfile)}
      profileId={activeProfile.id}
      onExit={() => navigate('/hub')}
    />
  );
}
