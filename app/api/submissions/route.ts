import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { connection_id, task_id, proof_url, proof_text } = body;

    if (!connection_id || !task_id) {
      return NextResponse.json({ error: 'connection_id and task_id are required' }, { status: 400 });
    }

    const { data: connection } = await supabase
      .from('connections')
      .select('guest_id, host_id')
      .eq('id', connection_id)
      .single();

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (connection.guest_id !== user.id && connection.host_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('task_submissions')
      .insert({
        connection_id,
        task_number: task_id,
        content_type: proof_url ? 'image' : 'text',
        text_content: proof_text || null,
        media_url: proof_url || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
