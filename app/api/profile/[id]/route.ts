import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', [user.id, id]);

    const viewer = profiles?.find((p) => p.id === user.id);
    const target = profiles?.find((p) => p.id === id);

    if (!target) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let matchData: { percent: number; overlapping: string[]; viewerIsHost: boolean } | null = null;
    if (viewer && viewer.gender !== target.gender) {
      const viewerIsHost = viewer.gender === 'woman';
      const standards = viewerIsHost ? viewer.looking_for_interests : target.looking_for_interests;
      const interests = viewerIsHost ? target.interests : viewer.interests;
      const overlap = (interests || []).filter((i: string) => (standards || []).includes(i));
      matchData = {
        percent: Math.round((overlap.length / 5) * 100),
        overlapping: overlap,
        viewerIsHost,
      };
    }

    const viewerId = viewer?.gender === 'woman' ? viewer.id : target.id;
    const targetId = viewer?.gender === 'woman' ? target.id : viewer?.id;

    const { data: connection } = await supabase
      .from('connections')
      .select('id, status')
      .or(
        `and(host_id.eq.${viewerId},guest_id.eq.${targetId})`
      )
      .maybeSingle();

    return NextResponse.json({
      profile: target,
      match: matchData,
      connection,
      isOwnProfile: user.id === id,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
