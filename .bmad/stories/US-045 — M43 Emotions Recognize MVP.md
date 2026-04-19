---
id: US-045
epic: EP-12
title: M43 Emotions Recognize MVP (розпізнай емоцію)
status: review
priority: High
estimate: 4h
actual: ~2h
phase: 2.5
project: Школярик
bpmn: M43
created: 2026-04-19
implemented: 2026-04-19
---

# US-045 — M43 Emotions Recognize MVP

**Статус**: `ready`
**Пріоритет**: High (перша гра EP-12 Емоції — п'ятий острів для MVP)
**Оцінка**: 4h
**BPMN модулі**: M43 (Emotions recognize) — core happy path

## User Story

**Як** дитина 3-8 років,
**я хочу** вчитися розпізнавати емоції за виразом обличчя,
**щоб** розвивати емоційний інтелект.

## Скоп

✅ **Емоції pool:** 6 базових
  - `happy` 😀
  - `sad` 😢
  - `angry` 😠
  - `scared` 😨
  - `surprised` 😲
  - `sleepy` 😴
✅ **Prompt:** велике face emoji зверху + "Яка це емоція?" / "Which emotion is this?"
✅ **3 text buttons:** 1 correct + 2 distractors з pool
✅ **Horizontal row** (як math-compare)
✅ **Validator:** `tappedEmotion === targetEmotion`
✅ **5 tasks per level**
✅ **Island:** `emotions`
✅ i18n uk/en для назв

## Виключено

❌ **Photographic faces** — тільки emoji MVP
❌ **Scenario-based** ("герой впав, що він відчуває?") — M44
❌ **Audio / TTS** — text-only labels
❌ **Combined emotions** (приємно+радісно) — single emotion per task
❌ **Age-adaptive pool** — universal 6

## Acceptance Criteria

### Контракт API
- [ ] **AC-1:** `src/games/emotions-recognize/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'emotions-recognize'`, `islandId: 'emotions'`, `icon: '💚'`
- [ ] **AC-3:** Зареєстровано у `registry.ts`

### Генератор
- [ ] **AC-4:** `generateLevel` повертає 5 tasks
- [ ] **AC-5:** `EmotionId = 'happy' | 'sad' | 'angry' | 'scared' | 'surprised' | 'sleepy'`
- [ ] **AC-6:** Payload: `{ target: EmotionId, emoji: string, candidates: EmotionId[] }`
- [ ] **AC-7:** 3 candidates: 1 correct + 2 unique distractors
- [ ] **AC-8:** Target shuffled серед candidates

### Renderer
- [ ] **AC-9:** `src/games/emotions-recognize/Renderer.tsx`
- [ ] **AC-10:** Big emoji card зверху (fontSize 96+)
- [ ] **AC-11:** Prompt "Яка це емоція?" під emoji
- [ ] **AC-12:** 3 text buttons horizontal row (flex:1)
- [ ] **AC-13:** Button text — i18n name з `game.emotions.names.{id}`
- [ ] **AC-14:** Tap → `onAnswer(id)` → M10
- [ ] **AC-15:** Press lock + useEffect reset
- [ ] **AC-16:** Pressed scale 0.97 + primary border

### Валідатор
- [ ] **AC-17:** `validateAnswer → { correct: answer === payload.target }`

### i18n
- [ ] **AC-18:** `game.emotions.name` = "Емоції" / "Emotions"
- [ ] **AC-19:** `game.emotions.prompt` = "Яка це емоція?" / "Which emotion is this?"
- [ ] **AC-20:** `game.emotions.rules`
- [ ] **AC-21:** `game.emotions.names.{happy|sad|angry|scared|surprised|sleepy}`

### Technical
- [ ] **AC-22:** `tsc --noEmit` = 0
- [ ] **AC-23:** Zero changes у `types.ts`, M10, `useGameSession.ts`, `islands.ts`

## Tasks

1. Generator + emotion pool (1h)
2. Renderer (emoji card + 3 text buttons) (1.5h)
3. Registry + i18n (1h)
4. QA + commit (0.5h)

## Related

- **Depends on:** US-012 ✅, US-017 (3-button pattern) ✅
- **Blocks:** US-046 (M44 scenarios)
- **BPMN:** M43
- **Roadmap:** EP-12 Емоції phase 2.5
