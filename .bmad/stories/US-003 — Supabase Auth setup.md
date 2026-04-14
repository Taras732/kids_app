---
id: US-003
epic: EP-02
title: Supabase Auth setup
status: ready
priority: Must
estimate: 3h
phase: 1
project: Школярик
---

# US-003 — Supabase Auth setup

## User Story
**Як** розробник,
**я хочу** налаштувати Supabase проект з авторизацією,
**щоб** батьки могли реєструватись і логінитись у додатку.

## Acceptance Criteria

### AC-1: Supabase проект створено
- **Given** supabase.com dashboard
- **When** створюю новий проект "shkolyaryk"
- **Then** отримую:
  - Project URL (формат: `https://xxxxx.supabase.co`)
  - Anon key (public, для клієнта)
  - Service role key (secret, тільки для серверних операцій — НЕ в клієнті)
- **And** регіон: EU (Frankfurt) — найближчий до України
- **And** план: Free tier (50K MAU, 500MB DB, 1GB storage)

### AC-2: Environment variables
- **Given** проект Expo
- **When** конфігурую env
- **Then** `.env` файл містить:
  ```
  EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
  ```
- **And** `.env.example` містить ті ж ключі зі значенням `your_value_here`
- **And** `.env` додано в `.gitignore`
- **And** в коді доступ через `process.env.EXPO_PUBLIC_SUPABASE_URL`

### AC-3: Supabase client з MMKV adapter
- **Given** `src/utils/supabase.ts`
- **When** імпортую клієнт
- **Then** Supabase ініціалізований з кастомним storage adapter:

```typescript
// Структура файлу:
import { createClient } from '@supabase/supabase-js';
import { mmkvStorage } from './mmkv';

const mmkvAdapter = {
  getItem: (key: string) => mmkvStorage.getString(key) ?? null,
  setItem: (key: string, value: string) => mmkvStorage.set(key, value),
  removeItem: (key: string) => mmkvStorage.delete(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: mmkvAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // для React Native
    },
  }
);
```

- **And** auth session зберігається в MMKV між запусками додатку
- **And** session refresh відбувається автоматично (autoRefreshToken)
- **And** `detectSessionInUrl: false` — обов'язково для React Native

### AC-4: MMKV instance
- **Given** `src/utils/mmkv.ts`
- **When** імпортую
- **Then** створено єдиний MMKV instance:

```typescript
import { MMKV } from 'react-native-mmkv';

export const mmkvStorage = new MMKV({
  id: 'shkolyaryk-storage',
  encryptionKey: 'shkolyaryk-enc-key', // для шифрування at rest (NFR-S1)
});
```

- **And** один instance на весь додаток (singleton)
- **And** шифрування увімкнено (MMKV encryption) — NFR-S1

### AC-5: Database таблиця analytics_events
- **Given** Supabase SQL editor
- **When** виконую migration
- **Then** створена таблиця:

```sql
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_profile_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  synced_at TIMESTAMPTZ
);

-- RLS: користувач бачить тільки свої events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Індекс для sync query
CREATE INDEX idx_analytics_events_user_synced
  ON analytics_events(user_id, synced_at);
```

- **And** RLS увімкнено: user бачить/вставляє тільки свої events
- **And** `metadata` — JSONB для довільних даних event (score, duration, gameId тощо)

### AC-6: Auth email templates (українська)
- **Given** Supabase Dashboard → Authentication → Email Templates
- **When** налаштовую templates
- **Then** Confirmation email:
  - **Subject:** "Підтвердіть email для Школярик 🎓"
  - **Body:** "Привіт! Натисніть кнопку нижче, щоб підтвердити вашу email-адресу і почати навчальну пригоду з додатком Школярик."
  - **Button:** "Підтвердити email"
- **And** Reset password email:
  - **Subject:** "Відновлення пароля — Школярик 🔑"
  - **Body:** "Ви запросили відновлення пароля для акаунту Школярик. Натисніть кнопку нижче, щоб створити новий пароль."
  - **Button:** "Створити новий пароль"
- **And** обидва листи мають footer: "Якщо ви не реєструвались у Школярик, проігноруйте цей лист."

### AC-7: Auth settings
- **Given** Supabase Dashboard → Authentication → Settings
- **When** конфігурую
- **Then** налаштовано:
  - Email confirmation: **Required** (обов'язкове підтвердження)
  - Minimum password length: **8 символів**
  - Redirect URL: `shkolyaryk://auth/callback` (deep link для mobile)
  - Site URL: `https://shkolyaryk.app` (або localhost для dev)
  - Rate limiting: 4 email/hour per IP (захист від abuse)
  - Disable sign-up: **false** (реєстрація відкрита)
  - Enable email provider: **true**
  - Enable phone provider: **false** (не потрібен для MVP)

## Tasks
1. [ ] Створити Supabase проект на supabase.com (регіон EU)
2. [ ] `src/utils/mmkv.ts` — MMKV instance з шифруванням
3. [ ] `src/utils/supabase.ts` — Supabase client з MMKV adapter
4. [ ] `.env` + `.env.example` з Supabase credentials
5. [ ] SQL migration: `analytics_events` таблиця + RLS + індекс
6. [ ] Налаштувати email templates (укр) в Supabase Dashboard
7. [ ] Налаштувати Auth settings (password length, rate limiting, redirect URL)
8. [ ] Перевірити підключення: `supabase.auth.getSession()` з додатку

## Технічні нотатки
- Supabase free tier limits: 50K MAU auth, 500MB DB, 2GB bandwidth, 1GB storage
- MMKV шифрування — hardware-backed на iOS (Keychain), software на Android
- Не використовувати service role key в клієнті — тільки anon key
- `detectSessionInUrl: false` — критично для React Native (інакше ламає deep links)
- Migration SQL зберігати в `supabase/migrations/` для reproducibility
- При тестуванні на web — redirect URL буде `http://localhost:8081`

## QA Notes
- Перевірити: `supabase.auth.getSession()` повертає null для нового користувача
- Перевірити: session зберігається в MMKV (перезапуск додатку — session залишається)
- Перевірити: `.env` НЕ потрапляє в git (`git status` після commit)
- Перевірити: RLS працює — запит від одного user не бачить events іншого

---
**Definition of Done:**
- [ ] Всі AC виконані
- [ ] Supabase підключається з додатку
- [ ] Коміт: `feat(us-003): supabase auth setup`
- [ ] Story оновлена зі статусом `done`
