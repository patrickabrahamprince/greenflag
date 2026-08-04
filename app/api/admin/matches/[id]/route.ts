import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin/auth';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const admin = getAdmin();

  const { data: match, error } = await admin
    .from('matches')
    .select(`
      id, current_day, status, chat_unlocked, created_at, completed_at,
      next_day_unlocks_at, submit_deadline, review_deadline, rejection_reason,
      man:user1_id(id, name, photos),
      woman:user2_id(id, name, photos)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 });

  // submissions has no `type` or `rejection_reason` column -- those were
  // tracked in the original init.sql schema but production dropped them;
  // the type a submission actually is lives on `media_type`, and rejection
  // is recorded on the match (selected above), not per-submission.
  const { data: submissions } = await admin
    .from('submissions')
    .select('id, day_number, task_number, content, media_url, media_type, approved, moderation_status, submitted_at, reviewed_at')
    .eq('match_id', id)
    .order('day_number')
    .order('task_number');

  return NextResponse.json({ match, submissions: submissions || [] });
}
