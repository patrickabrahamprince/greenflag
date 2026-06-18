"use client";
import { usePathname, useRouter } from "next/navigation";
import { Compass, GitBranch, User, LayoutDashboard, MessageSquare } from "lucide-react";
import { useAppStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/connections", icon: GitBranch, label: "Connections" },
  { href: "/messages", icon: MessageSquare, label: "Messages" },
  { href: "/your-standards", icon: LayoutDashboard, label: "Standards" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((s) => s.user);

  const hiddenRoutes = ["/login", "/signup", "/onboard", "/recharge"];
  if (!user || hiddenRoutes.some((r) => pathname.startsWith(r))) return null;
  if (pathname === "/") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t-[0.5px] border-border pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-all duration-300 ${
                active ? "opacity-100" : "opacity-40 hover:opacity-70"
              }`}
            >
              <item.icon className="w-5 h-5" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
