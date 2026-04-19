---
id: US-028
epic: EP-08
title: M26 English Word Picture MVP (see-picture-pick-word)
status: review
priority: High
estimate: 2h
actual: ~0.75h
phase: 2
project: Школярик
bpmn: M26
created: 2026-04-20
implemented: 2026-04-20
---

# US-028 — M26 English Word Picture MVP

**Статус**: `ready`
**Пріоритет**: High (english island 2-я гра)
**Оцінка**: 2h (pattern reuse — scalar 3-option)
**BPMN модулі**: M26 (MVP: `see-picture-pick-word`, без audio)

## User Story

**Як** дитина 5-7 років,
**я хочу** побачити емоджі 🐱 і обрати слово "cat" серед трьох варіантів,
**щоб** вивчити базові англійські слова.

## Скоп

✅ **Sub-mode:** `see-picture-pick-word` only
✅ **Pool:** 20 emoji-word pairs (animals, food, objects, nature, family)
✅ **Payload:** `{ picture, word, options[3] }`
✅ **Pattern:** scalar answer, 3 options — reuse emotions-recognize
✅ 5 tasks per level
✅ **Island:** `english`, icon `🔤`
✅ i18n uk/en (prompt)

## Виключено
❌ `listen-then-pick-picture` (audio) — deferred
❌ `listen-phrase-pick-scene` — deferred
❌ Vocab pack 100 слів — MVP 20 достатньо
❌ Word Wall / collectibles — окрема story
❌ Category mastery tracking — deferred

## Vocab Pool (20 words)

| Emoji | Word | Emoji | Word |
|---|---|---|---|
| 🐱 | cat | 🍎 | apple |
| 🐶 | dog | 🍌 | banana |
| 🐄 | cow | 🥛 | milk |
| 🐴 | horse | 🍞 | bread |
| 🐷 | pig | ⚽ | ball |
| 🦁 | lion | 🚗 | car |
| 🐼 | panda | 🏠 | house |
| 🐸 | frog | 📚 | book |
| ☀️ | sun | 🌙 | moon |
| 🌳 | tree | 🌸 | flower |

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/english-word-picture/index.ts` експортує `GameDefinition`
- [ ] **AC-2:** `id: 'english-word-picture'`, `islandId: 'english'`, `icon: '🔤'`
- [ ] **AC-3:** Зареєстровано в `registry.ts`

### Генератор
- [ ] **AC-4:** 5 tasks per level
- [ ] **AC-5:** Payload `{ picture: string, word: string, options: string[3] }`
- [ ] **AC-6:** Target word в options на випадковій позиції
- [ ] **AC-7:** 2 distractors = інші words з pool (не target)

### Renderer
- [ ] **AC-8:** Picture tile (велике emoji) + 3 word buttons вертикально
- [ ] **AC-9:** Prompt uk: "Яке це слово англійською?" / en: "What's this in English?"
- [ ] **AC-10:** press-lock + reset on `task.id`

### Валідатор
- [ ] **AC-11:** `answer === payload.word`

### i18n
- [ ] **AC-12:** `game.englishWord.name/prompt/rules`

### Technical
- [ ] **AC-13:** tsc = 0
- [ ] **AC-14:** Zero changes у types.ts / M10 / useGameSession / islands.ts

## Related
- **Depends on:** US-012 ✅, US-027 (english island started) ✅
- **BPMN:** M26 (see-picture-pick-word sub-mode only)
