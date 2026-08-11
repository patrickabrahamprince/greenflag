'use client';

import { useRouter } from 'next/navigation';
import { Eye, LayoutDashboard, Ban, Shield, ShieldOff, Check, UserX, Trash2, Loader2 } from 'lucide-react';
import type { AdminUser } from './types';

export interface UserManagementTableProps {
  users: AdminUser[];
  onSetAdmin: (userId: string, grant: boolean) => void;
  onBanClick: (user: AdminUser) => void;
  onApproveClick: (user: AdminUser) => void;
  onRejectClick: (user: AdminUser) => void;
  onDeleteClick: (user: AdminUser) => void;
  approvingId: string | null;
  settingAdminId: string | null;
}

// Consistent blue/pink persona color-coding, matching the Men/Women KPI
// cards on the dashboard, so admins can tell personas apart at a glance.
function personaColor(persona?: string) {
  if (persona === 'woman') return { ring: 'ring-pink-400/70', dot: 'bg-pink-400', text: 'text-pink-400', bg: 'bg-pink-400/10' };
  if (persona === 'man') return { ring: 'ring-blue-400/70', dot: 'bg-blue-400', text: 'text-blue-400', bg: 'bg-blue-400/10' };
  return { ring: 'ring-white/10', dot: 'bg-gray-500', text: 'text-gray-500', bg: 'bg-white/5' };
}

export function UserManagementTable({ users, onSetAdmin, onBanClick, onApproveClick, onRejectClick, onDeleteClick, approvingId, settingAdminId }: UserManagementTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table data-testid={process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ? 'users-table' : undefined} className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs uppercase border-b border-white/10">
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
                  <div className={`relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shrink-0 ring-2 ${personaColor(u.persona || u.gender).ring}`}>
                    {u.photos?.[0] ? (
                      <img src={u.photos[0]} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
                    ) : (
                      <span className="text-xs text-gray-500">{u.name?.[0]}</span>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-gray-300 ${personaColor(u.persona || u.gender).dot}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 font-medium text-xs truncate">{u.name}</p>
                    <p className="text-gray-500 text-[10px] truncate">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-2 hidden md:table-cell">
                <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${personaColor(u.persona || u.gender).bg} ${personaColor(u.persona || u.gender).text}`}>
                  {u.persona || u.gender || '-'}
                </span>
              </td>
              <td className="py-3 px-2 text-gray-500 text-xs hidden lg:table-cell">{u.city_auto || u.city || '-'}</td>
              <td className="py-3 px-2 text-gray-500 text-xs">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-2 text-gray-500 text-xs hidden md:table-cell">{u.connected_count ?? 0}</td>
              <td className="py-3 px-2 text-gray-500 text-xs hidden md:table-cell">{u.coins ?? 0}</td>
              <td className="py-3 px-2">
                {u.is_banned ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Paused</span>
                ) : u.approval_status === 'pending' ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">Pending</span>
                ) : u.approval_status === 'rejected' ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">Declined</span>
                ) : u.is_admin ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600">Admin</span>
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
                  {u.approval_status === 'pending' && (
                    <>
                      <button
                        onClick={() => onApproveClick(u)}
                        disabled={approvingId === u.id}
                        className="btn-ghost text-xs p-1.5 text-green-400 disabled:opacity-40"
                        title="Approve Application"
                      >
                        {approvingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => onRejectClick(u)}
                        className="btn-ghost text-xs p-1.5 text-red-400"
                        title="Decline Application"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                  {u.persona === 'woman' && (
                    <button
                      onClick={() => router.push(`/admin/host-dashboard/${u.id}`)}
                      className="btn-ghost text-xs p-1.5 text-blue-600"
                      title="Woman Dashboard"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!u.is_admin ? (
                    <button
                      onClick={() => {
                        if (window.confirm(`Grant admin access to ${u.name || u.id}?`)) {
                          onSetAdmin(u.id, true);
                        }
                      }}
                      disabled={settingAdminId === u.id}
                      className="btn-ghost text-xs p-1.5 text-blue-400 disabled:opacity-40"
                      title="Make Admin"
                    >
                      {settingAdminId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (window.confirm(`Revoke admin access from ${u.name || u.id}?`)) {
                          onSetAdmin(u.id, false);
                        }
                      }}
                      disabled={settingAdminId === u.id}
                      className="btn-ghost text-xs p-1.5 text-orange-400 disabled:opacity-40"
                      title="Revoke Admin"
                    >
                      {settingAdminId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {!u.is_banned && (
                    <button
                      onClick={() => onBanClick(u)}
                      className="btn-ghost text-xs p-1.5 text-red-400"
                      title="Pause Profile"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteClick(u)}
                    className="btn-ghost text-xs p-1.5 text-red-500"
                    title="Remove Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
