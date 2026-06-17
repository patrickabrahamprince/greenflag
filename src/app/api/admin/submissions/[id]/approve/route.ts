export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getAdminClient, requireAdmin } from "@/lib/admin";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;
  const { adminId } = auth;

  const supabase = getAdminClient();
  const { id } = await params;

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
    .update({ status: "approved", reviewed_at: new Date().toISOString(), moderated_by: adminId })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { data: connection } = await supabase
    .from("connections")
    .select("tasks_completed")
    .eq("id", submission.connection_id)
    .single();

  const newCount = (connection?.tasks_completed ?? 0) + 1;

  await supabase
    .from("connections")
    .update({ tasks_completed: newCount })
    .eq("id", submission.connection_id);

  if (newCount >= 5) {
    await supabase.from("messages").insert({
      connection_id: submission.connection_id,
      sender_id: adminId,
      content: "Messages unlocked!",
    });
  }

  if (newCount >= 8) {
    await supabase
      .from("connections")
      .update({ status: "completed" })
      .eq("id", submission.connection_id);
  }

  await supabase.from("admin_logs").insert({
    admin_id: adminId,
    action: "approve_submission",
    target_type: "submission",
    target_id: id,
    metadata: { day_number: submission.day_number },
  });

  return NextResponse.json(updated);
}
