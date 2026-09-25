import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notifyWomanOfStandardBegin } from '@/lib/notifications';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to_user_id } = await req.json();
    if (!to_user_id) {
      return NextResponse.json({ error: 'to_user_id is required' }, { status: 400 });
    }

    const { data: rpcData, error } = await supabase.rpc('create_like', { p_to_user_id: to_user_id });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const data = rpcData as { success: boolean; error?: string; like_id?: string; match_id?: string };
    if (!data?.success) {
      const status = data?.error === 'insufficient_funds' ? 402 : 400;
      return NextResponse.json({ error: data?.error || 'Failed to like profile' }, { status });
    }

    if (data.match_id) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Immediately unlock direct chat for travel buddies
        await admin.from('matches').update({
          chat_unlocked: true,
          status: 'completed',
        }).eq('id', data.match_id);

        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        await admin.from('notifications').insert({
          user_id: to_user_id,
          title: 'New Travel Buddy! ✈️',
          body: `${senderProfile?.name || 'A traveler'} connected with you! Start chatting to plan trips.`,
          type: 'connection',
          link: '/messages',
          read: false,
        });
      } catch (notifyErr) {
        console.error('Error auto-unlocking travel buddy chat:', notifyErr);
      }
    }

    return NextResponse.json({ likeId: data.like_id, matchId: data.match_id });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
