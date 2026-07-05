import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: admin } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (!admin?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: hosts } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('persona', 'woman');

    const { count: guests } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('persona', 'man');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: signupsToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: matchesCreated } = await supabase
      .from('matches' as any)
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    const { count: activeToday } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', today.toISOString());

    // `wallets` only has a self-read RLS policy (auth.uid() = user_id), so
    // the admin's session client can only ever see the admin's own wallet
    // row here -- this was silently undercounting "coins in circulation"
    // down to just the admin's own balance. Use a service-role client to
    // read every wallet.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data: wallets } = await adminClient
      .from('wallets')
      .select('balance');

    const coinsInCirculation = (wallets || []).reduce((sum, w) => sum + (w.balance || 0), 0);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      hosts: hosts || 0,
      guests: guests || 0,
      activeToday: activeToday || 0,
      signupsToday: signupsToday || 0,
      connectionsCreated: matchesCreated || 0, // mapped to matchesCreated count to avoid UI regressions
      coinsInCirculation,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
