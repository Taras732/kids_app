import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useProfileStore, type ChildProfile } from '@/stores/useProfileStore';
import { profileClass } from '@/games/registry';
import { CLASS_META, CLASS_LEVELS, type ClassLevel } from '@/games/types';
import ParentalGate from '@/components/ParentalGate';

const MASCOTS = [
  { id: 'dragon', img: '/creatures/zodiac_dragon_fire.png', label: 'Дракончик', color: '#FFE3D6' },
  { id: 'tiger', img: '/creatures/zodiac_tiger_metal.png', label: 'Тигреня', color: '#E3EEFF' },
  { id: 'rabbit', img: '/creatures/zodiac_rabbit_wood.png', label: 'Зайчик', color: '#E6F6E0' },
  { id: 'horse', img: '/creatures/zodiac_horse_water.png', label: 'Конячка', color: '#E0F2FF' },
  { id: 'ox', img: '/creatures/zodiac_ox_earth.png', label: 'Бичок', color: '#F3EAD8' },
  { id: 'monkey', img: '/creatures/zodiac_monkey_fire.png', label: 'Мавпочка', color: '#FFEFD6' }
];

// Усі 5 класів (G5). Emoji/підпис — локальні, бо CLASS_META не містить UI-іконок.
const CLASS_EMOJI: Record<ClassLevel, string> = {
  preschool: '🧸',
  grade1: '📘',
  grade2: '📗',
  grade3: '📙',
  grade4: '📕'
};

const CLASS_SUB: Record<ClassLevel, string> = {
  preschool: 'Лічба, форми, перші числа',
  grade1: 'Читання, числа до 20',
  grade2: 'Математика, українська',
  grade3: 'Математика (НУШ)',
  grade4: 'Математика, логіка (НУШ)'
};

// class_level → age_group (БД-поле для віку/привітання; age_group max '7-8', тому 2-4 клас клампляться)
const CLASS_AGE_GROUP: Record<ClassLevel, ChildProfile['age_group']> = {
  preschool: '5-6',
  grade1: '6-7',
  grade2: '7-8',
  grade3: '7-8',
  grade4: '7-8'
};

