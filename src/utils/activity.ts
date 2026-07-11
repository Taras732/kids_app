// Легкий локальний журнал активності (для «Ціль на сьогодні», «Тиждень», серії).
// Кожне завершення гри = один запис ISO-datetime у localStorage per-profile.

const key = (profileId: string) => `shk_activity_${profileId}`;
const MAX = 800;

function read(profileId: string): string[] {
  try {
    const raw = localStorage.getItem(key(profileId));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Зафіксувати завершення гри зараз. */
export function recordActivity(profileId: string): void {
  const arr = read(profileId);
  arr.push(new Date().toISOString());
  if (arr.length > MAX) arr.splice(0, arr.length - MAX);
  try {
    localStorage.setItem(key(profileId), JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

const dayStr = (d: Date) => d.toISOString().slice(0, 10);

export interface ActivitySummary {
  /** Кількість завершених ігор сьогодні. */
  todayCount: number;
  /** Серія днів поспіль із активністю (включно з сьогодні). */
  streak: number;
  /** Пн→Нд поточного тижня: чи була активність того дня. */
  week: boolean[];
  /** Індекс сьогодні в тижні (0=Пн … 6=Нд). */
  todayIndex: number;
}

export function getActivitySummary(profileId: string): ActivitySummary {
  const events = read(profileId);
  const days = new Set(events.map((iso) => iso.slice(0, 10)));

  const now = new Date();
  const today = dayStr(now);
  const todayCount = events.filter((iso) => iso.slice(0, 10) === today).length;

  // серія
  let streak = 0;
  const cur = new Date(now);
  while (days.has(dayStr(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }

  // тиждень Пн(0)…Нд(6)
  const jsDow = now.getDay(); // 0=Нд
  const todayIndex = (jsDow + 6) % 7; // Пн=0
  const monday = new Date(now);
  monday.setDate(now.getDate() - todayIndex);
  const week: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(days.has(dayStr(d)));
  }

  return { todayCount, streak, week, todayIndex };
}
