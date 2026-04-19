---
id: US-100
epic: EP-INF
title: Supabase DevOps Setup (CLI + 2 envs + auto-sync migrations)
status: ready
priority: High
estimate: 4h
phase: 1
project: Школярик
bpmn: —
created: 2026-04-19
blocks: [US-015, US-017, US-056]
---

# US-100 — Supabase DevOps Setup

**Статус**: `ready`
**Пріоритет**: High (блокер для прод-білду + US-015 profile sync + коректного QA)
**Оцінка**: 4h
**Категорія**: Infrastructure / DevOps (поза product roadmap EP-01..EP-22)

## Контекст

Зараз Supabase налаштований мінімально:
- SDK-клієнт працює, Auth функціонує ([src/utils/supabase.ts](../../src/utils/supabase.ts))
- Міграції (`0001_analytics_events.sql`, `0002_delete_user_account.sql`) деплояться **вручну** через Dashboard → SQL Editor
- `supabase/config.toml` відсутній → CLI не залінкований
- Email templates лежать у `supabase/templates/*.html`, але не підключені
- Один `.env` → немає розділення dev/prod
- Deep linking для email confirmation не налаштований

Це блокує:
1. Автоматичний деплой міграцій (кожна вручну — ризик забути)
2. Безпечний QA (тестуємо на тому ж проекті де прод-дані)
3. Email confirmation flow на реальному пристрої (redirect URL не сконфігурований)
4. Custom email templates (брендовані, українською)
5. EAS production build (secrets не налаштовані)

## User Story

**Як** developer Школярика,
**я хочу** мати 2 ізольовані Supabase проекти (dev + prod) з автоматизованим деплоєм міграцій через CLI,
**щоб** безпечно тестувати зміни схеми без ризику для прод-даних і не робити ручних SQL-деплоїв.

**Як** батько-користувач застосунку,
**я хочу** отримувати email підтвердження українською мовою з правильним deep link,
**щоб** завершити реєстрацію одним тапом.

## Скоп (що ВХОДИТЬ у US-100)

✅ Встановити Supabase CLI + залогінитись
✅ Створити 2 hosted проекти: `shkolyaryk-dev` + `shkolyaryk-prod` (Frankfurt region)
✅ `supabase init` — згенерувати `config.toml` у репозиторії
✅ `supabase link` до dev-проекту + `migration repair` для уже-задеплоєних 0001/0002
✅ `supabase db pull` — захопити поточний стан схеми як baseline
✅ Налаштувати `auth` section у `config.toml`: site_url (`shkolyaryk://`), redirect URLs, email templates paths, PKCE, JWT expiry
✅ Підключити існуючі email templates (`supabase/templates/email_confirmation.html`, `email_reset_password.html`, `email_magic_link.html`) через `config.toml`
✅ `supabase config push` до dev
✅ Два `.env` файли: `.env` (dev) + `.env.production` (prod) — обидва в `.gitignore`, `.env.example` з placeholder-ами commit
✅ `app.json` — переконатись що `"scheme": "shkolyaryk"` присутній + deep link working
✅ Dashboard → Auth → URL Configuration → Site URL + Redirect URLs для dev-проекту
✅ Документація в `README.md` або `docs/supabase-setup.md`: як новому розробнику підняти локальний env + як деплоїти міграцію
✅ Smoke test: створити нову тестову міграцію, задеплоїти через `supabase db push`, перевірити в Dashboard

## Виключено (НЕ робимо у US-100)

❌ Локальний Docker stack (`supabase start`) — Docker не встановлений на dev-машині, hosted projects достатньо для потреб
❌ EAS production secrets (`eas secret:create`) — робимо коли дійде до production build (окрема US)
❌ Storage bucket `avatars` + RLS policies — частина US-056 (Avatar Builder)
❌ US-015 (Supabase sync для child_profiles) — це окрема story, вона використає інфраструктуру з US-100
❌ Backup policy / disaster recovery — free tier автобекапи, окрема ops story коли буде paid tier
❌ Rate limiting tuning — залишаємо defaults, tune коли будуть реальні юзери
❌ Multi-region replication — MVP на одному регіоні
❌ CI/CD GitHub Actions для auto-migration — вручну `db push` достатньо поки команда = 1 dev

## Acceptance Criteria

