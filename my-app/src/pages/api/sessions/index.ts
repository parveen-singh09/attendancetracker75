import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db, AcademicSession, User, eq, desc } from 'astro:db';

export const prerender = false;

const createSchema = z.object({
  name: z.string().min(1).max(80),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  targetPct: z.number().min(50).max(100).default(75),
  overallCalcMode: z.enum(['subject', 'lab', 'both']).default('subject'),
});

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const rows = await db
    .select()
    .from(AcademicSession)
    .where(eq(AcademicSession.userId, user.id))
    .orderBy(desc(AcademicSession.createdAt));
  return json({ data: rows });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: { code: 'invalid', message: 'Invalid input', field: parsed.error.issues[0]?.path[0] } }, 400);
  }
  const id = crypto.randomUUID();
  await db.insert(AcademicSession).values({
    id,
    userId: user.id,
    name: parsed.data.name,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    targetPct: parsed.data.targetPct,
    overallCalcMode: parsed.data.overallCalcMode,
    isArchived: false,
    createdAt: new Date(),
  });
  await db
    .update(User)
    .set({ onboardingStep: 'timetable', updatedAt: new Date() })
    .where(eq(User.id, user.id));
  return json({ data: { id } });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
}
