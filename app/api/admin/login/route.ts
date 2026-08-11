import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log('Admin login attempt:', {
      providedEmail: email,
      providedEmailLength: email?.length,
      configEmail: adminEmail,
      configEmailLength: adminEmail?.length,
      providedPassword: password,
      providedPasswordLength: password?.length,
      configPasswordLength: adminPassword?.length,
      emailMatch: email === adminEmail,
      passwordMatch: password === adminPassword,
      emailTrimMatch: email?.trim() === adminEmail?.trim(),
      passwordTrimMatch: password?.trim() === adminPassword?.trim(),
    });

    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not configured in environment');
      return NextResponse.json(
        { error: 'Admin credentials not configured' },
        { status: 500 }
      );
    }

    const emailMatches = email?.trim() === adminEmail?.trim();
    const passwordMatches = password?.trim() === adminPassword?.trim();

    if (!emailMatches || !passwordMatches) {
      console.warn('Login failed - invalid credentials', {
        emailMatches,
        passwordMatches,
      });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const response = NextResponse.json({ success: true });

    // 30-day session for "remember me"
    const thirtyDaysInSeconds = 60 * 60 * 24 * 30;
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: thirtyDaysInSeconds,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 400 }
    );
  }
}
