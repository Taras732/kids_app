---
id: US-002
epic: EP-01
title: UI Kit базові компоненти
status: ready
priority: Must
estimate: 2h
phase: 1
project: Школярик
---

# US-002 — UI Kit базові компоненти

## User Story
**Як** розробник,
**я хочу** мати набір базових UI компонентів адаптованих під 4 вікові групи,
**щоб** всі екрани мали консистентний вигляд і відповідали NFR usability.

## Acceptance Criteria

### AC-1: Кольорова палітра та тема
- **Given** `src/constants/theme.ts`
- **When** імпортую тему
- **Then** доступні наступні кольори:

| Роль | Назва | Hex | Використання |
|------|-------|-----|-------------|
| Primary | `primary` | `#FF6B35` (теплий оранжевий) | Основні кнопки, акценти |
| Primary Light | `primaryLight` | `#FFE0CC` | Фони, hover |
| Secondary | `secondary` | `#4ECDC4` (бірюзовий) | Другорядні кнопки, прогрес |
| Success | `success` | `#45B764` (зелений) | Правильна відповідь, ✓ |
| Error | `error` | `#FF6B6B` (м'який червоний) | Помилки (НЕ агресивний) |
| Warning | `warning` | `#FFD93D` (жовтий) | Попередження |
| Background | `background` | `#FFF8F0` (теплий білий) | Фон додатку |
| Surface | `surface` | `#FFFFFF` | Картки, поверхні |
| Text Primary | `textPrimary` | `#2D3436` | Основний текст |
| Text Secondary | `textSecondary` | `#636E72` | Другорядний текст |
| Text Disabled | `textDisabled` | `#B2BEC3` | Неактивний текст |
| Overlay | `overlay` | `rgba(0,0,0,0.3)` | Затемнення під модалами |

- **And** кольори островів:

| Острів | Колір |
|--------|-------|
| 🔢 Математика | `#FF6B35` (оранжевий) |
| 📖 Букви | `#4ECDC4` (бірюзовий) |
| 🇬🇧 English | `#FF85A1` (рожевий) |
| 🧩 Логіка | `#845EC2` (фіолетовий) |
| 🧠 Пам'ять | `#F9C74F` (жовтий) |
| 🔬 Наука | `#43AA8B` (зелений) |
| 💚 Емоції | `#FF6F91` (коралловий) |
| 🎨 Творчість | `#4CC9F0` (блакитний) |

- **And** spacing шкала: `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 48`
- **And** border-radius: `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `full: 9999`
- **And** shadows:
  - `card`: `{ elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 }`
  - `button`: `{ elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.15, shadowRadius: 3 }`
- **And** контраст ≥ 4.5:1 (WCAG AA) для всіх текст/фон комбінацій

### AC-2: Конфігурація вікових груп
- **Given** `src/constants/ageGroups.ts`
- **When** імпортую конфіг
- **Then** доступні 4 групи з параметрами:

```typescript
type AgeGroup = 'malyuki' | 'doskilnyata' | 'pershoklas' | 'drugoklas';

// Конфіг для кожної групи:
{
  malyuki: {
    id: 'malyuki',
    label: 'Малята',
    emoji: '🐣',
    character: 'Коко',
    ageRange: 'до 4 років',
    minTapSize: 64,           // dp — мінімальний тап-елемент
    fontSize: {
      h1: 28,                 // sp
      h2: 24,
      body: 20,
      caption: 18,
    },
    maxActionsPerScreen: 3,   // NFR-U4
    voiceRequired: true,      // NFR-U5 — озвучка обов'язкова
    animationDuration: 600,   // ms — повільніші анімації
  },
  doskilnyata: {
    id: 'doskilnyata',
    label: 'Дошкільнята',
    emoji: '🐼',
    character: 'Бамбі',
    ageRange: '5-6 років',
    minTapSize: 56,
    fontSize: { h1: 26, h2: 22, body: 18, caption: 16 },
    maxActionsPerScreen: 4,
    voiceRequired: true,
    animationDuration: 500,
  },
  pershoklas: {
    id: 'pershoklas',
    label: '1 клас',
    emoji: '🦊',
    character: 'Ліса',
    ageRange: '6-7 років',
    minTapSize: 48,
    fontSize: { h1: 24, h2: 20, body: 16, caption: 14 },
    maxActionsPerScreen: 5,
    voiceRequired: false,     // озвучка опціональна
    animationDuration: 400,
  },
  drugoklas: {
    id: 'drugoklas',
    label: '2 клас',
    emoji: '🦉',
    character: 'Софі',
    ageRange: '7-8 років',
    minTapSize: 48,
    fontSize: { h1: 24, h2: 20, body: 16, caption: 14 },
    maxActionsPerScreen: 5,
    voiceRequired: false,
    animationDuration: 350,
  },
}
```

- **And** батьківські екрани мають фіксовані розміри: `fontSize: 16sp`, `tapSize: 44dp`

### AC-3: Button компонент — `<AppButton>`
- **Given** `src/components/AppButton.tsx`
- **When** рендерю кнопку
- **Then** props:

| Prop | Type | Default | Опис |
|------|------|---------|------|
| `title` | `string` | required | Текст кнопки |
| `onPress` | `() => void` | required | Callback |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'icon'` | `'primary'` | Стиль |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Розмір (перевизначається ageGroup) |
| `ageGroup` | `AgeGroup` | з контексту | Вікова група → визначає мін. розмір |
| `disabled` | `boolean` | `false` | Неактивна (opacity 0.5, не натискається) |
| `loading` | `boolean` | `false` | Показує spinner замість тексту |
| `icon` | `ReactNode` | - | Іконка зліва від тексту |
| `fullWidth` | `boolean` | `false` | width: 100% |

- **And** стилі по variant:
  - **primary**: фон `primary`, текст білий, shadow `button`, borderRadius `lg`
  - **secondary**: фон `secondary`, текст білий
  - **outline**: прозорий фон, border 2px `primary`, текст `primary`
  - **ghost**: прозорий фон, текст `primary`
  - **icon**: круглий, тільки іконка, без тексту
- **And** анімація натискання (Reanimated):
  - `onPressIn`: scale до 0.95 за 100ms (withSpring)
  - `onPressOut`: scale до 1.0 за 200ms (withSpring)
- **And** мінімальний розмір визначається `ageGroup.minTapSize` (ніколи менше)
- **And** disabled стан: opacity 0.5, натискання ігнорується, немає анімації

### AC-4: Typography — `<AppText>`
- **Given** `src/components/AppText.tsx`
- **When** рендерю текст
- **Then** props:

| Prop | Type | Default | Опис |
|------|------|---------|------|
| `variant` | `'h1' \| 'h2' \| 'body' \| 'caption' \| 'label'` | `'body'` | Стиль тексту |
| `ageGroup` | `AgeGroup` | з контексту | Визначає розмір шрифту |
| `color` | `string` | `textPrimary` | Колір тексту |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Вирівнювання |
| `weight` | `'normal' \| 'medium' \| 'bold'` | залежить від variant | Жирність |
| `children` | `ReactNode` | required | Текст |

- **And** шрифт: sans-serif, дитячий (Nunito або Comfortaa — rounded letterforms)
- **And** line height: fontSize × 1.4 (для читабельності)
- **And** variant defaults:
  - `h1`: bold, `textPrimary`
  - `h2`: medium, `textPrimary`
  - `body`: normal, `textPrimary`
  - `caption`: normal, `textSecondary`
  - `label`: medium, `textSecondary`, uppercase

### AC-5: Card компонент — `<GameCard>`
- **Given** `src/components/GameCard.tsx`
- **When** рендерю картку
- **Then** props:

| Prop | Type | Default | Опис |
|------|------|---------|------|
| `title` | `string` | required | Назва (острів або гра) |
| `emoji` | `string` | required | Емодзі іконка |
| `color` | `string` | required | Фоновий колір (з теми острова) |
| `progress` | `number` | `0` | 0-100, прогрес у % |
| `stars` | `0 \| 1 \| 2 \| 3` | `0` | Зірки (для ігор) |
| `locked` | `boolean` | `false` | Заблоковано (сіре, не натискається) |
| `badge` | `string` | - | Текст бейджа ("Новий!", "Скоро!") |
| `onPress` | `() => void` | required | Callback |
| `ageGroup` | `AgeGroup` | з контексту | Розміри |

- **And** layout картки (вертикальний):
  ```
  ┌──────────────────┐
  │  [badge якщо є]  │  ← правий верхній кут, rounded pill
  │                  │
  │     🔢 (48dp)    │  ← emoji по центру, фон — color з opacity 0.15
  │                  │
  │   Математика     │  ← title, AppText h2, по центру
  │   ⭐⭐☆ або 42%  │  ← stars або progress bar
  └──────────────────┘
  ```
- **And** розмір картки: адаптивний (grid column width), min height: `ageGroup === 'malyuki' ? 140 : 120` dp
- **And** анімація натискання: scale 0.95 + shadow зникає (Reanimated withSpring)
- **And** locked стан: весь вміст з opacity 0.4, emoji замінюється на 🔒, натискання ігнорується
- **And** shadow: `card` з theme

### AC-6: ProgressBar — `<ProgressBar>`
- **Given** `src/components/ProgressBar.tsx`
- **When** рендерю прогрес-бар
- **Then** props:

| Prop | Type | Default | Опис |
|------|------|---------|------|
| `value` | `number` | required | 0-100 |
| `color` | `string` | `secondary` | Колір заповнення |
| `backgroundColor` | `string` | `#E0E0E0` | Колір фону |
| `height` | `number` | `8` | Висота в dp |
| `showLabel` | `boolean` | `false` | Показувати "42/100 XP" |
| `label` | `string` | - | Кастомний лейбл |
| `animated` | `boolean` | `true` | Анімація заповнення |

- **And** layout:
  ```
  ┌─────────────────────────────────┐
  │████████████░░░░░░░░░░░░░░░░░░░░│  ← border-radius: height / 2
  └─────────────────────────────────┘
       42/100 XP                      ← label під баром (якщо showLabel)
  ```
- **And** анімація: при зміні value — плавне заповнення за 500ms (Reanimated withTiming)
- **And** при value=100: колір змінюється на `success`, пульсуюча анімація (1 раз)

### AC-7: StarRating — `<StarRating>`
- **Given** `src/components/StarRating.tsx`
- **When** рендерю зірки
- **Then** props:

| Prop | Type | Default | Опис |
|------|------|---------|------|
| `stars` | `0 \| 1 \| 2 \| 3` | required | Кількість заповнених |
| `maxStars` | `number` | `3` | Максимум |
| `size` | `number` | `24` | Розмір зірки в dp |
| `animated` | `boolean` | `true` | Анімація появи |

- **And** заповнені зірки: ⭐ (золоті), незаповнені: ☆ (сірі, opacity 0.3)
- **And** анімація: зірки з'являються послідовно з інтервалом 200ms (scale from 0 to 1 + bounce)

### AC-8: SafeScreen wrapper — `<SafeScreen>`
- **Given** `src/components/SafeScreen.tsx`
- **When** обгортаю екран
- **Then** props: `backgroundColor`, `scroll` (boolean), `padding` (boolean)
- **And** включає: `SafeAreaView` + optional `ScrollView` + default padding `md`
- **And** фон: `theme.background` за замовчуванням
- **And** враховує notch/dynamic island (iOS) та navigation bar (Android)

## Tasks
1. [ ] `src/constants/theme.ts` — кольори, spacing, shadows, border-radius
2. [ ] `src/constants/ageGroups.ts` — конфіг 4 вікових груп + батьківський
3. [ ] `src/components/AppButton.tsx` — кнопка з variants та age-adaptive sizes
4. [ ] `src/components/AppText.tsx` — типографіка з age-adaptive fonts
5. [ ] `src/components/GameCard.tsx` — картка острова/гри
6. [ ] `src/components/ProgressBar.tsx` — анімований прогрес-бар
7. [ ] `src/components/StarRating.tsx` — зірки з анімацією
8. [ ] `src/components/SafeScreen.tsx` — safe area wrapper
9. [ ] Тестовий екран `/dev` з усіма компонентами (видалити перед production)

## Технічні нотатки
- Reanimated: використовувати `useAnimatedStyle`, `withSpring`, `withTiming`
- AgeGroup context: створити `AgeGroupProvider` (React Context) щоб не передавати prop скрізь
- Не використовувати зовнішні UI бібліотеки (NativeBase, Tamagui, Paper) — все кастомне
- Шрифт Nunito: `expo-google-fonts/nunito` або bundled в assets/fonts/
- Responsive: `useWindowDimensions()` для адаптації під phone/tablet
- Всі компоненти — функціональні, з memo() для оптимізації рендерів

## QA Notes
- Перевірити: кожен компонент рендериться без помилок на iOS, Android, Web
- Перевірити: розміри кнопок/тексту змінюються при зміні ageGroup
- Перевірити: контраст кольорів ≥ 4.5:1 (інструмент: WebAIM Contrast Checker)
- Перевірити: анімації плавні, 60 FPS (Reanimated performance monitor)
- Перевірити: disabled стани працюють (opacity, не реагують на натискання)
- Перевірити: тапабельні елементи ≥ minTapSize для кожної вікової групи

---
**Definition of Done:**
- [ ] Всі AC виконані
- [ ] Компоненти рендеряться на iOS, Android, Web
- [ ] Коміт: `feat(us-002): ui kit base components`
- [ ] Story оновлена зі статусом `done`
