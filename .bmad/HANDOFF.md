---
title: Handoff — Школярик Dev Session
date: 2026-04-19
next_session: TBD
---

# Handoff — Школярик (2026-04-19)

## TL;DR

**Стан:** US-013 (Count Objects MVP) реалізовано і закомічено. Tech debt з FormInput і dead route закрито. Створено US-100 (Supabase DevOps Setup) + US-015 stub (Profile Sync).

**Наступна дія:**
1. Manual QA US-013 та US-014 flows на Expo Go
2. **BLOCKED** — виконати US-100 Step 1-3 (install CLI + 2 Supabase проекти) — потребує рук користувача
3. Після US-100 → `/dev` US-015 Profile Sync

## Сьогодні закомічено (2026-04-19)

```
bd4bc03 feat(us-013): M14 Count Objects MVP — second game via GameDefinition contract
f82bd21 docs(us-100): Supabase DevOps setup — story + runbook + config preseed
d6b04e1 fix(FormInput): Platform-aware web-only outlineStyle + remove dead route
```

### Commit 1 (`d6b04e1`) — Tech debt
- `src/components/FormInput.tsx` — `outlineStyle: 'none'` spread тільки на web через `Platform.OS === 'web'` check. 3 TS errors → 0.
- Видалено `app/(main)/onboarding/language.tsx` — dead route після US-014 device-locale auto-detect.

### Commit 2 (`f82bd21`) — US-100 + US-015 docs
- `.bmad/stories/US-100 — Supabase DevOps Setup.md` — 28 AC, 6 кроків, estimate 4h. Блокує US-015/US-017/US-056.
- `.bmad/stories/US-015 — Supabase Profile Sync.md` — stub з 23 AC, 5 tasks, estimate 12h. Depends on US-100.
- `supabase/config.toml` preseed: `project_id="shkolyaryk"`, auth `site_url="shkolyaryk://"`, redirect URLs, email templates paths.
- `docs/supabase-setup.md` — runbook для нових розробників (install → link → daily workflow → troubleshooting).
- `.env.example` — dev/prod split блоки.
- `.gitignore` — `.env.production`, `supabase/.temp/`, `supabase/.branches/`.

### Commit 3 (`bd4bc03`) — US-013 M14 Count Objects MVP
- `src/games/count-objects/index.ts` — `GameDefinition`, `generateLevel` (5 tasks, `correctCount ∈ [1,20]`), rejection sampling для non-overlapping positions + grid fallback.
- `src/games/count-objects/Renderer.tsx` — apple field + NumberKeypad, max 2 digits, no leading zero, `useEffect` clears input on `task.id` change.
- `src/components/game/NumberKeypad.tsx` — reusable 3×3 keypad (1-9) + bottom row [⌫, 0, OK]. Варіанти `default/primary/ghost`.
- `src/games/registry.ts` — registered second game (✅ validates `GameDefinition<TLevelSpec, TAnswer>` plugin contract — витримав без змін).
- i18n `uk/en.json` — `game.countObjects.{name, question, rules}`.

**Tech validation:** `npx tsc --noEmit` → EXIT=0.

## Tomorrow's playbook

### Step 1 — QA (~45min)

Запусти: `cd d:/Dev/shkolyaryk && npx expo start -c`

#### Сценарій 1 — Count Objects gameplay
1. Hub → Math island → "Порахуй яблука"
2. ✅ Modal з rules → tap "Зрозуміло"
3. 5 tasks підряд, у кожному 1-20 яблук, не перекриваються
4. Введи правильну відповідь → ✅ "Молодець!" → Next
5. Введи неправильну → ❌ "Спробуй ще!" → Try again
6. Після 5 tasks → Stars screen (0-3 зірки залежно від помилок) + XP earned
7. Keypad:
   - Leading zero НЕ вводиться
   - Після 2 digits не додається третій
   - ⌫ стирає останню цифру
   - OK disabled коли empty

#### Сценарій 2 — US-014 regression (після попередньої сесії)
1. Cold start з 2+ profiles → picker працює
2. Delete account → новий register → одразу name (без language screen)
3. Parent → Settings → 🌐 Мова → переключитись без рестарту

### Step 2 — US-100 (BLOCKED — потрібні дії користувача)

Прочитай [.bmad/stories/US-100.md](./stories/US-100%20—%20Supabase%20DevOps%20Setup.md) і [docs/supabase-setup.md](../docs/supabase-setup.md).

