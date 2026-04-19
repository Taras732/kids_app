---
id: US-041
epic: EP-11
title: M41 Animals Habitat MVP (де живе тварина?)
status: review
priority: High
estimate: 3h
actual: ~1.5h
phase: 2.5
project: Школярик
bpmn: M41
created: 2026-04-19
implemented: 2026-04-19
---

# US-041 — M41 Animals Habitat MVP

**Статус**: `review`
**Пріоритет**: High (перша гра EP-11 Наука — 7-й острів для MVP)
**Оцінка**: 3h (reuse 3-button pattern від emotions-recognize)
**BPMN модулі**: M41 (Тварини) — класифікаційний варіант

## User Story

**Як** дитина 4-7 років,
**я хочу** побачити тварину і вибрати де вона живе (ліс, дім, море),
**щоб** вивчати природу та класифікацію.

**Як** developer,
**я хочу** зареєструвати 7-й острів `science` і 10-у гру без змін у core
(types / M10 / useGameSession / islands),
**щоб** GameDefinition contract витримав ще один домен.

## Скоп

✅ **Контент:** pool з 12 тварин (по 4 на habitat) — fox/bear/owl/deer, dog/cat/cow/horse, fish/octopus/crab/dolphin
✅ **Payload:** `{ target: HabitatId, emoji: string, animalKey: string }`
✅ **3 habitat кнопки:** 🌳 Ліс / 🏠 Дім / 🌊 Море (завжди всі 3, target shuffled порядок не потрібен — завжди 3 опції)
✅ **Validator:** `answer === target`
✅ 5 tasks per level
✅ **Island:** `science`, icon `🔬`
✅ i18n uk/en
✅ Reuse Renderer pattern від emotions-recognize (adapted)

## Виключено

❌ Розширена таксономія (ссавці/птахи/риби) — deferred
❌ Звуки тварин — deferred
❌ Анімація habitat — deferred
❌ Gradient/tint specific colors — surface colors reused

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/animals-habitat/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'animals-habitat'`, `islandId: 'science'`, `icon: '🔬'`
- [ ] **AC-3:** Зареєстровано в `registry.ts`

### Генератор
- [ ] **AC-4:** 5 tasks per level
- [ ] **AC-5:** Payload містить `target`, `emoji`, `animalKey`
- [ ] **AC-6:** Кожен task — random pick тварини з 12-елементного пулу

### Renderer
- [ ] **AC-7:** Велике emoji (104pt) + prompt "Де живе?"
- [ ] **AC-8:** 3 кнопки habitat в горизонтальному ряду
- [ ] **AC-9:** press-lock на 1 відповідь / task
- [ ] **AC-10:** Reset locked state on `task.id` change

### Валідатор
- [ ] **AC-11:** `answer === p.target`

### i18n
- [ ] **AC-12:** `game.animals.name` = "Де живе?" / "Where do they live?"
- [ ] **AC-13:** `game.animals.prompt` = "Де живе ця тварина?" / "Where does this animal live?"
- [ ] **AC-14:** `game.animals.rules`
- [ ] **AC-15:** `game.animals.habitat.{forest,home,sea}` labels

### Technical
- [ ] **AC-16:** `tsc --noEmit` = 0
- [ ] **AC-17:** Zero changes у types.ts, M10, useGameSession.ts, islands.ts

## Tasks
1. Generator + animal pool (0.5h)
2. Renderer (habitat label buttons — emoji + text) (1.5h)
3. Registry + i18n uk/en (0.5h)
4. QA + commit (0.5h)

## Related
- **Depends on:** US-012 ✅
- **Blocks:** US-042..044 (інші M39/M40)
- **BPMN:** M41
- **Roadmap:** EP-11 Наука phase 2.5
