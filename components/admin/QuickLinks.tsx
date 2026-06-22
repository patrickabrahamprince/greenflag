'use client';

import { useRouter } from 'next/navigation';
import { Users, Flag, Link2, BarChart3, ScrollText, Shield } from 'lucide-react';

const LINKS = [
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Queue', href: '/admin/queue', icon: Shield },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
  { label: 'Connections', href: '/admin/connections', icon: Link2 },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Audit Log', href: '/admin/audit', icon: ScrollText },
];

export function QuickLinks() {
  const router = useRouter();

  return (
    <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
      <h2 className="text-sm font-medium text-[#EDEADE] uppercase tracking-wide mb-4">Quick Links</h2>
      <div className="space-y-1">
        {LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#8E8E93] hover:text-[#EDEADE] hover:bg-white/[0.03] transition-all"
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
