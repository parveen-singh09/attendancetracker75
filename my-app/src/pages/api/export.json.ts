import type { APIRoute } from 'astro';
import { db, AcademicSession, Subject, AttendanceLog, Day, eq, and } from 'astro:db';

/**
 * GET /api/export.json?sessionId=...
 *
 * Returns the session's full data (subjects + attendance logs + day
 * overrides) as a JSON file download. Used by the "Export JSON" button
 * on `/app/sessions/[id]`.
 *
 * Auth: requires a session cookie that owns the session.
 */
export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ error: { message: 'Login required.' } }, 401);
  }
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) {
    return json({ error: { message: 'sessionId is required.' } }, 400);
  }

  // Confirm the session belongs to the requesting user before exporting.
  const sess = (await db
    .select()
    .from(AcademicSession)
    .where(and(eq(AcademicSession.id, sessionId), eq(AcademicSession.userId, user.id)))
    .limit(1))[0];
  if (!sess) {
    return json({ error: { message: 'Session not found.' } }, 404);
  }

  const [subjRows, logs, dayOverrides] = await Promise.all([
    db.select().from(Subject).where(eq(Subject.sessionId, sess.id)),
    db.select().from(AttendanceLog).where(eq(AttendanceLog.sessionId, sess.id)),
    db.select().from(Day).where(eq(Day.sessionId, sess.id)),
  ]);

  const payload = {
    session: {
      id: sess.id,
      name: sess.name,
      startDate: sess.startDate,
      endDate: sess.endDate,
      targetPct: sess.targetPct,
      overallCalcMode: sess.overallCalcMode,
      isArchived: sess.isArchived,
      createdAt: sess.createdAt,
    },
    subjects: subjRows.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      color: s.color,
      credits: s.credits,
      minPct: s.minPct,
      isLab: s.isLab,
      createdAt: s.createdAt,
    })),
    attendanceLogs: logs.map((l) => ({
      id: l.id,
      subjectId: l.subjectId,
      date: l.date,
      status: l.status,
      note: l.note,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
    })),
    dayOverrides: dayOverrides.map((d) => ({
      id: d.id,
      date: d.date,
      status: d.status,
      note: d.note,
      createdAt: d.createdAt,
    })),
    exportedAt: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Trigger a download with a sensible filename.
      'content-disposition': `attachment; filename="attendance-${sess.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json"`,
    },
  });
};

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
}
