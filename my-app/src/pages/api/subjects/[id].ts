import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db, Subject, TimetableSlot, AttendanceLog, AcademicSession, eq } from 'astro:db';
import { json, requireUser, readJson } from '../../../lib/api';
import { inTransaction } from '../../../lib/tx';

export const prerender = false;

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  code: z.string().max(20).optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  credits: z.number().min(0).max(20).optional(),
  isLab: z.boolean().optional(),
});

/** Verify the current user owns the subject's parent session. Returns the
 *  subject row, or a ready-to-return Response. */
async function loadOwnedSubject(locals: App.Locals, subjectId: string) {
  const user = requireUser(locals);
  if (user instanceof Response) return user;
  const subj = (await db.select().from(Subject).where(eq(Subject.id, subjectId)).limit(1))[0];
  if (!subj) return json({ error: { code: 'notfound', message: 'Subject not found' } }, 404);
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, subj.sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) {
    return json({ error: { code: 'unauth', message: 'Not your subject' } }, 403);
  }
  return { user, subj };
}

export const PATCH: APIRoute = async ({ request, params, locals }) => {
  const owned = await loadOwnedSubject(locals, params.id!);
  if (owned instanceof Response) return owned;
  const parsed = await readJson(request, patchSchema);
  if (!parsed.ok) return parsed.response;
  await db.update(Subject).set(parsed.data).where(eq(Subject.id, owned.subj.id));
  return json({ data: { ok: true } });
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const owned = await loadOwnedSubject(locals, params.id!);
  if (owned instanceof Response) return owned;
  // Run inside a transaction with FK enforcement on. The schema's
  // ON DELETE CASCADE on TimetableSlot/AttendanceLog → Subject will
  // wipe the child rows; we still issue explicit deletes as
  // defense-in-depth in case the cascade is ever dropped.
  await inTransaction(async (tx) => {
    await tx.delete(TimetableSlot).where(eq(TimetableSlot.subjectId, owned.subj.id));
    await tx.delete(AttendanceLog).where(eq(AttendanceLog.subjectId, owned.subj.id));
    await tx.delete(Subject).where(eq(Subject.id, owned.subj.id));
  });
  return json({ data: { ok: true } });
};
