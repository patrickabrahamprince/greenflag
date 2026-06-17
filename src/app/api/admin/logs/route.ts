export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "@/lib/admin";

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const supabase = getAdminClient();
  const url = new URL(request.url);
  const adminId = url.searchParams.get("admin_id");
  const action = url.searchParams.get("action");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "100", 10), 500);

  let query = supabase
    .from("admin_logs")
    .select("*, admin:profiles!admin_logs_admin_id_fkey(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (adminId) query = query.eq("admin_id", adminId);
  if (action) query = query.eq("action", action);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
