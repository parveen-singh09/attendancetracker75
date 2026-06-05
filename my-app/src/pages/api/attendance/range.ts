import type { APIRoute } from 'astro';
import { db, AttendanceLog, AcademicSession, eq, and, gte, lte } from 'astro:db';

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const sessionId = url.searchParams.get('sessionId');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  if (!sessionId || !from || !to) {
    return json({ error: { code: 'invalid', message: 'sessionId, from, to required' } }, 400);
  }
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) return json({ error: { code: 'notfound', message: 'Not found' } }, 404);

  const rows = await db
    .select()
    .from(AttendanceLog)
    .where(
      and(
        eq(AttendanceLog.sessionId, sessionId),
        gte(AttendanceLog.date, from),
        lte(AttendanceLog.date, to)
      )
    );
  return json({ data: rows });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
}
