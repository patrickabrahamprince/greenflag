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
    const gender = searchParams.get('gender') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = 20;
    const offset = page * limit;

    let query = supabase
      .from('profiles')
      .select('id, name, age, gender, city_auto, created_at, last_active, is_banned, is_admin, photos, email, role', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (gender) {
      query = query.eq('gender', gender);
    }
    if (status === 'banned') {
      query = query.eq('is_banned', true);
    } else if (status === 'active') {
      query = query.eq('is_banned', false);
    }

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ users: users || [], total: count || 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
