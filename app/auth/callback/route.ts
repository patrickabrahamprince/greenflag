import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.redirect(`${origin}/auth/error`);
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, persona, is_admin, onboarding_completed')
        .eq('id', user.id)
        .single();

      // Admin → always go to /admin
      if (profile?.is_admin) {
        return NextResponse.redirect(`${origin}/admin`);
      }

      // Has profile + onboarding complete → go to discover
      if (profile?.onboarding_completed) {
        return NextResponse.redirect(`${origin}/discover`);
      }

      // No profile or onboarding incomplete → go to onboard
      return NextResponse.redirect(`${origin}/onboard`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
