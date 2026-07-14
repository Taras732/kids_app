# Школярик

Дитячий навчальний застосунок (web-PWA) для дітей дошкільного та молодшого шкільного віку (НУШ, 1–4 клас). Навчальні ігри з адаптивною складністю під клас дитини, щоденний план занять, відстеження прогресу та кабінет батьків з тижневими звітами.

## Стек

- **React 18** + **TypeScript** + **Vite** (SPA, `react-router-dom`)
- **Zustand** — стан застосунку (`src/stores`)
- **Supabase** — авторизація + БД (Postgres) для профілів, прогресу, аналітики
- **vite-plugin-pwa** — офлайн-режим / installable PWA
- Деплой: nginx-контейнер на node-auto через `scripts/deploy-dev.sh`

## Запуск

```bash
npm install

# secrets через SOPS+age → .env (див. SUPABASE_SETUP.md)
bash scripts/load-env.sh   # або: powershell -File scripts/load-env.ps1

npm run dev      # dev-сервер (Vite)
npm run build     # прод-збірка (tsc + vite build) → dist/
npm run preview   # локальний прев'ю збірки
npm run lint      # ESLint
```

Тести (Vitest, `*-core.test.ts` поруч з логікою):

```bash
npx vitest run
```

## Структура

```
src/
  pages/        # екрани: Welcome, Auth, Onboarding, RoleSelect, Hub, DayPlan,
                # GamePlayer, Placement, ParentDashboard
  games/        # каталог навчальних ігор (registry.ts = реєстр + profileClass/
                # рівні складності; types.ts = ClassLevel/CLASS_META/Subject;
                # кожна гра — окрема тека з generate()/компонентом)
  school/       # навчальне ядро: mastery (засвоєння навичок), planner
                # (щоденний план), placement (діагностика), progress, report
                # (тижневі звіти), offline (офлайн-завдання), db.ts (Supabase-запити)
  components/   # переюзабельні UI-компоненти (ParentalGate, WeeklyReport, OfflineTask)
  stores/       # Zustand: useAuthStore (сесія/акаунт), useProfileStore (профілі дітей)
  content/      # статичний навчальний контент
  utils/        # supabase.ts та інші утиліти
```

## Деплой (dev)

```bash
bash scripts/deploy-dev.sh
```

Білдить проєкт, пакує `dist/`, копіює на node-auto в bind-mount контейнера `shkolyaryk-dev-web` (nginx). Доступно за адресою:

**https://shkolyaryk-dev.kuznya.studio/**

## Supabase

Налаштування проєкту Supabase (env-змінні, міграції, auth, email-шаблони) — див. [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).
