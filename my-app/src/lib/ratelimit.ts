export interface RateLimitOptions {
  limit: number;
  windowSec: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

interface Counter {
  count: number;
  windowStart: number;
}

const counters = new Map<string, Counter>();

const PRUNE_INTERVAL_MS = 60_000;
let lastPrune = Date.now();
function maybePrune(now: number, windowSec: number) {
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  const cutoff = now - windowSec * 1000;
  for (const [k, v] of counters) {
    if (v.windowStart < cutoff) counters.delete(k);
  }
}

function clientIp(request: Request): string {
  const cf = request.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  return 'unknown';
}

export async function rateLimit(
  request: Request,
  bucket: string,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const ip = clientIp(request);
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const windowMs = opts.windowSec * 1000;

  maybePrune(now, opts.windowSec);

  const existing = counters.get(key);
  if (!existing || now - existing.windowStart >= windowMs) {
    counters.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: opts.limit - 1, retryAfter: 0 };
  }

  if (existing.count >= opts.limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.windowStart + windowMs - now) / 1000));
    return { allowed: false, remaining: 0, retryAfter };
  }

  existing.count++;
  return { allowed: true, remaining: opts.limit - existing.count, retryAfter: 0 };
}

export async function rateLimitResponse(
  request: Request,
  bucket: string,
  opts: RateLimitOptions
): Promise<Response | null> {
  const r = await rateLimit(request, bucket, opts);
  if (r.allowed) return null;
  return new Response(
    JSON.stringify({ error: { code: 'rate_limited', message: 'Too many requests. Try again shortly.' } }),
    {
      status: 429,
      headers: {
        'content-type': 'application/json',
        'retry-after': String(r.retryAfter),
        'x-ratelimit-limit': String(opts.limit),
        'x-ratelimit-remaining': '0',
      },
    }
  );
}
