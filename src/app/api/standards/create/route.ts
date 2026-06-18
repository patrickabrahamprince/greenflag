import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

const taskSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  time_estimate: z.enum(["2 min", "5 min", "15 min"]),
  verification_method: z.enum(["photo", "voice", "video", "location"]),
  day_number: z.number().int().min(1).max(8)
});

const bodySchema = z.object({
  tasks: z.array(taskSchema).length(8)
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

    // 2. Validate body: Zod array of 8 tasks.
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tasks body configuration" }, { status: 400 });
    }

    const { tasks } = parsed.data;

    // 3. Insert into tests table: { creator_id/host_id: user.id, name: "My Standard", status/is_active: true }
    const { data: test, error: testError } = await supabase
      .from("tests")
      .upsert({
        host_id: user.id,
        name: "My Standard",
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

    // 4. Insert 8 rows into tasks table with test_id, all fields formatted into description.
    const taskInserts = tasks.map((t) => ({
      test_id: test.id,
      day_number: t.day_number,
      description: `${t.title}: ${t.instruction} (${t.time_estimate}, ${t.verification_method})`,
    }));

    const { error: tasksError } = await supabase
      .from("tasks")
      .insert(taskInserts);

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 });
    }

    // 5. Return { success: true, testId }
    return NextResponse.json({ success: true, testId: test.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