### CLI + проекти
- [ ] **AC-1:** Supabase CLI встановлений (`supabase --version` повертає ≥1.200.0)
- [ ] **AC-2:** У Supabase Dashboard створені 2 проекти: `shkolyaryk-dev` + `shkolyaryk-prod` (обидва Frankfurt `eu-central-1`)
- [ ] **AC-3:** Project refs записані в `docs/supabase-setup.md` (або README)
- [ ] **AC-4:** `supabase login` виконано, auth token працює

### Репозиторій
- [ ] **AC-5:** `supabase init` згенерував `supabase/config.toml`
- [ ] **AC-6:** `config.toml` закомічений з адекватними значеннями (site_url, redirect_urls, email templates paths)
- [ ] **AC-7:** `supabase/.temp/` і `supabase/.branches/` додані в `.gitignore`
- [ ] **AC-8:** `.env.example` оновлений з двома блоками (dev/prod) + коментарем "copy to .env"

### Link + baseline migrations
- [ ] **AC-9:** `supabase link --project-ref <DEV_REF>` успішний
- [ ] **AC-10:** `supabase migration repair --status applied 0001 0002` виконано (історія консистентна з реальною БД)
- [ ] **AC-11:** `supabase db pull` створив baseline-міграцію `YYYYMMDDHHMMSS_remote_schema.sql` (або міграції чисті, якщо repair покрив усе)
- [ ] **AC-12:** `supabase migration list` показує 0001, 0002 як applied, без pending

### Auth config
- [ ] **AC-13:** `config.toml [auth]` має `site_url = "shkolyaryk://"` + `additional_redirect_urls = ["shkolyaryk://auth/callback", "http://localhost:8081"]`
- [ ] **AC-14:** `config.toml [auth.email]` включає `enable_signup = true`, `enable_confirmations = true`, `double_confirm_changes = true`
- [ ] **AC-15:** Email templates (`confirmation`, `recovery`, `magic_link`) прив'язані через `content_path`, subject українською
- [ ] **AC-16:** `supabase config push` виконано для dev-проекту без помилок
- [ ] **AC-17:** У Dashboard → Auth → URL Configuration для dev-проекту: Site URL = `shkolyaryk://`, Redirect URLs містить `shkolyaryk://auth/callback` (fallback на випадок якщо config push не покрив)

### App config
- [ ] **AC-18:** `app.json` має `"scheme": "shkolyaryk"` (expo-linking готовий парсити deep link)
- [ ] **AC-19:** `.env` (dev) заповнений реальними dev-значеннями, `.env.production` — prod-значеннями
- [ ] **AC-20:** Обидва `.env*` файли в `.gitignore` (перевірити `git check-ignore .env .env.production`)

### Smoke test
- [ ] **AC-21:** Створено тестову міграцію `supabase migration new test_devops_setup` з NO-OP SQL (`SELECT 1;`)
- [ ] **AC-22:** `supabase db push` успішно задеплоїв її у dev
- [ ] **AC-23:** У Dashboard → Database → Migrations видно нову міграцію
- [ ] **AC-24:** Тестова міграція видалена локально + `supabase migration repair --status reverted` (або залишена як marker, на вибір)
- [ ] **AC-25:** Запуск `npx expo start -c` з новим `.env` — auth flow працює (register → email → confirmation → dashboard)
- [ ] **AC-26:** Email confirmation link відкриває app через deep link `shkolyaryk://` (manual test на реальному пристрої або симуляторі)

### Документація
- [ ] **AC-27:** `docs/supabase-setup.md` описує: як встановити CLI, як залінкувати проект, як деплоїти міграцію, як переключатись dev↔prod
- [ ] **AC-28:** `.bmad/HANDOFF.md` оновлений: Supabase sync тепер автоматичний через CLI, не manual

## Tasks

### Step 1 — Install & create projects (~30min)
1. [ ] Встановити CLI: `scoop install supabase` АБО `npm install -g supabase`
2. [ ] `supabase --version` — verify
3. [ ] Dashboard → створити `shkolyaryk-dev` (Frankfurt)
4. [ ] Dashboard → створити `shkolyaryk-prod` (Frankfurt)
5. [ ] Записати обидва project refs + anon keys (dev used зараз, prod — збережи для майбутнього)

