import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// No auth -- this only ever returns a single aggregate count (never
// individual rows or anything PII), used for onboarding social proof.
// Real data only: fabricating a number here would be a dark pattern, and
// the client-side caller is expected to fall back to qualitative copy
// when this count is still too small to look credible.
export async function GET() {
  const admin = getAdmin();
  const { count } = await admin
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('chat_unlocked', true);

  return NextResponse.json({ completedStandards: count || 0 });
}
