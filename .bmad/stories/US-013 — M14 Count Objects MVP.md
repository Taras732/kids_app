---
id: US-013
epic: EP-06
title: M14 Count Objects MVP
status: ready
priority: High
estimate: 10h
phase: 2
project: Школярик
bpmn: M14
created: 2026-04-15
---

# US-013 — M14 Count Objects MVP

**Статус**: `ready`
**Пріоритет**: High (перша справжня гра — валідація M10 contract)
**Оцінка**: 10h
**BPMN модулі**: M14 (Порахуй предмети) — MVP subset

## User Story

**Як** дитина 6-8 років (ageGroup 🦊),
**я хочу** рахувати яблука на екрані та вводити відповідь цифрами,
**щоб** тренувати рахунок і отримувати XP/зірки за правильні відповіді.

**Як** developer,
**я хочу** реалізувати першу справжню гру через `GameDefinition` contract з M10,
**щоб** перевірити чи plugin-архітектура витримує гру з reward-UI (keypad), а не тільки tap-гру (як tap-the-dot).

## Скоп (що ВХОДИТЬ у US-013)

✅ **HP.1-HP.12** з M14 — повний happy path (render → count → keypad → validate → feedback → loop)
✅ **E1** — keypad input clamp (не можна ввести число поза діапазоном age group)
✅ Один режим: `inputMode = keypad` (цифри + Delete + OK)
✅ Один theme: `apples` (🍎) — одна iconка з pool
✅ Один ageGroup: `🦊` (6-8 років) — range `[1,20]`, 5 tasks per level
✅ Difficulty = 1.0 (static, без M12 адаптації)
✅ Random-layout предметів на playfield (без overlap — min-distance algorithm)
✅ Integration з M10 `useGameSession` і M50 `progressStore.addXp`
✅ Cross-platform: iOS / Android / Web
✅ i18n uk/en

## Виключено (НЕ робимо у US-013 — окремі US)

❌ Age groups 🐣 (toddler subitize), 🐼 (preschool 1-10), 🦉 (1-100) → US-020 (M13 age adaptation)
❌ A1 Drag-to-basket режим → US-021
❌ A2 Tap-each-then-answer з count aloud → US-022 (потребує TTS)
❌ A3 Voice input (speech-to-text) → US-023 (потребує mic permission)
❌ A4 Distractor filter (яблука + груші) → US-024
❌ A5 Subitize speed mode (2s reveal) → US-025
❌ A6 Multi-type count (bridge до M15) → US-026
❌ A7 Hint (маскот-підказка) → US-013 окремо не робимо тут
❌ Themes окрім apples (зірочки, рибки, квіти, машинки) → додаватимемо пізніше
❌ TTS озвучка ("Порахуй скільки яблук") → US-019 (voice assets)
❌ E2 Multi-touch → M10 Pressable вже handle
❌ E3 Soft hint після 2 помилки → US-022
❌ E4 STT fail fallback → US-023
❌ E5 Grid-layout для 100 предметів → не потрібно для range [1,20]
❌ E6 Rage-tap detection → не актуально в keypad mode
❌ E7 Pool exhausted rotation → один theme, не потрібно

## Acceptance Criteria

### Гра-плагін
- [ ] **AC-1:** Створено `src/games/count-objects/` з `index.ts` (GameDefinition) та `Renderer.tsx`
- [ ] **AC-2:** `GameDefinition`:
  - `id: 'count-objects'`, `islandId: 'math'`, `name: 'game.countObjects.name'`
  - `icon: '🍎'`, `rulesKey: 'game.countObjects.rules'`
  - `generateLevel(difficulty)` повертає 5 tasks, кожен з `correctCount ∈ [1,20]` (uniformly random)
  - `validateAnswer(task, answer: number)` — `correct: answer === task.correctCount`
- [ ] **AC-3:** Task payload включає: `itemKey: 'apple'`, `correctCount: number`, `positions: {x, y}[]` (pre-computed random layout з min-distance 8% довжини playfield)
- [ ] **AC-4:** Гра зареєстрована в `src/games/registry.ts`, з'являється в списку ігор острова `math`

### Renderer UI
- [ ] **AC-5:** Playfield рендерить `correctCount` emoji 🍎 у pre-computed позиціях (з payload), кожен sprite — 48×48 px (mobile) / scale per age group пізніше
- [ ] **AC-6:** Під playfield — NumberKeypad: 9 цифр (1-9 grid 3×3) + "0" + Delete (⌫) + OK. Поточний input показаний великим шрифтом у рамці.
- [ ] **AC-7:** Натискання цифри додає її до input рядка. Максимум 2 цифри (range [1,20], але UI clamp до 2 digit). Кнопка "0" не може бути першим digit.
- [ ] **AC-8:** Delete (⌫) видаляє останній digit. OK відправляє answer у `onAnswer(parseInt(input))`. OK disabled якщо input порожній.
- [ ] **AC-9:** Після submit — input очищається (незалежно від correct/wrong).

### Integration з M10
- [ ] **AC-10:** Відкриття гри через Math island → tap на "Порахуй предмети" → `useGameSession('count-objects')` стартує flow
- [ ] **AC-11:** Correct feedback → наступне task (M10 reducer обробляє). Wrong → той самий task з очищеним keypad.
- [ ] **AC-12:** Після 5 tasks → finish phase → game-result screen з stars/XP (з M10)
- [ ] **AC-13:** `math` острів тепер має 2 гри: `tap-the-dot` і `count-objects` (через `listGamesByIsland('math')`)

