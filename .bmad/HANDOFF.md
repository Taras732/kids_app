---
title: Handoff — Школярик Dev Session
date: 2026-04-20-late
prev_session: 2026-04-20
next_session: 2026-04-21
---

# Handoff — Школярик (2026-04-20 late-session +6 games)

## TL;DR

**Стан:** **22 ігор на 8 островах** + Engagement Foundation (US-052) готові у `review`. Повна плагін-архітектура validated на **7 patterns** (додано timer-driven zen + 2-button binary), zero changes у core (types.ts / M10 / useGameSession / islands.ts / progressStore.ts). TSC = 0.

**Наступна дія завтра (пріоритет згори вниз):**
1. **Manual QA marathon** — Expo Go: протестувати 6 нових ігор (water-states, plant-grow, sink-float, hero-emotion, breathing, safety-basic) + regression старих. Закрити `review` → `done`
2. **Content expansion** — додати MVP scope 🐼/🦊 для existing games або більше items у pools
3. **US-100 Supabase DevOps** — коли Тарас встановить CLI + створить 2 projects (user-action)

---

## Що додано у цю сесію (2026-04-20 late)

### Нові ігри (6) — повне покриття Emotions + Science

| Story | Game | Island | BPMN | Pattern |
|-------|------|--------|------|---------|
| US-042 | water-states | science | M39 | 3-button classification (solid/liquid/gas) |
| US-043 | plant-grow | science | M40 | 3-button next-stage (5 stages seed→fruit) |
| US-044 | sink-float | science | M42 | **NEW** 2-button binary (float/sink) |
| US-046 | hero-emotion | emotions | M44 | situation + 3-button (reuse EmotionId) |
| US-047 | breathing | emotions | M45 | **NEW** timer-driven zen (validator always correct) |
| US-048 | safety-basic | emotions | M46 | 2-button safe/unsafe (physical only 🐣) |

**Commit:** `7bbf86a feat(us-042..048)` (batched: registry/i18n shared).

### Нові patterns validated
- **2-button binary** (sink-float, safety-basic) — simplest classification, clear left/right visual dichotomy
- **Timer-driven zen** (breathing) — useEffect chain `inhale → hold → exhale → onAnswer(true)`, Animated.timing scale, no user tap, validator always correct. Shows GameDefinition handles non-interactive cadence.

### Файли
- `src/games/water-states/{index.ts,Renderer.tsx}`
- `src/games/plant-grow/{index.ts,Renderer.tsx}`
- `src/games/sink-float/{index.ts,Renderer.tsx}`
- `src/games/hero-emotion/{index.ts,Renderer.tsx}` (imports `EmotionId` з emotions-recognize)
- `src/games/breathing/{index.ts,Renderer.tsx}` (Animated API, timersRef cleanup)
- `src/games/safety-basic/{index.ts,Renderer.tsx}` (success/danger border colors)
- `src/games/registry.ts` +12 lines (6 imports + 6 register)
- `src/i18n/{uk,en}.json` +70 lines each (6 games × name/prompt/rules/options keys)

---

## Покриття островів (станом на 2026-04-20 late)

| Island | Games | Status |
|--------|-------|--------|
| 🔢 Математика | 4 | count-objects, math-expressions, math-compare, shapes |
| 📖 Букви | 2 | letters-find, syllable-build |
| 🇬🇧 English | 2 | letters-find-en, english-word-picture |
| 🧩 Логіка | 2 | odd-one-out, pattern-next |
| 🧠 Пам'ять | 3 | memory-match, sequence-repeat, whats-changed |
| 🔬 Наука | **4** | animals-habitat, water-states, plant-grow, sink-float |
| 💚 Емоції | **4** | emotions-recognize, hero-emotion, breathing, safety-basic |
| 🎨 Творчість | 1 | colors-find |

**Total: 22 games.** Science + Emotions досягли повного MVP покриття (4 ігор/island). Creativity (1) + Letters/English/Logic (2 each) — candidates для next expansion.

---

## План на завтра (2026-04-21)

### 1. Manual QA marathon (priority 1) — Тарас, Expo Go

