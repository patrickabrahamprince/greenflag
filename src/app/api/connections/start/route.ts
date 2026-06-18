import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { generateTasksFromTags } from "@/lib/generate-tasks";

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

  // 1. Fetch test details (intentions, tasks, and title)
  const { data: test } = await supabase
    .from("tests")
    .select("intentions, tasks, title")
    .eq("id", test_id)
    .maybeSingle();

  let tasksToUse: string[] = test?.tasks || [];
  
  // 2. Fallback to generating tasks if no pre-generated tasks exist (legacy support)
  if (!tasksToUse || tasksToUse.length === 0) {
    const { data: host } = await supabase
      .from("profiles")
      .select("about_me_tags, looking_for_tags")
      .eq("id", host_id)
      .maybeSingle();

    const aboutMeTags = host?.about_me_tags || [];
    const lookingForTags = host?.looking_for_tags || [];
    const generated = generateTasksFromTags(aboutMeTags, lookingForTags, 8);
    tasksToUse = generated.map(
      (t) => `${t.title}: ${t.instruction} (${t.time_estimate}, ${t.verification_method})`
    );
  }

  // 3. Insert connection with test_snapshot locking the tasks/intentions at start time
  const { data: connection, error } = await supabase
    .from("connections")
    .insert({
      guest_id: user.id,
      host_id,
      test_id,
      test_snapshot: { intentions: test?.intentions || [], tasks: tasksToUse, title: test?.title || "" }
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 4. Insert tasks into tasks table for this connection
  const taskInserts = tasksToUse.map((taskStr, i) => ({
    connection_id: connection.id,
    test_id,
    day_number: i + 1,
    description: taskStr,
  }));

  const { error: taskError } = await supabase.from("tasks").insert(taskInserts);
  if (taskError) {
    return NextResponse.json({ error: taskError.message }, { status: 500 });
  }

  return NextResponse.json({ ...connection, tasks: tasksToUse }, { status: 201 });
}