### E1 — Input clamp
- [ ] **AC-14:** Спроба ввести 3 digit (e.g. "200") → третій digit блокується, input залишається "20"
- [ ] **AC-15:** Спроба ввести число > 20 (e.g. "25" → clamp до "20") — **скасовано, не ставимо**. Натомість просто обмежуємо максимум 2 digits, не значення. Validator перевіряє точну рівність, тому "25" !== correctCount у [1,20] все одно дає wrong.

### Cross-platform
- [ ] **AC-16:** Web: keypad кнопки — Pressable (не web-only HTML input)
- [ ] **AC-17:** Всі тексти через `t()`, ключі додано в `uk.json` + `en.json` (`game.countObjects.{name, rules, question}`)

### Якість
- [ ] **AC-18:** `npx tsc --noEmit` — 0 нових помилок
- [ ] **AC-19:** Всі кольори/spacing з `theme.ts`
- [ ] **AC-20:** Random-layout алгоритм не дає overlap (dist between predмets > 2 × sprite size)

## Tasks

### Day 1 — Генератор + Renderer skeleton (~4h)
1. [ ] Створити `src/games/count-objects/index.ts` — `GameDefinition` з `generateLevel` (random count + min-distance layout)
2. [ ] Створити `src/games/count-objects/Renderer.tsx` — skeleton playfield + positions render
3. [ ] Зареєструвати в `registry.ts`

### Day 2 — NumberKeypad + integration (~4h)
4. [ ] Створити `src/components/game/NumberKeypad.tsx` — reusable (буде потрібен для M15 теж)
5. [ ] Інтегрувати NumberKeypad у Renderer, обробка input state
6. [ ] Додати question header "Скільки яблук?" над playfield

### Day 3 — i18n + polish + manual test (~2h)
7. [ ] Додати i18n ключі `game.countObjects.{name, rules, question}` в `uk.json` + `en.json`
8. [ ] Manual test flow: Hub → Math Island → Count Objects → 5 tasks з правильним mix correct/wrong → Result
9. [ ] `npx tsc --noEmit`

## Технічні нотатки

### Файли що зачіпаються
- **Створюються:** `src/games/count-objects/{index.ts, Renderer.tsx}`, `src/components/game/NumberKeypad.tsx`
- **Змінюються:** `src/games/registry.ts` (+ import), `src/i18n/{uk,en}.json`
- **НЕ зачіпаємо:** `useGameSession`, `types.ts`, `GameDefinition` contract — перша перевірка що contract витримує нову гру без змін

### Архітектурні рішення
- **NumberKeypad** — окремий reusable компонент у `src/components/game/`, бо знадобиться в M15 (math expressions), M16 (числа), пізніше
- **Min-distance layout** — алгоритм `rejection sampling`: рандомна позиція, якщо дистанція до всіх існуючих < minDist → пересемплювати (max 20 спроб, потім fall through)
- **positions pre-compute у payload** — щоб re-render не перемішував layout (стабільне UI під час tap-counting)
- **range [1,20] для 🦊** — відповідає Pre-3 з BPMN M14

### Розрахунок min-distance
```
playfield ~ 300×400 (mobile portrait)
sprite = 48×48
minDist = sprite * 1.3 = ~62 px
max count = 20 sprites → 20 × π × 31² / (300×400) ≈ 50% field — feasible
```

### Cross-platform pitfalls
- Pressable у numeric keypad — `onPress` з child Text, НЕ `onClick`
- `Pressable` accessibility: `accessibilityRole="button"`, `accessibilityLabel={digit}`
- Playfield emoji: `<AppText style={{ fontSize: 40 }}>🍎</AppText>` у absolute positions

### Залежності від існуючого коду
- `useGameSession`, `getGame`, `registerGame` — уже є (US-012)
- `GameHeader`, `FeedbackOverlay` — M10 UI уже є
- `progressStore.addXp` — уже підключено в `game/[id].tsx`
- `ConfirmModal` для rules — уже працює

### Що НЕ робити (anti-scope-creep)
- НЕ малювати кастомні sprites — emoji 🍎 для MVP
- НЕ додавати distractors / другі типи предметів
- НЕ робити drag-to-basket
- НЕ підключати TTS
- НЕ робити adaptive difficulty — static 1.0
- НЕ робити hint (A7) — окрема US пізніше
- НЕ робити tap-each counting — окрема US (потребує sound)

## QA Notes

[Заповнює QA після /dev + self-report від /dev]

---

## Питання до /pm перед стартом

1. **Q-1:** Тільки 🦊 (6-8) age group для MVP — потім розширимо на 🐼 (1-10) і 🦉 (1-100)? Підтверджуємо що не підключаємо M13 у цій story? (Погоджено: так, без M13)
2. **Q-2:** NumberKeypad — окремий компонент у `src/components/game/` чи inside `count-objects/`? (Погоджено: окремий, буде reusable для M15/M16)
3. **Q-3:** Q1 з BPMN "count aloud toggle" — скіпаємо до US-022 (потребує TTS). ОК?

## Зв'язки

- BPMN: [M14 — Порахуй предмети](../../../../Obsidian/Obdsidian_2026/10_Projects/Школярик/02_Product/BPMN_Scenarios/M14%20—%20Порахуй%20предмети.md) — source of truth
- Epic: EP-06 🔢 Математика (US-016..US-020 в README беклозі — перенумеровується під актуальний прогрес)
- Попередня US: US-012 (M10 — generic loop, вже review)
- Наступні (excluded scope): US-020 (M13 age adaptation), US-021 (A1 drag), US-022 (A2 TTS counting), US-023 (A3 voice), US-024 (A4 distractors)
- Calls (via M10): M11 (тут inline у `generateLevel`), M50 (XP addXp)
