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

## Epic Map (Phase 1 — active)
| Epic | Phase | Stories |
|------|-------|---------|
| EP-01 Project Setup | 1 | US-001..002 |
| EP-02 Auth | 1 | US-003..005 |
| EP-03 Onboarding | 1 | US-006..009 |
| EP-04 Hub | 1 | US-010..011 |

Повна декомпозиція: `.bmad/stories/README.md`

## Монетизація
- Ігри — безкоштовно
- Курси (Phase 6+) — Udemy-модель: $2-4/курс або $3.99/міс

## NFR (highlights)
- Офлайн-first: всі ігри працюють без мережі
- Bundle ≤ 50 MB
- COPPA + Apple Kids Category + Google Play Families Policy compliant
- Zero third-party tracking SDKs
