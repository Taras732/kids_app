---
id: US-018
epic: EP-06
title: M17 Shapes Recognize MVP (tap на фігуру за назвою)
status: review
priority: High
estimate: 7h
actual: ~4h
phase: 2
project: Школярик
bpmn: M17
created: 2026-04-19
implemented: 2026-04-19
---

# US-018 — M17 Shapes Recognize MVP

**Статус**: `ready`
**Пріоритет**: High (четверта гра EP-06 Математика)
**Оцінка**: 7h
**BPMN модулі**: M17 (Shapes) — sub-mode `recognize` happy path тільки

## User Story

**Як** дитина 4-7 років,
**я хочу** тапати на правильну геометричну фігуру за її назвою,
**щоб** запам'ятовувати геометричні форми.

**Як** developer,
**я хочу** підтвердити що GameDefinition contract підтримує гру з рендером через RN Views (не тільки text/emoji),
**щоб** готувати наступні ігри з SVG/Skia (танграм, букви).

## Скоп (що ВХОДИТЬ у US-018)

✅ **SubMode:** `recognize` тільки (tap на фігуру за назвою)
✅ **Shape pool:** `circle`, `square`, `triangle`, `rectangle` (4 базові фігури MVP)
✅ **Prompt:** "Знайди {shapeName}" / "Find the {shapeName}"
✅ **4 candidates per task:** 1 correct + 3 distractors з pool (завжди 4 унікальні)
✅ **2×2 grid layout** великих tap-zones
✅ **Pastel colors** — random з brand palette для кожної фігури (але prompt не згадує колір per E2)
✅ **Axis-aligned** (без rotation invariance — Q3 deferred)
✅ **5 tasks per level**
✅ **Validator:** `tappedShapeId === targetShapeId`
✅ **Island:** `math`
✅ i18n uk/en (`game.shapes.*` + `game.shapes.names.*`)
✅ Cross-platform (без SVG — через RN Views + borderWidth trick для triangle)

## Виключено (НЕ робимо у US-018)

❌ SubModes `name`, `count-sides`, `classify`, `measure` — окремі US
❌ Drag-to-slot (A1) — gesture handler not used yet
❌ Rotation invariance (A3) — methodologically tricky, pizdnish
❌ Properties comparison (A4), Perimeter/Area (A5) — 🦉 only
❌ Real-world photos (A6) — content pack
❌ Hint / маскот tap → M10.A2 not wired
❌ TTS "Знайди трикутник" → US-019 Voice
❌ Tutorial для rotation confusion (E4) / classify trap (E7) — не actionable без tutorials module
❌ SVG-based shapes — RN Views достатньо для MVP (Skia/SVG → US-021+ для танграму)
❌ Oval, rhombus, pentagon, hexagon — додамо коли потрібно
❌ Color distraction guard (E2) strict enforcement — на MVP просто не згадуємо колір у prompt, candidates random color

## Acceptance Criteria

### Контракт API
- [ ] **AC-1:** `src/games/shapes/index.ts` експортує `GameDefinition<LevelSpec<ShapeAnswer>, ShapeAnswer>`
- [ ] **AC-2:** `id: 'shapes'`, `islandId: 'math'`, `icon: '🔺'`
- [ ] **AC-3:** Зареєстровано у `registry.ts`

### Генератор
- [ ] **AC-4:** `generateLevel` повертає 5 tasks
- [ ] **AC-5:** `ShapeId = 'circle' | 'square' | 'triangle' | 'rectangle'`
- [ ] **AC-6:** Payload: `{ target: ShapeId, candidates: { id: ShapeId, color: string }[] }`
- [ ] **AC-7:** Для кожного task: pick 1 target + 3 унікальних distractors з pool
- [ ] **AC-8:** Target shuffled на випадкову позицію серед 4 candidates
- [ ] **AC-9:** Colors для кожної candidate — random з 4-5 pastel з theme (не повторюються у одному task)

### Renderer
- [ ] **AC-10:** `src/games/shapes/Renderer.tsx`
- [ ] **AC-11:** Prompt зверху: `"Знайди {shapeName}"` (назва з i18n)
- [ ] **AC-12:** 2×2 grid tap-zones — кожна великий Pressable з рендером shape по центру
- [ ] **AC-13:** Shape рендерять через RN Views:
  - `circle`: `View` з `borderRadius: 50%` aspect 1:1
  - `square`: `View` aspect 1:1
  - `triangle`: `View` з `borderWidth` trick (3 transparent borders + 1 кольоровий)
  - `rectangle`: `View` aspect 3:2