**A. Нові 6 ігор:**
- [ ] `water-states` — emoji + prompt + 3 кнопки станів. Перевірити press-lock і reset на task.id
- [ ] `plant-grow` — поточна стадія + 3 наступних кандидатів (тільки emoji на кнопках). Правильна стадія → correct
- [ ] `sink-float` — емоджі предмету + 2 кнопки (plaває / тоне). 12 items, правильний зелений/червоний borders?
- [ ] `hero-emotion` — ситуація (🎂 + текст "День народження!") + 3 емоції. EmotionId reuse від emotions-recognize
- [ ] `breathing` — 🎈 balloon з Animated.scale 1 → 1.6 → 1. 3s вдих, 500ms hold, 3s видих, auto-next. 5 breaths. Smooth 60fps?
- [ ] `safety-basic` — emoji предмету (🔥 🧸 тощо) + 2 кнопки (✓ Можна / ✗ Не можна)
- [ ] **Особливо breathing:** reset анімації на task.id (новий breath), cleanup timers при unmount

**B. Engagement flow regression:**
- [ ] Завершити нову гру → XP нараховується
- [ ] `science-first` бейдж відкривається при першій grі science (water-states / plant-grow / sink-float)
- [ ] `emotions-first` бейдж при першій emotions game
- [ ] Hub tab badges показує оновлений count (коли добавимо new earned)
- [ ] `all-islands` бейдж: треба грати хоч 1 гру на кожному з 8 — перевірити що рахується

**Результат QA:** позначити `done` у `.bmad/stories/README.md` + закрити `review` статуси для 6 ігор.

### 2. Якщо QA ОК — next expansion options

**Варіант А: Creativity island (pure count 1→4 games)**
- M51 Draw Together — wtf drawing on canvas (ambitious — може skip до post-MVP через complexity)
- M48 Music Beat — tap-to-rhythm (Animated-based, reuse breathing timer pattern)
- M49 Story Finish — 3-option narrative choice (reuse hero-emotion situation+3button)

**Варіант Б: Extended game modes**
- US-017b Number Compare "between" mode (difficulty 2+)
- US-018b Shapes с 3D objects
- US-041b Animals extended (safari, polar, mythical)

**Варіант В: P3 engagement layer**
- US-053 Streak tracker (потребує новий `lastPlayedDate` у progressStore)
- US-054 Badge earn toast animation

### 3. Blocked / не чіпати
- **US-015** Supabase Profile Sync — blocked by US-100
- **US-100** Supabase DevOps — blocked: user-action
- **US-019/020** Tangram — deferred (SVG drag complex)

---

## Gotchas і pattern library

### Усталені patterns (reuse-ready) — 7 total
1. **Scalar + 4 tiles (2×2 grid)** → letters-find, syllable-build, colors-find
2. **Scalar + 3 vertical buttons** → emotions-recognize, english-word-picture, animals-habitat, water-states, plant-grow, hero-emotion
3. **Scalar + keypad** → count-objects
4. **Sequence + "?" + options** → pattern-next
5. **Multi-tap state machine** → memory-match (2 tap = 1 answer)
6. **Playback → input (array answer)** → sequence-repeat
7. **Memorize → detect (2-phase)** → whats-changed
8. **NEW: 2-button binary** → sink-float, safety-basic
9. **NEW: Timer-driven zen (no user input)** → breathing

### Breathing-specific gotchas
- `Animated.Value` через `useRef` — один instance на lifetime компонента
- Timers збираємо у `timersRef.current`, cleanup у `return clearAll` і на кожній re-run ефекту
- `answeredRef` guard щоб не викликати `onAnswer` після unmount або disabled
- `useNativeDriver: true` для transform.scale — smooth 60fps
- Web compat: `Animated.Text` має використовувати `style` + `transform` (не CSS `scale`)

### Hero-emotion gotchas
- Ситуація = scene emoji (не обличчя) — щоб уникнути confusion з emotions-recognize (target = **обличчя**)
- EmotionId reuse з `../emotions-recognize/Renderer` — i18n `game.emotions.names.{id}` shared

### Safety-basic gotchas
- Тільки universal home items — БЕЗ strangers/online/violence (child-safety advisor review потрібен для full 4-tier)
- Border colors: success/danger для semantic cue

### Session 2026-04-20 late commits
```
7bbf86a feat(us-042..048) add 6 MVP games — science + emotions phase 2.5
```

---

## Файли-посилання

- **PRD:** `prd.md`
- **Stories index:** `.bmad/stories/README.md` (22 ігор у reviewed + 1 blocked)
- **Architecture:** `CLAUDE.md`
- **BPMN source of truth:** `D:/Obsidian/Obdsidian_2026/10_Projects/Школярик/02_Product/BPMN_Scenarios/`
- **Memory:** `C:/Users/taras/.claude/projects/d--Obsidian-Obdsidian-2026/memory/MEMORY.md`
