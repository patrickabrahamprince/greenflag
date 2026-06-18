import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

const bodySchema = z.object({
  title: z.string().min(1),
  intentions: z.array(z.string()).min(1).max(3),
  tasks: z.array(z.any()).length(8),
  language: z.enum(["en", "hi"]).default("en")
});

const BANNED_WORDS = [
  'instagram', 'snapchat', 'phone', 'whatsapp', 'telegram', 
  'onlyfans', 'money', 'cash', 'pay', 'sex', 'nude', 
  'nsfw', 'cashapp', 'venmo', 'kick', 'facebook'
];

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

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message || "Invalid configuration" }, { status: 400 });
    }

    const { title, intentions, tasks, language } = parsed.data;

    let formattedTasks: string[] = [];
    try {
      formattedTasks = tasks.map((task: any) => {
        if (typeof task === "string") {
          const lower = task.toLowerCase();
          if (BANNED_WORDS.some(w => lower.includes(w))) {
            throw new Error(`Content contains banned words.`);
          }
          return task;
        } else {
          const content = `${task.title || ""} ${task.description || ""}`.toLowerCase();
          if (BANNED_WORDS.some(w => content.includes(w))) {
            throw new Error(`Content contains banned words.`);
          }
          const time = task.time_estimate || "5 min";
          return `${task.title}: ${task.description} (${time}, ${task.task_type || "photo"})`;
        }
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Banned words detected" }, { status: 400 });
    }

    const { data: test, error: testError } = await supabase
      .from("tests")
      .upsert({
        host_id: user.id,
        name: title,
        title,
        intentions,
        tasks: formattedTasks,
        language,
        is_active: true,
      }, { onConflict: "host_id" })
      .select()
      .single();

    if (testError || !test) {
      return NextResponse.json({ error: testError?.message || "Failed to save standard" }, { status: 500 });
    }

    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("test_id", test.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    const tasksToInsert = tasks.map((task: any, idx: number) => {
      const desc = typeof task === "string" ? task : `${task.title}: ${task.description}`;
      return {
        test_id: test.id,
        day_number: idx + 1,
        description: desc
      };
    });

    const { error: insertError } = await supabase
      .from("tasks")
      .insert(tasksToInsert);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, test });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
