import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const counts: Record<string, number> = {};
    for (const t of ['profiles', 'connections', 'messages', 'reports']) {
      const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
      counts[t] = count || 0;
    }

    const { data: signupsData } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const signupsByDay: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStr = date.toISOString().slice(0, 10);
      const count = signupsData?.filter(s => s.created_at?.slice(0, 10) === dayStr).length || 0;
      signupsByDay.push(count);
    }

    const { data: revenueData } = await supabase
      .from('coin_transactions')
      .select('amount, created_at')
      .eq('type', 'purchase')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const revenueByDay: number[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayStr = date.toISOString().slice(0, 10);
      const dayTotal = revenueData
        ?.filter(r => r.created_at?.slice(0, 10) === dayStr)
        .reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      revenueByDay.push(dayTotal);
    }

    return NextResponse.json({
      pending_photos: counts.reports || 0,
      active_connections: counts.connections || 0,
      banned_users: 0,
      revenue_mtd: revenueByDay.reduce((a, b) => a + b, 0),
      dau: signupsByDay.slice(-1)[0] || 0,
      mau: signupsByDay.reduce((a, b) => a + b, 0),
      conversion_rate: 0,
      completion_rate: 0,
      arpu: 0,
      signups_30d: signupsByDay,
      revenue_30d: revenueByDay,
      user_distribution: { hosts: 0, guests: 0 },
      recent_activity: [],
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
