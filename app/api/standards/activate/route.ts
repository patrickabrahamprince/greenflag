import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface IntentionPayload {
  dayNumber: number;
  taskNumber: number;
  prompt: string;
}

const TASK_TYPE: Record<number, string> = { 1: 'text', 2: 'photo', 3: 'voice' };

const FALLBACK_PROMPTS: Record<string, string> = {
  '1-1': "What's something you're proud of?",
  '1-2': 'Share a photo of your smile',
  '1-3': 'Tell me about your day',
  '2-1': 'What are you looking for in a partner?',
  '2-2': 'Show me doing something you love',
  '2-3': 'What does a perfect date look like to you?',
  '3-1': 'Why should I give you a chance?',
  '3-2': 'A candid, unfiltered photo',
  '3-3': "Tell me why we'd be a good match",
};

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getAdmin();

    const { data: profile } = await admin
      .from('profiles')
      .select('persona')
      .eq('id', user.id)
      .single();

    if (profile?.persona !== 'woman') {
      return NextResponse.json({ error: 'Only women can activate standards' }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as { intentions?: IntentionPayload[] };
    const intentions = Array.isArray(body?.intentions) ? body.intentions : [];

    // Ensure all 9 slots (3 days x 3 tasks) are defined, filling fallbacks if empty
    const resolvedIntentions: IntentionPayload[] = [];
    for (let day = 1; day <= 3; day++) {
      for (let task = 1; task <= 3; task++) {
        const found = intentions.find((i) => i.dayNumber === day && i.taskNumber === task);
        const prompt = (found?.prompt || '').trim();
        resolvedIntentions.push({
          dayNumber: day,
          taskNumber: task,
          prompt: prompt.length >= 5 ? prompt : FALLBACK_PROMPTS[`${day}-${task}`] || "Tell me why we'd be a good match",
        });
      }
    }

    const { data: existing } = await admin
      .from('standards')
      .select('id')
      .eq('woman_id', user.id)
      .limit(1)
      .maybeSingle();

    let standardId: string;

    if (existing) {
      standardId = existing.id;
      await admin.from('intentions').delete().eq('standard_id', standardId);
    } else {
      const { data: created, error: createErr } = await admin
        .from('standards')
        .insert({ woman_id: user.id, intentions: {} })
        .select('id')
        .single();
      if (createErr || !created) {
        return NextResponse.json({ error: 'Failed to create standard' }, { status: 500 });
      }
      standardId = created.id;
    }

    const intentionRows = resolvedIntentions.map((i) => ({
      standard_id: standardId,
      day_number: i.dayNumber,
      task_number: i.taskNumber,
      type: TASK_TYPE[i.taskNumber],
      prompt: i.prompt,
    }));

    const { error: insertErr } = await admin.from('intentions').insert(intentionRows);
    if (insertErr) {
      return NextResponse.json({ error: 'Failed to save intentions' }, { status: 500 });
    }

    await admin
      .from('standards')
      .update({ is_active: false })
      .eq('woman_id', user.id)
      .neq('id', standardId);

    const { error: activateErr } = await admin
      .from('standards')
      .update({ is_active: true })
      .eq('id', standardId);

    if (activateErr) {
      return NextResponse.json({ error: 'Failed to activate standard' }, { status: 500 });
    }

    const { error: profileErr } = await admin
      .from('profiles')
      .update({ onboarding_completed: true, approval_status: 'approved' })
      .eq('id', user.id);

    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, standardId });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') console.error('standards/activate error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