Короткий план:
1. `npm i -g supabase` (або через winget/scoop)
2. Створити 2 проекти у Supabase Dashboard: `shkolyaryk-dev`, `shkolyaryk-prod`
3. `supabase login` + `supabase link --project-ref <dev-ref>`
4. `supabase migration repair` (sync state з існуючими manual-deployed `0001`, `0002`)
5. `supabase db push` (перевірити що нічого не ламається)
6. `supabase config push` (email templates + auth config з `config.toml`)
7. Заповнити `.env.development` + `.env.production` (secrets у EAS, не в git)
8. Smoke test: створити `0003_test.sql`, push, rollback

### Step 3 — Після US-100 → US-015 Profile Sync (`/dev`)

Story drafted: [.bmad/stories/US-015 — Supabase Profile Sync.md](./stories/US-015%20—%20Supabase%20Profile%20Sync.md)

Scope: `child_profiles` + `progress` tables з RLS, sync services, offline queue, merge strategies (XP max, badges union, last-write-wins для profiles).

**Review перед `/dev`:** 4 відкриті Q-питання у story (soft delete GDPR, PIN sync, merge strategy, settings sync).

## Context pointers

### Критичні файли (auto-loaded)
- `CLAUDE.md` — архітектура + патерни
- `prd.md` — цілі + беклог
- `.bmad/stories/US-012.md` — M10 Generic Game Loop contract
- `.bmad/stories/US-013.md` — Count Objects (done)
- `.bmad/stories/US-014.md` — Profile Picker (done)
- `.bmad/stories/US-100.md` — Supabase DevOps (ready, blocked)
- `.bmad/stories/US-015.md` — Profile Sync (draft stub)

### Візуальний референс
`D:/Obsidian/Obdsidian_2026/10_Projects/Школярик/03_Design/prototype/v4.html` — Cosmic Purple

### BPMN
`D:/Obsidian/Obdsidian_2026/10_Projects/Школярик/02_Product/BPMN_Scenarios/` — M01..M62

Правило: **BPMN = spec, US = execution plan з MVP-scope decomposition.**

### Tech stack reminders
- Expo SDK 54 + RN 0.81 + React 19.1 + Expo Router 6
- TS strict, path alias `@/*`
- Zustand + `mmkvStorage` persist (НЕ MMKV безпосередньо)
- Web quirks: `measureInWindow` + `pageX` замість `locationX`
- Safe-area: `Math.max(insets.top, 50)`
- `Alert.alert` з 3+ кнопками НЕ працює на web → `ConfirmModal`
- Web-only styles: `...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null)`

## Відкриті tech debt

1. ~~FormInput `outlineStyle` — 3 TS errors~~ **FIXED (d6b04e1)**
2. ~~`/(main)/onboarding/language.tsx` dead route~~ **REMOVED (d6b04e1)**
3. **Supabase sync для profiles/progress** — local-only MMKV. → US-015 після US-100.
4. **Soft-delete для profiles** — hard delete поки все локально. → US-015.
5. **Age group refine = direct mascot pick** — birthday-derived відкладено.
6. **Parent panel `/profiles.tsx`** — без swipe-to-delete.
7. **Real manual QA US-013** — не виконано в автономній сесії.

## Game roadmap status

| Story | Модуль | Статус | Гра |
|-------|--------|--------|-----|
| US-012 | M10 Core Game Loop | ✅ done (`bbac839`) | tap-the-dot (demo) |
| US-013 | M14 Count Objects | ✅ done (`bd4bc03`) | count-objects (🍎 1-20) |
| US-018+ | EP-06 Math games | TBD | addition/subtraction/shapes |

**Validation checkpoint:** GameDefinition plugin contract пройшов тест другою грою без модифікацій. Архітектура M10 витримала. Наступні EP-06 ігри можна додавати як файл-плагіни.

## Як відкрити наступну сесію

```
У новому чаті з Claude Code в d:/Dev/shkolyaryk:
1. Прочитати .bmad/HANDOFF.md
2. Запустити QA playbook Step 1 (Count Objects)
3. Якщо user готовий до US-100 → його руки виконують Step 2 Steps 1-3
4. Після US-100 ✅ → /sm оновити US-015 → /dev
```

Або просто: _"Прочитай `.bmad/HANDOFF.md` і продовжимо"_.
