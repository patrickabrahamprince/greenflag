import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, logAuditAction } from '@/lib/admin/auth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase, adminEmail } = auth.data;

    const { user_id } = await req.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    if (user_id === auth.data.adminId) {
      return NextResponse.json({ error: 'Cannot purge yourself' }, { status: 400 });
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

    const { error: photosErr } = await adminSupabase
      .from('photos' as any)
      .delete()
      .eq('user_id', user_id);
    if (!photosErr) deleted_tables.push('photos');

    const { error: likesErr } = await adminSupabase
      .from('likes' as any)
      .delete()
      .or(`from_user_id.eq.${user_id},to_user_id.eq.${user_id}`);
    if (!likesErr) deleted_tables.push('likes');

    const { error: matchesErr } = await adminSupabase
      .from('matches' as any)
      .delete()
      .or(`user1_id.eq.${user_id},user2_id.eq.${user_id}`);
    if (!matchesErr) deleted_tables.push('matches');

    const { error: convErr } = await adminSupabase
      .from('conversations' as any)
      .delete()
      .or(`user1_id.eq.${user_id},user2_id.eq.${user_id}`);
    if (!convErr) deleted_tables.push('conversations');

    const { error: msgsErr } = await adminSupabase
      .from('messages')
      .delete()
      .eq('sender_id', user_id);
    if (!msgsErr) deleted_tables.push('messages');

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

    await logAuditAction(supabase, adminEmail, 'purge_user', user_id);

    return NextResponse.json({
      success: true,
      deleted_tables,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Purge failed', detail: String(err) }, { status: 500 });
  }
}
