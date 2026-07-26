import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/admin/auth';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface MatchRef {
  user1?: { id?: string; name?: string } | null;
  user2?: { id?: string; name?: string } | null;
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const admin = getAdmin();

  // submissions.prompt/content are denormalized onto the row at submit
  // time, so this doesn't need to join through standards/intentions to
  // show what was actually asked -- text and voice submissions carry
  // their own prompt just like photo ones do.
  const { data, error } = await admin
    .from('submissions')
    .select(`
      id,
      content,
      prompt,
      media_url,
      media_type,
      moderation_status,
      submitted_at,
      day_number,
      task_number,
      match_id,
      matches(user1:user1_id(id,name), user2:user2_id(id,name))
    `)
    .eq('moderation_status', 'pending')
    .order('submitted_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = (data || []).map((s) => {
    const match = s.matches as unknown as MatchRef | null;
    return {
      id: String(s.id),
      name: match?.user1?.name || match?.user2?.name || 'Unknown',
      day: Number(s.day_number) || 0,
      taskNumber: Number(s.task_number) || 1,
      task: s.prompt || '',
      content: s.content || null,
      img: String(s.media_url || ''),
      submitted_at: String(s.submitted_at || ''),
      media_type: s.media_type as string | null,
    };
  });

  return NextResponse.json({ items });
}
