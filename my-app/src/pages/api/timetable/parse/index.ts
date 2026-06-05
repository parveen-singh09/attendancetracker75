import type { APIRoute } from 'astro';
import { z } from 'zod';
import { parseTimetableText } from '../../../../lib/timetable-parser';
import { rateLimitResponse } from '../../../../lib/ratelimit';

export const prerender = false;

const schema = z.object({ text: z.string().min(1).max(20000) });

export const POST: APIRoute = async ({ request, locals }) => {
  const blocked = await rateLimitResponse(request, 'timetable:parse', { limit: 30, windowSec: 60 });
  if (blocked) return blocked;
  const user = locals.user;
  if (!user) return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: { code: 'invalid', message: 'text required' } }, 400);
  const result = parseTimetableText(parsed.data.text);
  return json({ data: result });
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
}
