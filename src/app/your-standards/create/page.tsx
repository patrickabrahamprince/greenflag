"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Shuffle } from "lucide-react";

const DEFAULT_DESCRIPTIONS = [
  "Selfie with today's paper",
  "Text: Why her standard?",
  "Quiz: Read my intention",
  "8k steps before 8pm",
  "Voice: Your daily discipline",
  "No socials 12h. Proof.",
  "Cook a meal. Photo.",
  "Cold shower. Video.",
];

export default function CreateStandard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [bio, setBio] = useState("");
  const [tasks, setTasks] = useState(DEFAULT_DESCRIPTIONS);

  async function handlePublish() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: test } = await supabase
      .from("tests")
      .insert({ host_id: user.id, name: name || "My Standard", difficulty, is_active: true })
      .select()
      .single();

    if (test) {
      await supabase.from("tasks").insert(
        tasks.map((desc, i) => ({ test_id: test.id, day_number: i + 1, description: desc }))
      );
      await supabase.from("profiles").update({ bio }).eq("id", user.id);
      router.push("/your-standards");
    }
  }

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Standard</h1>
        </div>

        {step === 1 && (
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
            <textarea placeholder="Describe your standard" value={bio} onChange={(e) => setBio(e.target.value)}
              className="w-full h-24 px-5 py-4 rounded-[24px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-all" />
            <button onClick={() => setStep(2)} disabled={!name}
              className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all">
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">Define 8 intentions</p>
              <button onClick={() => setTasks((t) => [...t].sort(() => Math.random() - 0.5))}
                className="flex items-center gap-1 text-xs text-accent">
                <Shuffle className="w-3 h-3" strokeWidth={1.5} /> Shuffle
              </button>
            </div>
            {tasks.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-text-muted w-6 text-right tabular-nums">{i + 1}.</span>
                <input value={t} onChange={(e) => { const next = [...tasks]; next[i] = e.target.value; setTasks(next); }}
                  className={`flex-1 h-12 px-4 rounded-[16px] bg-surface border-[0.5px] text-sm text-text placeholder-text-muted focus:outline-none transition-all ${i === 4 ? "border-accent/40" : "border-border focus:border-accent"}`} />
                {i === 4 && <span className="text-[10px] text-accent shrink-0">Messages unlock</span>}
              </div>
            ))}
            <button onClick={handlePublish} disabled={tasks.some((t) => !t)}
              className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all">
              Publish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
