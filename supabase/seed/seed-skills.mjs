// Сидер skill-graph математики → Supabase (таблиці skills + skill_prerequisites).
// Ідемпотентний: upsert за id (onConflict), повторний запуск не дублює.
//
// Режими:
//   node supabase/seed/seed-skills.mjs --check   → лише локальна DAG-перевірка (без мережі)
//   node supabase/seed/seed-skills.mjs           → --check, потім upsert у Supabase
//
// Env:
//   VITE_SUPABASE_URL              — обов'язково для реального прогону (не потрібен для --check)
//   SUPABASE_SERVICE_ROLE_KEY      — пріоритетний ключ (обходить RLS, потрібен для запису в skills)
//   VITE_SUPABASE_ANON_KEY         — fallback, якщо service-role key не заданий
//                                    (RLS дозволяє запис у skills лише service_role — з anon
//                                    upsert найімовірніше впаде на permission denied; це очікувано,
//                                    сидер лише повідомить про це, а не приховає помилку)
//
// Приклад запуску (з правильним ключем, дає Тарас/головна сесія):
//   SUPABASE_SERVICE_ROLE_KEY=xxx VITE_SUPABASE_URL=https://xxx.supabase.co \
//     node supabase/seed/seed-skills.mjs

import { MATH_SKILLS } from './skills-math.data.mjs';

const CHECK_ONLY = process.argv.includes('--check');

// ---------- 1. Локальна DAG-перевірка (topo-sort, без мережі) ----------

function validateDag(skills) {
  const byId = new Map(skills.map((s) => [s.id, s]));
  const errors = [];

  // усі id унікальні
  const seen = new Set();
  for (const s of skills) {
    if (seen.has(s.id)) errors.push(`Дублікат id: ${s.id}`);
    seen.add(s.id);
  }

  // усі prerequisites існують
  for (const s of skills) {
    for (const prereqId of s.prerequisites) {
      if (!byId.has(prereqId)) {
        errors.push(`${s.id}: prerequisite "${prereqId}" не знайдено серед skills`);
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors, order: [] };
  }

  // Kahn's algorithm — topo-sort; якщо лишились вузли з in-degree > 0 → цикл
  const inDegree = new Map(skills.map((s) => [s.id, 0]));
  const dependents = new Map(skills.map((s) => [s.id, []])); // prereqId -> [skillId,...]

  for (const s of skills) {
    for (const prereqId of s.prerequisites) {
      inDegree.set(s.id, (inDegree.get(s.id) ?? 0) + 1);
      dependents.get(prereqId)?.push(s.id);
    }
  }

  const queue = skills.filter((s) => inDegree.get(s.id) === 0).map((s) => s.id);
  const order = [];

  while (queue.length > 0) {
    const id = queue.shift();
    order.push(id);
    for (const depId of dependents.get(id) ?? []) {
      inDegree.set(depId, inDegree.get(depId) - 1);
      if (inDegree.get(depId) === 0) queue.push(depId);
    }
  }

  if (order.length !== skills.length) {
    const stuck = skills.filter((s) => !order.includes(s.id)).map((s) => s.id);
    errors.push(`Знайдено цикл(и) у DAG — не вдалося впорядкувати: ${stuck.join(', ')}`);
    return { ok: false, errors, order: [] };
  }

  return { ok: true, errors: [], order };
}

function reportGradeBandBreakdown(skills) {
  const bands = ['L0', 'L1', 'L2', 'L3', 'L4'];
  const strands = [...new Set(skills.map((s) => s.strand))];
  console.log(`\nВсього skills: ${skills.length}`);
  console.log('По grade_band:');
  for (const band of bands) {
    const count = skills.filter((s) => s.grade_band === band).length;
    console.log(`  ${band}: ${count}`);
  }
  console.log('По strand:');
  for (const strand of strands) {
    const count = skills.filter((s) => s.strand === strand).length;
    console.log(`  ${strand}: ${count}`);
  }
}

const dagResult = validateDag(MATH_SKILLS);
reportGradeBandBreakdown(MATH_SKILLS);

if (!dagResult.ok) {
  console.error('\n❌ DAG-перевірка провалена:');
  for (const err of dagResult.errors) console.error(`  - ${err}`);
  process.exit(1);
}
console.log(`\n✅ DAG без циклів. Topo-sort порядок побудовано (${dagResult.order.length} вузлів).`);

if (CHECK_ONLY) {
  console.log('\n--check: мережевий upsert пропущено.');
  process.exit(0);
}

// ---------- 2. Upsert у Supabase ----------

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const KEY = SERVICE_ROLE_KEY ?? ANON_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error(
    '\n❌ Немає VITE_SUPABASE_URL або ключа (SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_ANON_KEY) в env. ' +
      'Upsert пропущено.',
  );
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.warn(
    '\n⚠️  SUPABASE_SERVICE_ROLE_KEY не задано, використовую VITE_SUPABASE_ANON_KEY. ' +
      'RLS дозволяє запис у skills лише service_role — upsert, найімовірніше, впаде на permission denied.',
  );
}

const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, KEY);

const skillsRows = MATH_SKILLS.map((s) => ({
  id: s.id,
  subject: s.subject,
  strand: s.strand,
  topic: s.topic,
  title: s.title,
  grade_band: s.grade_band,
  ...(s.mastery_threshold !== undefined ? { mastery_threshold: s.mastery_threshold } : {}),
  ...(s.review_interval_days !== undefined ? { review_interval_days: s.review_interval_days } : {}),
  ...(s.sort !== undefined ? { sort: s.sort } : {}),
}));

console.log(`\nUpsert ${skillsRows.length} skills...`);
const { error: skillsError } = await supabase.from('skills').upsert(skillsRows, { onConflict: 'id' });
if (skillsError) {
  console.error('❌ Помилка upsert skills:', skillsError.message);
  process.exit(1);
}
console.log('✅ skills upsert OK.');

const prereqRows = MATH_SKILLS.flatMap((s) =>
  s.prerequisites.map((prereqId) => ({ skill_id: s.id, prerequisite_id: prereqId })),
);

console.log(`Upsert ${prereqRows.length} skill_prerequisites...`);
const { error: prereqError } = await supabase
  .from('skill_prerequisites')
  .upsert(prereqRows, { onConflict: 'skill_id,prerequisite_id' });
if (prereqError) {
  console.error('❌ Помилка upsert skill_prerequisites:', prereqError.message);
  process.exit(1);
}
console.log('✅ skill_prerequisites upsert OK.');

console.log('\n🎉 Готово.');
