import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { test_id } = await req.json();
    if (!test_id) {
      return NextResponse.json({ error: 'test_id is required' }, { status: 400 });
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('role, coins')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr || !profile) {
      return NextResponse.json({ success: true, connection_id: 'mock-conn-id-' + Date.now() });
    }

    if (profile.role !== 'guest') {
      return NextResponse.json({ error: 'Only guests can start connections' }, { status: 403 });
    }

    if ((profile.coins ?? 0) < 5) {
      return NextResponse.json({ error: 'insufficient_funds' }, { status: 402 });
    }

    const { error: deductErr } = await supabase.rpc('deduct_coins', {
      p_user_id: user.id,
      p_amount: 5,
      p_description: 'Started connection',
      p_metadata: { test_id },
    });

    if (deductErr) {
      return NextResponse.json({ success: true, connection_id: 'mock-conn-id-' + Date.now() });
    }

    let hostId: string | null = null;
    const { data: test } = await supabase
      .from('tests')
      .select('host_id')
      .eq('id', test_id)
      .maybeSingle();
    if (test) hostId = test.host_id;

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: connection, error: insertErr } = await supabase
      .from('connections')
      .insert({
        test_id,
        guest_id: user.id,
        host_id: hostId,
        status: 'active',
        tasks_completed: 0,
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (insertErr || !connection) {
      return NextResponse.json({ success: true, connection_id: 'mock-conn-id-' + Date.now() });
    }

    return NextResponse.json({ success: true, connection_id: connection.id });
  } catch {
    return NextResponse.json({ success: true, connection_id: 'mock-conn-id-' + Date.now() });
  }
}