- [ ] **AC-14:** Tap → `onAnswer(shapeId)` → M10 валідація
- [ ] **AC-15:** Press lock після tap (prevents double-fire)
- [ ] **AC-16:** `disabled` prop → все disabled opacity 0.5
- [ ] **AC-17:** Pressed scale 0.97 + primary border highlight

### Валідатор
- [ ] **AC-18:** `validateAnswer(task, answer)` повертає `{ correct: answer === payload.target }`

### i18n
- [ ] **AC-19:** `game.shapes.name` = "Фігури" / "Shapes"
- [ ] **AC-20:** `game.shapes.prompt` = "Знайди {{shape}}" / "Find the {{shape}}"
- [ ] **AC-21:** `game.shapes.names.{circle|square|triangle|rectangle}` uk/en (accusative case для української "коло → коло", "квадрат → квадрат", "трикутник → трикутник", "прямокутник → прямокутник" — всі nominative == accusative для neuter/masculine inanimate, повезло)
- [ ] **AC-22:** `game.shapes.rules` — коротко

### Technical
- [ ] **AC-23:** `npx tsc --noEmit` = 0
- [ ] **AC-24:** Zero changes у `types.ts`, M10, `useGameSession.ts`

## Tasks

### 1. Shape primitives (2h)
- [ ] `src/games/shapes/shapes.tsx` — exported `<ShapeView shape={id} color={...} size={...} />` компонент
- [ ] Implement 4 shapes through Views (no SVG)
- [ ] Fixed aspect ratios + `size` prop контролює max width

### 2. Generator (1h)
- [ ] `src/games/shapes/index.ts`
- [ ] Helpers: `pickDistractors(target, pool)`, `pickColor()`, `shuffle`
- [ ] `generateLevel` loop

### 3. Renderer (2h)
- [ ] `src/games/shapes/Renderer.tsx`
- [ ] Prompt header з i18n interpolation
- [ ] 2×2 grid (Pressable per candidate)
- [ ] Integrate `<ShapeView>` per candidate
- [ ] Press lock

### 4. Registry + i18n (1h)
- [ ] `registerGame(shapes)`
- [ ] uk/en `game.shapes.*`

### 5. QA + commit (1h)
- [ ] Manual: пройти 5 tasks, перевірити triangle trick на web
- [ ] `tsc --noEmit`
- [ ] `feat(us-018): M17 Shapes Recognize MVP`
- [ ] HANDOFF.md update

## Дизайн-нотатки

- Pastel color pool: `#FF6B35` (orange), `#4ECDC4` (teal), `#FFD93D` (yellow), `#845EC2` (purple), `#22C55E` (green) — beзтіньові
- Shape size всередині tap-zone: ~60-70% від tap-zone (щоб був padding навколо)
- Triangle trick (RN): `width: 0, height: 0, borderLeftWidth: size/2, borderRightWidth: size/2, borderBottomWidth: size * 0.866, borderLeftColor/RightColor: transparent, borderBottomColor: shapeColor` — equilateral
- Rectangle aspect: 3:2 (120 wide × 80 tall) щоб добре відрізнявся від квадрата
- Circle: `width=height`, `borderRadius: width/2`
- Pressable tap-zone мінімум 140×140pt (accessible + easy for kids)

## Відкриті питання

- **Q-1:** Ромб / oval додавати у MVP? → **Ні**, скіпнуто — 4 shapes достатньо для recognize, extend пізніше
- **Q-2:** Показувати назву candidate shape під фігурою? → **Ні**, це `name` submode, не recognize
- **Q-3:** Як уникнути що children все одно "запам'ятовують колір target"? → MVP — random color per-task, наступна US може shuffle per-candidate у pre-set палітрі
- **Q-4:** Чи shape names uk різного відмінку за падежем у prompt? → "Знайди {коло/квадрат/трикутник/прямокутник}" — nominative == accusative для нашого pool, OK без additional forms

## Definition of Done

- [ ] Усі AC закриті
- [ ] `tsc --noEmit` = 0
- [ ] Manual QA 1 рівень (5 tasks) — triangle рендер на web виглядає корректно
- [ ] Commit з BMAD format
- [ ] HANDOFF + EP-06 progress table updated

## Related

- **Depends on:** US-012 (M10) ✅, US-017 (M16 3-button pattern) ✅
- **Blocks:** US-019 (M17 extended submodes), US-020 (Shapes with SVG для танграму)
- **BPMN:** M17
- **Roadmap:** EP-06 Математика phase 2
