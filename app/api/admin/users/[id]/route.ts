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

    const { data: connections } = await supabase
      .from('connections')
      .select(`
        id,
        status,
        current_day,
        expires_at,
        created_at,
        guest:profiles!connections_guest_id_fkey(name),
        host:profiles!connections_host_id_fkey(name)
      `)
      .or(`guest_id.eq.${id},host_id.eq.${id}`)
      .order('created_at', { ascending: false });

    const mappedConnections = (connections || []).map((c: Record<string, unknown>) => {
      const guest = c.guest as { name?: string } | null;
      const host = c.host as { name?: string } | null;
      return {
        id: c.id,
        status: c.status,
        current_day: c.current_day,
        created_at: c.created_at,
        expires_at: c.expires_at,
        guest_name: guest?.name,
        host_name: host?.name,
      };
    });

    return NextResponse.json({
      user,
      coinTransactions: coinTransactions || [],
      connections: mappedConnections,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
