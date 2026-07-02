import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db, User, Session, Account, AcademicSession, Subject, TimetableSlot, Day, AttendanceLog, eq, inArray } from 'astro:db';
import { rateLimitResponse } from '../../lib/ratelimit';
import { inTransaction } from '../../lib/tx';

export const prerender = false;

const updateSchema = z.object({
  name: z.string().min(1).max(100),
  image: z.string()
    .max(1_500_000, { message: 'Image is too large' })
    .refine((val) => !val || val.startsWith('data:image/'), {
      message: 'Only image data URLs are allowed'
    }).nullable().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const blocked = await rateLimitResponse(request, 'account:update', { limit: 30, windowSec: 60 });
  if (blocked) return blocked;
  const user = locals.user;
  if (!user) return new Response('Login required', { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid input', issues: parsed.error.issues }), { status: 400 });
  }

  const updatePayload: Record<string, any> = {
    name: parsed.data.name,
    updatedAt: new Date(),
  };

  if (parsed.data.image !== undefined) {
    updatePayload.image = parsed.data.image;
  }

  await db
    .update(User)
    .set(updatePayload)
    .where(eq(User.id, user.id));

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
};

const deleteSchema = z.object({
  confirm: z.literal('DELETE MY ACCOUNT'),
  email: z.email(),
});

export const DELETE: APIRoute = async ({ request, locals }) => {
  const blocked = await rateLimitResponse(request, 'account:delete', { limit: 3, windowSec: 60 });
  if (blocked) return blocked;
  const user = locals.user;
  if (!user) return new Response('Login required', { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Confirmation required', message: 'Send { confirm: "DELETE MY ACCOUNT", email: "<your account email>" }' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }
  if (parsed.data.email.trim().toLowerCase() !== user.email) {
    return new Response(
      JSON.stringify({ error: 'Email mismatch' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  await inTransaction(async (tx) => {
    const userSessions = await tx
      .select({ id: AcademicSession.id })
      .from(AcademicSession)
      .where(eq(AcademicSession.userId, user.id));
    const sessionIds = userSessions.map((s) => s.id);

    if (sessionIds.length > 0) {
      await tx.delete(AttendanceLog).where(inArray(AttendanceLog.sessionId, sessionIds));
      await tx.delete(TimetableSlot).where(inArray(TimetableSlot.sessionId, sessionIds));
      await tx.delete(Day).where(inArray(Day.sessionId, sessionIds));
      await tx.delete(Subject).where(inArray(Subject.sessionId, sessionIds));
      await tx.delete(AcademicSession).where(inArray(AcademicSession.id, sessionIds));
    }

    await tx.delete(Session).where(eq(Session.userId, user.id));
    await tx.delete(Account).where(eq(Account.userId, user.id));
    await tx.delete(User).where(eq(User.id, user.id));
  });
  
  
  
  const url = new URL(request.url);
  const clearCookie =
    `at75_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` +
    (url.protocol === 'https:' ? '; Secure' : '');
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'set-cookie': clearCookie },
  });
};