### Step 2 — Init repo + link (~45min)
6. [ ] `cd d:/Dev/shkolyaryk && supabase init` (якщо `config.toml` не існує)
7. [ ] `supabase login` (відкриє браузер)
8. [ ] `supabase link --project-ref <DEV_REF>`
9. [ ] `supabase migration repair --status applied 0001` + те саме для `0002`
10. [ ] `supabase db pull` — перевірити що не з'являються непотрібні diff-міграції; якщо з'являються — решіти чи прийняти як baseline чи робити truncate
11. [ ] `supabase migration list` — verify clean state
12. [ ] Оновити `.gitignore` (`supabase/.temp/`, `supabase/.branches/`)

### Step 3 — Configure auth + email (~45min)
13. [ ] Відредагувати `supabase/config.toml` — `[auth]`, `[auth.email]`, `[auth.email.template.*]` секції (див. Technical notes нижче)
14. [ ] `supabase config push` — deploy до dev
15. [ ] У Dashboard → Auth → URL Configuration для dev: Site URL + Redirect URLs (fallback якщо config push не покрив)
16. [ ] Перевірити що email templates видно в Dashboard → Auth → Email Templates

### Step 4 — App side (~30min)
17. [ ] Перевірити `app.json` `"scheme": "shkolyaryk"` (якщо нема — додати)
18. [ ] Створити `.env.production` (з prod URL + anon key)
19. [ ] Оновити `.env` з dev-значеннями (якщо там вже щось є від прошлого manual setup — переконатись що це саме DEV_REF)
20. [ ] Оновити `.env.example` з двома блоками + коментарями
21. [ ] `git check-ignore .env .env.production` — обидва мають бути ignored

