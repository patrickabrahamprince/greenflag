import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('persona')
      .eq('id', user.id)
      .single();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const isHost = profile?.persona === 'woman';

    let query = supabase.from('connections').select('*');

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

    if (!connections || connections.length === 0) {
      return NextResponse.json({ connections: [] });
    }

    const profileIdSet = new Set<string>()
    connections.forEach(c => { profileIdSet.add(c.host_id); profileIdSet.add(c.guest_id) })
    const profileIds = Array.from(profileIdSet)

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, age, photos, city_auto, standards')
      .in('id', profileIds)

    const profileMap: Record<string, any> = {}
    if (profiles) profiles.forEach(p => { profileMap[p.id] = p })

    const enriched = connections.map(c => ({
      ...c,
      host: profileMap[c.host_id] || null,
      guest: profileMap[c.guest_id] || null,
    }))

    return NextResponse.json({ connections: enriched });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
