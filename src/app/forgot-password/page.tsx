"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center px-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 rounded-[20px] bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="text-[22px] font-display font-semibold">Check your email</h1>
          <p className="text-sm text-text-muted">We sent a password reset link to {email}.</p>
          <Link href="/login" className="block text-xs text-accent hover:underline mt-4">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center px-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-[28px] font-display font-bold tracking-[-0.02em]">Reset password</h1>
        <p className="text-sm text-text-muted">Enter your email and we'll send a reset link.</p>
      </div>
      <div className="w-full max-w-xs space-y-3">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleReset()}
          className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all" />
        <button onClick={handleReset} disabled={!email.includes("@") || loading}
          className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all">
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
        <Link href="/login" className="block text-xs text-text-muted text-center hover:text-accent">
          Back to login
        </Link>
        {error && <p className="text-xs text-danger text-center">{error}</p>}
      </div>
    </div>
  );
}
