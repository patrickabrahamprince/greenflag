import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Coins, ArrowLeft, ExternalLink, ShieldCheck, Zap } from "lucide-react";

export const revalidate = 0;

export default async function StorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("coins_balance")
    .eq("id", user.id)
    .single();

  const { data: packs } = await supabase
    .from("coin_packs")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  return (
    <div className="min-h-dvh bg-bg text-text p-6 pb-24 font-sans animate-fade-in">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/discover"
            className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center cursor-pointer hover:bg-surface-elevated/80 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </Link>
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Coin Store</h1>
        </div>

        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-accent/20 to-bg border border-accent/30 p-6 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-accent uppercase tracking-wider font-semibold">Your Balance</p>
            <p className="text-3xl font-display font-bold text-text">
              {profile?.coins_balance ?? 0}
            </p>
          </div>
          <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Coins className="w-8 h-8 text-accent animate-pulse" />
          </div>
        </div>

        {/* Promotion Banner */}
        <a
          href="https://recharge.greenflag.app"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 p-4 border border-green-400/30 text-white font-medium text-sm flex items-center justify-between shadow-lg active:scale-98 transition-all"
        >
          <div className="space-y-0.5">
            <p className="font-bold text-sm">Buy on web to save 20%</p>
            <p className="text-xs text-white/85">Skip app store fees instantly</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl text-xs font-bold uppercase">
            <span>recharge.greenflag.app</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </a>

        {/* Coin Packs list */}
        <div className="space-y-3">
          <p className="text-xs text-text-muted uppercase tracking-wider font-semibold px-1">Available Packs</p>
          {packs && packs.length > 0 ? (
            <div className="space-y-3">
              {packs.map((pack) => {
                const savingsPercent = pack.app_store_price_inr
                  ? Math.round((1 - pack.price_inr / pack.app_store_price_inr) * 100)
                  : 20;

                return (
                  <div
                    key={pack.id}
                    className="relative overflow-hidden rounded-[20px] bg-surface border-[0.5px] border-border p-5 flex items-center justify-between hover:border-accent/40 transition-colors shadow-md"
                  >
                    {pack.label && (
                      <span className="absolute top-0 right-0 bg-accent text-bg text-[9px] font-bold px-2.5 py-0.5 rounded-bl-[12px] uppercase tracking-wider">
                        {pack.label}
                      </span>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-5 h-5 text-accent" />
                        <h3 className="text-lg font-bold">{pack.coins} Coins</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-muted">₹{pack.price_inr / 100}</span>
                        <span className="text-[10px] text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded-full font-bold">
                          Save {savingsPercent}% on Web
                        </span>
                      </div>
                    </div>

                    <a
                      href="https://recharge.greenflag.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-4 rounded-xl bg-accent text-bg hover:brightness-110 font-bold text-xs flex items-center justify-center transition-all"
                    >
                      Buy on Web
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 rounded-[20px] bg-surface border border-border">
              <p className="text-xs text-text-muted">No coin packs active. Recharge directly on web.</p>
            </div>
          )}
        </div>

        {/* Security / Instant Credit Features */}
        <section className="bg-surface rounded-[24px] p-5 border-[0.5px] border-border flex items-center justify-around text-center">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center border border-accent/10">
              <ShieldCheck className="w-5 h-5 text-accent" />
            </div>
            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">100% Secure</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center border border-accent/10">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">Instant Top-Up</span>
          </div>
        </section>

        <footer className="text-center text-[10px] text-text-muted">
          Official Greenflag Coin Store.<br />
          Purchased coins instantly sync to your iOS and Android apps.
        </footer>
      </div>
    </div>
  );
}
