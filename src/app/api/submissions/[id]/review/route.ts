import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { id } = await params;
  const { status } = await request.json();

  if (!["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data: submission } = await supabase
    .from("submissions")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (status === "approved" && submission) {
    await supabase
      .from("connections")
      .update({ tasks_completed: submission.day_number })
      .eq("id", submission.connection_id);

    if (submission.day_number >= 8) {
      await supabase
        .from("connections")
        .update({ status: "completed" })
        .eq("id", submission.connection_id);
    }
  }

  return NextResponse.json(submission);
}
