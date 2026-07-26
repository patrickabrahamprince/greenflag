import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface IntentionPayload {
  dayNumber: number;
  type: string;
  prompt: string;
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('persona')
      .eq('id', user.id)
      .single();

    if (profile?.persona !== 'woman') {
      return NextResponse.json({ error: 'Only women can activate standards' }, { status: 403 });
    }

    const { intentions } = (await req.json()) as { intentions: IntentionPayload[] };

    if (!Array.isArray(intentions) || intentions.length !== 3) {
      return NextResponse.json({ error: 'Exactly 3 intentions required' }, { status: 400 });
    }

    const validDays = [1, 2, 3];
    const hasAllDays = validDays.every((day) =>
      intentions.some((i) => i.dayNumber === day && i.prompt.trim().length >= 10)
    );
    if (!hasAllDays) {
      return NextResponse.json({ error: 'Each day 1-3 must have a prompt of at least 10 characters' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('standards')
      .select('id')
      .eq('woman_id', user.id)
      .limit(1)
      .maybeSingle();

    let standardId: string;

    if (existing) {
      standardId = existing.id;
      await supabase.from('intentions').delete().eq('standard_id', standardId);
    } else {
      const { data: created, error: createErr } = await supabase
        .from('standards')
        .insert({ woman_id: user.id, intentions: {} })
        .select('id')
        .single();
      if (createErr || !created) {
        return NextResponse.json({ error: 'Failed to create standard' }, { status: 500 });
      }
      standardId = created.id;
    }

    const intentionRows = intentions.map((i) => ({
      standard_id: standardId,
      day_number: i.dayNumber,
      type: i.type,
      prompt: i.prompt.trim(),
    }));

    const { error: insertErr } = await supabase.from('intentions').insert(intentionRows);
    if (insertErr) {
      return NextResponse.json({ error: 'Failed to save intentions' }, { status: 500 });
    }

    await supabase
      .from('standards')
      .update({ is_active: false })
      .eq('woman_id', user.id)
      .neq('id', standardId);

    const { error: activateErr } = await supabase
      .from('standards')
      .update({ is_active: true })
      .eq('id', standardId);

    if (activateErr) {
      return NextResponse.json({ error: 'Failed to activate standard' }, { status: 500 });
    }

    return NextResponse.json({ success: true, standardId });
  } catch (e) {
    console.error('standards/activate error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
