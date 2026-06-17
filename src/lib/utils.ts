export function getDifficultyLabel(d: string): string {
  const map: Record<string, string> = { easy: "Easy", medium: "Moderate", hard: "Demanding" };
  return map[d] || d;
}

export function getTaskStatusColor(s: string): string {
  const map: Record<string, string> = {
    locked: "opacity-20",
    pending: "text-text-muted",
    submitted: "text-accent",
    approved: "text-accent",
    rejected: "text-danger",
  };
  return map[s] || "text-text-muted";
}

export function getConnectionStatusColor(s: string): string {
  const map: Record<string, string> = {
    pending: "text-text-muted",
    active: "text-accent",
    completed: "text-green-400",
    failed: "text-danger",
    withdrawn: "text-text-muted/50",
  };
  return map[s] || "text-text-muted";
}

export function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function daysLeft(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export async function expireOverdueConnections() {
  const { createBrowserClient } = await import("@supabase/ssr");
  const supabase = (await import("@/lib/supabase")).supabase;
  const { data: overdue } = await supabase
    .from("connections")
    .select("id")
    .lt("expires_at", new Date().toISOString())
    .eq("status", "active");

  if (overdue && overdue.length > 0) {
    const ids = overdue.map((c) => c.id);
    await supabase.from("connections").update({ status: "failed" }).in("id", ids);
  }
  return overdue?.length || 0;
}
