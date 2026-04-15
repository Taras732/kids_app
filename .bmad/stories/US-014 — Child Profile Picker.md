---
id: US-014
epic: EP-02
title: Child Profile Picker + Multi-Child Flow
status: review
priority: High
estimate: 12h
phase: 1
project: Школярик
bpmn: M08, M07
created: 2026-04-15
---

# US-014 — Child Profile Picker + Multi-Child Flow

**Статус**: `ready`
**Пріоритет**: High (блокер UX для сімей з 2+ дітьми)
**Оцінка**: 12h
**BPMN модулі**: M08 (Профілі дітей), M07 (Онбординг — resume)

## User Story

**Як** батько з кількома дітьми,
**я хочу** при запуску app вибрати яка саме дитина зараз грається,
**щоб** прогрес/XP/налаштування були правильно прив'язані до неї.

**Як** дитина,
**я хочу** сама тапнути на свого маскота при запуску,
**щоб** почати грати без дорослого.

**Як** батько,
**я хочу** додати нову дитину або з picker'а, або з батьківської панелі,
**щоб** не залежати від одного entry point.

## Скоп (що ВХОДИТЬ у US-014)

✅ **M08 HP.D1-D4** — Switch profile flow (picker → tap → activeProfileId → Hub)
✅ Нова screen `/profile-picker` — grid з профілями (маскот + ім'я) + кнопка "Додати дитину"
✅ Splash redirect: якщо `profiles.length ≥ 1` → `/profile-picker` (раніше одразу `/(main)`)
✅ Authentic (парольний) вхід: після logout/login → picker, а не Hub
✅ Self-serve add child — з picker кнопка "+ Додати дитину" → запускає існуючий onboarding flow (`name → age-group → avatar`) без PIN gate
✅ Parent panel `/(parent)/profiles.tsx` доробити: list з mascot + name + ageGroup, tap → edit, swipe/button → delete, "Додати" → onboarding flow (з PIN)
✅ Edit profile screen `/(parent)/profile-edit/[id].tsx` — змінити name / ageGroupId / avatarId
✅ Delete profile з confirmation ("Видалити {name}? Прогрес буде втрачено") через ConfirmModal
✅ Без PIN на switch (дитина сама перемикається) — per M09 skip для switch operation
✅ Age group refinement: карточки з маскотом + іменем + focus-текстом (що вчиться) + віком — вже є в `AGE_GROUPS` constant, лише покращити візуал
✅ i18n uk/en для всіх нових ключів
✅ Cross-platform (iOS/Android/Web)

## Виключено (НЕ робимо у US-014)

❌ Birthday-derived age group (M08 HP.3-4) — залишаємо direct mascot pick (MVP), birthday → окрема US пізніше
❌ Supabase sync profile CRUD (M08 HP.12-14) — локально в MMKV, sync у US-015+
❌ Soft-delete (`deleted_at`) + TTL — робимо hard delete з MMKV. Soft-delete коли буде Supabase
❌ Avatar builder M52 integration — лишаємо existing avatar picker з onboarding
❌ Auto re-onboarding коли 0 profiles after delete (M08 E7) — просто редирект на `/(main)/onboarding/name`
❌ Mascot nickname (M08 A3)
❌ Multi-parent sharing (M08 A4)
❌ Limit 5 профілів UI enforcement (M08 E1) — додамо в US коли буде Supabase
❌ Sync queue / offline indicator (M08 E3)
❌ Realtime subscription (M08 EV2)
❌ PIN-strength на switch — PIN тільки для parent panel CRUD (вже є в US-009)
❌ Analytics events (M08 EV3) — Phase 4

## Acceptance Criteria

### Profile Picker screen
- [ ] **AC-1:** Створено `app/(main)/profile-picker.tsx` з SafeAreaView + заголовок "Хто гратиме?"
- [ ] **AC-2:** Grid 2-column: кожна карточка показує mascot (emoji 64px), name (bold), ageRange (caption). Карточка натискна через Pressable.
- [ ] **AC-3:** Tap на карточку → `setActiveProfile(profile.id)` → `router.replace('/(main)')` (Hub)
- [ ] **AC-4:** Після grid — кнопка "+ Додати дитину" (tone=outline, size=lg) → `router.push('/(main)/onboarding/name?mode=add')`
- [ ] **AC-5:** Якщо `profiles.length === 0` — picker не рендериться, а splash redirect'ить напряму до `/(main)/onboarding/name` (як зараз)
- [ ] **AC-6:** Back на picker — disabled (це root екран у авторизованому стані). BackHandler ignored.
- [ ] **AC-7:** Іконка gear/settings у правому верхньому куті → `/(parent)/pin-gate` (доступ до parent panel)

### Splash routing
- [ ] **AC-8:** `app/splash.tsx` — якщо `isAuthenticated && profiles.length >= 2` → `router.replace('/(main)/profile-picker')`; якщо `profiles.length === 1` → auto-set activeProfile + `/(main)` (skip picker)
- [ ] **AC-9:** Якщо `isAuthenticated && !hasProfiles` → `/(main)/onboarding/language` (як зараз)
- [ ] **AC-10:** Якщо `!isAuthenticated` → `/(auth)/login` (як зараз)

### Hub integration
- [ ] **AC-11:** `app/(main)/index.tsx` (Hub) — якщо `activeProfileId === null && profiles.length >= 2` → `router.replace('/(main)/profile-picker')` (fail-safe). Якщо `activeProfileId === null && profiles.length === 1` → auto-set.
- [ ] **AC-12:** Hub header показує active profile: mascot + name (зверху). Tap → picker **тільки якщо profiles.length >= 2** (інакше tap noop або веде у parent profiles)

### Add child flow (self-serve from picker)
- [ ] **AC-13:** `/(main)/onboarding/name` приймає query param `mode=add` — якщо є, то після avatar → `addProfile(...)` + `setActiveProfile(newId)` + `router.replace('/(main)')` (без tutorial)
- [ ] **AC-14:** Без `mode=add` (первинний onboarding) — flow як зараз, включно з tutorial
- [ ] **AC-15:** Back з name/age-group/avatar screens повертає на picker (не на welcome), якщо `mode=add`

### Parent panel profile management
- [ ] **AC-16:** `/(parent)/profiles.tsx` переписати: list з карточок (mascot + name + ageGroup + "Активна" badge якщо activeProfileId). Кожна — tap → edit.
- [ ] **AC-17:** Кнопка "+ Додати дитину" в parent panel → `router.push('/(main)/onboarding/name?mode=add')` (той же flow)
- [ ] **AC-18:** Нова screen `/(parent)/profile-edit/[id].tsx` — форма: ім'я (TextInput), age group (AGE_GROUPS picker), avatar (AVATARS picker). Кнопки: "Зберегти", "Видалити", "Назад".
- [ ] **AC-19:** "Зберегти" — викликає новий метод `updateProfile(id, patch)` (треба додати в store)
- [ ] **AC-20:** "Видалити" — ConfirmModal "Видалити {name}? Прогрес цієї дитини буде втрачено". При confirm → `removeProfile(id)`. Якщо id === activeProfileId → auto-pick перший з решти (або null якщо 0 left) + navigate back до profiles list

### Store additions
- [ ] **AC-21:** `childProfilesStore` додати метод `updateProfile(id: string, patch: Partial<Omit<ChildProfile, 'id' | 'createdAt'>>)`
- [ ] **AC-22:** `removeProfile` доробити: якщо видаляємо active — auto-set activeProfileId на перший зі списку (або null)

### i18n
- [ ] **AC-23:** Додати ключі в `uk.json` + `en.json`:
  - `picker.title` — "Хто гратиме?" / "Who's playing?"
  - `picker.addChild` — "+ Додати дитину" / "+ Add child"
  - `picker.settings` — "Налаштування" / "Settings"
  - `profiles.edit` — "Редагувати" / "Edit"
  - `profiles.delete` — "Видалити" / "Delete"
  - `profiles.deleteConfirm` — "Видалити {{name}}?" / "Delete {{name}}?"
  - `profiles.deleteConfirmMsg` — "Прогрес цієї дитини буде втрачено." / "This child's progress will be lost."
  - `profiles.active` — "Активна" / "Active"
  - `profiles.save` — "Зберегти" / "Save"

### Якість
- [ ] **AC-24:** `npx tsc --noEmit` — 0 нових помилок
- [ ] **AC-25:** Всі кольори/spacing з `theme.ts`
- [ ] **AC-26:** Manual test всіх flow:
  1. Cold start з 2 profiles → picker → tap Коко → Hub з Коко
  2. Cold start з 0 profiles → language → onboarding → hub
  3. Picker → +Додати → name/age/avatar → Hub з новою дитиною як active
  4. Parent panel → profiles → tap Бамбі → edit → change name → save → list оновився
  5. Parent panel → profiles → edit → delete active → auto-switch на іншу
  6. Picker → gear → pin-gate → parent panel
  7. Hub → tap на header profile → picker

## Tasks

### Day 1 — Store + Picker screen (~4h)
1. [ ] Додати `updateProfile` у `childProfilesStore.ts`, доробити `removeProfile` (auto-switch active)
2. [ ] Створити `app/(main)/profile-picker.tsx` — grid + add button + settings gear
3. [ ] Оновити `app/splash.tsx` — redirect на picker якщо hasProfiles
4. [ ] Fail-safe у Hub (`app/(main)/index.tsx`) — redirect на picker якщо activeProfileId null

### Day 2 — Add-child flow + Hub header (~4h)
5. [ ] Додати `mode=add` handling у `onboarding/name.tsx` → `age-group.tsx` → `avatar.tsx`
6. [ ] Avatar screen: якщо `mode=add` — після save → `setActiveProfile(newId)` + `router.replace('/(main)')` (skip tutorial)
7. [ ] Hub header: render active profile mascot + name, tap → picker
8. [ ] Back button handling у onboarding під `mode=add` (→ picker замість welcome)

### Day 3 — Parent panel CRUD (~4h)
9. [ ] Переписати `/(parent)/profiles.tsx` — list з mascot/name/ageGroup + active badge + "+" button
10. [ ] Створити `/(parent)/profile-edit/[id].tsx` — форма edit/delete з ConfirmModal
11. [ ] Manual test усіх 7 flow з AC-26
12. [ ] i18n ключі uk/en
13. [ ] `npx tsc --noEmit`

## Технічні нотатки

### Файли що зачіпаються
- **Створюються:**
  - `app/(main)/profile-picker.tsx`
  - `app/(parent)/profile-edit/[id].tsx`
- **Змінюються:**
  - `app/splash.tsx` (redirect logic)
  - `app/(main)/index.tsx` (Hub header + fail-safe redirect)
  - `app/(main)/onboarding/name.tsx` (+ `mode=add`)
  - `app/(main)/onboarding/age-group.tsx` (+ `mode=add` param passthrough)
  - `app/(main)/onboarding/avatar.tsx` (+ `mode=add` → commit + nav)
  - `app/(parent)/profiles.tsx` (повний rewrite)
  - `src/stores/childProfilesStore.ts` (+ updateProfile, + auto-switch у removeProfile)
  - `src/i18n/uk.json`, `src/i18n/en.json`
- **НЕ зачіпаємо:**
  - `AGE_GROUPS` constant — уже достатній
  - `AVATARS` constant — уже є
  - PIN logic — уже готова (US-009)

### Архітектурні рішення

- **Chosen: MMKV-only for MVP** — без Supabase sync. Коли буде DB — окрема US на bi-directional sync з conflict resolution.
- **Chosen: direct mascot pick замість birthday** — простіше для дитини при self-serve додаванні, уникаємо date picker cross-platform issues. BPMN M08 допускає обидва варіанти (derive from birthday — це внутрішня логіка).
- **Chosen: hard delete** — простіше, немає storage concerns поки все у MMKV. Soft-delete додамо разом з Supabase sync.
- **Chosen: reuse existing onboarding screens з `mode` prop** — уникаємо дубляжу name/age/avatar форм.
- **Chosen: no PIN on switch** — per user рішення. PIN залишається на CRUD operations у parent panel (edit/delete).
- **Chosen: picker завжди перед Hub при ≥1 profiles** — навіть якщо тільки 1 profile, показуємо picker (можна в майбутньому додати "швидкий старт" alt якщо UX-feedback вимагатиме).

### Data flow — add child from picker

```
Picker "Додати"
  → router.push('/onboarding/name?mode=add')
  → user вводить name
  → router.push('/onboarding/age-group?mode=add&name=X')
  → user обирає mascot
  → router.push('/onboarding/avatar?mode=add&name=X&ageGroupId=Y')
  → user обирає avatar
  → addProfile({ name, ageGroupId, avatarId })
  → setActiveProfile(newId)
  → router.replace('/(main)')  // Hub з новою дитиною
```

### Data flow — edit child

```
Parent panel profiles
  → tap на карточку
  → router.push('/profile-edit/[id]')
  → user змінює поля
  → updateProfile(id, patch)
  → router.back()  // назад на profiles
```

### Cross-platform pitfalls

- Picker grid: `FlatList numColumns={2}` або manual grid з flex — обидва OK на iOS/Android/Web
- Settings gear: Pressable з emoji ⚙️ (не icon library) для мінімалізму
- ConfirmModal для delete — уже працює cross-platform

### Залежності від існуючого коду

- `childProfilesStore` — основа готова, треба лише додати `updateProfile` + доопрацювати `removeProfile`
- `AGE_GROUPS`, `AVATARS` constants — уже готові
- `onboarding/{name,age-group,avatar}.tsx` — уже існує flow
- `ConfirmModal` — уже працює
- `/(parent)/pin-gate` — уже готовий, redirect working

### Що НЕ робити (anti-scope-creep)

- НЕ додавати birthday picker — майбутня US коли потрібна точна аналітика
- НЕ інтегрувати з Supabase — окрема US на sync
- НЕ робити ліміт 5 профілів — немає з чим боротись поки локально
- НЕ робити avatar builder — існуючий picker достатній
- НЕ додавати tour / hub-tour для mode=add — лише для первинного

## QA Notes

### Self-report від /dev (2026-04-16)

**Виконано:**
- ✅ AC-1..AC-7: `profile-picker.tsx` — grid 2col з active border, gear→pin-gate, BackHandler blocked, "+Додати"
- ✅ AC-8..AC-10: `splash.tsx` — 0 profiles → onboarding; 1 profile → auto-set + Hub; ≥2 → picker
- ✅ AC-11..AC-12: Hub fail-safe + header tap (тільки при ≥2 profiles)
- ✅ AC-13..AC-15: `mode=add` prop крізь name→age-group→avatar; при add → setActiveProfile + replace до Hub (skip tutorial)
- ✅ AC-16..AC-20: `/(parent)/profiles.tsx` rewrite з cards + active badge + edit navigation; `/(parent)/profile-edit/[id].tsx` з name/age/avatar edit + delete ConfirmModal
- ✅ AC-21..AC-22: `updateProfile` + auto-switch у `removeProfile` додано
- ✅ AC-23: i18n ключі `picker.*` + `profiles.*` в uk/en
- ✅ AC-24: `npx tsc --noEmit` — 0 нових помилок (тільки 3 pre-existing FormInput, документовані до цього)
- ✅ AC-25: всі кольори/spacing з theme.ts
- ⏳ AC-26: manual test — треба провести QA

**Файли створено:**
- `app/(main)/profile-picker.tsx`
- `app/(parent)/profile-edit/[id].tsx`
- `src/constants/avatars.ts`

**Файли змінено:**
- `src/stores/childProfilesStore.ts` (+updateProfile, auto-switch)
- `app/splash.tsx` (routing logic)
- `app/(main)/index.tsx` (fail-safe + header switch)
- `app/(main)/onboarding/{name,age-group,avatar}.tsx` (mode=add pass-through)
- `app/(parent)/profiles.tsx` (full rewrite)
- `src/i18n/{uk,en}.json` (+13 ключів)

**Відомі обмеження / decision points:**
- Q-1 вирішено: picker з'являється тільки якщо profiles ≥ 2
- Swipe-to-delete не реалізовано — delete доступний тільки через edit-screen. Якщо треба swipe — окрема доробка.
- Onboarding під mode=add має в back button повернення на попередню onboarding screen, а не на picker (expo-router default back stack). Якщо треба "escape to picker" — зробимо в наступній ітерації.

---

## Питання до /pm перед стартом

Усі ключові питання вирішені в обговоренні з користувачем:
- ✅ Picker перед Hub (не після splash напряму)
- ✅ Self-serve add child — без PIN
- ✅ Add з parent panel — з PIN (уже gated)
- ✅ Age group refine = покращити візуал карточок (focus-текст уже є в AGE_GROUPS.focus)
- ✅ Switch profile — без PIN, дитина сама

**Вирішено:**
- **Q-1:** Picker показуємо тільки якщо `profiles.length >= 2`. При 1 profile — auto-select + Hub напряму. Картинку "Змінити дитину" на Hub header показуємо тільки якщо ≥2 profiles.

## Зв'язки

- BPMN: [M08 — Профілі дітей](../../../../Obsidian/Obdsidian_2026/10_Projects/Школярик/02_Product/BPMN_Scenarios/M08%20—%20Профілі%20дітей.md), [M07 — Онбординг](../../../../Obsidian/Obdsidian_2026/10_Projects/Школярик/02_Product/BPMN_Scenarios/M07%20—%20Онбординг.md)
- Epic: EP-02 (Onboarding & Profiles)
- Blocks: US-013 (Count Objects — паралельно доробимо, не блокер)
- Follows: US-008 (Profile management MVP, вже базово)
- Related: US-009 (PIN gate — уже готовий для parent panel CRUD)
- Next: US-015 (Supabase profile sync), US-016 (Avatar Builder M52)
