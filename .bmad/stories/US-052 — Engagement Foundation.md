---
id: US-052
epic: EP-14
title: Engagement Foundation — Session Tracking + Badges + Hub UI
status: review
priority: High
estimate: 5h
actual: ~2h
phase: 3
project: Школярик
bpmn: —
created: 2026-04-19
implemented: 2026-04-19
---

# US-052 — Engagement Foundation

**Статус**: `review`
**Пріоритет**: High (P3 Engagement Phase kickoff — unblocks всю motivational механіку)
**Оцінка**: 5h

## User Story

**Як** дитина,
**я хочу** отримувати нові бейджі за досягнення і бачити свій прогрес на Hub,
**щоб** мотивація грати зростала.

**Як** developer,
**я хочу** єдиний badge engine що читає progress store і повертає нові awards,
**щоб** додавання нових бейджів у майбутньому було трьома рядками у catalog.

## Скоп

✅ **Session tracking:** виклик `recordGameSession(profileId, gameId, score, difficulty)` у game screen при `finished` phase
✅ **Badge catalog:** `src/constants/badges.ts` — 12 базових бейджів
✅ **Badge engine:** `src/utils/badgeEngine.ts` — pure function `evaluateBadges(state, profileId) → newBadgeIds[]`
✅ **Award integration:** після session recorded → evaluate → `awardBadge` for each new
✅ **Hub badges tab:** enable, navigate to `/(main)/badges`
✅ **Badges screen:** `app/(main)/badges.tsx` — grid, earned vs locked visual
✅ **i18n uk/en** для назв бейджів + описів

## Виключено
❌ Streak (Hub показує `🔥 0 днів` hardcoded — залишаємо, наступна story)
❌ Avatar customization (EP-16, окрема story)
❌ XP level-up celebrations (окрема polish story)
❌ Supabase sync бейджів (через US-100 когда розблокується)

## Бейджі (catalog)

| ID | Критерій | Name UK | Name EN |
|---|---|---|---|
| `first-game` | перша гра завершена (будь-які ⭐) | Перший крок | First step |
| `first-stars-3` | ⭐⭐⭐ вперше | Молодець! | Great job! |
| `ten-games` | 10 завершених ігор | Десятка | Ten in a row |
| `fifty-games` | 50 завершених ігор | Півсотні | Fifty plays |
| `all-islands` | хоча б 1 гра на кожному з 8 островів | Дослідник | Explorer |
| `math-master` | 3 math-ігри з ⭐⭐⭐ | Математик | Math master |
| `letters-first` | перша letters-гра | Перша літера | First letter |
| `memory-master` | 3 memory-ігри з ⭐⭐⭐ | Пам'ятливий | Sharp memory |
| `english-first` | перша english-гра | Хеллоу! | Hello! |
| `emotions-first` | перша emotions-гра | Чуйний | Kind heart |
| `science-first` | перша science-гра | Дослідник природи | Nature explorer |
| `level-5` | досягнуто level 5 | Level 5 | Level 5 |

(bestScore у store = stars 1|2|3)

## Acceptance Criteria

### Session tracking
- [ ] **AC-1:** У `game/[id].tsx` при `session.phase === 'finished'` викликається `recordGameSession(profileId, gameId, stars, difficulty)`
- [ ] **AC-2:** Після recordGameSession — `evaluateBadges` → `awardBadge` для кожного новoго
- [ ] **AC-3:** committedRef також захищає від double-invoke tracking

### Badge catalog
- [ ] **AC-4:** `src/constants/badges.ts` експортує `BADGES: BadgeDef[]`, `BadgeDef` = `{ id, icon, islandId?, predicate: (ctx) => boolean }`
- [ ] **AC-5:** 12 бейджів у catalog

### Badge engine
- [ ] **AC-6:** `evaluateBadges(state, profileId)` pure — не mutates state
- [ ] **AC-7:** Повертає тільки НОВИЙ earn (фільтрує поточні)
- [ ] **AC-8:** Predicates використовують `gameProgressByProfile[profileId]` + `xpByProfile[profileId]` + `ISLANDS`

### UI
- [ ] **AC-9:** Hub: tab `badges` → `disabled: false`, onPress → `router.push('/(main)/badges')`
- [ ] **AC-10:** `app/(main)/badges.tsx` екран з back-button
- [ ] **AC-11:** Grid бейджів: earned = coloured icon + name, locked = grayscale icon + "🔒" overlay + hidden description
- [ ] **AC-12:** SafeArea + insets top, bottom tab bar не перекриває

### i18n
- [ ] **AC-13:** `badges.{id}.name` та `badges.{id}.description` для 12 бейджів (uk+en)

### Technical
- [ ] **AC-14:** tsc = 0
- [ ] **AC-15:** Нові файли тільки — zero changes у `types.ts`, `M10 / useGameSession.ts`, `islands.ts`, `progressStore.ts`

## Tasks
1. Badge catalog + predicates (1h)
2. Badge engine + unit mental-test (1h)
3. Game screen integration (session + award) (1h)
4. Hub tab enable + badges screen UI (1.5h)
5. i18n + QA + commit (0.5h)

## Дизайн-нотатки
- Badge card: 80pt icon + name + 2-line description
- Earned: full opacity + colored border (колір острова якщо islandId, інакше primary)
- Locked: opacity 0.35 + grayscale + 🔒 overlay top-right corner
- Grid 2-колонкова

## Related
- **Depends on:** US-012 ✅, US-011 progressStore ✅
- **Blocks:** Streak tracking, avatar unlocks, Supabase badge sync
- **Roadmap:** EP-14 XP & Рівні + EP-15 Бейджі (P3)
