import type { APIRoute } from 'astro';
import { db, AcademicSession, Subject, AttendanceLog, Day, eq, and } from 'astro:db';

/**
 * GET /api/export.csv?sessionId=...
 *
 * Returns the session's attendance logs as a CSV file download. One
 * row per log entry, with the subject name inlined so the user can
 * sort/filter in a spreadsheet. Day overrides are emitted as a
 * separate section.
 *
 * Auth: requires a session cookie that owns the session.
 */
export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) {
    return text('error: Login required.\n', 401);
  }
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) {
    return text('error: sessionId is required.\n', 400);
  }

  const sess = (await db
    .select()
    .from(AcademicSession)
    .where(and(eq(AcademicSession.id, sessionId), eq(AcademicSession.userId, user.id)))
    .limit(1))[0];
  if (!sess) {
    return text('error: Session not found.\n', 404);
  }

  const [subjRows, logs, dayOverrides] = await Promise.all([
    db.select().from(Subject).where(eq(Subject.sessionId, sess.id)),
    db.select().from(AttendanceLog).where(eq(AttendanceLog.sessionId, sess.id)),
    db.select().from(Day).where(eq(Day.sessionId, sess.id)),
  ]);

  // Build a subject lookup so each log row carries the readable name.
  const subjById = new Map<string, typeof subjRows[number]>();
  for (const s of subjRows) subjById.set(s.id, s);

  const escape = (v: unknown): string => {
    const s = v == null ? '' : String(v);
    // CSV escape: wrap in quotes if value contains comma, quote, or newline.
    if (/[",\n\r]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const lines: string[] = [];

  // Header rows describing the session.
  lines.push(`# Session: ${sess.name}`);
  lines.push(`# Start: ${sess.startDate}`);
  lines.push(`# End: ${sess.endDate}`);
  lines.push(`# Target: ${sess.targetPct}%`);
  lines.push('');

  // Subjects section.
  lines.push('# Subjects');
  lines.push(['name', 'code', 'credits', 'isLab', 'color'].map(escape).join(','));
  for (const s of subjRows) {
    lines.push([s.name, s.code, s.credits, s.isLab, s.color].map(escape).join(','));
  }
  lines.push('');

  // Attendance logs section (the main data).
  lines.push('# Attendance Logs');
  lines.push(['date', 'subject', 'status', 'note'].map(escape).join(','));
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  for (const l of sortedLogs) {
    const subj = subjById.get(l.subjectId);
    lines.push([l.date, subj?.name ?? l.subjectId, l.status, l.note ?? ''].map(escape).join(','));
  }
  lines.push('');

  // Day overrides section.
  if (dayOverrides.length > 0) {
    lines.push('# Day Overrides');
    lines.push(['date', 'status', 'note'].map(escape).join(','));
    const sortedDays = [...dayOverrides].sort((a, b) => a.date.localeCompare(b.date));
    for (const d of sortedDays) {
      lines.push([d.date, d.status, d.note ?? ''].map(escape).join(','));
    }
  }

  return new Response(lines.join('\n'), {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="attendance-${sess.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.csv"`,
    },
  });
};

function text(body: string, status: number): Response {
  return new Response(body, { status, headers: { 'content-type': 'text/plain' } });
}
