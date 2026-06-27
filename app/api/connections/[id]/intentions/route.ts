import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const admin = getAdmin();

    const { day_number, content, type } = await req.json();
    if (!day_number || !content) {
      return NextResponse.json({ error: 'day_number and content are required' }, { status: 400 });
    }

    const mediaType = type || 'text';

    const { error } = await admin.from('submissions').insert({
      connection_id: id,
      day_number,
      moderation_status: 'submitted',
      media_type: mediaType,
      content,
      submitted_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
