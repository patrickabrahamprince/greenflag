import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ womanId: string }> }
) {
  try {
    const { womanId } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: viewer } = await supabase
      .from('profiles')
      .select('persona')
      .eq('id', user.id)
      .single();

    if (viewer?.persona !== 'man') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: woman, error: womanErr } = await supabase
      .from('profiles')
      .select('name, age, city, bio, photos, why_me_prompts')
      .eq('id', womanId)
      .single();

    if (womanErr || !woman) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: standard } = await supabase
      .from('standards')
      .select('id')
      .eq('woman_id', womanId)
      .eq('is_active', true)
      .single();

    if (!standard) {
      return NextResponse.json({ error: 'No active standard' }, { status: 404 });
    }

    const { data: intentions } = await supabase
      .from('intentions')
      .select('id, day_number, type, prompt')
      .eq('standard_id', standard.id)
      .order('day_number', { ascending: true });

    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      woman: {
        ...woman,
        intentions: intentions ?? [],
      },
      coinBalance: wallet?.balance ?? 0,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
