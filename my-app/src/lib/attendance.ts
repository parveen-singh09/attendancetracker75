export type LogStatus = 'present' | 'absent' | 'extra' | 'off';
export type DayStatus = 'normal' | 'holiday' | 'sick' | 'event';

export interface AttendanceLog {
  date: string;
  status: LogStatus;
}

export interface DayOverride {
  date: string;
  status: DayStatus;
}

export interface Stats {
  held: number;
  attended: number;
  extra: number;
  pct: number;
  canMiss: number;
  mustAttend: number;
  safe: 'safe' | 'warn' | 'danger' | 'none';
}

export function computeStats(
  logs: AttendanceLog[],
  days: DayOverride[],
  target: number
): Stats {
  const dayMap = new Map(days.map((d) => [d.date, d.status] as const));

  let held = 0;
  let attended = 0;
  let extra = 0;
  for (const log of logs) {
    if (log.status === 'extra') {
      extra += 1;
      attended += 1;
      continue;
    }
    if (log.status === 'off') continue;
    const ds = dayMap.get(log.date);
    if (ds && ds !== 'normal') continue;
    held += 1;
    if (log.status === 'present') attended += 1;
  }

  const pct = held === 0 ? 0 : Math.min(100, (attended / held) * 100);

  let canMiss = 0;
  let mustAttend = 0;
  if (held > 0) {
    if (pct >= target) {
      canMiss = Math.max(0, Math.floor((attended * 100) / target - held));
    } else if (target < 100) {
      mustAttend = Math.max(
        1,
        Math.ceil((target * held - attended * 100) / (100 - target))
      );
    }
  }

  let safe: Stats['safe'] = 'none';
  if (held > 0) {
    if (pct >= target) safe = 'safe';
    else if (pct >= target - 5) safe = 'warn';
    else safe = 'danger';
  }

  return { held, attended, extra, pct, canMiss, mustAttend, safe };
}

export function overallStats(
  perSubject: Record<string, Stats>,
  target: number = 75
): Stats {
  let held = 0;
  let attended = 0;
  let extra = 0;
  for (const s of Object.values(perSubject)) {
    held += s.held;
    attended += s.attended;
    extra += s.extra;
  }
  const pct = held === 0 ? 0 : Math.min(100, (attended / held) * 100);
  return {
    held,
    attended,
    extra,
    pct,
    canMiss: 0,
    mustAttend: 0,
    safe: held === 0 ? 'none' : pct >= target ? 'safe' : pct >= target - 5 ? 'warn' : 'danger',
  };
}

export function whatIf(base: Stats, n: number, mode: 'attend' | 'miss'): Stats {
  if (mode === 'attend') {
    const held = base.held + n;
    const attended = base.attended + n;
    const pct = held === 0 ? 0 : Math.min(100, (attended / held) * 100);
    return { ...base, held, attended, pct };
  } else {
    const held = base.held + n;
    const attended = base.attended; 
    const pct = held === 0 ? 0 : Math.min(100, (attended / held) * 100);
    return { ...base, held, attended, pct };
  }
}

/**
 * Synthesizes `absent` logs for scheduled classes that were never marked, so
 * the denominator ("held") reflects every class the timetable says was held —
 * not just the days the user happened to log. Without this, an unlogged week is
 * invisible to the stats and attendance appears to "start" from the first day
 * the user marked anything.
 *
 * Only fills the closed range [startDate, endDate]; callers should pass
 * endDate = yesterday for the active session (today keeps its own phantom-held
 * handling in the page/client) and endDate = the session end for past sessions.
 *
 * A day is skipped when it has a non-normal day override (holiday/sick/event)
 * or an `off` log for the subject (class cancelled). `extra` logs do not consume
 * a scheduled slot, matching computeStats (extra boosts attended, not held).
 */
export function backfillAbsences(
  logs: AttendanceLog[],
  slotDaysOfWeek: number[],
  days: DayOverride[],
  startDate: string,
  endDate: string
): AttendanceLog[] {
  if (slotDaysOfWeek.length === 0 || endDate < startDate) return logs;

  const scheduledPerDow = [0, 0, 0, 0, 0, 0, 0];
  for (const dow of slotDaysOfWeek) {
    if (dow >= 0 && dow <= 6) scheduledPerDow[dow] += 1;
  }

  const dayMap = new Map(days.map((d) => [d.date, d.status] as const));

  // present/absent logs consume a scheduled slot on their date; off cancels the day.
  const consumedByDate = new Map<string, number>();
  const offDates = new Set<string>();
  for (const l of logs) {
    if (l.status === 'off') offDates.add(l.date);
    else if (l.status === 'present' || l.status === 'absent') {
      consumedByDate.set(l.date, (consumedByDate.get(l.date) ?? 0) + 1);
    }
  }

  const out = [...logs];
  const end = parseDate(endDate);
  for (let d = parseDate(startDate); d <= end; d = addDays(d, 1)) {
    const scheduled = scheduledPerDow[d.getDay()]!;
    if (scheduled === 0) continue;
    const ds = toDateString(d);
    const override = dayMap.get(ds);
    if (override && override !== 'normal') continue;
    if (offDates.has(ds)) continue;
    const missing = scheduled - (consumedByDate.get(ds) ?? 0);
    for (let i = 0; i < missing; i++) out.push({ date: ds, status: 'absent' });
  }
  return out;
}

export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}
