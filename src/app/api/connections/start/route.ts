import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateTasksFromTags } from "@/lib/task-bank";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { test_id, host_id } = await request.json();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: connection, error } = await supabase
    .from("connections")
    .insert({ guest_id: user.id, host_id, test_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: host } = await supabase
    .from("profiles")
    .select("about_me_tags, looking_for_tags")
    .eq("id", host_id)
    .single();

  const aboutMeTags = host?.about_me_tags || [];
  const lookingForTags = host?.looking_for_tags || [];
  const generated = generateTasksFromTags(aboutMeTags, lookingForTags, 8);

  const taskInserts = generated.map((task, i) => ({
    connection_id: connection.id,
    test_id,
    day_number: i + 1,
    description: `${task.title}: ${task.instruction} (${task.time_estimate}, ${task.verification_method})`,
  }));

  const { error: taskError } = await supabase.from("tasks").insert(taskInserts);
  if (taskError) {
    return NextResponse.json({ error: taskError.message }, { status: 500 });
  }

  return NextResponse.json({ ...connection, tasks: generated }, { status: 201 });
}
