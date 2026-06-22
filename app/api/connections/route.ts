import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', user.id)
      .single();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const isHost = profile?.gender === 'woman';

    let query = supabase
      .from('connections')
      .select('*, host:host_id(id, name, age, photos, city_auto), guest:guest_id(id, name, age, photos)');

    if (isHost) {
      query = query.eq('host_id', user.id);
    } else {
      query = query.eq('guest_id', user.id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data: connections, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ connections: connections || [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
