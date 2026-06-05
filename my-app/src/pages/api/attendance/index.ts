import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db, AttendanceLog, Subject, TimetableSlot, Day, AcademicSession, eq, and } from 'astro:db';
import { computeStats } from '../../../lib/attendance';
import { json, requireUser, readJson } from '../../../lib/api';

export const prerender = false;

const putSchema = z.object({
  subjectId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['present', 'absent', 'extra', 'off']),
  op: z.enum(['add', 'remove', 'clear']).default('add'),
});

export const GET: APIRoute = async ({ request, url, locals }) => {
  const user = requireUser(locals);
  if (user instanceof Response) return user;
  const sessionId = url.searchParams.get('sessionId');
  const date = url.searchParams.get('date');
  if (!sessionId || !date) return json({ error: { code: 'invalid', message: 'sessionId and date required' } }, 400);

  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) return json({ error: { code: 'notfound', message: 'Session not found' } }, 404);

  const dayRow = (await db
    .select()
    .from(Day)
    .where(and(eq(Day.sessionId, sessionId), eq(Day.date, date)))
    .limit(1))[0];
  const dayStatus = (dayRow?.status as 'normal' | 'holiday' | 'sick' | 'event') ?? 'normal';

  const slots = await db
    .select({ slot: TimetableSlot, subject: Subject })
    .from(TimetableSlot)
    .innerJoin(Subject, eq(TimetableSlot.subjectId, Subject.id))
    .where(eq(TimetableSlot.sessionId, sessionId));

  const jsDow = new Date(date + 'T00:00:00').getDay();
  const todays = slots.filter((s) => s.slot.dayOfWeek === jsDow);

  const logs = await db
    .select()
    .from(AttendanceLog)
    .where(and(eq(AttendanceLog.sessionId, sessionId), eq(AttendanceLog.date, date)));

  const allSubjects = await db.select().from(Subject).where(eq(Subject.sessionId, sessionId));
  const subjById = new Map(allSubjects.map((s) => [s.id, s] as const));

  const slotItems: Array<{
    slotId: string;
    subjectId: string;
    subjectName: string;
    subjectColor: string;
    startTime: string;
    endTime: string;
    location: string | null;
    isLab: boolean;
    status: 'present' | 'absent' | 'extra' | 'off' | null;
  }> = todays.map((s) => ({
    slotId: s.slot.id,
    subjectId: s.subject.id,
    subjectName: s.subject.name,
    subjectColor: s.subject.color,
    startTime: s.slot.startTime,
    endTime: s.slot.endTime,
    location: s.slot.location ?? null,
    isLab: s.subject.isLab,
    status: null,
  }));

  const subjIdToItem = new Map(slotItems.map((i) => [i.subjectId, i] as const));
  for (const log of logs) {
    const item = subjIdToItem.get(log.subjectId);
    if (item) {
      item.status = log.status as 'present' | 'absent' | 'extra' | 'off';
    } else {
      const subj = subjById.get(log.subjectId);
      if (subj) {
        slotItems.push({
          slotId: '',
          subjectId: subj.id,
          subjectName: subj.name,
          subjectColor: subj.color,
          startTime: '',
          endTime: '',
          location: null,
          isLab: subj.isLab,
          status: log.status as 'present' | 'absent' | 'extra' | 'off',
        });
      }
    }
  }

  return json({ data: { date, dayStatus, items: slotItems } });
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const user = requireUser(locals);
  if (user instanceof Response) return user;
  const parsed = await readJson(request, putSchema);
  if (!parsed.ok) return parsed.response;

  const subj = (await db.select().from(Subject).where(eq(Subject.id, parsed.data.subjectId)).limit(1))[0];
  if (!subj) return json({ error: { code: 'notfound', message: 'Subject not found' } }, 404);
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, subj.sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) {
    return json({ error: { code: 'unauth', message: 'Not your subject' } }, 403);
  }

  if (parsed.data.op === 'clear') {
    await db
      .delete(AttendanceLog)
      .where(
        and(
          eq(AttendanceLog.subjectId, parsed.data.subjectId),
          eq(AttendanceLog.date, parsed.data.date)
        )
      );
  } else if (parsed.data.op === 'remove') {
    const candidates = await db
      .select()
      .from(AttendanceLog)
      .where(
        and(
          eq(AttendanceLog.subjectId, parsed.data.subjectId),
          eq(AttendanceLog.date, parsed.data.date),
          eq(AttendanceLog.status, parsed.data.status)
        )
      );
    if (candidates.length > 0) {
      const toRemove = candidates[candidates.length - 1]!;
      await db.delete(AttendanceLog).where(eq(AttendanceLog.id, toRemove.id));
    }
  } else {
    // Block adding present/absent/extra when the slot is already marked off,
    // either by a per-slot Off toggle (existing 'off' AttendanceLog) or by
    // a day-level override (Day.status !== 'normal' for this date).
    if (parsed.data.status !== 'off') {
      const [offLog, dayOverride] = await Promise.all([
        db
          .select({ id: AttendanceLog.id })
          .from(AttendanceLog)
          .where(
            and(
              eq(AttendanceLog.subjectId, parsed.data.subjectId),
              eq(AttendanceLog.date, parsed.data.date),
              eq(AttendanceLog.status, 'off')
            )
          )
          .limit(1),
        db
          .select({ status: Day.status })
          .from(Day)
          .where(and(eq(Day.sessionId, subj.sessionId), eq(Day.date, parsed.data.date)))
          .limit(1),
      ]);
      if (offLog.length > 0) {
        return json(
          {
            error: {
              code: 'off',
              message: 'This class is marked Off. Clear Off before logging Present, Absent, or Extra.',
            },
          },
          409
        );
      }
      if (dayOverride.length > 0 && dayOverride[0]!.status !== 'normal') {
        return json(
          {
            error: {
              code: 'day-off',
              message: `The day is marked ${dayOverride[0]!.status}. Clear the day override before logging attendance.`,
            },
          },
          409
        );
      }
    }
    const now = new Date();
    await db.insert(AttendanceLog).values({
      id: crypto.randomUUID(),
      sessionId: subj.sessionId,
      subjectId: parsed.data.subjectId,
      date: parsed.data.date,
      status: parsed.data.status,
      createdAt: now,
      updatedAt: now,
    });
  }

  const allLogs = await db
    .select()
    .from(AttendanceLog)
    .where(eq(AttendanceLog.subjectId, parsed.data.subjectId));
  const dayOverrides = await db
    .select()
    .from(Day)
    .where(eq(Day.sessionId, subj.sessionId));
  const stats = computeStats(
    allLogs.map((l) => ({ date: l.date, status: l.status as 'present' | 'absent' | 'extra' | 'off' })),
    dayOverrides.map((d) => ({ date: d.date, status: d.status as 'normal' | 'holiday' | 'sick' | 'event' })),
    sess.targetPct
  );

  return json({ data: { ok: true, stats } });
};
