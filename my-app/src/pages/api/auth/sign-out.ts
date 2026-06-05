import type { APIRoute } from 'astro';
import { signOut } from '../../../lib/auth';
import { rateLimitResponse } from '../../../lib/ratelimit';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const blocked = await rateLimitResponse(request, 'auth:sign-out', { limit: 30, windowSec: 60 });
  if (blocked) return blocked;
  const result = await signOut(request);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'set-cookie': result.cookie },
  });
};
