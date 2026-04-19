---
id: US-049
epic: EP-13
title: M47 Color Find MVP (знайди колір)
status: review
priority: High
estimate: 2h
actual: ~1h
phase: 2.5
project: Школярик
bpmn: M47
created: 2026-04-19
implemented: 2026-04-19
---

# US-049 — M47 Color Find MVP

**Статус**: `review`
**Пріоритет**: High (перша гра EP-13 Творчість — 8-й острів, повний MVP set)
**Оцінка**: 2h (reuse 4-button pattern)
**BPMN модулі**: M47 (Кольори)

## User Story

**Як** дитина 3-5 років,
**я хочу** навчитися впізнавати базові кольори,
**щоб** розрізняти їх у творчих завданнях.

## Скоп

✅ **Pool:** 6 кольорів — red, blue, green, yellow, purple, orange
✅ **Task:** target color + 4 swatches (target + 3 distractors)
✅ **Swatches:** Round colored Views (View з borderRadius:50% — фактично size/2)
✅ **Prompt:** "Знайди {color_name}"
✅ **Validator:** `answer === target`
✅ 5 tasks per level
✅ **Island:** `creativity`, icon `🎨`
✅ i18n uk/en

## Виключено
❌ Градієнти — deferred
❌ Темно-/світло-відтінки — deferred (плутанина)
❌ Color naming (user types) — tap only

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/colors-find/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'colors-find'`, `islandId: 'creativity'`, `icon: '🎨'`
- [ ] **AC-3:** Зареєстровано в `registry.ts`

### Генератор
- [ ] **AC-4:** 5 tasks / level
- [ ] **AC-5:** Payload `{ target: ColorId, candidates: ColorId[] }`
- [ ] **AC-6:** 4 candidates (target + 3 distractors), shuffle

### Renderer
- [ ] **AC-7:** 2x2 grid Pressable swatches
- [ ] **AC-8:** Prompt з color name i18n (uk/en)
- [ ] **AC-9:** press-lock + reset on task.id

### Валідатор
- [ ] **AC-10:** `answer === target`

### i18n
- [ ] **AC-11:** `game.colors.name`, `prompt`, `rules`, `names.{red,blue,green,yellow,purple,orange}`

### Technical
- [ ] **AC-12:** tsc = 0
- [ ] **AC-13:** Zero changes у types.ts, M10, useGameSession.ts, islands.ts

## Tasks
1. Generator (0.5h)
2. Renderer 2x2 swatch grid (1h)
3. i18n + registry + QA (0.5h)

## Related
- **Depends on:** US-012 ✅
- **BPMN:** M47
- **Roadmap:** EP-13 Творчість phase 2.5
