---
id: US-030
epic: EP-09
title: M28 Odd One Out MVP (що зайве)
status: review
priority: High
estimate: 5h
actual: ~2h
phase: 2
project: Школярик
bpmn: M28
created: 2026-04-19
implemented: 2026-04-19
---

# US-030 — M28 Odd One Out MVP

**Статус**: `ready`
**Пріоритет**: High (перша гра EP-09 Логіка — третій острів для MVP)
**Оцінка**: 5h (pattern 1:1 з US-018/021)
**BPMN модулі**: M28 (Odd one out) — categorical happy path

## User Story

**Як** дитина 4-7 років,
**я хочу** знайти предмет, який не підходить до інших трьох,
**щоб** вчитися категоризувати та логічно мислити.

**Як** developer,
**я хочу** підтвердити що architecture працює для контентно-based ігор з
заздалегідь визначеними category pools,
**щоб** готувати наступні: Memory Match, Simon Says.

## Скоп (що ВХОДИТЬ у US-030)

✅ **Категорії:** 4 pools через emoji
  - `fruits`: 🍎 🍌 🍐 🍊 🍇 🍓
  - `vehicles`: 🚗 🚌 🚲 🚀 🚂
  - `animals`: 🐶 🐱 🐰 🐻 🦁 🐸
  - `shapes`: ⭐ 🔺 ⚪ 🔶 🔷
✅ **Task:** 3 items з однієї category + 1 з іншої (odd)
✅ **4 cards per task, 2×2 grid**
✅ **Prompt:** "Що зайве?" / "Which is odd one out?"
✅ **Random shuffle** position of odd item
✅ **Validator:** `tappedIndex === oddIndex`
✅ **5 tasks per level**
✅ **Island:** `logic` (новий для codebase)
✅ i18n uk/en

## Виключено (НЕ робимо у US-030)

❌ **Text-based categories** ("fruit" as word) — emoji достатньо
❌ **Explanation why** ("це овоч, не фрукт") — tutorials deferred
❌ **Multi-level difficulty** — always 1 odd, always 4 cards
❌ **Timing bonus** — stars тільки за accuracy
❌ **Image assets** — тільки emoji (no PNG/SVG)
❌ **Adaptive content** per age group — universal pool
❌ **More than 4 cards** per task

## Acceptance Criteria

### Контракт API
- [ ] **AC-1:** `src/games/odd-one-out/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'odd-one-out'`, `islandId: 'logic'`, `icon: '🧩'`
- [ ] **AC-3:** Зареєстровано у `registry.ts`

### Генератор
- [ ] **AC-4:** `generateLevel` повертає 5 tasks
- [ ] **AC-5:** `OddAnswer = number` (index 0..3)
- [ ] **AC-6:** Payload: `{ items: string[], oddIndex: number }`
- [ ] **AC-7:** Pick 2 категорії (main + odd) випадково
- [ ] **AC-8:** 3 items з main (унікальні) + 1 з odd категорії
- [ ] **AC-9:** Odd item на випадковій позиції 0..3

### Renderer
- [ ] **AC-10:** `src/games/odd-one-out/Renderer.tsx`
- [ ] **AC-11:** Prompt зверху: `"Що зайве?"` з i18n
- [ ] **AC-12:** 2×2 grid tap-zones
- [ ] **AC-13:** Emoji в Pressable, fontSize ~64
- [ ] **AC-14:** Tap → `onAnswer(index)` → M10
- [ ] **AC-15:** Press lock + useEffect reset

### Валідатор
- [ ] **AC-16:** `validateAnswer(task, answer) → { correct: answer === payload.oddIndex }`

### i18n
- [ ] **AC-17:** `game.oddOneOut.name` = "Що зайве?" / "Odd one out"
- [ ] **AC-18:** `game.oddOneOut.prompt` = "Що зайве?" / "Which is odd?"
- [ ] **AC-19:** `game.oddOneOut.rules`

### Technical
- [ ] **AC-20:** `tsc --noEmit` = 0
- [ ] **AC-21:** Zero changes у `types.ts`, M10, `useGameSession.ts`, `islands.ts`

## Tasks

1. Generator з pools + pickCategories + shuffle (1h)
2. Renderer (2×2 grid Pressable) (1.5h)
3. Registry + i18n (0.5h)
4. QA + commit (1h)

## Related

- **Depends on:** US-012 (M10) ✅, US-018 (2×2 tap pattern) ✅
- **Blocks:** M34 Memory Match (US-034), M29 Sequence (US-031)
- **BPMN:** M28
- **Roadmap:** EP-09 Логіка phase 2
