"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleMagicLink() {
    setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
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

      <div className="w-full max-w-xs space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
          className="w-full h-14 px-5 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted focus:outline-none focus:border-accent transition-all duration-400"
        />
        <button
          onClick={handleMagicLink}
          disabled={!email.includes("@")}
          className="w-full h-14 rounded-[16px] bg-accent text-bg font-semibold text-[15px] disabled:opacity-30 transition-all duration-400"
        >
          Send Magic Link
        </button>
        {error && <p className="text-xs text-danger text-center">{error}</p>}
      </div>
    </div>
  );
}
