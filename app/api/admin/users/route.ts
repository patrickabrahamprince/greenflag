import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const persona = searchParams.get('gender') || searchParams.get('persona') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = 20;
    const offset = page * limit;

    let query = supabase
      .from('profiles')
      .select('id, name, age, city_auto, created_at, last_active, is_banned, is_admin, photos, persona, approval_status', { count: 'exact' });

    if (search) {
      // NOTE: profiles has no `email` column -- searching by email here
      // previously caused every search request to fail with a Postgres
      // "column does not exist" error. Name is the only searchable field
      // available on this table.
      query = query.ilike('name', `%${search}%`);
    }
    if (persona) {
      query = query.eq('persona', persona as 'man' | 'woman');
    }
    if (status === 'banned') {
      query = query.eq('is_banned', true);
    } else if (status === 'active') {
      query = query.eq('is_banned', false);
    } else if (status === 'pending') {
      query = query.eq('approval_status', 'pending');
    }

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Coin balances live in `wallets`, not `profiles.coins` (a legacy column
    // from before the wallet system existed that no longer gets updated by
    // purchases or spends). Join the real balance in here so the admin table
    // doesn't show a stale or always-zero number.
    const ids = (users || []).map((u) => u.id);
    let balanceMap = new Map<string, number>();
    if (ids.length > 0) {
      const { data: wallets } = await supabase
        .from('wallets')
        .select('user_id, balance')
        .in('user_id', ids);
      balanceMap = new Map((wallets || []).map((w) => [w.user_id, w.balance]));
    }

    const usersWithCoins = (users || []).map((u) => ({
      ...u,
      coins: balanceMap.get(u.id) ?? 0,
    }));

    return NextResponse.json({ users: usersWithCoins, total: count || 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
