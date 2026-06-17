export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "@/lib/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const { adminId } = auth;

  const supabase = getAdminClient();
  const { id } = await params;

  const { error } = await supabase
    .from("connections")
    .update({ tasks_completed: 8, status: "completed" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action: "force_complete_connection",
    target_type: "connection",
    target_id: id,
  });

  return NextResponse.json({ success: true });
}
