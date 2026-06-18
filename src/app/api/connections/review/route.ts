import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body parameters
    const { submissionId, action, reason } = await request.json();
    if (!submissionId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters (submissionId and action: approve | reject required)" }, { status: 400 });
    }
    if (action === "reject" && (!reason || typeof reason !== "string")) {
      return NextResponse.json({ error: "Rejection reason required when action is reject" }, { status: 400 });
    }

    // 3. Fetch submission
    const { data: submission, error: subError } = await supabase
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .maybeSingle();

    if (subError || !submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // 4. Fetch connection
    const { data: connection, error: connError } = await supabase
      .from("connections")
      .select("*")
      .eq("id", submission.connection_id)
      .maybeSingle();

    if (connError || !connection) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    // 5. Verify host authority
    if (connection.host_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized to review this connection" }, { status: 403 });
    }

    const reviewedAt = new Date().toISOString();

    if (action === "approve") {
      // Approve submission
      const { error: subUpdateErr } = await supabase
        .from("submissions")
        .update({ status: "approved", reviewed_at: reviewedAt })
        .eq("id", submissionId);
      if (subUpdateErr) {
        return NextResponse.json({ error: subUpdateErr.message }, { status: 500 });
      }

      // Advance connection progress
      const nextDay = submission.day_number + 1;
      const isComplete = submission.day_number >= 8;
      const connectionUpdatePayload: any = {
        tasks_completed: submission.day_number,
        current_day: isComplete ? 8 : nextDay,
      };
      if (isComplete) {
        connectionUpdatePayload.status = "completed";
      }
      const { data: updatedConn, error: connUpdateErr } = await supabase
        .from("connections")
        .update(connectionUpdatePayload)
        .eq("id", connection.id)
        .select("current_day,tasks_completed,messages_unlocked")
        .single();
      if (connUpdateErr) {
        return NextResponse.json({ error: connUpdateErr.message }, { status: 500 });
      }
      // Unlock messages after Day 5 approved
      if (updatedConn?.current_day === 6 && updatedConn?.tasks_completed === 5 && !updatedConn?.messages_unlocked) {
        const now = new Date().toISOString();
        const { error: unlockErr } = await supabase
          .from("connections")
          .update({ messages_unlocked: true, messages_unlocked_at: now })
          .eq("id", connection.id);
        if (unlockErr) {
          return NextResponse.json({ error: unlockErr.message }, { status: 500 });
        }
        // Notify both users
        await supabase.from("notifications").insert([
          { user_id: connection.guest_id, type: "chat_unlocked", connection_id: connection.id },
          { user_id: connection.host_id, type: "chat_unlocked", connection_id: connection.id },
        ]);
      }

    } else {
      // Reject submission
      const { error: subUpdateErr } = await supabase
        .from("submissions")
        .update({ status: "rejected", reviewed_at: reviewedAt, rejection_reason: reason })
        .eq("id", submissionId);
      if (subUpdateErr) {
        return NextResponse.json({ error: subUpdateErr.message }, { status: 500 });
      }

      // Notify the man
      await supabase.from("notifications").insert({
        user_id: connection.guest_id,
        type: "info",
        title: "Submission rejected",
        body: `She asked for a retake on Day ${submission.day_number}. Reason: ${reason}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit review" }, { status: 500 });
  }
}