### Step 5 — Smoke test (~30min)
22. [ ] `supabase migration new test_devops_setup` + `SELECT 1;` у згенерованому файлі
23. [ ] `supabase db push`
24. [ ] Dashboard → Database → Migrations — verify
25. [ ] `npx expo start -c` → register test account → email → click confirmation link → app opens + user logged in
26. [ ] Видалити тестову міграцію локально (не обов'язково repair — наступна `db push` ніяк не зачепить)

### Step 6 — Docs (~30min)
27. [ ] `docs/supabase-setup.md` — короткий runbook (install → link → migration lifecycle → env switching)
28. [ ] Оновити `.bmad/HANDOFF.md` — sync статус
29. [ ] Оновити `CLAUDE.md` (root) — секція Supabase DevOps (опційно, якщо корисно агентам)

## Технічні нотатки

### `supabase/config.toml` — ключові секції

```toml
[api]
enabled = true

[auth]
enabled = true
site_url = "shkolyaryk://"
additional_redirect_urls = [
  "shkolyaryk://auth/callback",
  "shkolyaryk://",
  "http://localhost:8081"
]
jwt_expiry = 3600
enable_refresh_token_rotation = true
refresh_token_reuse_interval = 10

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true
secure_password_change = true

[auth.email.template.confirmation]
subject = "Підтвердьте email — Школярик"
content_path = "./supabase/templates/email_confirmation.html"

[auth.email.template.recovery]
subject = "Відновлення паролю — Школярик"
content_path = "./supabase/templates/email_reset_password.html"

[auth.email.template.magic_link]
subject = "Вхід у Школярик"
content_path = "./supabase/templates/email_magic_link.html"

[db]
major_version = 15
```

### `.env.example`

```bash
# ============ DEV ============
# Copy to .env (gitignored)
EXPO_PUBLIC_SUPABASE_URL=https://<dev-project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<dev-anon-key>

# ============ PROD ============
# Copy to .env.production (gitignored)
# Used by EAS production builds (eas secret:create)
# EXPO_PUBLIC_SUPABASE_URL=https://<prod-project-ref>.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
```

### `.gitignore` додатки

```gitignore
supabase/.temp/
supabase/.branches/
.env
.env.production
.env.local
```

### Перемикання dev ↔ prod для CLI operations

```bash
# Робота з dev
supabase link --project-ref <DEV_REF>
supabase db push

# Реліз на prod
supabase link --project-ref <PROD_REF>
supabase db push
```

Expo app сам не знає про prod — бере значення з `.env` (dev) або з EAS secrets (prod build).

### Lifecycle нової міграції

```bash
supabase migration new add_child_profiles_table
# ... пишеш SQL у supabase/migrations/YYYYMMDDHHMMSS_add_child_profiles_table.sql ...
supabase db push                       # deploy
git add supabase/migrations && git commit -m "feat(us-015): child_profiles schema"
```

### Архітектурні рішення

- **Chosen: hosted projects (не local Docker stack)** — Docker не встановлений, встановлення додає friction. Для команди=1 dev hosted cheaper у часі. Якщо команда зросте — додамо local stack як US-101.
- **Chosen: 2 проекти (dev + prod), не 3** — staging зливаємо з dev. Якщо в майбутньому буде beta-channel — додамо staging як окремий проект без зміни коду (нова `.env.staging`).
- **Chosen: migration repair замість drop+reapply** — уже-задеплоєні міграції помічаємо applied, не чіпаємо реальну схему. Безпечніше.
- **Chosen: config.toml в git** — source of truth для auth setup. Dashboard-changes не синхронізуються автоматично, тому після змін у Dashboard треба або `supabase config push` або ручний sync у toml.
- **Chosen: `shkolyaryk://` як single scheme** — Expo built-in, не потребує Universal Links / App Links налаштування для MVP. Коли дійде до production → додамо https-based links окремою US.

### Rollback plan (якщо щось піде не так)

- `migration repair` — reversible, можна скинути статус: `supabase migration repair --status reverted <version>`
- `config push` — новий push з старим config-ом все повертає
- Delete project у Dashboard — останній крок, якщо dev-проект зіпсований, створити новий + `supabase link --project-ref` на новий

### Залежності

- Supabase CLI: https://supabase.com/docs/guides/cli
- Scoop (Windows): https://scoop.sh — `scoop install supabase` (офіційний репозиторій)
- Expo deep linking: https://docs.expo.dev/guides/linking/

### Що НЕ робити (anti-scope-creep)

- НЕ піднімати Docker stack — окрема US коли потрібно
- НЕ додавати GitHub Actions для auto-push — вручну достатньо для solo-dev
- НЕ створювати staging проект — US-100 покриває dev+prod
- НЕ рефакторити existing SDK client — він працює, залишаємо
- НЕ додавати нові міграції (крім smoke-test no-op) — це задача US-015 і далі

## QA Notes

### Критичні тести після завершення

1. Cold register → email → тап по confirmation link → app відкривається через deep link → dashboard видно
2. Forgot password → email → recovery link → зміна паролю → логін працює
3. `supabase db push` з новою міграцією → видно в Dashboard
4. `supabase migration list` → чистий стан, немає pending
5. Prod проект не чіпається (перевірити — `supabase link` вказує на DEV, не PROD)

### Known risks

- **Risk 1:** `db pull` може згенерувати diff-міграцію з неочікуваними ALTER TABLE — якщо так, треба ручний cleanup або прийняти як baseline
- **Risk 2:** Email templates можуть не рендеритись корректно через обмеження Supabase template engine (Go templates) — потестити на реальному email
- **Risk 3:** Deep link на Expo Go може не працювати так само як на standalone build — testable на web/simulator, final verify — тільки в EAS build

## Зв'язки

- **Blocks:** US-015 (Supabase profile sync), US-017 (якщо буде про real-time features), US-056 (Avatar Builder — потребує Storage bucket setup, який додаватиметься тут як extension)
- **Related:** US-003 (Supabase Auth — вже готовий, цей US автоматизує infrastructure), US-014 (hotfix deploy of 0002 був manual — тепер буде через CLI)
- **Epic:** EP-INF (Infrastructure, новий — додати в README роадмапу)
- **Prerequisite для:** production EAS build, US-015 (profile sync), US-056 (Avatar Builder Storage)

## Відкриті питання для /pm

- **Q-1:** Чи створюємо окремий `shkolyaryk-staging` проект, або dev = staging? → **Рішення:** dev = staging (не ускладнюємо поки команда = 1)
- **Q-2:** Чи переносимо US-100 → US-016 з зсувом EP-06 Математика (US-016..US-020) на US-017..US-021? → **Рішення:** Поки залишаємо US-100 (infra, поза product roadmap). Якщо /pm хоче жорстку послідовність — окрема refactor-sесія над README.
- **Q-3:** Чи додаємо `supabase start` (локальний Docker) як follow-up US? → **Відкладено** до моменту коли dev-team зросте або dev-проект почне стикатись з лімітами.
