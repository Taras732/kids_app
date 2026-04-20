---
id: US-044
epic: EP-11
title: M42 Sink Float MVP (тоне чи плаває?)
status: ready
priority: High
estimate: 1.5h
phase: 2.5
project: Школярик
bpmn: M42
created: 2026-04-20
---

# US-044 — M42 Sink Float MVP

**Статус**: `ready`
**BPMN**: M42 — Фізика (важке/легке, тоне, магніти, механізми). MVP scope = sink/float prediction, binary.

## User Story

**Як** дитина 4-7 років,
**я хочу** передбачити чи потоне предмет у воді, чи попливе,
**щоб** вчитися гіпотезі та перевірці.

## Scope (MVP)

BPMN M42 пропонує 4 sub-modes (важке/легке, sink/float, магніти, механізми) — для MVP беремо тільки 🐼 sink/float як найпростіший predict-observe pattern. 2-button binary classification (перший 2-button плагін у грі).

✅ **Pool 12 objects:**
  - Тоне (sinks, density > 1): 🔨 hammer, 🗝️ key, 🪨 rock, 🔩 bolt, ⚓ anchor, 🥄 spoon (metal)
  - Плаває (floats, density < 1): 🦆 duck, 🍃 leaf, 🪵 wood, 🛟 ring, 🪶 feather, 🧊 ice
✅ **Payload:** `{ target: 'sink' | 'float', emoji, itemKey }`
✅ **2 buttons:** ⬇ Тоне / ⬆ Плаває (horizontal, flex:1)
✅ 5 tasks per level
✅ **Island:** `science`, icon `🔬`
✅ i18n uk/en

## Виключено

❌ Prediction-before-drop UX (BPMN 🐼 A)
❌ Weight sort mode (🐣)
❌ Magnets mode (🦊)
❌ Simple machines / lever puzzle (🦉)
❌ Physics animation (splash / floating motion)
❌ Free exploration mode
❌ Real-world facts overlay

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/sink-float/index.ts` exports `GameDefinition`
- [ ] **AC-2:** `id: 'sink-float'`, `islandId: 'science'`, `icon: '🔬'`
- [ ] **AC-3:** Registered у `registry.ts`

### Generator
- [ ] **AC-4:** 5 tasks per level
- [ ] **AC-5:** Payload: `{ target, emoji, itemKey }`
- [ ] **AC-6:** `FloatState = 'sink' | 'float'`
- [ ] **AC-7:** Balanced pool (сумарно ≥50% float per level, не всі 5 однакові)

### Renderer
- [ ] **AC-8:** Великий item emoji (104pt) + prompt "Тоне чи плаває?"
- [ ] **AC-9:** 2 buttons у horizontal row (flex:1 each), одна — ⬇ Тоне, друга — ⬆ Плаває
- [ ] **AC-10:** Press-lock + reset on `task.id`

### Validator
- [ ] **AC-11:** `answer === p.target`

### i18n
- [ ] **AC-12:** `game.sinkFloat.name` = "Тоне чи плаває?" / "Sink or float?"
- [ ] **AC-13:** `game.sinkFloat.prompt`
- [ ] **AC-14:** `game.sinkFloat.rules`
- [ ] **AC-15:** `game.sinkFloat.options.{sink,float}`

### Technical
- [ ] **AC-16:** `tsc --noEmit` = 0
- [ ] **AC-17:** Zero changes у core

## Related
- **Depends on:** US-012 ✅
- **New pattern:** перший 2-button renderer. Можливо буде reused для M46 Safety.
- **BPMN:** M42
- **Roadmap:** EP-11 Наука phase 2.5
