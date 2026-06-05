import type { APIRoute } from 'astro';
import { signInAnonymous } from '../../../lib/auth';
import { rateLimitResponse } from '../../../lib/ratelimit';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const blocked = await rateLimitResponse(request, 'auth:guest', { limit: 5, windowSec: 60 });
  if (blocked) return blocked;
  const result = await signInAnonymous(request);
  if (!result.ok) return json({ error: { message: result.message } }, result.status);
  return json({ user: result.result.user, session: { id: result.result.session.id, expiresAt: result.result.session.expiresAt } }, 200, result.result.cookie);
};

function json(payload: unknown, status = 200, cookie?: string): Response {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (cookie) headers['set-cookie'] = cookie;
  return new Response(JSON.stringify(payload), { status, headers });
}
