"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus } from "lucide-react";
import type { Profile } from "@/lib/types";
import FileUpload from "@/components/FileUpload";

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [tastes, setTastes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login");
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
        if (data) {
          setProfile(data);
          setName(data.name);
          setAge(String(data.age));
          setCity(data.city);
          setBio(data.bio);
          setPhotos(data.photos || []);
          if (data.tastes) setTastes(data.tastes);
        }
      });
    });
  }, [router]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    await supabase.from("profiles").update({
      name, age: Number(age), city, bio, tastes, photos: photos.filter(Boolean),
    }).eq("id", profile.id);
    setSaving(false);
    router.push("/profile");
  }

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Edit Profile</h1>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-sm text-text-muted mb-3">Photos</p>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className={`aspect-square rounded-[16px] border-[0.5px] border-dashed flex items-center justify-center transition-all overflow-hidden ${photos[i] ? "border-accent bg-accent/5" : "border-border"}`}>
                  {photos[i] ? (
                    <div className="relative w-full h-full">
                      <img src={photos[i]} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => { const p = [...photos]; p[i] = ""; setPhotos(p); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-bg/80 flex items-center justify-center">
                        <Plus className="w-3 h-3 rotate-45 text-text-muted" strokeWidth={1.5} />
                      </button>
                    </div>
                  ) : (
                    <FileUpload
                      onUpload={(url) => { const p = [...photos]; p[i] = url; setPhotos(p); }}
                      className="w-full h-full flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-6 h-6 text-text-muted" />
                    </FileUpload>
                  )}
                </div>
              ))}
            </div>
          </div>

          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
          <select value={age} onChange={(e) => setAge(e.target.value)}
            className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text focus:outline-none focus:border-accent transition-all">
            <option value="">Age</option>
            {Array.from({ length: 43 }, (_, i) => i + 18).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)}
            className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
          {profile?.role === "woman" && (
            <div className="relative">
              <textarea placeholder="What are you looking for?" maxLength={300} value={tastes} onChange={(e) => setTastes(e.target.value)}
                className="w-full h-28 px-5 py-4 rounded-[24px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-all" />
              <span className="absolute bottom-3 right-4 text-xs text-text-muted tabular-nums">{tastes.length}/300</span>
            </div>
          )}
          <div className="relative">
            <textarea placeholder="One line. Make it count." maxLength={120} value={bio} onChange={(e) => setBio(e.target.value)}
              className="w-full h-24 px-5 py-4 rounded-[24px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-all" />
            <span className="absolute bottom-3 right-4 text-xs text-text-muted tabular-nums">{bio.length}/120</span>
          </div>

          <button onClick={handleSave} disabled={!name || !age || !city || bio.length < 2 || saving}
            className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
