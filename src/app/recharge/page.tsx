import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import RechargeClient from "./RechargeClient";

export default async function RechargePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("coins_balance, phone")
    .eq("id", user.id)
    .single();

  const { data: packs } = await supabase
    .from("coin_packs")
    .select("*")
    .eq("active", true)
    .order("sort_order");

  return (
    <main className="min-h-dvh bg-bg pb-10">
      <RechargeClient profile={profile} packs={packs || []} />
    </main>
  );
}
