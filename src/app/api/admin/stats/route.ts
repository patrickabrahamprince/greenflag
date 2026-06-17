export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/admin";

export async function GET() {
  const supabase = getAdminClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [{ count: pendingPhotos }, { count: activeConnections }, { count: flaggedUsers }, { data: revenueData }, { data: connections }] = await Promise.all([
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "submitted").not("proof_url", "is", null),
    supabase.from("connections").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", true),
    supabase.from("payments").select("amount").eq("status", "paid").gte("created_at", startOfMonth),
    supabase.from("connections").select("created_at").gte("created_at", sevenDaysAgo.toISOString()).order("created_at", { ascending: true }),
  ]);

  const revenue = (revenueData ?? []).reduce((sum: number, p: { amount: number }) => sum + p.amount, 0);

  const dateMap = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    dateMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const c of connections ?? []) {
    const key = c.created_at.slice(0, 10);
    if (dateMap.has(key)) dateMap.set(key, dateMap.get(key)! + 1);
  }
  const dailyConnections = Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    pendingPhotos: pendingPhotos ?? 0,
    activeConnections: activeConnections ?? 0,
    flaggedUsers: flaggedUsers ?? 0,
    revenue,
    dailyConnections,
  });
}
