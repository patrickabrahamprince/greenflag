import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = 20;
    const offset = page * limit;

    let query = supabase
      .from('reports')
      .select(`
        *,
        reporter:reporter_id(id, name, email),
        reported:reported_id(id, name, email)
      `, { count: 'exact' });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: reports, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ reports: reports || [], total: count || 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { reported_id, reason, details } = await req.json();
    if (!reported_id || !reason) {
      return NextResponse.json({ error: 'reported_id and reason are required' }, { status: 400 });
    }

    if (user.id === reported_id) {
      return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 });
    }

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_id,
      reason,
      details,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
