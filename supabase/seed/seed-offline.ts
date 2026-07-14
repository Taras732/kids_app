// Сидер офлайн-завдань (activity-банк C3, src/content/activities.ts) → Supabase offline_tasks.
// Ідемпотентний: upsert за id (onConflict), повторний запуск не дублює.
// Prod-запис — зі станом ДО/ПІСЛЯ (prod-DB transparency).
//
// Env (з .env через SOPS+age, `bash scripts/load-env.sh`):
//   VITE_SUPABASE_URL          — інстанс Supabase
//   SUPABASE_SERVICE_ROLE_KEY  — ключ (обходить RLS; запис у довідник лише service_role)
//
// Запуск: node --env-file=.env --import tsx supabase/seed/seed-offline.ts
import { ACTIVITIES, toOfflineTaskSeed } from '../../src/content/activities';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('❌ Немає VITE_SUPABASE_URL або SUPABASE_SERVICE_ROLE_KEY в env. Upsert пропущено.');
  process.exit(1);
}

const supabase = createClient(URL, KEY);

async function countRows(): Promise<number> {
  const { count, error } = await supabase.from('offline_tasks').select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

async function bandBreakdown(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('offline_tasks').select('grade_band, type');
  if (error) throw error;
  const acc: Record<string, number> = {};
  for (const r of data ?? []) {
    const key = `${r.type}/${r.grade_band ?? 'null'}`;
    acc[key] = (acc[key] ?? 0) + 1;
  }
  return acc;
}

// ---------- СТАН ДО ----------
const before = await countRows();
console.log(`\n=== СТАН ДО ===`);
console.log(`offline_tasks: ${before} рядків`);
if (before > 0) console.log(`  розбивка:`, JSON.stringify(await bandBreakdown()));

// ---------- UPSERT ----------
const rows = ACTIVITIES.map(toOfflineTaskSeed);
console.log(`\nUpsert ${rows.length} activity-завдань (onConflict: id)...`);
const { error } = await supabase.from('offline_tasks').upsert(rows, { onConflict: 'id' });
if (error) {
  console.error('❌ Помилка upsert offline_tasks:', error.message);
  process.exit(1);
}

// ---------- СТАН ПІСЛЯ ----------
const after = await countRows();
console.log(`\n=== СТАН ПІСЛЯ ===`);
console.log(`offline_tasks: ${after} рядків (${after - before >= 0 ? '+' : ''}${after - before})`);
console.log(`  розбивка:`, JSON.stringify(await bandBreakdown()));
console.log(`  upsert-нуто: ${rows.length} (усі type='activity')`);
console.log('\n🎉 Готово.');
