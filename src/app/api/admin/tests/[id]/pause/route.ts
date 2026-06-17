export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "@/lib/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const { adminId } = auth;

  const supabase = getAdminClient();
  const { id } = await params;
  const { is_paused } = await request.json();

  const { data: updated, error } = await supabase
    .from("tests")
    .update({ is_paused })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action: is_paused ? "pause_test" : "unpause_test",
    target_type: "test",
    target_id: id,
    metadata: { is_paused },
  });

  return NextResponse.json(updated);
}
