import type { APIRoute } from 'astro';
import { db, AcademicSession, eq, and } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) return new Response('Login required', { status: 401 });
  await db
    .update(AcademicSession)
    .set({ isArchived: true })
    .where(and(eq(AcademicSession.id, params.id!), eq(AcademicSession.userId, user.id)));
  return new Response(null, { status: 303, headers: { Location: '/app/sessions' } });
};
