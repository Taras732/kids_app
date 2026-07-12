// BRIEF SHK-A3: валідація мапінгу ігор → skill-graph математики (Lane 1, depends on A2).
//
// Що робить:
//  1. Бандлить src/games/registry.ts через esbuild (тимчасово, в пам'яті) — щоб реально
//     ІМПОРТУВАТИ GAMES з живого TS/TSX-коду (а не парсити текст регулярками), без
//     потреби у vite dev-сервері чи ts-node/tsx у devDependencies.
//  2. Імпортує MATH_SKILLS з supabase/seed/skills-math.data.mjs (той самий масив, що і
//     src/school/skills-math.ts, але вже plain-JS — саме для таких node-скриптів без мережі).
//  3. Перевіряє, що кожен skillId у кожної math-гри реально існує в MATH_SKILLS.
//  4. Друкує звіт: скільки ігор змаплено, скільки/які math-skills лишились непокриті.
//
// Запуск: node src/games/_verify-skill-map.mjs
// Без мережі, нічого не пише в Supabase. Код репозиторію не змінює (тимчасовий
// бандл-файл створюється і одразу видаляється, навіть при помилці).

import esbuild from 'esbuild';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
import { MATH_SKILLS } from '../../supabase/seed/skills-math.data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryEntry = path.join(__dirname, 'registry.ts');
const tmpBundlePath = path.join(__dirname, '.verify-tmp-bundle.mjs');

/** Бандлить registry.ts у ESM-код і динамічно імпортує його з тимчасового файлу в repo
 * (потрібно, щоб Node зміг резолвити `react`/`canvas-confetti` через node_modules —
 * data:-URL для цього не годиться, Node не резолвить bare-специфаєри з data: URL). */
async function loadGames() {
  const result = await esbuild.build({
    entryPoints: [registryEntry],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    // number-tiles/index.tsx кличе fuzzCheck() лише в dev (import.meta.env.DEV) — під Node
    // цього глобала нема, тож підміняємо на false, щоб просто не гілку не виконувати.
    define: { 'import.meta.env.DEV': 'false' },
    external: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'canvas-confetti'],
    logLevel: 'silent',
  });

  const code = result.outputFiles[0].text;
  writeFileSync(tmpBundlePath, code, 'utf-8');
  try {
    const mod = await import(`${pathToFileURL(tmpBundlePath).href}?t=${Date.now()}`);
    return mod.GAMES;
  } finally {
    unlinkSync(tmpBundlePath);
  }
}

/** Страховка від дрейфу: supabase/seed/skills-math.data.mjs — ручна копія
 * src/school/skills-math.ts (коментар у файлі це явно попереджає). Звіряємо
 * набори id текстом (без імпорту .ts — щоб скрипт лишався TS-компілятор-free). */
function checkMirrorDrift() {
  const srcPath = path.join(__dirname, '..', 'school', 'skills-math.ts');
  const srcText = readFileSync(srcPath, 'utf-8');
  const srcIds = [...srcText.matchAll(/id:\s*'(math\.[^']+)'/g)].map((m) => m[1]);
  const mirrorIds = MATH_SKILLS.map((s) => s.id);
  return {
    onlyInSrc: srcIds.filter((id) => !mirrorIds.includes(id)),
    onlyInMirror: mirrorIds.filter((id) => !srcIds.includes(id)),
  };
}

const GAMES = await loadGames();
const drift = checkMirrorDrift();
const mathSkillIds = new Set(MATH_SKILLS.map((s) => s.id));

const danglingRefs = [];
const mathGamesWithSkills = [];
const mathGamesWithoutSkills = [];
const nonMathGamesWithSkills = [];
const coveredSkillIds = new Set();
let nonMathCount = 0;

for (const game of GAMES) {
  const hasSkillIds = !!game.skillIds && Object.keys(game.skillIds).length > 0;

  if (game.subject === 'math') {
    if (hasSkillIds) {
      mathGamesWithSkills.push(game.id);
      for (const [difficulty, ids] of Object.entries(game.skillIds)) {
        for (const id of ids) {
          coveredSkillIds.add(id);
          if (!mathSkillIds.has(id)) danglingRefs.push({ gameId: game.id, difficulty, skillId: id });
        }
      }
    } else {
      mathGamesWithoutSkills.push(game.id);
    }
  } else {
    nonMathCount += 1;
    if (hasSkillIds) nonMathGamesWithSkills.push(game.id);
  }
}

const uncovered = MATH_SKILLS.filter((s) => !coveredSkillIds.has(s.id)).map((s) => s.id);

console.log('=== SHK-A3: верифікація мапінгу ігор → skills ===\n');
console.log(`Усього ігор у GAMES: ${GAMES.length}`);
console.log(`Математичних ігор зі skillIds: ${mathGamesWithSkills.length} (${mathGamesWithSkills.join(', ')})`);
if (mathGamesWithoutSkills.length > 0) {
  console.log(
    `⚠️  Математичних ігор БЕЗ skillIds (${mathGamesWithoutSkills.length}): ${mathGamesWithoutSkills.join(', ')} ` +
      '— поза межами BRIEF SHK-A3, потребує окремого фолоу-апу.',
  );
}
console.log(`Не-математичних ігор: ${nonMathCount}`);
if (nonMathGamesWithSkills.length > 0) {
  console.log(`❌ Не-математичні ігри зі skillIds (не мало б бути): ${nonMathGamesWithSkills.join(', ')}`);
}

console.log(`\nMATH_SKILLS усього: ${MATH_SKILLS.length}`);
console.log(`Покрито хоч однією грою: ${coveredSkillIds.size} / ${MATH_SKILLS.length}`);
console.log(`Непокрито (${uncovered.length}):`);
for (const id of uncovered) console.log(`  - ${id}`);

console.log('');
if (danglingRefs.length > 0) {
  console.log(`❌ Висячі skillId, яких нема в MATH_SKILLS (${danglingRefs.length}):`);
  for (const r of danglingRefs) console.log(`  - ${r.gameId} [difficulty ${r.difficulty}]: ${r.skillId}`);
} else {
  console.log('✅ Усі skillId у skillIds ігор реально існують у MATH_SKILLS.');
}

if (drift.onlyInSrc.length > 0 || drift.onlyInMirror.length > 0) {
  console.log('\n⚠️  Дрейф між src/school/skills-math.ts і supabase/seed/skills-math.data.mjs:');
  if (drift.onlyInSrc.length > 0) console.log(`  тільки у skills-math.ts: ${drift.onlyInSrc.join(', ')}`);
  if (drift.onlyInMirror.length > 0) console.log(`  тільки у .data.mjs: ${drift.onlyInMirror.join(', ')}`);
} else {
  console.log('\n✅ skills-math.ts і supabase/seed/skills-math.data.mjs у синку (той самий набір id).');
}

process.exit(danglingRefs.length > 0 ? 1 : 0);
