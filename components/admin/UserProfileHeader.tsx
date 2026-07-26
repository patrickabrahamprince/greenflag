'use client';

import type { AdminUser } from './types';

export interface UserProfileHeaderProps {
  user: AdminUser;
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
        {user.photos?.[0] ? (
          <img src={user.photos[0]} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = '/placeholder-avatar.svg'; }} />
        ) : (
          <span className="text-2xl text-[#8E8E93]">{user.name?.[0]}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-display text-[#EDEADE] truncate">{user.name}</h1>
          {user.is_banned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 shrink-0">Banned</span>}
          {user.is_admin && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A961]/10 text-[#C9A961] shrink-0">Admin</span>}
          {user.approval_status === 'pending' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 shrink-0">Pending Review</span>}
          {user.approval_status === 'rejected' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 shrink-0">Rejected</span>}
        </div>
        <p className="text-xs text-[#8E8E93]">{user.email}</p>
        <p className="text-xs text-[#5A5A5D] mt-1">ID: {user.id.slice(0, 12)}...</p>
      </div>
    </div>
  );
}
