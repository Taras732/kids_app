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
| **EP-06 Математика** | 2 | US-016..020 | 🟡 US-016/017/018 ✅ review — 3/5 готово (US-019/020 tangram deferred) |
| **EP-07 Букви** | 2 | US-021..026 | 🟡 US-021 ✅ review — 1/6 готово |
| **EP-08 English** | 2 | US-027..029 | 🟡 US-027 ✅ review — 1/3 готово |
| **EP-09 Логіка** | 2 | US-030..035 | 🟡 US-030 ✅ review — 1/6 готово (tap-the-dot до логіки) |
| **EP-10 Пам'ять** | 2 | US-036..040 | 🟡 US-036, US-037, US-038 ✅ review — 3/5 готово |
| **EP-11 Наука** | 2.5 | US-041..044 | 🟡 US-041 ✅ review — 1/4 готово |
| **EP-12 Емоції** | 2.5 | US-045..048 | 🟡 US-045 ✅ review — 1/4 готово |
| **EP-13 Творчість** | 2.5 | US-049..051 | 🟡 US-049 ✅ review — 1/3 готово |
| EP-INF Infrastructure | — | US-100 | 🟡 ready (blocked: user needs to install CLI + create Supabase projects) |

Повна декомпозиція: `.bmad/stories/README.md`

## Active milestones (2026-04-19)
1. **US-013 Count Objects** ✅ review (commit `bd4bc03`) — manual QA pending
2. **US-016 Math Expressions** ✅ review (commit `8e9c6d5`) — manual QA pending
3. **US-017 Number Compare** ✅ review (commit `bc5645d`) — manual QA pending
4. **US-018 Shapes Recognize** ✅ review (commit `723c99b`) — manual QA pending
5. **US-021 Letters Find** ✅ review (commit `fc90f2a`) — manual QA pending, **перший островів letters**
6. **US-100 Supabase DevOps** 🚧 drafted, потребує user-action (install CLI, create 2 projects)
7. **US-015 Profile Sync** 📝 stub, depends on US-100
8. **US-030 Odd One Out** ✅ review (commit `634cacd`) — EP-09 Логіка started
9. **US-027 ABC Find Letter EN** ✅ review (commit `10c05a9`) — EP-08 English started
10. **US-045 Emotions Recognize** ✅ review (commit `62d0ce2`) — EP-12 Емоції started
11. **US-036 Memory Match MVP** ✅ review (commit `77ad1cb`) — EP-10 Пам'ять started, перший multi-tap pattern
12. **US-041 Animals Habitat MVP** ✅ review (commit `21bdd72`) — EP-11 Наука started, 7-й острів
13. **US-049 Color Find MVP** ✅ review (commit `6cbc762`) — EP-13 Творчість started, **всі 8 островів покриті ≥1 грою**
14. **US-037 Sequence Repeat MVP** ✅ review (commit `88aff2c`) — EP-10 extended, playback→input pattern + array answer
15. **US-038 What's Changed MVP** ✅ review (commit `89ea78b`) — EP-10 3rd game, memorize→detect pattern
16. **MVP set progress:** 13 ігор на 8 островах (math 4 + letters 1 + logic 2 + english 1 + emotions 1 + memory 3 + science 1 + creativity 1). Architecture validated on 6 unique patterns. Memory island — 3 distinct mechanics.

## Монетизація
- Ігри — безкоштовно
- Курси (Phase 6+) — Udemy-модель: $2-4/курс або $3.99/міс

## NFR (highlights)
- Офлайн-first: всі ігри працюють без мережі
- Bundle ≤ 50 MB
- COPPA + Apple Kids Category + Google Play Families Policy compliant
- Zero third-party tracking SDKs
