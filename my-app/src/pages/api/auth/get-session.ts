import type { APIRoute } from 'astro';
import { getSession } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session) return json({ user: null, session: null }, 200);
  return json({ user: session.user, session: { id: session.session.id, expiresAt: session.session.expiresAt } }, 200);
};

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json' } });
}
