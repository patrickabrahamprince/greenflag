interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - 300_000;
  store.forEach((entry, key) => {
    if (entry.windowStart < cutoff) store.delete(key);
  });
}

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export function checkRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const key = `${identifier}:${action}:${windowStart}`;

  const entry = store.get(key);
  const count = entry?.count ?? 0;

  if (count >= config.maxRequests) {
    const retryAfter = Math.ceil((windowStart + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  store.set(key, { count: count + 1, windowStart });
  return { allowed: true, remaining: config.maxRequests - count - 1, retryAfter: 0 };
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

export const RATE_LIMITS = {
  auth: { maxRequests: 10, windowSeconds: 60 } as RateLimitConfig,
  taskSubmit: { maxRequests: 3, windowSeconds: 3600 } as RateLimitConfig,
  coinPurchase: { maxRequests: 5, windowSeconds: 60 } as RateLimitConfig,
  pushSubscribe: { maxRequests: 10, windowSeconds: 3600 } as RateLimitConfig,
  nudge: { maxRequests: 1, windowSeconds: 3600 } as RateLimitConfig,
  standardHint: { maxRequests: 1, windowSeconds: 3600 } as RateLimitConfig,
} satisfies Record<string, RateLimitConfig>;
