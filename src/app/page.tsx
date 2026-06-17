"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/discover");
      } else {
        router.replace("/login");
      }
    });
  }, [router]);

  return (
    <div className="min-h-dvh bg-bg flex items-center justify-center">
      <div className="w-20 h-20 rounded-[24px] bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center">
        <span className="text-5xl font-display font-bold text-accent tracking-[-0.02em]">G</span>
      </div>
    </div>
  );
}
