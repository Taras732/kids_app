---
id: US-012
epic: EP-05
title: M10 Core Game Loop MVP
status: review
priority: High
estimate: 16h
phase: 2
project: Школярик
bpmn: M10
created: 2026-04-15
---

# US-012 — M10 Core Game Loop MVP

**Статус**: `review`
**Пріоритет**: High (блокує MVP)
**Оцінка**: 16h
**BPMN модулі**: M10 (Generic Game Loop) — core happy path тільки

## User Story
**Як** дитина 3-8 років,
**я хочу** грати в окремий рівень будь-якої гри з зрозумілим стартом, інтеракцією та результатом,
**щоб** отримувати XP/зірки і відчувати прогрес.

**Як** developer,
**я хочу** мати reusable Generic Game Loop з чітким contract API,
**щоб** додавати нові ігри (M14-M49) без дублювання state machine, валідації, scoring, navigation.

## Скоп (що ВХОДИТЬ у US-012)

✅ **HP.1-HP.18, HP.22-HP.25 з M10** — happy path (без M11, M12, M55, M56)
✅ **A6** — internal loop "Ще один рівень"
✅ **E8** — back-button confirm "Вийти?"
✅ Один **demo game** (`tap-the-dot`) для перевірки contract'у — 5 завдань на рівень, валідатор завжди correct/wrong по позиції
✅ Connect до **M50 / progressStore.addXp** (існуючий)
✅ Cross-platform: iOS / Android / Web
✅ i18n уkr/en

## Виключено (НЕ робимо у US-012 — окремі US)

❌ M11 Procedural generation → US-014: levelSpec hard-coded або mock generator
❌ M12 Adaptive difficulty → US-015: difficulty=1.0 static
❌ M13 Age Group Adaptation → US-016: базовий font scaling, повна адаптація пізніше
❌ M55 Offline sync → US-017: queue в MMKV без sync
❌ M56 Time limit → US-018
❌ A1-A5, A7-A10 alt scenarios → US-013
❌ E1-E7, E9-E13 negatives → US-013
❌ TTS озвучка → US-019 (потребує assets)
❌ Skia canvas games → потім (M21 розмальовка тощо)
❌ Tutorial mode (A10) → US-013

## Acceptance Criteria

### Контракт API
- [ ] **AC-1:** Існує тип `GameDefinition<TLevelSpec, TAnswer>` у `src/games/types.ts` з обов'язковими полями:
  - `id: string` (наприклад, `'tap-the-dot'`)
  - `islandId: string`
  - `name: string` (i18n key)
  - `generateLevel(difficulty: number): TLevelSpec` — повертає levelSpec з `tasks: Task[]`
  - `validateAnswer(task, answer): { correct: boolean }` — pure function
  - `Renderer: React.ComponentType<{ task, onAnswer }>` — game-specific UI
- [ ] **AC-2:** Існує `gameRegistry` у `src/games/registry.ts` — `Map<gameId, GameDefinition>`. Демо-гра `tap-the-dot` зареєстрована.

### State machine (useGameSession hook)
- [ ] **AC-3:** Hook `useGameSession(gameId, profileId)` повертає `{ phase, currentTask, taskIndex, totalTasks, mistakes, submit(answer), reset() }`
- [ ] **AC-4:** Phases: `'intro' | 'playing' | 'feedback-correct' | 'feedback-wrong' | 'finished'`
- [ ] **AC-5:** При `submit(answer)`:
  - Wrong → phase=`feedback-wrong` 1.2s → повертається до `playing` з тим самим task
  - Correct → phase=`feedback-correct` 1s → next task або `finished`
- [ ] **AC-6:** При `phase === 'finished'`: обчислено `stars` (0 mistakes=⭐⭐⭐, 1-2=⭐⭐, >2=⭐) та `xpEarned` (мап ⭐=5, ⭐⭐=8, ⭐⭐⭐=12)

