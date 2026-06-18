"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Shuffle } from "lucide-react";
import type { Test, Task } from "@/lib/types";

export default function EditStandard() {
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [tasks, setTasks] = useState<string[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login");
      supabase.from("tests").select("*").eq("host_id", user.id).maybeSingle().then(({ data: t }) => {
        if (t) {
          setTest(t);
          setName(t.name);
          setDifficulty(t.difficulty);
          setIsPaused(t.is_paused);
          supabase.from("tasks").select("*").eq("test_id", t.id).order("day_number")
            .then(({ data: ts }) => setTasks((ts || []).map((task: Task) => task.description)));
        }
      });
    });
  }, [router]);

  async function handleSave() {
    if (!test) return;
    setSaving(true);
    await supabase.from("tests").update({ name, difficulty, is_paused: isPaused }).eq("id", test.id);
    for (let i = 0; i < tasks.length; i++) {
      await supabase.from("tasks").update({ description: tasks[i] }).eq("test_id", test.id).eq("day_number", i + 1);
    }
    setSaving(false);
    router.push("/your-standards");
  }

  async function handleArchive() {
    if (!test) return;
    await supabase.from("tests").update({ is_active: false }).eq("id", test.id);
    router.push("/your-standards");
  }

  async function handleDelete() {
    if (!test || !confirm("Delete this standard permanently?")) return;
    await supabase.from("tests").delete().eq("id", test.id);
    router.push("/your-standards");
  }

  if (!test) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[0.5px] border-accent/30 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Edit Standard</h1>
        </div>

        <div className="space-y-5">
          <input placeholder="Standard name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
          <div>
            <p className="text-sm text-text-muted mb-3">Caliber</p>
            <div className="flex gap-2">
              {["easy", "medium", "hard"].map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 h-12 rounded-[16px] text-xs font-medium border-[0.5px] transition-all ${
                    difficulty === d ? "bg-accent text-bg border-accent" : "bg-surface text-text-muted border-border"
                  }`}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">8 Intentions</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setTasks(Array(8).fill(""))}
                className="text-xs text-text-muted hover:text-accent transition-colors font-medium">
                Clear All
              </button>
              <button onClick={() => setTasks((t) => [...t].sort(() => Math.random() - 0.5))}
                className="flex items-center gap-1 text-xs text-accent">
                <Shuffle className="w-3 h-3" strokeWidth={1.5} /> Shuffle
              </button>
            </div>
          </div>
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-text-muted w-6 text-right tabular-nums">{i + 1}.</span>
              <input value={t} onChange={(e) => { const next = [...tasks]; next[i] = e.target.value; setTasks(next); }}
                className={`flex-1 h-12 px-4 rounded-[16px] bg-surface border-[0.5px] text-sm text-text placeholder-text-muted focus:outline-none transition-all ${i === 4 ? "border-accent/40" : "border-border focus:border-accent"}`} />
              {i === 4 && <span className="text-[10px] text-accent shrink-0">Messages unlock</span>}
            </div>
          ))}

          <div className="flex items-center gap-3 px-4 py-3 rounded-[16px] bg-surface border-[0.5px] border-border">
            <button onClick={() => setIsPaused(!isPaused)}
              className={`w-12 h-7 rounded-full transition-all ${isPaused ? "bg-accent" : "bg-border"}`}>
              <div className={`w-5 h-5 rounded-full bg-bg transition-all ${isPaused ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-text-muted">Pause standard</span>
          </div>

          <button onClick={handleSave} disabled={saving || !name}
            className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all">
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <div className="flex gap-3">
            <button onClick={handleArchive}
              className="flex-1 h-12 rounded-[16px] bg-surface-elevated border-[0.5px] border-border text-text-muted text-sm font-medium transition-all hover:border-accent/40">
              Archive
            </button>
            <button onClick={handleDelete}
              className="flex-1 h-12 rounded-[16px] bg-surface-elevated border-[0.5px] border-border text-danger text-sm font-medium transition-all hover:border-danger/40">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
