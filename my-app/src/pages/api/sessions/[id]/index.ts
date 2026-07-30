import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db, AcademicSession, Subject, AttendanceLog, Day, eq, and } from 'astro:db';
import { computeStats, overallStats, type AttendanceLog as LogT, type DayOverride } from '../../../../lib/attendance';

export const prerender = false;

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  targetPct: z.number().min(50).max(100).optional(),
  overallCalcMode: z.enum(['subject', 'lab', 'both']).optional(),
});

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const id = params.id!;
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, id)).limit(1))[0];
  if (!sess || sess.userId !== user.id) return json({ error: { code: 'notfound', message: 'Not found' } }, 404);

  const subjs = await db.select().from(Subject).where(eq(Subject.sessionId, id));
  const logs = await db.select().from(AttendanceLog).where(eq(AttendanceLog.sessionId, id));
  const dayOverrides = await db.select().from(Day).where(eq(Day.sessionId, id));

  const logsBySubject: Record<string, LogT[]> = {};
  for (const l of logs) {
    if (!logsBySubject[l.subjectId]) logsBySubject[l.subjectId] = [];
    logsBySubject[l.subjectId]!.push({ date: l.date, status: l.status as 'present' | 'absent' | 'extra' | 'off' });
  }
  const daysArr: DayOverride[] = dayOverrides.map((d) => ({
    date: d.date,
    status: d.status as 'normal' | 'holiday' | 'sick' | 'event',
  }));

  const perSubject: Record<string, ReturnType<typeof computeStats>> = {};
  for (const s of subjs) {
    perSubject[s.id] = computeStats(logsBySubject[s.id] ?? [], daysArr, sess.targetPct, s);
  }

  const filtered: Record<string, ReturnType<typeof computeStats>> = {};
  const mode = sess.overallCalcMode;
  for (const s of subjs) {
    if (mode === 'both') {
      filtered[s.id] = perSubject[s.id]!;
    } else if (mode === 'lab') {
      if (s.isLab) filtered[s.id] = perSubject[s.id]!;
    } else {
      if (!s.isLab) filtered[s.id] = perSubject[s.id]!;
    }
  }

  return json({
    data: {
      session: sess,
      subjects: subjs,
      perSubject,
      overall: overallStats(filtered, sess.targetPct),
    },
  });
};

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const id = params.id!;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return json({ error: { code: 'invalid', message: 'Invalid input' } }, 400);
  await db
    .update(AcademicSession)
    .set(parsed.data)
    .where(and(eq(AcademicSession.id, id), eq(AcademicSession.userId, user.id)));
  return json({ data: { ok: true } });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
}
