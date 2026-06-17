export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "@/lib/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const { adminId } = auth;

  const supabase = getAdminClient();
  const { id: userId } = await params;

  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: false,
      ban_reason: null,
      banned_at: null,
      banned_by: null,
    })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action: "unban_user",
    target_type: "profile",
    target_id: userId,
  });

  return NextResponse.json({ success: true });
}
