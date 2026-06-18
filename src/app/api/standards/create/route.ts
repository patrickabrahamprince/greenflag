import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { parseTaskDescription } from "@/lib/task-utils";

const bodySchema = z.object({
  title: z.string().min(1),
  intentions: z.array(z.string()).min(1).max(3),
  tasks: z.array(z.string()).length(8),
  language: z.enum(["en", "hi"]).default("en")
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      env.supabaseUrl,
      env.supabaseAnonKey,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    // 1. Get user. Verify role = 'woman'.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "woman") {
      return NextResponse.json({ error: "Forbidden. Women only." }, { status: 403 });
    }

    // 2. Validate body: title, intentions, and 8 generated task strings.
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message || "Invalid body configuration" }, { status: 400 });
    }

    const { title, intentions, tasks, language } = parsed.data;

    // 3. Insert into tests table: { host_id: user.id, name: title, title, intentions, tasks, language, is_active: true }
    const { data: test, error: testError } = await supabase
      .from("tests")
      .upsert({
        host_id: user.id,
        name: title,
        title,
        intentions,
        tasks,
        language,
        is_active: true,
      }, { onConflict: "host_id" })
      .select()
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: testError?.message || "Failed to save standard" }, { status: 500 });
    }

    // Delete existing tasks for this test to replace them cleanly
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("test_id", test.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 4. Insert 8 rows into tasks table with test_id
    const taskInserts = tasks.map((t, idx) => ({
      test_id: test.id,
      day_number: idx + 1,
      description: t, // already formatted into "Title: Instruction (Time, Method)"
    }));

    const { error: tasksError } = await supabase
      .from("tasks")
      .insert(taskInserts);

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, testId: test.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
