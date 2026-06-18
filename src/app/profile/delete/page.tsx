"use client";
import { useEffect, useState } from "react";
import { Skeleton } from '@/components/Skeleton';
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/Toast";

export default function DeleteAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <Skeleton />;

  async function handleDelete() {
    if (confirm !== "DELETE") { toast("error", "Type DELETE to confirm."); return; }
    setDeleting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.from("tests").delete().eq("host_id", user.id);
    await supabase.from("connections").delete().or(`guest_id.eq.${user.id},host_id.eq.${user.id}`);
    await supabase.auth.admin.deleteUser(user.id);
    toast("success", "Account deleted.");
    router.push("/login");
  }

  return (
    <div className="min-h-dvh bg-bg px-4 pt-6 pb-24">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-text-muted" strokeWidth={1.5} />
          </button>
          <h1 className="text-[22px] font-display font-semibold tracking-[-0.02em]">Delete account</h1>
        </div>

        <div className="rounded-[16px] bg-danger/10 border-[0.5px] border-danger/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm text-text font-semibold mb-1">This action is irreversible</p>
              <p className="text-xs text-text-muted leading-relaxed">
                All your profile data, standards, connections, and submissions will be permanently deleted.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-text-muted font-medium">Type "DELETE" to confirm</label>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE"
            className="w-full h-12 px-4 rounded-[16px] bg-surface border-[0.5px] border-border text-text placeholder-text-muted text-sm focus:outline-none focus:border-danger transition-all" />
        </div>

        <button onClick={handleDelete} disabled={deleting || confirm !== "DELETE"}
          className="w-full h-14 rounded-[16px] bg-danger text-text font-semibold text-[15px] disabled:opacity-40 transition-all">
          {deleting ? "Deleting..." : "Delete my account"}
        </button>
      </div>
    </div>
  );
}
