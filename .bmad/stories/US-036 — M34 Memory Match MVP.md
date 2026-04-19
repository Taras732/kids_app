---
id: US-036
epic: EP-10
title: M34 Memory Match MVP (знайди пару)
status: review
priority: High
estimate: 6h
actual: ~3h
phase: 2
project: Школярик
bpmn: M34
created: 2026-04-19
implemented: 2026-04-19
---

# US-036 — M34 Memory Match MVP

**Статус**: `review`
**Пріоритет**: High (перша гра EP-10 Пам'ять — 6-й острів для MVP + новий interaction pattern)
**Оцінка**: 6h (новий pattern — multi-tap state + delay)
**BPMN модулі**: M34 (Memory match) — visual happy path

## User Story

**Як** дитина 4-7 років,
**я хочу** перевертати картки і знаходити пари однакових предметів,
**щоб** тренувати зорову пам'ять.

**Як** developer,
**я хочу** підтвердити що `GameDefinition` contract витримує **multi-tap interactive**
гру (2 tap = 1 logical answer з internal state), не лише simple "1 tap = 1 answer",
**щоб** architecture був доведений на складнішому pattern.

## Скоп

✅ **Board:** 6 карток (2 рядки × 3) = 3 пари
✅ **Content:** emoji pool fruits/animals/vehicles/shapes — 3 унікальні емодзі per board
✅ **Card state:** `hidden` → `revealed` → `matched` (after pair found)
✅ **Tap logic:**
  - 1-а картка відкрита — flip на face
  - 2-а картка відкрита — flip на face
  - Match → залишаються відкритими (matched)
  - No match → 900ms delay → flip обох назад, mistakes++
✅ **Level complete:** коли всі 3 пари matched → `onAnswer(mistakes)` → M10
✅ **Validator:** `{ correct: mistakes <= 2 }` (0-2 помилки = correct, 3+ = wrong)
✅ **3 boards per level** (не 5 — довше per board)
✅ **Island:** `memory`
✅ i18n uk/en

## Виключено

❌ **Flip animation** (3D rotate) — для MVP opacity/scale simpler
❌ **Timer / speed bonus** — accuracy only
❌ **Level progression** (more pairs as difficulty grows) — fixed 3 pairs
❌ **Sound effects** — silent MVP
❌ **Gameplay hints** ("look here!") — no assist
❌ **Score persistence** per-board — overall mistakes tracked lump
❌ **Multi-player / turns** — solo

## Acceptance Criteria

### Контракт API
- [ ] **AC-1:** `src/games/memory-match/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'memory-match'`, `islandId: 'memory'`, `icon: '🧠'`
- [ ] **AC-3:** Зареєстровано у `registry.ts`

### Генератор
- [ ] **AC-4:** `generateLevel` повертає 3 tasks (boards)
- [ ] **AC-5:** `MemoryAnswer = number` (mistakes count)
- [ ] **AC-6:** Payload: `{ cards: { id: string, emoji: string }[] }` — 6 cards, pairs mixed
- [ ] **AC-7:** Кожен board: pick 3 унікальні emoji, duplicate each, shuffle positions
- [ ] **AC-8:** `cards[i].id` формат `pair-X-A|B` для унікальності

### Renderer
- [ ] **AC-9:** `src/games/memory-match/Renderer.tsx`
- [ ] **AC-10:** 2×3 grid Pressable cards
- [ ] **AC-11:** Card hidden state — backOfCard UI (emoji ❓ або primaryLight bg)
- [ ] **AC-12:** Card revealed — face (emoji)
- [ ] **AC-13:** Card matched — face + success border (`colors.success`)
- [ ] **AC-14:** State hooks: revealed/matched/mistakes, reset on task.id
- [ ] **AC-15:** 2 revealed but no match → 900ms delay → flip back
- [ ] **AC-16:** disabled під час delay (user can't tap 3rd)
- [ ] **AC-17:** All matched → `onAnswer(mistakes)` once
- [ ] **AC-18:** No double-fire onAnswer

### Валідатор
- [ ] **AC-19:** `{ correct: answer <= 2 }`

### i18n
- [ ] **AC-20:** `game.memoryMatch.name` = "Знайди пару" / "Find the pair"
- [ ] **AC-21:** `game.memoryMatch.prompt` = "Запам'ятай і знайди пару" / "Match the pairs"
- [ ] **AC-22:** `game.memoryMatch.rules`

### Technical
- [ ] **AC-23:** `tsc --noEmit` = 0
- [ ] **AC-24:** Zero changes у `types.ts`, M10, `useGameSession.ts`, `islands.ts`

## Tasks

1. Generator + pools + shuffle (1h)
2. Renderer state machine (revealed/matched/mistakes) + delay logic (3h)
3. Card UI (hidden/revealed/matched visual states) (1h)
4. Registry + i18n (0.5h)
5. QA + commit (0.5h)

## Дизайн-нотатки

- Card size: flex:1, minHeight 100pt
- Hidden card: primaryLight background, "?" symbol або pattern
- Revealed: white bg, emoji fontSize 56
- Matched: white bg + success border 3pt, slight opacity variation

## Відкриті питання

- **Q-1:** Mistakes threshold для correct? → MVP: ≤2 = correct
- **Q-2:** Animation flip (3D)? → deferred, opacity fade enough
- **Q-3:** Autoflip after win? → handled by M10 transition to next task

## Related

- **Depends on:** US-012 ✅
- **Blocks:** US-037 (M35 Sequence), US-038 (M36 What changed)
- **BPMN:** M34
- **Roadmap:** EP-10 Пам'ять phase 2
