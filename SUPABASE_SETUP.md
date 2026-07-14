# Supabase Setup — Школярик

Покрокова інструкція налаштування Supabase для авторизації та аналітики.

## 1. Створити проект

1. Зайти на https://supabase.com/dashboard → **New project**
2. Назва: `shkolyaryk` (або `shkolyaryk-dev` для dev)
3. Регіон: **West EU (Frankfurt)** — найближчий до України
4. Database password: згенерувати та зберегти у менеджері паролів
5. Pricing plan: **Free** (для MVP достатньо)

Після створення чекати ~2 хв поки проект ініціалізується.

## 2. Отримати ключі

**Settings → API**:
- `Project URL` → скопіювати у `.env` як `VITE_SUPABASE_URL`
- `anon public` key → скопіювати у `.env` як `VITE_SUPABASE_ANON_KEY`

Приклад `.env` (клієнтські змінні, потрапляють у браузерний бандл — лише публічні ключі):
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

🔐 **Для команди секрети керуються через SOPS+age**, не руками в `.env`:
- Значення шифруються у `secrets/dev.env`
- Розшифрувати у `.env`: `bash scripts/load-env.sh` (або `powershell -File scripts/load-env.ps1`)
- Потрібен age-ключ у `~/.config/sops/age/keys.txt` / `%APPDATA%\sops\age\keys.txt`
- `SUPABASE_SERVICE_ROLE_KEY` — сервер-only, **лише для seed/адмін-скриптів**, НІКОЛИ у клієнтський код чи `VITE_*`

Повний перелік змінних — `.env.example`.

## 3. Застосувати SQL-міграцію

**SQL Editor → New query** → вставити вміст `supabase/migrations/0001_analytics_events.sql` → **Run**.

Перевірити:
- **Table Editor** → має з'явитися `analytics_events`
- **Authentication → Policies** → RLS enabled, 3 політики (insert/select/update own)

## 4. Налаштувати Auth

**Authentication → Providers**:
- `Email` → увімкнено, `Confirm email` = **ON**
- `Phone`, OAuth — вимкнути на MVP

**Authentication → URL Configuration**:
- `Site URL`: `shkolyaryk://` (для mobile deep-link)
- `Redirect URLs`: додати
  - `shkolyaryk://auth/callback`
  - `http://localhost:8081` (web dev)
  - `https://shkolyaryk.app` (майбутній prod web)

**Authentication → Email Templates**:

Для кожного шаблону вставити HTML з `supabase/templates/`:
- `Confirm signup` → `email_confirmation.html`
- `Reset Password` → `email_reset_password.html`
- `Magic Link` → `email_magic_link.html` (опційно)

Subject:
- Confirm signup: `Підтвердіть email — Школярик`
- Reset Password: `Відновлення паролю — Школярик`

## 5. Перевірити інтеграцію

```bash
cd D:/Dev/shkolyaryk
npm run dev
```

- Відкрити застосунок у браузері (адреса виведе Vite, зазвичай `http://localhost:5173`)
- Зареєструвати тестовий email
- Перевірити лист підтвердження українською
- Клікнути лінк → авторизація має працювати

## 6. Rate limits (Free tier)

- Auth: 30 email/hour
- DB: 500 MB
- Bandwidth: 5 GB/місяць
- API: 2 req/sec без ліміту

Для MVP достатньо. Upgrade → Pro ($25/міс) коли >100 DAU.

## 7. Backup & Security

- **Settings → Database → Backups**: автоматичні (Pro tier)
- На Free — вручну: `pg_dump` раз на тиждень
- НЕ коммітити `.env` у git (вже у `.gitignore`)
- `service_role` key — тільки для backend, НЕ в mobile app
