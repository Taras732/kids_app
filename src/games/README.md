# Games — Plugin Architecture

Кожна гра = ізольований модуль у власній папці.

## Структура гри

```
src/games/math-addition/
├── index.tsx          ← React-компонент гри (GameModule default export)
├── config.json        ← метадані: id, острів, вікові групи, іконка, назва
├── generator.ts       ← функція generateLevel(difficulty, ageGroup) → LevelData
└── assets/            ← специфічні для гри зображення/звуки
```

## Реєстр

`src/games/registry.ts` імпортує всі ігри та експортує масив з метаданими.
Додати нову гру = створити папку + додати рядок у registry.

## Спільні компоненти

`src/games/shared/` — `AnswerButton`, `DragTarget`, `RewardAnimation`, `TimerBar` —
переіспользовуються між іграми.

→ Див. `01_Discovery/Tech_Decisions.md` (TD-06) в Obsidian vault.
