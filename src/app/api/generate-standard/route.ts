import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  try {
    const { intentions } = await req.json();
    if (!intentions || !Array.isArray(intentions) || intentions.length === 0) {
      return NextResponse.json({ error: "Intentions array is required" }, { status: 400 });
    }

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

    // Query task_templates WHERE intention = ANY(input)
    const { data: templates, error } = await supabase
      .from("task_templates")
      .select("*")
      .in("intention", intentions);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const tasks: any[] = [];
    const neededDays = [1, 2, 3, 4, 5, 6, 7, 8];

    // Interleave by day_number if 2+ intentions
    for (const d of neededDays) {
      const idx = (d - 1) % intentions.length;
      const targetIntention = intentions[idx];
      const template = templates?.find(t => t.intention.toLowerCase() === targetIntention.toLowerCase() && t.day_number === d);
      if (template) {
        tasks.push({
          day_number: d,
          task_type: template.task_type,
          title: template.title,
          description: template.description,
          verification_hint: template.verification_hint
        });
      }
    }

    // If < 8 found, call fallback to fill gaps
    if (tasks.length < 8) {
      const missingDays = neededDays.filter(d => !tasks.some(t => t.day_number === d));
      for (const d of missingDays) {
        const fallbackTask = getFallbackTask(d, intentions[0] || "Fitness");
        tasks.push({
          day_number: d,
          task_type: fallbackTask.task_type,
          title: fallbackTask.title,
          description: fallbackTask.description,
          verification_hint: fallbackTask.verification_hint
        });
      }
    }

    // Sort by day_number
    tasks.sort((a, b) => a.day_number - b.day_number);

    return NextResponse.json({ tasks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

function getFallbackTask(day: number, category: string) {
  const fallbacks: Record<number, { task_type: string; title: string; description: string; verification_hint: string }> = {
    1: { task_type: "photo", title: "Day 1 Intro", description: "Photo of your daily workspace or morning view", verification_hint: "Show your desk or window view" },
    2: { task_type: "voice", title: "Day 2 Voice note", description: "Voice note introducing yourself and your vibe today", verification_hint: "Speak for at least 10 seconds" },
    3: { task_type: "photo", title: "Day 3 Focus", description: "Photo of your healthy snack or favorite drink today", verification_hint: "Show food or beverage" },
    4: { task_type: "photo", title: "Day 4 Gear check", description: "Photo of your headphones, sneakers, or favorite book", verification_hint: "Show sneakers, headphones, or book" },
    5: { task_type: "voice", title: "Day 5 Voice reflection", description: "Voice note summarizing one thing you are grateful for today", verification_hint: "Speak about gratitude" },
    6: { task_type: "video", title: "Day 6 Active check", description: "15-second video showing your workspace setup or environment today", verification_hint: "Short panning video of environment" },
    7: { task_type: "location", title: "Day 7 Favorite spot", description: "Share a map pin of your favorite local park or cafe", verification_hint: "Drop a map pin of local location" },
    8: { task_type: "photo", title: "Day 8 Selfie", description: "Selfie holding a card with today's date stamp", verification_hint: "Selfie with date stamp card" }
  };

  return fallbacks[day] || fallbacks[1];
}
