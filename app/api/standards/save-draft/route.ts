import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface IntentionPayload {
  dayNumber: number;
  taskNumber: number;
  prompt: string;
}

const TASK_TYPE: Record<number, string> = { 1: 'text', 2: 'photo', 3: 'voice' };

// Persists whatever's been filled in so far, without the "all 9 slots
// complete" requirement activate/route.ts enforces. Called after each day
// instead of only at the very end, so navigating away mid-flow (day 1 or
// 2 done, day 3 not yet) doesn't lose that work -- the standard-builder
// GET loader already restores from the intentions table regardless of
// whether the standard is active, so saving a draft here is all that's
// needed for it to reappear next time.
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
      return NextResponse.json({ error: 'Only women can save a standard draft' }, { status: 403 });
    }

    const { intentions } = (await req.json()) as { intentions: IntentionPayload[] };
    if (!Array.isArray(intentions)) {
      return NextResponse.json({ error: 'intentions must be an array' }, { status: 400 });
    }

    const filled = intentions.filter((i) => i.prompt.trim().length > 0);

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
        .insert({ woman_id: user.id, intentions: {}, is_active: false })
        .select('id')
        .single();
      if (createErr || !created) {
        return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
      }
      standardId = created.id;
    }

    if (filled.length > 0) {
      const rows = filled.map((i) => ({
        standard_id: standardId,
        day_number: i.dayNumber,
        task_number: i.taskNumber,
        type: TASK_TYPE[i.taskNumber],
        prompt: i.prompt.trim(),
      }));
      const { error: insertErr } = await supabase.from('intentions').insert(rows);
      if (insertErr) {
        return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, standardId });
  } catch (e) {
    console.error('standards/save-draft error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
