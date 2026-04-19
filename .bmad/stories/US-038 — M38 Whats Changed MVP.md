---
id: US-038
epic: EP-10
title: M38 What's Changed MVP (що змінилося?)
status: review
priority: High
estimate: 3h
actual: ~1.5h
phase: 2
project: Школярик
bpmn: M38
created: 2026-04-19
implemented: 2026-04-19
---

# US-038 — M38 What's Changed MVP

**Статус**: `review`
**Пріоритет**: High (memory island 3-я гра, новий memorize→detect pattern)
**Оцінка**: 3h (2-phase state machine без input playback)
**BPMN модулі**: M38 (Що змінилося)

## User Story

**Як** дитина 5-7 років,
**я хочу** спочатку побачити 4 предмети, потім побачити як один змінився, і тапнути змінений,
**щоб** тренувати візуальну пам'ять і увагу до деталей.

## Скоп

✅ **Board:** 2×2 grid з 4 emoji
✅ **Phase 1 memorize:** 2000ms — показуємо `before[]`
✅ **Phase 2 detect:** показуємо `after[]` — один emoji замінений (інший з pool)
✅ **Validator:** `answer === changedIndex`
✅ 5 tasks per level
✅ **Island:** `memory`, icon `👁️`
✅ i18n uk/en

## Виключено
❌ Аудіо сигнал переходу — deferred
❌ Countdown visual — simple phase switch
❌ >1 зміна — exactly 1 for MVP

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/whats-changed/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'whats-changed'`, `islandId: 'memory'`, `icon: '👁️'`
- [ ] **AC-3:** Зареєстровано в `registry.ts`

### Генератор
- [ ] **AC-4:** 5 tasks per level
- [ ] **AC-5:** Payload `{ before: string[], after: string[], changedIndex: number }`
- [ ] **AC-6:** 4 emoji у before; after[changedIndex] = random з pool, що НЕ є в before
- [ ] **AC-7:** Pool ≥ 12 emoji

### Renderer
- [ ] **AC-8:** 2×2 grid з emoji
- [ ] **AC-9:** Phase 'memorize' — tap disabled, show `before`, show prompt "Запам'ятай!"
- [ ] **AC-10:** Phase 'detect' — tap enabled, show `after`, prompt "Що змінилося?"
- [ ] **AC-11:** Reset phase on `task.id`
- [ ] **AC-12:** press-lock після 1 відповіді

### Валідатор
- [ ] **AC-13:** `answer === payload.changedIndex`

### i18n
- [ ] **AC-14:** `game.whatsChanged.name/memorize/detect/rules`

### Technical
- [ ] **AC-15:** tsc = 0
- [ ] **AC-16:** Zero changes у types.ts / M10 / useGameSession / islands.ts

## Related
- **Depends on:** US-012 ✅
- **BPMN:** M38
