import { defineMiddleware } from 'astro:middleware';
import { getSession } from './lib/auth';

const APP_PREFIX = '/app';
const ONBOARDING_PREFIX = '/onboarding';
const PUBLIC_FILES = ['/favicon', '/robots.txt', '/_image'];

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const CSRF_EXEMPT = ['/api/auth/'];

function csrfFail(reason: string): Response {
  return new Response(
    JSON.stringify({ error: { code: 'csrf', message: `Cross-site request blocked: ${reason}` } }),
    { status: 403, headers: { 'content-type': 'application/json' } }
  );
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const path = url.pathname;

  if (PUBLIC_FILES.some((p) => path.startsWith(p)) || path.startsWith('/api/health')) {
    return next();
  }


  const isProtectedRoute = path.startsWith(APP_PREFIX) || path.startsWith(ONBOARDING_PREFIX);
  const isApiRoute = path.startsWith('/api/');

  if (isApiRoute && UNSAFE_METHODS.has(context.request.method) && !CSRF_EXEMPT.some((p) => path.startsWith(p))) {
    const origin = context.request.headers.get('origin');
    if (origin) {
      let originHost: string | null = null;
      try {
        originHost = new URL(origin).host;
      } catch {
        return csrfFail('malformed origin');
      }
      if (originHost !== url.host) {
        return csrfFail(`origin ${originHost} !== host ${url.host}`);
      }
    }
}

  const session = await getSession(context.request);

  if (session) {
    context.locals.user = session.user;
    context.locals.session = session.session;
  }

  if (path.startsWith('/api/auth/')) {
    return next();
  }

  if (isProtectedRoute && !session) {
    if (isApiRoute) {
      return new Response(JSON.stringify({ error: { message: 'Login required' } }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }
    return context.redirect(`/login?next=${encodeURIComponent(path)}`);
  }

  return next();
});
