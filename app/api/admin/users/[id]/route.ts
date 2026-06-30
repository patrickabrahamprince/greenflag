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

    const { data: coinTransactions } = await supabase
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
      user,
      coinTransactions: coinTransactions || [],
      connections: mappedMatches, // Kept key as 'connections' to avoid breaking Admin UI layout expectation
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
