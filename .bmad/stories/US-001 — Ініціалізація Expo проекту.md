---
id: US-001
epic: EP-01
title: Ініціалізація Expo проекту
status: ready
priority: Must
estimate: 4h
phase: 1
project: Школярик
---

# US-001 — Ініціалізація Expo проекту

## User Story
**Як** розробник,
**я хочу** створити Expo проект з правильною структурою, навігацією та конфігурацією,
**щоб** мати працюючий каркас для всіх платформ (iOS, Android, Web).

## Acceptance Criteria

### AC-1: Проект створено та запускається
- **Given** чистий проект
- **When** виконано `npx create-expo-app shkolyaryk --template tabs`
- **Then** проект запускається без помилок на:
  - iOS через Expo Go (iPhone 8+ / iOS 15+)
  - Android через Expo Go (Android 10+, 2GB RAM+)
  - Web через браузер (Chrome 90+)
- **And** TypeScript strict mode увімкнено (`"strict": true` в `tsconfig.json`)
- **And** жодних TypeScript помилок при `npx tsc --noEmit`

### AC-2: Expo Router навігація
- **Given** файлова структура в `app/`
- **When** створено layout groups
- **Then** працюють наступні routes:

**Auth group** `(auth)` — без bottom tabs, без header:
```
app/(auth)/_layout.tsx     → Stack navigator, headerShown: false
app/(auth)/login.tsx       → Екран логіну
app/(auth)/register.tsx    → Екран реєстрації
app/(auth)/forgot-password.tsx → Відновлення пароля
```

**Main group** `(main)` — без tabs, без header (кастомний):
```
app/(main)/_layout.tsx     → Stack navigator
app/(main)/index.tsx       → Hub (головний екран з островами)
app/(main)/island/[id].tsx → Список ігор конкретного острова
app/(main)/game/[id].tsx   → Екран гри
app/(main)/onboarding/     → Онбординг flow:
  language.tsx             → Вибір мови
  name.tsx                 → Ввід імені дитини
  age-group.tsx            → Вибір вікової групи
  avatar.tsx               → Вибір аватара
  tutorial.tsx             → Туторіал-гра
```

**Parent group** `(parent)` — за PIN-кодом:
```
app/(parent)/_layout.tsx   → Stack navigator
app/(parent)/dashboard.tsx → Батьківська панель
app/(parent)/settings.tsx  → Налаштування
app/(parent)/profiles.tsx  → Управління профілями дітей
app/(parent)/stats.tsx     → Статистика прогресу
```

**Root layout** `app/_layout.tsx`:
- Перевіряє auth state (Supabase session)
- Якщо не авторизований → redirect до `/(auth)/login`
- Якщо авторизований + немає профілів → redirect до `/(main)/onboarding/language`
- Якщо авторизований + є профілі → redirect до `/(main)/`
- Завантажує шрифти через `expo-font` (useFonts hook)
- Показує SplashScreen до завершення завантаження ресурсів

### AC-3: Структура проекту
- **Given** проект ініціалізовано
- **When** перевіряю файлову структуру
- **Then** створені директорії з правильним призначенням:

```
shkolyaryk/
├── app/                    ← Expo Router pages (описані в AC-2)
│   ├── _layout.tsx         ← Root layout (auth check, fonts, splash)
│   ├── (auth)/
│   ├── (main)/
│   └── (parent)/
├── src/
│   ├── components/         ← Shared UI компоненти
│   │   ├── AppButton.tsx
│   │   ├── AppText.tsx
│   │   ├── GameCard.tsx
│   │   ├── ProgressBar.tsx
│   │   └── ...
│   ├── games/              ← Game modules (plugin architecture)
│   │   └── README.md       ← Пояснення структури game plugin
│   ├── stores/             ← Zustand stores
│   │   ├── authStore.ts
│   │   ├── childProfilesStore.ts
│   │   ├── settingsStore.ts
│   │   ├── progressStore.ts
│   │   ├── analyticsStore.ts
│   │   └── middleware/
│   │       └── mmkvPersist.ts
│   ├── utils/              ← Helpers
│   │   ├── supabase.ts     ← Supabase client
│   │   └── mmkv.ts         ← MMKV instance
│   ├── constants/          ← Конфігурація
│   │   ├── theme.ts        ← Кольори, spacing, shadows
│   │   ├── ageGroups.ts    ← Розміри per age group
│   │   ├── islands.ts      ← 8 островів (id, name, icon, color, games)
│   │   └── characters.ts   ← 4 персонажі (Коко, Бамбі, Ліса, Софі)
│   ├── i18n/               ← Локалізація
│   │   ├── index.ts        ← t() helper + useTranslation hook
│   │   ├── uk.json         ← Українські тексти
│   │   └── en.json         ← Англійські тексти
│   └── assets/             ← Статичні ресурси
│       ├── images/         ← PNG/SVG ілюстрації
│       │   ├── characters/ ← Персонажі (idle, celebrate, encourage, think)
│       │   ├── avatars/    ← 6 стартових аватарів
│       │   ├── islands/    ← Іконки 8 островів
│       │   └── onboarding/ ← Ілюстрації онбордингу
│       ├── sounds/         ← Звукові ефекти
│       │   ├── tap.mp3
│       │   ├── correct.mp3
│       │   ├── wrong.mp3
│       │   ├── level-up.mp3
│       │   └── ...
│       ├── voice/          ← Озвучка (Edge TTS, pre-generated)
│       │   ├── uk/         ← Українська
│       │   └── en/         ← Англійська
│       └── fonts/          ← Кастомні шрифти (sans-serif, дитячі)
├── .env                    ← EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
├── .env.example            ← Шаблон без реальних значень
├── app.json                ← Expo конфігурація
├── eas.json                ← EAS Build профілі
├── tsconfig.json           ← TypeScript strict mode
└── package.json
```

