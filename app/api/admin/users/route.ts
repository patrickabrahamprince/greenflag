import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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
      // profiles has no email column (email only lives on auth.users), so
      // searching by it here would error out the whole query -- name only.
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

    // profiles has no email column (it only lives on auth.users) --
    // bulk-fetch via the admin API and merge in, rather than one lookup
    // per row. Fine at this project's current scale; would need real
    // pagination through listUsers() if the user base grows well past
    // perPage.
    const { data: authUsers } = await getAdmin().auth.admin.listUsers({ perPage: 1000 });
    const emailById = new Map((authUsers?.users || []).map((u) => [u.id, u.email]));
    const usersWithEmail = (users || []).map((u) => ({ ...u, email: emailById.get(u.id) || null }));

    return NextResponse.json({ users: usersWithEmail, total: count || 0 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
