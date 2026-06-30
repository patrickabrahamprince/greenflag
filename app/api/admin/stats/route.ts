import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const { supabase } = auth.data;

    const [totalUsersRes, hostsRes, guestsRes, activeConnsRes, pendingModRes, revenueRes, todayConnsRes, activityRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('persona', 'woman'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('persona', 'man'),
      supabase.from('matches' as any).select('*', { count: 'exact', head: true }),
      supabase.from('reports' as any).select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('coin_transactions').select('amount').eq('type', 'purchase'),
      supabase.from('matches' as any).select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().slice(0, 10)),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20),
    ]);

    const totalUsers = totalUsersRes.count || 0;
    const hosts = hostsRes.count || 0;
    const guests = guestsRes.count || 0;
    const activeConnections = activeConnsRes.count || 0; // mapped to total matches
    const pendingModeration = pendingModRes.count || 0; // mapped to pending reports
    const revenue = (revenueRes.data || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    const connectedPairsToday = todayConnsRes.count || 0; // mapped to matches created today
    const recentActivity = activityRes.data || [];

    return NextResponse.json({
      totalUsers,
      hosts,
      guests,
      activeConnections,
      pendingModeration,
      revenue,
      connectedPairsToday,
      recentActivity,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
