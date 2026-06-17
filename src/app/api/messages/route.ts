import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { connection_id, content } = await request.json();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: connection } = await supabase
    .from("connections")
    .select("tasks_completed")
    .eq("id", connection_id)
    .single();

  if (!connection || connection.tasks_completed < 5) {
    return NextResponse.json({ error: "Messages unlock at 5/8 intentions" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ connection_id, sender_id: user.id, content })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
