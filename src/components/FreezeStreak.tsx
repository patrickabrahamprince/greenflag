"use client";
import { useState, useEffect } from "react";
import { Snowflake } from "lucide-react";

declare global {
  interface Window { Razorpay?: any; }
}

interface FreezeStreakProps {
  connectionId: string;
}

export default function FreezeStreak({ connectionId }: FreezeStreakProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    if (window.Razorpay) { setRazorpayReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);
  }, []);

  async function handleFreeze() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/streak-freeze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connectionId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      if (razorpayReady && window.Razorpay) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_default",
          amount: data.order.amount,
          currency: data.order.currency || "INR",
          name: "Greenflag",
          description: "Streak Freeze",
          order_id: data.order.id,
          handler: async function (response: any) {
            await fetch("/api/payments/webhook", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                status: "paid",
                connection_id: connectionId,
              }),
            });
            setDone(true);
          },
          modal: { ondismiss: () => setLoading(false) },
          prefill: { contact: "", email: "" },
          theme: { color: "#D4AF37" },
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function () { setError("Payment failed"); setLoading(false); });
        rzp.open();
      } else {
        await fetch("/api/payments/webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: data.order.id,
            razorpay_payment_id: "pay_mock_" + Date.now(),
            status: "paid",
            connection_id: connectionId,
          }),
        });
        setDone(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="px-4 py-3 rounded-[16px] bg-accent/10 border-[0.5px] border-accent/20 text-xs text-accent text-center animate-fade-in">
        Streak frozen! Your connection won't expire on time.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button onClick={handleFreeze} disabled={loading}
        className="w-full h-12 rounded-[16px] bg-surface-elevated border-[0.5px] border-border text-text-muted text-sm font-medium flex items-center justify-center gap-2 hover:border-accent/40 transition-all disabled:opacity-30">
        {loading ? (
          <div className="w-4 h-4 rounded-full border-[1.5px] border-text-muted/30 border-t-text-muted animate-spin" />
        ) : (
          <Snowflake className="w-4 h-4" strokeWidth={1.5} />
        )}
        {loading ? "Processing..." : "Freeze Streak (₹29)"}
      </button>
      {error && <p className="text-xs text-danger text-center">{error}</p>}
    </div>
  );
}