### UI / навігація
- [ ] **AC-7:** Маршрут `/(main)/game/[id]` рендерить `<GameSessionScreen gameId={id} />` (замість stub'у)
- [ ] **AC-8:** Intro screen: маскот + textова інструкція + кнопка "Поїхали!" — 1 тап стартує
- [ ] **AC-9:** Playfield: header з прогресом (`{taskIndex+1}/{total}`), Renderer гри в центрі, ESC/back-кнопка з confirm
- [ ] **AC-10:** Feedback overlay: ✓ + "Молодець!" (correct) або ✗ + "Спробуй ще!" (wrong), з emoji-mascot. Auto-dismiss.
- [ ] **AC-11:** Result screen `/(main)/game-result` показує: stars (animated reveal 1×1), XP earned, кнопки "Ще раз" / "Інша гра" / "До Hub"

### Інтеграція
- [ ] **AC-12:** При finished → `progressStore.addXp(profileId, xpEarned)` викликається ОДИН раз (idempotent guard через `sessionId`)
- [ ] **AC-13:** Hub XP-bar показує оновлений XP після повернення з гри
- [ ] **AC-14:** Back-кнопка / hardware back під час `playing` → ConfirmModal "Вийти? Прогрес втратиться" — yes виходить, no resume
- [ ] **AC-15:** "Ще раз" з result screen → новий sessionId, той самий gameId, fresh levelSpec

### Demo game
- [ ] **AC-16:** `tap-the-dot` гра працює: 5 завдань × випадкова позиція точки в межах playfield, тап на точку = correct, тап мимо = wrong
- [ ] **AC-17:** Гру можна пройти end-to-end з Hub → Island → Game → Result → Hub з оновленим XP

### Cross-platform
- [ ] **AC-18:** Working на web (SafeAreaView + safe-area fix як у hub), iOS Expo Go, Android Expo Go
- [ ] **AC-19:** ConfirmModal використовується замість Alert.alert (web-safe)
- [ ] **AC-20:** Всі тексти через `t()`, ключі додано в `uk.json` ТА `en.json`

### Якість
- [ ] **AC-21:** `npx tsc --noEmit` — 0 нових помилок
- [ ] **AC-22:** Всі gameplay-кольори/spacing з `theme.ts` (без хардкоду)

## Tasks

### Day 1 — Архітектура (~6h)
1. [ ] Створити `src/games/types.ts` — `GameDefinition`, `Task`, `LevelSpec`, `Phase`, `SessionState`
2. [ ] Створити `src/games/registry.ts` — registry + register/get helper
3. [ ] Створити `src/games/useGameSession.ts` — hook зі state machine (useReducer)
4. [ ] Unit-тестова прогонка hook'а вручну (console.log або легкий test screen)

### Day 2 — UI Foundation (~5h)
5. [ ] Створити `src/components/game/GameHeader.tsx` — прогрес-бар + back-confirm
6. [ ] Створити `src/components/game/FeedbackOverlay.tsx` — correct/wrong overlay з timer
7. [ ] Створити `src/components/game/StarsReveal.tsx` — animated reveal 1×1 (Reanimated)
8. [ ] Створити `app/(main)/game-result.tsx` — result screen
9. [ ] Переписати `app/(main)/game/[id].tsx` — використовує `useGameSession` + рендерить registry'd Renderer

### Day 3 — Demo гра + інтеграція (~5h)
10. [ ] Створити `src/games/tap-the-dot/index.ts` — `GameDefinition` з generateLevel + validate
11. [ ] Створити `src/games/tap-the-dot/Renderer.tsx` — playfield з Pressable точкою
12. [ ] Зареєструвати гру в `registry.ts`
13. [ ] Оновити `app/(main)/island/[id].tsx` — список ігор острова з registry (поки тільки `tap-the-dot` для одного острова)
14. [ ] i18n: додати ключі `game.intro`, `game.letsgo`, `game.correct`, `game.tryAgain`, `game.starsEarned`, `game.xpEarned`, `game.again`, `game.otherGame`, `game.toHub`, `game.exitConfirm`, `game.exitConfirmMsg` — в обидва файли
15. [ ] Manual test: повний цикл Hub → Island → Game → Result → Hub з оновленим XP
16. [ ] `npx tsc --noEmit` — переконатись 0 нових помилок

## Технічні нотатки

### Файли що зачіпаються
- **Створюються:** `src/games/types.ts`, `src/games/registry.ts`, `src/games/useGameSession.ts`, `src/games/tap-the-dot/index.ts`, `src/games/tap-the-dot/Renderer.tsx`, `src/components/game/{GameHeader,FeedbackOverlay,StarsReveal}.tsx`, `app/(main)/game-result.tsx`
- **Змінюються:** `app/(main)/game/[id].tsx`, `app/(main)/island/[id].tsx`, `src/i18n/{uk,en}.json`
- **НЕ зачіпаємо:** `progressStore.ts` (використовуємо існуючий `addXp`)

### Архітектурний вибір (для /architect ревью)
- **State management:** `useReducer` всередині hook (не Zustand) — session state ефемерний, не персистентний у US-012
- **Registry pattern:** дозволяє нові ігри додавати без зміни core (Open/Closed)
- **Session ID:** `crypto.randomUUID()` (web) / fallback `Date.now()+random` (RN)
- **Idempotency:** XP commit guarded `if (committedRef.current) return;`

### Cross-platform pitfalls (з CLAUDE.md / dev.md)
- **Alert.alert** — НЕ використовувати, тільки `ConfirmModal` (для AC-14)
- **Safe-area** — у GameSession screen теж потрібен `useSafeAreaInsets() + Math.max(insets.top, 50)`
- **Animations** — Reanimated 4 (не Animated API)
- **i18n** — обидва файли uk.json + en.json синхронно
- **Theme** — тільки `colors`, `spacing`, `radius` з theme.ts

### Залежності від існуючого коду
- `progressStore.addXp(profileId, xp)` — уже є
- `useChildProfilesStore.getActiveProfile()` — уже є
- `ConfirmModal`, `BottomTabBar`, `AppButton`, `AppText` — уже є
- `useSafeAreaInsets()` — паттерн з `app/(main)/index.tsx`

### Що НЕ робити (anti-scope-creep)
- НЕ підключати TTS / expo-speech
- НЕ робити sound effects (треба assets)
- НЕ робити Skia canvas (буде в окремих іграх)
- НЕ робити offline sync
- НЕ робити streak tracking
- НЕ робити хінти / pause / tutorial — все це US-013

## QA Notes

### Dev self-report (2026-04-15)

**Реалізовано:**
- `src/games/types.ts` — `GameDefinition`, `Task`, `LevelSpec`, `Phase`, `SessionState`, `computeStars`, `computeXp`
- `src/games/registry.ts` — `registerGame/getGame/listGames/listGamesByIsland` + auto-register `tap-the-dot`
- `src/games/useGameSession.ts` — useReducer state machine, timers, crypto.randomUUID з fallback
- `src/games/tap-the-dot/{index.ts, Renderer.tsx}` — demo гра 5 завдань × random dot, tap on dot = correct, tap miss = wrong
- `src/components/game/{GameHeader, FeedbackOverlay, StarsReveal}.tsx`
- `app/(main)/game/[id].tsx` — повний перепис з useGameSession + intro/playfield/feedback overlay + back-confirm
- `app/(main)/game-result.tsx` — stars reveal + XP card + Again/Other/Hub
- `app/(main)/island/[id].tsx` — список ігор з registry для острова
- i18n: додано `game.intro/letsgo/correct/tryAgain/starsEarned/xpEarned/again/otherGame/toHub/exitConfirm/exitConfirmMsg/tapTheDot.name` у `uk.json` і `en.json`

**AC status:**
- AC-1..AC-15 — код відповідає (див. файли)
- AC-16, AC-17 — потребують manual end-to-end тестування (QA)
- AC-18 — cross-platform код написаний (SafeAreaView + safe-area fix + Pressable), потрібен manual тест на web/iOS/Android
- AC-19 — ConfirmModal використовується (`app/(main)/game/[id].tsx:handleBack` flow)
- AC-20 — всі тексти через `t()`, ключі синхронно в обох файлах
- AC-21 — ✅ 0 нових TS помилок. Залишились лише pre-existing 3 помилки у `FormInput.tsx` (outlineStyle — web-specific типи, логовано в architect.md technical debt)
- AC-22 — ✅ всі кольори/spacing з `theme.ts`

**Архітектурні ноти:**
- `committedRef` у `GameScreenInner` гарантує один виклик `addXp` навіть при re-rendering/StrictMode
- `router.replace('/game/[id]', { id: gameId })` з result screen стартує новий compoenent instance → новий `sessionId` через `useMemo([gameId])` і useReducer initial — тому "Ще раз" дає свіжий levelSpec
- `tap-the-dot` validateAnswer: Евклідова відстань від удару до центру точки ≤ `radius + 10px` tolerance

**Для QA — чекліст manual:**
1. Web (`npm run web`): Hub → Island (Логіка) → Tap the dot → Intro ("Поїхали!") → 5 завдань → Result з зірками + XP → Hub з оновленим XP-bar
2. Wrong tap: точка миссується → оверлей "Спробуй ще!" 1.2s → повернення до того ж task
3. Correct tap: точка hit → оверлей "Молодець!" 1s → наступний task або Result
4. Back-кнопка під час playing → ConfirmModal "Вийти?" — yes виходить, no resume
5. "Ще раз" → свіжий levelSpec (інші позиції точок)
6. iOS / Android Expo Go — повторити flow
7. Перевірити що `addXp` викликається саме ОДИН раз (Redux DevTools або console.log у стор)

---

## Питання до /pm перед стартом

1. **Q-1:** OK що `tap-the-dot` — це placeholder demo, не реальна гра з MVP-набору? (Перша справжня гра M14 буде окремою US-014 використовуючи цей movement loop.)
2. **Q-2:** Confirm scoring: ⭐ thresholds (0=⭐⭐⭐, 1-2=⭐⭐, >2=⭐) і XP (5/8/12) — це з M10.HP.15-16. ОК?
3. **Q-3:** Result screen — потрібно показувати "переможні фрази" варіативно (Молодець! / Супер! / Так тримати!) чи поки одна?

---

## Зв'язки

- BPMN: [M10 — Ігрова сесія (generic loop)](../BPMN_Scenarios/M10%20—%20Ігрова%20сесія%20(generic%20loop).md) — повний контекст
- Викликає (mock'и в US-012): M11 → US-014, M12 → US-015, M50 → existing `progressStore.addXp`
- Пов'язано: US-013 (Pause/Resume), US-014 (M11), US-015 (M12)
