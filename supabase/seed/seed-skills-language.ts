// Сидер skill-graph УКРАЇНСЬКОЇ МОВИ (L1) → Supabase (skills + skill_prerequisites).
// Ідемпотентний: upsert за id (onConflict), повторний запуск не дублює.
// Prod-запис — зі станом ДО/ПІСЛЯ (prod-DB transparency).
//
// Чому TS через tsx, а не .mjs-дзеркало (як у math): дзеркало треба тримати в
// синку руками, і воно вже відстало — у skills-math.data.mjs немає НУШ-полів
// (galuzey/cycle), доданих міграцією 0005. Тут імпортуємо SSOT напряму, тож
// розсинхрон неможливий у принципі.
//
// Env (з .env):
//   VITE_SUPABASE_URL          — інстанс Supabase
//   SUPABASE_SERVICE_ROLE_KEY  — ключ (RLS дозволяє запис у довідник лише service_role)
//
// Запуск:
//   node --env-file=.env --import tsx supabase/seed/seed-skills-language.ts --check   → лише валідація, без мережі
//   node --env-file=.env --import tsx supabase/seed/seed-skills-language.ts           → валідація + upsert
import { LANGUAGE_SKILLS } from '../../src/school/skills-language';
import { createClient } from '@supabase/supabase-js';

const CHECK_ONLY = process.argv.includes('--check');

// ---------- 1. Локальна перевірка DAG (topo-sort, без мережі) ----------

function validateDag(skills: typeof LANGUAGE_SKILLS): string[] {
  const byId = new Map(skills.map((s) => [s.id, s]));
  const errors: string[] = [];

  const seen = new Set<string>();
  for (const s of skills) {
    if (seen.has(s.id)) errors.push(`Дублікат id: ${s.id}`);
    seen.add(s.id);
  }

  const ORDER = ['L0', 'L1', 'L2', 'L3', 'L4'];
  for (const s of skills) {
    for (const p of s.prerequisites) {
      const prereq = byId.get(p);
      if (!prereq) {
        errors.push(`${s.id}: prerequisite "${p}" не знайдено`);
        continue;
      }
      // передумова не може бути з пізнішого рівня, ніж сама навичка
      if (ORDER.indexOf(prereq.grade_band) > ORDER.indexOf(s.grade_band)) {
        errors.push(`${s.id} (${s.grade_band}) залежить від пізнішого ${p} (${prereq.grade_band})`);
      }
    }
  }
  if (errors.length) return errors;

  // Kahn: лишились вузли → цикл
  const inDeg = new Map(skills.map((s) => [s.id, 0]));
  const deps = new Map<string, string[]>(skills.map((s) => [s.id, []]));
  for (const s of skills) {
    for (const p of s.prerequisites) {
      inDeg.set(s.id, (inDeg.get(s.id) ?? 0) + 1);
      deps.get(p)?.push(s.id);
    }
  }
  const queue = skills.filter((s) => inDeg.get(s.id) === 0).map((s) => s.id);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const d of deps.get(id) ?? []) {
      inDeg.set(d, inDeg.get(d)! - 1);
      if (inDeg.get(d) === 0) queue.push(d);
    }
  }
  if (order.length !== skills.length) {
    errors.push(`Цикл у DAG: ${skills.filter((s) => !order.includes(s.id)).map((s) => s.id).join(', ')}`);
  }
  return errors;
}

const dagErrors = validateDag(LANGUAGE_SKILLS);
const bands = ['L0', 'L1', 'L2', 'L3', 'L4'];
console.log(`\nВсього skills (мова): ${LANGUAGE_SKILLS.length}`);
console.log('По grade_band:', bands.map((b) => `${b}:${LANGUAGE_SKILLS.filter((s) => s.grade_band === b).length}`).join(' '));
console.log('По strand:');
for (const strand of [...new Set(LANGUAGE_SKILLS.map((s) => s.strand))]) {
  console.log(`  ${strand}: ${LANGUAGE_SKILLS.filter((s) => s.strand === strand).length}`);
}

