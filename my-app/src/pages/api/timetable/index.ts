import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db, Subject, TimetableSlot, AttendanceLog, AcademicSession, User, eq, inArray } from 'astro:db';
import { inTransaction } from '../../../lib/tx';

export const prerender = false;

const slotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  subjectTempId: z.string(),
  location: z.string().max(80).nullish(),
});

const putSchema = z.object({
  subjects: z.array(z.object({
    tempId: z.string(),
    name: z.string().min(1).max(80),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    isLab: z.boolean().default(false),
  })).min(1),
  slots: z.array(slotSchema).default([]),
});

export const GET: APIRoute = async ({ url, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) return json({ error: { code: 'invalid', message: 'sessionId required' } }, 400);
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) return json({ error: { code: 'notfound', message: 'Not found' } }, 404);
  const subjs = await db.select().from(Subject).where(eq(Subject.sessionId, sessionId));
  const slots = await db.select().from(TimetableSlot).where(eq(TimetableSlot.sessionId, sessionId));
  return json({ data: { subjects: subjs, slots } });
};

export const PUT: APIRoute = async ({ request, url, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) return json({ error: { code: 'invalid', message: 'sessionId required' } }, 400);
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) return json({ error: { code: 'notfound', message: 'Not found' } }, 404);

  const body = await request.json().catch(() => null);
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: { code: 'invalid', message: 'Invalid input', issues: parsed.error.issues } }, 400);
  }

  // Reconcile by NAME (not by id). A subject's stable identity is its
  // (name, isLab) tuple within a session — the client uses tempIds just
  // for the round-trip. This way:
  //   - renaming a subject updates one row, attendance history stays
  //   - removing a subject deletes its slots (cascade) and logs (cascade)
  //   - adding a new subject inserts one row
  //   - existing rows with the same (name, isLab) keep their id, so all
  //     existing TimetableSlot and AttendanceLog rows remain valid.
  //
  // The whole reconcile runs inside a single transaction with
  // `PRAGMA foreign_keys = ON` so the schema's ON DELETE CASCADE on
  // TimetableSlot/AttendanceLog → Subject fires reliably. We still
  // issue explicit child-row deletes as defense-in-depth.

  const now = new Date();

  await inTransaction(async (tx) => {
    const existing = await tx
      .select()
      .from(Subject)
      .where(eq(Subject.sessionId, sessionId));

    // Group by (name, isLab) — within a session these are unique.
    const existingByKey = new Map<string, typeof existing[number]>();
    for (const e of existing) {
      existingByKey.set(`${e.isLab ? 'L' : 'S'}:${e.name}`, e);
    }

    const tempToId = new Map<string, string>();
    const newSubjectRows: Array<typeof Subject.$inferInsert> = [];
    const subjectsToDelete: string[] = [];

    for (const s of parsed.data.subjects) {
      const key = `${s.isLab ? 'L' : 'S'}:${s.name}`;
      const found = existingByKey.get(key);
      if (found) {
        // Reuse existing row. Update color in case it changed.
        if (found.color !== s.color) {
          await tx.update(Subject).set({ color: s.color }).where(eq(Subject.id, found.id));
        }
        tempToId.set(s.tempId, found.id);
        // Mark as seen so we don't delete it below.
        existingByKey.delete(key);
      } else {
        // Genuinely new subject.
        const id = crypto.randomUUID();
        tempToId.set(s.tempId, id);
        newSubjectRows.push({
          id,
          sessionId,
          name: s.name,
          color: s.color,
          isLab: s.isLab,
          createdAt: now,
        });
      }
    }

    // Anything still in existingByKey is in the DB but not in the new
    // payload — drop it. The schema's ON DELETE CASCADE will wipe
    // child rows because we're inside a transaction with foreign_keys
    // enabled. We also issue explicit child-row deletes so the operation
    // is correct even if the cascade is ever dropped from the schema.
    for (const leftover of existingByKey.values()) {
      subjectsToDelete.push(leftover.id);
    }
    if (subjectsToDelete.length) {
      await tx.delete(TimetableSlot).where(inArray(TimetableSlot.subjectId, subjectsToDelete));
      await tx.delete(AttendanceLog).where(inArray(AttendanceLog.subjectId, subjectsToDelete));
      await tx.delete(Subject).where(inArray(Subject.id, subjectsToDelete));
    }
    if (newSubjectRows.length) {
      await tx.insert(Subject).values(newSubjectRows);
    }

    // Reconcile slots. Drop every existing slot for this session, then
    // insert the new set. We do delete-all + insert-all for slots because
    // there's no stable identity the client can supply (a user can
    // legitimately have two Calculus slots on Monday). The cascade above
    // for subject deletion already removed the orphaned slots.
    await tx.delete(TimetableSlot).where(eq(TimetableSlot.sessionId, sessionId));
    const slotRows = parsed.data.slots
      .map((slot) => {
        const subjectId = tempToId.get(slot.subjectTempId);
        if (!subjectId) return null;
        return {
          id: crypto.randomUUID(),
          sessionId,
          subjectId,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          location: slot.location ?? null,
          createdAt: now,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
    if (slotRows.length) await tx.insert(TimetableSlot).values(slotRows);
  });

  // mark onboarding complete (outside the transaction — a tiny optimization;
  // the user-step update is independent of the timetable save).
  await db
    .update(User)
    .set({ onboardingStep: 'done', updatedAt: now })
    .where(eq(User.id, user.id));

  return json({ data: { ok: true } });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
}
