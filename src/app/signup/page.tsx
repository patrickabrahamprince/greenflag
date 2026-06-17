"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";

function validateEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const [debugOtp, setDebugOtp] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const emailValid = validateEmail(email);
  const passwordStrength = useMemo(() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 10) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
  const strengthColors = ["", "bg-danger", "bg-orange-500", "bg-yellow-500", "bg-accent", "bg-green-400"];

  function isValidPhone() {
    return phone.replace(/\D/g, "").length === 10;
  }

  function formatPhone() {
    return "+91" + phone.replace(/\D/g, "").slice(0, 10);
  }

  async function handleSendOtp() {
    setError("");
    setLoading(true);
    try {
      const fullPhone = formatPhone();
      const res = await fetch("/api/auth/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: fullPhone }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.detail || json.error || "Failed to send code"); setLoading(false); return; }
      setOtpSent(true);
      setCooldown(30);
      if (json.otp) setDebugOtp(json.otp);
      toast("success", "Code sent!");
    } catch (e) {
      setError("Something went wrong. Check your connection and try again.");
    }
    setLoading(false);
  }

  async function handleVerifyOtp() {
    setError("");
    setLoading(true);
    try {
      const token = otp.join("");
      if (token.length !== 6) { setError("Enter the full 6-digit code"); setLoading(false); return; }
      const fullPhone = formatPhone();
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, otp: token }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Invalid code"); setLoading(false); return; }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: json.email, password: json.password });
      if (signInError) { setError(signInError.message); setLoading(false); return; }
      toast("success", "Account created! Complete your profile.");
      router.push("/onboard");
    } catch (e) {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  }

  async function handleEmailSignup() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    setLoading(false);
    if (json.error) {
      setError(json.error);
    } else {
      router.push("/login?confirmed=true");
      toast("success", "Account created! Sign in to continue.");
    }
  }

  const canSubmit = emailValid && password.length >= 6 && !loading;

  function otpChange(i: number, val: string) {
    if (val && !/^\d$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function otpKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    if (e.key === "Enter") handleVerifyOtp();
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center px-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-[20px] bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-display text-accent font-bold">G</span>
        </div>
        <h1 className="text-[28px] font-display font-bold tracking-[-0.02em]">Create account</h1>
        <p className="text-sm text-text-muted">Join the ones who show up.</p>
      </div>

      <div className="flex gap-2 w-full max-w-xs">
        {["phone", "email"].map((t) => (
          <button key={t} onClick={() => { setTab(t as typeof tab); setError(""); setOtpSent(false); setOtp(["","","","","",""]); }}
            className={`flex-1 py-3 rounded-[16px] text-xs font-medium border-[0.5px] transition-all ${
              tab === t ? "bg-accent text-bg border-accent" : "bg-surface text-text-muted border-border"
            }`}>
            {t === "phone" ? "Phone" : "Email"}
          </button>
        ))}
      </div>

      <div className="w-full max-w-xs space-y-3">
        {tab === "phone" ? (
          !otpSent ? (
            <>
              <h2 className="text-[20px] font-display font-semibold tracking-[-0.02em] text-center">Enter your number</h2>
              <p className="text-xs text-text-muted text-center -mt-2">We'll text you a code to create your account.</p>
              <div className="flex items-center gap-1">
                <span className="text-sm text-text-muted px-3 py-3.5 bg-surface border-[0.5px] border-border rounded-[16px]">+91</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="99999 99999" maxLength={10}
                  onKeyDown={(e) => e.key === "Enter" && isValidPhone() && handleSendOtp()}
                  className="flex-1 h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all tracking-[2px] text-lg"
                  inputMode="numeric" type="tel" />
              </div>
              <button onClick={handleSendOtp} disabled={!isValidPhone() || loading}
                className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all">
                {loading ? "..." : "Send Code"}
              </button>
            </>
          ) : (
            <>
              <h2 className="text-[20px] font-display font-semibold tracking-[-0.02em] text-center">Enter code</h2>
              <p className="text-xs text-text-muted text-center -mt-2">Sent to +91 {phone.replace(/\d(?=\d{4})/g, "X")}</p>
              {debugOtp && (
                <div className="text-center bg-accent/10 border border-accent/30 rounded-xl p-3">
                  <p className="text-xs text-text-muted">Your code:</p>
                  <p className="text-2xl font-bold text-accent tracking-[0.3em]">{debugOtp}</p>
                </div>
              )}
              <div className="flex justify-center gap-2">
                {otp.map((d, i) => (
                  <input key={i} ref={(el) => { otpRefs.current[i] = el; }}
                    value={d} onChange={(e) => otpChange(i, e.target.value)} onKeyDown={(e) => otpKeyDown(i, e)}
                    maxLength={1} inputMode="numeric" autoFocus={i === 0}
                    className="w-11 h-14 rounded-[16px] bg-surface border-[0.5px] border-border text-text text-center text-xl font-semibold focus:outline-none focus:border-accent transition-all tabular-nums" />
                ))}
              </div>
              <button onClick={handleVerifyOtp} disabled={loading}
                className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all">
                {loading ? "..." : "Verify & Create Account"}
              </button>
              <p className="text-xs text-text-muted text-center">
                {cooldown > 0 ? (
                  <span className="text-text-muted/60">Resend in {cooldown}s</span>
                ) : (
                  <button onClick={handleSendOtp} className="text-accent hover:underline">Resend code</button>
                )}
              </p>
            </>
          )
        ) : (
          <>
            <div>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                onKeyDown={(e) => e.key === "Enter" && canSubmit && handleEmailSignup()}
                className={`w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all duration-400 ${
                  touched.email && !emailValid && email ? "border-danger" : "border-border"}`} />
              {touched.email && !emailValid && email && (
                <p className="text-[11px] text-danger mt-1.5 px-1">Enter a valid email address</p>)}
            </div>
            <div>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                onKeyDown={(e) => e.key === "Enter" && canSubmit && handleEmailSignup()}
                className={`w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all duration-400 ${
                  touched.password && password.length > 0 && password.length < 6 ? "border-danger" : "border-border"}`} />
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < passwordStrength ? strengthColors[passwordStrength] : "bg-border"}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-text-muted">{strengthLabel[passwordStrength]}</p>
                </div>
              )}
              {touched.password && password.length > 0 && password.length < 6 && (
                <p className="text-[11px] text-danger mt-1.5 px-1">At least 6 characters required</p>)}
            </div>
            <button onClick={handleEmailSignup} disabled={!canSubmit}
              className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all duration-400">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </>
        )}

        <p className="text-xs text-text-muted text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
        {error && <p className="text-xs text-danger text-center">{error}</p>}
      </div>
    </div>
  );
}
