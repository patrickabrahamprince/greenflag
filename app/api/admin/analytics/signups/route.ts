import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('created_at, gender')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (!profiles) return NextResponse.json({ data: [] });

    const daily: Record<string, { date: string; hosts: number; guests: number }> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().split('T')[0];
      daily[key] = { date: key, hosts: 0, guests: 0 };
    }

    for (const p of profiles) {
      const key = new Date(p.created_at ?? '').toISOString().split('T')[0];
      if (daily[key]) {
        if (p.gender === 'woman') daily[key].hosts++;
        else daily[key].guests++;
      }
    }

    return NextResponse.json({ data: Object.values(daily) });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
