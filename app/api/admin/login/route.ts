import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log('Admin login attempt:', {
      providedEmail: email,
      configEmail: adminEmail,
      emailMatch: email === adminEmail,
      passwordMatch: password === adminPassword,
    });

    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not configured in environment');
      return NextResponse.json(
        { error: 'Admin credentials not configured' },
        { status: 500 }
      );
    }

    if (email !== adminEmail || password !== adminPassword) {
      console.warn('Login failed - invalid credentials');
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const response = NextResponse.json({ success: true });

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/admin',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 400 }
    );
  }
}
