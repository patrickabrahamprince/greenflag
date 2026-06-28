'use client';

import { useRouter } from 'next/navigation';
import { Eye, LayoutDashboard, Ban, Shield } from 'lucide-react';
import type { AdminUser } from './types';

export interface UserManagementTableProps {
  users: AdminUser[];
  onSetAdmin: (userId: string) => void;
  onBanClick: (user: AdminUser) => void;
}

export function UserManagementTable({ users, onSetAdmin, onBanClick }: UserManagementTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'users-table' : undefined} className="w-full text-sm">
        <thead>
          <tr className="text-[#8E8E93] text-xs uppercase border-b border-white/10">
            <th className="text-left py-3 px-2">Name</th>
            <th className="text-left py-3 px-2 hidden md:table-cell">Persona</th>
            <th className="text-left py-3 px-2 hidden lg:table-cell">City</th>
            <th className="text-left py-3 px-2">Joined</th>
            <th className="text-left py-3 px-2 hidden md:table-cell">Connections</th>
            <th className="text-left py-3 px-2 hidden md:table-cell">Coins</th>
            <th className="text-left py-3 px-2">Status</th>
            <th className="text-right py-3 px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
              onClick={() => router.push(`/admin/users/${u.id}`)}
            >
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {u.photos?.[0] ? (
                      <img src={u.photos[0]} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
                    ) : (
                      <span className="text-xs text-[#8E8E93]">{u.name?.[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#EDEADE] font-medium text-xs truncate">{u.name}</p>
                    <p className="text-[#8E8E93] text-[10px] truncate">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-2 text-[#8E8E93] text-xs capitalize hidden md:table-cell">{u.persona || u.gender}</td>
              <td className="py-3 px-2 text-[#8E8E93] text-xs hidden lg:table-cell">{u.city_auto || u.city || '-'}</td>
              <td className="py-3 px-2 text-[#8E8E93] text-xs">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-2 text-[#8E8E93] text-xs hidden md:table-cell">{u.connected_count ?? 0}</td>
              <td className="py-3 px-2 text-[#8E8E93] text-xs hidden md:table-cell">{u.coins ?? 0}</td>
              <td className="py-3 px-2">
                {u.is_banned ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Banned</span>
                ) : u.is_admin ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#C9A961]/10 text-[#C9A961]">Admin</span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">Active</span>
                )}
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => router.push(`/admin/users/${u.id}`)}
                    className="btn-ghost text-xs p-1.5"
                    title="View Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  {u.persona === 'woman' && (
                    <button
                      onClick={() => router.push(`/admin/host-dashboard/${u.id}`)}
                      className="btn-ghost text-xs p-1.5 text-[#C9A961]"
                      title="Woman Dashboard"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!u.is_admin && (
                    <button
                      onClick={() => onSetAdmin(u.id)}
                      className="btn-ghost text-xs p-1.5 text-blue-400"
                      title="Make Admin"
                    >
                      <Shield className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!u.is_banned && (
                    <button
                      onClick={() => onBanClick(u)}
                      className="btn-ghost text-xs p-1.5 text-red-400"
                      title="Ban User"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
