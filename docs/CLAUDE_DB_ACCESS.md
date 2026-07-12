# Доступ Claude до Supabase-БД (щоб міграції котились самі)

**Мета:** дати Claude змогу застосовувати міграції неінтерактивно, без ходіння в дашборд.
**Метод:** один connection string у `.env` (поза git) → Claude робить `supabase db push --db-url`.
**Чому так, а не Personal Access Token:** PAT дає доступ до *всіх* твоїх проєктів. Connection string — тільки цей проєкт. Мінімальні права.

---

## Разове налаштування (5 хв, робиш ти)

1. Дашборд → **Connect** (кнопка вгорі) або **Settings → Database → Connection string**.
2. Обери вкладку **Session pooler** (порт `5432` — потрібен для DDL-міграцій; **не** Transaction/6543).
3. Скопіюй URI. Виглядає так (пароль вже всередині або `[YOUR-PASSWORD]` — встав актуальний):
   ```
   postgresql://postgres.xropufnqojutfhswpftc:ПАРОЛЬ@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
   Пароль — там же: **Reset database password** (згенерує новий, скопіюй одразу).
4. Додай **новим рядком** у `D:/Dev/shkolyaryk/.env`:
   ```
   SUPABASE_DB_URL=postgresql://postgres.xropufnqojutfhswpftc:ПАРОЛЬ@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
   ```
5. Все. `.env` уже в `.gitignore` — у git не потрапить.

---

## Як Claude це використовує

```bash
cd D:/Dev/shkolyaryk
npx supabase db push --db-url "$SUPABASE_DB_URL"        # застосувати нові міграції
npx supabase migration list --db-url "$SUPABASE_DB_URL" # стан: local vs remote
```
Жодного `login`/`link`, жодного інтерактиву — читається зі змінної.

## Правила, яких Claude тримається (навіть з доступом)

- **Тільки ADD-міграції** на прод із живими профілями: `CREATE ... IF NOT EXISTS`, нічого не дропати.
- **Прод-прозорість:** стан `migration list` ДО → push → стан ПІСЛЯ у звіті сесії.
- **Ніколи не друкую** вміст `.env` / рядок / пароль у чат чи логи (максимум — хост без пароля).
- Ризиковані операції (drop, reset, зміна даних) — тільки з твоєї явної згоди.

## Відкликати доступ (будь-коли)

Дашборд → **Settings → Database → Reset database password**. Старий рядок миттєво мертвий — прибери його з `.env`.

---
*Один проєкт `shkolyaryk` = `PRODUCTION`. Окремого dev-інстансу немає, тож цей доступ = доступ до прод-БД. Для MVP прийнятно; якщо заведемо staging — повторимо той самий рядок для staging-проєкту.*
