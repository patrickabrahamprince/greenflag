"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";

const FAQS = [
  { q: "How do intentions work?", a: "Each standard has 8 daily intentions. Complete them one by one. Messages unlock at day 5." },
  { q: "What happens when I complete all 8?", a: "The connection is marked complete. You and the host can continue messaging." },
  { q: "Can I pause my standard?", a: "Yes. Go to Your Standards > Edit to pause or archive your standard." },
  { q: "What is Streak Freeze?", a: "For ₹29, you can freeze your connection timer so it won't expire. Only one freeze per connection." },
];

export default function ConciergePage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Concierge</h1>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-text-muted">Frequently Asked</p>
          {FAQS.map((faq, i) => (
            <details key={i} className="group rounded-[16px] bg-surface border-[0.5px] border-border overflow-hidden">
              <summary className="px-4 py-3.5 text-sm cursor-pointer list-none flex items-center justify-between">
                {faq.q}
                <span className="text-text-muted transition-transform group-open:rotate-180">▾</span>
              </summary>
              <div className="px-4 pb-3.5 text-xs text-text-muted leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-sm text-text-muted">Send us a message</p>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?"
            className="w-full h-24 px-5 py-4 rounded-[24px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted resize-none focus:outline-none focus:border-accent transition-all" />
          <button onClick={() => { setSent(true); setMessage(""); }} disabled={!message.trim()}
            className="w-full h-12 rounded-[16px] bg-accent text-bg font-semibold text-sm disabled:opacity-30 transition-all flex items-center justify-center gap-2">
            <Send className="w-4 h-4" strokeWidth={1.5} /> Send
          </button>
          {sent && <p className="text-xs text-accent text-center">Message sent! We'll get back to you.</p>}
        </div>
      </div>
    </div>
  );
}
