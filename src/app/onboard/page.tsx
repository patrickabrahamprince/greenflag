"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Plus, Venus, Mars, ShieldCheck, Camera, MapPin } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { uploadPhoto } from "@/lib/storage";

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState("intro");
  const [gender, setGender] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [detectingCity, setDetectingCity] = useState(false);
  const [bio, setBio] = useState("");
  const [tastes, setTastes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [phoneSkipped, setPhoneSkipped] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const cameraInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.phone) setPhoneSkipped(true);
    });
  }, []);

  useEffect(() => {
    if (step !== "profile") return;
    if (city) return;
    setDetectingCity(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&accept-language=en`,
            { headers: { "User-Agent": "Greenflag/1.0" } }
          );
          const data = await res.json();
          const detected =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "";
          if (detected) setCity(detected);
        } catch {
          // fallback to manual input
        }
        setDetectingCity(false);
      },
      () => setDetectingCity(false),
      { timeout: 5000 }
    );
  }, [step, city]);

  function isValidPhone() {
    return phone.replace(/\D/g, "").length === 10;
  }

  function formatPhone() {
    return "+91" + phone.replace(/\D/g, "").slice(0, 10);
  }

  async function submitProfile(photoUrl?: string) {
    setSubmitError("");
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user || authError) return router.push("/login");

    const allPhotos = [...photos];
    if (photoUrl) allPhotos[0] = photoUrl;

    setUploading(true);
    const payload: Record<string, unknown> = {
      id: user.id,
      name,
      age: Number(age),
      city,
      bio,
      photos: allPhotos.filter(Boolean),
    };
    const role = gender === "male" ? "man" : "woman";
    payload.role = role;
    if (phone && isValidPhone()) payload.phone = formatPhone();
    if (instagramUrl) payload.instagram_url = instagramUrl;
    if (role === "woman" && tastes) payload.tastes = tastes;
    const { error } = await supabase.from("profiles").upsert(payload);
    setUploading(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }
    setSubmitted(true);
  }

  async function handleUploadClick() {
    if (!name || !age || !city || bio.length < 2) return;
    cameraInput.current?.click();
  }

  async function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const url = await uploadPhoto(file, "photos", user.id);
    if (url) {
      await submitProfile(url);
    }
    if (cameraInput.current) cameraInput.current.value = "";
  }

  if (submitted) {
    return (
      <div className="min-h-dvh bg-bg flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-[24px] bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-10 h-10 text-accent" strokeWidth={1.5} />
        </div>
        <h1 className="text-[24px] font-display font-bold tracking-[-0.02em]">Under Review</h1>
        <p className="text-sm text-text-muted max-w-xs leading-relaxed">
          Our team will verify your profile and you&apos;ll be live soon.
        </p>
        <div className="space-y-3 w-full max-w-xs pt-4">
          <button onClick={() => router.push("/admin")}
            className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] transition-all">
            Go to Admin
          </button>
          <button onClick={() => router.push("/discover")}
            className="w-full h-14 rounded-[16px] bg-surface border-[0.5px] border-border text-text font-semibold text-[15px] transition-all">
            Browse App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
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
          {phoneSkipped ? (
            <button onClick={() => setStep("gender")} className="w-full max-w-xs h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px]">
              Get Started
            </button>
          ) : (
            <button onClick={() => setStep("phone")} className="w-full max-w-xs h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px]">
              Get Started
            </button>
          )}
        </div>
      )}

      {step === "phone" && (
        <div className="flex-1 flex flex-col justify-center px-6 space-y-4">
          <h2 className="text-[22px] font-display font-semibold text-center tracking-[-0.02em]">Add your number</h2>
          <p className="text-sm text-text-muted text-center -mt-2">For account security. We never share it.</p>
          <div className="flex items-center gap-1">
            <span className="text-sm text-text-muted px-3 py-3.5 bg-surface border-[0.5px] border-border rounded-[16px]">+91</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="99999 99999" maxLength={10}
              className="flex-1 h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all tracking-[2px] text-lg" />
          </div>
          <button onClick={() => setStep("gender")} disabled={!isValidPhone()}
            className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all">
            Continue
          </button>
          <p onClick={() => { setPhoneSkipped(true); setStep("gender"); }}
            className="text-xs text-text-muted text-center cursor-pointer hover:text-accent">
            Skip for now
          </p>
        </div>
      )}

      {step === "gender" && (
        <div className="flex-1 flex flex-col justify-center px-6 space-y-4">
          <h2 className="text-[22px] font-display font-semibold text-center tracking-[-0.02em]">I am here to...</h2>
          <button onClick={() => { setGender("male"); setStep("profile"); }}
            className="w-full p-6 rounded-[24px] bg-surface border-[0.5px] border-border text-left space-y-3 hover:border-accent/40 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border-[0.5px] border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                <Mars className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-display font-semibold tracking-[-0.02em]">Meet a Woman</p>
                <p className="text-sm text-text-muted">Complete intentions to earn a connection</p>
              </div>
            </div>
          </button>
          <button onClick={() => { setGender("female"); setStep("profile"); }}
            className="w-full p-6 rounded-[24px] bg-surface border-[0.5px] border-border text-left space-y-3 hover:border-accent/40 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-pink-500/10 border-[0.5px] border-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/20 transition-all">
                <Venus className="w-6 h-6 text-pink-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-display font-semibold tracking-[-0.02em]">Meet a Man</p>
                <p className="text-sm text-text-muted">Set your standard. He proves it.</p>
              </div>
            </div>
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
          <div className="relative">
            <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)}
              className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
            {detectingCity && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <MapPin className="w-5 h-5 text-accent animate-pulse" strokeWidth={1.5} />
              </div>
            )}
          </div>
          {gender === "female" && (
            <div className="relative">
              <textarea placeholder="What are you looking for? Describe your tastes, interests, and what matters to you." maxLength={300} value={tastes} onChange={(e) => setTastes(e.target.value)} className="w-full h-28 px-5 py-4 rounded-[24px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-all" />
              <span className="absolute bottom-3 right-4 text-xs text-text-muted tabular-nums">{tastes.length}/300</span>
            </div>
          )}
          <input placeholder="Instagram URL (optional)" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)}
            className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
          <div>
            <p className="text-sm text-text-muted mb-3">3 Photos</p>
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
                    <FileUpload onUpload={(url) => { const p = [...photos]; p[i] = url; setPhotos(p); }}
                      className="w-full h-full flex items-center justify-center cursor-pointer">
                      <Plus className="w-6 h-6 text-text-muted" />
                    </FileUpload>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <textarea placeholder="One line. Make it count." maxLength={120} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full h-24 px-5 py-4 rounded-[24px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-all" />
            <span className="absolute bottom-3 right-4 text-xs text-text-muted tabular-nums">{bio.length}/120</span>
          </div>
          {submitError && (
            <p className="text-sm text-red-400 text-center">{submitError}</p>
          )}
          <button onClick={handleUploadClick} disabled={!name || !age || !city || bio.length < 2 || uploading} className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" strokeWidth={1.5} />
            {uploading ? "Saving..." : "Upload"}
          </button>
        </div>
      )}
    </div>
  );
}
