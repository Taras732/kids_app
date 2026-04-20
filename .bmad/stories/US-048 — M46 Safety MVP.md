---
id: US-048
epic: EP-12
title: M46 Safety MVP (можна / не можна / спитай)
status: ready
priority: High
estimate: 1.5h
phase: 2.5
project: Школярик
bpmn: M46
created: 2026-04-20
---

# US-048 — M46 Safety MVP

**Статус**: `ready`
**BPMN**: M46 — Безпека. MVP scope = 🐣 physical safety classification, 3-button.

## User Story

**Як** дитина 3-8 років,
**я хочу** побачити предмет або ситуацію і вирішити "можна / не можна / спитай дорослого",
**щоб** вчитися базовій фізичній безпеці.

## Scope (MVP)

BPMN M46 — містить 4 рівні (🐣 physical, 🐼 road/strangers, 🦊 internet, 🦉 cyberbullying). Для MVP — **тільки 🐣** (найсафтіший для launch без child-safety advisor review).

✅ **Pool 12 items**, класифіковані:
  - Небезпечно (unsafe): 🔥 вогонь, 🔪 ніж, ⚡ розетка, 💊 пігулки, 🧪 хімія, 🍾 скло
  - Безпечно (safe): 🧸 ведмедик, 🍎 яблуко, 📚 книга, 🖍️ олівці, 🧃 сік, 🎨 фарби
  - (опц. для variety) "Спитай дорослого" — хоча для 🐣 MVP скіпнемо цю категорію
✅ **2-button:** ✓ Можна / ✗ Не можна
  - Pragmatically pick **2-button** для MVP — proste, clear, без моральної ambiguity
✅ 5 tasks per level
✅ **Island:** `emotions`, icon `💚`
✅ **Pattern:** reuse 2-button від `sink-float` (US-044)
✅ i18n uk/en
✅ **Важливо:** БЕЗ child-safety advisor review → тільки universal home-kid items, без strangers/online/violence

## Виключено

❌ Road safety scenarios (🐼)
❌ Stranger-danger (🐼)
❌ Internet safety (🦊)
❌ Cyberbullying (🦉)
❌ Parental theme lock / intro gate
❌ Escalation detection
❌ Emergency dialing simulation (A5)
❌ Content OTA update
❌ Parent-blocked themes

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/safety-basic/index.ts` exports `GameDefinition`
- [ ] **AC-2:** `id: 'safety-basic'`, `islandId: 'emotions'`, `icon: '💚'`
- [ ] **AC-3:** Registered у `registry.ts`

### Generator
- [ ] **AC-4:** 5 tasks per level з 12-pool
- [ ] **AC-5:** Payload: `{ target: 'safe' | 'unsafe', emoji, itemKey }`
- [ ] **AC-6:** Balanced pool (≥40% safe per level)

### Renderer
- [ ] **AC-7:** Великий item emoji (104pt) + prompt "Можна торкатись?"
- [ ] **AC-8:** 2 buttons horizontal: ✓ Можна / ✗ Не можна
- [ ] **AC-9:** Press-lock + reset on `task.id`

### Validator
- [ ] **AC-10:** `answer === p.target`

### i18n
- [ ] **AC-11:** `game.safety.name` = "Безпека" / "Safety"
- [ ] **AC-12:** `game.safety.prompt`
- [ ] **AC-13:** `game.safety.rules`
- [ ] **AC-14:** `game.safety.options.{safe,unsafe}`

### Technical
- [ ] **AC-15:** `tsc --noEmit` = 0
- [ ] **AC-16:** Zero changes у core

## Related
- **Depends on:** US-012 ✅, US-044 (2-button pattern)
- **BPMN:** M46
- **Roadmap:** EP-12 Емоції phase 2.5
- **Risk:** content-sensitive topic → MVP uses тільки universal/conservative items. Phase 2+ потребує child-safety advisor review.
