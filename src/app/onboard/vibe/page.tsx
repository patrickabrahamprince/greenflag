"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ABOUT_ME_TAGS, LOOKING_FOR_TAGS } from "@/lib/constants";
import BubbleSelector from "@/components/BubbleSelector";
import { useToast } from "@/components/Toast";

export default function VibePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [aboutMe, setAboutMe] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      supabase.from("profiles").select("role, about_me_tags").eq("id", user.id).single().then(({ data }) => {
        if (!data) { router.replace("/onboard"); return; }
        if (data.role !== "woman") { router.replace("/discover"); return; }
        if (data.about_me_tags && data.about_me_tags.length > 0) { router.replace("/your-standards/create"); return; }
        setLoading(false);
      });
    });
  }, [router]);

  async function handleContinue() {
    if (aboutMe.length === 0 || lookingFor.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/onboard/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aboutMe, lookingFor }),
      });
      const json = await res.json();
      if (!res.ok) { toast("error", json.error || "Failed to save"); setSaving(false); return; }
      router.push("/your-standards/create");
    } catch {
      toast("error", "Something went wrong");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0A0A0A] animate-fade-in">
      <div className="max-w-lg mx-auto px-6 pt-8 pb-[120px] space-y-8">
        <div className="text-center">
          <h1 className="font-playfair text-3xl text-[#F5F5F5] tracking-[-0.02em]">Her Vibe</h1>
          <p className="text-sm text-[#F5F5F5]/50 mt-2">Help him get to know you.</p>
        </div>

        <BubbleSelector
          title="Pick up to 5 that describe you"
          tags={ABOUT_ME_TAGS}
          selected={aboutMe}
          max={5}
          onChange={setAboutMe}
        />

        <BubbleSelector
          title="What You Want In Him"
          tags={LOOKING_FOR_TAGS}
          selected={lookingFor}
          max={5}
          onChange={setLookingFor}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#262626] px-6 py-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleContinue}
            disabled={aboutMe.length === 0 || lookingFor.length === 0 || saving}
            className="w-full h-14 rounded-[16px] bg-[#D4AF37] text-[#0A0A0A] font-semibold text-[15px] disabled:opacity-30 transition-all"
          >
            {saving ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
