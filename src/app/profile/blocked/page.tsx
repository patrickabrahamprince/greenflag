"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, ShieldOff, UserX } from "lucide-react";
import EmptyState from "@/components/EmptyState";

interface Block {
  id: string;
  blocked_id: string;
  created_at: string;
}

export default function BlockedPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login");
      supabase.from("blocks").select("*").eq("blocker_id", user.id).order("created_at", { ascending: false })
        .then(({ data }) => {
          setBlocks(data || []);
          setLoading(false);
        });
    });
  }, [router]);

  async function unblock(blockedId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("blocks").delete().eq("blocker_id", user?.id).eq("blocked_id", blockedId);
    setBlocks((prev) => prev.filter((b) => b.blocked_id !== blockedId));
  }

  if (loading) {
    return <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="w-10 h-10 rounded-full bg-surface-elevated animate-pulse" />
      </div>
    </div>;
  }

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Blocked users</h1>
        </div>

        {blocks.length === 0 ? (
          <EmptyState icon={ShieldOff} title="No blocked users" description="Blocked profiles will appear here." />
        ) : (
          <div className="space-y-2">
            {blocks.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3.5 rounded-[16px] bg-surface border-[0.5px] border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
                    <UserX className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm text-text-muted">Blocked user</span>
                </div>
                <button onClick={() => unblock(b.blocked_id)}
                  className="text-xs text-accent hover:underline">Unblock</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
