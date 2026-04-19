---
id: US-016
epic: EP-06
title: M15 Math Expressions MVP (додавання/віднімання multi-choice)
status: ready
priority: High
estimate: 8h
phase: 2
project: Школярик
bpmn: M15
created: 2026-04-19
---

# US-016 — M15 Math Expressions MVP

**Статус**: `ready`
**Пріоритет**: High (друга гра EP-06 Математика після US-013 Count Objects)
**Оцінка**: 8h
**BPMN модулі**: M15 (Math Expressions) — happy path MVP тільки

## User Story

**Як** дитина 5-7 років (🐼/🦊 age group),
**я хочу** розв'язувати прості арифметичні приклади на додавання і віднімання,
**щоб** тренувати рахунок у межах 10-20 і заробляти XP.

**Як** developer,
**я хочу** додати третю гру через `GameDefinition` contract без змін у M10 loop,
**щоб** подальше розширення EP-06 (M16 порівняння, M17 фігури) було тривіальним.

## Скоп (що ВХОДИТЬ у US-016)

✅ **Operator pool:** `{+, −}` тільки (MVP)
✅ **Range:** результат ∈ [0, 10] (обмежено щоб multi-choice працював — distractors у межах)
✅ **Unknown position:** тільки `result` (`3 + 2 = ?`). Left/right (`? + 2 = 5`) — у наступній US
✅ **Input mode:** multi-choice з 4 кнопок (1 correct + 3 distractors у межах ±3 від правильної відповіді)
✅ **5 tasks per level** (consistency з US-013)
✅ **Generator:** уникати `a<b` коли `op=−` (не генерувати від'ємні результати)
✅ **Validator:** `eval(a, op, b) === answer`
✅ **Island:** `math` (same як US-013)
✅ i18n uk/en (`game.mathExpressions.*`)
✅ **Cross-platform:** iOS / Android / Web

## Виключено (НЕ робимо у US-016)

❌ Multiplication/division → окрема US для 🦉 2 клас
❌ Find unknown (left/right) → US-017+
❌ Pictorial model (🍎🍎🍎 + 🍎🍎) → US-018+ (вимагає assets + додаткову верстку)
❌ TTS озвучка → US-019 (потребує Voice module)
❌ Age group adaptation (різні range по маскоту) → US-020 (M13)
❌ Keypad mode → якщо range розширити поза 10 — у наступній US
❌ Speed round / timer → pizdnish
❌ Vertical column layout → 🦉-only, поза MVP
❌ Mistake type classification (carry-error тощо) → аналітика пізніше
❌ Hint (-1 зірка) → M10.A2 не реалізовано у US-012

## Acceptance Criteria

### Контракт API
- [ ] **AC-1:** Створено `src/games/math-expressions/index.ts` що експортує `GameDefinition<LevelSpec<number>, number>`
- [ ] **AC-2:** `id: 'math-expressions'`, `islandId: 'math'`, `icon: '➕'`
- [ ] **AC-3:** Зареєстровано у `src/games/registry.ts`

### Генератор
- [ ] **AC-4:** `generateLevel(difficulty)` повертає 5 tasks
- [ ] **AC-5:** Кожен task має payload: `{ a: number, b: number, op: '+' | '−', choices: number[] }`
- [ ] **AC-6:** `op` розподіляється 50/50 між `+` і `−`
- [ ] **AC-7:** Для `+`: `a, b ∈ [0, 10]`, `a + b ≤ 10`
- [ ] **AC-8:** Для `−`: `a ∈ [1, 10]`, `b ∈ [0, a]` (гарантує результат ≥ 0)
- [ ] **AC-9:** `choices` масив з 4 унікальних чисел: 1 correct + 3 distractors ∈ `[max(0, correct−3), correct+3]`, shuffled
- [ ] **AC-10:** Якщо distractors не вдається generate унікально — fallback до random unique у [0, 10]

### Renderer
- [ ] **AC-11:** Створено `src/games/math-expressions/Renderer.tsx`
- [ ] **AC-12:** Показує expression у великому шрифті по центру: `{a} {op} {b} = ?`
- [ ] **AC-13:** Нижче — 4 великі кнопки з `choices`, 2×2 grid
- [ ] **AC-14:** Tap кнопки → `onAnswer(value)` → M10 валідація
- [ ] **AC-15:** При зміні task.id — skip локальний state (немає pending input у цій грі, але кнопки мають reset disabled стан)
- [ ] **AC-16:** `disabled` prop → усі кнопки disabled (з opacity 0.5)
- [ ] **AC-17:** Press feedback: scale 0.97, колір primary на pressed

### Валідатор
- [ ] **AC-18:** `validateAnswer(task, answer)` повертає `{ correct: answer === (op === '+' ? a+b : a−b) }`

### i18n
- [ ] **AC-19:** `game.mathExpressions.name` = "Приклади" / "Expressions"
- [ ] **AC-20:** `game.mathExpressions.rules` — правила коротко (тап на правильну відповідь, 5 прикладів на рівень, зірки/помилки)

### Technical
- [ ] **AC-21:** `npx tsc --noEmit` → 0 errors
- [ ] **AC-22:** Немає змін у `src/games/types.ts`, `M10` contract, або `useGameSession.ts` (contract-stability validation)
- [ ] **AC-23:** Code style match `count-objects/index.ts` (PureJS genrator, no external deps)

## Tasks

### 1. Generator (2h)
- [ ] `src/games/math-expressions/index.ts`
- [ ] Helpers: `generateAddition()`, `generateSubtraction()`, `generateChoices(correct)`
- [ ] `generateLevel` loop

### 2. Renderer (3h)
- [ ] `src/games/math-expressions/Renderer.tsx`
- [ ] Expression display (fontSize 48, fontFamily.extraBold)
- [ ] 2×2 button grid через FlexBox
- [ ] AppText + Pressable з disabled + pressed feedback

### 3. Registry + i18n (1h)
- [ ] `registerGame(mathExpressions)` у `registry.ts`
- [ ] uk/en i18n keys (name, rules, button labels якщо потрібно)

### 4. Manual QA + polish (2h)
- [ ] Прогнати 5 tasks на Expo web → 5 tasks на device
- [ ] Verify distractors не дублюються з correct
- [ ] Verify 🐼 age читабельність (великі кнопки)
- [ ] `tsc --noEmit` + commit

## Дизайн-нотатки

- Кнопки choices — primary background (колір островa `colors.math` якщо є) або `colors.primary`
- Operator `−` відображати як `−` (U+2212 minus sign), НЕ hyphen `-` (візуально тонше)
- Максимальна довжина відповіді — 2 цифри (result ≤ 10 зараз, але distractors можуть бути до 13) → fontSize автошкалується не потрібно
- Expression має бути читабельною через 50cm від планшета (тест 🐼)

## Відкриті питання

- **Q-1:** Чи потрібно зберігати `op` у payload окремо від обчислюваного `correct`? → **Так**, для analytics + debug + validator
- **Q-2:** Distractor strategy — random у ±3 чи "адаптивно під difficulty"? → **MVP: ±3 random**
- **Q-3:** Показувати `= ?` чи просто `=`? → **`= ?` з question mark** — чіткіше що треба ввести

## Definition of Done

- [ ] Усі AC закриті
- [ ] `npx tsc --noEmit` = 0
- [ ] Manual QA 1 повний рівень (5 tasks)
- [ ] Commit: `feat(us-016): M15 Math Expressions MVP — third game via GameDefinition contract`
- [ ] HANDOFF.md оновлений з новим станом

## Related

- **Depends on:** US-012 (M10 Core Game Loop) ✅, US-013 (M14 Count Objects як reference) ✅
- **Blocks:** US-017 (Find unknown), US-018 (Multiplication/Division 🦉), US-020 (Age Group Adaptation M13)
- **BPMN:** [M15 — Математичні приклади](../../../../Obsidian/Obdsidian_2026/10_Projects/Школярик/02_Product/BPMN_Scenarios/M15%20—%20Математичні%20приклади.md)
- **Roadmap reference:** EP-06 Математика (phase 2)
