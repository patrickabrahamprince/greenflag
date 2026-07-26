import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase } = auth.data;

    const [menRes, womenRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('persona', 'man'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('persona', 'woman'),
    ]);

    return NextResponse.json({
      men: menRes.count || 0,
      women: womenRes.count || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
