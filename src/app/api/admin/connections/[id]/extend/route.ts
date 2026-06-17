export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "@/lib/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const { adminId } = auth;

  const supabase = getAdminClient();
  const { id } = await params;

  const { data: connection, error: fetchError } = await supabase
    .from("connections")
    .select("expires_at")
    .eq("id", id)
    .single();

  if (fetchError || !connection) {
    return NextResponse.json({ error: "Connection not found" }, { status: 404 });
  }

  const currentExpiry = new Date(connection.expires_at);
  currentExpiry.setDate(currentExpiry.getDate() + 1);
  const newExpiresAt = currentExpiry.toISOString();

  const { data: updated, error: updateError } = await supabase
    .from("connections")
    .update({ expires_at: newExpiresAt })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action: "extend_connection",
    target_type: "connection",
    target_id: id,
    metadata: { previous_expires_at: connection.expires_at, new_expires_at: newExpiresAt },
  });

  return NextResponse.json(updated);
}
