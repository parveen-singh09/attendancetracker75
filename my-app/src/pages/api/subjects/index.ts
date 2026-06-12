import type { APIRoute } from 'astro';
import { z } from 'zod';
import { db, Subject, AcademicSession, eq } from 'astro:db';
import { json, requireUser, readJson } from '../../../lib/api';

export const prerender = false;

const createSchema = z.object({
  sessionId: z.string(),
  name: z.string().min(1).max(80),
  code: z.string().max(20).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#3b82f6'),
  credits: z.number().min(0).max(20).default(0),
  isLab: z.boolean().default(false),
});

export const GET: APIRoute = async ({ url, locals }) => {
  const user = requireUser(locals);
  if (user instanceof Response) return user;
  const sessionId = url.searchParams.get('sessionId');
  if (!sessionId) return json({ error: { code: 'invalid', message: 'sessionId required' } }, 400);
  
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) return json({ error: { code: 'notfound', message: 'Not found' } }, 404);
  const rows = await db.select().from(Subject).where(eq(Subject.sessionId, sessionId));
  return json({ data: rows });
};

export const POST: APIRoute = async ({ request, locals }) => {
  const user = requireUser(locals);
  if (user instanceof Response) return user;
  const parsed = await readJson(request, createSchema);
  if (!parsed.ok) return parsed.response;
  
  const sess = (await db.select().from(AcademicSession).where(eq(AcademicSession.id, parsed.data.sessionId)).limit(1))[0];
  if (!sess || sess.userId !== user.id) return json({ error: { code: 'unauth', message: 'Not your session' } }, 403);
  const id = crypto.randomUUID();
  await db.insert(Subject).values({
    id,
    sessionId: parsed.data.sessionId,
    name: parsed.data.name,
    code: parsed.data.code ?? null,
    color: parsed.data.color,
    credits: parsed.data.credits,
    isLab: parsed.data.isLab,
    createdAt: new Date(),
  });
  return json({ data: { id } });
};
