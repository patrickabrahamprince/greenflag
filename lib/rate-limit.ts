import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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

// Backed by a Postgres table + atomic upsert RPC (see migration
// 20261230000000_db_backed_rate_limit.sql), not an in-memory Map -- this
// app runs on Vercel's Edge middleware and serverless functions, both of
// which can have several warm instances running concurrently, each with
// its own separate JS heap. An in-memory counter is only ever enforced
// per-instance, so the real effective limit under concurrent traffic was
// the configured number multiplied by however many instances happened to
// be warm, not the configured number itself.
export async function checkRateLimit(
  identifier: string,
  action: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${identifier}:${action}`;
  const { data, error } = await getAdmin().rpc('check_rate_limit', {
    p_key: key,
    p_max_requests: config.maxRequests,
    p_window_ms: config.windowSeconds * 1000,
  });

  if (error || !data) {
    // Fail open, not closed -- a rate-limit RPC outage shouldn't take
    // down auth/payments/task-submit entirely.
    console.error('checkRateLimit RPC error:', error);
    return { allowed: true, remaining: config.maxRequests, retryAfter: 0 };
  }

  return {
    allowed: data.allowed,
    remaining: data.remaining,
    retryAfter: data.retry_after,
  };
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
  standardHint: { maxRequests: 1, windowSeconds: 3600 } as RateLimitConfig,
} satisfies Record<string, RateLimitConfig>;
