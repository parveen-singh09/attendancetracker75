import type { APIRoute } from 'astro';
import { signUp } from '../../../lib/auth';
import { rateLimitResponse } from '../../../lib/ratelimit';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const blocked = await rateLimitResponse(request, 'auth:sign-up', { limit: 5, windowSec: 60 });
    if (blocked) return blocked;
    const body = (await request.json().catch(() => null)) as { email?: string; password?: string; name?: string } | null;
    if (!body?.email || !body.password || !body.name) {
      return json({ error: { message: 'Email, name, and password are required.' } }, 400);
    }
    const result = await signUp(request, { email: body.email, password: body.password, name: body.name });
    if (!result.ok) return json({ error: { message: result.message } }, result.status);
    return json({ user: result.result.user, session: { id: result.result.session.id, expiresAt: result.result.session.expiresAt } }, 200, result.result.cookie);
  } catch (err: any) {
    return json({ error: { message: err?.message || 'Server error', stack: err?.stack } }, 500);
  }
};

function json(payload: unknown, status = 200, cookie?: string): Response {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (cookie) headers['set-cookie'] = cookie;
  return new Response(JSON.stringify(payload), { status, headers });
}
