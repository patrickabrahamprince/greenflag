"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OnboardingGate() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      try {
        const { data } = await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle();
        if (data && (data.name === "User" || !data.name)) {
          router.replace("/onboard");
        }
      } catch (err) {
        console.error(err);
      }
    }).catch(error => {
      console.error("Failed to get user:", error);
      router.replace("/login");
    });
  }, [router]);

  return null;
}
