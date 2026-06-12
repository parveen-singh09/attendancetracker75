export interface ParsedSlot {
  dayOfWeek: number; 
  startTime: string; 
  endTime: string; 
  subjectName: string;
  location?: string;
  isLab: boolean;
}

export interface ParseResult {
  ok: boolean;
  slots: ParsedSlot[];
  warnings: string[];
  needsReview: boolean;
}

const DAYS: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, weds: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

function toMin(t: string): number | null {
  
  const m = t
    .toLowerCase()
    .replace(/\s+/g, '')
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = parseInt(m[1]!, 10);
  const mm = m[2] ? parseInt(m[2], 10) : 0;
  const ap = m[3];
  if (ap === 'pm' && h < 12) h += 12;
  if (ap === 'am' && h === 12) h = 0;
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

function fmt(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function findDay(text: string): number | null {
  const lower = text.toLowerCase();
  for (const [name, idx] of Object.entries(DAYS)) {
    const re = new RegExp(`\\b${name}\\b`);
    if (re.test(lower)) return idx;
  }
  return null;
}

const TIME_RANGE = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*[-–—~to]+\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
const TIME_SINGLE = /(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i;

export function parseTimetableText(input: string): ParseResult {
  const warnings: string[] = [];
  const slots: ParsedSlot[] = [];

  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { ok: false, slots: [], warnings: ['Empty input.'], needsReview: true };
  }

  const groups: string[] = [];
  for (const line of lines) {
    if (groups.length === 0) {
      groups.push(line);
      continue;
    }
    const prev = groups[groups.length - 1]!;
    const hasTime = TIME_RANGE.test(prev) || TIME_SINGLE.test(prev);
    const hasDay = findDay(prev) !== null;
    if (!hasTime || !hasDay) groups[groups.length - 1] = `${prev} ${line}`.trim();
    else groups.push(line);
  }

  for (const g of groups) {
    const day = findDay(g);
    if (day === null) {
      warnings.push(`Could not find a day in: "${g}"`);
      continue;
    }

    let startMin: number | null = null;
    let endMin: number | null = null;
    const range = g.match(TIME_RANGE);
    if (range) {
      startMin = toMin(range[1]!);
      endMin = toMin(range[2]!);
    } else {
      const single = g.match(TIME_SINGLE);
      if (single) {
        startMin = toMin(single[1]!);
        endMin = (startMin ?? 0) + 60; 
        warnings.push(`Guessed 1-hour duration for "${g}". Please verify.`);
      }
    }

    if (startMin === null || endMin === null) {
      warnings.push(`Could not parse time in: "${g}"`);
      continue;
    }
    if (endMin <= startMin) endMin += 12 * 60; 

    let subject = g
      .replace(new RegExp(`\\b(mon|tue|wed|thu|fri|sat|sun)(?:day|\\.|s|\\b)`, 'i'), '')
      .replace(TIME_RANGE, '')
      .replace(TIME_SINGLE, '')
      .replace(/\s+/g, ' ')
      .replace(/[|]/g, ' ')
      .trim();

    let location: string | undefined = undefined;

    
    const atMatch = subject.match(/@\s*(.+)$/);
    if (atMatch) {
      location = atMatch[1]!.trim();
      subject = subject.replace(/@\s*(.+)$/, '').trim();
    } else {
      
      const locMatch = subject.match(/\b(?:room|rm|hall|building|bldg)\s+[a-z0-9\-]+\b/i) || subject.match(/\blab\s+\d+\b/i);
      if (locMatch) {
        location = locMatch[0];
        subject = subject.replace(locMatch[0], '').trim();
      } else {
         
         const trailingLoc = subject.match(/\s+([a-z]{1,2}\-?\d{1,4}|\d{3,4})$/i);
         if (trailingLoc && !/\b(lab|tutorial|tut|prac)\b/i.test(trailingLoc[1]!)) {
           location = trailingLoc[1];
           subject = subject.slice(0, -trailingLoc[0].length).trim();
         }
      }
    }

    const isLab = /\b(lab|practical|prac|tutorial|tut)\b/i.test(subject);
    const cleanName = subject
      .replace(/\b(lab|practical|prac|tutorial|tut)\b/gi, '')
      .replace(/\(|\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanName) {
      warnings.push(`No subject name in: "${g}"`);
      continue;
    }

    slots.push({
      dayOfWeek: day,
      startTime: fmt(startMin),
      endTime: fmt(endMin),
      subjectName: cleanName,
      location: location,
      isLab,
    });
  }

  const seen = new Set<string>();
  const dedup = slots.filter((s) => {
    const k = `${s.dayOfWeek}|${s.startTime}|${s.subjectName.toLowerCase()}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return {
    ok: dedup.length > 0,
    slots: dedup,
    warnings,
    needsReview: warnings.length > 0 || dedup.length === 0,
  };
}
