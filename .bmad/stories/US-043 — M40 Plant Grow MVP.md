---
id: US-043
epic: EP-11
title: M40 Plant Grow MVP (що далі у рості?)
status: ready
priority: High
estimate: 1.5h
phase: 2.5
project: Школярик
bpmn: M40
created: 2026-04-20
---

# US-043 — M40 Plant Grow MVP

**Статус**: `ready`
**BPMN**: M40 — Рослини (ріст). MVP scope = stage-ordering quiz, не care-observe loop.

## User Story

**Як** дитина 4-7 років,
**я хочу** побачити поточну стадію рослини і обрати що буде далі,
**щоб** зрозуміти причинно-наслідковий зв'язок зростання.

## Scope (MVP)

BPMN M40 пропонує повноцінний time-lapse care-observe ("drag sun + water, витрачай час, спостерігай") — для MVP скорочуємо до "what's next?" stage quiz, як sequence-next mini-game.

✅ **5 stages:** 🌰 seed → 🌱 sprout → 🌿 leafy → 🌷 bloom → 🍎 fruit
✅ **Payload:** `{ currentStage: StageId, target: StageId, emoji: string, candidates: StageId[] }`
✅ **3 stage buttons** (currentStage виключено з candidates) з emoji
✅ 4 tasks per level (бо 5 стадій даёт 4 transitions)
✅ **Island:** `science`, icon `🔬`
✅ Reuse 3-button pattern
✅ i18n uk/en з назвами стадій

## Виключено

❌ Care loop (sun+water drag)
❌ Withering negative branch
❌ Photosynthesis mode (M40 🦊)
❌ Label-parts quiz (M40 🦉)
❌ Gallery "My garden"
❌ Timer-based growth

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/plant-grow/index.ts` exports `GameDefinition`
- [ ] **AC-2:** `id: 'plant-grow'`, `islandId: 'science'`, `icon: '🔬'`
- [ ] **AC-3:** Registered у `registry.ts`

### Generator
- [ ] **AC-4:** 4 tasks per level (transitions 0→1, 1→2, 2→3, 3→4)
- [ ] **AC-5:** Payload: `{ currentStage, target, currentEmoji, candidates[] }`
- [ ] **AC-6:** `StageId = 'seed' | 'sprout' | 'leafy' | 'bloom' | 'fruit'`
- [ ] **AC-7:** `candidates` = 3 items: target + 2 distractors (не поточна стадія)
- [ ] **AC-8:** `candidates` shuffled

### Renderer
- [ ] **AC-9:** Великий current emoji (104pt) + "→ ?" arrow + prompt "Що далі?"
- [ ] **AC-10:** 3 stage emoji buttons у row (horizontal)
- [ ] **AC-11:** Press-lock + reset on `task.id`

### Validator
- [ ] **AC-12:** `answer === p.target`

### i18n
- [ ] **AC-13:** `game.plantGrow.name` = "Як росте?" / "How it grows?"
- [ ] **AC-14:** `game.plantGrow.prompt`
- [ ] **AC-15:** `game.plantGrow.rules`
- [ ] **AC-16:** `game.plantGrow.stages.{seed,sprout,leafy,bloom,fruit}`

### Technical
- [ ] **AC-17:** `tsc --noEmit` = 0
- [ ] **AC-18:** Zero changes у core

## Related
- **Depends on:** US-012 ✅, US-041 ✅
- **BPMN:** M40
- **Roadmap:** EP-11 Наука phase 2.5
