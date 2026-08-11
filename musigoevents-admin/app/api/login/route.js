import { NextResponse } from 'next/server';
import { createSessionToken, timingSafeEqual } from '../../../lib/session';

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { password } = body || {};
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;

  if (!expected || !secret) {
    return NextResponse.json(
      { error: 'Server is not configured (missing ADMIN_PASSWORD or SESSION_SECRET)' },
      { status: 500 }
    );
  }

  if (!password || !timingSafeEqual(String(password), expected)) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const token = await createSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
