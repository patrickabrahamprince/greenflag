import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: activeStandard } = await supabase
      .from('standards')
      .select('id')
      .eq('woman_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (activeStandard) {
      return NextResponse.json({ redirect: '/my-connections' });
    }

    const { data: standard } = await supabase
      .from('standards')
      .select('id')
      .eq('woman_id', user.id)
      .limit(1)
      .maybeSingle();

    if (!standard) {
      return NextResponse.json({ standardId: null, intentions: [] });
    }

    const { data: intentions } = await supabase
      .from('intentions')
      .select('day_number, task_number, type, prompt')
      .eq('standard_id', standard.id)
      .order('day_number');

    return NextResponse.json({ standardId: standard.id, intentions: intentions || [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
