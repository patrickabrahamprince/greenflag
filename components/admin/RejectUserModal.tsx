'use client';

import { UserX, X } from 'lucide-react';
import type { AdminUser } from './types';

export interface RejectUserModalProps {
  user: AdminUser;
  reason: string;
  rejecting: boolean;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function RejectUserModal({
  user,
  reason,
  rejecting,
  onReasonChange,
  onConfirm,
  onClose,
}: RejectUserModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-lg font-display text-[#EDEADE]">Decline Application</h3>
          </div>
          <button onClick={onClose} className="btn-ghost p-1">
            <X className="w-5 h-5 text-[#8E8E93]" />
          </button>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-400 font-medium mb-1">You are declining:</p>
          <p className="text-[#EDEADE] font-medium">{user.name} ({user.email})</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-[#8E8E93] mb-2">Reason for decline *</label>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="e.g. Incomplete profile, doesn't meet community guidelines..."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!reason.trim() || rejecting}
            className="btn-danger flex-1 text-sm"
          >
            {rejecting ? 'Declining...' : 'Decline Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
