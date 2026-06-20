import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notifyHostOfSubmission } from '@/lib/notifications';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { task_number, text, media_url } = await req.json();

    if (!task_number || task_number < 1 || task_number > 8) {
      return NextResponse.json({ error: 'task_number must be 1-8' }, { status: 400 });
    }

    if (!text && !media_url) {
      return NextResponse.json({ error: 'text or media_url required' }, { status: 400 });
    }

    const { data, error } = await supabase.rpc('submit_task', {
      p_connection_id: id,
      p_task_number: task_number,
      p_text: text || null,
      p_media_url: media_url || null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Notify host of new submission
    try {
      const { data: connection } = await supabase
        .from('connections')
        .select('host_id')
        .eq('id', id)
        .single();

      const { data: guestProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (connection && guestProfile) {
        await notifyHostOfSubmission(
          supabase,
          connection.host_id,
          guestProfile.name || 'Someone',
          task_number,
          id
        );
      }
    } catch (notifyError) {
      console.error('Failed to send notification:', notifyError);
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
