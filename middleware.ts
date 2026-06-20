import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

const PUBLIC_PATHS = ['/login', '/signup', '/auth', '/banned', '/onboard'];

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
  const path = req.nextUrl.pathname;

  // 1. Always allow public paths and static files
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.next({ request: req });
  }
  if (path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')) {
    return NextResponse.next({ request: req });
  }

  // 2. Create Supabase client and get session
  let res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect(req, res, '/login');
  }

  // 3. Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return redirect(req, res, '/onboard');
  }

  // 4. Banned
  if (profile.is_banned) {
    return redirect(req, res, '/banned');
  }

  // 5. ADMIN — highest priority, runs before anything else
  if (profile.is_admin === true) {
    if (!path.startsWith('/admin')) {
      return redirect(req, res, '/admin');
    }
    return res;
  }

  // 6. Onboarding incomplete
  if (!profile.onboarding_completed) {
    if (!path.startsWith('/onboard')) {
      return redirect(req, res, '/onboard');
    }
    return res;
  }

  // 7. Regular users — allow everything else
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
