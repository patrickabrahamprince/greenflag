"use client";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, FileCheck, Flag, ClipboardList, MessageSquare,
  LogOut, ChevronRight, Menu, X, Shield, Image as ImageIcon, BarChart3, ScrollText,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/queue", label: "Queue", icon: ImageIcon },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/connections", label: "Connections", icon: MessageSquare },
  { href: "/admin/tests", label: "Tests", icon: ClipboardList },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return router.push("/login");
      setAdminName(user.email || user.phone || "Admin");
      setReady(true);
    });
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-[2px] border-accent/30 border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg flex">
      <aside className="hidden lg:flex flex-col w-64 bg-surface border-r-[0.5px] border-border p-4 fixed h-dvh z-30">
        <div className="flex items-center gap-3 px-3 py-5 mb-4">
          <div className="w-10 h-10 rounded-[12px] bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-[15px] font-display font-bold tracking-[-0.02em]">Greenflag</h1>
            <p className="text-[10px] text-text-muted">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <button key={item.href} onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm transition-all ${
                  active ? "bg-accent/10 text-accent font-medium" : "text-text-muted hover:text-text hover:bg-surface-elevated"
                }`}>
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                {item.label}
                {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" strokeWidth={1.5} />}
              </button>
            );
          })}
        </nav>
        <div className="border-t-[0.5px] border-border pt-3 mt-3">
          <div className="px-3 py-2 text-xs text-text-muted truncate">{adminName}</div>
          <button onClick={() => { supabase.auth.signOut(); router.push("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm text-text-muted hover:text-text hover:bg-surface-elevated transition-all">
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b-[0.5px] border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </div>
          <span className="text-[15px] font-display font-bold tracking-[-0.02em]">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { supabase.auth.signOut(); router.push("/login"); }}
            className="w-9 h-9 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center hover:bg-red-500/10 hover:border-red-500/20 transition-all">
            <LogOut className="w-4 h-4 text-text-muted" strokeWidth={1.5} />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-9 h-9 rounded-full bg-surface-elevated border-[0.5px] border-border flex items-center justify-center">
            {sidebarOpen ? <X className="w-4 h-4 text-text-muted" /> : <Menu className="w-4 h-4 text-text-muted" />}
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-bg/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`lg:hidden fixed top-0 left-0 h-dvh w-72 bg-surface border-r-[0.5px] border-border z-50 transform transition-all duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex items-center gap-3 px-5 py-5 border-b-[0.5px] border-border">
          <div className="w-9 h-9 rounded-[10px] bg-accent/10 border-[0.5px] border-accent/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-accent" strokeWidth={1.5} />
          </div>
          <span className="text-[15px] font-display font-bold tracking-[-0.02em]">Admin</span>
        </div>
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <button key={item.href} onClick={() => { router.push(item.href); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm transition-all ${
                  active ? "bg-accent/10 text-accent font-medium" : "text-text-muted hover:text-text"
                }`}>
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-dvh">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
