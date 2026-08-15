import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';

const PUBLIC_PATHS = [
  '/login',
  '/admin/login',
  '/auth/callback', '/auth/error',
  '/terms', '/privacy', '/support', '/how-it-works',
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
    const result = await checkRateLimit(ip, 'api_auth', RATE_LIMITS.auth);
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

  // Admin routes: validate admin access via Supabase auth + is_admin flag
  if (pathname.startsWith('/admin')) {
    let supabaseResponse = NextResponse.next({ request: req });

    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\\n/g, '').trim();
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').replace(/\\n/g, '').trim();

    if (!url || !anonKey) {
      const destination = new URL('/admin/login', req.url);
      return NextResponse.redirect(destination);
    }

    // Create Supabase client to validate auth
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const destination = new URL('/admin/login', req.url);
      return NextResponse.redirect(destination);
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      const destination = new URL('/admin/login', req.url);
      return NextResponse.redirect(destination);
    }

    return supabaseResponse;
  }

  // --- Everything below only applies to non-admin routes ---

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

  if (!user) {
    const destination = new URL('/login', req.url);
    return NextResponse.redirect(destination);
  }

  // Fetch profile for authz checks
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, onboarding_completed, approval_status, is_active')
    .eq('id', user.id)
    .single();

  // Pausing (Settings -> "Pause my account") sets is_active false and signs
  // the user out -- this is the "resume" side of that: reaching any
  // authenticated page at all means they successfully logged back in, auth
  // method agnostic (password, Google, Apple, phone OTP), so this is the
  // one place that needs to flip it back regardless of how they got here.
  if (profile && profile.is_active === false) {
    await supabase.from('profiles').update({ is_active: true }).eq('id', user.id);
  }

  // Auth method agnostic: works for phone OTP, email, magic link, OAuth
  // Only checks profiles.onboarding_completed for redirect to /onboard (or /standard/builder for women)
  if (!profile?.onboarding_completed && !pathname.startsWith('/onboard') && pathname !== '/standard/builder') {
    const destination = new URL('/onboard', req.url);
    return NextResponse.redirect(destination);
  }

  // Onboarded but still awaiting admin review — the /onboard/pending screen
  // itself now runs a 90s auto-approve timer and explicitly lets users
  // navigate anywhere while it counts down, so there's no longer a hard
  // gate here forcing pending users back to that screen.

  // Rejected applications ARE hard-gated, unlike pending -- there's
  // nothing to browse until they either restart onboarding (which wipes
  // approval_status back to unset by deleting the profile row) or an
  // admin reverses the decision, so lock them to the rejected screen.
  if (profile?.approval_status === 'rejected' && pathname !== '/onboard/rejected') {
    const destination = new URL('/onboard/rejected', req.url);
    return NextResponse.redirect(destination);
  }

  // The native app's WKWebView always loads the bare root URL on a fresh
  // launch (capacitor.config.ts's server.url has no path), and "/" is
  // just a static marketing splash with a "Sign In" link -- it has no
  // idea a session already exists. Without this, someone who's already
  // fully authenticated (session valid, onboarded, approved -- every
  // other gate above already passed) lands on that dead-end splash and
  // has to manually click through to /login and re-authenticate, even
  // though nothing about their session actually expired. This is what
  // made Face ID unlock feel pointless: it correctly confirmed identity,
  // then dropped them right back at a page that asks them to sign in
  // again anyway.
  if (pathname === '/') {
    const destination = new URL('/discover', req.url);
    return NextResponse.redirect(destination);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
