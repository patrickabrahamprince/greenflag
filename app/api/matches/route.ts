import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = getAdminClient();

    const { data: matches, error } = await admin
      .from('matches')
      .select('id, user1_id, user2_id, current_day, status, chat_unlocked, completed_at, next_day_unlocks_at, submit_deadline, review_deadline, created_at')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const otherIds = (matches || []).map((m) => (m.user1_id === user.id ? m.user2_id : m.user1_id));
    const { data: profiles } = otherIds.length
      ? await admin.from('profiles').select('id, name, photos').in('id', otherIds)
      : { data: [] };

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const result = (matches || []).map((m) => {
      const otherId = m.user1_id === user.id ? m.user2_id : m.user1_id;
      const other = profileMap.get(otherId);
      return {
        id: m.id,
        current_day: m.current_day,
        status: m.status,
        chat_unlocked: m.chat_unlocked,
        next_day_unlocks_at: m.next_day_unlocks_at,
        submit_deadline: m.submit_deadline,
        review_deadline: m.review_deadline,
        otherName: other?.name || 'Unknown',
        otherPhoto: other?.photos?.[0] || null,
      };
    });

    return NextResponse.json({ matches: result });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
