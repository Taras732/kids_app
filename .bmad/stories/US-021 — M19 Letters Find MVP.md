---
id: US-021
epic: EP-07
title: M19 Letters Find MVP (tap на букву за назвою)
status: review
priority: High
estimate: 5h
actual: ~2h
phase: 2
project: Школярик
bpmn: M19
created: 2026-04-19
implemented: 2026-04-19
---

# US-021 — M19 Letters Find MVP

**Статус**: `ready`
**Пріоритет**: High (перша гра EP-07 Букви — новий острів для MVP)
**Оцінка**: 5h (pattern 1:1 з US-018 Shapes Recognize)
**BPMN модулі**: M19 (Letters find) — visual-only happy path

## User Story

**Як** дитина 4-7 років,
**я хочу** тапати на правильну букву за її назвою,
**щоб** вивчати український алфавіт.

**Як** developer,
**я хочу** додати другий острів до island-based game selection,
**щоб** довести що архітектура `listGamesByIsland` працює для >1 острова.

## Скоп (що ВХОДИТЬ у US-021)

✅ **Letter pool (uk):** 15 літер — `А Б В Г Д Е Ж З І К Л М Н О П`
✅ **Prompt:** "Знайди букву {letter}" (uppercase)
✅ **4 candidates per task:** 1 correct + 3 unique distractors
✅ **2×2 grid** з Pressable
✅ **5 tasks per level**
✅ **Validator:** `tappedLetter === target`
✅ **Island:** `letters` (новий для codebase)
✅ i18n uk/en (`game.letters.*`)
✅ Uppercase only для MVP

## Виключено (НЕ робимо у US-021)

❌ **Voice / audio** (M20) — потребує TTS або assets
❌ **Writing / тачскрін tracing** (M21) — Skia canvas, окрема US
❌ **English letters** (M25) — окрема гра `letters-en`
❌ **Lowercase letters / handwriting forms** — MVP uppercase
❌ **Syllables / words** (M23/M24) — окремі US
❌ **Letter sound prompt** ("яка буква починається на /м/?") — окремий submode
❌ **Adaptive difficulty** — 5 випадкових per level, без progression

## Acceptance Criteria

### Контракт API
- [ ] **AC-1:** `src/games/letters-find/index.ts` експортує `GameDefinition<LevelSpec<LetterAnswer>, LetterAnswer>`
- [ ] **AC-2:** `id: 'letters-find'`, `islandId: 'letters'`, `icon: '🔤'`
- [ ] **AC-3:** Зареєстровано у `registry.ts`

### Генератор
- [ ] **AC-4:** `generateLevel` повертає 5 tasks
- [ ] **AC-5:** `LetterAnswer = string` (одна літера uppercase)
- [ ] **AC-6:** Payload: `{ target: string, candidates: string[] }`
- [ ] **AC-7:** 1 target + 3 distractors з pool — усі 4 унікальні
- [ ] **AC-8:** Target shuffled на випадкову позицію серед candidates

### Renderer
- [ ] **AC-9:** `src/games/letters-find/Renderer.tsx`
- [ ] **AC-10:** Prompt: `"Знайди букву {{letter}}"` з i18n interpolation
- [ ] **AC-11:** 2×2 grid tap-zones (Pressable)
- [ ] **AC-12:** Літера всередині zone — extraBold, fontSize ~72
- [ ] **AC-13:** Tap → `onAnswer(letter)` → M10
- [ ] **AC-14:** Press lock + `useEffect` reset на `task.id`
- [ ] **AC-15:** `disabled` prop → opacity 0.5
- [ ] **AC-16:** Pressed scale 0.97 + primary border

### Валідатор
- [ ] **AC-17:** `validateAnswer(task, answer) → { correct: answer === payload.target }`

### i18n
- [ ] **AC-18:** `game.letters.name` = "Букви" / "Letters"
- [ ] **AC-19:** `game.letters.prompt` = "Знайди букву {{letter}}" / "Find the letter {{letter}}"
- [ ] **AC-20:** `game.letters.rules`

### Technical
- [ ] **AC-21:** `npx tsc --noEmit` = 0
- [ ] **AC-22:** Zero changes у `types.ts`, M10, `useGameSession.ts`, `islands.ts`

## Tasks

### 1. Generator (1h)
- [ ] `src/games/letters-find/index.ts`
- [ ] Pool constant
- [ ] Helpers: `pickDistractors(target, pool, count)`, `shuffle`
- [ ] `generateLevel` loop

### 2. Renderer (2h)
- [ ] `src/games/letters-find/Renderer.tsx`
- [ ] Prompt header з i18n
- [ ] 2×2 Pressable grid
- [ ] Press lock

### 3. Registry + i18n (1h)
- [ ] `registerGame(lettersFind)`
- [ ] uk/en `game.letters.*`

### 4. QA + commit (1h)
- [ ] Manual: пройти 5 tasks
- [ ] `tsc --noEmit`
- [ ] `feat(us-021): M19 Letters Find MVP`

## Дизайн-нотатки

- Літера fontSize: 72, lineHeight 84, fontFamily extraBold
- Tap-zone мінімум 140×140pt
- Колір літери: `colors.text` (deep navy `#1F1B3A`) на білому фоні zone

## Related

- **Depends on:** US-012 (M10) ✅, US-018 (patterns) ✅
- **Blocks:** US-022 (M20 Voice letters), US-023 (M21 Handwriting)
- **BPMN:** M19
- **Roadmap:** EP-07 Букви phase 2
