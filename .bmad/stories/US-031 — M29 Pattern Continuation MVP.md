---
id: US-031
epic: EP-09
title: M29 Pattern Continuation MVP (що далі в послідовності?)
status: review
priority: High
estimate: 2h
actual: ~0.75h
phase: 2
project: Школярик
bpmn: M29
created: 2026-04-19
implemented: 2026-04-19
---

# US-031 — M29 Pattern Continuation MVP

**Статус**: `ready`
**Пріоритет**: High (logic island 2-я гра)
**Оцінка**: 2h (pattern reuse)
**BPMN модулі**: M29 (MVP: repeat2 ABAB only, 🐣+🐼 template)

## User Story

**Як** дитина 4-6 років,
**я хочу** побачити послідовність 🔴🔵🔴🔵 і вгадати що буде наступне,
**щоб** тренувати інференс правила (base inductive reasoning).

## Скоп

✅ **Pattern template (MVP):** `repeat2` (ABAB) only
✅ **Pool:** 6 colored circles (🔴🔵🟢🟡🟣🟠)
✅ **Sequence visible:** 4 елементи (ABAB)
✅ **Target:** 5-й (наступний) = A
✅ **Options:** 3 (A correct + 2 distractors з pool)
✅ **Pattern:** scalar answer, single tap (reuse odd-one-out)
✅ 5 tasks per level
✅ **Island:** `logic`, icon `🔢`
✅ i18n uk/en

## Виключено
❌ `repeat3`, `arith`, `fib`, `interleaved` — deferred (post-MVP)
❌ Number sequences 🦊 — deferred
❌ Multi-axis (color+shape+size) — deferred
❌ TTS "Що далі?" — deferred

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/pattern-next/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'pattern-next'`, `islandId: 'logic'`, `icon: '🔢'`
- [ ] **AC-3:** Зареєстровано в `registry.ts`

### Генератор
- [ ] **AC-4:** 5 tasks per level
- [ ] **AC-5:** Payload `{ sequence: string[4], target: string, options: string[3] }`
- [ ] **AC-6:** Sequence = [A, B, A, B] — A ≠ B, обидва з pool
- [ ] **AC-7:** Target = A (next в ABAB pattern)
- [ ] **AC-8:** Options містять target + 2 distractors з pool (не A, не B)
- [ ] **AC-9:** Options shuffled

### Renderer
- [ ] **AC-10:** Sequence row + "?" tile + 3 option buttons
- [ ] **AC-11:** Prompt "Що далі?"
- [ ] **AC-12:** press-lock після 1 відповіді
- [ ] **AC-13:** Reset на `task.id`

### Валідатор
- [ ] **AC-14:** `answer === payload.target`

### i18n
- [ ] **AC-15:** `game.patternNext.name/prompt/rules`

### Technical
- [ ] **AC-16:** tsc = 0
- [ ] **AC-17:** Zero changes у types.ts / M10 / useGameSession / islands.ts

## Related
- **Depends on:** US-012 ✅, US-030 (logic island started) ✅
- **BPMN:** M29 (repeat2 sub-template only)
- **Next in logic:** M31 sort-by-size (array answer), M33 find-diff (spatial)
