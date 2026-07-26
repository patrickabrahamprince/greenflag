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

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { standardId, intentions } = (await req.json()) as {
      standardId: string | null;
      intentions: { dayNumber: number; type: string; prompt: string }[];
    };

    if (!Array.isArray(intentions) || intentions.length !== 3) {
      return NextResponse.json({ error: 'Exactly 3 intentions required' }, { status: 400 });
    }

    let sid = standardId;

    if (!sid) {
      const { data: created, error: createErr } = await supabase
        .from('standards')
        .insert({ woman_id: user.id, intentions: {} })
        .select('id')
        .single();
      if (createErr || !created) {
        return NextResponse.json({ error: 'Failed to create standard' }, { status: 500 });
      }
      sid = created.id;
    } else {
      await supabase.from('intentions').delete().eq('standard_id', sid);
    }

    const rows = intentions.map((i) => ({
      standard_id: sid!,
      day_number: i.dayNumber,
      type: i.type,
      prompt: i.prompt.trim(),
    }));

    const { error: insertErr } = await supabase.from('intentions').insert(rows);
    if (insertErr) {
      return NextResponse.json({ error: 'Failed to save intentions' }, { status: 500 });
    }

    return NextResponse.json({ success: true, standardId: sid });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
