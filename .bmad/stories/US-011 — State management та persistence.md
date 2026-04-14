---
id: US-011
epic: EP-04
title: State management та persistence
status: ready
priority: Must
estimate: 2h
phase: 1
project: Школярик
---

# US-011 — State management та persistence

## User Story
**Як** розробник,
**я хочу** налаштувати Zustand stores з MMKV persistence,
**щоб** стан додатку зберігався між сесіями і був доступний офлайн.

## Acceptance Criteria

### AC-1: MMKV persistence middleware
- **Given** `src/stores/middleware/mmkvPersist.ts`
- **When** створюю store з persist
- **Then** middleware працює:

```typescript
import { StateStorage } from 'zustand/middleware';
import { mmkvStorage } from '../../utils/mmkv';

// Zustand-compatible storage adapter
export const mmkvStateStorage: StateStorage = {
  getItem: (name: string) => {
    const value = mmkvStorage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    mmkvStorage.set(name, value);
  },
  removeItem: (name: string) => {
    mmkvStorage.delete(name);
  },
};
```

- **And** persist працює синхронно (MMKV — синхронний, на відміну від AsyncStorage)
- **And** кожен store має свій MMKV ключ для атомарності:
  - `auth-store`
  - `child-profiles-store`
  - `settings-store`
  - `progress-store`
  - `analytics-store`
- **And** при запуску додатку — state відновлюється автоматично з MMKV
- **And** при зміні state — автоматично записується в MMKV (debounce не потрібен, MMKV швидкий)

### AC-2: Auth store
- **Given** `src/stores/authStore.ts`
- **When** використовую store
- **Then** interface:

```typescript
interface AuthState {
  // State
  user: User | null;           // Supabase user object
  session: Session | null;     // Supabase session (access_token, refresh_token)
  isAuthenticated: boolean;    // computed: session !== null
  isLoading: boolean;          // true під час auth операцій

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  initialize: () => Promise<void>;  // перевірити існуючу session при запуску
}
```

- **And** `signUp` → `supabase.auth.signUp()`, повертає error message (ukr) або null
- **And** `signIn` → `supabase.auth.signInWithPassword()`, зберігає session
- **And** `signOut` → `supabase.auth.signOut()`, очищує user + session
- **And** `resetPassword` → `supabase.auth.resetPasswordForEmail()`
- **And** `initialize` → `supabase.auth.getSession()`, викликається при запуску додатку
- **And** session persist в MMKV (через Supabase adapter, НЕ через Zustand persist — бо Supabase має свій session storage)
- **And** error mapping: Supabase errors → українські повідомлення (централізовано)

### AC-3: Child profiles store
- **Given** `src/stores/childProfilesStore.ts`
- **When** використовую store
- **Then** interface:

```typescript
interface ChildProfile {
  id: string;                  // UUID
  name: string;                // "Максимко"
  ageGroup: AgeGroup;          // 'malyuki' | 'doskilnyata' | 'pershoklas' | 'drugoklas'
  avatar: string | null;       // avatar ID ('cat', 'dog', ...) або null
  createdAt: string;           // ISO date
}

interface ChildProfilesState {
  // State
  profiles: ChildProfile[];        // масив профілів (max 4)
  activeProfileId: string | null;  // ID активного профілю

  // Computed (getters)
  activeProfile: ChildProfile | null;  // profiles.find(p => p.id === activeProfileId)
  canAddProfile: boolean;              // profiles.length < 4

  // Actions
  createProfile: (name: string, ageGroup: AgeGroup) => string;  // returns new profile ID
  updateProfile: (id: string, updates: Partial<ChildProfile>) => void;
  deleteProfile: (id: string) => void;
  switchProfile: (id: string) => void;  // set activeProfileId
}
```

- **And** `createProfile`:
  - Генерує UUID
  - Додає профіль в масив
  - Встановлює як active
  - Якщо вже 4 профілі → throw error / return null
- **And** `deleteProfile`:
  - Видаляє з масиву
  - Якщо видалено active → switchProfile на перший залишений (або null)
  - Видаляє пов'язаний прогрес з progressStore
