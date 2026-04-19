# Школярик — PRD

> Мобільний + веб додаток для дітей 3-8 років. Ігровий розвиток через короткі міні-ігри.
> Source of truth: [Obsidian vault](../../Obsidian/Obdsidian_2026/10_Projects/Школярик/)

## Ціль
Реліз в App Store + Google Play + Web до **серпня 2026**.

## Вікові групи
| Mascot | Група | Вік | Фокус |
|--------|-------|-----|-------|
| 🐣 Коко | Малята | 3-4 | Кольори, форми, рахунок 1-5 |
| 🐼 Бамбі | Дошкільнята | 5-6 | Рахунок до 10, склади, логіка |
| 🦊 Ліса | 1 клас | 6-7 | Рахунок до 20, читання |
| 🦉 Софі | 2 клас | 7-8 | Математика до 100, судоку |

## 8 островів
**Інтелектуальний блок:** 🔢 Математика · 📖 Букви · 🇬🇧 English · 🧩 Логіка · 🧠 Пам'ять
**Ментальний блок:** 🔬 Наука · 💚 Емоції · 🎨 Творчість

## Tech stack
- Expo SDK 54 (React Native 0.81, React 19) — iOS + Android + Web
- Expo Router 6 (file-based routing)
- Zustand + MMKV (state + persist)
- Supabase Auth (email + пароль)
- Reanimated 4, Gesture Handler 2, Skia (2D canvas)
- EAS Build/Update/Submit

## Фази (Roadmap)
1. **P0 Discovery** — готово (ТЗ, ігродизайн, tech decisions, US-001..011)
2. **P1 Foundation** (2 тижні) — US-001..011: проект, UI Kit, auth, онбординг, hub
3. **P2 Core Games (Інтелект)** (5-6 тижнів) — ігровий движок + 25 ігор на 5 островах
4. **P2.5 Наука+Емоції+Творчість** (2 тижні) — 11 ігор на 3 островах
5. **P3 Engagement & Parents** (2 тижні) — XP, бейджі, аватар, батьківська панель
6. **P4 Polish** (2-3 тижні) — тести з дітьми, compliance, store assets
7. **P5 Launch** (1 тиждень) — TestFlight, Submit
8. **P6 Post-Launch** — курси, нові острови, мови

## Epic Map (active)
| Epic | Phase | Stories | Статус |
|------|-------|---------|--------|
| EP-01 Project Setup | 1 | US-001..002 | ✅ done |
| EP-02 Auth | 1 | US-003..005 | ✅ done (auth setup) |
| EP-03 Onboarding | 1 | US-006..009 | ✅ done (+ US-014 Profile Picker) |
| EP-04 Hub | 1 | US-010..011 | ✅ done |
| **EP-05 Game Engine** | 2 | US-012..015 | 🟡 US-012 ✅, US-013 ✅ review, US-015 draft (blocked by US-100) |
| **EP-06 Математика** | 2 | US-016..020 | 🟡 US-016 ✅ review, US-017 ✅ review, US-018 ✅ review — 3/5 готово |
| EP-INF Infrastructure | — | US-100 | 🟡 ready (blocked: user needs to install CLI + create Supabase projects) |

Повна декомпозиція: `.bmad/stories/README.md`

## Active milestones (2026-04-19)
1. **US-013 Count Objects** ✅ review (commit `bd4bc03`) — manual QA pending
2. **US-016 Math Expressions** ✅ review (commit `8e9c6d5`) — manual QA pending
3. **US-017 Number Compare** ✅ review (commit `bc5645d`) — manual QA pending
4. **US-018 Shapes Recognize** ✅ review (commit `723c99b`) — manual QA pending
5. **US-100 Supabase DevOps** 🚧 drafted, потребує user-action (install CLI, create 2 projects)
6. **US-015 Profile Sync** 📝 stub, depends on US-100
7. **EP-06 next:** US-019 (shapes extended) або US-020 (logic puzzle) — 2/5 ігор залишилось

## Монетизація
- Ігри — безкоштовно
- Курси (Phase 6+) — Udemy-модель: $2-4/курс або $3.99/міс

## NFR (highlights)
- Офлайн-first: всі ігри працюють без мережі
- Bundle ≤ 50 MB
- COPPA + Apple Kids Category + Google Play Families Policy compliant
- Zero third-party tracking SDKs
