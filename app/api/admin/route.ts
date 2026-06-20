import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

async function requireAdmin(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { user };
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const admin = await requireAdmin(supabase);
    if ('error' in admin) return admin.error;

    const counts: Record<string, number> = {};
    for (const t of ['profiles', 'connections', 'messages', 'reports']) {
      const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
      counts[t] = count || 0;
    }

    const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    const { data: reports } = await supabase.from('reports').select('*, reporter:profiles!reports_reporter_id_fkey(name), reported:profiles!reports_reported_id_fkey(name)').order('created_at', { ascending: false }).limit(50);

    return NextResponse.json({ ...counts, users: users || [], reports: reports || [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
