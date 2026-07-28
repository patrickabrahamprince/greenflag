import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token, platform } = await req.json().catch(() => ({}));
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  const admin = getAdmin();
  const { error } = await admin
    .from('device_tokens')
    .upsert(
      { user_id: user.id, token, platform: platform === 'android' ? 'android' : 'ios' },
      { onConflict: 'user_id,token' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
