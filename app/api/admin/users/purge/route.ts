import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase());
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userEmail = user?.email?.toLowerCase();

    if (!user || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const adminSupabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const deleted_tables: string[] = [];

    const { error: storageErr } = await adminSupabase
      .from('storage.objects')
      .delete()
      .eq('owner', user_id);
    if (!storageErr) deleted_tables.push('storage.objects');

    const { data: conns } = await adminSupabase
      .from('connections')
      .select('id')
      .or(`host_id.eq.${user_id},guest_id.eq.${user_id}`);

    const connIds = conns?.map((c) => c.id) || [];

    if (connIds.length > 0) {
      const { error: subsErr } = await adminSupabase
        .from('submissions')
        .delete()
        .in('connection_id', connIds);
      if (!subsErr) deleted_tables.push('submissions');

      const { error: msgsErr } = await adminSupabase
        .from('messages')
        .delete()
        .in('connection_id', connIds);
      if (!msgsErr) deleted_tables.push('messages');
    }

    const { error: connDelErr } = await adminSupabase
      .from('connections')
      .delete()
      .or(`host_id.eq.${user_id},guest_id.eq.${user_id}`);
    if (!connDelErr) deleted_tables.push('connections');

    const { error: modErr } = await adminSupabase
      .from('mod_queue')
      .delete()
      .eq('reviewed_by', user_id);
    if (!modErr) deleted_tables.push('mod_queue');

    const { error: txErr } = await adminSupabase
      .from('transactions')
      .delete()
      .eq('user_id', user_id);
    if (!txErr) deleted_tables.push('transactions');

    const { error: walletErr } = await adminSupabase
      .from('wallets')
      .delete()
      .eq('user_id', user_id);
    if (!walletErr) deleted_tables.push('wallets');

    const { error: testsErr } = await adminSupabase
      .from('tests')
      .delete()
      .eq('host_id', user_id);
    if (!testsErr) deleted_tables.push('tests');

    const { error: profileErr } = await adminSupabase
      .from('profiles')
      .delete()
      .eq('id', user_id);
    if (!profileErr) deleted_tables.push('profiles');

    const { error: authErr } = await adminSupabase.auth.admin.deleteUser(user_id);
    if (!authErr) deleted_tables.push('auth.users');

    return NextResponse.json({
      success: true,
      deleted_tables,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Purge failed', detail: String(err) }, { status: 500 });
  }
}
