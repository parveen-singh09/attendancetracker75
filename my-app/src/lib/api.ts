import { z } from 'zod';
import type { AuthUser } from './auth';

export function json(payload: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json', ...extraHeaders },
  });
}

export function unauthorized(): Response {
  return json({ error: { code: 'unauth', message: 'Login required' } }, 401);
}

export function requireUser(locals: App.Locals): AuthUser | Response {
  return locals.user ?? unauthorized();
}

export async function readJson<T>(request: Request, schema: z.ZodType<T>): Promise<{ ok: true; data: T } | { ok: false; response: Response }> {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      response: json({ error: { code: 'invalid', message: 'Invalid input', issues: parsed.error.issues } }, 400),
    };
  }
  return { ok: true, data: parsed.data };
}
