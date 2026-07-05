import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    // `wallets` and `coin_transactions` both only have "view own row(s)"
    // RLS policies (auth.uid() = user_id). The admin's session client can
    // only ever see the admin's own wallet/transactions, so cross-user
    // reads here must go through a service-role client instead.
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: wallet } = await adminClient
      .from('wallets')
      .select('balance')
      .eq('user_id', id)
      .maybeSingle();

    const userWithRealBalance = {
      ...user,
      coins: wallet?.balance ?? 0,
    };

    const { data: coinTransactions } = await adminClient
      .from('coin_transactions')
      .select('*')
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
      user: userWithRealBalance,
      coinTransactions: coinTransactions || [],
      connections: mappedMatches,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
