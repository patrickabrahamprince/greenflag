import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { match_id } = await req.json();
    if (!match_id) {
      return NextResponse.json({ error: 'match_id required' }, { status: 400 });
    }

    const { data: match } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', match_id)
      .single() as { data: { user1_id: string; user2_id: string } | null };

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.user1_id !== user.id && match.user2_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase.rpc('mark_messages_read', {
      p_match_id: match_id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
