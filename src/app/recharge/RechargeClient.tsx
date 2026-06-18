"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { Coins, ShieldCheck, Zap, CreditCard } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function RechargeClient({ profile, packs }: { profile: any; packs: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const coins = searchParams.get("coins");
    if (success && coins) {
      toast("success", `Payment successful! ${coins} coins will reflect in app shortly.`);
      // Clean up URL
      router.replace("/recharge");
    }
  }, [searchParams, toast, router]);

  const handleBuy = async (pack: any) => {
    setLoadingId(pack.id);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: pack.id }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const { order_id, key_id, amount } = data;

      const RazorpayClient = (window as any).Razorpay;
      const rzp = new RazorpayClient({
        key: key_id,
        order_id,
        amount,
        currency: "INR",
        name: "Greenflag",
        description: `${pack.coins} Coins`,
        image: "https://greenflag.app/logo.png",
        prefill: { contact: profile?.phone || "" },
        theme: { color: "#16A34A" },
        handler: () => {
          router.push(`/recharge?success=1&coins=${pack.coins}`);
        },
      });
      
      rzp.on("payment.failed", function (response: any) {
        toast("error", response.error.description || "Payment failed");
      });
      
      rzp.open();
    } catch (e: any) {
      toast("error", e.message || "Failed to initialize payment");
    } finally {
      setLoadingId(null);
    }
  };

  const phoneLast4 = profile?.phone?.slice(-4) || "user";

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="max-w-xl mx-auto px-4 pt-12 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Hi, {phoneLast4}</h1>
            <p className="text-sm text-text-muted">Top up your balance</p>
          </div>
          <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-full border-[0.5px] border-border">
            <Coins className="w-5 h-5 text-accent" />
            <span className="font-bold">{profile?.coins_balance || 0}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packs.map((pack) => {
            const savingsPercent = Math.round((1 - pack.price_inr / pack.app_store_price_inr) * 100);
            
            return (
              <div key={pack.id} className="relative p-5 rounded-2xl bg-surface border-[0.5px] border-border shadow-lg flex flex-col justify-between hover:border-accent/50 transition-colors">
                {pack.label && (
                  <span className="absolute -top-3 right-4 bg-accent text-bg text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    {pack.label}
                  </span>
                )}
                
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-accent" />
                    <h3 className="text-2xl font-bold">{pack.coins} Coins</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-xl font-bold">₹{pack.price_inr / 100}</span>
                    <span className="text-xs text-[#16A34A] font-semibold mb-1">
                      Save {savingsPercent}% vs App Store
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(pack)}
                  disabled={loadingId === pack.id}
                  className="w-full py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white font-semibold transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loadingId === pack.id ? "Processing..." : "Buy Now"}
                </button>
              </div>
            );
          })}
        </div>

        <section className="bg-surface rounded-2xl p-6 border-[0.5px] border-border space-y-4">
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">100% Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Zap className="w-6 h-6 text-accent" />
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">Instant Credit</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <CreditCard className="w-6 h-6 text-accent" />
              <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider">UPI / Cards</span>
            </div>
          </div>
        </section>

        <footer className="text-center pb-8">
          <p className="text-[10px] text-text-muted">Official Greenflag coin top-up.<br/>Coins work in iOS & Android apps.</p>
        </footer>
      </div>
    </>
  );
}
