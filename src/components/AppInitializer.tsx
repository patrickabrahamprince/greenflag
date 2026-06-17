"use client";
import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const fetchUser = useAppStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <>{children}</>;
}
