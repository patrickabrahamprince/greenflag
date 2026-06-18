import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, '1h')
  });
}

export async function POST(req: Request) {
  const { phone } = await req.json();
  
  if (!ratelimit) {
    // If Upstash isn't configured, bypass rate limiting
    return Response.json({ success: true });
  }

  const { success } = await ratelimit.limit(phone);
  return Response.json({ success });
}
