---
id: US-037
epic: EP-10
title: M37 Sequence Repeat MVP (повтори послідовність)
status: review
priority: High
estimate: 4h
actual: ~2h
phase: 2
project: Школярик
bpmn: M37
created: 2026-04-19
implemented: 2026-04-19
---

# US-037 — M37 Sequence Repeat MVP

**Статус**: `review`
**Пріоритет**: High (розширення memory island — novel multi-phase pattern)
**Оцінка**: 4h (playback → input state machine + array answer)
**BPMN модулі**: M37 (Послідовність)

## User Story

**Як** дитина 5-7 років,
**я хочу** побачити як загораються кольорові кнопки по черзі і повторити той самий порядок,
**щоб** тренувати короткочасну пам'ять.

**Як** developer,
**я хочу** довести що `GameDefinition` витримує **array-based answer** (sequence of taps),
**щоб** architecture була валідована на навіть складнішому pattern ніж multi-tap memory match.

## Скоп

✅ **Board:** 4 фіксовані кольорові кнопки (red/blue/green/yellow) у 2×2 grid
✅ **Playback phase:** highlight кожну кнопку у sequence по 700ms + 200ms gap → тотал 3.6s для seq=4
✅ **Input phase:** кнопки активні, user tap-ає відповідний порядок
✅ **Sequence length:** 3 (level 1) — фіксовано для MVP, random позиції (повторення дозволені)
✅ **Validator:** `JSON.stringify(answer) === JSON.stringify(payload.sequence)` (exact match array)
✅ 3 tasks per level (менше бо кожен триває ~5 сек total)
✅ **Island:** `memory`, icon `🔢`
✅ **Answer type:** `number[]` (index array)
✅ i18n uk/en

## Виключено
❌ Sound effects при highlight — deferred
❌ Adaptive length (grow with correct) — fixed 3
❌ Failure replay on wrong tap — one shot, wrong = finish with wrong answer
❌ Animation полоска/пульс — simple background color change

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/sequence-repeat/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'sequence-repeat'`, `islandId: 'memory'`, `icon: '🔢'`
- [ ] **AC-3:** Зареєстровано в `registry.ts`

### Генератор
- [ ] **AC-4:** 3 tasks per level
- [ ] **AC-5:** Payload `{ sequence: number[], length: 3 }` — індекси 0..3 (4 buttons)
- [ ] **AC-6:** Random indexes, повторення дозволені

### Renderer
- [ ] **AC-7:** 2×2 grid з 4 кольорових кнопок
- [ ] **AC-8:** Phase 'playback' — buttons disabled, highlight one by one
- [ ] **AC-9:** Phase 'input' — buttons enabled, user tap-ає
- [ ] **AC-10:** Reset phase on `task.id`
- [ ] **AC-11:** No double-submit — submittedRef

### Валідатор
- [ ] **AC-12:** arrays deep equal (JSON stringify acceptable)

### i18n
- [ ] **AC-13:** `game.sequenceRepeat.name` = "Повтори" / "Repeat"
- [ ] **AC-14:** `game.sequenceRepeat.watch` = "Дивись..." / "Watch..."
- [ ] **AC-15:** `game.sequenceRepeat.yourTurn` = "Твоя черга!" / "Your turn!"
- [ ] **AC-16:** `game.sequenceRepeat.rules`

### Technical
- [ ] **AC-17:** tsc = 0
- [ ] **AC-18:** Zero changes у types.ts / M10 / useGameSession.ts / islands.ts

## Tasks
1. Generator (0.5h)
2. Renderer phase state machine (playback/input/done) + timer cleanup (2.5h)
3. 2×2 color grid + highlight animation (0.5h)
4. i18n + registry + QA (0.5h)

## Дизайн-нотатки
- Colors: #EF4444 (red), #3B82F6 (blue), #22C55E (green), #FACC15 (yellow)
- Highlight: opacity 1 + scale 1.05 + brighter border during 700ms
- Normal: opacity 0.75
- Playback timing: 700ms on + 200ms off per step

## Related
- **Depends on:** US-012 ✅, US-036 ✅ (established multi-tap pattern)
- **BPMN:** M37
- **Roadmap:** EP-10 Пам'ять phase 2
