# Школярик — Project Context

## Про проект
Освітньо-ігровий додаток для дітей 3-8 років. iOS + Android + Web через Expo.
Source of truth (документація, ТЗ, геймдизайн): `D:/Obsidian/Obdsidian_2026/10_Projects/Школярик/`

## Tech Stack
- **Expo SDK 54** (React Native 0.81, React 19.1)
- **Expo Router 6** — file-based routing, typed routes
- **TypeScript strict**
- **Zustand** + **MMKV** (web → localStorage fallback через `src/utils/mmkv.ts`)
- **Supabase Auth** — email/пароль
- **Reanimated 4** + **Gesture Handler 2** + **Skia** (2D canvas)
- **EAS Build/Update/Submit** — вся збірка хмарна (працює з Windows)

## Структура
```
app/                    ← Expo Router pages
  _layout.tsx           ← Root: auth guard + navigation
  (auth)/               ← login, register, forgot-password
  (main)/               ← index (hub), island/[id], game/[id], onboarding/*
  (parent)/             ← dashboard, stats, profiles, settings
src/
  components/           ← AppButton, AppText + додаватимуться
  games/                ← plugin architecture (per-game folder)
  stores/               ← Zustand + MMKV persist middleware
  utils/                ← supabase.ts, mmkv.ts (web fallback)
  constants/            ← theme, ageGroups, islands, characters
  i18n/                 ← uk.json + en.json + t() helper
  assets/               ← images, sounds, voice, fonts
```

## BMAD Workflow
Активний. Команди в `.claude/commands/`: `/pm`, `/sm`, `/dev`, `/qa`, `/architect`.
Stories: `.bmad/stories/US-XXX — *.md` (11 в Phase 1, до US-072 в роадмапі).
PRD: `prd.md`.

### Цикл
1. `/sm` → story з AC (якщо задача >30 хв)
2. `/dev` → реалізація за AC
3. `/qa` → перевірка AC
4. Commit: `feat(us-XXX): короткий опис`

## Правила коду
- TypeScript strict — 0 помилок у `npx tsc --noEmit`
- Path alias: `@/*` → корінь (використовується в app/ та src/)
- MMKV не працює на web → завжди через `src/utils/mmkv.ts` (має fallback)
- Не імпортувати з `hooks/` (видалено) — тільки `src/`
- Всі тексти через `t()` з `src/i18n` (без хардкоду літералів)
- Stores через Zustand + `mmkvStorage` middleware (`src/stores/middleware/mmkvPersist.ts`)

## Команди
```bash
npm run web        # Web (основний для розробки на Windows)
npm run android    # Android через Expo Go
npm run ios        # iOS через Expo Go (mac only для native build)
npx tsc --noEmit   # TS check
```

## Environment
`.env` — `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
Без них — Supabase Auth не працює; є `isSupabaseConfigured()` helper.
Dev-login через `login.tsx` працює без Supabase (пряме `setSession()`).

## Статус
- **Phase 1 — active**
- US-001 (Ініціалізація) — **in progress**: каркас створено, Supabase Auth і повний UI Kit — далі

## GitHub
`Taras732/kids_app` (потрібен `gh auth login` для push).