### AC-4: EAS Build конфігурація
- **Given** проект налаштовано
- **When** виконано `eas build:configure`
- **Then** `eas.json` містить профілі:
  ```json
  {
    "build": {
      "development": {
        "developmentClient": true,
        "distribution": "internal"
      },
      "preview": {
        "distribution": "internal"
      },
      "production": {}
    }
  }
  ```
- **And** `app.json` містить:
  - `expo.name`: "Школярик"
  - `expo.slug`: "shkolyaryk"
  - `expo.version`: "1.0.0"
  - `expo.ios.bundleIdentifier`: "com.shkolyaryk.app"
  - `expo.android.package`: "com.shkolyaryk.app"
  - `expo.web.bundler`: "metro"
  - `expo.orientation`: "default" (підтримка portrait + landscape)
  - `expo.icon`: placeholder icon (512x512 PNG)
  - `expo.splash`: placeholder splash (1284x2778 PNG, яскравий фон + логотип)
  - `expo.plugins`: `["expo-router", "expo-font"]`

### AC-5: Базові залежності встановлено
- **Given** проект створено
- **When** перевіряю `package.json`
- **Then** встановлені runtime залежності:
  - `expo` ~52.x — Expo SDK
  - `expo-router` ~4.x — File-based routing
  - `react-native-reanimated` ~3.x — Анімації (60 FPS)
  - `react-native-gesture-handler` ~2.x — Жести (drag, tap, swipe)
  - `react-native-mmkv` ~3.x — Синхронне локальне сховище
  - `zustand` ~5.x — State management
  - `expo-av` ~14.x — Аудіо (звуки, озвучка)
  - `@supabase/supabase-js` ~2.x — Auth
  - `@shopify/react-native-skia` ~1.x — 2D canvas для складних ігор
  - `expo-font` — Завантаження кастомних шрифтів
  - `expo-splash-screen` — Контроль splash screen
  - `react-native-safe-area-context` — Safe area для notch/island
  - `react-native-screens` — Native screens для навігації
- **And** dev залежності:
  - `typescript` ~5.x
  - `@types/react` — TypeScript types

### AC-6: Git repository
- **Given** проект створено
- **When** перевіряю git
- **Then** `.gitignore` містить: `node_modules/`, `.env`, `.expo/`, `dist/`, `*.jks`, `*.p8`, `*.p12`, `*.key`, `*.mobileprovision`, `*.orig.*`
- **And** initial commit створено: `feat(us-001): init expo project`
- **And** remote repository створено на GitHub: `Taras732/shkolyaryk`

## Tasks
1. [ ] `npx create-expo-app shkolyaryk --template tabs`
2. [ ] Налаштувати TypeScript strict mode
3. [ ] Створити повну файлову структуру `app/` з layout groups
4. [ ] Створити `src/` директорії з README/placeholder файлами
5. [ ] Встановити всі залежності (runtime + dev)
6. [ ] Створити `app.json` з повною конфігурацією
7. [ ] `eas build:configure` → `eas.json`
8. [ ] `.env` + `.env.example`
9. [ ] `.gitignore` оновити
10. [ ] Placeholder splash screen та icon
11. [ ] Перевірити запуск на iOS, Android, Web
12. [ ] Git init + initial commit + push to GitHub

## Технічні нотатки
- Bundle ID: `com.shkolyaryk.app`
- Node 18+ обов'язково
- Expo SDK 52+ (latest stable)
- `expo-router` використовує file-based routing — кожен файл в `app/` = route
- Layout groups `(auth)`, `(main)`, `(parent)` — не впливають на URL, тільки на layout
- `_layout.tsx` в кожній групі визначає navigator type (Stack/Tabs)
- MMKV потребує native module → dev-client для тестування (не Expo Go)
- Skia потребує native module → аналогічно
- Перші тести в Expo Go можливі без MMKV/Skia (mock storage)

## QA Notes
- Перевірити: `npx expo start` → QR код → iOS/Android Expo Go → відкривається
- Перевірити: `npx expo start --web` → відкривається в браузері
- Перевірити: `npx tsc --noEmit` → 0 помилок
- Перевірити: навігація між routes працює (можна додати тимчасові Link для тесту)
- Перевірити: `eas build --platform ios --profile preview` → build запускається (dry run)

---
**Definition of Done:**
- [ ] Всі AC виконані
- [ ] Проект запускається на iOS, Android, Web
- [ ] Коміт: `feat(us-001): init expo project`
- [ ] Story оновлена зі статусом `done`
