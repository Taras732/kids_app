---
id: US-023
epic: EP-07
title: M23 Syllable Build MVP (склади склад)
status: review
priority: High
estimate: 2h
actual: ~1h
phase: 2
project: Школярик
bpmn: M23
created: 2026-04-19
implemented: 2026-04-19
---

# US-023 — M23 Syllable Build MVP

**Статус**: `ready`
**Пріоритет**: High (letters island 2-я гра, розширення EP-07)
**Оцінка**: 2h (tap-from-options pattern reuse)
**BPMN модулі**: M23 (A1 alternative: tap-from-options, без drag та audio)

## User Story

**Як** дитина 5-7 років,
**я хочу** побачити приголосну "М" і обрати правильну голосну щоб скласти склад "МА",
**щоб** тренувати базові склади для читання.

## Скоп

✅ **Pattern:** `letters-find` reuse — scalar answer, single tap
✅ **Payload:** `{ consonant: 'М', targetVowel: 'А', options: ['А', 'О', 'У', 'И'] }`
✅ **UI:** consonant-slot + [?] empty-slot + 4 vowel-buttons знизу
✅ **Validator:** `answer === options.indexOf(targetVowel)`
✅ 5 tasks per level
✅ **Island:** `letters`, icon `🧩`
✅ i18n uk/en

## Виключено
❌ TTS/audio — deferred
❌ Drag-and-drop — deferred (використовуємо tap)
❌ Chain-to-word (🦊 sub-mode) — окрема story
❌ Stressed syllable (🦉) — окрема story
❌ Syllable mastery tracking — deferred

## Syllable Pool (MVP)

Consonants: М, Б, П, Т, Д, Н, К, Г, Л, Р, С, З, В, Ф, Ш, Ж, Ч, Х (18 літер)
Vowels: А, О, У, И, Е, І (6)
Total pool: 18×6 = 108 syllables

Кожна задача = 1 consonant + 1 target vowel + 3 distractor vowels.

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/syllable-build/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'syllable-build'`, `islandId: 'letters'`, `icon: '🧩'`
- [ ] **AC-3:** Зареєстровано в `registry.ts`

### Генератор
- [ ] **AC-4:** 5 tasks per level
- [ ] **AC-5:** Payload `{ consonant: string, targetVowel: string, options: string[4] }`
- [ ] **AC-6:** Target vowel є у options (на випадковій позиції)
- [ ] **AC-7:** Distractor = 3 інші голосні з VOWELS pool

### Renderer
- [ ] **AC-8:** Horizontal row: consonant-tile + "?" slot
- [ ] **AC-9:** 4 vowel-buttons у row або 2×2 grid
- [ ] **AC-10:** Prompt "Склади склад {consonant}{targetVowel}" (uk) / "Build syllable ..." (en)
- [ ] **AC-11:** press-lock після 1 відповіді
- [ ] **AC-12:** Reset на `task.id`

### Валідатор
- [ ] **AC-13:** `answer === options.indexOf(targetVowel)`

### i18n
- [ ] **AC-14:** `game.syllableBuild.name/prompt/rules`

### Technical
- [ ] **AC-15:** tsc = 0
- [ ] **AC-16:** Zero changes у types.ts / M10 / useGameSession / islands.ts

## Tasks
1. Gen + pool + index.ts (0.5h)
2. Renderer (consonant tile + slot + vowel buttons) (1h)
3. i18n + QA + commit (0.5h)

## Related
- **Depends on:** US-012 ✅, US-021 (letters-find pattern) ✅
- **BPMN:** M23 (A1 alternative sub-mode)
- **Next in letters:** M24 word-build (chain), M22 phonemic (audio)
