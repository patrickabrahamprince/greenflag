import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase } = auth.data;

    const { data: user, error: userErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (userErr || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // wallets/coin_transactions are the real source of truth for coin
    // balance and history -- profiles.coins is never written to by the live
    // purchase/spend flow, so admin was showing stale data there. Note:
    // `transactions` (no "coin_") is a separate, currently-unused table --
    // confirmed directly against production (0 rows) that add_coins/
    // deduct_coins write to wallets+coin_transactions, not this one, despite
    // what the tracked init migration implies.
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', id)
      .maybeSingle();
    (user as Record<string, unknown>).coins = wallet?.balance ?? 0;

    const { data: coinTransactions } = await supabase
      .from('coin_transactions')
      .select('id, amount, type, description, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(50);

    const { data: matches } = await supabase
      .from('matches' as any)
      .select('*')
      .or(`user1_id.eq.${id},user2_id.eq.${id}`)
      .order('created_at', { ascending: false });

    const userIds = new Set<string>();
    (matches || []).forEach((m: any) => {
      userIds.add(m.user1_id);
      userIds.add(m.user2_id);
    });

    const { data: matchedProfiles } = userIds.size > 0 
      ? await supabase.from('profiles').select('id, name').in('id', Array.from(userIds))
      : { data: [] };

    const profilesMap = new Map((matchedProfiles || []).map((p) => [p.id, p.name]));

    const mappedMatches = (matches || []).map((m: any) => ({
      id: m.id,
      status: 'completed',
      created_at: m.created_at,
      user1_name: profilesMap.get(m.user1_id) || 'Unknown',
      user2_name: profilesMap.get(m.user2_id) || 'Unknown',
    }));

    return NextResponse.json({
      user,
      coinTransactions: coinTransactions || [],
      connections: mappedMatches, // Kept key as 'connections' to avoid breaking Admin UI layout expectation
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