// Підпис рівня для картки профілю: явний class_level, або fallback з age_group (profileClass)
const levelLabel = (p: Pick<ChildProfile, 'age_group' | 'class_level'>) => {
  const cl = profileClass(p);
  return `${CLASS_META[cl].short} ${CLASS_EMOJI[cl]}`;
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const { profiles, loading, loadProfiles, createProfile, selectProfile } = useProfileStore();

  const [isCreating, setIsCreating] = useState(false);
  const [nickname, setNickname] = useState('');
  const [selectedMascot, setSelectedMascot] = useState('dragon');
  const [selectedLevel, setSelectedLevel] = useState<ClassLevel>('grade1');
  
  // Parental Gate State
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [gateAction, setGateAction] = useState<'parent_panel' | 'logout' | null>(null);

  useEffect(() => {
    loadProfiles(user?.id);
  }, [user, loadProfiles]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    await createProfile(
      nickname.trim(),
      CLASS_AGE_GROUP[selectedLevel],
      selectedMascot,
      user?.id,
      selectedLevel
    );

    setIsCreating(false);
    setNickname('');
    // Новий профіль → діагностика стартового рівня (A5), далі веде в /hub.
    navigate('/placement');
  };

  const handleSelect = (id: string) => {
    selectProfile(id);
    // Головна після входу — розклад «Мій день», а не список ігор (концепція школи).
    navigate('/day');
  };

  const handleParentAction = (action: 'parent_panel' | 'logout') => {
    setGateAction(action);
    setIsGateOpen(true);
  };

  const handleGateSuccess = () => {
    if (gateAction === 'parent_panel') {
      navigate('/parent');
    } else if (gateAction === 'logout') {
      signOut();
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '20px',
        fontFamily: 'var(--font-display)',
        fontWeight: 'bold',
        color: 'var(--primary-dark)'
      }}>
        Завантаження... 🐼
      </div>
    );
  }

  const showList = profiles.length > 0 && !isCreating;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '24px',
      background: 'linear-gradient(180deg, #DCE8FF 0%, #ECE6FF 55%, #FCEAF2 100%)',
      overflowY: 'auto'
    }}>
      {/* 1. LIST OF PROFILES */}
      {showList && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 className="font-display" style={{
              fontSize: '20px',
              color: 'var(--text-dark)',
              textAlign: 'center',
              marginTop: '16px'
            }}>
              Хто навчається? 🎓
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '6px', fontWeight: '600' }}>
              Оберіть профіль учня, щоб продовжити заняття!
            </p>

            {/* Profile Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginTop: '32px'
            }}>
              {profiles.map(p => {
                const mascot = MASCOTS.find(m => m.id === p.avatar_id);
                return (
                  <div 
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className="card-clay"
                    style={{
                      padding: '20px 16px',
                      textAlign: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '78px',
                      height: '78px',
                      borderRadius: '50%',
                      background: mascot?.color || 'var(--surface-soft)',
                      border: '3px solid var(--border-color)',
                      margin: '0 auto',
                      overflow: 'hidden',
                      boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.1)'
                    }}>
                      {mascot?.img
                        ? <img src={mascot.img} alt={mascot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ fontSize: '40px', lineHeight: '78px' }}>🐣</div>}
                    </div>
                    <div className="font-display" style={{ fontSize: '14px', color: 'var(--text-dark)', marginTop: '12px' }}>
                      {p.nickname}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--primary-dark)', fontWeight: '800', marginTop: '4px' }}>
                      {levelLabel(p)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 'bold' }}>
                      ⭐ {p.total_stars} зірочок
                    </div>
                  </div>
                );
              })}

              {/* Create Profile Card */}
              <div 
                onClick={() => setIsCreating(true)}
                style={{
                  background: 'var(--surface-soft)',
                  border: '3px dashed var(--text-muted)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: 'inset 0 4px 0 rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ fontSize: '36px', color: 'var(--text-muted)' }}>➕</div>
                <div className="font-display" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  НОВИЙ УЧЕНЬ
                </div>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
            <button 
              type="button"
              onClick={() => handleParentAction('logout')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--secondary-dark)',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'underline'
              }}
            >
              🚪 Вийти з кабінету
            </button>
            
            <button 
              type="button"
              onClick={() => handleParentAction('parent_panel')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-dark)',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'underline'
              }}
            >
              Батьківська панель ⚙️
            </button>
          </div>
        </div>
      )}

      {/* 2. CREATE NEW PROFILE */}
      {!showList && (
        <form onSubmit={handleCreate} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {profiles.length > 0 && (
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginRight: '12px' }}
                >
                  ←
                </button>
              )}
              <h2 className="font-display" style={{ fontSize: '18px', color: 'var(--text-dark)' }}>
                Створити профіль учня
              </h2>
            </div>

            {/* Mascot Selection */}
            <div style={{ marginTop: '24px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>
                ОБЕРИ ДРУГА-ПОМІЧНИКА
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' }}>
                {MASCOTS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMascot(m.id)}
                    style={{
                      padding: '10px 6px',
                      background: m.color,
                      border: `3px solid ${selectedMascot === m.id ? 'var(--primary)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--border-radius-md)',
                      cursor: 'pointer',
                      boxShadow: selectedMascot === m.id
                        ? '0 6px 0 var(--border-color), 0 0 12px rgba(108, 92, 231, 0.35)'
                        : '0 4px 0 var(--border-color)',
                      transform: selectedMascot === m.id ? 'translateY(-2px)' : 'none',
                      transition: 'transform 0.1s, border-color 0.1s'
                    }}
                  >
                    <img src={m.img} alt={m.label} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain', borderRadius: '12px' }} />
                    <div style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-dark)', marginTop: '2px' }}>
                      {m.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nickname input */}
            <div style={{ marginTop: '28px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>
                ІМ'Я УЧНЯ (НІКНЕЙМ)
              </label>
              <input 
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Наприклад: Данилко"
                className="input-clay"
                required
                maxLength={12}
                style={{ marginTop: '8px' }}
              />
            </div>

            {/* Level selection */}
            <div style={{ marginTop: '24px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-dark)', fontFamily: 'var(--font-display)' }}>
                НАВЧАЛЬНИЙ КЛАС
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '8px' }}>
                {CLASS_LEVELS.map((cl, i) => {
                  const meta = CLASS_META[cl];
                  const isLastOdd = i === CLASS_LEVELS.length - 1 && CLASS_LEVELS.length % 2 === 1;
                  return (
                    <button
                      key={cl}
                      type="button"
                      onClick={() => setSelectedLevel(cl)}
                      style={{
                        gridColumn: isLastOdd ? 'span 2' : undefined,
                        textAlign: 'left',
                        background: 'var(--surface-soft)',
                        border: `3px solid ${selectedLevel === cl ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--border-radius-sm)',
                        padding: '14px',
                        cursor: 'pointer',
                        boxShadow: selectedLevel === cl
                          ? '0 5px 0 var(--border-color), 0 0 10px rgba(108, 92, 231, 0.3)'
                          : '0 4px 0 var(--border-color)',
                        transform: selectedLevel === cl ? 'translateY(-2px)' : 'none',
                        transition: 'transform 0.1s, border-color 0.1s'
                      }}
                    >
                      <span style={{ fontSize: '26px' }}>{CLASS_EMOJI[cl]}</span>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-dark)', marginTop: '4px' }}>{meta.title}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '600' }}>{CLASS_SUB[cl]}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            className="btn-clay success"
            style={{ width: '100%', marginTop: '32px', padding: '16px' }}
          >
            Створити та грати! 🚀
          </button>
        </form>
      )}

      {/* Parental Gate Modal */}
      <ParentalGate 
        isOpen={isGateOpen}
        onClose={() => {
          setIsGateOpen(false);
          setGateAction(null);
        }}
        onSuccess={handleGateSuccess}
      />
    </div>
  );
}
