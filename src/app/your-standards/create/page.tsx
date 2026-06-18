"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Shuffle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateTasksFromTags } from "@/lib/generate-tasks";
import type { TaskTemplate } from "@/lib/task-templates";

export default function CreateStandard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [aboutMeTags, setAboutMeTags] = useState<string[]>([]);
  const [lookingForTags, setLookingForTags] = useState<string[]>([]);
  const [tasks, setTasks] = useState<(TaskTemplate & { day_number?: number })[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);
  const [shuffleError, setShuffleError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login");

      supabase
        .from("profiles")
        .select("role, about_me_tags, looking_for_tags")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (!data || data.role !== "woman") {
            // Role gated: profiles.role must be 'woman'
            router.replace("/discover");
            return;
          }

          const am = data.about_me_tags || [];
          const lf = data.looking_for_tags || [];
          setAboutMeTags(am);
          setLookingForTags(lf);

          if (am.length > 0 || lf.length > 0) {
            const generated = generateTasksFromTags(am, lf);
            setTasks(generated);
          }
          setLoading(false);
        });
    });
  }, [router]);

  const handleShuffle = () => {
    if (aboutMeTags.length === 0 && lookingForTags.length === 0) return;
    const generated = generateTasksFromTags(aboutMeTags, lookingForTags);
    setTasks(generated);
    if (generated.length < 8) {
      setShuffleError('Need more tags for 8 unique tasks. Go back to Her Vibe and pick 3 more "Looking For" tags.');
    } else {
      setShuffleError(null);
    }
    setShuffleKey((prev) => prev + 1);
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], title: newTitle };
    setTasks(updated);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch("/api/standards/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      if (res.ok) {
        router.push("/your-standards");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to publish standard");
        setPublishing(false);
      }
    } catch {
      alert("Something went wrong");
      setPublishing(false);
    }
  };

  // If user has no tags, show empty state: "Complete Her Vibe first" button → /onboard/vibe.
  if (!loading && aboutMeTags.length === 0 && lookingForTags.length === 0) {
    return (
      <div className="min-h-dvh bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center text-[#F5F5F5] font-sans">
        <h1 className="font-playfair text-2xl font-bold mb-4">No Tags Selected</h1>
        <p className="text-sm text-[#F5F5F5]/60 mb-8 max-w-xs">
          Please complete your tags first so we can customize your standard tasks.
        </p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/onboard/vibe")}
          className="h-14 px-8 rounded-xl bg-[#D4AF37] text-black font-semibold hover:bg-[#D4AF37]/90 transition-all cursor-pointer"
        >
          Complete Her Vibe first
        </motion.button>
      </div>
    );
  }

  const isPublishDisabled = tasks.some((t) => !t.title.trim()) || publishing || !!shuffleError || tasks.length < 8;

  return (
    <div className="min-h-dvh bg-[#0A0A0A] text-[#F5F5F5] p-6 pb-32 font-sans animate-fade-in">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-playfair text-2xl font-bold tracking-tight">Define 8 intentions</h1>
          {!loading && (
            <div className="flex items-center gap-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setTasks(tasks.map((t) => ({ ...t, title: "" })))}
                className="text-sm text-[#F5F5F5]/60 font-semibold hover:text-[#F5F5F5] transition-colors cursor-pointer"
              >
                Clear All
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleShuffle}
                className="text-sm text-[#D4AF37] font-semibold hover:text-[#D4AF37]/80 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Shuffle className="w-3.5 h-3.5" /> Shuffle
              </motion.button>
            </div>
          )}
        </div>

        {shuffleError && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-200 p-4 rounded-xl text-sm">
            {shuffleError}
          </div>
        )}

        {loading ? (
          // Loading state: Show 8 skeleton rows while generateTasksFromTags runs
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[72px] bg-white/5 border border-[#262626] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={shuffleKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {tasks.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white/5 border border-[#262626] rounded-xl p-4 transition-all focus-within:border-[#D4AF37]/50 animate-fade-in"
                >
                  <span className="text-[#D4AF37] font-semibold text-sm shrink-0">Day {task.day_number || i + 1}</span>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => handleTitleChange(i, e.target.value)}
                    className={`flex-1 bg-transparent border-none text-[#F5F5F5] placeholder-[#F5F5F5]/30 focus:outline-none focus:ring-0 text-sm font-medium ${!task.title.trim() ? 'border border-red-500 rounded p-1' : ''}`}
                    placeholder="Describe intention..."
                  />
                  {task.title && (
                    <button
                      type="button"
                      onClick={() => handleTitleChange(i, "")}
                      className="text-[#F5F5F5]/40 hover:text-[#F5F5F5] transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {task.day_number === 5 && (
                    <span className="text-[#D4AF37] text-xs font-semibold shrink-0 uppercase tracking-wide">
                      Messages unlock
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#262626] px-6 py-6">
          <div className="max-w-lg mx-auto">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handlePublish}
              disabled={isPublishDisabled || loading}
              className="w-full bg-[#D4AF37] text-black py-4 rounded-xl font-semibold hover:bg-[#D4AF37]/90 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
            >
              {publishing ? "Publishing..." : "Publish"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
