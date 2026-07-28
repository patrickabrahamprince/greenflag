import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// The "verifying your profile" banner (men) / review countdown (women)
// runs a short cosmetic timer to keep the curated-community feel, then
// calls this to flip the account live. It only ever moves a user's own
// account from pending -> approved -- no other field or account is
// touched, so there's no privilege-escalation surface here even though
// it runs on the service-role client.
export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getAdmin();
  const { data: profile } = await admin
    .from('profiles')
    .select('approval_status')
    .eq('id', user.id)
    .single();

  if (profile?.approval_status !== 'pending') {
    return NextResponse.json({ error: 'Not pending' }, { status: 400 });
  }

  const { error } = await admin
    .from('profiles')
    .update({ approval_status: 'approved' })
    .eq('id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