if (dagErrors.length) {
  console.error('\n❌ Перевірка DAG провалена:');
  for (const e of dagErrors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\n✅ DAG без циклів, порядок band коректний.`);

if (CHECK_ONLY) {
  console.log('\n--check: мережевий upsert пропущено.');
  process.exit(0);
}

// ---------- 2. Upsert ----------

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('❌ Немає VITE_SUPABASE_URL або SUPABASE_SERVICE_ROLE_KEY в env. Upsert пропущено.');
  process.exit(1);
}
const supabase = createClient(URL, KEY);

async function countSkills(subject?: string): Promise<number> {
  let q = supabase.from('skills').select('*', { count: 'exact', head: true });
  if (subject) q = q.eq('subject', subject);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

async function countPrereqs(): Promise<number> {
  const { count, error } = await supabase.from('skill_prerequisites').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

// ---------- СТАН ДО ----------
const beforeAll = await countSkills();
const beforeLang = await countSkills('language');
const beforeMath = await countSkills('math');
const beforePrereq = await countPrereqs();
console.log(`\n=== СТАН ДО ===`);
console.log(`skills усього: ${beforeAll}  (math: ${beforeMath}, language: ${beforeLang})`);
console.log(`skill_prerequisites: ${beforePrereq}`);

// ---------- UPSERT ----------
const skillRows = LANGUAGE_SKILLS.map((s) => ({
  id: s.id,
  subject: s.subject,
  strand: s.strand,
  topic: s.topic,
  title: s.title,
  grade_band: s.grade_band,
  galuzey: s.galuzey,
  cycle: s.cycle,
  ...(s.mastery_threshold !== undefined ? { mastery_threshold: s.mastery_threshold } : {}),
  ...(s.review_interval_days !== undefined ? { review_interval_days: s.review_interval_days } : {}),
  ...(s.sort !== undefined ? { sort: s.sort } : {}),
}));

console.log(`\nUpsert ${skillRows.length} skills (onConflict: id)...`);
const { error: sErr } = await supabase.from('skills').upsert(skillRows, { onConflict: 'id' });
if (sErr) {
  console.error('❌ Помилка upsert skills:', sErr.message);
  process.exit(1);
}

const prereqRows = LANGUAGE_SKILLS.flatMap((s) =>
  s.prerequisites.map((p) => ({ skill_id: s.id, prerequisite_id: p })),
);
console.log(`Upsert ${prereqRows.length} skill_prerequisites...`);
const { error: pErr } = await supabase
  .from('skill_prerequisites')
  .upsert(prereqRows, { onConflict: 'skill_id,prerequisite_id' });
if (pErr) {
  console.error('❌ Помилка upsert skill_prerequisites:', pErr.message);
  process.exit(1);
}

// ---------- СТАН ПІСЛЯ ----------
const afterAll = await countSkills();
const afterLang = await countSkills('language');
const afterMath = await countSkills('math');
const afterPrereq = await countPrereqs();
const delta = (a: number, b: number) => `${a - b >= 0 ? '+' : ''}${a - b}`;

console.log(`\n=== СТАН ПІСЛЯ ===`);
console.log(`skills усього: ${afterAll} (${delta(afterAll, beforeAll)})`);
console.log(`  math:     ${afterMath} (${delta(afterMath, beforeMath)})   ← має лишитись без змін`);
console.log(`  language: ${afterLang} (${delta(afterLang, beforeLang)})`);
console.log(`skill_prerequisites: ${afterPrereq} (${delta(afterPrereq, beforePrereq)})`);

// ---------- ЗВІРКА ----------
const problems: string[] = [];
if (afterLang !== LANGUAGE_SKILLS.length) problems.push(`language у БД ${afterLang}, а в коді ${LANGUAGE_SKILLS.length}`);
if (afterMath !== beforeMath) problems.push(`math змінився: було ${beforeMath}, стало ${afterMath}`);
if (problems.length) {
  console.error('\n❌ Звірка не зійшлась:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('\n✅ Звірено: мова в БД = мова в коді; математику не зачеплено.');
console.log('🎉 Готово.');
