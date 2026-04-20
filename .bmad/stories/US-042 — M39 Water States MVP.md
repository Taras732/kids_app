---
id: US-042
epic: EP-11
title: M39 Water States MVP (стани речовини)
status: ready
priority: High
estimate: 1.5h
phase: 2.5
project: Школярик
bpmn: M39
created: 2026-04-20
---

# US-042 — M39 Water States MVP

**Статус**: `ready`
**BPMN**: M39 — Вода (стани речовини). MVP scope = simplified classification, не full experiment.

## User Story

**Як** дитина 4-7 років,
**я хочу** побачити предмет і вибрати його стан (тверде / рідке / газ),
**щоб** зрозуміти агрегатні стани речовини.

## Scope (MVP)

BPMN M39 пропонує інтерактивний експеримент (rain → puddle, ice ↔ water ↔ steam, molecules) — для MVP скорочуємо до classification quiz.

✅ **Pool 9 items** (3 per state):
  - Тверде 🧊 (solid): 🧊 лід, ❄️ сніг, 🏔️ айсберг
  - Рідке 💧 (liquid): 💧 вода, 🌊 море, ☔ дощ
  - Газ 💨 (gas): ☁️ хмара, 💨 пара, 🌫️ туман
✅ **3 buttons:** 🧊 Тверде / 💧 Рідке / 💨 Газ
✅ 5 tasks per level
✅ **Island:** `science`, icon `🔬`
✅ Reuse 3-button pattern від `animals-habitat`
✅ i18n uk/en

## Виключено

❌ Phase transition animations (M39 🐼 slider)
❌ Water cycle schema (M39 🦊)
❌ Molecule simulation (M39 🦉)
❌ Free exploration mode, quiz, journal
❌ TTS narration

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/water-states/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'water-states'`, `islandId: 'science'`, `icon: '🔬'`
- [ ] **AC-3:** Зареєстровано в `registry.ts`

### Generator
- [ ] **AC-4:** 5 tasks per level
- [ ] **AC-5:** Payload: `{ target: StateId, emoji: string, itemKey: string }`
- [ ] **AC-6:** `StateId = 'solid' | 'liquid' | 'gas'`
- [ ] **AC-7:** Task = random pick з 9-pool, без повторів у рівні

### Renderer
- [ ] **AC-8:** Великий item emoji (104pt) + prompt "Який це стан?"
- [ ] **AC-9:** 3 state buttons у horizontal row (flex:1) з emoji + label
- [ ] **AC-10:** Press-lock + reset on `task.id`

### Validator
- [ ] **AC-11:** `answer === p.target`

### i18n
- [ ] **AC-12:** `game.waterStates.name` = "Стани води" / "Water states"
- [ ] **AC-13:** `game.waterStates.prompt`
- [ ] **AC-14:** `game.waterStates.rules`
- [ ] **AC-15:** `game.waterStates.states.{solid,liquid,gas}`

### Technical
- [ ] **AC-16:** `tsc --noEmit` = 0
- [ ] **AC-17:** Zero changes у core (types.ts / M10 / useGameSession / islands.ts)

## Related
- **Depends on:** US-012 ✅, US-041 (3-button pattern) ✅
- **BPMN:** M39
- **Roadmap:** EP-11 Наука phase 2.5
