"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import type { Test } from "@/lib/types";
import { INTENTION_CONFIG, IntentionId } from "@/lib/task-templates";
import { generateTasksFromIntentions } from "@/lib/generate-tasks";
import { IntentionsGrid } from "@/components/IntentionsGrid";
import { motion } from "framer-motion";

export default function EditStandard() {
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [intentions, setIntentions] = useState<IntentionId[]>([]);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [isPaused, setIsPaused] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login");
      supabase.from("tests").select("*").eq("host_id", user.id).maybeSingle().then(({ data: t }) => {
        if (t) {
          setTest(t);
          setName(t.name || t.title || "");
          setDifficulty(t.difficulty || "medium");
          setIsPaused(t.is_paused);
          setIntentions((t.intentions || []) as IntentionId[]);
          setLang((t.language || "en") as "en" | "hi");
        }
        setLoading(false);
      });
    });
  }, [router]);

  const toggleIntention = (id: IntentionId) => {
    if (intentions.includes(id)) {
      setIntentions(intentions.filter((i) => i !== id));
    } else if (intentions.length < 3) {
      setIntentions([...intentions, id]);
    }
  };

  async function handleSave() {
    if (!test || intentions.length === 0 || !name.trim()) return;
    setSaving(true);
    try {
      // 1. Generate new tasks from selected intentions
      const generated = generateTasksFromIntentions(intentions);

      // 2. Update test details in DB
      const { error: testError } = await supabase
        .from("tests")
        .update({
          name,
          title: name,
          difficulty,
          is_paused: isPaused,
          intentions,
          tasks: generated,
          language: lang
        })
        .eq("id", test.id);

      if (testError) {
        alert(testError.message);
        setSaving(false);
        return;
      }

      // 3. Delete existing tasks for this test
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("test_id", test.id);

      if (deleteError) {
        alert(deleteError.message);
        setSaving(false);
        return;
      }

      // 4. Insert new tasks
      const taskInserts = generated.map((t, idx) => ({
        test_id: test.id,
        day_number: idx + 1,
        description: t
      }));

      const { error: tasksError } = await supabase
        .from("tasks")
        .insert(taskInserts);

      if (tasksError) {
        alert(tasksError.message);
        setSaving(false);
        return;
      }

      router.push("/your-standards");
    } catch (e: any) {
      alert(e.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-[0.5px] border-accent/30 animate-pulse" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-dvh bg-bg flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-text-muted mb-4">No active standard found.</p>
        <button onClick={() => router.push("/your-standards/create")} className="px-6 h-12 rounded-xl bg-accent text-bg font-semibold">
          Create Standard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24 font-sans">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
            </button>
            <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">
              {lang === "hi" ? "स्टैंडर्ड संपादित करें" : "Edit Standard"}
            </h1>
          </div>
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="px-3 py-1.5 rounded-full bg-white/5 border border-[#262626] text-xs font-semibold hover:bg-white/10 transition-all cursor-pointer text-accent"
          >
            {lang === "en" ? "हिन्दी" : "English"}
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-muted">
              {lang === "hi" ? "स्टैंडर्ड का नाम" : "Standard name"}
            </label>
            <input
              placeholder={lang === "hi" ? "Standard ka Title" : "Standard Title"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all"
            />
          </div>

          <div>
            <p className="text-sm text-text-muted mb-3">
              {lang === "hi" ? "कठिनाई (Caliber)" : "Caliber"}
            </p>
            <div className="flex gap-2">
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 h-12 rounded-[16px] text-xs font-medium border-[0.5px] transition-all cursor-pointer ${
                    difficulty === d ? "bg-accent text-bg border-accent font-semibold" : "bg-surface text-text-muted border-border"
                  }`}
                >
                  {d === "easy" ? (lang === "hi" ? "आसान" : "Easy") : d === "medium" ? (lang === "hi" ? "मध्यम" : "Medium") : (lang === "hi" ? "कठिन" : "Hard")}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <IntentionsGrid
              selected={intentions}
              onToggle={toggleIntention}
              max={3}
              min={1}
              lang={lang}
              title={lang === "hi" ? "इरादे (Intentions) चुनें" : "Select Intentions"}
              subtitle={lang === "hi" ? "1-3 इरादे चुनें।" : "Pick 1-3 intentions. Men with matching interests will see you first."}
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-[16px] bg-surface border-[0.5px] border-border">
            <button onClick={() => setIsPaused(!isPaused)}
              className={`w-12 h-7 rounded-full transition-all ${isPaused ? "bg-accent" : "bg-border"}`}>
              <div className={`w-5 h-5 rounded-full bg-bg transition-all ${isPaused ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className="text-sm text-text-muted">
              {lang === "hi" ? "स्टैंडर्ड रोकें (Pause)" : "Pause standard"}
            </span>
          </div>

          <button onClick={handleSave} disabled={saving || !name || intentions.length === 0}
            className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all cursor-pointer">
            {saving ? (lang === "hi" ? "सहेज रहा है..." : "Saving...") : (lang === "hi" ? "सहेजें (Save)" : "Save Changes")}
          </button>

          <div className="flex gap-3">
            <button onClick={handleArchive}
              className="flex-1 h-12 rounded-[16px] bg-surface-elevated border-[0.5px] border-border text-text-muted text-sm font-medium transition-all hover:border-accent/40 cursor-pointer">
              {lang === "hi" ? "आर्काइव करें" : "Archive"}
            </button>
            <button onClick={handleDelete}
              className="flex-1 h-12 rounded-[16px] bg-surface-elevated border-[0.5px] border-border text-danger text-sm font-medium transition-all hover:border-danger/40 cursor-pointer">
              {lang === "hi" ? "हटाएं" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
