---
id: US-046
epic: EP-12
title: M44 Hero Emotion MVP (що відчуває герой)
status: ready
priority: High
estimate: 1.5h
phase: 2.5
project: Школярик
bpmn: M44
created: 2026-04-20
---

# US-046 — M44 Hero Emotion MVP

**Статус**: `ready`
**BPMN**: M44 — Що відчуває герой. MVP scope = text situation → emotion, 3-button reuse emotions-recognize.

## User Story

**Як** дитина 4-7 років,
**я хочу** прочитати (або почути) ситуацію і обрати емоцію героя,
**щоб** розвивати контекстне розуміння емоцій (інференс).

## Scope (MVP)

BPMN M44 — повнорозмірний Theory-of-Mind модуль (комікс-панелі, TTS, "чому?", perspective swap, ambiguous cases). Для MVP скорочуємо до **text + emoji + 3-button**. Пара реченнь ситуації, дитина читає або дорослий зачитує.

✅ **Pool 10 situations**, кожна:
  - `text`: 1-2 речення ("Марта довго будувала замок. Братик розвалив його.")
  - `scenicEmoji`: ілюстративний emoji (🏰, 🎁, 🎈 тощо)
  - `target: EmotionId` — головна емоція
✅ **Emotions:** reuse 6 з M43 `happy / sad / angry / scared / surprised / sleepy`
✅ **3 emotion buttons** (1 correct + 2 distractors з shared pool)
✅ 5 tasks per level
✅ **Island:** `emotions`, icon `💚`
✅ Reuse 3-button pattern від `emotions-recognize`
✅ i18n uk/en для ситуацій + reuse `game.emotions.names.*`

## Виключено

❌ Multi-panel comic illustrations
❌ TTS narration audio
❌ "Чому?" reasoning mode (🦊)
❌ Perspective swap (🦉)
❌ Ambiguous / multi-valid emotions
❌ Distress detection
❌ Parent-blocked themes

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/hero-emotion/index.ts` exports `GameDefinition`
- [ ] **AC-2:** `id: 'hero-emotion'`, `islandId: 'emotions'`, `icon: '💚'`
- [ ] **AC-3:** Registered у `registry.ts`

### Generator
- [ ] **AC-4:** 5 tasks per level з 10-situation pool
- [ ] **AC-5:** Payload: `{ situationKey: string, scenicEmoji: string, target: EmotionId, candidates: EmotionId[] }`
- [ ] **AC-6:** `EmotionId` — reuse з `emotions-recognize` (happy/sad/angry/scared/surprised/sleepy)
- [ ] **AC-7:** 3 candidates: 1 target + 2 random distractors з pool

### Renderer
- [ ] **AC-8:** Scenic emoji (80pt) + situation text (18pt) у card
- [ ] **AC-9:** Prompt "Що він/вона відчуває?"
- [ ] **AC-10:** 3 emotion buttons у row (text labels)
- [ ] **AC-11:** Press-lock + reset on `task.id`

### Validator
- [ ] **AC-12:** `answer === p.target`

### i18n
- [ ] **AC-13:** `game.heroEmotion.name` = "Що він відчуває?" / "How does the hero feel?"
- [ ] **AC-14:** `game.heroEmotion.prompt`
- [ ] **AC-15:** `game.heroEmotion.rules`
- [ ] **AC-16:** `game.heroEmotion.situations.{key}` для 10 ситуацій
- [ ] **AC-17:** Reuse `game.emotions.names.*` для button labels

### Technical
- [ ] **AC-18:** `tsc --noEmit` = 0
- [ ] **AC-19:** Zero changes у core
- [ ] **AC-20:** Reuse `EmotionId` type з `emotions-recognize/Renderer.tsx`

## Related
- **Depends on:** US-045 ✅ (EmotionId pool)
- **BPMN:** M44
- **Roadmap:** EP-12 Емоції phase 2.5
