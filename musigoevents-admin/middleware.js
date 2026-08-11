import { NextResponse } from 'next/server';
import { verifySessionToken } from './lib/session';

const PUBLIC_PATHS = ['/login', '/api/login'];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = req.cookies.get('admin_session')?.value;
  const secret = process.env.SESSION_SECRET || '';
  const valid = await verifySessionToken(token, secret);

  if (!valid) {
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
