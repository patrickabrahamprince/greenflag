export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "@/lib/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const { adminId } = auth;

  const supabase = getAdminClient();
  const { id } = await params;
  const { moderation_note } = await request.json();

  const { data: submission, error: fetchError } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  const { data: updated, error: updateError } = await supabase
    .from("submissions")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      moderated_by: adminId,
      moderation_note: moderation_note ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action: "reject_submission",
    target_type: "submission",
    target_id: id,
    metadata: { day_number: submission.day_number },
  });

  return NextResponse.json(updated);
}
