import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

function redirectWithCookies(request: NextRequest, supabaseResponse: NextResponse, pathname: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach(({ name, value, ...options }) =>
    response.cookies.set(name, value, options as any)
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 1. Public paths — always allow through
  const publicPaths = ['/login', '/signup', '/auth'];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return supabaseResponse;
  }

  // 2. Unauthenticated users → /login
  if (!user) {
    return redirectWithCookies(request, supabaseResponse, '/login');
  }

  // 3. Authenticated — fetch profile once
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 4. Banned → /banned
  if (profile?.is_banned && pathname !== '/banned') {
    return redirectWithCookies(request, supabaseResponse, '/banned');
  }

  // 5. Admin routes — must be is_admin
  if (pathname.startsWith('/admin')) {
    if (!profile?.is_admin) {
      return redirectWithCookies(request, supabaseResponse, '/discover');
    }
    return supabaseResponse;
  }

  // 6. Admin users → force to /admin from ANY non-admin page (skip API and static)
  if (profile?.is_admin && !pathname.startsWith('/api')) {
    return redirectWithCookies(request, supabaseResponse, '/admin');
  }

  // 7. Host/guest discover routing (non-admin users only)
  if (pathname === '/discover' && profile?.gender === 'host') {
    return redirectWithCookies(request, supabaseResponse, '/discover-men');
  }
  if (pathname === '/discover-men' && profile?.gender === 'guest') {
    return redirectWithCookies(request, supabaseResponse, '/discover');
  }

  // 8. Everything else — allow through
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
