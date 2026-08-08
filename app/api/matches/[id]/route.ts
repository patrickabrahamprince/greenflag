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

    // Scoping strictly to current_day meant a special send became
    // unreachable the instant the day it was sent on finished -- her own
    // approval of the day's last task advances current_day server-side
    // (see review-task/route.ts), and that fetchMatch() refetch could
    // land before she'd gotten to reveal a special note she'd already
    // seen sitting there, permanently losing it (it also can't outlive
    // the day the response arrives on, since day_number no longer
    // matches). Including current_day - 1 gives her through the
    // approval that advances the day to still see/reveal it.
    const { data: specialSend } = await admin
      .from('special_sends')
      .select('id, day_number, type, content, media_url, media_type, created_at, viewed_at')
      .eq('match_id', id)
      .gte('day_number', Math.max(1, match.current_day - 1))
      .lte('day_number', match.current_day)
      .order('day_number', { ascending: false })
      .limit(1)
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
