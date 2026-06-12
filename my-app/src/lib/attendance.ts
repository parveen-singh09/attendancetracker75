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

  const regularAttended = attended - extra;
  let canMiss = 0;
  if (regularAttended > 0) {
    canMiss = Math.max(0, Math.floor((regularAttended * 100) / target - held));
  }
  let mustAttend = 0;
  if (held > 0 && (regularAttended / held) * 100 < target) {
    mustAttend = Math.max(1, Math.ceil((held * target) / 100 - regularAttended));
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
