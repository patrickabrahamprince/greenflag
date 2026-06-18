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
    const { testId, taskId, dayNumber, proofUrl, proofType, proofText } = await request.json();
    if (!testId || !taskId || !dayNumber) {
      return NextResponse.json({ error: "Missing required parameters (testId, taskId, dayNumber)" }, { status: 400 });
    }

    // 3. Verify connection exists for this test and guest
    const { data: connection, error: connError } = await supabase
      .from("connections")
      .select("id, current_day")
      .eq("test_id", testId)
      .eq("guest_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (connError || !connection) {
      return NextResponse.json({ error: "No active connection found for this standard" }, { status: 404 });
    }

    // 4. Verify guest's turn: connections.current_day === dayNumber
    if (connection.current_day !== dayNumber) {
      return NextResponse.json({ error: "Not your turn" }, { status: 403 });
    }

    // 5. Check if submission already exists for this connection_id + day_number
    const { data: existingSub, error: subQueryError } = await supabase
      .from("submissions")
      .select("id, status")
      .eq("connection_id", connection.id)
      .eq("day_number", dayNumber)
      .maybeSingle();

    if (existingSub) {
      if (existingSub.status === "rejected") {
        // Update the rejected submission to pending with new proof
        const { data: updatedSub, error: updateErr } = await supabase
          .from('submissions')
          .update({
            proof_url: proofUrl || null,
            proof_text: proofText || null,
            proof_type: proofType,
            status: 'pending',
            submitted_at: new Date().toISOString(),
          })
          .eq('id', existingSub.id)
          .select()
          .single();
        if (updateErr) {
          return NextResponse.json({ error: updateErr.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, submissionId: updatedSub.id });
      } else {
        return NextResponse.json({ error: "Already submitted" }, { status: 409 });
      }
    }

    // 6. Insert new submission with pending status and timestamp
    const { data: submission, error: insertErr } = await supabase
      .from('submissions')
      .insert({
        connection_id: connection.id,
        task_id: taskId,
        day_number: dayNumber,
        proof_url: proofUrl || null,
        proof_text: proofText || null,
        proof_type: proofType,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Do NOT modify the connections table here.

    // 8. Return success with the new submission ID
    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit task" }, { status: 500 });
  }
}
