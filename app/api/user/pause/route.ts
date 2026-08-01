import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Reversible alternative to account deletion -- reuses profiles.is_active
// (already DEFAULT true, already the exact flag get_ranked_men/
// get_ranked_women and the profiles_public_read/view_opposite_gender RLS
// policies check before showing someone in Discover or letting their
// profile be read) rather than adding a new column. Setting it false here
// makes the user invisible everywhere those checks run; middleware.ts
// flips it back to true the moment they successfully log in again, so
// nothing extra is needed to "resume" -- logging back in is the resume.
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase.from('profiles').update({ is_active: false }).eq('id', user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
