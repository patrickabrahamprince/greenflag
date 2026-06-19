import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: admin } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    if (!admin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: hosts } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('gender', 'host');

    const { count: guests } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('gender', 'guest');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: signupsToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: connectionsCreated } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: activeToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', today.toISOString());

    const { data: wallets } = await supabase
      .from('wallets')
      .select('balance');

    const coinsInCirculation = (wallets || []).reduce((sum, w) => sum + (w.balance || 0), 0);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      hosts: hosts || 0,
      guests: guests || 0,
      activeToday: activeToday || 0,
      signupsToday: signupsToday || 0,
      connectionsCreated: connectionsCreated || 0,
      coinsInCirculation,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
