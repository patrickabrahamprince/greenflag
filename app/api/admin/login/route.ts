import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = createClient();

    // Sign in with email/password
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: 'Not authorized as admin' }, { status: 403 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