- **And** `switchProfile`:
  - Встановлює activeProfileId
  - UI перемальовується (прогрес, ім'я, аватар)
- **And** persist в MMKV: key `child-profiles-store`
- **And** максимум 4 профілі (валідація в createProfile)

### AC-4: Settings store
- **Given** `src/stores/settingsStore.ts`
- **When** використовую store
- **Then** interface:

```typescript
interface SettingsState {
  // State
  language: 'uk' | 'en';          // мова інтерфейсу (default: 'uk')
  parentPin: string | null;        // hashed PIN (SHA-256) або null
  pinLockUntil: string | null;     // ISO date — lock до цього часу (або null)
  pinFailCount: number;            // кількість невірних спроб (reset при success)
  timeLimitMinutes: number;        // ліміт часу гри (default: 30, 0 = без ліміту)
  soundEnabled: boolean;           // звукові ефекти (default: true)
  musicEnabled: boolean;           // фонова музика (default: true)
  voiceEnabled: boolean;           // озвучка (default: true)
  onboardingCompleted: boolean;    // пройдений онбординг (default: false)

  // Actions
  setLanguage: (lang: 'uk' | 'en') => void;
  setParentPin: (hashedPin: string) => void;
  verifyPin: (inputPin: string) => boolean;  // hash + compare
  registerPinFail: () => void;     // pinFailCount++, lock якщо >= 3
  resetPinFail: () => void;        // reset count при success
  isPinLocked: () => boolean;      // перевірити lock timestamp
  setTimeLimit: (minutes: number) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleVoice: () => void;
  setOnboardingCompleted: () => void;
}
```

- **And** `verifyPin`: hash input → порівняти з збереженим hash
- **And** `registerPinFail`: increment count, при count >= 3 → set pinLockUntil = now + 5min
- **And** `isPinLocked`: перевіряє `pinLockUntil > now`
- **And** persist в MMKV: key `settings-store`
- **And** PIN hash: `SHA-256(pin + salt)` де salt = device-specific або constant

### AC-5: Progress store
- **Given** `src/stores/progressStore.ts`
- **When** використовую store
- **Then** interface:

```typescript
interface GameProgress {
  bestScore: number;          // 0-3 зірки
  difficulty: 'easy' | 'medium' | 'hard';
  timesPlayed: number;
  lastPlayed: string;         // ISO date
  bestTime: number | null;    // seconds, якщо applicable
}

interface IslandProgress {
  gamesCompleted: number;     // кількість ігор з bestScore > 0
  totalStars: number;         // сума зірок всіх ігор
  percentage: number;         // computed: gamesCompleted / totalGames * 100
}

interface ChildProgress {
  xp: number;
  level: number;
  badges: string[];           // масив badge IDs
  gameProgress: Record<string, GameProgress>;     // key: gameId
  islandProgress: Record<string, IslandProgress>; // key: islandId
}

interface ProgressState {
  // State — indexed by childProfileId
  progress: Record<string, ChildProgress>;

  // Getters
  getActiveProgress: () => ChildProgress | null;  // progress[activeProfileId]
  getLevel: (xp: number) => number;               // formula: solve 50*n*(n+1)/2 <= xp

  // Actions
  addXP: (childId: string, amount: number) => void;
  completeGame: (childId: string, gameId: string, score: number, difficulty: string) => void;
  earnBadge: (childId: string, badgeId: string) => void;
  resetChildProgress: (childId: string) => void;  // при видаленні профілю
}
```

- **And** `addXP`:
  - Додає XP
  - Перераховує level за формулою
  - Повертає `{ newLevel, leveledUp }` для trigger анімації level-up
- **And** `completeGame`:
  - Оновлює gameProgress: bestScore (max з попереднім), timesPlayed++, difficulty, lastPlayed
  - Перераховує islandProgress для відповідного острова
  - Додає XP: 1⭐ = 5 XP, 2⭐ = 10 XP, 3⭐ = 15 XP
- **And** `earnBadge`:
  - Додає badge в масив (якщо ще немає)
- **And** persist в MMKV: key `progress-store`
- **And** progress індексується по `childProfileId` — кожна дитина має окремий прогрес

### AC-6: Analytics store
- **Given** `src/stores/analyticsStore.ts`
- **When** логую event
- **Then** interface:

```typescript
interface AnalyticsEvent {
  id: string;                  // UUID
  childProfileId: string;
  eventName: string;
  metadata: Record<string, any>;
  createdAt: string;           // ISO date
  synced: boolean;             // false при створенні, true після sync
}

interface AnalyticsState {
  // State
  events: AnalyticsEvent[];     // локальна черга
  lastSyncAt: string | null;    // ISO date

  // Actions
  trackEvent: (name: string, metadata?: Record<string, any>) => void;
  syncEvents: () => Promise<void>;  // Phase 2: sync до Supabase
  clearSyncedEvents: () => void;    // видалити synced events (memory cleanup)
}
```

- **And** `trackEvent`:
  - Створює event з UUID, timestamp, childProfileId з activeProfile
  - Додає в масив events
  - Persist в MMKV
- **And** стандартні events:

| Event name | Metadata | Коли |
|-----------|----------|------|
| `app_open` | `{ source: 'cold' \| 'warm' }` | Запуск додатку |
| `game_start` | `{ gameId, islandId, difficulty }` | Початок гри |
| `game_complete` | `{ gameId, islandId, score, duration, xpEarned }` | Завершення гри |
| `level_up` | `{ newLevel, totalXP }` | Level up |
| `badge_earned` | `{ badgeId }` | Новий бейдж |
| `profile_created` | `{ ageGroup }` | Новий профіль |
| `onboarding_complete` | `{ steps: number }` | Онбординг завершено |
| `session_duration` | `{ minutes: number }` | При виході/background |
| `island_opened` | `{ islandId }` | Тап на острів |

- **And** Phase 2: `syncEvents` → batch insert в Supabase `analytics_events` таблицю
- **And** Phase 1: events тільки зберігаються локально (sync = stub)
- **And** COPPA compliance: жодних PII в metadata (не зберігати ім'я дитини, email тощо)
- **And** cleanup: видаляти synced events старше 30 днів (memory management)
- **And** persist в MMKV: key `analytics-store`
- **And** max events в queue: 1000 (якщо більше → видалити найстаріші synced)

### AC-7: Store initialization flow
- **Given** додаток запускається
- **When** root layout mount
- **Then** порядок ініціалізації:
  1. MMKV instance створюється (sync, миттєво)
  2. Всі Zustand stores hydrate з MMKV (sync, через persist middleware)
  3. `authStore.initialize()` → перевірити Supabase session
  4. Routing decision: auth → login / main → hub or onboarding
  5. Splash screen hide
- **And** весь flow ≤ 500ms (MMKV — sync, немає async bottleneck)
- **And** якщо MMKV corrupted → graceful fallback до default state (не crash)

## Tasks
1. [ ] `src/stores/middleware/mmkvPersist.ts` — MMKV storage adapter для Zustand persist
2. [ ] `src/stores/authStore.ts` — auth state + Supabase integration
3. [ ] `src/stores/childProfilesStore.ts` — profiles CRUD + switching
4. [ ] `src/stores/settingsStore.ts` — settings + PIN + language
5. [ ] `src/stores/progressStore.ts` — per-child XP, levels, game progress
6. [ ] `src/stores/analyticsStore.ts` — event queue + track helpers
7. [ ] Error mapping utility: Supabase errors → ukr messages
8. [ ] PIN hashing utility (SHA-256)
9. [ ] Level calculation utility (XP → level formula)
10. [ ] Integration test: create store → change state → restart → state persists

## Технічні нотатки
- Zustand persist: `persist(storeCreator, { name: 'key', storage: createJSONStorage(() => mmkvStateStorage) })`
- MMKV синхронний → persist працює без async/await (на відміну від AsyncStorage)
- Кожен store — окремий MMKV ключ (не один великий object)
- `getActiveProgress()` — залежить від activeProfileId з childProfilesStore
  - Використати `useStore` з selector або cross-store reference
- PIN hash: `crypto.subtle.digest('SHA-256', ...)` на web, або `expo-crypto` для native
- Level formula: `Level N requires 50 * N * (N+1) / 2 total XP`
  - Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, Level 4: 500 XP...
  - Reverse: `level = Math.floor((-1 + Math.sqrt(1 + 8 * xp / 50)) / 2)`
- Analytics COPPA: metadata НЕ містить PII, child_profile_id — UUID (не ім'я)

## QA Notes
- Перевірити: створити профіль → перезапустити → профіль на місці
- Перевірити: змінити settings → перезапустити → settings збережені
- Перевірити: addXP → level коректно обчислюється
- Перевірити: completeGame → bestScore зберігає MAX (не перезаписує нижчий)
- Перевірити: trackEvent → event в масиві з правильними полями
- Перевірити: 5-й профіль → помилка
- Перевірити: deleteProfile → progress видалено
- Перевірити: PIN lock → зберігається між перезапусками
- Перевірити: corrupted MMKV data → додаток не crash (fallback)

---
**Definition of Done:**
- [ ] Всі AC виконані
- [ ] State зберігається між перезапусками додатку
- [ ] Коміт: `feat(us-011): state management with mmkv persistence`
- [ ] Story оновлена зі статусом `done`
