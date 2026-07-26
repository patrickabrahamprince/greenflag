import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Lets a rejected applicant wipe their own (rejected) profile and redo
// onboarding from scratch, without deleting their login -- auth.users and
// their wallet balance are left untouched, only the profile row (and
// everything that cascades from it: matches, likes, standards,
// submissions, notifications, coin_transactions) plus their uploaded
// photos in storage.
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

  if (profile?.approval_status !== 'rejected') {
    return NextResponse.json({ error: 'Only a rejected application can be restarted' }, { status: 400 });
  }

  await admin.from('storage.objects').delete().eq('owner', user.id);

  const { error } = await admin.from('profiles').delete().eq('id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
