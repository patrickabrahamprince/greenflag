import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const admin = getAdmin();

    const { data: connection, error } = await admin
      .from('connections')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !connection) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const [hostRes, guestRes] = await Promise.all([
      admin.from('profiles').select('id, name, age, photos, city_auto, standards').eq('id', connection.host_id).maybeSingle(),
      admin.from('profiles').select('id, name, age, photos').eq('id', connection.guest_id).maybeSingle(),
    ])

    const { data: submissions } = await admin
      .from('submissions')
      .select('*')
      .eq('connection_id', id)
      .order('day_number', { ascending: true });

    const { data: intentions } = await admin
      .from('intentions')
      .select('*')
      .eq('standard_id', connection.standard_id || '')
      .order('day_number', { ascending: true });

    return NextResponse.json({
      ...connection,
      host: hostRes || null,
      guest: guestRes || null,
      submissions: submissions || [],
      intentions: intentions || [],
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
