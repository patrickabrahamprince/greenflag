import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin/auth';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ProfileRef {
  id?: string;
  name?: string;
  photos?: string[] | null;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const admin = getAdmin();

  const { data: matches, error } = await admin
    .from('matches')
    .select(`
      id, current_day, status, chat_unlocked, created_at, completed_at,
      next_day_unlocks_at, review_deadline,
      man:user1_id(id, name, photos),
      woman:user2_id(id, name, photos)
    `)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const matchIds = (matches || []).map((m) => m.id);
  const { data: submissions } = matchIds.length
    ? await admin.from('submissions').select('match_id, approved, moderation_status').in('match_id', matchIds)
    : { data: [] };

  const counts = new Map<string, { total: number; approved: number; flagged: number }>();
  for (const s of submissions || []) {
    const c = counts.get(s.match_id) || { total: 0, approved: 0, flagged: 0 };
    c.total += 1;
    if (s.approved) c.approved += 1;
    if (s.moderation_status === 'rejected') c.flagged += 1;
    counts.set(s.match_id, c);
  }

  const items = (matches || []).map((m) => {
    const man = m.man as unknown as ProfileRef | null;
    const woman = m.woman as unknown as ProfileRef | null;
    const c = counts.get(m.id) || { total: 0, approved: 0, flagged: 0 };
    return {
      id: m.id,
      currentDay: m.current_day,
      status: m.status,
      chatUnlocked: m.chat_unlocked,
      createdAt: m.created_at,
      completedAt: m.completed_at,
      nextDayUnlocksAt: m.next_day_unlocks_at,
      reviewDeadline: m.review_deadline,
      man: { id: man?.id, name: man?.name || 'Unknown', photo: man?.photos?.[0] || null },
      woman: { id: woman?.id, name: woman?.name || 'Unknown', photo: woman?.photos?.[0] || null },
      submissionCounts: c,
    };
  });

  return NextResponse.json({ matches: items });
}
