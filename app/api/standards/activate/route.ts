import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface IntentionPayload {
  dayNumber: number;
  taskNumber: number;
  prompt: string;
}

// Fixed per-day composition: task 1 is always text, 2 always photo, 3
// always voice. Type is derived from taskNumber server-side rather than
// trusted from the client, so the composition can't drift.
const TASK_TYPE: Record<number, string> = { 1: 'text', 2: 'photo', 3: 'voice' };

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

    if (!Array.isArray(intentions) || intentions.length !== 9) {
      return NextResponse.json({ error: 'Exactly 9 intentions required (3 days x text/photo/voice)' }, { status: 400 });
    }

    const validDays = [1, 2, 3];
    const validTasks = [1, 2, 3];
    const hasAllSlots = validDays.every((day) =>
      validTasks.every((task) =>
        intentions.some((i) => i.dayNumber === day && i.taskNumber === task && i.prompt.trim().length >= 10)
      )
    );
    if (!hasAllSlots) {
      return NextResponse.json({ error: 'Each day needs a text, photo, and voice prompt of at least 10 characters' }, { status: 400 });
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
      task_number: i.taskNumber,
      type: TASK_TYPE[i.taskNumber],
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
