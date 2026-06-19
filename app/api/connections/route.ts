import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());

export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const isAdminUser = ADMIN_EMAILS.includes(user.email?.toLowerCase() || '');
  const isHost = profile?.role === 'host';

  if (isHost && !isAdminUser) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const connections = [
    {
      id: 'conn-1',
      test_id: 's1',
      guest_id: 'guest-1',
      host_id: 'host-1',
      status: 'active',
      tasks_completed: 3,
      expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'conn-2',
      test_id: 's3',
      guest_id: 'guest-1',
      host_id: 'host-3',
      status: 'active',
      tasks_completed: 5,
      expires_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'conn-3',
      test_id: 's2',
      guest_id: 'guest-1',
      host_id: 'host-2',
      status: 'completed',
      tasks_completed: 8,
      expires_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const filtered = status
    ? connections.filter((c) => c.status === status)
    : connections;

  return NextResponse.json({ connections: filtered });
}
