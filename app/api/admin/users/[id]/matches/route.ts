import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: admin } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (!admin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: target, error: targetErr } = await supabase
      .from('profiles')
      .select('id, name, gender, interests, looking_for_interests, lat, lng')
      .eq('id', id)
      .single();
    if (targetErr || !target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isGuest = target.gender === 'man';
    const { data: matches, error: matchErr } = await supabase.rpc('get_matching_profiles', {
      p_user_id: target.id,
      p_viewing_gender: isGuest ? 'woman' : 'man',
      p_user_interests: isGuest ? (target.interests || []) : [],
      p_user_standards: isGuest ? [] : (target.looking_for_interests || []),
      p_user_lat: target.lat || 0,
      p_user_lng: target.lng || 0,
      p_limit: 50,
      p_offset: 0,
    });

    if (matchErr) {
      return NextResponse.json({ error: matchErr.message }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: target.id,
        name: target.name,
        gender: target.gender,
        interests: target.interests || target.looking_for_interests || [],
      },
      matches: matches || [],
      total: matches?.length || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
