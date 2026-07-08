import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

const PUBLIC_PATHS = [
  '/login', '/signup',
  '/auth/callback', '/auth/error',
  '/_next', '/favicon', '/sw.js', '/manifest',
];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Validate only the env vars the middleware actually needs
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('MIDDLEWARE: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
  }

  // Rate limit API auth/admin routes
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/admin')) {
    const ip = getClientIp(req);
    const result = checkRateLimit(ip, 'api_auth', RATE_LIMITS.auth);
    if (!result.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  }

  // Public paths and API routes — let through immediately
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Create Supabase SSR client with cookie handling
  let supabaseResponse = NextResponse.next({ request: req });

  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\\n/g, '').trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\\n/g, '').trim();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            httpOnly: true,
            sameSite: 'lax' as const,
            secure: process.env.NODE_ENV === 'production',
            ...options,
          })
        );
      },
    },
  });

  // Use getUser() instead of getSession() — getUser() validates the access
  // token with the server and auto-refreshes if expired, calling setAll above
  // to persist the refreshed tokens as cookies.
  // Cookies must be secure: true on HTTPS or browser drops them on refresh
  // This caused "Token has expired" errors before the fix
  const { data: { user } } = await supabase.auth.getUser();

  console.log('MIDDLEWARE PATHNAME:', pathname);
  console.log('MIDDLEWARE USER:', user?.id ?? 'NO USER');

  if (!user) {
    console.log('MIDDLEWARE: No user, redirecting to /login');
    const destination = new URL('/login', req.url);
    return NextResponse.redirect(destination);
  }

  // Fetch profile for authz checks
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, onboarding_completed, approval_status')
    .eq('id', user.id)
    .single();

  console.log('MIDDLEWARE PROFILE:', profile?.is_admin ? 'admin' : profile?.onboarding_completed ? 'onboarded' : 'no profile');

  // Admin users: redirect to /admin unless already there
  if (profile?.is_admin) {
    if (!pathname.startsWith('/admin')) {
      const destination = new URL('/admin', req.url);
      return NextResponse.redirect(destination);
    }
    return supabaseResponse;
  }

  // Non-admins cannot access /admin
  if (pathname.startsWith('/admin')) {
    const destination = new URL('/login', req.url);
    return NextResponse.redirect(destination);
  }

  // Auth method agnostic: works for phone OTP, email, magic link, OAuth
  // Only checks profiles.onboarding_completed for redirect to /onboard
  if (!profile?.onboarding_completed && !pathname.startsWith('/onboard')) {
    const destination = new URL('/onboard', req.url);
    return NextResponse.redirect(destination);
  }

  // Onboarded but still awaiting admin review — keep them on the waiting
  // screen, except /discover (pending users can browse read-only while
  // they wait), the rest of /onboard (mid-sequence steps like quiz/
  // interests/rules run with onboarding_completed already true, since
  // that flag flips early at the profile step -- this same gate would
  // otherwise bounce her back to /onboard/pending mid-onboarding), and
  // /standard/builder (the mandatory first-Standard step for women,
  // which lives outside /onboard/ as a top-level route).
  const PENDING_ALLOWED_PATHS = ['/onboard', '/discover', '/standard/builder'];
  if (
    profile?.onboarding_completed &&
    profile?.approval_status === 'pending' &&
    !PENDING_ALLOWED_PATHS.some((p) => pathname.startsWith(p))
  ) {
    const destination = new URL('/onboard/pending', req.url);
    return NextResponse.redirect(destination);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
