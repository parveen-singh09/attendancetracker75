import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db, Day, AcademicSession, Subject, AttendanceLog, eq, and, inArray } from 'astro:db';

export const prerender = false;

const postSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['normal', 'holiday', 'sick', 'event']),
  note: z.string().max(200).optional(),
});

export const POST: APIRoute = async ({ request, url, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) return json({ error: { code: 'invalid', message: 'sessionId required' } }, 400);
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) return json({ error: { code: 'notfound', message: 'Not found' } }, 404);

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return json({ error: { code: 'invalid', message: 'Invalid input' } }, 400);

  const existing = (await db
    .select()
    .from(Day)
    .where(and(eq(Day.sessionId, sessionId), eq(Day.date, parsed.data.date)))
    .limit(1))[0];
  if (existing) {
    await db
      .update(Day)
      .set({ status: parsed.data.status, note: parsed.data.note ?? null })
      .where(eq(Day.id, existing.id));
  } else {
    await db.insert(Day).values({
      id: crypto.randomUUID(),
      sessionId,
      date: parsed.data.date,
      status: parsed.data.status,
      note: parsed.data.note ?? null,
      createdAt: new Date(),
    });
  }

  if (parsed.data.status !== 'normal') {
    const subs = await db.select().from(Subject).where(eq(Subject.sessionId, sessionId));
    const subIds = subs.map((s) => s.id);
    if (subIds.length) {
      const existingLogs = await db
        .select()
        .from(AttendanceLog)
        .where(
          and(
            eq(AttendanceLog.sessionId, sessionId),
            eq(AttendanceLog.date, parsed.data.date),
            inArray(AttendanceLog.subjectId, subIds)
          )
        );
      for (const log of existingLogs) {
        await db.update(AttendanceLog).set({ status: 'off', updatedAt: new Date() }).where(eq(AttendanceLog.id, log.id));
      }
    }
  }

  return json({ data: { ok: true } });
};

export const DELETE: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const sessionId = url.searchParams.get('sessionId');
  const date = url.searchParams.get('date');
  if (!sessionId || !date) return json({ error: { code: 'invalid', message: 'sessionId and date required' } }, 400);
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) return json({ error: { code: 'notfound', message: 'Not found' } }, 404);
  await db
    .delete(Day)
    .where(and(eq(Day.sessionId, sessionId), eq(Day.date, date)));
  return json({ data: { ok: true } });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
}
