import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getAdminClient();

    const { data: match, error: matchErr } = await admin
      .from('matches')
      .select('id, user1_id, user2_id, current_day, status, chat_unlocked, completed_at, next_day_unlocks_at, submit_deadline, review_deadline, rejection_reason, retry_unlocked_at, retry_decision')
      .eq('id', id)
      .maybeSingle();

    if (matchErr || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }
    if (match.user1_id !== user.id && match.user2_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const womanId = match.user2_id;
    const otherId = user.id === match.user1_id ? match.user2_id : match.user1_id;

    const { data: otherProfile } = await admin
      .from('profiles')
      .select('id, name, age, photos')
      .eq('id', otherId)
      .single();

    const { data: standard } = await admin
      .from('standards')
      .select('id')
      .eq('woman_id', womanId)
      .eq('is_active', true)
      .maybeSingle();

    const { data: intentions } = standard
      ? await admin
          .from('intentions')
          .select('id, standard_id, day_number, task_number, type, prompt')
          .eq('standard_id', standard.id)
          .eq('day_number', match.current_day)
          .order('task_number')
      : { data: [] };

    const { data: submissions } = await admin
      .from('submissions')
      .select('id, match_id, day_number, task_number, content, media_url, media_type, approved, moderation_status, submitted_at')
      .eq('match_id', id)
      .eq('day_number', match.current_day);

    const { data: specialSend } = await admin
      .from('special_sends')
      .select('id, day_number, type, content, media_url, media_type, created_at, viewed_at')
      .eq('match_id', id)
      .eq('day_number', match.current_day)
      .maybeSingle();

    // First time the woman fetches it, mark it viewed -- that one look is
    // free (he already paid to send it); any fetch after this one is a
    // stale flag until she pays to reveal it again client-side.
    let alreadyViewed = !!specialSend?.viewed_at;
    if (specialSend && user.id === womanId && !specialSend.viewed_at) {
      await admin.from('special_sends').update({ viewed_at: new Date().toISOString() }).eq('id', specialSend.id);
      alreadyViewed = false;
    }

    return NextResponse.json({
      match,
      otherProfile,
      intentions: intentions || [],
      submissions: submissions || [],
      specialSend: specialSend ? { ...specialSend, alreadyViewed } : null,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
