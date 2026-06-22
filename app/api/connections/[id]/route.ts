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
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: connection, error } = await supabase
      .from('connections')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !connection) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const [hostRes, guestRes] = await Promise.all([
      supabase.from('profiles').select('id, name, age, photos, city_auto, standards').eq('id', connection.host_id).single(),
      supabase.from('profiles').select('id, name, age, photos').eq('id', connection.guest_id).single(),
    ])

    const { data: submissions } = await supabase
      .from('task_submissions')
      .select('*')
      .eq('connection_id', id)
      .order('task_number', { ascending: true });

    return NextResponse.json({
      ...connection,
      host: hostRes.data || null,
      guest: guestRes.data || null,
      submissions: submissions || []
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
