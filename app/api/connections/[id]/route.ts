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
      .select('*, host:host_id(id, name, age, photos, city_auto, standards), guest:guest_id(id, name, age, photos)')
      .eq('id', id)
      .single();

    if (error || !connection) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: submissions } = await supabase
      .from('task_submissions')
      .select('*')
      .eq('connection_id', id)
      .order('task_number', { ascending: true });

    return NextResponse.json({ ...(connection!), submissions: submissions || [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
