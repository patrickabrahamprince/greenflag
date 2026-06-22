import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { validateEnv } from '@/lib/env';

const PUBLIC_PATHS = ['/login', '/signup', '/auth', '/auth/callback', '/banned'];

validateEnv();

function copyCookies(from: NextResponse, to: NextResponse) {
  for (const { name, value } of from.cookies.getAll()) {
    to.cookies.set(name, value);
  }
}

function redirect(req: NextRequest, res: NextResponse, pathname: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  const redirectResponse = NextResponse.redirect(url);
  copyCookies(res, redirectResponse);
  return redirectResponse;
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Rate limit API auth routes
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/admin')) {
    const ip = getClientIp(req);
    const result = checkRateLimit(ip, 'api_auth', RATE_LIMITS.auth);
    if (!result.allowed) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(result.retryAfter),
        },
      });
    }
  }

  // Rule 1 — Public paths: never redirect, always allow through
  const publicPaths = [
    '/login',
    '/signup',
    '/onboard',
    '/auth/callback',
    '/auth/error',
    '/_next',
    '/favicon',
    '/sw.js',
    '/manifest',
  ];

  // If path starts with any public path — return next() immediately, no checks
  if (publicPaths.some((p) => pathname.startsWith(p)) || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Create Supabase client and get session
  let res = NextResponse.next({ request: req });

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\\n/g, '').trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\\n/g, '').trim();

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  console.log("MIDDLEWARE PATHNAME:", pathname);
  const { data: { session } } = await supabase.auth.getSession();
  console.log("MIDDLEWARE SESSION USER ID:", session?.user?.id || "NO SESSION");

  // Rule 2 — No session: redirect to login
  if (!session) {
    console.log("MIDDLEWARE: No session, redirecting to /login");
    const redirectResponse = NextResponse.redirect(new URL('/login', req.url));
    copyCookies(res, redirectResponse);
    return redirectResponse;
  }

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  console.log("MIDDLEWARE PROFILE:", profile ? { id: profile.id, is_admin: profile.is_admin, onboarding_completed: profile.onboarding_completed } : "NO PROFILE");

  // Admin users skip onboarding entirely
  if (profile?.is_admin) {
    // Only redirect to /admin if they're not already in /admin
    if (!pathname.startsWith('/admin')) {
      console.log("MIDDLEWARE: Admin user, redirecting to /admin");
      const redirectResponse = NextResponse.redirect(new URL('/admin', req.url));
      copyCookies(res, redirectResponse);
      return redirectResponse;
    }
    console.log("MIDDLEWARE: Admin user already on admin route, letting through");
    return res;
  }

  // Admin route protection: Non-admin users cannot access /admin
  if (pathname.startsWith('/admin') && !profile?.is_admin) {
    console.log("MIDDLEWARE: Non-admin trying to access /admin, redirecting to /login");
    const redirectResponse = NextResponse.redirect(new URL('/login', req.url));
    copyCookies(res, redirectResponse);
    return redirectResponse;
  }

  // Non-admin: check onboarding
  if (!profile?.onboarding_completed && !pathname.startsWith('/onboard')) {
    const redirectResponse = NextResponse.redirect(new URL('/onboard', req.url));
    copyCookies(res, redirectResponse);
    return redirectResponse;
  }

  // Rule 5 — Everything else: allow through
  copyCookies(res, res);
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
