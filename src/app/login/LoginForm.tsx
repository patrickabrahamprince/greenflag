"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("magic");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") setConfirmed(true);
  }, [searchParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  function isValidPhone() {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10;
  }

  function formatPhone() {
    const digits = phone.replace(/\D/g, "");
    return digits.slice(0, 10);
  }

  async function handleSendOtp() {
    setError("");
    const fullPhone = "+91" + formatPhone();
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setOtpSent(true);
    setCooldown(30);
    toast("success", "Code sent!");
  }

  async function handleVerifyOtp() {
    setError("");
    setLoading(true);
    const token = otp.join("");
    if (token.length !== 6) { setError("Enter the full 6-digit code"); setLoading(false); return; }
    const fullPhone = "+91" + formatPhone();
    const { error: err } = await supabase.auth.verifyOtp({ phone: fullPhone, token, type: "sms" });
    setLoading(false);
    if (err) { setError("Invalid code. Try again."); return; }
    router.push("/discover");
  }

  async function handlePassword() {
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) setError(err.message);
    else router.push("/discover");
  }

  async function handleMagicLink() {
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }

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

  if (sent) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-[20px] bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center mx-auto">
            <span className="text-3xl font-display text-accent font-bold">G</span>
          </div>
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Check your email</h1>
          <p className="text-sm text-text-muted">We sent a magic link to {email}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center px-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-[20px] bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl font-display text-accent font-bold">G</span>
        </div>
        <h1 className="text-[28px] font-display font-bold tracking-[-0.02em]">Greenflag</h1>
        <p className="text-sm text-text-muted">Meet people who show up.</p>
        <p className="text-xs text-text-muted/60 mt-1">Actions over algorithms.</p>
      </div>

      {confirmed && (
        <div className="w-full max-w-xs px-4 py-3 rounded-[16px] bg-accent/10 border-[0.5px] border-accent/20 text-xs text-accent text-center animate-fade-in">
          Account created! Sign in to continue.
        </div>
      )}

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
              <p className="text-xs text-text-muted text-center -mt-2">We'll text you a code to confirm it's you.</p>
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
              <p className="text-xs text-text-muted text-center -mt-2">Sent to +91 {"XXXXX ".repeat(2).trim()}</p>
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
                {loading ? "..." : "Verify"}
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
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (mode === "password" ? handlePassword() : handleMagicLink())}
              className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
            {mode === "password" && (
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePassword()}
                className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
            )}
            {mode === "password" && (
              <Link href="/forgot-password" className="block text-xs text-text-muted text-right -mt-2 hover:text-accent">
                Forgot password?
              </Link>
            )}
            <button onClick={mode === "password" ? handlePassword : handleMagicLink}
              disabled={!email.includes("@") || loading}
              className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all">
              {loading ? "..." : mode === "password" ? "Sign In" : "Send Magic Link"}
            </button>
            <p onClick={() => setMode(mode === "password" ? "magic" : "password")}
              className="text-xs text-text-muted text-center cursor-pointer hover:text-accent">
              {mode === "password" ? "Use magic link instead" : "Use password instead"}
            </p>
          </>
        )}

        <p className="text-xs text-text-muted text-center">
          No account?{" "}
          <Link href="/signup" className="text-accent hover:underline">Sign up</Link>
        </p>
        {error && <p className="text-xs text-danger text-center">{error}</p>}
      </div>
    </div>
  );
}
