---
id: US-015
epic: EP-05
title: Supabase Profile Sync (child_profiles + progress)
status: draft
priority: High
estimate: 12h
phase: 2
project: Школярик
bpmn: M08 M50 M55
created: 2026-04-19
depends_on: [US-100]
---

# US-015 — Supabase Profile Sync

**Статус**: `draft` (stub — чекає на US-100 Supabase DevOps Setup)
**Пріоритет**: High (блокує мульти-девайс, prod-ready experience)
**Оцінка**: 12h (після US-100)
**BPMN модулі**: M08 (Child Profile Creation) · M50 (XP/Level System) · M55 (Offline Sync)

## Контекст

Зараз (2026-04-19) state зберігається **тільки локально в MMKV**:
- [src/stores/childProfilesStore.ts](../../src/stores/childProfilesStore.ts) — child profiles
- [src/stores/progressStore.ts](../../src/stores/progressStore.ts) — XP, badges, game sessions
- [src/stores/pinStore.ts](../../src/stores/pinStore.ts) — parent PIN (НЕ синхронізуємо — local-only security)
- [src/stores/settingsStore.ts](../../src/stores/settingsStore.ts) — language, preferences

Наслідки:
1. Переустановка апи → втрата всіх профілів і прогресу
2. Друга дитина в сім'ї на другому девайсі не бачить профілів
3. Батько не може перевіряти прогрес через веб-дашборд (майбутнє)
4. QA складно тестувати — кожен девайс має свій state

## Залежність

**Блоковано US-100** (Supabase DevOps Setup). Не можна почати ДО того як:
- [x] Dev + Prod проекти існують у Supabase
- [x] CLI залінкований
- [x] Міграційний pipeline працює (`supabase db push`)

## User Story

**Як** батько з кількома дітьми,
**я хочу** щоб профілі та прогрес дітей зберігались у хмарі під моїм акаунтом,
**щоб** після переустановки або на другому девайсі діти знаходили свої профілі та не втрачали зароблений XP.

**Як** developer,
**я хочу** двосторонню синхронізацію (локальний MMKV ↔ Supabase) з offline-first підходом,
**щоб** апка працювала без інтернету і догоняла стан при reconnect.

## Скоп (що ВХОДИТЬ у US-015)

✅ **Схема БД** (migrations):
  - `child_profiles` table (parent_user_id FK, name, ageGroupId, avatarId, created_at, updated_at)
  - `progress` table (profile_id FK, xp, badges[], game_progress JSONB, updated_at)
  - RLS policies: батько бачить тільки своїх дітей (parent_user_id = auth.uid())
✅ **Supabase client** wrappers у `src/services/sync/` (createProfile, updateProfile, deleteProfile, upsertProgress)
✅ **Sync middleware** для Zustand:
  - Push локальних змін в Supabase при mutation + online
  - Pull при app start + `auth` session ready
  - Merge strategy: last-write-wins по updated_at (MVP)
✅ **Offline queue** у MMKV:
  - Черга mutations коли немає мережі
  - Flush при reconnect (NetInfo listener)
✅ **Conflict resolution** (базовий): merge XP = max(local, remote), badges = union, profiles = last-write-wins
✅ **Silent failures** (не дратувати користувача): помилки sync в аналітику, але UI не блокується

## Виключено (НЕ робимо у US-015)

❌ Real-time subscriptions → окрема US (pull кожні 30c достатньо для MVP)
❌ CRDT merge для game_progress → last-write-wins на MVP
❌ Backup/restore UI → пізніше
❌ Cross-device conflict modal → пізніше (MVP — тихий merge)
❌ Sync PIN → локально-only залишається (security)
❌ Аналітика sync metrics (успіх/провал rate) → US-063 (Analytics)

## Acceptance Criteria (drafted — перевіряти перед `/dev`)

### Схема та RLS
- [ ] **AC-1:** Міграція `0003_child_profiles.sql` створена, `supabase db push` на dev працює без помилок
- [ ] **AC-2:** Міграція `0004_progress.sql` створена
- [ ] **AC-3:** RLS: `SELECT`, `INSERT`, `UPDATE`, `DELETE` тільки коли `parent_user_id = auth.uid()` (для child_profiles)
- [ ] **AC-4:** RLS: доступ до `progress` тільки коли відповідний `child_profiles.parent_user_id = auth.uid()`
- [ ] **AC-5:** Індекси на `parent_user_id`, `profile_id`, `updated_at`

