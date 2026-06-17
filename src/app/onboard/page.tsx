"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus } from "lucide-react";

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState("intro");
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  async function handleSubmit() {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) return router.push("/login");

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      role,
      name,
      age: Number(age),
      city,
      bio,
      photos: photos.filter(Boolean),
    });

    if (!error) {
      router.replace(role === "host" ? "/your-standards" : "/discover");
    }
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      {step !== "intro" && (
        <div className="px-4 pt-6">
          <button onClick={() => setStep("intro")} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {step === "intro" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-6">
          <div className="space-y-3">
            <p className="text-[28px] font-display font-bold tracking-[-0.02em]">Private dating.</p>
            <p className="text-lg font-display font-semibold text-accent tracking-[-0.02em]">Actions over algorithms.</p>
            <p className="text-sm text-text-muted">8 intentions. Then you connect.</p>
          </div>
          <button onClick={() => setStep("role")} className="w-full max-w-xs h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px]">
            Get Started
          </button>
        </div>
      )}

      {step === "role" && (
        <div className="flex-1 flex flex-col justify-center px-6 space-y-4">
          <h2 className="text-[22px] font-display font-semibold text-center tracking-[-0.02em]">I am here to...</h2>
          <button onClick={() => { setRole("guest"); setStep("profile"); }} className="w-full p-6 rounded-[24px] bg-surface border-[0.5px] border-border text-left space-y-2 hover:border-accent/40 transition-all">
            <p className="text-lg font-display font-semibold tracking-[-0.02em]">Meet Someone</p>
            <p className="text-sm text-text-muted">Complete intentions to earn a connection</p>
          </button>
          <button onClick={() => { setRole("host"); setStep("profile"); }} className="w-full p-6 rounded-[24px] bg-surface border-[0.5px] border-border text-left space-y-2 hover:border-accent/40 transition-all">
            <p className="text-lg font-display font-semibold tracking-[-0.02em]">Set Your Standard</p>
            <p className="text-sm text-text-muted">Define your standard. Connect those who prove it.</p>
          </button>
        </div>
      )}

      {step === "profile" && (
        <div className="flex-1 px-6 pt-4 pb-10 space-y-5 overflow-y-auto">
          <div className="text-center">
            <h2 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Profile</h2>
            <p className="text-sm text-text-muted mt-1">Details matter.</p>
          </div>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
          <select value={age} onChange={(e) => setAge(e.target.value)} className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text focus:outline-none focus:border-accent transition-all">
            <option value="">Age</option>
            {Array.from({ length: 43 }, (_, i) => i + 18).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
          <div>
            <p className="text-sm text-text-muted mb-3">3 Photos</p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className={`aspect-square rounded-[16px] border-[0.5px] border-dashed flex items-center justify-center transition-all ${photos[i] ? "border-accent bg-accent/5" : "border-border"}`}>
                  {photos[i] ? (
                    <img src={photos[i]} alt="" className="w-full h-full object-cover rounded-[15px]" />
                  ) : (
                    <button onClick={() => { const p = [...photos]; p[i] = `https://i.pravatar.cc/400?img=${12 + i}`; setPhotos(p); }} className="text-text-muted">
                      <Plus className="w-6 h-6" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <textarea placeholder="One line. Make it count." maxLength={120} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full h-24 px-5 py-4 rounded-[24px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-all" />
            <span className="absolute bottom-3 right-4 text-xs text-text-muted tabular-nums">{bio.length}/120</span>
          </div>
          <button onClick={handleSubmit} disabled={!name || !age || !city || bio.length < 2} className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all">
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
