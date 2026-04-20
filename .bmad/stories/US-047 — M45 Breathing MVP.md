---
id: US-047
epic: EP-12
title: M45 Breathing MVP (дихання-кулька)
status: ready
priority: High
estimate: 2h
phase: 2.5
project: Школярик
bpmn: M45
created: 2026-04-20
---

# US-047 — M45 Breathing MVP

**Статус**: `ready`
**BPMN**: M45 — Дихання. UNIQUE pattern — zen game без "правильної відповіді".

## User Story

**Як** дитина 3-8 років,
**я хочу** подихати разом з кулькою (вдих = надувається, видих = здувається),
**щоб** заспокоїтись та навчитись регулювати емоції.

## Scope (MVP)

BPMN M45 — multi-technique (balloon, butterfly, square 4-4-4-4, 4-7-8) + mood pre/post + ambient audio + haptics. Для MVP — тільки **🐣 balloon** без складних технік, без mood prompts, без audio.

**Архітектурне рішення:** вписуємо у M10 GameDefinition contract через "5 breath tasks, кожен breath = 1 task, validator завжди correct". Симулюємо normal game loop, але без distractor/answer.

✅ **5 breath cycles** як 5 tasks
✅ Renderer: кулька-emoji (🎈), інструкція "Вдих", "Затримай", "Видих" + progress counter "Вдих 1 з 5"
✅ **Cycle:** inhale 3s (balloon scale up) → hold 0.5s → exhale 3s (scale down) → auto `onAnswer(true)` → next task
✅ Текстові cues на екрані, без TTS
✅ 0 distractors — always correct
✅ **Island:** `emotions`, icon `💚`
✅ i18n uk/en
✅ **Symbolic XP:** normal M10 flow → 3 ⭐ always (no mistakes path)

## Виключено

❌ Hold-gesture (тап-і-тримай) → взагалі timer auto
❌ Butterfly / square / 4-7-8 techniques
❌ Mood pre/post prompts
❌ Ambient soundscape
❌ Haptics
❌ TTS narration voice
❌ Technique menu (🦉)

## Implementation notes

- Використовувати `Animated` з React Native (або `react-native-reanimated` якщо є).
- `useEffect` з setTimeout chain: inhale → hold → exhale → onAnswer → (M10 next task).
- Lock: під час анімації дитина не може закликати onAnswer вручну — renderer сам викличе після циклу.
- Перший breath starts auto після task mount; reset on `task.id`.
- Можна спростити: Animated.sequence для scale 1 → 1.6 → 1.6 → 1 з durations.

## Acceptance Criteria

### API
- [ ] **AC-1:** `src/games/breathing/index.ts` exports `GameDefinition`
- [ ] **AC-2:** `id: 'breathing'`, `islandId: 'emotions'`, `icon: '🎈'`
- [ ] **AC-3:** Registered у `registry.ts`

### Generator
- [ ] **AC-4:** 5 tasks per level
- [ ] **AC-5:** Payload: `{ breathNum: number, total: number }`
- [ ] **AC-6:** `BreathAnswer = true` (завжди правильно — zen mode)

### Renderer
- [ ] **AC-7:** Central balloon emoji (🎈), 140pt, scaled через `Animated.Value`
- [ ] **AC-8:** Phase label text: "Вдих..." / "Затримай" / "Видих..." змінюється по timer
- [ ] **AC-9:** Progress counter "N з 5" внизу
- [ ] **AC-10:** Cycle: inhale 3s → hold 500ms → exhale 3s → `onAnswer(true)`
- [ ] **AC-11:** Reset animation state on `task.id` change (new breath)

### Validator
- [ ] **AC-12:** `validateAnswer` returns `{ correct: true }` завжди

### i18n
- [ ] **AC-13:** `game.breathing.name` = "Дихання" / "Breathing"
- [ ] **AC-14:** `game.breathing.rules`
- [ ] **AC-15:** `game.breathing.phases.{inhale,hold,exhale}`
- [ ] **AC-16:** `game.breathing.progress` = "Вдих {{current}} з {{total}}" / "Breath {{current}} of {{total}}"

### Technical
- [ ] **AC-17:** `tsc --noEmit` = 0
- [ ] **AC-18:** Zero changes у core
- [ ] **AC-19:** Expo Go smooth animation @ 60fps (Android baseline)

## Related
- **Depends on:** US-012 ✅
- **BPMN:** M45
- **New pattern:** timer-driven auto-answer (не user tap). Рідкісний pattern, може reused для інших "guided meditation" ігор.
- **Roadmap:** EP-12 Емоції phase 2.5
