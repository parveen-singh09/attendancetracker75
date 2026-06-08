import type { APIRoute } from 'astro';
import { AcademicSession, User, Subject, TimetableSlot, Day, AttendanceLog, eq, inArray } from 'astro:db';
import { inTransaction } from '../../../lib/tx';

export const prerender = false;

export const POST: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ error: { message: 'Login required' } }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  try {
    await inTransaction(async (tx) => {
      // Find all sessions belonging to the user
      const userSessions = await tx
        .select({ id: AcademicSession.id })
        .from(AcademicSession)
        .where(eq(AcademicSession.userId, user.id));

      const sessionIds = userSessions.map((s) => s.id);

      if (sessionIds.length > 0) {
        // Delete records bottom-up to prevent SQLite FOREIGN KEY cascading constraint issues
        await tx.delete(AttendanceLog).where(inArray(AttendanceLog.sessionId, sessionIds));
        await tx.delete(TimetableSlot).where(inArray(TimetableSlot.sessionId, sessionIds));
        await tx.delete(Day).where(inArray(Day.sessionId, sessionIds));
        await tx.delete(Subject).where(inArray(Subject.sessionId, sessionIds));
        await tx.delete(AcademicSession).where(inArray(AcademicSession.id, sessionIds));
      }

      // Reset the user's onboardingStep back to 'welcome'
      await tx
        .update(User)
        .set({ onboardingStep: 'welcome', updatedAt: new Date() })
        .where(eq(User.id, user.id));
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Failed to reset session data:', err);
    return new Response(
      JSON.stringify({ error: { message: 'Internal server error occurred.' } }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }
    );
  }
};
