---
id: US-017
epic: EP-06
title: M16 Number Compare MVP (>, <, = — symbols mode)
status: ready
priority: High
estimate: 6h
phase: 2
project: Школярик
bpmn: M16
created: 2026-04-19
---

# US-017 — M16 Number Compare MVP

**Статус**: `ready`
**Пріоритет**: High (bridge between M14 counting і M15 arithmetic)
**Оцінка**: 6h
**BPMN модулі**: M16 (Number Compare) — happy path symbols-only

## User Story

**Як** дитина 5-7 років,
**я хочу** обирати правильний знак `>`, `<` або `=` між двома числами,
**щоб** вчитись визначати більше/менше/рівно.

**Як** developer,
**я хочу** додати четверту гру через `GameDefinition` contract,
**щоб** продовжувати розширення EP-06 без архітектурних змін.

## Скоп (що ВХОДИТЬ у US-017)

✅ **Symbols mode:** 3 кнопки `>`, `<`, `=` (🐼+ style, без pictorial для 🐣)
✅ **Range:** числа ∈ [1, 20]
✅ **Equality frequency:** `p_eq = 15%` — (a === b випадкує кожен ~6-й task)
✅ **Side swap:** `a` більше/менше ~50/50 (уникаємо bias щодо лівої сторони)
✅ **5 tasks per level** (consistency з US-013/US-016)
✅ **Distance constraint:** для non-equal варіантів `|a-b| ∈ [1, 19]` (будь-яка distance)
✅ **Validator:** `Math.sign(a-b)` → `>`/`<`/`=`
✅ **Island:** `math`
✅ i18n uk/en (`game.mathCompare.*`)
✅ Cross-platform (iOS/Android/Web)

## Виключено (НЕ робимо у US-017)

❌ Pictorial mode (🐣 дві купки) — окрема US для toddlers
❌ Crocodile anim / Lottie (A1) — нейтральні кнопки на MVP
❌ Number line aid (A2) — parent toggle пізніше
❌ TTS "Який знак поставити?" → US-019 Voice
❌ Chained compare (A5) — Phase 2, 🦉 only
❌ Unit compare (A4) — Phase 2
❌ Pictorial hint після 2-ї помилки → M10.A2 hint system не реалізовано
❌ Difficulty-based distance tuning (M12) → окрема US

## Acceptance Criteria

### Контракт API
- [ ] **AC-1:** `src/games/math-compare/index.ts` експортує `GameDefinition<LevelSpec<CompareAnswer>, CompareAnswer>`
- [ ] **AC-2:** `id: 'math-compare'`, `islandId: 'math'`, `icon: '⚖️'`
- [ ] **AC-3:** Зареєстровано у `registry.ts`

### Генератор
- [ ] **AC-4:** `generateLevel` повертає 5 tasks
- [ ] **AC-5:** Payload: `{ a: number, b: number, correct: CompareAnswer }`
- [ ] **AC-6:** `CompareAnswer = '>' | '<' | '='`
- [ ] **AC-7:** У кожному task: з ймовірністю 15% → `a === b` (generates equal); інакше `a !== b` random у [1,20]
- [ ] **AC-8:** Для non-equal tasks: side swap random (відсутній bias "a завжди більше")
- [ ] **AC-9:** `correct` обчислюється з `Math.sign(a-b)`: `+1 → '>'`, `-1 → '<'`, `0 → '='`

### Renderer
- [ ] **AC-10:** `src/games/math-compare/Renderer.tsx`
- [ ] **AC-11:** Показує `{a} ⬚ {b}` у великому шрифті по центру (порожній слот між числами — підсвічений box)
- [ ] **AC-12:** Нижче — 3 великі кнопки: `>`, `<`, `=` у горизонтальному ряді (flex: 1 кожна)
- [ ] **AC-13:** Tap → `onAnswer(symbol)` → M10 валідація
- [ ] **AC-14:** Lock після першого tap (prevents double-fire)
- [ ] **AC-15:** `disabled` prop → все disabled з opacity 0.5
- [ ] **AC-16:** Press feedback: scale 0.97, primary color

### Валідатор
- [ ] **AC-17:** `validateAnswer(task, answer)` повертає `{ correct: answer === payload.correct }`

### i18n
- [ ] **AC-18:** `game.mathCompare.name` = "Порівняй" / "Compare"
- [ ] **AC-19:** `game.mathCompare.rules` — коротко

### Technical
- [ ] **AC-20:** `npx tsc --noEmit` = 0
- [ ] **AC-21:** Zero changes у `types.ts`, M10, `useGameSession.ts`

## Tasks

### 1. Generator (1h)
- [ ] `math-compare/index.ts` з helpers: `rollEquality()`, `generatePair()`, `sideSwap()`
- [ ] `generateLevel` loop (5 tasks)

### 2. Renderer (2h)
- [ ] `math-compare/Renderer.tsx`
- [ ] Expression box з `{a} ⬚ {b}`, porожній слот як `<View style={styles.slot}/>`
- [ ] 3 SymbolButton (reuseable component inline)
- [ ] Press lock

### 3. Registry + i18n (30min)
- [ ] `registerGame(mathCompare)`
- [ ] uk/en keys

### 4. QA (1h)
- [ ] Manual: пройти 1 рівень, переконатись що `=` випадає
- [ ] Verify side-swap (`a > b` і `a < b` по черзі)
- [ ] `tsc --noEmit`

### 5. Commit (30min)
- [ ] `feat(us-017): M16 Number Compare MVP`
- [ ] Update HANDOFF.md

## Дизайн-нотатки

- Символи `>`, `<`, `=` мають бути ВЕЛИКИМИ і жирними (fontSize 48+, extraBold)
- Empty slot підсвітити pastel-purple box (primaryLight bg) з dashed border або м'яким glow — візуальний "тут чогось не вистачає"
- Використовувати `−` (U+2212) НЕ потрібно — тут тільки `>`, `<`, `=`
- Spacing між числами і порожнім слотом — однаковий

## Відкриті питання

- **Q-1:** Чи використовувати `≠` десь? → Ні, тільки `>/</=`.
- **Q-2:** У payload зберігати `correct` computed чи обчислювати у validator? → Зберігати (за прикладом US-016) для analytics і простоти validator
- **Q-3:** Side swap — 50/50 випадок чи enforce balance 2+3 per level? → 50/50 випадок, бо 5 tasks замало для enforced balance

## Definition of Done

- [ ] Усі AC закриті
- [ ] `tsc --noEmit` = 0
- [ ] Manual QA 1 повний рівень
- [ ] Commit з BMAD format
- [ ] HANDOFF.md оновлений (EP-06 progress table)

## Related

- **Depends on:** US-012 (M10) ✅, US-016 (M15 pattern reference) ✅
- **Blocks:** US-018 (Shapes M17), US-019 (Voice/TTS)
- **BPMN:** M16
- **Roadmap:** EP-06 Математика phase 2
