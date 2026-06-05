import type { APIRoute } from 'astro';
import { db, User } from 'astro:db';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    await db.select().from(User).limit(1);
    return new Response(JSON.stringify({ ok: true, db: true }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, db: false, error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
