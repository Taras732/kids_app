---
title: Handoff — Школярик Dev Session
date: 2026-04-16
next_session: 2026-04-17
---

# Handoff — Школярик (2026-04-16 → 2026-04-17)

## TL;DR для завтра

**Стан:** US-014 (Child Profile Picker) + hotfixes (delete account error UX, device-locale auto-detect) закомічені в один коміт. US-013 (Count Objects MVP) на паузі.

**Наступна дія:** Manual QA кінцевого flow (видалити акаунт → новий register → одразу onboarding name без language screen) → потім US-013 `/dev`.

## Зроблене сьогодні (2026-04-16)

### US-014 — Child Profile Picker (committed)
- Picker (`profile-picker.tsx`), profile-edit, updateProfile у store
- Додано gear→pin-gate, auto-switch при removeProfile
- `mode=add` flow з back-кнопками на всіх 3-х onboarding screens

### Hotfix 1 — Silent fail при delete account
- **SQL міграція `0002_delete_user_account.sql` задеплоєна у Supabase** (manual через SQL Editor)
- `dashboard.tsx:performDelete` — замість silent close тепер показує `ConfirmModal` з `auth.deleteFailed`
- Додано `common.ok` ключ у i18n

### Hotfix 2 — Device-locale auto-detect (removed language screen)
- `src/utils/deviceLocale.ts` — визначає локаль через `Intl.DateTimeFormat`
- `splash.tsx` — при `!hasChosenLanguage` auto-set locale з девайсу + mark chosen
- `_layout.tsx` — редіректи з `/(main)/onboarding/language` → `/(main)/onboarding/name`
- Parent dashboard → Settings → 🌐 "Мова застосунку" (route на `/language?from=settings`)
- `/language.tsx` підтримує `from=settings` → `router.back()`

**Неактивні екрани (залишені у файлах для можливого reuse):**
- `app/(main)/onboarding/language.tsx` — не редіректить сюди ніхто, dead route

## Tomorrow's playbook

### Step 1 — Повноцінна QA (~30min)

Запусти: `cd d:/Dev/shkolyaryk && npx expo start -c` (з `-c` для очистки кешу).

**Критичний сценарій №1 — після delete:**
1. Parent → Settings → Видалити акаунт → підтвердити 2 рази
2. Register новий → check-email → "Я підтвердив"
3. ✅ Очікувано: одразу onboarding `name` (без екрану мови!)
4. ✅ Мова має бути правильна (uk якщо пристрій Ukrainian, інакше en)

**Критичний сценарій №2 — picker:**
1. Cold start з 2+ profiles → picker → tap → Hub
2. Cold start з 1 profile → одразу Hub
3. Picker → "+Додати" → name (має бути "Назад") → age → avatar → Hub з новою дитиною active
4. Picker → gear ⚙️ → pin-gate → parent

**Сценарій №3 — мова:**
1. Parent → Settings → 🌐 Мова застосунку → змінити → Back
2. ✅ UI має переключитись без рестарту

**Сценарій №4 — delete error UX:**
1. Відключити інтернет → Parent → Delete account
2. ✅ Має показатись dialog "Не вдалося видалити..." з OK

### Step 2 — Якщо QA OK → US-013 `/dev`

Story готова: `.bmad/stories/US-013 — M14 Count Objects MVP.md`.

Scope: 🦊 only, range [1,20], keypad input, apples theme, 5 tasks, difficulty=1.0 static.

**День 1 (≈4h):** Генератор + Renderer skeleton
- `src/games/count-objects/index.ts` — `GameDefinition` + `generateLevel` (rejection sampling)
- `src/games/count-objects/Renderer.tsx` — playfield з pre-computed positions
- Зареєструвати у `src/games/registry.ts`

**День 2 (≈4h):** NumberKeypad + integration
- `src/components/game/NumberKeypad.tsx` — 3×3 grid + 0/⌫/OK, max 2 digits, clamp
- Інтегрувати у Renderer + question "Скільки яблук?"

**День 3 (≈2h):** i18n + polish + manual test
- `game.countObjects.*` ключі
- 5 tasks manual + `npx tsc --noEmit`

## Context pointers

### Критичні файли
- `CLAUDE.md` — архітектура + патерни (auto-loaded)
- `prd.md` — цілі + беклог
- `.bmad/stories/US-012.md` — M10 contract (як писати ігри-плагіни)
- `.bmad/stories/US-013.md` — Count Objects MVP spec
- `.bmad/stories/US-014.md` — Profile Picker (done)

### Візуальний референс
`D:/Obsidian/Obdsidian_2026/10_Projects/Школярик/03_Design/prototype/v4.html` — Cosmic Purple design system

### BPMN
`D:/Obsidian/Obdsidian_2026/10_Projects/Школярик/02_Product/BPMN_Scenarios/` — M01..M62.

Правило: **BPMN = spec, US = execution plan з MVP-scope decomposition.**

### Tech stack reminders
- Expo SDK 54 + RN 0.81 + React 19.1 + Expo Router 6
- TS strict mode, path alias `@/*`
- Zustand + `mmkvStorage` persist
- Web quirks: `measureInWindow` + `pageX` замість `locationX`
- Safe-area fallback: `Math.max(insets.top, 50)`
- `Alert.alert` з 3+ кнопками НЕ працює на web — ConfirmModal

## Відомі tech debt

1. **FormInput.tsx** — 3 pre-existing TS errors (`outlineStyle: 'none'` web-only).
2. **`/(main)/onboarding/language.tsx`** — dead route, можна видалити у майбутньому.
3. **Supabase sync для profiles** — зараз тільки MMKV. US-015 коли буде готова DB schema + RLS.
4. **Soft-delete для profiles** — hard delete поки все локально.
5. **Age group refine = direct mascot pick** — birthday-derived відкладено.
6. **Parent panel `/profiles.tsx`** — без swipe-to-delete.

## Як відкрити завтра

```
У новому чаті з Claude Code в папці d:/Dev/shkolyaryk:
1. Прочитати .bmad/HANDOFF.md
2. Запустити QA playbook Step 1
3. Якщо OK → US-013 `/dev`
```

Або: _"Прочитай `.bmad/HANDOFF.md` і продовжимо"_.
