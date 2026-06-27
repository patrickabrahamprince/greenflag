import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET — fetch the current user's active standard with intentions
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('persona')
      .eq('id', user.id)
      .single();

    const { data: standard, error } = await supabase
      .from('standards')
      .select('id, is_active, intentions(id, day_number, type, prompt)')
      .eq('woman_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (profile?.persona === 'woman') {
      // Women: return their own standard
      if (!standard) return NextResponse.json({ standard: null, intentions: [] });
      return NextResponse.json({
        standard: { id: standard.id, is_active: standard.is_active },
        intentions: standard.intentions || [],
      });
    } else {
      // Men: return empty (they don't own standards)
      return NextResponse.json({ standard: null, intentions: [] });
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
