import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '0');

    const { data: viewer } = await supabase
      .from('profiles')
      .select('gender, looking_for_interests, lat, lng')
      .eq('id', user.id)
      .single();

    if (viewer?.gender !== 'host') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase.rpc('get_matching_profiles', {
      p_user_id: user.id,
      p_viewing_gender: 'guest',
      p_user_interests: [],
      p_user_standards: viewer.looking_for_interests || [],
      p_user_lat: viewer.lat || 0,
      p_user_lng: viewer.lng || 0,
      p_limit: 20,
      p_offset: page * 20,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
