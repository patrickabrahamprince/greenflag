export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "@/lib/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const { adminId } = auth;

  const supabase = getAdminClient();
  const { id: userId } = await params;
  const { reason } = await request.json();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      is_banned: true,
      ban_reason: reason,
      banned_at: new Date().toISOString(),
      banned_by: adminId,
    })
    .eq("id", userId);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const { data: connections } = await supabase
    .from("connections")
    .select("id")
    .eq("guest_id", userId);

  if (connections && connections.length > 0) {
    const connectionIds = connections.map((c: { id: string }) => c.id);

    await supabase
      .from("submissions")
      .update({ status: "rejected", reviewed_at: new Date().toISOString(), moderated_by: adminId })
      .in("connection_id", connectionIds)
      .eq("status", "submitted");
  }

  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action: "ban_user",
    target_type: "profile",
    target_id: userId,
    metadata: { reason },
  });

  return NextResponse.json({ success: true });
}
