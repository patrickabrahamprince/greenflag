"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function OnboardingGate() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/login"); return; }
      supabase.from("profiles").select("name").eq("id", user.id).maybeSingle().then(({ data }) => {
        if (data && (data.name === "User" || !data.name)) {
          router.replace("/onboard");
        }
      });
    });
  }, [router]);

  return null;
}