### Клієнтський sync
- [ ] **AC-6:** `src/services/sync/profileSync.ts` з API: `pushProfile`, `pullProfiles`, `syncAll`
- [ ] **AC-7:** `src/services/sync/progressSync.ts` аналогічно
- [ ] **AC-8:** При `addProfile` в `childProfilesStore` — автоматичний push у Supabase (fire-and-forget + retry queue)
- [ ] **AC-9:** При `addXp`, `awardBadge`, `recordGameSession` — debounced push (300ms) для бандлингу
- [ ] **AC-10:** При успішному `useAuthStore.login` (session відновлена) — `pullProfiles` + `pullProgress` для activeProfileId

### Offline поведінка
- [ ] **AC-11:** NetInfo listener у `App.tsx` (або окремому hook) трекає online/offline
- [ ] **AC-12:** Mutations в offline → черга в MMKV (`sync-queue` key)
- [ ] **AC-13:** При reconnect — flush черги FIFO, зупиняємось на першій помилці (retry пізніше)
- [ ] **AC-14:** Offline UI indicator (маленький хмарний icon у хедері) — optional на MVP

### Merge logic
- [ ] **AC-15:** При pull — локальний profile overwrite лише якщо remote `updated_at > local updated_at`
- [ ] **AC-16:** XP merge: local XP = `Math.max(local, remote)` (дитина не втрачає зароблене)
- [ ] **AC-17:** Badges merge: `Array.from(new Set([...local, ...remote]))`
- [ ] **AC-18:** Delete profile: soft delete (`deleted_at`) у Supabase, локально викидаємо одразу

### Tests (Jest unit + integration)
- [ ] **AC-19:** Unit: merge functions (XP max, badges union, last-write-wins)
- [ ] **AC-20:** Integration: mock Supabase response + assert state після sync
- [ ] **AC-21:** Offline simulation: відключити мережу → mutation → reconnect → assert push

### Security
- [ ] **AC-22:** RLS тести: user A не бачить дітей user B (через Supabase Dashboard SQL Editor)
- [ ] **AC-23:** Anon key не дає доступу до таблиць без auth (RLS default deny)

## Tasks (drafted — уточнити на `/sm`)

### 1. Supabase schema (2h)
- [ ] Міграція `0003_child_profiles.sql`
- [ ] Міграція `0004_progress.sql`
- [ ] RLS policies для обох таблиць
- [ ] Seed dev data (1 parent + 2 children)

### 2. Sync services (4h)
- [ ] `src/services/sync/profileSync.ts` — CRUD + pull
- [ ] `src/services/sync/progressSync.ts` — upsert + pull
- [ ] `src/services/sync/syncQueue.ts` — offline queue у MMKV
- [ ] `src/services/sync/netStatus.ts` — NetInfo wrapper

### 3. Store integration (3h)
- [ ] `childProfilesStore` — hook у addProfile/updateProfile/removeProfile → push
- [ ] `progressStore` — debounced push у addXp/awardBadge/recordGameSession
- [ ] `authStore` — тригер pull при login

### 4. Tests (2h)
- [ ] Unit: merge strategies
- [ ] Integration: sync flow mocked
- [ ] Manual QA: кілька девайсів (Expo Go на двох телефонах під одним акаунтом)

### 5. Docs & cleanup (1h)
- [ ] Оновити `docs/architecture.md` з sync flow diagram
- [ ] Додати troubleshooting у `docs/supabase-setup.md`

## Відкриті питання

- **Q-1:** Soft delete vs hard delete для child profiles — GDPR + COPPA compliance?
  - **Draft:** Soft delete 30 днів, потім hard delete (cron у Supabase)
- **Q-2:** PIN синхронізувати чи ні? Ризик: батько забув PIN на девайсі A, хоче скинути на девайсі B
  - **Draft:** Не синхронізуємо — PIN це local device lock, скидання через email (as today)
- **Q-3:** Merge strategy для `game_progress` (per-game JSON) — last-write-wins vs per-field merge?
  - **Draft:** last-write-wins (простіше), для MVP достатньо. Пізніше CRDT.
- **Q-4:** Коли пушити settings (language, preferences)? Окрема US чи частина цієї?
  - **Draft:** Окрема US-066 (Sync settings) — не блокує MVP.

## Definition of Done

- [ ] Усі AC закриті
- [ ] `supabase db push` на dev + prod пройшов
- [ ] Manual QA на 2 девайсах: створити профіль на A → з'явився на B
- [ ] `npx tsc --noEmit` = 0 errors
- [ ] Unit tests зелені
- [ ] Docs оновлені
- [ ] Оновлений HANDOFF.md

## Related
- Blocked by: [[US-100 — Supabase DevOps Setup]]
- Blocks: US-017 (Offline sync advanced), US-065 (Sync hardening)
- BPMN: M08, M50, M55
- Код: [src/stores/childProfilesStore.ts](../../src/stores/childProfilesStore.ts), [src/stores/progressStore.ts](../../src/stores/progressStore.ts)
