---
id: US-027
epic: EP-08
title: M25 ABC Find Letter EN MVP
status: review
priority: High
estimate: 2h
actual: ~0.5h
phase: 2
project: Школярик
bpmn: M25
created: 2026-04-19
implemented: 2026-04-19
---

# US-027 — M25 ABC Find Letter EN MVP

**Статус**: `ready`
**Пріоритет**: High (перша гра EP-08 English — четвертий острів для MVP)
**Оцінка**: 2h (reuse `letters-find` pattern з EN pool)
**BPMN модулі**: M25 (ABC find letter — English)

## User Story

**Як** дитина 4-7 років, яка починає вивчати англійську,
**я хочу** знаходити латинські літери за назвою,
**щоб** засвоювати ABC.

## Скоп

✅ **EN pool:** A B C D E F G H I J K L M N O P Q R S T (20 літер)
✅ **Prompt:** "Find the letter {letter}"
✅ **4 candidates, 2×2 grid, 5 tasks**
✅ **Island:** `english`
✅ **Locale-agnostic:** prompt завжди EN (бо це English-only гра)

## Виключено

❌ **TTS pronunciation** — M27 окремо
❌ **Lowercase**, **phonics**, **words**
❌ **Image/object associations** ("A is for Apple")

## Acceptance Criteria

- [ ] **AC-1:** `src/games/letters-find-en/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'letters-find-en'`, `islandId: 'english'`, `icon: '🔠'`
- [ ] **AC-3:** Зареєстровано у `registry.ts`
- [ ] **AC-4:** 5 tasks, pool 20 EN letters, 4 unique candidates
- [ ] **AC-5:** Reuse Renderer з `letters-find` (same layout/props)
- [ ] **AC-6:** i18n: `game.lettersEn.{name, prompt, rules}` — all EN copy
- [ ] **AC-7:** Validator: `answer === target`
- [ ] **AC-8:** `tsc --noEmit` = 0

## Tasks

1. Create `src/games/letters-find-en/index.ts` (copy + adapt) (0.5h)
2. Import Renderer from `letters-find` OR copy-and-adapt prompt key (0.5h)
3. Registry + i18n (0.5h)
4. QA + commit (0.5h)

## Related

- **Depends on:** US-021 (letters-find pattern) ✅
- **BPMN:** M25
- **Roadmap:** EP-08 English phase 2
