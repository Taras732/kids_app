# User Stories — Школярик v3.0

> Після pivot: прибрано оцінки, ДЗ, щоденник. Фокус — ігровий розвиток 3-8 років.

## Epic Map

| # | Епік | Phase | Stories |
|---|------|-------|---------|
| EP-01 | Project Setup | 1 | US-001..US-002 |
| EP-02 | Auth & Registration | 1 | US-003..US-005 |
| EP-03 | Onboarding | 1 | US-006..US-009 |
| EP-04 | Hub (головний екран) | 1 | US-010..US-011 |
| EP-05 | Game Engine | 2 | US-012..US-015 |
| EP-06 | 🔢 Математика | 2 | US-016..US-020 |
| EP-07 | 📖 Букви | 2 | US-021..US-026 |
| EP-08 | 🇬🇧 English | 2 | US-027..US-029 |
| EP-09 | 🧩 Логіка | 2 | US-030..US-035 |
| EP-10 | 🧠 Пам'ять | 2 | US-036..US-040 |
| EP-11 | 🔬 Наука | 2.5 | US-041..US-044 |
| EP-12 | 💚 Емоції | 2.5 | US-045..US-048 |
| EP-13 | 🎨 Творчість | 2.5 | US-049..US-051 |
| EP-14 | XP & Рівні | 3 | US-052..US-053 |
| EP-15 | Бейджі | 3 | US-054..US-055 |
| EP-16 | Аватар | 3 | US-056..US-057 |
| EP-17 | Батьківська панель | 3 | US-058..US-060 |
| EP-18 | Озвучка & Аудіо | 3 | US-061..US-062 |
| EP-19 | Аналітика | 3 | US-063..US-064 |
| EP-20 | Офлайн & Sync | 4 | US-065..US-066 |
| EP-21 | Polish & Testing | 4 | US-067..US-069 |
| EP-22 | Store Submission | 5 | US-070..US-072 |

## Naming Convention
- Файли: `US-XXX — Short Title.md`
- Шаблон: [[../../../../99_Meta/Templates/US-Story|US-Story]]
- Кодування: US-001 до US-072

## Status Legend
- `draft` — написана, не перевірена
- `ready` — готова до розробки
- `in-progress` — в роботі
- `review` — код готовий, очікує manual QA перед `done`
- `done` — реалізована, AC підтверджені

## Поза roadmap (Infrastructure)
| # | Story | Статус |
|---|-------|--------|
| US-100 | Supabase DevOps Setup | `ready` (blocked: user install) |

## Current progress (2026-04-20)
| Story | Title | Status | Commit |
|-------|-------|--------|--------|
| US-001 | Ініціалізація Expo проекту | done | `76b681a` |
| US-003 | Supabase Auth setup | done | `e42d710` |
| US-012 | M10 Core Game Loop MVP | done | `bbac839` |
| US-013 | M14 Count Objects MVP | review | `bd4bc03` |
| US-014 | Child Profile Picker | done | `591f9e2` |
| US-015 | Supabase Profile Sync | draft (blocked by US-100) | — |
| US-016 | M15 Math Expressions MVP | review | `8e9c6d5` |
| US-017 | M16 Number Compare MVP | review | `bc5645d` |
| US-018 | M17 Shapes Recognize MVP | review | `723c99b` |
| US-021 | M19 Letters Find MVP | review | `fc90f2a` |
| US-027 | M25 ABC Find Letter EN | review | `10c05a9` |
| US-030 | M28 Odd One Out MVP | review | `634cacd` |
| US-045 | M43 Emotions Recognize | review | `62d0ce2` |
| US-036 | M34 Memory Match MVP | review | `77ad1cb` |
| US-041 | M41 Animals Habitat MVP | review | `21bdd72` |
| US-049 | M47 Color Find MVP | review | `6cbc762` |
| US-037 | M37 Sequence Repeat MVP | review | `88aff2c` |
| US-038 | M38 What's Changed MVP | review | `89ea78b` |
| US-023 | M23 Syllable Build MVP | review | `ff23b73` |
| US-031 | M29 Pattern Continuation MVP | review | `c33135d` |
| US-028 | M26 English Word Picture MVP | review | `96f132e` |
| US-052 | Engagement Foundation (session + badges + Hub) | review | `16003a8` |
| US-042 | M39 Water States MVP | review | `7bbf86a` |
| US-043 | M40 Plant Grow MVP | review | `7bbf86a` |
| US-044 | M42 Sink Float MVP | review | `7bbf86a` |
| US-046 | M44 Hero Emotion MVP | review | `7bbf86a` |
| US-047 | M45 Breathing MVP | review | `7bbf86a` |
| US-048 | M46 Safety MVP | review | `7bbf86a` |
| US-100 | Supabase DevOps Setup | ready (blocked) | — |

## Повна декомпозиція
Див. [[../../02_Estimation/Decomposition|Decomposition]] — оцінки, пріоритети, mapping FR→Epic→Story.

## BMAD Workflow (активовано 2026-04-15)

Команди в `.claude/commands/`:
- `/pm` — оновлення `prd.md`, беклог, пріоритизація
- `/sm` — створення story з AC та Tasks (цей файл — формат)
- `/dev` — реалізація story (статус `in_progress`)
- `/qa` — перевірка AC, патернів, typecheck (статус `review` → `done`)
- `/architect` — технічні рішення, оновлення `CLAUDE.md`

**Правило:** задача > 30 хв або фідбек 2+ пунктів → `/sm` ПЕРЕД кодом.

Hotfix-роботи (без story) трекаємо у `_HOTFIXES.md` для прозорості.

---

**Related:** [[../../01_Discovery/ТЗ|ТЗ]] · [[../../01_Discovery/Функціональні вимоги|FR]] · [[../../Roadmap|Roadmap]]
