import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { profileClass } from '@/games/registry';
import { classBand, GRADE_BANDS, type GradeBand } from '@/games/types';
import { getRuleLesson } from '@/rules/registry';
import RuleLesson from '@/rules/RuleLesson';

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', padding: 24, fontFamily: 'var(--font-round)', fontWeight: 800,
        color: 'var(--c-mut)', background: 'var(--c-bg)',
      }}
    >
      {children}
    </div>
  );
}

/** Детермінований seed з рядка — стабільний між ре-рендерами (Q2). */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Band дитини під урок: беремо band її класу, підтягнутий у діапазон уроку. */
function bandForLesson(childBand: GradeBand, bands: GradeBand[]): GradeBand {
  if (bands.includes(childBand)) return childBand;
  const ci = GRADE_BANDS.indexOf(childBand);
  const sorted = [...bands].sort((a, b) => GRADE_BANDS.indexOf(a) - GRADE_BANDS.indexOf(b));
  // нижче діапазону → найлегший урок; вище → найважчий
  return ci < GRADE_BANDS.indexOf(sorted[0]) ? sorted[0] : sorted[sorted.length - 1];
}

export default function RuleLessonPlayer() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { activeProfile, loadProfiles } = useProfileStore();
  const [seedNonce, setSeedNonce] = useState(0);

  useEffect(() => {
    if (!activeProfile) loadProfiles(user?.id);
  }, [activeProfile, user, loadProfiles]);

  const def = id ? getRuleLesson(id) : undefined;

  if (!def) {
    return (
      <Centered>
        <div>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🤔</div>
          Такого уроку немає.
          <br />
          <button className="g-btn soft" style={{ marginTop: 16 }} onClick={() => navigate('/hub')}>До ігор</button>
        </div>
      </Centered>
    );
  }

  const childBand = activeProfile ? classBand(profileClass(activeProfile), 2) : 'L3';
  const band = bandForLesson(childBand, def.bands);
  const seed = hashString(`${def.id}:${activeProfile?.id ?? 'demo'}`) + seedNonce;

  return (
    <RuleLesson
      // key включає профіль: коли activeProfile довантажиться (band/seed зміняться),
      // урок перемонтується й машина стартує з правильними числами, а не «під ним».
      key={`${def.id}-${activeProfile?.id ?? 'demo'}-${seedNonce}`}
      def={def}
      band={band}
      seed={seed}
      onExit={() => navigate('/hub')}
      onDone={() => navigate('/hub')}
      onReplay={() => setSeedNonce((n) => n + 1)}
    />
  );
}
